import { useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const PLACEHOLDER = `% Write LaTeX here and see it rendered live

$x^2 - 5x + 6 = 0$ тэгшитгэлийн шийдүүдийн нийлбэр хэд вэ?

$$\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}$$

$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$`

function renderMath(text) {
    if (!text) return null
    const lines = text.split('\n')
    return lines.map((line, lineIdx) => {
        if (line.trim().startsWith('%')) {
            return <div key={lineIdx} className="text-gray-400 text-xs italic">{line}</div>
        }
        if (!line.trim()) {
            return <div key={lineIdx} className="h-3" />
        }
        const parts = line.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g)
        const rendered = parts.map((part, i) => {
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
        return <div key={lineIdx} className="leading-relaxed">{rendered}</div>
    })
}

export default function AdminLatex() {
    const [src, setSrc] = useState('')

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
                <div>
                    <h1 className="text-lg font-extrabold text-gray-900">LaTeX Editor</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Use <code className="bg-gray-100 px-1 rounded">$…$</code> for inline math,{' '}
                        <code className="bg-gray-100 px-1 rounded">$$…$$</code> for display math
                    </p>
                </div>
                {src && (
                    <button
                        onClick={() => setSrc('')}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Editor */}
                <div className="w-1/2 flex flex-col border-r border-gray-100">
                    <div className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                        Input
                    </div>
                    <textarea
                        value={src}
                        onChange={e => setSrc(e.target.value)}
                        placeholder={PLACEHOLDER}
                        spellCheck={false}
                        className="flex-1 w-full resize-none font-mono text-sm text-gray-800 bg-white px-5 py-4 focus:outline-none placeholder:text-gray-300"
                    />
                </div>

                {/* Preview */}
                <div className="w-1/2 flex flex-col overflow-hidden">
                    <div className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                        Preview
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-800 leading-relaxed">
                        {src.trim()
                            ? renderMath(src)
                            : <p className="text-gray-300 text-sm italic">Start typing to see the preview…</p>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
