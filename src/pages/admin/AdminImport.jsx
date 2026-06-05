import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

// ── PDF extraction: text + page images ───────────────────────────────────────

async function extractPdfData(file) {
    const arrayBuffer = await file.arrayBuffer()
    const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const textParts    = []
    const pageDataUrls = []
    const pageDims     = []

    for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p)

        // Text — with page markers so Claude knows page boundaries
        const content  = await page.getTextContent()
        const pageText = content.items.map(i => i.str).join(' ')
        textParts.push(`=== PAGE ${p} ===\n${pageText}`)

        // Render page to canvas at 1.5× for good quality
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas   = document.createElement('canvas')
        canvas.width   = viewport.width
        canvas.height  = viewport.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        pageDataUrls.push(canvas.toDataURL('image/png'))
        pageDims.push({ w: viewport.width, h: viewport.height })
    }

    return { text: cleanText(textParts.join('\n\n')), pageDataUrls, pageDims }
}

// Remove extraction noise to cut input tokens ~10–20%
function cleanText(raw) {
    return raw
        .replace(/[ \t]{2,}/g, ' ')          // collapse repeated spaces/tabs
        .replace(/(\S)\s*\n\s*(\S)/g, '$1\n$2') // remove blank lines between content
        .replace(/\n{3,}/g, '\n\n')           // max 2 consecutive newlines
        .trim()
}

// Parse % figure: page N → { [qId]: { pageIdx, y1, y2, x1, x2 } }
// Only scan Section 1 (before ЗАДГАЙ marker) — prevents \section*{2.1} in Section 2
// from being confused with MC question 2.
function parseFigureAnnotations(latex) {
    const { section1 } = splitLatexSections(latex)
    const assignments = {}
    const re = /\\section\*\{(\d+)[^}]*\}[^\n]*\n[^\n]*%\s*figure:\s*page\s*(\d+)/gi
    for (const m of section1.matchAll(re)) {
        assignments[m[1]] = { pageIdx: parseInt(m[2]) - 1, y1: 0.0, y2: 0.6, x1: 0.0, x2: 1.0 }
    }
    return assignments
}

// Parse задгай даалгавар (section 2) — handles ids like "1", "2.1", "2.2" etc.
function parseSecondSection(latex) {
    const { section2 } = splitLatexSections(latex)
    if (!section2.trim()) return []
    const problems = []
    let current = null
    for (const raw of section2.split('\n')) {
        const line = raw.trim()
        if (!line || line.match(/^\\(begin|end)\b/) || line.startsWith('%')) continue
        // Match ids like 1, 2.1, 2.2, 2.3 etc.
        const sec = line.match(/^\\section\*?\{([\d.]+)[.)?\s]*\}/)
        if (sec) {
            if (current) problems.push(finaliseSecondProblem(current))
            current = { id: sec[1], parts: [] }
            continue
        }
        if (current) current.parts.push(line)
    }
    if (current) problems.push(finaliseSecondProblem(current))
    return problems
}

function finaliseSecondProblem(q) {
    const text = q.parts.join(' ').trim()
    const slots = ['a','b','c','d','e','f'].filter(l => text.includes(`[${l}]`))
    const obj = { id: q.id, text }
    slots.forEach(l => { obj[l] = '' })
    return obj
}

// Crop a page image by [y1,y2] vertically and [x1,x2] horizontally (all 0–1 fractions)
async function cropImage(dataUrl, y1, y2, x1, x2) {
    return new Promise(resolve => {
        const img = new Image()
        img.onload = () => {
            const W = img.naturalWidth
            const H = img.naturalHeight
            const srcX = Math.round(W * x1)
            const srcY = Math.round(H * y1)
            const srcW = Math.max(1, Math.round(W * (x2 - x1)))
            const srcH = Math.max(1, Math.round(H * (y2 - y1)))
            const canvas = document.createElement('canvas')
            canvas.width  = srcW
            canvas.height = srcH
            canvas.getContext('2d').drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH)
            resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = () => resolve(dataUrl)
        img.src = dataUrl
    })
}

// Upload a cropped page image to Supabase Storage, return public URL
async function uploadPageImage(dataUrl, storagePath) {
    const blob = await (await fetch(dataUrl)).blob()
    const { error } = await supabase.storage
        .from('exam-images')
        .upload(storagePath, blob, { contentType: 'image/png', upsert: true })
    if (error) throw new Error(`Storage upload failed: ${error.message}`)
    return supabase.storage.from('exam-images').getPublicUrl(storagePath).data.publicUrl
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

// ── Manual question helpers ───────────────────────────────────────────────────

function emptyQuestion(num) {
    return { id: String(num), type: 'mc', text: '', labelA: '', labelB: '', labelC: '', labelD: '', labelE: '', answer: '' }
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
    const [file,             setFile]             = useState(null)
    const [stage,            setStage]            = useState('idle')
    const [statusMsg,        setStatusMsg]        = useState('')
    const [latex,            setLatex]            = useState('')
    const [tab,              setTab]              = useState('edit')
    const [error,            setError]            = useState('')
    const [pageDataUrls,      setPageDataUrls]      = useState([])  // rendered PDF pages
    const [pageDims,          setPageDims]          = useState([])  // [{w,h}] per page
    const [figureAssignments, setFigureAssignments] = useState({})  // { qId: {pageIdx,y1,y2,x1,x2} }
    const [lightbox,          setLightbox]          = useState(null) // { qId } | null

    // latex paste flow
    const [pastedLatex, setPastedLatex] = useState('')

    // manual flow
    const [manualQuestions, setManualQuestions] = useState([emptyQuestion(1)])
    const [manualSaving,    setManualSaving]    = useState(false)
    const [manualError,     setManualError]     = useState('')

    useEffect(() => {
        if (!lightbox) return
        const handler = e => { if (e.key === 'Escape') setLightbox(null) }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [lightbox])

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
        setPageDataUrls([]); setPageDims([]); setFigureAssignments({})
        setPastedLatex('')
        setManualQuestions([emptyQuestion(1)]); setManualError('')
    }

    // ── Step 1: process PDF ───────────────────────────────────────────────────

    async function handleProcess() {
        if (!file) return
        setStage('processing')
        setError('')
        try {
            setStatusMsg('Extracting text and rendering pages…')
            const { text, pageDataUrls: pages, pageDims: dims } = await extractPdfData(file)
            if (!text) throw new Error('No text found in PDF.')
            setPageDataUrls(pages)
            setPageDims(dims)

            setStatusMsg('Converting to LaTeX via Claude…')
            const res  = await fetch('/api/pdf-to-latex', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ text }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Conversion failed.')

            setLatex(data.latex)
            setFigureAssignments(parseFigureAnnotations(data.latex))
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

            // Crop + upload figure images and assign img field to questions
            if (Object.keys(figureAssignments).length > 0 && pageDataUrls.length > 0) {
                setStatusMsg('Uploading question images…')
                for (const [qId, { pageIdx, y1, y2, x1 = 0, x2 = 1 }] of Object.entries(figureAssignments)) {
                    if (pageIdx < 0 || pageIdx >= pageDataUrls.length) continue
                    try {
                        const cropped = await cropImage(pageDataUrls[pageIdx], y1, y2, x1, x2)
                        const url = await uploadPageImage(cropped, `${year}-${variant}/q${qId}.png`)
                        const q = questions.find(q => q.id === qId)
                        if (q) q.img = url
                    } catch {
                        // Storage not set up or upload failed — skip silently
                    }
                }
            }

            // Parse задгай даалгавар (section 2)
            const secondProblems = parseSecondSection(latex)

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
            setStage('reviewing')
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
                            ? <><Loader2 size={15} className="animate-spin mr-2" />{statusMsg || 'Saving…'}</>
                            : 'Save to Site'}
                    </Button>
                </div>

                {/* ── Figure crop panel ── */}
                {Object.keys(figureAssignments).length > 0 && pageDataUrls.length > 0 && (
                    <div className="mb-4 border border-blue-100 rounded-xl bg-blue-50 p-4">
                        <p className="text-xs font-bold text-[#2760A6] mb-3">
                            Question Images — {Object.keys(figureAssignments).length} detected
                            <span className="ml-2 font-normal text-blue-400">Drag sliders to crop each figure</span>
                        </p>
                        <div className="flex flex-col gap-3">
                            {Object.entries(figureAssignments)
                                .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
                                .map(([qId, { pageIdx, y1, y2, x1 = 0, x2 = 1 }]) => {
                                    const dim = pageDims[pageIdx] || { w: 892, h: 1263 }
                                    const aspect = dim.w / dim.h
                                    // Thumbnail: show only the cropped area at fixed width
                                    const thumbW = 120
                                    const imgWThumb = thumbW / (x2 - x1)
                                    const imgHThumb = imgWThumb / aspect
                                    const cropHThumb = Math.max(30, Math.round(imgHThumb * (y2 - y1)))
                                    const setFA = patch => setFigureAssignments(prev => ({
                                        ...prev, [qId]: { ...prev[qId], ...patch }
                                    }))
                                    return (
                                        <div key={qId} className="flex items-start gap-4 bg-white rounded-xl border border-blue-100 p-3 shadow-sm">
                                            {/* Cropped-area thumbnail */}
                                            <div className="shrink-0 flex flex-col items-center gap-1">
                                                {/* Editable question ID — change if AI assigned to wrong question */}
                                                <div className="flex items-center gap-0.5">
                                                    <span className="text-xs font-bold text-[#E75234]">Q</span>
                                                    <input
                                                        type="text"
                                                        defaultValue={qId}
                                                        title="Change question number"
                                                        disabled={isSaving}
                                                        onBlur={e => {
                                                            const newId = e.target.value.trim()
                                                            if (!newId || newId === qId) return
                                                            setFigureAssignments(prev => {
                                                                const n = { ...prev }
                                                                n[newId] = n[qId]
                                                                delete n[qId]
                                                                return n
                                                            })
                                                        }}
                                                        onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                                                        className="w-10 text-xs font-bold text-[#E75234] border border-[#E75234]/40 rounded px-1 py-0.5 text-center focus:outline-none focus:border-[#E75234] bg-transparent disabled:opacity-50"
                                                    />
                                                </div>
                                                <div
                                                    onClick={() => setLightbox({ qId })}
                                                    title="Click to enlarge"
                                                    style={{
                                                        width: thumbW, height: cropHThumb,
                                                        position: 'relative', overflow: 'hidden',
                                                        borderRadius: 4, border: '2px solid #E75234',
                                                        cursor: 'zoom-in', flexShrink: 0,
                                                    }}
                                                >
                                                    <img src={pageDataUrls[pageIdx]} alt=""
                                                        style={{
                                                            position: 'absolute',
                                                            width: Math.round(imgWThumb),
                                                            height: Math.round(imgHThumb),
                                                            left: -Math.round(imgWThumb * x1),
                                                            top: -Math.round(imgHThumb * y1),
                                                            display: 'block',
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-gray-400">click to enlarge</span>
                                            </div>
                                            {/* Crop controls */}
                                            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                                                {/* Top */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 w-16 shrink-0">Top {Math.round(y1*100)}%</span>
                                                    <input type="range" min={0} max={95} step={1} value={Math.round(y1*100)} disabled={isSaving}
                                                        onChange={e => { const v=parseInt(e.target.value)/100; setFA({ y1: v, y2: Math.max(v+0.05, y2) }) }}
                                                        className="flex-1 accent-[#2760A6]" />
                                                </div>
                                                {/* Bot */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 w-16 shrink-0">Bot {Math.round(y2*100)}%</span>
                                                    <input type="range" min={5} max={100} step={1} value={Math.round(y2*100)} disabled={isSaving}
                                                        onChange={e => { const v=parseInt(e.target.value)/100; setFA({ y2: v, y1: Math.min(y1, v-0.05) }) }}
                                                        className="flex-1 accent-[#2760A6]" />
                                                </div>
                                                <div className="border-t border-gray-100 my-0.5" />
                                                {/* Left */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-[#E75234] font-semibold w-16 shrink-0">← Left {Math.round(x1*100)}%</span>
                                                    <input type="range" min={0} max={95} step={1} value={Math.round(x1*100)} disabled={isSaving}
                                                        onChange={e => { const v=parseInt(e.target.value)/100; setFA({ x1: v, x2: Math.max(v+0.05, x2) }) }}
                                                        className="flex-1 accent-[#E75234]" />
                                                </div>
                                                {/* Right */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-[#E75234] font-semibold w-16 shrink-0">Right {Math.round(x2*100)}% →</span>
                                                    <input type="range" min={5} max={100} step={1} value={Math.round(x2*100)} disabled={isSaving}
                                                        onChange={e => { const v=parseInt(e.target.value)/100; setFA({ x2: v, x1: Math.min(x1, v-0.05) }) }}
                                                        className="flex-1 accent-[#E75234]" />
                                                </div>
                                                <select
                                                    value={pageIdx}
                                                    onChange={e => setFA({ pageIdx: parseInt(e.target.value) })}
                                                    disabled={isSaving}
                                                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#E75234] w-28"
                                                >
                                                    {pageDataUrls.map((_, i) => (
                                                        <option key={i} value={i}>Page {i + 1}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => setFigureAssignments(prev => { const n={...prev}; delete n[qId]; return n })}
                                                    disabled={isSaving}
                                                    className="text-xs text-gray-400 hover:text-red-400 transition-colors w-fit"
                                                >remove</button>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                )}

                {/* Lightbox rendered via portal so it escapes overflow containers */}
                {lightbox && figureAssignments[lightbox.qId] && createPortal((() => {
                    const { qId } = lightbox
                    const { pageIdx, y1, y2, x1 = 0, x2 = 1 } = figureAssignments[qId]
                    const dim = pageDims[pageIdx] || { w: 892, h: 1263 }
                    const aspect = dim.w / dim.h
                    const lbW = 500
                    const imgW = lbW / (x2 - x1)
                    const imgH = imgW / aspect
                    const cropH = Math.round(imgH * (y2 - y1))
                    return (
                        <div
                            style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.72)' }}
                            onClick={() => setLightbox(null)}
                        >
                            <div
                                style={{ background:'#fff', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12, boxShadow:'0 25px 60px rgba(0,0,0,0.4)', maxWidth:'95vw' }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                    <span style={{ fontSize:14, fontWeight:700, color:'#E75234' }}>Q{qId} — Figure</span>
                                    <button onClick={() => setLightbox(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#9ca3af', lineHeight:1 }}>✕</button>
                                </div>
                                <div style={{ width:lbW, height:Math.max(40, cropH), overflow:'hidden', borderRadius:8, border:'1px solid #e5e7eb', position:'relative' }}>
                                    <img
                                        src={pageDataUrls[pageIdx]}
                                        alt=""
                                        style={{ position:'absolute', width:Math.round(imgW), height:Math.round(imgH), left:-Math.round(imgW*x1), top:-Math.round(imgH*y1) }}
                                    />
                                </div>
                                <p style={{ fontSize:11, color:'#9ca3af', textAlign:'center', margin:0 }}>Click outside or press Esc to close</p>
                            </div>
                        </div>
                    )
                })(), document.body)}

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
