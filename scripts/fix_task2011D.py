import re, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')

f = pathlib.Path('D:/Projects/AlphamathV1.9/src/datas/years/task2011D.js')
c = f.read_text(encoding='utf-8')

LABELS = ('                    labelA: ``,\n'
          '                    labelB: ``,\n'
          '                    labelC: ``,\n'
          '                    labelD: ``,\n'
          '                    labelE: ``,\n')

def fix_broken(content, garbage_suffix, answer, is_last=False):
    """Replace ...garbage"ANSWER"\n} with ...\`,\nlabels\nanswer\n}"""
    end = '\n                }' + ('' if is_last else ',')
    old = garbage_suffix + f'"{answer}"' + end
    new = '`,' + '\n' + LABELS + f'                    answer: "{answer}"' + end
    return content.replace(old, new)

# Q21 is the last question (no trailing comma on closing brace)
c = fix_broken(c, ' 94', 'C', is_last=True)

f.write_text(c, encoding='utf-8')
print('Fixed task2011D.js')
