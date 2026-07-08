from pathlib import Path
from PyPDF2 import PdfReader
p = Path('_MARKETPLACE AGRICOLE .pdf')
reader = PdfReader(p)
keywords = ['OLADOKOU', 'Oladokou', 'EMMANUEL', 'JOSEPH', 'Oladokou Emmanuel', 'Emmanuel']
for i, page in enumerate(reader.pages, start=1):
    text = page.extract_text() or ''
    if any(k in text for k in keywords):
        print(f'=== PAGE {i} ===')
        print(text)
        print('---')
