import { useState, useRef, useCallback } from 'react'
import { useTaskRefresh } from '@/lib/TaskContext'
import * as pdfjsLib from 'pdfjs-dist'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import {
    Upload, FileText, CheckCircle, Loader2, AlertCircle, PlusCircle, Trash2, PenLine, Code,
    Image as ImageIcon, X,
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

// ── PDF extraction: text only ─────────────────────────────────────────────────

async function extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer()
    const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const textParts = []

    for (let p = 1; p <= doc.numPages; p++) {
        const page    = await doc.getPage(p)
        const content = await page.getTextContent()
        // Page markers help Claude understand page boundaries
        textParts.push(`=== PAGE ${p} ===\n${content.items.map(i => i.str).join(' ')}`)
    }

    return cleanText(textParts.join('\n\n'))
}

// Remove extraction noise to cut input tokens ~10–20%
function cleanText(raw) {
    return raw
        .replace(/[ \t]{2,}/g, ' ')             // collapse repeated spaces/tabs
        .replace(/(\S)\s*\n\s*(\S)/g, '$1\n$2') // remove blank lines between content
        .replace(/\n{3,}/g, '\n\n')             // max 2 consecutive newlines
        .trim()
}

// Parse задгай даалгавар (section 2) — handles ids like "1", "2.1", "2.2" etc.
function parseSecondSection(latex) {
    const { section2 } = splitLatexSections(latex)
    if (!section2.trim()) return []
    const problems = []
    let current = null
    for (const raw of section2.split('\n')) {
        const line = raw.trim()
        if (!line || line.match(/^\\(begin|end)\b/)) continue
        const ans = line.match(/^%%%\s*ХАРИУЛТ\s+(.+?)\s*%%%$/i)
        if (ans && current) {
            current.slotNames = ans[1].split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
            continue
        }
        if (line.startsWith('%')) continue
        // Match ids like 1, 2.1, 2.2, 2.3 etc.
        const sec = line.match(/^\\section\*?\{([\d.]+)[.)?\s]*\}/)
        if (sec) {
            if (current) problems.push(finaliseSecondProblem(current))
            current = { id: sec[1], parts: [], slotNames: null }
            continue
        }
        if (current) current.parts.push(line)
    }
    if (current) problems.push(finaliseSecondProblem(current))
    return problems
}

function finaliseSecondProblem(q) {
    const text = q.parts.join(' ').trim()
    let names = q.slotNames
    if (!names || !names.length) {
        names = []
        for (const m of text.matchAll(/\[([a-zA-Z][a-zA-Z0-9]*)\]/g)) {
            if (!names.includes(m[1])) names.push(m[1])
        }
    }
    return { id: q.id, text, slots: names.map(name => ({ name, value: '' })) }
}

// Upload an image (data URL) to Supabase Storage, return its public URL
async function uploadImage(dataUrl, storagePath) {
    const blob = await (await fetch(dataUrl)).blob()
    const { error } = await supabase.storage
        .from('exam-images')
        .upload(storagePath, blob, { contentType: blob.type || 'image/png', upsert: true })
    if (error) throw new Error(`Storage upload failed: ${error.message}`)
    return supabase.storage.from('exam-images').getPublicUrl(storagePath).data.publicUrl
}

// Read a File into a data URL
function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

// ── LaTeX preview renderer ────────────────────────────────────────────────────

function renderLatexToHtml(src) {
    // Split on math blocks first so \n replacement never touches SVG path data
    const segments = src.split(/(\$\$[\s\S]+?\$\$|\$[^\n$]+?\$)/g)
    return segments.map(seg => {
        if (seg.startsWith('$$') && seg.endsWith('$$')) {
            try { return katex.renderToString(seg.slice(2, -2).trim(), { displayMode: true,  throwOnError: false }) }
            catch { return `<span class="text-red-400">${seg}</span>` }
        }
        if (seg.startsWith('$') && seg.endsWith('$')) {
            try { return katex.renderToString(seg.slice(1, -1).trim(), { displayMode: false, throwOnError: false }) }
            catch { return `<span class="text-red-400">${seg}</span>` }
        }
        return seg
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/%%% ЗАДГАЙ ДААЛГАВАР %%%/g, '<div class="my-4 py-2 px-4 bg-blue-50 border-l-4 border-[#2760A6] text-[#2760A6] font-bold text-sm">— Хоёрдугаар хэсэг: Задгай даалгавар —</div>')
            .replace(/\\section\*\{([^}]*)\}/g, '<h3 class="text-base font-bold mt-4 mb-1 text-[#2760A6]">$1</h3>')
            .replace(/\\begin\{enumerate\}/g, '<ol class="list-decimal list-inside space-y-1 pl-2">')
            .replace(/\\end\{enumerate\}/g,   '</ol>')
            .replace(/\\begin\{itemize\}/g,   '<ul class="list-disc list-inside space-y-1 pl-2">')
            .replace(/\\end\{itemize\}/g,     '</ul>')
            .replace(/\\item\s*/g,            '<li class="text-sm">')
            .replace(/\n{2,}/g, '<br/><br/>')
            .replace(/\n/g, '<br/>')
    }).join('')
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

// ── LaTeX → plain-text converter for parseQuestions ──────────────────────────

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

const SECTION2_MARKER = '%%% ЗАДГАЙ ДААЛГАВАР %%%'

// Returns { section1: string, section2: string }
function splitLatexSections(src) {
    const idx = src.indexOf(SECTION2_MARKER)
    if (idx === -1) return { section1: src, section2: '' }
    return {
        section1: src.slice(0, idx),
        section2: src.slice(idx + SECTION2_MARKER.length),
    }
}

function latexToPlainText(src) {
    // Only convert Section 1 (MC questions) — stop at the задгай marker
    const { section1 } = splitLatexSections(src)

    // Expand inline \item chains onto separate lines before splitting
    const expanded = section1
        .replace(/\\item\s*(?=\\item)/g, '\\item\n')
        .replace(/(\\end\{enumerate\})\s*(?=\\item)/g, '$1\n')

    const lines = expanded.split('\n')
    const out   = []
    let optionIndex = 0

    for (const raw of lines) {
        const line = raw.trim()
        if (!line) continue

        // \section*{1.} / \section{1} / \subsection*{1.} → "1."
        const sec = line.match(/^\\(?:sub)?section\*?\{(\d+)[.)?\s]*\}/)
        if (sec) { out.push(`${sec[1]}.`); optionIndex = 0; continue }

        // \item [optional label] text → "A) text"
        if (line.includes('\\item')) {
            const items = line.split(/\\item(?:\[.*?\])?/).slice(1)
            for (const itemText of items) {
                const text   = itemText.trim()
                const letter = OPTION_LETTERS[optionIndex] || '?'
                if (text && !text.startsWith('%')) out.push(`${letter}) ${text}`)
                optionIndex++
            }
            continue
        }

        // skip structural LaTeX commands and figure annotation comments
        if (line.match(/^\\(begin|end|documentclass|usepackage|title|author|date|maketitle)\b/)) continue
        if (line.match(/^%\s*figure:\s*page\s*\d+/i)) continue

        // pass through question text, answer keys, and plain-numbered lines
        out.push(line)
    }

    return out.join('\n')
}

// Parse reviewed LaTeX into { questions, secondProblems }. Throws if no questions.
function parseReviewedLatex(latex) {
    const plain     = latexToPlainText(latex)
    let   questions = parseQuestions(plain)
    if (questions.length === 0) questions = parseQuestions(latex)
    if (questions.length === 0) throw new Error(
        'No questions found. Make sure each question starts with a number: ' +
        '"1." on its own line, or "1. question text". ' +
        'Options should use "A) …" / "А) …" or \\item.'
    )

    const answerKey = parseAnswerKey(plain)
    questions.forEach(q => { q.answer = answerKey[q.id] || '' })

    return { questions, secondProblems: parseSecondSection(latex) }
}

// ── Manual question helpers ───────────────────────────────────────────────────

function emptyQuestion(num) {
    return { id: String(num), type: 'mc', text: '', labelA: '', labelB: '', labelC: '', labelD: '', labelE: '', answer: '' }
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminImport() {
    const refreshTasks = useTaskRefresh()

    // shared
    const [mode,    setMode]    = useState('pdf') // 'pdf' | 'latex' | 'manual'
    const [year,    setYear]    = useState(String(CURRENT_YEAR))
    const [variant, setVariant] = useState('A')
    const [savedStats, setSavedStats] = useState(null)

    // pdf / latex flow
    const [file,      setFile]      = useState(null)
    const [stage,     setStage]     = useState('idle') // idle|processing|reviewing|images|saving|saved|error
    const [statusMsg, setStatusMsg] = useState('')
    const [latex,     setLatex]     = useState('')
    const [tab,       setTab]       = useState('edit')
    const [error,     setError]     = useState('')
    const [parsed,    setParsed]    = useState(null)   // { questions, secondProblems } after review
    const [images,    setImages]    = useState([])     // [{ uid, name, dataUrl, target }]

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
        setParsed(null); setImages([])
        setPastedLatex('')
        setManualQuestions([emptyQuestion(1)]); setManualError('')
    }

    // ── Step 1: process PDF ───────────────────────────────────────────────────

    async function handleProcess() {
        if (!file) return
        setStage('processing')
        setError('')
        try {
            setStatusMsg('Extracting text…')
            const text = await extractPdfText(file)
            if (!text) throw new Error('No text found in PDF.')

            setStatusMsg('Converting to LaTeX via Claude…')
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

    // ── Step 2: review → parse questions → go to image stage ──────────────────

    function handleContinue() {
        setError('')
        try {
            setParsed(parseReviewedLatex(latex))
            setStage('images')
        } catch (err) {
            setError(err.message)
        }
    }

    // ── Image stage helpers ───────────────────────────────────────────────────

    async function addImages(fileList) {
        const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
        for (const file of files) {
            const dataUrl = await fileToDataUrl(file)
            setImages(prev => [...prev, {
                uid:    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                name:   file.name,
                dataUrl,
                target: '', // "q:<id>" for MC, "s:<id>" for second problems
            }])
        }
    }

    function updateImage(uid, patch) {
        setImages(prev => prev.map(img => img.uid === uid ? { ...img, ...patch } : img))
    }

    function removeImage(uid) {
        setImages(prev => prev.filter(img => img.uid !== uid))
    }

    // ── Step 3: upload images + save to DB ────────────────────────────────────

    async function handleSave() {
        setStage('saving')
        setError('')
        try {
            const questions      = parsed.questions.map(q => ({ ...q }))
            const secondProblems = parsed.secondProblems.map(p => ({ ...p }))

            // Upload assigned images and attach the public URL to its problem
            const assigned = images.filter(img => img.target)
            if (assigned.length > 0) {
                setStatusMsg('Uploading images…')
                for (const img of assigned) {
                    const [kind, id] = img.target.split(':')
                    const target = (kind === 's' ? secondProblems : questions).find(x => x.id === id)
                    if (!target) continue
                    const path = `${year}-${variant}/${kind}${id}.png`
                    target.img = await uploadImage(img.dataUrl, path)
                }
            }

            const { error: dbErr } = await supabase
                .from('exams')
                .upsert({
                    year:           parseInt(year),
                    variant,
                    scoring:        getScoringConfig(year, questions.length),
                    problem:        questions,
                    second_problem: secondProblems,
                }, { onConflict: 'year,variant' })

            if (dbErr) throw new Error(dbErr.message)

            setSavedStats(calcStats(questions))
            refreshTasks()
            setStage('saved')
        } catch (err) {
            setError(err.message)
            setStage('images')
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

    // ── Image-assignment stage ────────────────────────────────────────────────

    if (stage === 'images' || stage === 'saving') {
        const isSaving = stage === 'saving'
        // Build the assignable-problem options once
        const options = [
            ...parsed.questions.map(q => ({ value: `q:${q.id}`, label: `Бодлого ${q.id}` })),
            ...parsed.secondProblems.map(p => ({ value: `s:${p.id}`, label: `Задгай ${p.id}` })),
        ]

        return (
            <div className="px-8 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Add Question Images</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {year} он — {variant} хувилбар · Upload pictures and assign each to a problem. Optional — skip if none.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => setStage('reviewing')} disabled={isSaving} className="text-sm">
                        ← Back
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Image dropzone */}
                <ImageDropZone onFiles={addImages} disabled={isSaving} />

                {/* Uploaded images grid */}
                {images.length > 0 && (
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map(img => (
                            <div key={img.uid} className="border border-gray-200 rounded-xl bg-white p-3 shadow-sm flex flex-col gap-2">
                                <div className="relative">
                                    <img src={img.dataUrl} alt={img.name}
                                        className="w-full h-40 object-contain rounded-lg bg-gray-50 border border-gray-100" />
                                    <button
                                        onClick={() => removeImage(img.uid)}
                                        disabled={isSaving}
                                        title="Remove"
                                        className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full p-1 shadow disabled:opacity-50 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <p className="text-[11px] text-gray-400 truncate" title={img.name}>{img.name}</p>
                                <select
                                    value={img.target}
                                    onChange={e => updateImage(img.uid, { target: e.target.value })}
                                    disabled={isSaving}
                                    className={`text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#E75234] disabled:opacity-50 ${img.target ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                                >
                                    <option value="">— assign to problem —</option>
                                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                )}

                {/* Save bar */}
                <div className="mt-8 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        {images.filter(i => i.target).length} of {images.length} image{images.length !== 1 ? 's' : ''} assigned
                    </p>
                    <Button onClick={handleSave} disabled={isSaving}
                        className="bg-[#E75234] hover:bg-[#c94220] text-white px-6">
                        {isSaving
                            ? <><Loader2 size={15} className="animate-spin mr-2" />{statusMsg || 'Saving…'}</>
                            : 'Save to Site'}
                    </Button>
                </div>
            </div>
        )
    }

    // ── Review stage ──────────────────────────────────────────────────────────

    if (stage === 'reviewing') {
        return (
            <div className="px-8 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Review Before Continuing</h1>
                        <p className="text-sm text-muted-foreground mt-1">{year} он — {variant} хувилбар · Edit if needed, then continue to images.</p>
                    </div>
                    <Button variant="outline" onClick={() => setStage('idle')} className="text-sm">
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
                            <button key={t} onClick={() => setTab(t)}
                                className={`px-4 py-1.5 transition-colors ${tab === t ? 'bg-[#E75234] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                {t === 'edit' ? 'Edit LaTeX' : 'Preview'}
                            </button>
                        ))}
                    </div>
                    <Button onClick={handleContinue}
                        className="bg-[#E75234] hover:bg-[#c94220] text-white px-6">
                        Continue →
                    </Button>
                </div>

                {tab === 'edit' && (
                    <textarea
                        className="w-full h-[65vh] font-mono text-xs bg-gray-950 text-green-300 rounded-2xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-[#E75234]"
                        value={latex}
                        onChange={e => setLatex(e.target.value)}
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
                        Review &amp; Continue
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
                                {/* question header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#2760A6]">Q{idx + 1}</span>
                                        {/* type toggle */}
                                        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
                                            <button
                                                type="button"
                                                onClick={() => updateQuestion(idx, 'type', 'mc')}
                                                disabled={manualSaving}
                                                className={`px-2.5 py-1 transition-colors ${q.type !== 'text' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                            >A–E</button>
                                            <button
                                                type="button"
                                                onClick={() => updateQuestion(idx, 'type', 'text')}
                                                disabled={manualSaving}
                                                className={`px-2.5 py-1 transition-colors ${q.type === 'text' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                            >Text</button>
                                        </div>
                                    </div>
                                    {manualQuestions.length > 1 && (
                                        <button onClick={() => removeQuestion(idx)} disabled={manualSaving}
                                            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>

                                {/* question text */}
                                <div className="mb-3">
                                    <LaTeXField
                                        value={q.text}
                                        onChange={val => updateQuestion(idx, 'text', val)}
                                        placeholder="Question text — use $LaTeX$ for math"
                                        rows={2}
                                        disabled={manualSaving}
                                    />
                                </div>

                                {/* multiple choice options */}
                                {q.type !== 'text' && (
                                    <>
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
                                    </>
                                )}

                                {/* text answer */}
                                {q.type === 'text' && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-medium text-gray-600 mt-2">Answer:</span>
                                        <LaTeXField
                                            value={q.answer}
                                            onChange={val => updateQuestion(idx, 'answer', val)}
                                            placeholder="Enter the answer — use $LaTeX$ for math"
                                            rows={2}
                                            disabled={manualSaving}
                                        />
                                    </div>
                                )}
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

// ── Image drop zone (multiple) ────────────────────────────────────────────────

function ImageDropZone({ onFiles, disabled }) {
    const [dragging, setDragging] = useState(false)
    const ref = useRef(null)

    return (
        <div
            onDragOver={e  => { e.preventDefault(); !disabled && setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e  => { e.preventDefault(); setDragging(false); !disabled && e.dataTransfer.files.length && onFiles(e.dataTransfer.files) }}
            onClick={() => !disabled && ref.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 transition-colors select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
                dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
        >
            <ImageIcon size={32} className="text-gray-400" />
            <p className="font-semibold text-gray-700">Click to upload images</p>
            <p className="text-xs text-muted-foreground">or drag and drop · PNG, JPG · multiple allowed</p>
            <input ref={ref} type="file" accept="image/*" multiple className="hidden"
                onChange={e => { if (e.target.files.length) onFiles(e.target.files); e.target.value = '' }} />
        </div>
    )
}
