import pathlib, re, sys
sys.stdout.reconfigure(encoding='utf-8')
TASKS = pathlib.Path('d:/Projects/AlphamathV1.9/src/datas/years')

print('All files — answer completion:')
for f in sorted(TASKS.glob('task*.js')):
    c = f.read_text(encoding='utf-8')
    all_ans = re.findall(r'answer\s*:\s*["\' `]([A-E]?)["\' `]', c)
    filled = [a for a in all_ans if a]
    total = len(all_ans)
    if total == 0:
        continue
    status = 'OK' if len(filled) == total else f'MISSING {total-len(filled)}'
    if status != 'OK':
        print(f'  {f.stem}: {len(filled)}/{total}  [{status}]')
