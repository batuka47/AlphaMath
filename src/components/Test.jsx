import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import parse, { domToReact } from 'html-react-parser'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import RadioButton from './RadioBtn'

// ── KaTeX renderer (for LaTeX strings like $\frac{1}{2}$) ────────────────────
function KaTeXSpan({ latex, display }) {
    const html = katex.renderToString(latex, { throwOnError: false, displayMode: display })
    return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// Split "some text $\frac{a}{b}$ more text" into rendered segments
function renderLatex(text) {
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g)
    return parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$'))
            return <KaTeXSpan key={i} latex={part.slice(2, -2)} display={true} />
        if (part.startsWith('$') && part.endsWith('$'))
            return <KaTeXSpan key={i} latex={part.slice(1, -1)} display={false} />
        return part
    })
}

// ── Math inline fix ───────────────────────────────────────────────────────────
function injectMathCSS() {
    const id = 'alphamath-math-fix'
    if (document.getElementById(id)) return
    const s = document.createElement('style')
    s.id = id
    s.textContent = `
        /* Force all non-table MathML to inline */
        math, mrow, msub, msup, msubsup, munder, mover, munderover,
        mi, mn, mo, ms, mtext, mspace, msqrt, mroot,
        mpadded, mphantom, merror, mlabeledtr {
            display: inline !important;
            vertical-align: middle !important;
        }
        /* Fractions need inline-table so numerator/denominator stack */
        mfrac {
            display: inline-table !important;
            vertical-align: middle !important;
        }
        mfrac > * {
            display: block !important;
            text-align: center !important;
        }
        /* mtable for systems of equations — keep table layout */
        mtable {
            display: inline-table !important;
            vertical-align: middle !important;
        }
        mtr {
            display: table-row !important;
        }
        mtd {
            display: table-cell !important;
            padding: 1px 4px !important;
        }
    `
    document.head.appendChild(s)
}

const mathParseOptions = {}
mathParseOptions.replace = (node) => {
    if (node.type === 'tag' && node.name === 'math') {
        // eslint-disable-next-line no-unused-vars
        const { className: _cls, ...attribs } = node.attribs || {}
        return (
            <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <math {...attribs} display="inline">
                    {domToReact(node.children || [], mathParseOptions)}
                </math>
            </span>
        )
    }
}

function safeParse(html) {
    if (!html) return null
    // LaTeX path: contains $...$ delimiters (Surya/Texify output)
    if (html.includes('$')) return renderLatex(html)
    // MathML path: contains <math> tags (existing files)
    if (html.includes('<')) return parse(html, mathParseOptions)
    // Plain text
    return html
}
// ─────────────────────────────────────────────────────────────────────────────

function BookmarkIcon({ filled }) {
    return filled ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#E75234">
            <path d="M5 2a2 2 0 0 0-2 2v17l9-4 9 4V4a2 2 0 0 0-2-2H5z"/>
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <path d="M5 2a2 2 0 0 0-2 2v17l9-4 9 4V4a2 2 0 0 0-2-2H5z"/>
        </svg>
    )
}

function Test(props) {
    useEffect(() => { injectMathCSS() }, [])

    const [selectedValue, setSelectedValue] = useState(props.selectedAnswer || '')
    const imageRef = useRef(null)

    useEffect(() => {
        setSelectedValue(props.selectedAnswer || '')
    }, [props.selectedAnswer])

    const handleChange = (e) => {
        const v = e.target.value
        setSelectedValue(v)
        props.onAnswerSelect(props.id, v)
    }

    const questionHeader = (
        <div className="flex items-start justify-between gap-2 mb-4">
            <div className="font-semibold text-lg leading-loose flex-1">
                <span className="mr-2 text-gray-500">{props.id}.</span>
                {safeParse(props.text)}
            </div>
            {props.onBookmark && (
                <button
                    onClick={() => props.onBookmark(props.id, props.text)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors mt-0.5"
                    title={props.isBookmarked ? 'Хадгалсан' : 'Хадгалах'}
                >
                    <BookmarkIcon filled={props.isBookmarked} />
                </button>
            )}
        </div>
    )

    const mobileHeader = (
        <div className="flex items-start justify-between gap-2 mb-3">
            <div className="font-semibold text-base leading-relaxed flex-1">
                <span className="mr-1 text-gray-500">{props.id}.</span>
                {safeParse(props.text)}
            </div>
            {props.onBookmark && (
                <button
                    onClick={() => props.onBookmark(props.id, props.text)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors mt-0.5"
                    title={props.isBookmarked ? 'Хадгалсан' : 'Хадгалах'}
                >
                    <BookmarkIcon filled={props.isBookmarked} />
                </button>
            )}
        </div>
    )

    return (
        <div className="w-full mt-10 border-b border-gray-100 pb-6">

            {/* ── Desktop: side-by-side row ── */}
            <div className="hidden lg:flex lg:flex-row lg:gap-4">

                {/* Left 3/4 — question number + text + options */}
                <div className="w-3/4">
                    {questionHeader}
                    <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 mt-3">
                        {['A','B','C','D','E'].map(letter => (
                            <RadioButton
                                key={letter}
                                value={letter}
                                label={safeParse(props[`label${letter}`])}
                                checked={selectedValue === letter}
                                onChange={handleChange}
                            />
                        ))}
                    </div>
                </div>

                {/* Right 1/4 — image column (always present, empty if no image) */}
                <div className="w-1/4 flex items-start justify-center pt-1">
                    {props.img && (
                        <img
                            ref={imageRef}
                            src={props.img}
                            className="w-full h-auto object-contain max-h-48"
                            alt=""
                        />
                    )}
                </div>
            </div>

            {/* ── Mobile: stacked column ── */}
            <div className="flex flex-col lg:hidden">
                {mobileHeader}

                {/* Image — full width on mobile */}
                {props.img && (
                    <div className="w-full mb-4">
                        <img
                            src={props.img}
                            className="w-full h-auto object-contain max-h-56"
                            alt=""
                        />
                    </div>
                )}

                {/* Options — stacked on mobile */}
                <div className="flex flex-col gap-1">
                    {['A','B','C','D','E'].map(letter => (
                        <RadioButton
                            key={letter}
                            value={letter}
                            label={safeParse(props[`label${letter}`])}
                            checked={selectedValue === letter}
                            onChange={handleChange}
                        />
                    ))}
                </div>
            </div>

        </div>
    )
}

Test.propTypes = {
    id:             PropTypes.string.isRequired,
    text:           PropTypes.string,
    img:            PropTypes.string,
    labelA:         PropTypes.string,
    labelB:         PropTypes.string,
    labelC:         PropTypes.string,
    labelD:         PropTypes.string,
    labelE:         PropTypes.string,
    selectedAnswer: PropTypes.string,
    onAnswerSelect: PropTypes.func.isRequired,
    isBookmarked:   PropTypes.bool,
    onBookmark:     PropTypes.func,
}

Test.defaultProps = {
    text: '', img: '',
    labelA: '', labelB: '', labelC: '', labelD: '', labelE: '',
    selectedAnswer: '',
    isBookmarked: false,
    onBookmark: null,
}

export default Test