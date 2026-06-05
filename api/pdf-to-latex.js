import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a LaTeX converter for Mongolian math exam PDFs (ЭЕШ). I will give you extracted PDF text. Convert it to clean LaTeX body content only (no \\documentclass or \\begin{document}).

STRICT OUTPUT FORMAT — follow exactly:
1. Each question starts with \\section*{N.} on its own line (N = question number)
2. Question text follows on the next line(s)
3. Answer choices use \\begin{enumerate} ... \\end{enumerate} — each \\item on its OWN separate line
4. If answer choices appear to be images/diagrams, output \\item % image for each missing choice
5. Answer key (if present at the bottom): output as-is, e.g. "1-А  2-Б  3-В ..."

MATH RULES:
- Keep all Mongolian Cyrillic text exactly as-is
- Wrap inline math in $...$ and display math in $$...$$
- 3/4 → $\\frac{3}{4}$, x^2 → $x^{2}$, √x → $\\sqrt{x}$
- π → $\\pi$, α → $\\alpha$, β → $\\beta$, θ → $\\theta$
- ≤ → $\\leq$, ≥ → $\\geq$, ≠ → $\\neq$, ∞ → $\\infty$
- sin, cos, tan, log, ln → $\\sin$, $\\cos$, $\\tan$, $\\log$, $\\ln$

EXAMPLE OUTPUT:
\\section*{1.}
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
\\end{enumerate}`

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    if (!process.env.ANTHROPIC_API_KEY)
        return res.status(503).json({ error: 'ANTHROPIC_API_KEY not set.' })

    const { text } = req.body || {}
    if (!text || !text.trim())
        return res.status(400).json({ error: 'Missing text.' })

    try {
        const stream = client.messages.stream({
            model:      'claude-opus-4-8',
            max_tokens: 16000,
            thinking:   { type: 'adaptive' },
            system:     SYSTEM_PROMPT,
            messages: [{
                role:    'user',
                content: `Convert this extracted Mongolian math exam PDF text to LaTeX. Each question must have EXACTLY 5 \\item lines inside \\begin{enumerate}. Put each \\item on its own line.\n\n${text}`,
            }],
        })

        const message = await stream.finalMessage()
        const latex = message.content.find(b => b.type === 'text')?.text

        if (!latex) return res.status(500).json({ error: 'Empty response from Claude.' })

        return res.status(200).json({ latex })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }
