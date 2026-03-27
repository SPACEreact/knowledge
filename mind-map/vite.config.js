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

// Password gate – injects a full-screen password overlay into every HTML page
// Password: himanshu@123 (SHA-256 hashed for client-side verification)
function passwordGate() {
  const gate = `
<style>
  body.pw-locked > *:not(#pw-gate) { display: none !important; }
  #pw-gate {
    position: fixed; inset: 0; z-index: 999999;
    background: #09090b;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Inter', system-ui, sans-serif;
  }
  #pw-gate .pw-card {
    background: #18181b; border: 1px solid #27272a; border-radius: 16px;
    padding: 2.5rem; width: 90%; max-width: 380px; text-align: center;
    box-shadow: 0 25px 60px rgba(0,0,0,0.6);
  }
  #pw-gate .pw-icon {
    width: 56px; height: 56px; margin: 0 auto 1.25rem;
    background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15));
    border-radius: 14px; display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
  }
  #pw-gate h2 {
    color: #fafafa; font-size: 1.25rem; font-weight: 700; margin: 0 0 0.35rem;
    letter-spacing: -0.02em;
  }
  #pw-gate .pw-sub {
    color: #71717a; font-size: 0.8rem; margin-bottom: 1.5rem;
  }
  #pw-gate input {
    width: 100%; box-sizing: border-box; padding: 0.7rem 1rem;
    background: #0c0c0f; border: 1px solid #27272a; border-radius: 10px;
    color: #e4e4e7; font-size: 0.9rem; outline: none;
    transition: border-color 0.2s;
  }
  #pw-gate input:focus { border-color: #3b82f6; }
  #pw-gate input.pw-err { border-color: #ef4444; animation: pw-shake 0.4s ease; }
  #pw-gate button {
    width: 100%; margin-top: 0.75rem; padding: 0.7rem;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: #fff; font-weight: 600; font-size: 0.85rem;
    border: none; border-radius: 10px; cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
  }
  #pw-gate button:hover { opacity: 0.92; }
  #pw-gate button:active { transform: scale(0.97); }
  #pw-gate .pw-error-msg {
    color: #ef4444; font-size: 0.75rem; margin-top: 0.6rem;
    min-height: 1.1em;
  }
  @keyframes pw-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    50% { transform: translateX(6px); }
    75% { transform: translateX(-4px); }
  }
</style>
<script>
(function(){
  var HASH = 'a2c31c786c7d39dd4ec74693c9d0264e1f061f417dc558123842526e4f93677b';
  if (sessionStorage.getItem('pw_ok') === '1') return;
  document.documentElement.style.visibility = 'hidden';
  document.addEventListener('DOMContentLoaded', function(){
    document.body.classList.add('pw-locked');
    document.documentElement.style.visibility = '';
    var g = document.createElement('div'); g.id = 'pw-gate';
    g.innerHTML = '<div class="pw-card">'
      + '<div class="pw-icon">🔒</div>'
      + '<h2>Password Required</h2>'
      + '<p class="pw-sub">Enter the password to access this site</p>'
      + '<input id="pw-input" type="password" placeholder="Enter password" autocomplete="off" />'
      + '<button id="pw-btn">Unlock</button>'
      + '<div class="pw-error-msg" id="pw-err"></div>'
      + '</div>';
    document.body.prepend(g);
    var inp = document.getElementById('pw-input');
    var btn = document.getElementById('pw-btn');
    var err = document.getElementById('pw-err');
    async function check(){
      var v = inp.value;
      var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
      var h = Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0')}).join('');
      if (h === HASH) {
        sessionStorage.setItem('pw_ok', '1');
        g.remove();
        document.body.classList.remove('pw-locked');
      } else {
        inp.classList.add('pw-err');
        err.textContent = 'Incorrect password';
        setTimeout(function(){ inp.classList.remove('pw-err'); }, 400);
      }
    }
    btn.addEventListener('click', check);
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter') check(); });
    inp.focus();
  });
})();
</script>`;
  return {
    name: 'password-gate',
    transformIndexHtml(html) {
      return html.replace('<head>', '<head>' + gate);
    }
  };
}

export default defineConfig({
  base: '/knowledge/',
  root: '.',
  plugins: [passwordGate(), goatCounterAnalytics()],
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
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
