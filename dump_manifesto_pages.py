from pathlib import Path
from PyPDF2 import PdfReader
p = Path('_MARKETPLACE AGRICOLE .pdf')
reader = PdfReader(p)
for i, page in enumerate(reader.pages, start=1):
    text = page.extract_text() or ''
    print(f'=== PAGE {i} ===')
    print(text)
    print('--- END PAGE ---\n')
