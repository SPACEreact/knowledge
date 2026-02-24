import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookPath = path.join(__dirname, '..', '738192065-Bruce-Block-The-Visual-Story-Creating-the-Visual-Structure-of-Film-TV-And-Digital-Media-2021.docx');
const outputPath = path.join(__dirname, 'book-raw.html');
const imagesDir = path.join(__dirname, 'book-images');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

let imageCounter = 0;

const options = {
    convertImage: mammoth.images.inline(function (element) {
        return element.read("base64").then(function (imageBuffer) {
            imageCounter++;
            const extension = element.contentType.split('/')[1] || 'png';
            const filename = `image_${imageCounter}.${extension}`;
            const imagePath = path.join(imagesDir, filename);

            fs.writeFileSync(imagePath, Buffer.from(imageBuffer, 'base64'));

            return {
                src: `book-images/${filename}`
            };
        });
    })
};

async function extractBook() {
    try {
        console.log('Converting docx to HTML with external images...');
        const result = await mammoth.convertToHtml({ path: bookPath }, options);

        let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>The Visual Story</title>
</head>
<body>
    <div class="book-content">
        ${result.value}
    </div>
</body>
</html>`;
        fs.writeFileSync(outputPath, htmlContent);
        console.log(`Successfully converted. HTML saved to ${outputPath}. Extracted ${imageCounter} images.`);
    } catch (err) {
        console.error('Error:', err);
    }
}

extractBook();
