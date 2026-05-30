"""
Parse answer keys from ЭЕШ question PDF (pages 337-339).
Outputs: answer_keys.json  {year: {variant: {q_id: answer}}}
Then applies answers to all JS task files.
"""

import fitz, json, re, sys, pathlib
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

PDF = pathlib.Path('d:/Projects/AlphamathV1.9/src/assets/questions.pdf')
OUT = pathlib.Path('d:/Projects/AlphamathV1.9/scripts/answer_keys.json')
TASKS = pathlib.Path('d:/Projects/AlphamathV1.9/src/datas/years')

doc = fitz.open(str(PDF))

# ── Pages that contain answer tables ──────────────────────────────────────────
# Page 337 (idx 336): 2006-2010
# Page 338 (idx 337): 2011-2015
# Page 339 (idx 338): 2016-2019

ANSWER_PAGES = [336, 337, 338]

VALID_ANSWERS = set('ABCDE')

def cluster(values, gap=8):
    """Cluster a sorted list of floats into groups separated by >gap."""
    if not values:
        return []
    groups, cur = [[values[0]]], [values[0]]
    for v in values[1:]:
        if v - cur[-1] > gap:
            groups.append([])
            cur = []
        groups[-1].append(v)
        cur.append(v)
    return [sum(g)/len(g) for g in groups]  # return group centers

def nearest(val, centers):
    return min(range(len(centers)), key=lambda i: abs(centers[i] - val))

def parse_page(page):
    """
    Returns list of dicts:
      { 'year': int, 'variant': str, 'q_type': 'main'|'sub',
        'q_id': str, 'sub_slot': str|None, 'answer': str }
    """
    words = page.get_text('words')  # (x0,y0,x1,y1, word, ...)

    # Separate answer cells (single A-E letter) from labels
    cells  = [(round(w[0]), round(w[1]), w[4]) for w in words if w[4] in VALID_ANSWERS]
    labels = [(round(w[0]), round(w[1]), w[4]) for w in words if w[4] not in VALID_ANSWERS]

    # ── Find column groups from the HEADER row ────────────────────────────────
    # The first row of cells (min y) is the variant header row (A/B/C/D)
    all_ys = sorted(set(c[1] for c in cells))
    header_y = all_ys[0]
    header_cells = [(c[0], c[2]) for c in cells if c[1] == header_y]
    header_cells.sort()

    # Build column index: col_idx -> x_center
    col_xs = [h[0] for h in header_cells]
    col_variants = [h[1] for h in header_cells]  # A/B/C/D for each column

    # ── Identify year labels and their Y positions ────────────────────────────
    # Year labels look like "2006", "2007" etc. appearing near "ЭЕШ"
    year_rows = {}  # y -> year_int
    raw_label_text = [(x, y, t) for (x, y, t) in labels]

    # Find "ЭЕШ" and the year number nearby
    eysh_positions = [(x, y) for (x, y, t) in raw_label_text if t == 'ЭЕШ']
    year_positions = [(x, y, int(t)) for (x, y, t) in raw_label_text
                      if re.match(r'^20\d\d$', t)]

    # Match each ЭЕШ with the nearest year number (same y or close)
    matched_years = {}  # y_center -> year
    for ey, ey_y in [(p[0], p[1]) for p in eysh_positions]:
        for yx, yy, yr in year_positions:
            if abs(yy - ey_y) < 5:
                matched_years[ey_y] = yr
                break

    # ── Find question number labels ────────────────────────────────────────────
    # Main section: numbers 1-36
    # Sub section: "2.1", "2.2", "2.3", "2.4" + sub-slots a-h
    q_labels = {}  # y -> q_id string

    # Single integers (question numbers)
    num_labels = [(x, y, t) for (x, y, t) in raw_label_text
                  if re.match(r'^\d{1,2}$', t) and 1 <= int(t) <= 36]

    # Sub-section numbers like "2.1" "2.2" "2.3" "2.4"
    sub_labels = [(x, y, t) for (x, y, t) in raw_label_text
                  if re.match(r'^2\.[1-4]$', t)]

    # Sub-slot letters a-h (lowercase)
    slot_labels = [(x, y, t) for (x, y, t) in raw_label_text
                   if re.match(r'^[a-h]$', t)]

    for x, y, t in num_labels:
        q_labels[y] = t

    # ── Build column → (year, variant) mapping ────────────────────────────────
    # We need to know which column index belongs to which year.
    # Strategy: the variant header repeats A,B,C,D for each year.
    # We detect year boundaries by where variant letters reset to 'A'.
    col_year_map = {}  # col_idx -> year
    year_list = sorted(matched_years.items())  # sorted by y position

    # Map year Y positions to years
    # The year label y tells us WHERE on the page that year's rows live
    # But we need to figure out which COLUMNS belong to which year.
    # Since years are laid out left-to-right (each with A,B,C,D variants),
    # we can figure it out from the variant reset pattern in the header.

    # Find column group boundaries: wherever variant resets to 'A'
    group_starts = [i for i, v in enumerate(col_variants) if v == 'A']

    # Each group_start..next_group_start is one year's columns
    groups = []
    for k, start in enumerate(group_starts):
        end = group_starts[k+1] if k+1 < len(group_starts) else len(col_variants)
        groups.append((start, end, col_variants[start:end]))

    # Assign years to groups (left to right matches year order on the page)
    # Year order on page: use y-sorted year positions' year values isn't reliable
    # Instead, use the raw text order which lists years from top-to-bottom (= left-to-right)
    page_years_ordered = sorted(matched_years.items())  # (y, year) sorted by y
    # Actually years might appear at the bottom in various orders.
    # Let's use a different approach: group years by x-position if possible.

    year_x_positions = {}
    for yx, yy, yr in year_positions:
        year_x_positions[yr] = yx  # approximate x of year label

    # Sort years by their x position on the page
    years_by_x = sorted(year_x_positions.items(), key=lambda kv: kv[1])

    if len(years_by_x) == len(groups):
        for (yr, _), (gstart, gend, gvars) in zip(years_by_x, groups):
            for cidx in range(gstart, gend):
                col_year_map[cidx] = yr
    else:
        # Fallback: assign in order
        for k, (gstart, gend, gvars) in enumerate(groups):
            if k < len(years_by_x):
                yr = years_by_x[k][0]
                for cidx in range(gstart, gend):
                    col_year_map[cidx] = yr

    # ── Parse answer grid (skip header row) ───────────────────────────────────
    data_cells = [c for c in cells if c[1] != header_y]

    # Cluster y values into rows
    data_ys_sorted = sorted(set(c[1] for c in data_cells))

    # For each row, find what question it corresponds to
    # Question label y might be slightly offset from data cell y
    # Build a mapping: row_y -> q_id
    def find_q(row_y):
        # Look for a number label close to this y
        best = None
        best_dist = 999
        for (x, y, t) in num_labels:
            d = abs(y - row_y)
            if d < best_dist:
                best_dist = d
                best = t
        if best_dist < 8:
            return best
        return None

    # Build result dictionary
    result = defaultdict(lambda: defaultdict(dict))  # result[year][variant][q_id] = answer

    for row_y in data_ys_sorted:
        row_cells = sorted([(c[0], c[2]) for c in data_cells if c[1] == row_y])
        q_id = find_q(row_y)
        if not q_id:
            continue
        for (cx, answer) in row_cells:
            # Find nearest column
            cidx = nearest(cx, col_xs)
            if cidx not in col_year_map:
                continue
            year = col_year_map[cidx]
            variant = col_variants[cidx]
            result[year][variant][q_id] = answer

    # ── Parse sub-section answers ─────────────────────────────────────────────
    # Sub-section rows have only numeric digit answers, not A-E
    # Extract all non-A-E words that are single digits
    digit_cells = [(round(w[0]), round(w[1]), w[4]) for w in words
                   if re.match(r'^-?\d{1,2}$', w[4])]

    # Sub-section labels like "a", "b" appear on the right side
    # and identify which slot the number answers belong to
    # This is more complex - skip for now and return main answers

    return dict(result)


# ── Run parser on all three pages ─────────────────────────────────────────────
all_answers = {}  # {year: {variant: {q_id: answer}}}

for page_idx in ANSWER_PAGES:
    print(f'Parsing page {page_idx+1}...')
    page_result = parse_page(doc[page_idx])
    for year, variants in page_result.items():
        if year not in all_answers:
            all_answers[year] = {}
        for variant, qs in variants.items():
            if variant not in all_answers[year]:
                all_answers[year][variant] = {}
            all_answers[year][variant].update(qs)

# Print summary
print('\n=== ANSWER KEY SUMMARY ===')
for year in sorted(all_answers.keys()):
    for variant in sorted(all_answers[year].keys()):
        qs = all_answers[year][variant]
        print(f'  {year}-{variant}: {len(qs)} questions')

# Save to JSON
with open(str(OUT), 'w', encoding='utf-8') as f:
    json.dump(all_answers, f, ensure_ascii=False, indent=2)
print(f'\nSaved to {OUT}')
