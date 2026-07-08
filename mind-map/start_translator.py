import json
import hashlib
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator

def get_hash(text):
    return hashlib.md5(text.strip().encode('utf-8')).hexdigest()[:8]

filepath = 'start-here.html'
with open(filepath, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

translator = GoogleTranslator(source='auto', target='hi')
hi_dict = {}
try:
    with open('public/lang/hi.json', 'r', encoding='utf-8') as f:
        hi_dict = json.load(f)
except: pass

count = 0
for tag in soup.find_all(['h1','h2','h3','h4','p','li','a','span','div']):
    if tag.has_attr('data-i18n') or tag.has_attr('data-i18n-html'): continue
    text = tag.get_text(strip=True)
    if len(text) < 3: continue
    
    valid = True
    for child in tag.children:
        if child.name not in [None, 'strong', 'em', 'span', 'br', 'b', 'i']:
            valid = False
            break
    if not valid: continue
    
    inner_html = "".join([str(c) for c in tag.contents]).strip()
    if '<div' in inner_html or 'class=' in inner_html: continue
    
    key = "starthere." + get_hash(inner_html)
    tag['data-i18n-html'] = key
    if key not in hi_dict:
        try:
            hi_dict[key] = translator.translate(inner_html)
            count += 1
        except Exception as e:
            hi_dict[key] = inner_html
            
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(str(soup))
with open('public/lang/hi.json', 'w', encoding='utf-8') as f:
    json.dump(hi_dict, f, ensure_ascii=False, indent=2)

print("Translated", count, "elements on start-here.html")
