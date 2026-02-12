// Extract just the Notes document
import mammoth from 'mammoth';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const notesPath = path.join(__dirname, '..', 'Notes..docx');

async function extract() {
    try {
        const result = await mammoth.extractRawText({ path: notesPath });
        console.log(result.value);
    } catch (err) {
        console.log('Error:', err.message);
    }
}

extract();
