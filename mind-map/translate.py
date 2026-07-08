import os
import glob
import json
import hashlib
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import time

def get_hash(text):
    return hashlib.md5(text.strip().encode('utf-8')).hexdigest()[:8]

def is_translatable(tag):
    if tag.name not in ['h1','h2','h3','h4','p','li','a','span','div']:
        return False
    if tag.has_attr('data-i18n'):
        return False
    
    # Must have some text
    text = tag.get_text(strip=True)
    if len(text) < 3 or text.isdigit():
        return False
        
    for child in tag.children:
        if child.name not in [None, 'strong', 'em', 'span', 'br', 'b', 'i']:
            return False
            
    return True

translator = GoogleTranslator(source='auto', target='hi')
en_dict = {}
hi_dict = {}
try:
    with open('public/lang/en.json', 'r', encoding='utf-8') as f:
        en_dict = json.load(f)
    with open('public/lang/hi.json', 'r', encoding='utf-8') as f:
        hi_dict = json.load(f)
except:
    pass

html_files = glob.glob('*.html')
total_tags = 0

for filepath in html_files:
    if filepath == 'book-raw.html': continue
    print("Processing", filepath, "...")
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    modified = False
    
    for tag in soup.find_all(['h1','h2','h3','h4','p','li','div','span','a']):
        if is_translatable(tag):
            inner_html = "".join([str(c) for c in tag.contents]).strip()
            if not inner_html or inner_html.isspace(): continue
            if '<div' in inner_html or 'class=' in inner_html: continue
                
            key_hash = get_hash(inner_html)
            i18n_key = "auto." + key_hash
            tag['data-i18n-html'] = i18n_key
            
            if i18n_key not in en_dict:
                en_dict[i18n_key] = inner_html
                
            if i18n_key not in hi_dict:
                try:
                    hi_trans = translator.translate(inner_html)
                    hi_dict[i18n_key] = hi_trans
                    total_tags += 1
                    time.sleep(0.05)
                except Exception as e:
                    print("Failed translation:", str(e))
                    hi_dict[i18n_key] = inner_html
                    time.sleep(0.5)
            modified = True
            
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup))
            
with open('public/lang/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_dict, f, ensure_ascii=False, indent=2)
with open('public/lang/hi.json', 'w', encoding='utf-8') as f:
    json.dump(hi_dict, f, ensure_ascii=False, indent=2)

print("Done! Translated", total_tags, "new items.")
