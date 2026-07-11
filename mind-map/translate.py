"""
Tag HTML text nodes with data-i18n-html and generate en/hi language packs.

Usage:
  python translate.py              # tag + translate missing
  python translate.py --tag-only   # only add attributes / en keys
  python translate.py --limit 50   # translate at most N new strings
"""
import argparse
import glob
import hashlib
import json
import os
import re
import time
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Comment

try:
    from deep_translator import GoogleTranslator
except ImportError:
    GoogleTranslator = None

SKIP_FILES = {
    'book-raw.html',
    'human-layers-enhanced.html',  # thin wrapper / experimental
    'visual-story.html',  # full Bruce Block book — too large for machine i18n
}
SKIP_TAGS = {'script', 'style', 'noscript', 'code', 'pre', 'svg', 'path', 'meta', 'link', 'br', 'hr', 'img', 'input', 'textarea'}
TEXT_TAGS = {'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'a', 'span', 'div', 'td', 'th', 'label', 'button', 'figcaption', 'blockquote', 'dt', 'dd', 'em', 'strong', 'small'}

# Inline tags allowed inside a "leaf" translatable node
INLINE = {None, 'strong', 'em', 'b', 'i', 'br', 'span', 'code', 'mark', 'u', 'sup', 'sub', 'a', 'small'}


def get_hash(text: str) -> str:
    return hashlib.md5(text.strip().encode('utf-8')).hexdigest()[:8]


def page_prefix(filepath: str) -> str:
    base = Path(filepath).stem
    base = re.sub(r'[^a-zA-Z0-9]+', '', base).lower()
    return base or 'page'


def looks_english(text: str) -> bool:
    """Rough check: has Latin letters and is not mostly Devanagari."""
    if not text:
        return False
    latin = len(re.findall(r'[A-Za-z]', text))
    deva = len(re.findall(r'[\u0900-\u097F]', text))
    if latin < 2:
        return False
    if deva > latin:
        return False
    return True


def is_noise(text: str) -> bool:
    t = text.strip()
    if len(t) < 2:
        return True
    if t.isdigit():
        return True
    if re.fullmatch(r'[\d\s\.\,\%\+\-\:\/\|]+', t):
        return True
    # pure symbols / icons
    if re.fullmatch(r'[\W_]+', t, flags=re.UNICODE):
        return True
    # single token technical ids
    if re.fullmatch(r'[A-Za-z0-9_\-]{1,3}', t) and t.isupper():
        return True
    return False


def is_translatable(tag) -> bool:
    if not getattr(tag, 'name', None):
        return False
    if tag.name not in TEXT_TAGS:
        return False
    if tag.has_attr('data-i18n') or tag.has_attr('data-i18n-html'):
        return False
    if tag.find_parent(SKIP_TAGS):
        return False
    # skip language switcher / password gate if present
    if tag.find_parent(id='global-lang-switcher') or tag.find_parent(id='pw-gate'):
        return False

    # Only leaf-ish nodes (text + simple inline children)
    for child in tag.children:
        if getattr(child, 'name', None) is None:
            continue
        if child.name not in INLINE:
            return False
        # nested block-like span with many children → skip (parent will handle or children will)
        if child.name in {'div'}:
            return False

    text = tag.get_text(strip=True)
    if is_noise(text) or not looks_english(text):
        return False

    # Prefer not to tag huge containers
    if len(text) > 1200:
        return False

    # If this node only wraps a single child that is also a TEXT_TAG with same text, skip (prefer child)
    children = [c for c in tag.children if not (isinstance(c, NavigableString) and not str(c).strip())]
    if len(children) == 1 and getattr(children[0], 'name', None) in TEXT_TAGS:
        return False

    return True


def load_json(path: str) -> dict:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def save_json(path: str, data: dict) -> None:
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def translate_batch(translator, texts, delay=0.08):
    out = []
    for t in texts:
        try:
            # Google free endpoint struggles with very long HTML; strip for safety if needed
            hi = translator.translate(t)
            out.append(hi if hi else t)
            time.sleep(delay)
        except Exception as e:
            print('  translate fail:', str(e)[:80])
            out.append(t)
            time.sleep(0.4)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tag-only', action='store_true')
    ap.add_argument('--limit', type=int, default=0, help='Max new translations (0 = unlimited)')
    ap.add_argument('--files', nargs='*', help='Optional subset of html files')
    args = ap.parse_args()

    en_path = 'public/lang/en.json'
    hi_path = 'public/lang/hi.json'
    en_dict = load_json(en_path)
    hi_dict = load_json(hi_path)

    translator = None
    if not args.tag_only:
        if GoogleTranslator is None:
            raise SystemExit('deep_translator not installed')
        translator = GoogleTranslator(source='en', target='hi')

    html_files = args.files or sorted(glob.glob('*.html'))
    tagged = 0
    translated = 0
    pending_keys = []  # (key, en_text)

    for filepath in html_files:
        name = os.path.basename(filepath)
        if name in SKIP_FILES:
            continue
        print('Processing', name, '...')
        with open(filepath, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')

        # strip comments noise
        for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
            c.extract()

        prefix = page_prefix(name)
        modified = False

        for tag in list(soup.find_all(TEXT_TAGS)):
            if not is_translatable(tag):
                continue
            inner_html = ''.join(str(c) for c in tag.contents).strip()
            if not inner_html:
                continue
            # skip attributes-looking fragments
            if re.search(r'\b(class|style|href|src)=', inner_html) and '<' not in inner_html:
                continue

            key = f'{prefix}.{get_hash(inner_html)}'
            # keep existing key if already present on another page with same hash content
            tag['data-i18n-html'] = key
            tagged += 1
            modified = True

            if key not in en_dict:
                en_dict[key] = inner_html
            if key not in hi_dict or hi_dict.get(key) == en_dict.get(key):
                # need translation if missing or still English copy
                pending_keys.append((key, en_dict[key]))

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(str(soup))

    # Also queue any en keys that still lack a real Hindi value
    for k, t in en_dict.items():
        if not isinstance(t, str):
            continue
        existing = hi_dict.get(k)
        needs = (
            k not in hi_dict
            or not existing
            or existing == t
            or (looks_english(t) and looks_english(str(existing)) and str(existing) == t)
        )
        if needs and looks_english(t):
            pending_keys.append((k, t))

    # de-dupe pending by key
    seen = set()
    unique_pending = []
    for k, t in pending_keys:
        if k in seen:
            continue
        seen.add(k)
        existing = hi_dict.get(k)
        if (
            existing
            and existing != t
            and looks_english(t)
            and not looks_english(str(existing))
        ):
            continue
        unique_pending.append((k, t))

    print(f'Tagged {tagged} elements. Pending translations: {len(unique_pending)}')

    if not args.tag_only and unique_pending:
        if args.limit:
            unique_pending = unique_pending[: args.limit]
        print(f'Translating {len(unique_pending)} strings...')

        # Cache by normalized plain text so repeated UI labels translate once
        text_cache = {}
        for k, existing in hi_dict.items():
            src = en_dict.get(k)
            if isinstance(src, str) and isinstance(existing, str) and existing != src:
                plain = BeautifulSoup(src, 'html.parser').get_text(' ', strip=True)
                if plain and not looks_english(existing):
                    text_cache[plain] = existing

        for i, (key, text) in enumerate(unique_pending, 1):
            plain = BeautifulSoup(text, 'html.parser').get_text(' ', strip=True)
            if plain in text_cache:
                hi_dict[key] = text_cache[plain]
                translated += 1
                continue

            to_send = text if ('<' in text and '>' in text and len(text) < 4500) else plain
            if not to_send or not to_send.strip():
                hi_dict[key] = text
                continue
            try:
                hi = translator.translate(to_send[:4500])
                hi = hi if hi else text
                hi_dict[key] = hi
                text_cache[plain] = hi
                translated += 1
                if i % 25 == 0:
                    print(f'  ... {i}/{len(unique_pending)} (unique cache {len(text_cache)})')
                    save_json(en_path, en_dict)
                    save_json(hi_path, hi_dict)
                    save_json('lang/en.json', en_dict)
                    save_json('lang/hi.json', hi_dict)
                time.sleep(0.05)
            except Exception as e:
                print('  fail', key, e)
                hi_dict[key] = text
                time.sleep(0.6)

    # always keep nested start-here keys; write both public and lang/
    save_json(en_path, en_dict)
    save_json(hi_path, hi_dict)
    save_json('lang/en.json', en_dict)
    save_json('lang/hi.json', hi_dict)

    print(f'Done. New translations: {translated}. en keys: {len(en_dict)}, hi keys: {len(hi_dict)}')


if __name__ == '__main__':
    main()
