const SYSTEM_PROMPT = `You are a LaTeX converter for Mongolian math exam PDFs. I will give you extracted PDF text. Convert it to LaTeX body content only (no \\documentclass or \\begin{document}).

Rules:
- Keep all Mongolian Cyrillic text exactly as-is
- Wrap inline math in $...$ and display math in $$...$$
- 3/4 → $\\frac{3}{4}$
- x^2 → $x^{2}$
- √x → $\\sqrt{x}$
- π → $\\pi$, α → $\\alpha$, β → $\\beta$
- ≤ → $\\leq$, ≥ → $\\geq$, ≠ → $\\neq$, ∞ → $\\infty$
- sin, cos, tan, log, ln → $\\sin$, $\\cos$, $\\tan$, $\\log$, $\\ln$
- Question numbers like "1." or "Даалгавар 1" → \\section*{1.}
- Answer choices A) B) C) D) → \\begin{enumerate} with \\item`

const GEMINI_MODEL = 'gemini-2.0-flash'

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    if (!process.env.GEMINI_API_KEY)
        return res.status(503).json({ error: 'GEMINI_API_KEY not set.' })

    const { text } = req.body || {}
    if (!text || !text.trim())
        return res.status(400).json({ error: 'Missing text.' })

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`

        const response = await fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: [{
                    role:  'user',
                    parts: [{ text: `Convert this extracted PDF text to LaTeX:\n\n${text}` }],
                }],
                generationConfig: { maxOutputTokens: 4096 },
            }),
        })

        const data = await response.json()

        if (!response.ok)
            return res.status(500).json({ error: data.error?.message || 'Gemini API error' })

        const latex = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!latex) return res.status(500).json({ error: 'Empty response from Gemini.' })

        return res.status(200).json({ latex })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }
