import fs from 'fs';
import path from 'path';

const dir = 'D:\\antigravity\\knowledge\\mind-map';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const insertLink = `        <a href="audience-participation.html" class="sidebar-link"><span>◬</span> Audience Participation</a>
        <div class="sidebar-section-title">Tools &amp; Reference</div>`;

const searchString = '<div class="sidebar-section-title">Tools & Reference</div>';
const searchString2 = '<div class="sidebar-section-title">Tools &amp; Reference</div>';

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Prevent double injection
    if (content.includes('href="audience-participation.html"')) {
        console.log(`Skipping ${file} - already injected`);
        return;
    }

    if (content.includes(searchString)) {
        content = content.replace(searchString, `        <a href="audience-participation.html" class="sidebar-link"><span>◬</span> Audience Participation</a>\n        <div class="sidebar-section-title">Tools & Reference</div>`);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${file}`);
    } else if (content.includes(searchString2)) {
         content = content.replace(searchString2, insertLink);
         fs.writeFileSync(filePath, content, 'utf-8');
         console.log(`Updated ${file} (encoded escape)`);
    } else {
        console.log(`Could not find Tools & Reference in ${file}`);
    }
});
