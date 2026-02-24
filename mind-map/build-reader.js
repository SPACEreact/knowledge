import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawHtmlPath = path.join(__dirname, 'book-raw.html');
const outputPath = path.join(__dirname, 'visual-story.html');

const rawHtml = fs.readFileSync(rawHtmlPath, 'utf8');

// Extract just the body content if it exists
let match = rawHtml.match(/<div class="book-content">([\s\S]*?)<\/div>\s*<\/body>/);
let content = match ? match[1] : rawHtml;

// Make headers assign IDs so we can link to them
let headerCounter = 0;
content = content.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
    headerCounter++;
    const id = `section-${headerCounter}`;
    return `<${tag} id="${id}" class="book-header"${attrs}>${inner}</${tag}>`;
});

// A nice structure for our reader
const finalHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Visual Story - Premium Reader</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                        serif: ['Merriweather', 'Georgia', 'serif'],
                    },
                    colors: {
                        surface: { DEFAULT: '#09090b', 50: '#18181b', 100: '#1c1c20', 200: '#27272a' }
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #09090b;
            color: #d4d4d8;
            font-family: 'Merriweather', serif;
            line-height: 1.8;
            font-size: 1.125rem;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }

        /* Ambient Glow */
        .ambient-glow {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        }

        .ambient-glow::before {
            content: '';
            position: absolute;
            top: var(--y, 50%);
            left: var(--x, 50%);
            transform: translate(-50%, -50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
            transition: width 0.3s, height 0.3s;
        }

        /* Progress Bar */
        #progress-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: #27272a;
            z-index: 100;
        }

        #progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            width: 0%;
            transition: width 0.1s;
        }

        /* Reader Layout */
        .reader-container {
            position: relative;
            z-index: 10;
            max-w-3xl;
            margin: 0 auto;
            padding: 4rem 1.5rem 8rem 1.5rem;
            max-width: 720px;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: 'Inter', sans-serif;
            color: #fafafa;
            margin-top: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
            scroll-margin-top: 6rem;
        }

        h1 { font-size: 2.5rem; color: #fff; text-align: center; margin-bottom: 2rem; }
        h2 { font-size: 1.875rem; border-bottom: 1px solid #27272a; padding-bottom: 0.5rem; }
        h3 { font-size: 1.5rem; color: #e4e4e7; }
        
        p {
            margin-bottom: 1.5rem;
        }

        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 2rem auto;
            display: block;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            border: 1px solid #27272a;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
        }
        
        td, th {
            border: 1px solid #3f3f46;
            padding: 0.75rem;
        }

        /* Back Button */
        .back-btn {
            position: fixed;
            top: 1.5rem;
            left: 1.5rem;
            z-index: 50;
            background: rgba(24, 24, 27, 0.8);
            backdrop-filter: blur(8px);
            border: 1px solid #3f3f46;
            color: #a1a1aa;
            padding: 0.5rem 1rem;
            border-radius: 999px;
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
        }

        .back-btn:hover {
            color: #fafafa;
            border-color: #52525b;
            background: rgba(39, 39, 42, 0.9);
        }

        /* Floating Sidebar TOC */
        .toc-trigger {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 50;
            background: #18181b;
            border: 1px solid #3f3f46;
            padding: 0.75rem 1.25rem;
            border-radius: 999px;
            color: #e4e4e7;
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            cursor: pointer;
            box-shadow: 0 8px 30px rgba(0,0,0,0.5);
            transition: all 0.2s;
        }
        .toc-trigger:hover {
            border-color: #8b5cf6;
            color: #fff;
        }
        
        .toc-panel {
            position: fixed;
            bottom: 5rem;
            right: 2rem;
            width: 320px;
            max-height: 60vh;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 12px;
            z-index: 49;
            padding: 1rem;
            overflow-y: auto;
            transform: translateY(20px);
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            font-family: 'Inter', sans-serif;
        }
        .toc-panel.active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }
        .toc-panel a {
            display: block;
            color: #a1a1aa;
            text-decoration: none;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.875rem;
            transition: background 0.2s, color 0.2s;
        }
        .toc-panel a:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }
        
    </style>
</head>
<body>
    <div class="ambient-glow" id="glow"></div>
    
    <div id="progress-container">
        <div id="progress-bar"></div>
    </div>

    <a href="index.html" class="back-btn">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Back to Framework
    </a>

    <button class="toc-trigger" id="tocBtn">Outline</button>
    <div class="toc-panel" id="tocPanel">
        <div class="font-bold text-white mb-3 tracking-wider text-xs uppercase">Chapters</div>
        <!-- TOC Content will be injected here via JS -->
    </div>

    <div class="reader-container">
        <!-- Content injected here -->
        ${content}
    </div>

    <script>
        // Progress Bar
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            document.getElementById("progress-bar").style.width = scrolled + "%";
        });

        // Ambient Glow
        const glow = document.getElementById('glow');
        document.addEventListener('mousemove', (e) => {
            glow.style.setProperty('--x', e.clientX + 'px');
            glow.style.setProperty('--y', e.clientY + 'px');
        });

        // TOC Toggle & Generation
        const tocBtn = document.getElementById('tocBtn');
        const tocPanel = document.getElementById('tocPanel');
        
        tocBtn.addEventListener('click', () => {
            tocPanel.classList.toggle('active');
        });

        // Generate TOC dynamically from headers
        const headers = document.querySelectorAll('.reader-container h1, .reader-container h2');
        let tocHtml = '';
        headers.forEach(h => {
            const level = h.tagName.toLowerCase() === 'h1' ? 'pl-0 font-bold text-gray-200' : 'pl-4 text-gray-400 text-sm';
            if(h.id) {
                tocHtml += \`<a href="#\${h.id}" class="\${level}">\${h.innerText}</a>\`;
            }
        });
        tocPanel.innerHTML += tocHtml;
        
        // Hide TOC on click outside
        document.addEventListener('click', (e) => {
            if (!tocBtn.contains(e.target) && !tocPanel.contains(e.target)) {
                tocPanel.classList.remove('active');
            }
        });

        // Track knowledge progress
        localStorage.setItem('visualStoryReadFlag', 'true');
    </script>
</body>
</html>`;

fs.writeFileSync(outputPath, finalHtml);
console.log('Premium reader created at ' + outputPath);
