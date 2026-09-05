import { defineConfig } from 'vite';
import { basename, resolve } from 'node:path';
import { renderAtlasShell, routeInfo } from './atlas-navigation.js';

// GoatCounter analytics – injects tracking script into every HTML page
function goatCounterAnalytics() {
  const snippet = `<script data-goatcounter="https://himanshudr.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`;
  return {
    name: 'goatcounter-analytics',
    transformIndexHtml(html) {
      return html.replace('</body>', `  ${snippet}\n</body>`);
    }
  };
}

// One shell for every entry point. Individual knowledge pages keep their
// content, while navigation, type, colour, language and responsive behavior
// are maintained from one source.
function unifiedAtlasShell() {
  return {
    name: 'unified-atlas-shell',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const current = basename(context.filename);
        const { activeGroup, categoryLabel } = routeInfo(current);
        let rendered = html
          .replace(/\s*<link[^>]+href=["']https:\/\/fonts\.googleapis\.com[^>]*>\s*/gi, '\n')
          .replace(/\s*<link[^>]+href=["']https:\/\/fonts\.gstatic\.com[^>]*>\s*/gi, '\n')
          .replace(/<meta\b(?=[^>]*name=["']theme-color["'])[^>]*>/gi, '')
          .replace(/<html\b[^>]*>/i, '<html lang="en" class="ua-night dark ua-no-js" data-theme="dark">')
          .replace(/<body\b([^>]*)>/i, (_, attrs) => {
            const clean = attrs.replace(/\s*(?:class|data-page|data-category)=["'][^"']*["']/gi, '');
            const classes = attrs.match(/\bclass=["']([^"']*)["']/i)?.[1] || '';
            return `<body${clean} class="${classes} unified-atlas" data-page="${current.replace('.html', '')}" data-category="${activeGroup?.key || 'reference'}">`;
          });

        if (current === 'book.html') {
          rendered = rendered.replace(/(<body\b[^>]*>)([\s\S]*)(<\/body>)/i,
            '$1<main class="book-page">$2</main>$3');
        }
        let mainId = 'main-content';
        let foundMain = false;
        rendered = rendered.replace(/<(?:main\b[^>]*|div\b[^>]*class=["'][^"']*\b(?:main-content|wrap)\b[^"']*["'][^>]*)>/i, (tag) => {
          foundMain = true;
          mainId = tag.match(/\bid=["']([^"']*)["']/i)?.[1] || mainId;
          let output = /\bclass=/.test(tag)
            ? tag.replace(/\bclass=(["'])(.*?)\1/, (_, quote, value) => `class=${quote}${value} ua-main${quote}`)
            : tag.replace(/>$/, ' class="ua-main">');
          if (!/\bid=/.test(output)) output = output.replace(/>$/, ` id="${mainId}">`);
          if (!/\btabindex=/.test(output)) output = output.replace(/>$/, ' tabindex="-1">');
          return `${output}\n<div class="ua-page-meta"><a href="index.html">Knowledge atlas</a><span aria-hidden="true">/</span><span>${categoryLabel}</span></div>`;
        });
        if (!foundMain) throw new Error(`No main reading surface found in ${current}`);
        rendered = rendered.replace(/(<body\b[^>]*>)/i, `$1\n${renderAtlasShell(current, mainId)}`);

        return {
          html: rendered,
          tags: [
            { tag: 'meta', attrs: { name: 'theme-color', content: '#171114' }, injectTo: 'head-prepend' },
            { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' }, injectTo: 'head-prepend' },
            { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }, injectTo: 'head-prepend' },
            {
              tag: 'link',
              attrs: {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Noto+Sans+Devanagari:wght@400;500;600&family=Source+Sans+3:wght@400;500;600&family=Tiro+Devanagari+Hindi:ital@0;1&display=swap',
              },
              injectTo: 'head-prepend',
            },
            { tag: 'script', attrs: { type: 'module', src: '/unified-shell.js' }, injectTo: 'body' },
          ],
        };
      }
    }
  };
}

export default defineConfig({
  base: '/knowledge/',
  root: '.',
  plugins: [unifiedAtlasShell(), goatCounterAnalytics()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        storytelling: resolve(import.meta.dirname, 'storytelling.html'),
        design: resolve(import.meta.dirname, 'design.html'),
        cinematography: resolve(import.meta.dirname, 'cinematography.html'),
        sound: resolve(import.meta.dirname, 'sound.html'),
        editing: resolve(import.meta.dirname, 'editing.html'),
        motion: resolve(import.meta.dirname, 'motion.html'),
        styleReference: resolve(import.meta.dirname, 'style-reference.html'),
        craftNotes: resolve(import.meta.dirname, 'craft-notes.html'),
        resources: resolve(import.meta.dirname, 'resources.html'),
        filmmakingKeywords: resolve(import.meta.dirname, 'filmmaking-keywords.html'),
        editingRhythm: resolve(import.meta.dirname, 'editing-rhythm.html'),
        storyEmotion: resolve(import.meta.dirname, 'story-emotion.html'),
        mographKeywords: resolve(import.meta.dirname, 'mograph-keywords.html'),
        aiVisual: resolve(import.meta.dirname, 'ai-visual.html'),
        ideation: resolve(import.meta.dirname, 'ideation.html'),
        emotionGrammar: resolve(import.meta.dirname, 'emotion-grammar.html'),
        sceneGrammar: resolve(import.meta.dirname, 'scene-grammar.html'),
        playgrounds: resolve(import.meta.dirname, 'playgrounds.html'),
        visualStory: resolve(import.meta.dirname, 'visual-story.html'),
        skillTree: resolve(import.meta.dirname, 'skill-tree.html'),
        audienceParticipation: resolve(import.meta.dirname, 'audience-participation.html'),
        humanLayers: resolve(import.meta.dirname, 'human-layers.html'),
        humanLayersEnhanced: resolve(import.meta.dirname, 'human-layers-enhanced.html'),
        startHere: resolve(import.meta.dirname, 'start-here.html'),
        visualLiteracy: resolve(import.meta.dirname, 'visual-literacy.html'),
        book: resolve(import.meta.dirname, 'book.html'),
      }
    }
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['terminal.local'],
    port: 5173,
    open: true
  }
});
