import Anthropic from '@anthropic-ai/sdk'

// Cached as a prompt prefix — billed at ~10% after the first call.
const SYSTEM_PROMPT = `You are a LaTeX converter for Mongolian math exam PDFs (ЭЕШ). Convert the extracted PDF text into clean LaTeX body content only — no \\documentclass, no \\begin{document}.

The input may contain "=== PAGE N ===" markers. Use them only to understand layout; never include them in the output.

ЭЕШ EXAM STRUCTURE:
- Section 1: multiple-choice questions, each with EXACTLY 5 options (А/Б/В/Г/Д or A/B/C/D/E).
- Section 2: "Задгай даалгавар" / "Хоёрдугаар хэсэг" — open-ended fill-in problems (NOT multiple choice).
The two sections are completely separate. Never mix them.

SECTION BOUNDARY:
When Section 2 begins (text like "Хоёрдугаар хэсэг", "Задгай даалгавар", "нөхөх", or the multiple-choice questions end and a new problem style starts), output this EXACT marker on its own line:
%%% ЗАДГАЙ ДААЛГАВАР %%%
Everything after the marker is open-ended — do NOT use \\item or \\begin{enumerate} after it.

SECTION 1 FORMAT (multiple choice):
- Each question: \\section*{N.} on its own line, where N is the question number.
- Question text on the following line(s).
- Options wrapped in \\begin{enumerate} ... \\end{enumerate}, each \\item on its OWN line.
- EXACTLY 5 \\item lines per question — never more, never less.
- If an option is itself an image/diagram, write: \\item % image

SECTION 2 FORMAT (after the marker):
- Preserve the original numbering exactly (e.g. 2.1, 2.2, 2.3 → \\section*{2.1}, \\section*{2.2}, \\section*{2.3}).
- Plain problem paragraphs — no \\begin{enumerate} or \\item.
- NEVER place answer blanks inside the question text. Do not write [a], [b], underscores, boxes, or "Хариу:" inside the sentence. Keep the question text clean and complete.
- After each question, on its OWN line, declare the answer slots the student must fill as: %%% ХАРИУЛТ a, b %%%
  One slot per distinct answer the question asks for (find x and y → a, b; a single answer → a). Name them a, b, c… in order.

ANSWER KEY (if present): output it as-is after everything, e.g. "1-А  2-Б  3-В …".

MATH:
- Keep all Mongolian Cyrillic text exactly as-is.
- Inline math in $...$, display math in $$...$$.
- 3/4 → $\\frac{3}{4}$, x^2 → $x^{2}$, √x → $\\sqrt{x}$.
- π → $\\pi$, α → $\\alpha$, β → $\\beta$, θ → $\\theta$.
- ≤ → $\\leq$, ≥ → $\\geq$, ≠ → $\\neq$, ∞ → $\\infty$.
- sin, cos, tan, log, ln → $\\sin$, $\\cos$, $\\tan$, $\\log$, $\\ln$.

EXAMPLE:
\\section*{35.}
$\\log_{2} 8$ утгыг ол.
\\begin{enumerate}
\\item $2$
\\item $3$
\\item $4$
\\item $6$
\\item $8$
\\end{enumerate}

%%% ЗАДГАЙ ДААЛГАВАР %%%

\\section*{1.}
$a + b = 12$, $ab = 35$ бол $a^{2} + b^{2}$ утгыг ол.
%%% ХАРИУЛТ a %%%

\\section*{2.}
$x^{2} - 5x + 6 = 0$ тэгшитгэлийн шийдүүдийг ол.
%%% ХАРИУЛТ a, b %%%`

// Edge runtime: Vercel streams a Web `Response(ReadableStream)` to the browser
// chunk-by-chunk, instead of buffering a Node `res.write()` body until the end.
// This is what actually keeps the connection alive past the gateway's first-byte
// timeout — the cause of the 504s.
export const config = { runtime: 'edge' }

function jsonError(message, status) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}

export default async function handler(req) {
    if (req.method !== 'POST')
        return jsonError('Method not allowed.', 405)

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    if (!apiKey)
        return jsonError('ANTHROPIC_API_KEY is not set in the deployment environment.', 503)

    let body
    try { body = await req.json() } catch { body = null }
    const text = body?.text
    if (!text || !text.trim())
        return jsonError('Missing "text" in request body.', 400)

    const client  = new Anthropic({ apiKey })
    const encoder = new TextEncoder()

    // Once the stream starts, status is already 200 — failures (auth, billing,
    // rate limit, refusal, max_tokens) are delivered as a trailing %%%ERROR%%%
    // sentinel that the client splits out and surfaces.
    const stream = new ReadableStream({
        async start(controller) {
            try {
                const s = client.messages.stream({
                    model:         'claude-sonnet-4-6',
                    max_tokens:    32000,
                    thinking:      { type: 'adaptive' },
                    output_config: { effort: 'low' },
                    system:   [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
                    messages: [{ role: 'user', content: `Convert this Mongolian math exam PDF text to LaTeX:\n\n${text}` }],
                })

                for await (const event of s) {
                    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta')
                        controller.enqueue(encoder.encode(event.delta.text))
                }

                const message = await s.finalMessage()
                if (message.stop_reason === 'max_tokens')
                    controller.enqueue(encoder.encode('\n\n%%%ERROR%%% The exam was too long to convert in one pass. Try splitting the PDF.'))
                else if (message.stop_reason === 'refusal')
                    controller.enqueue(encoder.encode('\n\n%%%ERROR%%% Claude declined to process this content.'))
            } catch (err) {
                controller.enqueue(encoder.encode(`\n\n%%%ERROR%%% ${err?.message || 'Conversion failed.'}`))
            } finally {
                controller.close()
            }
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type':  'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
        },
    })
}
