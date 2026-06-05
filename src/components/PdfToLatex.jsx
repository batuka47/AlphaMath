import { useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import katex from 'katex'
import 'katex/dist/katex.min.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.mjs',
    import.meta.url
).toString()

async function extractText(file) {
    const doc = await pdfjsLib.getDocument({ data: await file.arrayBuffer(), useSystemFonts: true }).promise
    let text = ''
    for (let i = 1; i <= doc.numPages; i++) {
        const content = await (await doc.getPage(i)).getTextContent()
        text += content.items.map(it => it.str).join(' ') + '\n'
    }
    return text.trim()
}

function renderLatexToHtml(latex) {
    let html = latex
        // escape HTML first
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // display math $$...$$
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
        try { return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false }) }
        catch { return `<span class="text-red-400">$$${math}$$</span>` }
    })

    // inline math $...$
    html = html.replace(/\$([^\n$]+?)\$/g, (_, math) => {
        try { return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false }) }
        catch { return `<span class="text-red-400">$${math}$</span>` }
    })

    // structural elements
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

const LABELS = {
    extracting: 'PDF-с текст уншиж байна…',
    converting: 'LaTeX руу хөрвүүлж байна…',
}

export default function PdfToLatex() {
    const inputRef            = useRef(null)
    const [status, setStatus] = useState('idle')   // idle | extracting | converting | editing | error
    const [latex, setLatex]   = useState('')
    const [error, setError]   = useState('')
    const [tab, setTab]       = useState('edit')   // edit | preview
    const [copied, setCopied] = useState(false)

    function reset() {
        setStatus('idle'); setLatex(''); setError(''); setTab('edit'); setCopied(false)
        if (inputRef.current) inputRef.current.value = ''
    }

    async function handleFile(file) {
        if (!file || file.type !== 'application/pdf')
            return setError('PDF файл оруулна уу.'), setStatus('error')

        setError(''); setLatex('')
        try {
            setStatus('extracting')
            const text = await extractText(file)
            if (!text) throw new Error('PDF-с текст олдсонгүй.')

            setStatus('converting')
            const res  = await fetch('/api/pdf-to-latex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Хөрвүүлэлт амжилтгүй боллоо.')

            setLatex(data.latex)
            setStatus('editing')
        } catch (err) {
            setError(err.message)
            setStatus('error')
        }
    }

    async function copy() {
        await navigator.clipboard.writeText(latex)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col gap-4">

            {status === 'idle' && (
                <div
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-[#E75234] hover:bg-[#fff8f6] transition-colors"
                    onClick={() => inputRef.current?.click()}
                    onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]) }}
                    onDragOver={e => e.preventDefault()}
                >
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 16v-8m0 0-3 3m3-3 3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                    </svg>
                    <p className="text-sm font-semibold text-gray-500">PDF файл чирч тавих буюу дарж сонгох</p>
                    <p className="text-xs text-gray-400">Зөвхөн .pdf формат</p>
                    <input ref={inputRef} type="file" accept=".pdf" className="hidden"
                        onChange={e => handleFile(e.target.files?.[0])} />
                </div>
            )}

            {(status === 'extracting' || status === 'converting') && (
                <div className="border border-gray-100 rounded-2xl p-8 flex flex-col items-center gap-3 bg-gray-50">
                    <div className="w-8 h-8 border-[3px] border-[#E75234] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-gray-600">{LABELS[status]}</p>
                </div>
            )}

            {status === 'error' && (
                <div className="border border-red-100 bg-red-50 rounded-2xl p-5 flex flex-col gap-2">
                    <p className="text-sm font-bold text-red-600">Алдаа гарлаа</p>
                    <p className="text-xs text-red-500">{error}</p>
                    <button onClick={reset} className="mt-1 text-xs font-semibold text-[#E75234] underline w-fit">
                        Дахин оролдох
                    </button>
                </div>
            )}

            {status === 'editing' && (
                <div className="flex flex-col gap-3">
                    {/* toolbar */}
                    <div className="flex items-center justify-between">
                        <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-semibold">
                            {['edit', 'preview'].map(t => (
                                <button key={t} onClick={() => setTab(t)}
                                    className={`px-4 py-1.5 transition-colors ${tab === t ? 'bg-[#E75234] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                    {t === 'edit' ? 'Засах' : 'Урьдчилан харах'}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={copy}
                                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F5DAC6] text-[#E75234] hover:bg-[#e75234] hover:text-white transition-colors">
                                {copied ? 'Хуулагдлаа ✓' : 'Хуулах'}
                            </button>
                            <button onClick={reset}
                                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                                Шинэ файл
                            </button>
                        </div>
                    </div>

                    {/* edit tab */}
                    {tab === 'edit' && (
                        <textarea
                            className="w-full h-[60vh] font-mono text-xs bg-gray-950 text-green-300 rounded-2xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-[#E75234]"
                            value={latex}
                            onChange={e => setLatex(e.target.value)}
                            spellCheck={false}
                        />
                    )}

                    {/* preview tab */}
                    {tab === 'preview' && (
                        <div
                            className="w-full min-h-[60vh] bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-800 leading-relaxed overflow-auto"
                            dangerouslySetInnerHTML={{ __html: renderLatexToHtml(latex) }}
                        />
                    )}
                </div>
            )}

        </div>
    )
}
