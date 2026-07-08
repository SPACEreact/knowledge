import os
import glob

tag = '  <script type="module" src="global-lang.js"></script>'
for file in glob.glob('*.html'):
    if file == 'book-raw.html': continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'global-lang.js' not in content:
        content = content.replace('</body>', tag + '\n</body>')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Patched', file)