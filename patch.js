const fs = require('fs');
const path = require('path');
const dir = '.';
const tag = '  <script type="module" src="global-lang.js"></script>';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'book-raw.html');
files.forEach(f => {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('global-lang.js')) {
        content = content.replace('</body>', tag + '\n</body>');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Patched: ' + f);
    }
});