import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a LaTeX converter for Mongolian math exam PDFs (ЭЕШ). I will give you extracted PDF text. Convert it to clean LaTeX body content only (no \\documentclass or \\begin{document}).

ЭЕШ EXAM STRUCTURE — critical to get right:
- Section 1: Questions 1–36, each with EXACTLY 5 multiple-choice options (А/Б/В/Г/Д or A/B/C/D/E)
- Section 2: "Задгай даалгавар" / "Хоёрдугаар хэсэг" — open-ended fill-in problems (NOT multiple choice)
  These two sections are COMPLETELY SEPARATE. Never mix them.

SECTION BOUNDARY RULE — most important:
When you see text like "Хоёрдугаар хэсэг", "ЗАДГАЙ ДААЛГАВАР", "нөхөх", or question 36 ends and a new problem style begins:
Output this EXACT marker on its own line (nothing else on that line):
%%% ЗАДГАЙ ДААЛГАВАР %%%

Everything AFTER that marker is open-ended content — do NOT use \\item or \\begin{enumerate} after it.

SECTION 1 FORMAT (questions 1–36):
1. Each question: \\section*{N.} on its own line
2. Question text on the next line(s)
3. Answer choices: \\begin{enumerate} ... \\end{enumerate} with each \\item on its OWN separate line
4. Each question has EXACTLY 5 \\item lines — no more, no less
5. If a choice is an image/diagram: \\item % image

SECTION 2 FORMAT (after the %%% ЗАДГАЙ ДААЛГАВАР %%% marker):
Use \\section*{N.} for each open-ended problem number, then output the problem text as-is.
Do NOT use \\begin{enumerate} or \\item for section 2.

ANSWER KEY (if present): output as-is after everything, e.g. "1-А  2-Б  3-В ..."

MATH RULES:
- Keep all Mongolian Cyrillic text exactly as-is
- Wrap inline math in $...$ and display math in $$...$$
- 3/4 → $\\frac{3}{4}$, x^2 → $x^{2}$, √x → $\\sqrt{x}$
- π → $\\pi$, α → $\\alpha$, β → $\\beta$, θ → $\\theta$
- ≤ → $\\leq$, ≥ → $\\geq$, ≠ → $\\neq$, ∞ → $\\infty$
- sin, cos, tan, log, ln → $\\sin$, $\\cos$, $\\tan$, $\\log$, $\\ln$

EXAMPLE OUTPUT:
\\section*{35.}
$\\log_{2} 8$ утгыг ол.
\\begin{enumerate}
\\item $2$
\\item $3$
\\item $4$
\\item $6$
\\item $8$
\\end{enumerate}

\\section*{36.}
$f(x) = x^{2} + 1$ функцийн $f(3)$ утгыг ол.
\\begin{enumerate}
\\item $8$
\\item $9$
\\item $10$
\\item $11$
\\item $12$
\\end{enumerate}

%%% ЗАДГАЙ ДААЛГАВАР %%%

\\section*{1.}
$a + b = 12$, $ab = 35$ бол $a^{2} + b^{2}$ утгыг ол.`

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
                content: `Convert this extracted Mongolian math exam PDF text to LaTeX.\n\nCRITICAL: Section 1 has questions 1–36 with EXACTLY 5 \\\\item lines each. When Section 2 (Задгай даалгавар / Хоёрдугаар хэсэг) begins, output the line:\n%%% ЗАДГАЙ ДААЛГАВАР %%%\nand NEVER use \\\\item after that marker.\n\n${text}`,
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
