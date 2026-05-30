"""
Parse ЭЕШ math questions from extracted.txt → writes src/datas/years/task{year}{variant}.js
Usage: py -3.11 scripts/parse_questions.py [--year 2024] [--variant C] [--all]
"""
import sys, re, json, pathlib, argparse
sys.stdout.reconfigure(encoding='utf-8')

YEARS_DIR = pathlib.Path('src/datas/years')
TEXT_FILE  = pathlib.Path('scripts/extracted.txt')

# ── helpers ───────────────────────────────────────────────────────────────────

def year_id(year):
    return str(int(year) - 2006)

def scoring(year, total_q):
    y = int(year)
    if y >= 2014 and total_q >= 36:
        return {'section1': [
            {'from': 1, 'to': 8,  'points': 1},
            {'from': 9, 'to': 28, 'points': 2},
            {'from': 29,'to': 36, 'points': 3},
        ], 'section2Points': 5}
    return {'section1': [{'from': 1, 'to': max(total_q,1), 'points': 3}], 'section2Points': 5}

def is_stub(year, variant):
    p = YEARS_DIR / f'task{year}{variant}.js'
    if not p.exists(): return True
    return len(re.findall(r'"id":\s*"\d+"', p.read_text(encoding='utf-8'))) < 5

# ── split full text into year chunks ─────────────────────────────────────────

def split_years(full_text):
    """Returns dict {year: text_chunk}"""
    pat  = re.compile(r'МАТЕМАТИК\s*\n\s*(\d{4})', re.IGNORECASE)
    hits = list(pat.finditer(full_text))
    out  = {}
    for i, m in enumerate(hits):
        y   = m.group(1)
        end = hits[i+1].start() if i+1 < len(hits) else len(full_text)
        out[y] = full_text[m.start():end]
    return out

# ── split year chunk into variant chunks ─────────────────────────────────────

def split_variants(year_text):
    """Returns dict {'A': text, 'B': text, 'C': text, 'D': text}"""
    CYR = {
        'А':'A','В':'B','С':'C','Г':'D','Б':'B','Е':'E',
        'A':'A','B':'B','C':'C','D':'D','E':'E',
    }
    def norm(c):
        return CYR.get(c.upper(), c.upper())

    # ── Format 1 (2006-2013): uppercase ХУВИЛБАР section headers ─────────────
    pat1 = re.compile(r'ХУВИЛ[БÁÁB][АA]Р\s{0,3}([ABCDАВБГДЕС])', re.UNICODE)
    hits1 = list(pat1.finditer(year_text))
    if hits1:
        sections = {'A': year_text[:hits1[0].start()]}
        for i, m in enumerate(hits1):
            v   = norm(m.group(1))
            end = hits1[i+1].start() if i+1 < len(hits1) else len(year_text)
            sections[v] = year_text[m.start():end]
        if len([k for k in sections if k in 'ABCD']) >= 2:
            return sections

    # ── Format 2 (2014-2019): lowercase page-header "Хувилбар - A" ───────────
    pat2 = re.compile(r'Хувилбар\s*[-–\s]?\s*([ABCDАВБГД])\b', re.UNICODE)
    hits2 = list(pat2.finditer(year_text))
    if hits2:
        first_occ = {}
        for m in hits2:
            v = norm(m.group(1))
            if v not in first_occ:
                first_occ[v] = m.start()
        sorted_v = sorted(first_occ.items(), key=lambda x: x[1])
        sections = {}
        for i, (v, pos) in enumerate(sorted_v):
            end = sorted_v[i+1][1] if i+1 < len(sorted_v) else len(year_text)
            sections[v] = year_text[pos:end]
        if len([k for k in sections if k in 'ABCD']) >= 2:
            return sections

    return {'A': year_text}

# ── extract answer key ────────────────────────────────────────────────────────

def extract_answer_key(year_text):
    """
    Finds the answer key table. Handles two formats:
      Format 1: №\\n A Хувилбар\\nB Хувилбар\\nC Хувилбар\\nD Хувилбар\\n1\\nB\\nC\\nB\\nB\\n...
      Format 2: Хувилбар\\n№\\nA\\nB\\nC\\nD\\nE\\n1\\nA\\nD\\nE\\nA\\nA\\n...
    Returns {'A':{qnum:ans,...}, 'B':{...}, 'C':{...}, 'D':{...}}
    """
    key = {'A':{}, 'B':{}, 'C':{}, 'D':{}}

    # Try several formats to locate the answer key table
    PATTERNS = [
        # 2006: "№\n A Хувилбар\nB Хувилбар\n...1\nB\nC\nB\nB\n"
        r'№\s*\n\s*\S+\s*[Хх]увилбар.*?\n((?:\d+\n(?:[ABCDE]\n){2,5})+)',
        # 2007+: "ТҮЛХҮҮР / ХАРИУЛТ ... № ... 1\nB\nD\n..."
        r'(?:ТҮЛХҮҮР|ХАРИУЛТ).*?№.*?\n((?:\d+\n(?:[ABCDE]\n){2,5})+)',
        # Alt: Хувилбар then №
        r'[Хх]увилбар\s*\n\s*№\s*\n\s*[ABCDE]\s*\n((?:\d+\n(?:[ABCDE]\n){2,5})+)',
        # Generic: any block with number-then-letters-then-number pattern
        r'(?:^|\n)((?:\d+\n(?:[ABCDE]\n){2,5}){10,})',
    ]
    table_text = None
    for pat in PATTERNS:
        m = re.search(pat, year_text, re.DOTALL)
        if m:
            table_text = m.group(1)
            break
    if not table_text:
        return key

    # Count how many answer columns there are (check first question)
    # Find the first number line then count consecutive single-letter lines
    lines = [l.strip() for l in table_text.splitlines() if l.strip()]
    # Same visual-lookalike mapping as split_variants
    CYR = {'А':'A','В':'B','С':'C','Г':'D','Б':'B','Д':'E',
           'A':'A','B':'B','C':'C','D':'D','E':'E'}

    valid = []
    for l in lines:
        if re.match(r'^\d+$', l) and 1 <= int(l) <= 50:
            valid.append(('NUM', l))
        elif re.match(r'^[ABCDEАВБГСД]$', l):
            valid.append(('ANS', CYR.get(l, l)))

    # Detect column count: count consecutive ANS after first NUM
    num_cols = 0
    for item in valid[1:]:
        if item[0] == 'ANS':
            num_cols += 1
        else:
            break
    if num_cols == 0:
        num_cols = 4  # default

    # Map columns to variant letters
    variant_cols = ['A','B','C','D','E'][:num_cols]

    i = 0
    while i < len(valid):
        if valid[i][0] == 'NUM':
            qnum = valid[i][1]
            answers = []
            j = i + 1
            while j < len(valid) and valid[j][0] == 'ANS' and len(answers) < num_cols:
                answers.append(valid[j][1])
                j += 1
            for vi, variant in enumerate(variant_cols):
                if variant in key and vi < len(answers):
                    key[variant][qnum] = answers[vi]
            i = j
        else:
            i += 1

    return key

# ── extract questions ─────────────────────────────────────────────────────────

def extract_questions(variant_text):
    """
    Parses numbered questions with A-E options.
    Returns list of question dicts.
    """
    questions = []

    # Strip page markers left over from extracted.txt (=== PAGE N ===)
    variant_text = re.sub(r'=== PAGE \d+ ===', '', variant_text)

    # Trim to section 1 only:
    # Start from НЭГДҮГЭЭР ХЭСЭГ (first section header), stop at ХОЁРДУГААР (second section)
    sec1_start = re.search(r'НЭГД.{1,5}ГЭЭР\s*ХЭСЭГ|Í.{1,5}ÃÄ.{1,5}ÃÝÝÐ\s*Х', variant_text)
    sec2_start = re.search(r'ХОЁРДУГААР\s*ХЭСЭГ|ÕÎ.ÐÄÓÃÀÀÐ', variant_text)
    if sec1_start:
        start = sec1_start.end()
        end   = sec2_start.start() if sec2_start and sec2_start.start() > start else len(variant_text)
        variant_text = variant_text[start:end]

    # Split on question numbers: lines like "1." or "1. " at start of a token
    # Use the pattern: newline + optional whitespace + digit(s) + dot
    blocks = re.split(r'\n\s*(\d{1,2})\.\s+', variant_text)
    # blocks[0] = preamble, then alternating [num, content, num, content, ...]

    for i in range(1, len(blocks) - 1, 2):
        qnum    = blocks[i].strip()
        content = blocks[i+1].strip() if i+1 < len(blocks) else ''

        if not qnum.isdigit() or int(qnum) > 50:
            continue

        # Remove extra whitespace runs
        content = re.sub(r'[ \t]{2,}', ' ', content)
        content = re.sub(r'\n{3,}', '\n', content)

        # Find options — handles "A. text", "A.text", "(A) text", "A.\ntext"
        opt_pat = re.compile(
            r'(?:\(([ABCDE])\)|([ABCDE])\.)\s*(.+?)(?=\s*(?:\([ABCDE]\)|[ABCDE]\.)\s*|\s*\n\s*\d+\.|\s*/\d|\s*\(\d+\s*оноо\)|\Z)',
            re.DOTALL
        )
        options = {}
        for m in opt_pat.finditer(content):
            letter = m.group(1) or m.group(2)
            text   = re.sub(r'\s+', ' ', m.group(3)).strip()
            options[letter] = text

        # Question text = everything before first option
        first_opt = opt_pat.search(content)
        if first_opt:
            q_text = content[:first_opt.start()].strip()
        else:
            q_text = content.strip()

        # Strip point annotations and trailing whitespace
        q_text = re.sub(r'\(\d+\s*оноо\)', '', q_text).strip()
        q_text = re.sub(r'\s+', ' ', q_text)

        # Skip formula-sheet items: no options at all, or question text is huge
        has_options = any(options.get(l) for l in 'ABCDE')
        if not q_text or int(qnum) == 0 or not has_options:
            continue

        questions.append({
            'id':     qnum,
            'text':   q_text,
            'labelA': options.get('A', ''),
            'labelB': options.get('B', ''),
            'labelC': options.get('C', ''),
            'labelD': options.get('D', ''),
            'labelE': options.get('E', ''),
            'answer': ''
        })

    # Deduplicate by id, keep first occurrence (real questions come before sub-conditions)
    seen = {}
    for q in questions:
        if q['id'] not in seen:
            seen[q['id']] = q
    return [seen[k] for k in sorted(seen.keys(), key=lambda x: int(x))]

# ── write output JS file ──────────────────────────────────────────────────────

def write_file(year, variant, questions, answer_key):
    name = f'task{year}{variant}'
    path = YEARS_DIR / f'{name}.js'

    missing = 0
    for q in questions:
        q['answer'] = answer_key.get(q['id'], '')
        if not q['answer']:
            missing += 1

    obj = {
        'id':           year_id(year),
        'variant':      variant,
        'scoring':      scoring(year, len(questions)),
        'problem':      questions,
        'secondProblem':[]
    }

    js = json.dumps(obj, ensure_ascii=False, indent=4)
    content = (
        f'// ЭЕШ Математик {year} он — {variant} хувилбар\n'
        f'// Auto-parsed. Math formulas may appear as plain text — review as needed.\n\n'
        f'const {name} = {js};\n\nexport default {name};\n'
    )
    path.write_text(content, encoding='utf-8')
    print(f'  ✅ {name}.js — {len(questions)} Qs, {missing} missing answers')
    return len(questions), missing

# ── main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--year',    help='Specific year e.g. 2024')
    parser.add_argument('--variant', help='Specific variant e.g. C')
    parser.add_argument('--all',     action='store_true', help='Process all stubs')
    args = parser.parse_args()

    if not TEXT_FILE.exists():
        print('Run extract_text.py first to create scripts/extracted.txt')
        sys.exit(1)

    full_text   = TEXT_FILE.read_text(encoding='utf-8')
    year_chunks = split_years(full_text)
    print(f'Found {len(year_chunks)} years: {", ".join(sorted(year_chunks))}')

    total_qs = total_files = 0

    years    = [args.year]    if args.year    else sorted(year_chunks.keys())
    variants = [args.variant] if args.variant else ['A','B','C','D']

    for year in years:
        if year not in year_chunks:
            print(f'Year {year} not found in extracted text'); continue

        chunk    = year_chunks[year]
        ans_key  = extract_answer_key(chunk)
        var_secs = split_variants(chunk)

        print(f'\n{year} — variants found: {list(var_secs.keys())}')
        for variant in variants:
            if variant not in var_secs:
                print(f'  ⚠️  {variant} not found'); continue
            if not args.all and not (args.year and args.variant):
                pass  # process everything requested
            if args.all and not is_stub(year, variant):
                print(f'  ⏭  task{year}{variant}.js already complete'); continue

            qs = extract_questions(var_secs[variant])
            if len(qs) < 3:
                print(f'  ⚠️  task{year}{variant} — only {len(qs)} Qs parsed, skipping')
                continue

            q_count, missing = write_file(year, variant, qs, ans_key.get(variant, {}))
            total_qs    += q_count
            total_files += 1

    print(f'\nDone: {total_files} files written, {total_qs} total questions')

if __name__ == '__main__':
    main()
