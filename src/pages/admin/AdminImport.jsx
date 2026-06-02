import { useState, useRef, useCallback } from 'react'
import { useTaskRefresh } from '@/lib/TaskContext'
import * as pdfjsLib from 'pdfjs-dist'
import {
    Upload, FileText, CheckCircle, Loader2, AlertCircle,
    ChevronDown, ChevronUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import {
    parseTexifyText, parseSuryaJson,
    parseQuestions, parseAnswerKey,
    getScoringConfig, calcStats,
} from '@/lib/parseEysh'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).href

const CURRENT_YEAR = new Date().getFullYear()
const YEARS        = Array.from({ length: CURRENT_YEAR - 2006 + 1 }, (_, i) => String(2006 + i))
const VARIANTS     = ['A', 'B', 'C', 'D']

// ── Datalab Marker API ────────────────────────────────────────────────────────

async function pdfToMarkdownViaDatalab(file, onStatus) {
    // Step 1: submit
    onStatus('Uploading to Datalab…')
    const b64 = await new Promise((res, rej) => {
        const r = new FileReader()
        r.onload  = e => res(e.target.result.split(',')[1])
        r.onerror = rej
        r.readAsDataURL(file)
    })

    const submitRes  = await fetch('/api/marker-submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pdf: b64, filename: file.name }),
    })
    const submitData = await submitRes.json()
    if (!submitRes.ok || submitData.error) throw new Error(submitData.error)

    // Step 2: poll
    const checkUrl = encodeURIComponent(submitData.check_url)
    for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 3000))
        onStatus(`Converting PDF… (${i * 3}s)`)

        const pollRes  = await fetch(`/api/marker-result?check_url=${checkUrl}`)
        const pollData = await pollRes.json()
        if (pollData.error)            throw new Error(pollData.error)
        if (pollData.status === 'complete') return pollData.markdown
    }
    throw new Error('Datalab timed out after 3 minutes.')
}

// ── pdfjs fallback ────────────────────────────────────────────────────────────

async function extractPdfText(file) {
    const buf = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise
    let text  = ''

    for (let p = 1; p <= pdf.numPages; p++) {
        const page    = await pdf.getPage(p)
        const content = await page.getTextContent()
        const items   = content.items
            .filter(item => item.str?.trim())
            .map(item => ({ str: item.str, x: item.transform[4], y: item.transform[5], w: item.width }))

        if (!items.length) continue

        items.sort((a, b) => Math.abs(b.y - a.y) > 6 ? b.y - a.y : a.x - b.x)

        const lines = []
        let curLine = [items[0]], baseY = items[0].y
        for (let i = 1; i < items.length; i++) {
            if (Math.abs(items[i].y - baseY) <= 6) { curLine.push(items[i]) }
            else { lines.push(curLine); curLine = [items[i]]; baseY = items[i].y }
        }
        lines.push(curLine)

        text += lines.map(line => {
            line.sort((a, b) => a.x - b.x)
            let t = line[0].str
            for (let i = 1; i < line.length; i++)
                t += (line[i].x - (line[i-1].x + line[i-1].w) > 3 ? ' ' : '') + line[i].str
            return t.trim()
        }).filter(Boolean).join('\n') + '\n'
    }
    return text
}

async function fileToText(file) {
    const name = file.name.toLowerCase()
    if (name.endsWith('.pdf')) return extractPdfText(file)
    const raw = await new Promise((res, rej) => {
        const r = new FileReader()
        r.onload = e => res(e.target.result); r.onerror = rej
        r.readAsText(file, 'utf-8')
    })
    if (name.endsWith('.json')) return parseSuryaJson(raw)
    return parseTexifyText(raw)
}

// ── Drop zone ─────────────────────────────────────────────────────────────────

function DropZone({ onFile, file }) {
    const [dragging, setDragging] = useState(false)
    const ref = useRef(null)
    const pick = useCallback(f => { if (f) onFile(f) }, [onFile])

    return (
        <div
            onDragOver={e  => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e  => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]) }}
            onClick={() => ref.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors select-none ${
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
                        <p className="text-xs text-muted-foreground mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <Upload size={36} className="text-gray-400" />
                    <div className="text-center">
                        <p className="font-semibold text-gray-700 text-lg">Click to upload PDF</p>
                        <p className="text-sm text-muted-foreground mt-1">or drag and drop · max 10 MB</p>
                    </div>
                </>
            )}
            <input ref={ref} type="file" accept=".pdf,application/pdf" className="hidden"
                onChange={e => pick(e.target.files[0])} />
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminImport() {
    const refreshTasks = useTaskRefresh()
    const [file,       setFile]       = useState(null)
    const [year,       setYear]       = useState(String(CURRENT_YEAR))
    const [variant,    setVariant]    = useState('A')
    const [processing, setProcessing] = useState(false)
    const [statusMsg,  setStatusMsg]  = useState('')
    const [savedStats, setSavedStats] = useState(null)
    const [error,      setError]      = useState(null)
    const [rawText,    setRawText]    = useState('')
    const [showRaw,    setShowRaw]    = useState(false)

    const handleSave = async () => {
        if (!file) return
        setProcessing(true)
        setError(null)
        setRawText('')
        setSavedStats(null)

        try {
            let text = null

            // Tier 1 — Datalab Marker API (LaTeX math, best quality)
            if (file.size <= 10 * 1024 * 1024) {
                try {
                    text = await pdfToMarkdownViaDatalab(file, setStatusMsg)
                } catch (err) {
                    console.warn('Datalab (falling back to pdfjs):', err.message)
                }
            }

            // Tier 2 — pdfjs text extraction (fallback)
            if (!text) {
                setStatusMsg('Extracting text from PDF…')
                text = await fileToText(file)
            }

            setRawText(text)

            setStatusMsg('Parsing questions…')
            const questions = parseQuestions(text)

            if (questions.length === 0) {
                setError('no_questions')
                return
            }

            const answerKey = parseAnswerKey(text)
            questions.forEach(q => { q.answer = answerKey[q.id] || '' })

            setStatusMsg('Saving to database…')
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
        } catch (err) {
            if (err.message !== 'no_questions') setError(err.message)
        } finally {
            setProcessing(false)
            setStatusMsg('')
        }
    }

    const handleReset = () => {
        setFile(null); setSavedStats(null)
        setError(null); setRawText(''); setShowRaw(false)
    }

    // ── Success ───────────────────────────────────────────────────────────────

    if (savedStats) {
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
                    <Button onClick={handleReset} className="bg-[#E75234] hover:bg-[#c94220] text-white">
                        Add Another Exam
                    </Button>
                </div>
            </div>
        )
    }

    // ── Form ──────────────────────────────────────────────────────────────────

    return (
        <div className="px-8 py-8 max-w-xl">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Add Exam</h1>
            <p className="text-sm text-muted-foreground mb-8">
                Upload the exam PDF. Questions are extracted automatically and go live immediately.
            </p>

            <div className="flex gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Year</label>
                    <select value={year} onChange={e => setYear(e.target.value)} disabled={processing}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50">
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Variant</label>
                    <select value={variant} onChange={e => setVariant(e.target.value)} disabled={processing}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50">
                        {VARIANTS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-6">
                <DropZone onFile={setFile} file={file} />
            </div>

            {error === 'no_questions' && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                    <div className="flex items-start gap-2 text-sm text-red-700 mb-2">
                        <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">No questions found in this PDF</p>
                            <p className="text-xs mt-0.5">Make sure the file contains the exam questions, not just the answer key.</p>
                        </div>
                    </div>
                    {rawText && (
                        <>
                            <button onClick={() => setShowRaw(o => !o)}
                                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800">
                                {showRaw ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                                {showRaw ? 'Hide' : 'Show'} extracted text
                            </button>
                            {showRaw && (
                                <pre className="mt-2 text-xs bg-white border border-red-200 rounded p-3 overflow-auto max-h-48 font-mono text-gray-700 whitespace-pre-wrap">
                                    {rawText.slice(0, 3000)}{rawText.length > 3000 ? '\n…' : ''}
                                </pre>
                            )}
                        </>
                    )}
                </div>
            )}

            {error && error !== 'no_questions' && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <Button
                onClick={handleSave}
                disabled={!file || processing}
                className="w-full h-12 text-base font-bold bg-[#E75234] hover:bg-[#c94220] text-white disabled:opacity-50"
            >
                {processing
                    ? <><Loader2 size={18} className="animate-spin mr-2" />{statusMsg}</>
                    : 'Add to Site'
                }
            </Button>
        </div>
    )
}
