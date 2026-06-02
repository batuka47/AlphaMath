/**
 * parseEysh.js  —  client-side port of scripts/parse-eysh.mjs
 *
 * Pure functions, no Node.js deps. Works in browser and Node.
 *
 * Supports two input formats:
 *   • Texify / plain text (.md, .txt)  — use parseTexifyText(text)
 *   • Surya OCR JSON (.json)           — use parseSuryaJson(jsonString)
 *
 * Both return a plain-text string which is then fed into:
 *   parseQuestions(text) + parseAnswerKey(text)
 */

// ── Character maps ────────────────────────────────────────────────────────────

const CYR_TO_LAT = { А:'A', Б:'B', В:'C', Г:'D', Д:'E' }

function cyrToLat(letter) {
    return CYR_TO_LAT[letter] || letter
}

const OPTION_PATTERNS = [
    /^([АБВГД])[.)]\s+(.+)/,   // Cyrillic: А) text
    /^([A-E])[.)]\s+(.+)/,     // Latin:    A) text
    /^([АБВГД])\s+(.+)/,       // Cyrillic no punct
]

// ── Surya JSON → plain text ───────────────────────────────────────────────────

function suryaHtmlToText(html) {
    // <math>LaTeX</math>  →  $LaTeX$
    let text = html.replace(/<math>([\s\S]*?)<\/math>/gi, (_, latex) => `$${latex.trim()}$`)
    text = text.replace(/<[^>]+>/g, '')
    text = text.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ')
    return text.trim()
}

export function parseSuryaJson(jsonString) {
    const raw = JSON.parse(jsonString)
    const lines = []
    for (const pages of Object.values(raw)) {
        for (const page of pages) {
            const blocks = (page.blocks || [])
                .sort((a, b) => a.reading_order - b.reading_order)
                .map(b => suryaHtmlToText(b.html || ''))
                .filter(Boolean)
            lines.push(...blocks)
        }
    }
    return lines.join('\n')
}

// ── Texify / plain markdown → no-op (already the right format) ───────────────

export function parseTexifyText(text) {
    // Texify already outputs $...$ LaTeX — just normalise line endings
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

// ── Answer key ────────────────────────────────────────────────────────────────

export function parseAnswerKey(text) {
    const key = {}

    // "1-А" / "1.A" / "1) А"
    const re = /\b(\d+)[-.)]\s*([АБВГДA-E])\b/g
    for (const m of text.matchAll(re)) key[m[1]] = cyrToLat(m[2])

    // table rows: "1  А  2  Б ..."
    const tableRe = /\b(\d+)\s+([АБВГДabcdeABCDE])\b/g
    for (const m of text.matchAll(tableRe)) {
        const num = m[1]
        const ans = cyrToLat(m[2].toUpperCase())
        if (!key[num] && ['A','B','C','D','E'].includes(ans)) key[num] = ans
    }

    return key
}

// ── Question parsing ──────────────────────────────────────────────────────────

// Lines to ignore — score annotations, section headers
const SKIP_RE = [
    /^\(?\d+\s*оноо\)?\.?$/i,
    /^(нэгдүгээр|хоёрдугаар|гуравдугаар)\s+хэсэг/i,
    /^хувилбар/i,
    /^математик$/i,
    /^(санамж|зааварчилгаа)/i,
    /^={3,}|^-{3,}/,
]

export function parseQuestions(text) {
    const lines     = text.split('\n').map(l => l.trim()).filter(Boolean)
    const questions = []
    let current     = null
    let curOption   = null

    for (const line of lines) {
        if (SKIP_RE.some(re => re.test(line))) continue

        // Question number + text on SAME line:  "1. question text"
        const qSameLine = line.match(/^(\d+)[.)]\s+(.+)/)
        if (qSameLine && parseInt(qSameLine[1]) <= 50) {
            if (current) questions.push(finalise(current))
            current   = { id: qSameLine[1], text: qSameLine[2], options: {}, answer: '' }
            curOption = null
            continue
        }

        // Question number ALONE on its own line:  "1."  or  "1. "
        // Very common in ЭЕШ PDFs — text is on the following line
        const qAlone = line.match(/^(\d+)[.)]\s*$/)
        if (qAlone && parseInt(qAlone[1]) <= 50) {
            if (current) questions.push(finalise(current))
            current   = { id: qAlone[1], text: '', options: {}, answer: '' }
            curOption = null
            continue
        }

        if (!current) continue

        // Option line
        let matched = false
        for (const pat of OPTION_PATTERNS) {
            const m = line.match(pat)
            if (m) {
                const letter = cyrToLat(m[1])
                if (['A','B','C','D','E'].includes(letter)) {
                    current.options[letter] = m[2]
                    curOption = letter
                    matched   = true
                    break
                }
            }
        }
        if (matched) continue

        // Continuation: append to option or question text
        if (curOption)         current.options[curOption] += ' ' + line
        else if (current.text) current.text += ' ' + line
        else                   current.text = line  // first line after bare question number
    }

    if (current) questions.push(finalise(current))
    return questions
}

function finalise(q) {
    return {
        id:     q.id,
        text:   q.text.trim(),
        labelA: q.options.A || '',
        labelB: q.options.B || '',
        labelC: q.options.C || '',
        labelD: q.options.D || '',
        labelE: q.options.E || '',
        answer: q.answer,
    }
}

// ── Scoring config ────────────────────────────────────────────────────────────

export function getScoringConfig(year, totalQ) {
    const y = parseInt(year)
    if (y >= 2014 && totalQ >= 36) {
        return {
            section1: [
                { from: 1,  to: 8,  points: 1 },
                { from: 9,  to: 28, points: 2 },
                { from: 29, to: 36, points: 3 },
            ],
            section2Points: 5,
        }
    }
    if (y >= 2014) {
        return { section1: [{ from: 1, to: totalQ, points: 2 }], section2Points: 5 }
    }
    return { section1: [{ from: 1, to: totalQ, points: 3 }], section2Points: 5 }
}

// ── Build the full JS file content ───────────────────────────────────────────

export function buildTaskFile(year, variant, questions, answerKey) {
    const id   = String(parseInt(year) - 2006)
    const name = `task${year}${variant}`

    questions.forEach(q => { q.answer = answerKey[q.id] || '' })

    const obj = {
        id,
        variant,
        scoring:       getScoringConfig(year, questions.length),
        problem:       questions,
        secondProblem: [],
    }

    return [
        `// ЭЕШ Математик ${year} он — ${variant} хувилбар`,
        `// Auto-parsed from Texify output. Review NEEDS_IMAGE questions.`,
        ``,
        `const ${name} = ${JSON.stringify(obj, null, 4)};`,
        ``,
        `export default ${name};`,
    ].join('\n')
}

// ── Stats helper ──────────────────────────────────────────────────────────────

export function calcStats(questions) {
    return {
        total:          questions.length,
        hasAnswers:     questions.filter(q => q.answer).length,
        missingAnswers: questions.filter(q => !q.answer).length,
        needsImage:     questions.filter(q => !q.labelA && !q.labelB).length,
    }
}
