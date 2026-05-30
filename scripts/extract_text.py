"""
Extract text from scanned PDF using EasyOCR + PyMuPDF.
Converts each PDF page to an image, then OCRs it.

Usage:
  py -3.11 scripts/extract_text.py src/assets/questions.pdf
  py -3.11 scripts/extract_text.py src/assets/questions.pdf --pages 1-10
"""
import sys, os, json, pathlib, argparse
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')
import fitz          # PyMuPDF — converts PDF pages to images
import easyocr

def parse_range(s):
    pages = []
    for part in s.split(','):
        if '-' in part:
            a, b = part.split('-')
            pages += list(range(int(a), int(b) + 1))
        else:
            pages.append(int(part))
    return [p - 1 for p in pages]  # convert to 0-indexed

parser = argparse.ArgumentParser()
parser.add_argument('pdf', help='Path to scanned PDF')
parser.add_argument('--pages', help='Page range e.g. 1-20,25', default=None)
parser.add_argument('--lang', help='OCR languages', default='ru,en')
parser.add_argument('--out', help='Output text file', default='scripts/extracted.txt')
args = parser.parse_args()

print('Loading EasyOCR (downloads models on first run ~200MB)...')
reader = easyocr.Reader(args.lang.split(','), gpu=False)
print('OCR ready.')

doc = fitz.open(args.pdf)
total = doc.page_count
indices = parse_range(args.pages) if args.pages else list(range(total))
print(f'PDF has {total} pages. Processing {len(indices)} pages...')

out_lines = []
for idx in indices:
    page_num = idx + 1
    print(f'  Page {page_num}/{total}...', end='\r')
    page = doc[idx]
    # Render page as image at 200 DPI for good OCR quality
    mat  = fitz.Matrix(200/72, 200/72)
    pix  = page.get_pixmap(matrix=mat)
    img_bytes = pix.tobytes('png')

    results = reader.readtext(img_bytes, detail=0, paragraph=True)
    page_text = '\n'.join(results)
    out_lines.append(f'\n=== PAGE {page_num} ===\n{page_text}')

out_path = pathlib.Path(args.out)
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text('\n'.join(out_lines), encoding='utf-8')
print(f'\nDone. Extracted {len(indices)} pages -> {out_path}')
print('Open scripts/extracted.txt to check the quality.')
