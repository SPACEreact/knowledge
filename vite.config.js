import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/knowledge/',
  root: '.',
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
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
