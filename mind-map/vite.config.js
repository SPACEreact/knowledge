import { defineConfig } from 'vite';
import { resolve } from 'path';

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
      handler() {
        return [{ tag: 'script', attrs: { type: 'module', src: '/unified-shell.js' }, injectTo: 'body' }];
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
        main: resolve(__dirname, 'index.html'),
        storytelling: resolve(__dirname, 'storytelling.html'),
        design: resolve(__dirname, 'design.html'),
        cinematography: resolve(__dirname, 'cinematography.html'),
        sound: resolve(__dirname, 'sound.html'),
        editing: resolve(__dirname, 'editing.html'),
        motion: resolve(__dirname, 'motion.html'),
        styleReference: resolve(__dirname, 'style-reference.html'),
        craftNotes: resolve(__dirname, 'craft-notes.html'),
        resources: resolve(__dirname, 'resources.html'),
        filmmakingKeywords: resolve(__dirname, 'filmmaking-keywords.html'),
        editingRhythm: resolve(__dirname, 'editing-rhythm.html'),
        storyEmotion: resolve(__dirname, 'story-emotion.html'),
        mographKeywords: resolve(__dirname, 'mograph-keywords.html'),
        aiVisual: resolve(__dirname, 'ai-visual.html'),
        ideation: resolve(__dirname, 'ideation.html'),
        emotionGrammar: resolve(__dirname, 'emotion-grammar.html'),
        sceneGrammar: resolve(__dirname, 'scene-grammar.html'),
        playgrounds: resolve(__dirname, 'playgrounds.html'),
        visualStory: resolve(__dirname, 'visual-story.html'),
        skillTree: resolve(__dirname, 'skill-tree.html'),
        audienceParticipation: resolve(__dirname, 'audience-participation.html'),
        humanLayers: resolve(__dirname, 'human-layers.html'),
        startHere: resolve(__dirname, 'start-here.html'),
        visualLiteracy: resolve(__dirname, 'visual-literacy.html'),
        book: resolve(__dirname, 'book.html'),
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
