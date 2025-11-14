<script defer src="cosmic-assistant.js"></script>
/* cosmic-assistant.js */
(() => {
  const STORAGE_KEY = 'cosmic_responses_v2';
  const DEFAULTS = [
    "✨ Trust your timing — the universe moves when you do.",
    "🌙 Even the stars rest. Breathe before the next step.",
    "🪐 You already have what you seek — just see it clearly.",
    "🌸 Energy flows where your focus goes.",
    "🔥 Creation is born in chaos — keep moving."
  ];

  const loadResponses = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULTS.slice();
      const arr = JSON.parse(raw);
      return Array.isArray(arr) && arr.length ? arr : DEFAULTS.slice();
    } catch { return DEFAULTS.slice(); }
  };

  const saveResponses = (arr) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {}
  };

  // UI elements
  const style = document.createElement('style');
  style.textContent = `
    .cosmic-fab {
      position: fixed; right: 18px; bottom: 18px; z-index: 99999;
      width: 58px; height: 58px; border-radius: 50%;
      background: radial-gradient(120px 120px at 30% 30%, #9c8fff, #6b5de6);
      box-shadow: 0 8px 28px rgba(108, 93, 230, .55);
      display: grid; place-items: center; cursor: pointer; outline: none; border: none;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .cosmic-fab:hover { transform: scale(1.06); box-shadow: 0 10px 36px rgba(108,93,230,.7); }
    .cosmic-fab svg { filter: drop-shadow(0 0 6px rgba(255,255,255,.5)); }

    .cosmic-panel {
      position: fixed; right: 18px; bottom: 86px; z-index: 99998;
      width: min(92vw, 380px); height: 520px; border-radius: 16px;
      background: rgba(5,7,16,.75); backdrop-filter: blur(8px);
      box-shadow: 0 12px 40px rgba(0,0,0,.5), 0 0 30px rgba(155,130,255,.35);
      display: none; overflow: hidden; color: #fff; font-family: Poppins, system-ui, sans-serif;
    }
    .cosmic-header {
      height: 58px; display: flex; align-items: center; justify-content: space-between;
      padding: 0 14px; background: linear-gradient(90deg, rgba(156,143,255,.25), rgba(20,27,45,.2));
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .cosmic-title { font-weight: 700; letter-spacing:.3px; color:#dcd6ff; text-shadow:0 0 10px #9c8fff; }
    .cosmic-close {
      background: transparent; border: none; color: #cfc9ff; font-size: 22px; cursor: pointer;
    }

    .cosmic-chat {
      height: calc(520px - 58px - 64px);
      padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;
    }
    .cosmic-msg { padding: 10px 12px; border-radius: 12px; max-width: 80%; opacity: 0;
      transform: translateY(8px); animation: fadeIn .45s forwards; font-size: 14px; }
    .cosmic-bot { background: rgba(255,255,255,.08); align-self:flex-start; }
    .cosmic-user { background: rgba(156,143,255,.35); align-self:flex-end; }

    @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }

    .cosmic-inputbar {
      height: 64px; display: flex; gap: 8px; align-items: center; padding: 8px 10px;
      border-top: 1px solid rgba(255,255,255,.08); background: rgba(0,0,0,.35);
    }
    .cosmic-input {
      flex: 1; height: 42px; border-radius: 10px; border: 1px solid rgba(255,255,255,.25);
      background: rgba(0,0,0,.45); color: #fff; padding: 0 12px; outline: none; font-size: 14px;
    }
    .cosmic-input::placeholder { color: #bdb8de; }
    .cosmic-send {
      height: 42px; padding: 0 14px; border: none; border-radius: 10px; cursor: pointer;
      background: #8a7dff; color:#fff; font-weight: 700; transition: transform .15s, background .2s;
    }
    .cosmic-send:hover { background: #6b5de6; transform: translateY(-1px); }

    .cosmic-footer {
      text-align:center; font-size: 11px; color: #aaa; padding: 6px 0 8px;
    }
  `;
  document.head.appendChild(style);

  // Elements
  const fab = document.createElement('button');
  fab.className = 'cosmic-fab';
  fab.setAttribute('aria-label','Open Cosmic Assistant');
  fab.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 3c5.5 0 9 3.3 9 7.2 0 4-3.5 7.3-9 7.3-.9 0-1.8-.1-2.6-.3L5 21l1.5-4.3C5.6 15.4 3 13.1 3 10.2 3 6.3 6.5 3 12 3Z" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  document.body.appendChild(fab);

  const panel = document.createElement('div');
  panel.className = 'cosmic-panel';
  panel.innerHTML = `
    <div class="cosmic-header">
      <div class="cosmic-title">🔮 Cosmic Assistant</div>
      <button class="cosmic-close" aria-label="Close">✕</button>
    </div>
    <div class="cosmic-chat" id="cosmic-chat"></div>
    <div class="cosmic-inputbar">
      <input id="cosmic-input" class="cosmic-input" placeholder="Ask the stars..." />
      <button id="cosmic-send" class="cosmic-send">Send</button>
    </div>
    <div class="cosmic-footer">© FabioCruzArteMisticaDigital</div>
  `;
  document.body.appendChild(panel);

  // Sound
  const ping = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_1caa3d90bb.mp3?filename=interface-124464.mp3");

  // Logic
  const chat = panel.querySelector('#cosmic-chat');
  const input = panel.querySelector('#cosmic-input');
  const sendBtn = panel.querySelector('#cosmic-send');
  let responses = loadResponses();

  const addMsg = (txt, who='bot') => {
    const div = document.createElement('div');
    div.className = `cosmic-msg cosmic-${who}`;
    div.textContent = txt;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  };

  const reply = () => {
    const r = responses[Math.floor(Math.random() * responses.length)] || DEFAULTS[0];
    addMsg(r, 'bot');
    try { ping.currentTime = 0; ping.play(); } catch {}
  };

  const send = () => {
    const t = input.value.trim();
    if (!t) return;
    addMsg(t, 'user');
    input.value = '';
    setTimeout(reply, 700);
  };

  // Open/Close
  const open = () => { panel.style.display = 'block'; if (!chat.dataset.welcome){ addMsg("🌌 Welcome, traveler. Ask your question to the universe.", 'bot'); chat.dataset.welcome = '1'; } };
  const close = () => { panel.style.display = 'none'; };

  fab.addEventListener('click', () => panel.style.display === 'block' ? close() : open());
  panel.querySelector('.cosmic-close').addEventListener('click', close);
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

  // Expose a tiny API on window for the control panel
  window.CosmicAssistant = {
    getResponses: () => loadResponses(),
    setResponses: (arr) => { if (Array.isArray(arr)) { responses = arr; saveResponses(arr); } },
    resetDefaults: () => { responses = DEFAULTS.slice(); saveResponses(responses); }
  };
})();
