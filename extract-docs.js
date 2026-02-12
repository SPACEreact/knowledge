// Script to extract text from docx files
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, '..');
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.docx'));

async function extractAll() {
    for (const file of files) {
        console.log('\n========== ' + file + ' ==========\n');
        try {
            const result = await mammoth.extractRawText({ path: path.join(docsDir, file) });
            console.log(result.value);
        } catch (err) {
            console.log('Error:', err.message);
        }
    }
}

extractAll();
