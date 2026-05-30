/**
 * parse-eysh.mjs  —  ЭЕШ question extractor (two modes)
 *
 * ── Mode 1: plain PDF (pdf-parse, no cost) ───────────────────────────────────
 *   node scripts/parse-eysh.mjs --pdf <file> --dump
 *     → raw text → scripts/extracted.txt  (inspect before parsing)
 *
 *   node scripts/parse-eysh.mjs --pdf <file> --year 2024 --variant C
 *   node scripts/parse-eysh.mjs --pdf <file> --all
 *
 * ── Mode 2: Surya OCR output (math-aware, free & local) ─────────────────────
 *   1. pip install surya-ocr
 *   2. surya_ocr eysh.pdf --output_dir scripts/surya_output/
 *   3. node scripts/parse-eysh.mjs --surya scripts/surya_output/results.json --year 2024 --variant C
 *      node scripts/parse-eysh.mjs --surya scripts/surya_output/results.json --all
 */

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function pdfParse(buf) {
    const doc  = await pdfjsLib.getDocument({ data: new Uint8Array(buf), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
    let text = '';
    for (let i = 1; i <= doc.numPages; i++) {
        const page    = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return { text, numpages: doc.numPages };
}
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const YEARS_DIR = path.join(ROOT, 'src', 'datas', 'years');

// ── Mappings ──────────────────────────────────────────────────────────────────

// Mongolian Cyrillic option letters → Latin A-E
const CYR_TO_LAT = { 'А':'A','Б':'B','В':'C','Г':'D','Д':'E' };

// All possible answer-option line prefixes the PDF might use
const OPTION_PATTERNS = [
    /^([АБВГД])[.)]\s+(.+)/,   // Cyrillic: А) text
    /^([A-E])[.)]\s+(.+)/,      // Latin: A) text
    /^([АБВГД])\s+(.+)/,        // Cyrillic no punctuation
];

const LABEL_MAP = { A:'labelA', B:'labelB', C:'labelC', D:'labelD', E:'labelE' };

function cyrToLat(letter) {
    return CYR_TO_LAT[letter] || letter;
}

// ── PDF text extraction ───────────────────────────────────────────────────────

async function extractText(pdfPath) {
    const buf  = fs.readFileSync(pdfPath);
    const data = await pdfParse(buf);
    return data.text;
}


// ── Text → test sections ──────────────────────────────────────────────────────

// Try to split the combined PDF text into sections per year/variant.
// Looks for headers like "2024 он, А хувилбар" or "МАТЕМАТИК 2024 A"
function splitIntoTests(fullText) {
    // Match lines like:  "2024 он А хувилбар"  /  "Математик 2024 он, А хувилбар"
    const headerRe = /(\d{4})\s+он[,\s]+([ABCDАБВГ])\s+хувилбар/gi;
    const matches  = [...fullText.matchAll(headerRe)];

    if (matches.length === 0) {
        // Fallback: try "2024 A" style
        const altRe = /математик\s+(\d{4})\s+([A-Dа-дАБВГ])/gi;
        const alt   = [...fullText.matchAll(altRe)];
        if (alt.length > 0) {
            return alt.map((m, i) => ({
                year:    m[1],
                variant: cyrToLat(m[2].toUpperCase()),
                text:    fullText.slice(m.index, alt[i+1]?.index ?? fullText.length),
            }));
        }
        return null; // couldn't auto-split
    }

    return matches.map((m, i) => ({
        year:    m[1],
        variant: cyrToLat(m[2].toUpperCase()),
        text:    fullText.slice(m.index, matches[i+1]?.index ?? fullText.length),
    }));
}

// ── Answer key extraction ─────────────────────────────────────────────────────

// Looks for a block like:  "1-А  2-В  3-Б ..." or "1.A  2.B  ..."
function parseAnswerKey(text) {
    const key = {};

    // Pattern: "1-А" or "1.A" or "1) А"
    const re = /\b(\d+)[-.)]\s*([АБВГДA-E])\b/g;
    for (const m of text.matchAll(re)) {
        key[m[1]] = cyrToLat(m[2]);
    }

    // Also look for table rows:  "1  А  2  Б  3  В ..."
    const tableRe = /\b(\d+)\s+([АБВГДabcdeABCDE])\b/g;
    for (const m of text.matchAll(tableRe)) {
        const num = m[1];
        const ans = cyrToLat(m[2].toUpperCase());
        if (!key[num] && ['A','B','C','D','E'].includes(ans)) {
            key[num] = ans;
        }
    }

    return key;
}

// ── Question block parsing ────────────────────────────────────────────────────

function parseQuestions(text) {
    const lines     = text.split('\n').map(l => l.trim()).filter(Boolean);
    const questions = [];
    let   current   = null;
    let   curOption = null;

    for (const line of lines) {
        // New question: starts with a number followed by . or )
        const qMatch = line.match(/^(\d+)[.)]\s+(.+)/);
        if (qMatch && parseInt(qMatch[1]) <= 50) {
            if (current) questions.push(finalise(current));
            current   = { id: qMatch[1], text: qMatch[2], options: {}, answer: '' };
            curOption = null;
            continue;
        }

        if (!current) continue;

        // Option line
        let matched = false;
        for (const pat of OPTION_PATTERNS) {
            const m = line.match(pat);
            if (m) {
                const letter = cyrToLat(m[1]);
                if (['A','B','C','D','E'].includes(letter)) {
                    current.options[letter] = m[2];
                    curOption = letter;
                    matched = true;
                    break;
                }
            }
        }
        if (matched) continue;

        // Continuation of current option or question text
        if (curOption) {
            current.options[curOption] += ' ' + line;
        } else if (current.text) {
            current.text += ' ' + line;
        }
    }

    if (current) questions.push(finalise(current));
    return questions;
}

function finalise(q) {
    return {
        id:     q.id,
        text:   q.text.trim(),
        labelA: q.options['A'] || '',
        labelB: q.options['B'] || '',
        labelC: q.options['C'] || '',
        labelD: q.options['D'] || '',
        labelE: q.options['E'] || '',
        answer: q.answer,
    };
}

// ── Scoring config by year ───────────────────────────────────────────────────

function getScoringConfig(year, totalQ) {
    const y = parseInt(year);
    if (y >= 2014 && totalQ >= 36) {
        return {
            section1: [
                { from: 1,  to: 8,  points: 1 },
                { from: 9,  to: 28, points: 2 },
                { from: 29, to: 36, points: 3 },
            ],
            section2Points: 5,
        };
    }
    if (y >= 2014) {
        return {
            section1: [{ from: 1, to: totalQ, points: 2 }],
            section2Points: 5,
        };
    }
    // Pre-2014 approximation
    return {
        section1: [{ from: 1, to: totalQ, points: 3 }],
        section2Points: 5,
    };
}

// ── Write output ─────────────────────────────────────────────────────────────

function writeFile(year, variant, questions, answerKey) {
    const id      = String(parseInt(year) - 2006);
    const name    = `task${year}${variant}`;
    const outPath = path.join(YEARS_DIR, `${name}.js`);

    // Apply answer keys
    let missing = 0;
    questions.forEach(q => {
        q.answer = answerKey[q.id] || '';
        if (!q.answer) missing++;
        // Flag empty options — likely a diagram question
        const hasAllOptions = q.labelA && q.labelB && q.labelC && q.labelD && q.labelE;
        if (!hasAllOptions) q.img = 'NEEDS_IMAGE';
    });

    const scoring = getScoringConfig(year, questions.length);

    const obj = {
        id,
        variant,
        scoring,
        problem: questions,
        secondProblem: [],
    };

    const js = `// ЭЕШ Математик ${year} он — ${variant} хувилбар
// Auto-parsed. Questions with img:"NEEDS_IMAGE" need manual image/option entry.

const ${name} = ${JSON.stringify(obj, null, 4)};

export default ${name};
`;

    fs.writeFileSync(outPath, js, 'utf8');

    const needsImage = questions.filter(q => q.img).length;
    console.log(`  ✅ ${name}.js  —  ${questions.length} questions, ${missing} missing answers, ${needsImage} need images`);
    return { questions: questions.length, missing, needsImage };
}

// ── Stubs check ──────────────────────────────────────────────────────────────

function isStub(year, variant) {
    const file = path.join(YEARS_DIR, `task${year}${variant}.js`);
    if (!fs.existsSync(file)) return true;
    const content = fs.readFileSync(file, 'utf8');
    return (content.match(/id:\s*["']\d+["']/g) || []).length < 5;
}

// ── Surya JSON parser ─────────────────────────────────────────────────────────

// Surya outputs: { "filename": [ { blocks: [{label, html, reading_order}] } ] }
// Math equations appear as <math>\frac{4}{9}</math> (LaTeX inside math tags)
// We convert those to $LaTeX$ so Test.jsx renders them with KaTeX.

function suryaHtmlToText(html) {
    // Convert <math>LaTeX</math> → $LaTeX$
    let text = html.replace(/<math>([\s\S]*?)<\/math>/gi, (_, latex) => `$${latex.trim()}$`);
    // Strip remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');
    // Decode HTML entities
    text = text.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
    return text.trim();
}

function parseSuryaJson(jsonPath) {
    const raw  = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    // Flatten all pages from all files into ordered text blocks
    const allText = [];
    for (const pages of Object.values(raw)) {
        for (const page of pages) {
            const blocks = (page.blocks || [])
                .sort((a, b) => a.reading_order - b.reading_order)
                .map(b => suryaHtmlToText(b.html || ''))
                .filter(Boolean);
            allText.push(...blocks);
        }
    }
    return allText.join('\n');
}

// ── Commands ─────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const get     = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i+1] : null; };
const has     = (f) => args.includes(f);

const pdfPath   = get('--pdf');
const suryaPath = get('--surya');
const year      = get('--year');
const variant   = get('--variant');
const doAll     = has('--all');

if (!pdfPath && !suryaPath) {
    console.error([
        'Usage:',
        '  node scripts/parse-eysh.mjs --pdf <file.pdf> [--dump | --year YYYY --variant X | --all]',
        '  node scripts/parse-eysh.mjs --surya <results.json> [--year YYYY --variant X | --all]',
    ].join('\n'));
    process.exit(1);
}

// ── Surya mode ───────────────────────────────────────────────────────────────
if (suryaPath) {
    if (!fs.existsSync(suryaPath)) {
        console.error(`Surya JSON not found: ${suryaPath}`);
        process.exit(1);
    }
    console.log('📖 Reading Surya OCR output…');
    const fullText = parseSuryaJson(suryaPath);

    const tests = splitIntoTests(fullText);
    if (!tests) {
        const out = path.join(__dirname, 'surya_extracted.txt');
        fs.writeFileSync(out, fullText, 'utf8');
        console.error([
            '❌ Could not auto-detect test boundaries in Surya output.',
            `   Saved extracted text to scripts/surya_extracted.txt — check the structure.`,
        ].join('\n'));
        process.exit(1);
    }

    console.log(`📋 Found ${tests.length} tests`);
    const toProcess = doAll
        ? tests.filter(t => isStub(t.year, t.variant))
        : tests.filter(t => t.year === year && t.variant === variant);

    if (toProcess.length === 0) {
        console.log(doAll ? 'All tests already filled ✅' : `${year}${variant} not found`);
        process.exit(0);
    }

    let stats = { questions: 0, missing: 0, needsImage: 0 };
    for (const test of toProcess) {
        console.log(`\n⬇️  Parsing ${test.year}${test.variant}…`);
        const questions = parseQuestions(test.text);
        const answerKey = parseAnswerKey(test.text);
        const s = writeFile(test.year, test.variant, questions, answerKey);
        stats.questions += s.questions; stats.missing += s.missing; stats.needsImage += s.needsImage;
    }
    console.log(`\n🎉 Done! ${toProcess.length} files, ${stats.questions} questions, ${stats.missing} missing answers, ${stats.needsImage} need images`);
    process.exit(0);
}

// ── PDF mode ─────────────────────────────────────────────────────────────────
if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    process.exit(1);
}

console.log('📖 Extracting text from PDF…');
const fullText = await extractText(pdfPath);

if (has('--dump')) {
    const out = path.join(__dirname, 'extracted.txt');
    fs.writeFileSync(out, fullText, 'utf8');
    console.log(`✅ Saved ${fullText.length} chars to scripts/extracted.txt`);
    console.log('Open it and check how questions and answer keys look before running --parse.');
    process.exit(0);
}

if (!year && !doAll) {
    console.error('Provide --year and --variant, or use --all');
    process.exit(1);
}

const tests = splitIntoTests(fullText);

if (!tests) {
    console.error([
        '❌ Could not auto-detect test boundaries in the PDF text.',
        '   Run --dump first to inspect the extracted text, then share a snippet',
        '   so the parser patterns can be updated.',
    ].join('\n'));
    process.exit(1);
}

console.log(`📋 Found ${tests.length} tests in PDF`);

const toProcess = doAll
    ? tests.filter(t => isStub(t.year, t.variant))
    : tests.filter(t => t.year === year && t.variant === variant);

if (toProcess.length === 0) {
    console.log(doAll
        ? 'All tests are already filled in ✅'
        : `Test ${year}${variant} not found. Available: ${tests.map(t=>t.year+t.variant).join(', ')}`);
    process.exit(0);
}

let totalStats = { questions: 0, missing: 0, needsImage: 0 };
for (const test of toProcess) {
    console.log(`\n⬇️  Parsing ${test.year}${test.variant}…`);
    const questions = parseQuestions(test.text);
    const answerKey = parseAnswerKey(test.text);
    const s = writeFile(test.year, test.variant, questions, answerKey);
    totalStats.questions += s.questions; totalStats.missing += s.missing; totalStats.needsImage += s.needsImage;
}

console.log(`\n🎉 Done! ${toProcess.length} files, ${totalStats.questions} questions, ${totalStats.missing} missing answers, ${totalStats.needsImage} need images`);
if (totalStats.missing > 0 || totalStats.needsImage > 0)
    console.log('Tip: run --dump to inspect raw text.');
