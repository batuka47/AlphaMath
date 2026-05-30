/**
 * extract-eysh.mjs
 *
 * Usage:
 *   node scripts/extract-eysh.mjs --pdf path/to/combined.pdf --discover
 *     → reads the PDF, outputs scripts/manifest.json with page ranges per test
 *
 *   node scripts/extract-eysh.mjs --pdf path/to/combined.pdf --year 2024 --variant C
 *     → extracts questions for that test and writes src/datas/years/task2024C.js
 *
 *   node scripts/extract-eysh.mjs --pdf path/to/combined.pdf --all
 *     → processes every test listed in manifest.json that is still a stub
 *
 * Requires: ANTHROPIC_API_KEY env var
 */

import Anthropic from '@anthropic-ai/sdk';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const YEARS_DIR = path.join(ROOT, 'src', 'datas', 'years');
const MANIFEST  = path.join(__dirname, 'manifest.json');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── helpers ──────────────────────────────────────────────────────────────────

function yearToId(year) {
    return String(parseInt(year) - 2006);
}

function stubCount(year, variant) {
    const file = path.join(YEARS_DIR, `task${year}${variant}.js`);
    if (!fs.existsSync(file)) return 0;
    const content = fs.readFileSync(file, 'utf8');
    return (content.match(/id:\s*["']\d+["']/g) || []).length;
}

async function extractPageRange(pdfBytes, startPage, endPage) {
    const src    = await PDFDocument.load(pdfBytes);
    const newDoc = await PDFDocument.create();
    const total  = src.getPageCount();
    const from   = Math.max(0, startPage - 1);
    const to     = Math.min(total - 1, endPage - 1);
    const indices = [];
    for (let i = from; i <= to; i++) indices.push(i);
    const copied = await newDoc.copyPages(src, indices);
    copied.forEach(p => newDoc.addPage(p));
    return Buffer.from(await newDoc.save());
}

// ── discovery prompt ─────────────────────────────────────────────────────────

const DISCOVERY_PROMPT = `
This PDF contains Mongolian math exam (ЭЕШ Математик) tests across multiple years and variants (A, B, C, D).

Scan the full document and return ONLY a JSON array with no extra text, like:
[
  { "year": "2006", "variant": "A", "startPage": 1, "endPage": 10 },
  { "year": "2006", "variant": "B", "startPage": 11, "endPage": 20 },
  ...
]

Rules:
- Each entry is one exam (year + variant).
- startPage and endPage are 1-indexed page numbers in this PDF.
- Include all exams you can find.
- Return ONLY the JSON array. No markdown, no explanation.
`;

// ── extraction prompt ─────────────────────────────────────────────────────────

function buildExtractionPrompt(year, variant) {
    const id = yearToId(year);
    return `
This PDF contains the ЭЕШ Математик (Mongolian college entrance math exam) ${year} year, variant ${variant}.

Extract ALL questions from Section 1 (multiple choice, сонгох даалгавар) and Section 2 (fill-in, нөхөх тест) if present.

Return ONLY a valid JavaScript object literal (no import/export, no variable declaration, no markdown fences) matching this exact structure:

{
  id: "${id}",
  variant: "${variant}",
  scoring: {
    section1: [
      { from: 1, to: 8,  points: 1 },
      { from: 9, to: 28, points: 2 },
      { from: 29, to: 36, points: 3 }
    ],
    section2Points: 5
  },
  problem: [
    {
      id: "1",
      text: "Question text here",
      labelA: "option A text",
      labelB: "option B text",
      labelC: "option C text",
      labelD: "option D text",
      labelE: "option E text",
      answer: "A"
    }
  ],
  secondProblem: []
}

Rules:
- For math formulas use MathML inline: <math class="font-semibold text-xl">...</math>
- If a question has a diagram/image that you cannot reproduce as text, add img: "NEEDS_IMAGE" to that question object and describe the image briefly in a comment field: imgDesc: "brief description".
- Section 2 (нөхөх тест) problems go in secondProblem array. Each has: id, text (problem statement), and letter fields a/b/c... with their correct answers.
- The scoring block should reflect the actual scoring for this year. Pre-2014 exams often use different scoring (e.g. all 3pts). Adjust accordingly.
- Return ONLY the object literal. No extra text, no markdown.
`;
}

// ── write output file ─────────────────────────────────────────────────────────

function writeTaskFile(year, variant, objLiteral) {
    const name    = `task${year}${variant}`;
    const outPath = path.join(YEARS_DIR, `${name}.js`);

    const content = `// ЭЕШ Математик ${year} он — ${variant} хувилбар
// Auto-extracted. Review image questions marked NEEDS_IMAGE.

const ${name} = ${objLiteral};

export default ${name};
`;
    fs.writeFileSync(outPath, content, 'utf8');
    console.log(`  ✅ Written: ${outPath}`);
    // Count image placeholders
    const needsImage = (content.match(/NEEDS_IMAGE/g) || []).length;
    if (needsImage > 0) {
        console.log(`  ⚠️  ${needsImage} question(s) need manual image files`);
    }
}

// ── Claude API calls ──────────────────────────────────────────────────────────

async function callClaude(pdfBuffer, prompt) {
    const b64 = pdfBuffer.toString('base64');
    const res = await client.messages.create({
        model:      'claude-opus-4-8',
        max_tokens: 8192,
        messages: [{
            role: 'user',
            content: [
                {
                    type:   'document',
                    source: { type: 'base64', media_type: 'application/pdf', data: b64 }
                },
                { type: 'text', text: prompt }
            ]
        }]
    });
    return res.content[0].text.trim();
}

// ── commands ──────────────────────────────────────────────────────────────────

async function discover(pdfPath) {
    console.log('📖 Reading PDF…');
    const pdfBytes = fs.readFileSync(pdfPath);
    console.log('🔍 Asking Claude to map all tests…');
    const raw = await callClaude(pdfBytes, DISCOVERY_PROMPT);

    let manifest;
    try {
        manifest = JSON.parse(raw);
    } catch {
        console.error('Failed to parse manifest JSON. Raw response:');
        console.error(raw);
        process.exit(1);
    }

    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`\n✅ Manifest saved to scripts/manifest.json (${manifest.length} tests found)`);
    manifest.forEach(e => {
        const count = stubCount(e.year, e.variant);
        const status = count >= 36 ? '✅ full' : count >= 5 ? `⚠️  partial(${count})` : '❌ stub';
        console.log(`   ${e.year}${e.variant}  pages ${e.startPage}–${e.endPage}  ${status}`);
    });
}

async function extractOne(pdfPath, year, variant, pageRange) {
    console.log(`\n⬇️  Extracting ${year}${variant}…`);
    const pdfBytes = fs.readFileSync(pdfPath);

    let workingBuffer = pdfBytes;
    if (pageRange) {
        const [from, to] = pageRange.split('-').map(Number);
        console.log(`   Slicing pages ${from}–${to}`);
        workingBuffer = await extractPageRange(pdfBytes, from, to);
    } else if (fs.existsSync(MANIFEST)) {
        const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
        const entry = manifest.find(e => e.year === String(year) && e.variant === variant);
        if (entry) {
            console.log(`   Using manifest pages ${entry.startPage}–${entry.endPage}`);
            workingBuffer = await extractPageRange(pdfBytes, entry.startPage, entry.endPage);
        }
    }

    const prompt  = buildExtractionPrompt(year, variant);
    const rawObj  = await callClaude(workingBuffer, prompt);
    writeTaskFile(year, variant, rawObj);
}

async function extractAll(pdfPath) {
    if (!fs.existsSync(MANIFEST)) {
        console.error('No manifest.json found. Run --discover first.');
        process.exit(1);
    }
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    const toProcess = manifest.filter(e => stubCount(e.year, e.variant) < 5);

    console.log(`\n📋 ${toProcess.length} stubs/partials to fill out of ${manifest.length} total`);
    for (const entry of toProcess) {
        await extractOne(pdfPath, entry.year, entry.variant,
            `${entry.startPage}-${entry.endPage}`);
        // small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1500));
    }
    console.log('\n🎉 Done!');
}

// ── main ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get  = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const has  = (flag) => args.includes(flag);

const pdfPath = get('--pdf');
if (!pdfPath) {
    console.error('Usage: node scripts/extract-eysh.mjs --pdf <file.pdf> [--discover | --year YYYY --variant X | --all]');
    process.exit(1);
}
if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Set ANTHROPIC_API_KEY env var first.');
    process.exit(1);
}

if (has('--discover')) {
    await discover(pdfPath);
} else if (has('--all')) {
    await extractAll(pdfPath);
} else {
    const year    = get('--year');
    const variant = get('--variant');
    const pages   = get('--pages');
    if (!year || !variant) {
        console.error('Provide --year and --variant, or use --discover / --all');
        process.exit(1);
    }
    await extractOne(pdfPath, year, variant, pages);
}
