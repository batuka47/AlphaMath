import re, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')
TASKS = pathlib.Path('d:/Projects/AlphamathV1.9/src/datas/years')

complete, incomplete = [], []
for f in sorted(TASKS.glob('task*.js')):
    content = f.read_text(encoding='utf-8')
    total  = len(re.findall(r'answer\s*:\s*["\']', content))
    filled = len(re.findall(r'answer\s*:\s*["\'][A-E]["\']', content))
    if total == 0:
        continue
    if filled == total:
        complete.append(f.stem)
    else:
        incomplete.append((f.stem, filled, total))

print(f'Complete ({len(complete)}):')
for n in complete:
    print(f'  {n}')
print(f'\nIncomplete ({len(incomplete)}):')
for name, filled, total in incomplete:
    print(f'  {name}: {filled}/{total}')
