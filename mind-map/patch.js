import fs from 'fs';
const tag = '  <script type="module" src="global-lang.js"></script>';
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'book-raw.html');
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('global-lang.js')) {
        content = content.replace('</body>', tag + '\n</body>');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Patched ' + file);
    }
}
