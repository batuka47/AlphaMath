import { useState, useRef, useCallback } from 'react'
import { useTaskRefresh } from '@/lib/TaskContext'
import * as pdfjsLib from 'pdfjs-dist'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import {
    Upload, FileText, CheckCircle, Loader2, AlertCircle, PlusCircle, Trash2, PenLine, Code,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import {
    parseQuestions, parseAnswerKey,
    getScoringConfig, calcStats,
} from '@/lib/parseEysh'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).href

const SAMPLE_LATEX = `\\section*{1.}
$x^{2} - 5x + 6 = 0$ тэгшитгэлийн шийдүүдийн нийлбэр хэд вэ?
\\begin{enumerate}
\\item $-5$
\\item $5$
\\item $6$
\\item $-6$
\\item $1$
\\end{enumerate}

\\section*{2.}
$\\frac{1}{2} + \\frac{1}{3}$ утгыг ол.
\\begin{enumerate}
\\item $\\frac{1}{6}$
\\item $\\frac{5}{6}$
\\item $\\frac{2}{5}$
\\item $\\frac{3}{5}$
\\item $1$
\\end{enumerate}

\\section*{3.}
$\\sqrt{144}$ утга хэд вэ?
\\begin{enumerate}
\\item $10$
\\item $11$
\\item $12$
\\item $13$
\\item $14$
\\end{enumerate}`

const CURRENT_YEAR = new Date().getFullYear()
const YEARS        = Array.from({ length: CURRENT_YEAR - 2006 + 1 }, (_, i) => String(2006 + i))
const VARIANTS     = ['A', 'B', 'C', 'D']

// ── PDF text extraction ───────────────────────────────────────────────────────

async function extractPdfText(file) {
    const doc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
    let text = ''
    for (let p = 1; p <= doc.numPages; p++) {
        const content = await (await doc.getPage(p)).getTextContent()
        text += content.items.map(i => i.str).join(' ') + '\n'
    }
    return text.trim()
}

// ── LaTeX preview renderer ────────────────────────────────────────────────────

function renderLatexToHtml(src) {
    let html = src
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => {
        try { return katex.renderToString(m.trim(), { displayMode: true, throwOnError: false }) }
        catch { return `<span class="text-red-400">$$${m}$$</span>` }
    })
    html = html.replace(/\$([^\n$]+?)\$/g, (_, m) => {
        try { return katex.renderToString(m.trim(), { displayMode: false, throwOnError: false }) }
        catch { return `<span class="text-red-400">$${m}$</span>` }
    })
    html = html.replace(/\\section\*\{([^}]*)\}/g, '<h3 class="text-base font-bold mt-4 mb-1 text-[#2760A6]">$1</h3>')
    html = html.replace(/\\begin\{enumerate\}/g, '<ol class="list-decimal list-inside space-y-1 pl-2">')
    html = html.replace(/\\end\{enumerate\}/g,   '</ol>')
    html = html.replace(/\\begin\{itemize\}/g,   '<ul class="list-disc list-inside space-y-1 pl-2">')
    html = html.replace(/\\end\{itemize\}/g,     '</ul>')
    html = html.replace(/\\item\s*/g,            '<li class="text-sm">')
    html = html.replace(/\n{2,}/g, '<br/><br/>')
    html = html.replace(/\n/g, '<br/>')
    return html
}

// ── Drop zone ─────────────────────────────────────────────────────────────────

function DropZone({ onFile, file, disabled }) {
    const [dragging, setDragging] = useState(false)
    const ref = useRef(null)
    const pick = useCallback(f => { if (f) onFile(f) }, [onFile])

    return (
        <div
            onDragOver={e  => { e.preventDefault(); !disabled && setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e  => { e.preventDefault(); setDragging(false); !disabled && pick(e.dataTransfer.files[0]) }}
            onClick={() => !disabled && ref.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 transition-colors select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
                dragging ? 'border-blue-400 bg-blue-50'
                : file   ? 'border-green-300 bg-green-50'
                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
        >
            {file ? (
                <>
                    <FileText size={36} className="text-green-500" />
                    <div className="text-center">
                        <p className="font-semibold text-gray-900">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
                    </div>
                </>
            ) : (
                <>
                    <Upload size={36} className="text-gray-400" />
                    <div className="text-center">
                        <p className="font-semibold text-gray-700 text-lg">Click to upload PDF</p>
                        <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
                    </div>
                </>
            )}
            <input ref={ref} type="file" accept=".pdf" className="hidden"
                onChange={e => pick(e.target.files[0])} />
        </div>
    )
}

// ── LaTeX live-preview field ──────────────────────────────────────────────────

function renderMath(text) {
    if (!text) return null
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g)
    return parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
            const html = katex.renderToString(part.slice(2, -2), { throwOnError: false, displayMode: true })
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        }
        if (part.startsWith('$') && part.endsWith('$')) {
            const html = katex.renderToString(part.slice(1, -1), { throwOnError: false, displayMode: false })
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        }
        return part
    })
}

function LaTeXField({ value, onChange, placeholder, rows = 2, disabled, mono = false }) {
    const hasLatex = value && value.includes('$')
    return (
        <div className="flex flex-col gap-1">
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                spellCheck={false}
                className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#E75234] disabled:opacity-50 ${mono ? 'font-mono' : ''}`}
            />
            {hasLatex && (
                <div className="px-3 py-2 bg-[#F5DAC6]/30 border border-[#E75234]/20 rounded-lg text-sm leading-relaxed text-gray-800">
                    {renderMath(value)}
                </div>
            )}
        </div>
    )
}

function LaTeXInput({ value, onChange, placeholder, disabled }) {
    const hasLatex = value && value.includes('$')
    return (
        <div className="flex flex-col gap-0.5">
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                spellCheck={false}
                className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#E75234] disabled:opacity-50"
            />
            {hasLatex && (
                <div className="px-2 py-1 bg-[#F5DAC6]/30 border border-[#E75234]/20 rounded-md text-sm text-gray-800">
                    {renderMath(value)}
                </div>
            )}
        </div>
    )
}

// ── Manual question helpers ───────────────────────────────────────────────────

function emptyQuestion(num) {
    return { id: String(num), text: '', labelA: '', labelB: '', labelC: '', labelD: '', labelE: '', answer: '' }
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminImport() {
    const refreshTasks = useTaskRefresh()

    // shared
    const [mode,    setMode]    = useState('pdf') // 'pdf' | 'manual'
    const [year,    setYear]    = useState(String(CURRENT_YEAR))
    const [variant, setVariant] = useState('A')
    const [savedStats, setSavedStats] = useState(null)

    // pdf flow
    const [file,      setFile]      = useState(null)
    const [stage,     setStage]     = useState('idle')
    const [statusMsg, setStatusMsg] = useState('')
    const [latex,     setLatex]     = useState('')
    const [tab,       setTab]       = useState('edit')
    const [error,     setError]     = useState('')

    // latex paste flow
    const [pastedLatex, setPastedLatex] = useState('')

    // manual flow
    const [manualQuestions, setManualQuestions] = useState([emptyQuestion(1)])
    const [manualSaving,    setManualSaving]    = useState(false)
    const [manualError,     setManualError]     = useState('')

    function addQuestion() {
        setManualQuestions(prev => [...prev, emptyQuestion(prev.length + 1)])
    }

    function removeQuestion(idx) {
        setManualQuestions(prev => {
            const next = prev.filter((_, i) => i !== idx)
            return next.map((q, i) => ({ ...q, id: String(i + 1) }))
        })
    }

    function updateQuestion(idx, field, value) {
        setManualQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q))
    }

    async function handleManualSave() {
        setManualSaving(true)
        setManualError('')
        try {
            const questions = manualQuestions.filter(q => q.text.trim())
            if (questions.length === 0) throw new Error('Add at least one question with text.')

            const { error: dbErr } = await supabase
                .from('exams')
                .upsert({
                    year:           parseInt(year),
                    variant,
                    scoring:        getScoringConfig(year, questions.length),
                    problem:        questions,
                    second_problem: [],
                }, { onConflict: 'year,variant' })

            if (dbErr) throw new Error(dbErr.message)

            setSavedStats(calcStats(questions))
            refreshTasks()
            setStage('saved')
        } catch (err) {
            setManualError(err.message)
        } finally {
            setManualSaving(false)
        }
    }

    function reset() {
        setFile(null); setYear(String(CURRENT_YEAR)); setVariant('A')
        setStage('idle'); setStatusMsg(''); setLatex(''); setTab('edit')
        setError(''); setSavedStats(null)
        setPastedLatex('')
        setManualQuestions([emptyQuestion(1)]); setManualError('')
    }

    // ── Step 1: process PDF ───────────────────────────────────────────────────

    async function handleProcess() {
        if (!file) return
        setStage('processing')
        setError('')
        try {
            setStatusMsg('Extracting text from PDF…')
            const text = await extractPdfText(file)
            if (!text) throw new Error('No text found in PDF.')

            setStatusMsg('Converting to LaTeX via Gemini…')
            const res  = await fetch('/api/pdf-to-latex', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ text }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Conversion failed.')

            setLatex(data.latex)
            setStage('reviewing')
        } catch (err) {
            setError(err.message)
            setStage('error')
        }
    }

    // ── Step 2: save reviewed LaTeX ───────────────────────────────────────────

    async function handleSave() {
        setStage('saving')
        setError('')
        try {
            const questions = parseQuestions(latex)
            if (questions.length === 0) throw new Error('No questions found. Edit the content and try again.')

            const answerKey = parseAnswerKey(latex)
            questions.forEach(q => { q.answer = answerKey[q.id] || '' })

            const { error: dbErr } = await supabase
                .from('exams')
                .upsert({
                    year:           parseInt(year),
                    variant,
                    scoring:        getScoringConfig(year, questions.length),
                    problem:        questions,
                    second_problem: [],
                }, { onConflict: 'year,variant' })

            if (dbErr) throw new Error(dbErr.message)

            setSavedStats(calcStats(questions))
            refreshTasks()
            setStage('saved')
        } catch (err) {
            setError(err.message)
            setStage('reviewing') // go back so user can edit
        }
    }

    // ── Saved ─────────────────────────────────────────────────────────────────

    if (stage === 'saved') {
        return (
            <div className="px-8 py-8 max-w-xl">
                <div className="flex flex-col items-center text-center gap-5 py-10">
                    <CheckCircle size={56} className="text-green-500" />
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Exam Added!</h1>
                        <p className="text-muted-foreground mt-1">{year} он — {variant} хувилбар is now live.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">{savedStats.total} questions</Badge>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">{savedStats.hasAnswers} answers</Badge>
                        {savedStats.missingAnswers > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 px-3 py-1">{savedStats.missingAnswers} missing answers</Badge>
                        )}
                    </div>
                    <Button onClick={reset} className="bg-[#E75234] hover:bg-[#c94220] text-white">
                        Add Another Exam
                    </Button>
                </div>
            </div>
        )
    }

    // ── Review stage ──────────────────────────────────────────────────────────

    if (stage === 'reviewing' || stage === 'saving') {
        const isSaving = stage === 'saving'
        return (
            <div className="px-8 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Review Before Saving</h1>
                        <p className="text-sm text-muted-foreground mt-1">{year} он — {variant} хувилбар · Edit if needed, then save.</p>
                    </div>
                    <Button variant="outline" onClick={() => setStage('idle')} disabled={isSaving} className="text-sm">
                        ← Back
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* tab bar */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-semibold">
                        {['edit', 'preview'].map(t => (
                            <button key={t} onClick={() => setTab(t)} disabled={isSaving}
                                className={`px-4 py-1.5 transition-colors ${tab === t ? 'bg-[#E75234] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                {t === 'edit' ? 'Edit LaTeX' : 'Preview'}
                            </button>
                        ))}
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}
                        className="bg-[#E75234] hover:bg-[#c94220] text-white px-6">
                        {isSaving
                            ? <><Loader2 size={15} className="animate-spin mr-2" />Saving…</>
                            : 'Save to Site'}
                    </Button>
                </div>

                {tab === 'edit' && (
                    <textarea
                        className="w-full h-[65vh] font-mono text-xs bg-gray-950 text-green-300 rounded-2xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-[#E75234]"
                        value={latex}
                        onChange={e => setLatex(e.target.value)}
                        disabled={isSaving}
                        spellCheck={false}
                    />
                )}

                {tab === 'preview' && (
                    <div
                        className="w-full min-h-[65vh] bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-800 leading-relaxed overflow-auto"
                        dangerouslySetInnerHTML={{ __html: renderLatexToHtml(latex) }}
                    />
                )}
            </div>
        )
    }

    // ── Idle / processing / error form ────────────────────────────────────────

    const isProcessing = stage === 'processing'

    return (
        <div className="px-8 py-8 max-w-3xl">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Add Exam</h1>
            <p className="text-sm text-muted-foreground mb-6">
                Import from PDF or enter questions manually.
            </p>

            {/* Mode tabs */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm font-semibold w-fit mb-6">
                <button onClick={() => setMode('pdf')} disabled={isProcessing}
                    className={`flex items-center gap-2 px-5 py-2 transition-colors ${mode === 'pdf' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    <Upload size={14} /> PDF Import
                </button>
                <button onClick={() => setMode('latex')} disabled={isProcessing}
                    className={`flex items-center gap-2 px-5 py-2 transition-colors ${mode === 'latex' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    <Code size={14} /> Paste LaTeX
                </button>
                <button onClick={() => setMode('manual')} disabled={isProcessing}
                    className={`flex items-center gap-2 px-5 py-2 transition-colors ${mode === 'manual' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    <PenLine size={14} /> Manual Entry
                </button>
            </div>

            {/* Year / Variant — shared */}
            <div className="flex gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Year</label>
                    <select value={year} onChange={e => setYear(e.target.value)} disabled={isProcessing || manualSaving}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50">
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Variant</label>
                    <select value={variant} onChange={e => setVariant(e.target.value)} disabled={isProcessing || manualSaving}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50">
                        {VARIANTS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>

            {/* ── PDF mode ── */}
            {mode === 'pdf' && (
                <>
                    <div className="mb-6">
                        <DropZone onFile={setFile} file={file} disabled={isProcessing} />
                    </div>

                    {stage === 'error' && (
                        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => { setLatex(SAMPLE_LATEX); setStage('reviewing') }}
                        className="w-full mb-3 text-xs text-gray-400 hover:text-[#E75234] underline underline-offset-2 transition-colors"
                    >
                        No PDF? Load sample data to test the review flow
                    </button>

                    <Button
                        onClick={handleProcess}
                        disabled={!file || isProcessing}
                        className="w-full h-12 text-base font-bold bg-[#E75234] hover:bg-[#c94220] text-white disabled:opacity-50"
                    >
                        {isProcessing
                            ? <><Loader2 size={18} className="animate-spin mr-2" />{statusMsg}</>
                            : 'Process PDF'}
                    </Button>
                </>
            )}

            {/* ── Paste LaTeX mode ── */}
            {mode === 'latex' && (
                <>
                    <p className="text-xs text-muted-foreground mb-3">
                        Paste LaTeX with <code className="bg-gray-100 px-1 rounded">\section*{'{N.}'}</code> headings and <code className="bg-gray-100 px-1 rounded">\begin{'{enumerate}'}</code> options. Include an answer key section if available.
                    </p>
                    <textarea
                        className="w-full h-72 font-mono text-xs bg-gray-950 text-green-300 rounded-2xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-[#E75234] mb-4"
                        value={pastedLatex}
                        onChange={e => setPastedLatex(e.target.value)}
                        placeholder={"\\section*{1.}\nQuestion text here...\n\\begin{enumerate}\n\\item Option A\n\\item Option B\n..."}
                        spellCheck={false}
                    />
                    <Button
                        onClick={() => { setLatex(pastedLatex); setStage('reviewing') }}
                        disabled={!pastedLatex.trim()}
                        className="w-full h-12 text-base font-bold bg-[#E75234] hover:bg-[#c94220] text-white disabled:opacity-50"
                    >
                        Review &amp; Save
                    </Button>
                </>
            )}

            {/* ── Manual mode ── */}
            {mode === 'manual' && (
                <>
                    {manualError && (
                        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                            <span>{manualError}</span>
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        {manualQuestions.map((q, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-[#2760A6]">Q{idx + 1}</span>
                                    {manualQuestions.length > 1 && (
                                        <button onClick={() => removeQuestion(idx)} disabled={manualSaving}
                                            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <LaTeXField
                                        value={q.text}
                                        onChange={val => updateQuestion(idx, 'text', val)}
                                        placeholder="Question text — use $LaTeX$ for math"
                                        rows={2}
                                        disabled={manualSaving}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                    {['A', 'B', 'C', 'D', 'E'].map(letter => (
                                        <div key={letter} className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-400 w-4">{letter}</span>
                                            <LaTeXInput
                                                value={q[`label${letter}`]}
                                                onChange={val => updateQuestion(idx, `label${letter}`, val)}
                                                placeholder={`Option ${letter}`}
                                                disabled={manualSaving}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600">Answer:</span>
                                    <select
                                        value={q.answer}
                                        onChange={e => updateQuestion(idx, 'answer', e.target.value)}
                                        disabled={manualSaving}
                                        className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#E75234] disabled:opacity-50"
                                    >
                                        <option value="">— select —</option>
                                        {['A', 'B', 'C', 'D', 'E'].map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addQuestion}
                        disabled={manualSaving}
                        className="flex items-center gap-2 text-sm text-[#2760A6] hover:text-[#1a4a80] font-medium mb-6 disabled:opacity-50 transition-colors"
                    >
                        <PlusCircle size={16} /> Add Question
                    </button>

                    <Button
                        onClick={handleManualSave}
                        disabled={manualSaving}
                        className="w-full h-12 text-base font-bold bg-[#E75234] hover:bg-[#c94220] text-white disabled:opacity-50"
                    >
                        {manualSaving
                            ? <><Loader2 size={18} className="animate-spin mr-2" />Saving…</>
                            : `Save ${manualQuestions.filter(q => q.text.trim()).length || 0} Question${manualQuestions.filter(q => q.text.trim()).length !== 1 ? 's' : ''} to Site`}
                    </Button>
                </>
            )}
        </div>
    )
}
