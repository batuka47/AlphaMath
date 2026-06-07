import Anthropic from '@anthropic-ai/sdk'

// Support both ANTHROPIC_API_KEY and CLAUDE_API_KEY env var names
const getClient = () => new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
})

// Marked for caching — charged at 10% after the first call
const SYSTEM_PROMPT = `You are a LaTeX converter for Mongolian math exam PDFs (ЭЕШ). I will give you extracted PDF text. Convert it to clean LaTeX body content only (no \\documentclass or \\begin{document}).

The input has page markers (=== PAGE N ===). Use them to identify which page a figure appears on.

CRITICAL RULES (repeat every response):
1. Section 1 questions 1–36: EXACTLY 5 \\item lines each — never more, never less.
2. Questions with diagrams: output % figure: page N immediately after \\section*{Q.}
3. When Section 2 starts: output %%% ЗАДГАЙ ДААЛГАВАР %%% and NEVER use \\item after it.

ЭЕШ EXAM STRUCTURE — critical to get right:
- Section 1: Questions 1–36, each with EXACTLY 5 multiple-choice options (А/Б/В/Г/Д or A/B/C/D/E)
- Section 2: "Задгай даалгавар" / "Хоёрдугаар хэсэг" — open-ended fill-in problems (NOT multiple choice)
  These two sections are COMPLETELY SEPARATE. Never mix them.

FIGURE DETECTION — very important:
When a question references a visual (diagram, graph, geometric figure, coordinate plane, etc.):
- Find the PDF page number where it appears (use the "=== PAGE N ===" markers in the input text)
- Output % figure: page N on a NEW line immediately after \\section*{questionNumber.}
Example:
\\section*{7.}
% figure: page 2
Зурагт үзүүлсэн гурвалжны талбайг ол.

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
- PRESERVE the original numbering exactly — if the PDF uses 2.1, 2.2, 2.3, 2.4 then output \\section*{2.1}, \\section*{2.2}, \\section*{2.3}, \\section*{2.4}
- Convert ALL math to LaTeX: $\\frac{a}{b}$, $\\sqrt{x}$, etc.
- Keep Mongolian text exactly as-is
- For fill-in-blank slots in the original (blanks, boxes, underscores): write them as [a], [b], [c] etc. in order
- If a problem has multiple sub-answers (e.g. find x and y), mark each blank [a], [b] in order
- Do NOT use \\begin{enumerate} or \\item — just problem text paragraphs

ANSWER KEY (if present): output as-is after everything, e.g. "1-А  2-Б  3-В ..."

MATH RULES:
- Keep all Mongolian Cyrillic text exactly as-is
- Wrap inline math in $...$ and display math in $$...$$
- 3/4 → $\\frac{3}{4}$, x^2 → $x^{2}$, √x → $\\sqrt{x}$
- π → $\\pi$, α → $\\alpha$, β → $\\beta$, θ → $\\theta$
- ≤ → $\\leq$, ≥ → $\\geq$, ≠ → $\\neq$, ∞ → $\\infty$
- sin, cos, tan, log, ln → $\\sin$, $\\cos$, $\\tan$, $\\log$, $\\ln$

FULL EXAMPLE OUTPUT:
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
% figure: page 3
Зурагт үзүүлсэн гурвалжны талбайг ол.
\\begin{enumerate}
\\item $8$
\\item $9$
\\item $10$
\\item $11$
\\item $12$
\\end{enumerate}

%%% ЗАДГАЙ ДААЛГАВАР %%%

\\section*{1.}
$a + b = 12$, $ab = 35$ бол $a^{2} + b^{2}$ утгыг ол. Хариу: [a]

\\section*{2.}
$x^{2} - 5x + 6 = 0$ тэгшитгэлийн шийдүүд $x_1 = $ [a] ба $x_2 = $ [b]`

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    if (!apiKey)
        return res.status(503).json({ error: 'ANTHROPIC_API_KEY (or CLAUDE_API_KEY) not set.' })

    const { text } = req.body || {}
    if (!text || !text.trim())
        return res.status(400).json({ error: 'Missing text.' })

    try {
        const client = getClient()
        // 32K gives adaptive thinking room to reason AND still emit a full exam's
        // worth of LaTeX. 10K could be entirely consumed by thinking on a long PDF,
        // leaving no text block (which looked like "no response").
        const stream = client.messages.stream({
            model:      'claude-sonnet-4-6',
            max_tokens: 32000,
            // Sonnet 4.6 is ~2–3× faster than Opus — keeps a full exam under
            // Vercel's function timeout. Low effort: extraction is mechanical,
            // so deep thinking only adds latency.
            thinking:      { type: 'adaptive' },
            output_config: { effort: 'low' },
            // Cache the system prompt — 90% cheaper on repeated calls
            system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
            messages: [{
                role:    'user',
                content: `Convert this Mongolian math exam PDF text to LaTeX:\n\n${text}`,
            }],
        })

        const message = await stream.finalMessage()
        const latex = message.content.find(b => b.type === 'text')?.text

        if (!latex) {
            // No text block — tell the caller *why* instead of a blank 500
            if (message.stop_reason === 'max_tokens')
                return res.status(500).json({
                    error: 'Claude hit the token limit before finishing. The PDF may be too large — try splitting it.',
                })
            if (message.stop_reason === 'refusal')
                return res.status(500).json({ error: 'Claude declined to process this content.' })
            return res.status(500).json({ error: `Empty response from Claude (stop_reason: ${message.stop_reason}).` })
        }

        return res.status(200).json({ latex })
    } catch (err) {
        // Surface the real cause — these are the things that "suddenly" break a working integration
        console.error('pdf-to-latex error:', err.status, err.name, err.message)

        if (err instanceof Anthropic.AuthenticationError)
            return res.status(401).json({ error: 'Anthropic API key is invalid or revoked. Check CLAUDE_API_KEY in Vercel env settings.' })
        if (err instanceof Anthropic.PermissionDeniedError)
            return res.status(403).json({ error: `Anthropic rejected the request (${err.type || 'permission_error'}). This is often a billing/credit problem — check your balance and spend limits in the Anthropic Console.` })
        if (err instanceof Anthropic.RateLimitError)
            return res.status(429).json({ error: 'Rate limited by Anthropic. Wait a moment and retry — low usage tiers have tight Opus limits.' })
        if (err instanceof Anthropic.BadRequestError)
            return res.status(400).json({ error: `Anthropic rejected the request: ${err.message}` })

        return res.status(500).json({ error: err.message || 'Conversion failed.' })
    }
}

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }
