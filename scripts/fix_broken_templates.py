"""
Find and fix template literals that were broken by the garbage cleanup regex.
Pattern: text field template literal missing its closing backtick,
followed by junk and answer value leaked outside the string.

Broken: text: `...content garbage"A"\n    },
Fixed:  text: `...content`,\n    labelA: ``,\n...\n    answer: "A"\n    },
"""

import re, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')

TASKS = pathlib.Path('D:/Projects/AlphamathV1.9/src/datas/years')

# Pattern: inside a question object, text field template literal runs into
# what should be the answer value: ends with [non-backtick]"[A-E]"\n
BROKEN = re.compile(
    r'(text:\s*`[^`]*?)'       # group1: text field opened with backtick (no backtick inside)
    r'([^`"\n]{0,80})'         # group2: trailing garbage (no backtick, quote, or newline)
    r'"([A-E])"'               # group3: leaked answer letter in quotes
    r'\s*\n(\s*\},)',           # group4: end of object
    re.DOTALL
)

fixed_files = 0

for f in sorted(TASKS.glob('task*.js')):
    content = f.read_text(encoding='utf-8')

    def fix_match(m):
        text_part   = m.group(1)   # text: `...content
        garbage     = m.group(2)   # trailing garbage
        answer_letter = m.group(3) # A-E
        obj_end     = m.group(4)   # },

        # Strip the garbage (usually a number or page marker)
        clean_text = text_part.rstrip() + '`'

        return (
            f'{clean_text},\n'
            f'                    labelA: ``,\n'
            f'                    labelB: ``,\n'
            f'                    labelC: ``,\n'
            f'                    labelD: ``,\n'
            f'                    labelE: ``,\n'
            f'                    answer: "{answer_letter}"\n'
            f'                {obj_end}'
        )

    new_content = BROKEN.sub(fix_match, content)

    if new_content != content:
        f.write_text(new_content, encoding='utf-8')
        # Count how many were fixed
        count = len(BROKEN.findall(content))
        print(f'  Fixed {f.stem}: {count} broken template(s)')
        fixed_files += 1

print(f'\nDone. Fixed {fixed_files} files.')
