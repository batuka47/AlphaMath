"""
Apply parsed answer keys to all task JS files.
Also cleans up garbage text in question/label fields.
"""

import json, re, pathlib, sys

sys.stdout.reconfigure(encoding='utf-8')

ANSWERS_FILE = pathlib.Path('d:/Projects/AlphamathV1.9/scripts/answer_keys.json')
TASKS_DIR    = pathlib.Path('d:/Projects/AlphamathV1.9/src/datas/years')

with open(str(ANSWERS_FILE), encoding='utf-8') as f:
    ANSWERS = json.load(f)

# ── Garbage patterns to strip from text/label fields ─────────────────────────
GARBAGE = [
    r'\s*Боловсролын Үнэлгээний Төв\s*',
    r'\s*Математикийн хичээлийн даалгавар[^"]*',
    r'\s*\d+ Боловсролын[^"]*',
    r'\s*БҮТ\s*',
]

def clean_text(s):
    if not isinstance(s, str):
        return s
    for pat in GARBAGE:
        s = re.sub(pat, '', s)
    return s.strip()

# ── Process each JS file ──────────────────────────────────────────────────────
updated = 0
skipped = 0
not_found = 0

for js_file in sorted(TASKS_DIR.glob('task*.js')):
    name = js_file.stem  # e.g. "task2006A"
    m = re.match(r'task(\d{4})([A-E])', name)
    if not m:
        continue
    year_str, variant = m.group(1), m.group(2)
    year_answers = ANSWERS.get(year_str, {}).get(variant, {})

    content = js_file.read_text(encoding='utf-8')

    if not year_answers:
        # No answers for this year/variant — just clean garbage text
        new_content = content
        for pat in GARBAGE:
            new_content = re.sub(pat, '', new_content)
        if new_content != content:
            js_file.write_text(new_content, encoding='utf-8')
            print(f'  Cleaned (no answers): {name}')
        else:
            not_found += 1
        continue

    new_content = content

    # Apply each answer
    applied = 0
    for q_id, answer in year_answers.items():
        # Pattern: find the question block with this id and update answer field
        # Handles both: answer: "" and answer: "X" and answer: ''
        # The id field looks like: "id": "5" or id: "5"
        # We look for the id, then find the answer field within the same object

        # Strategy: replace answer: "" (empty) near this question id
        # More robust: find id block then replace answer within next ~500 chars
        id_pattern = rf'(["\']id["\']:\s*["\']){re.escape(q_id)}(["\'])'

        def update_answer_near(match):
            start = match.start()
            # Look ahead for answer field within 600 chars
            snippet = new_content[start:start+600]
            # Replace empty answer or any answer with the correct one
            new_snippet = re.sub(
                r'(["\']answer["\']:\s*["\'])[A-E]?(["\'])',
                rf'\g<1>{answer}\g<2>',
                snippet,
                count=1
            )
            return new_snippet if new_snippet != snippet else None

        # Use a different approach: split by question blocks
        # Replace answer for this specific question id
        # Pattern matches the answer field that follows an id field matching q_id
        # Handles both quoted ("id") and unquoted (id) key styles
        pattern = (
            rf'(["\']?id["\']?:\s*["\']){re.escape(q_id)}(["\']'
            rf'(?:.|[\r\n]){{0,600}}?)'
            rf'(["\']?answer["\']?:\s*["\'])[A-E]?(["\'])'
        )
        replacement = rf'\g<1>{q_id}\g<2>\g<3>{answer}\g<4>'
        new_content2 = re.sub(pattern, replacement, new_content, count=1)
        if new_content2 != new_content:
            applied += 1
            new_content = new_content2

    # Clean garbage text
    for pat in GARBAGE:
        new_content = re.sub(pat, '', new_content)

    if new_content != content:
        js_file.write_text(new_content, encoding='utf-8')
        print(f'  Updated {name}: {applied}/{len(year_answers)} answers applied')
        updated += 1
    else:
        skipped += 1

print(f'\nDone. Updated: {updated}, Skipped (no change): {skipped}, No answers: {not_found}')
