import pathlib
from pathlib import Path
p = Path('_MARKETPLACE AGRICOLE .pdf')
print('exists', p.exists(), p)
try:
    from PyPDF2 import PdfReader
except ImportError:
    import sys
    print('PyPDF2 missing', file=sys.stderr)
    raise
reader = PdfReader(p)
print('pages', len(reader.pages))
for i, page in enumerate(reader.pages):
    text = page.extract_text() or ''
    if 'MANIFESTE' in text or 'Organisation et répartition' in text or 'OLADOKOU' in text:
        print('PAGE', i+1)
        print(text[:8000])
        print('---')