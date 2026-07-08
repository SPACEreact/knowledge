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
    # Check if contains only text or inline tags like strong/em
    for child in tag.children:
        if child.name not in [None, 'strong', 'em', 'span', 'br', 'b', 'i']:
            return False
    text = tag.get_text(strip=True)
    if len(text) < 2 or text.isdigit():
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
    print(f"Processing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    modified = False
    tags_to_process = []
    
    for tag in soup.find_all(['h1','h2','h3','h4','p','li','div','span','a']):
        if is_translatable(tag):
            tags_to_process.append(tag)
            
    for tag in tags_to_process:
        inner_html = "".join([str(c) for c in tag.contents]).strip()
        if not inner_html or inner_html.isspace(): continue
        
        # Don't translate pure html structure if it's too weird
        if '<div' in inner_html or 'class=' in inner_html: continue
            
        key_hash = get_hash(inner_html)
        i18n_key = f"auto.{key_hash}"
        tag['data-i18n-html'] = i18n_key
        
        if i18n_key not in en_dict:
            en_dict[i18n_key] = inner_html
            
        if i18n_key not in hi_dict:
            try:
                # We translate text-only for safety to avoid breaking html, 
                # but if there are inline styles, google translator can handle basic tags
                hi_trans = translator.translate(inner_html)
                hi_dict[i18n_key] = hi_trans
                total_tags += 1
                time.sleep(0.1) # avoid rate limit
            except Exception as e:
                print("Translation failed for:", inner_html[:30], str(e))
                hi_dict[i18n_key] = inner_html # fallback
                time.sleep(1)
        modified = True
        
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup))

with open('public/lang/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_dict, f, ensure_ascii=False, indent=2)
with open('public/lang/hi.json', 'w', encoding='utf-8') as f:
    json.dump(hi_dict, f, ensure_ascii=False, indent=2)

print(f"Done! Translated {total_tags} new text elements.")