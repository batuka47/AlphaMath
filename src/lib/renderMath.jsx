import katex from 'katex'
import 'katex/dist/katex.min.css'

function KaTeXSpan({ latex, display }) {
    const html = katex.renderToString(latex, { throwOnError: false, displayMode: display })
    return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// Split "some text $\frac{a}{b}$ more text" into rendered React segments.
export function renderLatex(text) {
    if (!text) return null
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g)
    return parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$'))
            return <KaTeXSpan key={i} latex={part.slice(2, -2)} display={true} />
        if (part.startsWith('$') && part.endsWith('$'))
            return <KaTeXSpan key={i} latex={part.slice(1, -1)} display={false} />
        return part
    })
}
