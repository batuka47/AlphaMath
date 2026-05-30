import re, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')

fixes = {'task2014B': ('36', 'B'), 'task2014C': ('36', 'C')}
TASKS = pathlib.Path('d:/Projects/AlphamathV1.9/src/datas/years')

for fname, (qid, ans) in fixes.items():
    f = TASKS / f'{fname}.js'
    content = f.read_text(encoding='utf-8')
    # Find last empty answer field in file
    new = re.sub(
        r'(answer\s*:\s*["\'])(["\'])(?![\s\S]*answer\s*:\s*["\']["\'])',
        rf'\g<1>{ans}\2',
        content
    )
    if new != content:
        f.write_text(new, encoding='utf-8')
        print(f'Fixed {fname} Q{qid} -> {ans}')
    else:
        print(f'No change for {fname}')
