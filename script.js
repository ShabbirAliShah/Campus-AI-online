/* =============================================
   CAMPUS AI v3 — script.js  (Web / Production)
   No offline/Tauri dependencies
   ============================================= */
'use strict';

// ═══════════════════════════════════════════
// DOM
// ═══════════════════════════════════════════
const $ = id => document.getElementById(id);

const chatWindow         = $('chat-window');
const chatFeed           = $('chat-feed');
const userInput          = $('user-input');
const sendBtn            = $('send-btn');
const stopBtn            = $('stop-btn');
const newChatBtn         = $('new-chat-btn');
const mobileNewChatBtn   = $('mobile-new-chat-btn');
const historyList        = $('history-list');
const headerTitle        = $('header-title');
const promptTokensEl     = $('prompt-tokens');
const genTokensEl        = $('gen-tokens');
const presetSelect       = $('preset-select');
const presetLabel        = $('preset-label');
const charCount          = $('char-count');
const ctxBarFill         = $('ctx-bar-fill');
const ctxPct             = $('ctx-pct');
const chatInterface      = $('chat-interface');
const welcomeHero        = $('welcome-hero');
const termsPage          = $('terms-page');
const privacyPage        = $('privacy-page');
const aboutPage          = $('about-page');
const settingsDrawer     = $('settings-drawer');
const bookmarksDrawer    = $('bookmarks-drawer');
const providerDrawer     = $('provider-drawer');
const bookmarksList      = $('bookmarks-list');
const menuToggle         = $('menu-toggle');
const dropdownMenu       = $('dropdown-menu');
const healthDot          = $('health-dot');
const healthLabel        = $('health-label');
const imgGenBtn          = $('img-gen-btn');
const providerBadgeLabel = $('provider-badge-label');
const activeProviderLbl  = $('active-provider-label');
const activeModelLbl     = $('active-model-label');
const cookieBanner       = $('cookie-banner');
const sidebar            = $('sidebar');
const sidebarOverlay     = $('sidebar-overlay');
const mobileMenuBtn      = $('mobile-menu-btn');

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
let sessions         = {};
let currentSessionId = '';
let abortController  = null;
let promptHistory    = [];
let promptHistoryIdx = -1;
let bookmarks        = [];

// ═══════════════════════════════════════════
// AI PROVIDERS
// ═══════════════════════════════════════════
const PROVIDERS = {
    groq: {
        id: 'groq', name: 'Groq', icon: '⚡', needsKey: true,
        keyLink: 'https://console.groq.com/keys',
        models: [
            { id: 'llama-3.3-70b-versatile',      name: 'Llama 3.3 70B',        desc: 'Meta Llama 3.3 70B — fast, highly capable. Free: 14,400 req/day.' },
            { id: 'llama-3.1-8b-instant',          name: 'Llama 3.1 8B Instant', desc: 'Fastest Groq model. Great for quick answers. Very generous free tier.' },
            { id: 'mixtral-8x7b-32768',            name: 'Mixtral 8x7B 32K',     desc: 'Mistral MoE — 32K context window. Strong reasoning. Free tier.' },
            { id: 'gemma2-9b-it',                  name: 'Gemma 2 9B',           desc: "Google's Gemma 2 9B instruction-tuned. Free on Groq." },
            { id: 'qwen-qwq-32b',                  name: 'QwQ 32B (Reasoning)',  desc: 'Qwen reasoning model — deep chain-of-thought. Free on Groq.' },
            { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B',      desc: 'DeepSeek R1 distilled on Llama 70B — strong reasoning. Free.' }
        ]
    },
    openrouter: {
        id: 'openrouter', name: 'OpenRouter', icon: '🔀', needsKey: true,
        keyLink: 'https://openrouter.ai/keys',
        models: [
            { id: 'google/gemma-3-27b-it:free',                  name: 'Gemma 3 27B (free)',        desc: 'Google Gemma 3 27B — free tier on OpenRouter.' },
            { id: 'meta-llama/llama-3.2-11b-vision-instruct:free',name: 'Llama 3.2 11B Vision (free)',desc: 'Multimodal Llama — understands images. Free.' },
            { id: 'microsoft/phi-4-reasoning:free',               name: 'Phi-4 Reasoning (free)',   desc: 'Microsoft Phi-4 reasoning model. Free on OpenRouter.' },
            { id: 'qwen/qwen3-8b:free',                           name: 'Qwen 3 8B (free)',         desc: 'Alibaba Qwen 3 8B — strong multilingual model. Free.' },
            { id: 'deepseek/deepseek-r1:free',                    name: 'DeepSeek R1 (free)',       desc: 'Full DeepSeek R1 reasoning model. Free on OpenRouter.' },
            { id: 'mistralai/mistral-7b-instruct:free',           name: 'Mistral 7B (free)',        desc: 'Classic Mistral 7B — always free on OpenRouter.' },
            { id: 'openchat/openchat-7b:free',                    name: 'OpenChat 7B (free)',       desc: 'OpenChat 7B — good for conversation. Free.' }
        ]
    },
    gemini: {
        id: 'gemini', name: 'Google Gemini', icon: '✦', needsKey: true,
        keyLink: 'https://aistudio.google.com/app/apikey',
        models: [
            { id: 'gemini-2.0-flash',      name: 'Gemini 2.0 Flash',      desc: 'Google\'s fastest model. Free: 15 req/min, 1,500 req/day.' },
            { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', desc: 'Lightest Gemini. Highest free tier limits.' },
            { id: 'gemini-1.5-flash',      name: 'Gemini 1.5 Flash',      desc: '1M context window. Great for long documents. Free tier.' },
            { id: 'gemini-1.5-pro',        name: 'Gemini 1.5 Pro',        desc: 'Most capable Gemini. Free: 2 req/min. Best for complex tasks.' }
        ]
    }
};

// ═══════════════════════════════════════════
// IMAGE PROVIDERS
// ═══════════════════════════════════════════
const IMG_PROVIDERS = {
    pollinations: {
        id: 'pollinations', name: 'Pollinations.ai', icon: '🌸', needsKey: false,
        keyLink: '', desc: '100% free, no account needed. Instant image generation.'
    },
    hf: {
        id: 'hf', name: 'Hugging Face', icon: '🤗', needsKey: true,
        keyLink: 'https://huggingface.co/settings/tokens',
        desc: 'Free with HF account. Uses FLUX.1-schnell — higher quality.'
    }
};

// ═══════════════════════════════════════════
// PROVIDER STATE
// ═══════════════════════════════════════════
let activeProvider    = '';
let activeModel       = '';
let activeImgProvider = 'pollinations';
let apiKeys           = {};

function loadProviderState() {
    try {
        const s = JSON.parse(localStorage.getItem('campus_provider') || '{}');
        activeProvider    = s.activeProvider    || '';
        activeModel       = s.activeModel       || '';
        activeImgProvider = s.activeImgProvider || 'pollinations';
        apiKeys           = s.apiKeys           || {};
    } catch {}
}

function saveProviderState() {
    localStorage.setItem('campus_provider', JSON.stringify({
        activeProvider, activeModel, activeImgProvider, apiKeys
    }));
}

function updateProviderUI() {
    const p = PROVIDERS[activeProvider];
    const m = p?.models.find(x => x.id === activeModel) || p?.models[0];
    if (providerBadgeLabel) {
        providerBadgeLabel.textContent = p
            ? `${p.icon} ${p.name} · ${m?.name || ''}`
            : 'Click ⚙ to set up a provider';
    }
    if (activeProviderLbl) activeProviderLbl.textContent = p?.name || 'None';
    if (activeModelLbl)    activeModelLbl.textContent    = m?.name  || '—';
    if (healthDot) healthDot.className = 'health-dot ' + (p ? 'cloud' : '');
    if (healthLabel) healthLabel.textContent = p ? 'Ready' : 'No provider';
}

// ═══════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════
const DEFAULTS = { temperature: 0.7, maxTokens: 1024, topP: 0.9 };
let settings = { ...DEFAULTS };

function loadSettings() {
    try { settings = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('campus_settings') || '{}') }; } catch {}
    applySettingsToUI();
}
function saveSettings() { localStorage.setItem('campus_settings', JSON.stringify(settings)); }
function applySettingsToUI() {
    [['s-temperature','temperature','temp-val'],['s-max-tokens','maxTokens','tokens-val'],['s-top-p','topP','topp-val']]
    .forEach(([sid,key,vid]) => { const sl=$(sid),vl=$(vid); if(sl) sl.value=settings[key]; if(vl) vl.textContent=settings[key]; });
}
function wireSlider(sid, key, vid) {
    const el = $(sid); if (!el) return;
    el.addEventListener('input', () => { settings[key] = parseFloat(el.value); const vl=$(vid); if(vl) vl.textContent=settings[key]; saveSettings(); });
}
wireSlider('s-temperature','temperature','temp-val');
wireSlider('s-max-tokens','maxTokens','tokens-val');
wireSlider('s-top-p','topP','topp-val');
const srb = $('settings-reset-btn');
if (srb) srb.addEventListener('click', () => { settings={...DEFAULTS}; saveSettings(); applySettingsToUI(); });

// ═══════════════════════════════════════════
// SUBJECT PRESETS
// ═══════════════════════════════════════════
const PRESETS = {
    general: { label:'General',  system:'You are Campus AI, a helpful and friendly AI assistant for students and educators, created by Syed Shabbir Jan for the Leisure Campus Education Equity Initiative. Answer clearly, accurately, and professionally.' },
    code:    { label:'Code',     system:'You are Campus AI in Code Helper mode. Focus on programming, debugging, algorithms, and software engineering. Always provide well-commented code examples and explain the logic step by step.' },
    essay:   { label:'Essay',    system:'You are Campus AI in Essay Reviewer mode. Help students plan, structure, write, and improve essays and academic writing. Provide structured feedback on argument, clarity, grammar, and flow.' },
    math:    { label:'Math',     system:'You are Campus AI in Math Tutor mode. Solve mathematical problems step by step, showing all working and explaining every formula. Support school to university level mathematics.' },
    science: { label:'Science',  system:'You are Campus AI in Science Guide mode. Explain scientific concepts clearly using examples and real-world applications. Cover physics, chemistry, biology, and earth sciences.' }
};

function getSystemPrompt(wantsDetail) {
    const k = presetSelect ? presetSelect.value : 'general';
    return (PRESETS[k] || PRESETS.general).system +
        (wantsDetail ? ' The user has asked for a detailed response — provide a thorough, structured, comprehensive answer.' : ' Be concise and direct unless more detail is needed.');
}
if (presetSelect) {
    presetSelect.addEventListener('change', () => {
        const p = PRESETS[presetSelect.value];
        if (presetLabel) presetLabel.textContent = p ? p.label : 'General';
    });
}

// ═══════════════════════════════════════════
// COOKIE CONSENT
// ═══════════════════════════════════════════
function initCookieBanner() {
    if (!cookieBanner) return;
    if (localStorage.getItem('campus_cookie_ok') === '1') {
        cookieBanner.classList.add('hidden');
        return;
    }
    cookieBanner.classList.remove('hidden');
    const btn = $('cookie-accept');
    if (btn) btn.addEventListener('click', () => {
        localStorage.setItem('campus_cookie_ok', '1');
        cookieBanner.classList.add('hidden');
    });
    const termsLink = $('terms-menu-btn-cookie');
    if (termsLink) termsLink.addEventListener('click', (e) => { e.preventDefault(); showSubPage(termsPage); });
}

// ═══════════════════════════════════════════
// MOBILE SIDEBAR
// ═══════════════════════════════════════════
function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) { sidebarOverlay.classList.add('active'); sidebarOverlay.removeAttribute('aria-hidden'); }
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
}
function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) { sidebarOverlay.classList.remove('active'); sidebarOverlay.setAttribute('aria-hidden', 'true'); }
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
}
if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
const ALL_DRAWERS   = () => [settingsDrawer, bookmarksDrawer, providerDrawer].filter(Boolean);
const ALL_SUBPAGES  = () => [termsPage, privacyPage, aboutPage].filter(Boolean);

function hideAllOverlays() {
    ALL_DRAWERS().forEach(el => el.style.display = 'none');
    ALL_SUBPAGES().forEach(el => el.style.display = 'none');
    closeDropdown();
}

function showChat() {
    hideAllOverlays();
    if (welcomeHero)    welcomeHero.hidden = true;
    if (chatInterface)  chatInterface.style.display = 'flex';
}

function showHero() {
    hideAllOverlays();
    if (chatInterface)  chatInterface.style.display = 'none';
    if (welcomeHero) { welcomeHero.hidden = false; welcomeHero.removeAttribute('hidden'); }
}

function showDrawer(el) {
    ALL_DRAWERS().forEach(d => d.style.display = 'none');
    if (el) el.style.display = 'block';
    // ensure chat is still visible behind drawer
    if (chatInterface && chatInterface.style.display !== 'flex') chatInterface.style.display = 'flex';
    if (welcomeHero && !welcomeHero.hidden) {} // leave hero if visible
}

function showSubPage(el) {
    hideAllOverlays();
    if (chatInterface) chatInterface.style.display = 'none';
    if (welcomeHero) welcomeHero.hidden = true;
    if (el) el.style.display = 'block';
}

function backToChat() {
    hideAllOverlays();
    // Go back to hero if no session active, else chat
    if (!currentSessionId || !sessions[currentSessionId]?.history?.length) {
        const ids = Object.keys(sessions);
        if (!ids.length || !sessions[ids[0]]?.history?.length) { showHero(); return; }
    }
    showChat();
    setHeader(sessions[currentSessionId]?.title || 'New Conversation');
}

function setHeader(t) { if (headerTitle) headerTitle.textContent = t; }
function scrollToBottom() { if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight; }
function updateCtxBar(tok) {
    const pct = Math.min(100, Math.round((tok / Math.max(settings.maxTokens * 4, 2048)) * 100));
    if (ctxBarFill) { ctxBarFill.style.width = pct + '%'; ctxBarFill.className = 'ctx-bar-fill' + (pct > 85 ? ' crit' : pct > 65 ? ' warn' : ''); }
    if (ctxPct) ctxPct.textContent = pct + '%';
}

// Dropdown
function toggleDropdown() { if (dropdownMenu) { const open = dropdownMenu.classList.toggle('active'); if (menuToggle) menuToggle.setAttribute('aria-expanded', open); } }
function closeDropdown()   { if (dropdownMenu) { dropdownMenu.classList.remove('active'); if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false'); } }
document.addEventListener('click', e => { if (!e.target.closest('.menu-container')) closeDropdown(); });
if (menuToggle) menuToggle.addEventListener('click', e => { e.stopPropagation(); toggleDropdown(); });

// Wire all nav buttons
const wire = (id, fn) => { const el=$(id); if(el) el.addEventListener('click', fn); };
wire('settings-btn',          () => showDrawer(settingsDrawer));
wire('settings-close-btn',    () => { if(settingsDrawer) settingsDrawer.style.display='none'; });
wire('bookmarks-btn',         () => { renderBookmarks(); showDrawer(bookmarksDrawer); });
wire('bookmarks-close-btn',   () => { if(bookmarksDrawer) bookmarksDrawer.style.display='none'; });
wire('export-btn',            exportChat);
wire('open-provider-btn',     () => { buildProviderDrawer(); showDrawer(providerDrawer); });
wire('provider-close-btn',    () => { if(providerDrawer) providerDrawer.style.display='none'; });
wire('terms-menu-btn',        () => { showSubPage(termsPage); setHeader('Terms of Service'); closeSidebar(); });
wire('privacy-menu-btn',      () => { showSubPage(privacyPage); setHeader('Privacy Policy'); closeSidebar(); });
wire('about-menu-btn',        () => { showSubPage(aboutPage); setHeader('About Campus AI'); closeSidebar(); });
wire('terms-back-btn',        backToChat);
wire('privacy-back-btn',      backToChat);
wire('about-back-btn',        backToChat);
wire('terms-link-sidebar',    (e) => { e.preventDefault(); showSubPage(termsPage); setHeader('Terms of Service'); closeSidebar(); });
wire('privacy-link-sidebar',  (e) => { e.preventDefault(); showSubPage(privacyPage); setHeader('Privacy Policy'); closeSidebar(); });
wire('about-link-sidebar',    (e) => { e.preventDefault(); showSubPage(aboutPage); setHeader('About Campus AI'); closeSidebar(); });
wire('hero-start-btn', () => {
    // Go straight to chat with image gen prompt pre-filled
    if (!currentSessionId || !sessions[currentSessionId]) startNewSession();
    if (welcomeHero) welcomeHero.hidden = true;
    if (chatInterface) chatInterface.style.display = 'flex';
    if (userInput) {
        userInput.value = '/imagine ';
        userInput.focus();
        userInput.selectionStart = userInput.selectionEnd = userInput.value.length;
    }
});
wire('hero-setup-btn', () => {
    buildProviderDrawer(); showDrawer(providerDrawer);
    if (welcomeHero) welcomeHero.hidden = true;
    if (chatInterface) chatInterface.style.display = 'flex';
});

// ═══════════════════════════════════════════
// PROVIDER DRAWER
// ═══════════════════════════════════════════
let drawerActiveProvider    = 'groq';
let drawerActiveImgProvider = 'pollinations';

function buildProviderDrawer() {
    drawerActiveProvider    = activeProvider || 'groq';
    drawerActiveImgProvider = activeImgProvider || 'pollinations';
    renderProviderTabs();
    renderImgProviderTabs();
    updateDrawerModelList();
    updateDrawerKeyGroup();
    updateDrawerImgKeyGroup();

    wire('provider-save-btn', saveProviderFromDrawer);

    // key visibility toggles
    setupKeyToggle('api-key-toggle', 'api-key-input');
    setupKeyToggle('img-api-key-toggle', 'img-api-key-input');
}

function setupKeyToggle(toggleId, inputId) {
    const btn = $(toggleId), inp = $(inputId);
    if (!btn || !inp) return;
    btn.onclick = () => { inp.type = inp.type==='password'?'text':'password'; btn.textContent = inp.type==='password'?'Show':'Hide'; };
}

function saveProviderFromDrawer() {
    activeProvider    = drawerActiveProvider;
    activeImgProvider = drawerActiveImgProvider;
    const modelSel    = $('model-select');
    activeModel       = modelSel ? modelSel.value : (PROVIDERS[activeProvider]?.models[0]?.id || '');

    const keyInput    = $('api-key-input');
    if (keyInput?.value.trim()) apiKeys[drawerActiveProvider] = keyInput.value.trim();
    const imgKeyInput = $('img-api-key-input');
    if (imgKeyInput?.value.trim()) apiKeys['img_'+drawerActiveImgProvider] = imgKeyInput.value.trim();

    saveProviderState();
    updateProviderUI();

    const msg = $('provider-status-msg');
    if (msg) { msg.textContent = '✓ Provider saved! You can start chatting.'; setTimeout(()=>msg.textContent='', 3000); }

    // If chat is not showing yet, show it
    if (!currentSessionId) startNewSession();
    else showChat();
    if (providerDrawer) providerDrawer.style.display = 'none';
}

function renderProviderTabs() {
    const tabs = $('provider-tabs'); if (!tabs) return;
    tabs.innerHTML = '';
    Object.values(PROVIDERS).forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'provider-tab' + (p.id === drawerActiveProvider ? ' active' : '');
        btn.textContent = p.icon + ' ' + p.name;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', p.id === drawerActiveProvider ? 'true' : 'false');
        btn.addEventListener('click', () => { drawerActiveProvider = p.id; renderProviderTabs(); updateDrawerModelList(); updateDrawerKeyGroup(); });
        tabs.appendChild(btn);
    });
}

function updateDrawerModelList() {
    const p = PROVIDERS[drawerActiveProvider], modelSel = $('model-select'), modelDesc = $('model-desc');
    if (!modelSel || !p) return;
    modelSel.innerHTML = '';
    p.models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id; opt.textContent = m.name;
        if (m.id === activeModel && drawerActiveProvider === activeProvider) opt.selected = true;
        modelSel.appendChild(opt);
    });
    modelSel.onchange = () => { const m=p.models.find(x=>x.id===modelSel.value); if(modelDesc&&m) modelDesc.textContent=m.desc; };
    const cur = p.models.find(x=>x.id===modelSel.value) || p.models[0];
    if (modelDesc && cur) modelDesc.textContent = cur.desc;
    updateDrawerKeyGroup();
}

function updateDrawerKeyGroup() {
    const p=PROVIDERS[drawerActiveProvider], grp=$('api-key-group'), keyInput=$('api-key-input'), getLink=$('api-get-link');
    if (!grp) return;
    if (!p?.needsKey) { grp.style.display='none'; return; }
    grp.style.display='flex'; grp.style.flexDirection='column'; grp.style.gap='6px';
    if (keyInput) { keyInput.value=apiKeys[drawerActiveProvider]||''; keyInput.placeholder=`Paste your ${p.name} API key…`; }
    if (getLink)  { getLink.href=p.keyLink; getLink.textContent=`→ Get a free ${p.name} API key`; }
}

function renderImgProviderTabs() {
    const tabs = $('img-provider-tabs'); if (!tabs) return;
    tabs.innerHTML = '';
    Object.values(IMG_PROVIDERS).forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'provider-tab' + (p.id === drawerActiveImgProvider ? ' active' : '');
        btn.textContent = p.icon + ' ' + p.name;
        btn.title = p.desc;
        btn.addEventListener('click', () => { drawerActiveImgProvider=p.id; renderImgProviderTabs(); updateDrawerImgKeyGroup(); });
        tabs.appendChild(btn);
    });
}

function updateDrawerImgKeyGroup() {
    const p=IMG_PROVIDERS[drawerActiveImgProvider], grp=$('img-api-key-group'), keyInput=$('img-api-key-input'), getLink=$('img-api-link');
    if (!grp) return;
    if (!p?.needsKey) { grp.style.display='none'; return; }
    grp.style.display='flex'; grp.style.flexDirection='column'; grp.style.gap='6px';
    if (keyInput) keyInput.value=apiKeys['img_'+drawerActiveImgProvider]||'';
    if (getLink)  { getLink.href=p.keyLink; getLink.textContent=`→ Get a free ${p.name} token`; }
}

// ═══════════════════════════════════════════
// SESSIONS
// ═══════════════════════════════════════════
function saveSessions() { try { localStorage.setItem('campus_sessions', JSON.stringify(sessions)); } catch {} }
function loadSessions()  { try { const r=localStorage.getItem('campus_sessions'); if(r) sessions=JSON.parse(r); } catch { sessions={}; } }

function startNewSession() {
    const id = 'session_' + Date.now();
    sessions[id] = { title: 'New Chat', history: [], time: Date.now() };
    currentSessionId = id;
    saveSessions(); renderSidebar(); clearChatFeed(); showChat();
    setHeader('New Conversation');
    if (promptTokensEl) promptTokensEl.textContent = '0';
    if (genTokensEl)    genTokensEl.textContent    = '0';
    updateCtxBar(0);
    closeSidebar();
}

function deleteSession(id) {
    if (!confirm('Delete this chat?')) return;
    delete sessions[id]; saveSessions();
    if (id === currentSessionId) {
        const r = Object.keys(sessions).sort((a,b)=>(sessions[b]?.time||0)-(sessions[a]?.time||0));
        if (r.length) switchSession(r[0]); else { currentSessionId=''; showHero(); renderSidebar(); }
    } else renderSidebar();
}

function switchSession(id) {
    if (abortController) abortController.abort();
    currentSessionId = id; renderSidebar(); clearChatFeed(); showChat();
    const s = sessions[id]; setHeader(s.title);
    s.history.forEach(m => appendBubble(m.content, m.role, m.time, false, m.isImage, m.imgUrl));
    scrollToBottom(); closeSidebar();
}

function renderSidebar() {
    if (!historyList) return; historyList.innerHTML = '';
    const ids = Object.keys(sessions).sort((a,b)=>(sessions[b]?.time||0)-(sessions[a]?.time||0));
    if (!ids.length) { historyList.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:8px 4px;">No chats yet. Start a conversation!</div>'; return; }
    ids.forEach(id => {
        const s = sessions[id];
        const time = s.time ? new Date(s.time).toLocaleDateString([],{month:'short',day:'numeric'}) : '';
        const item = document.createElement('div');
        item.className = 'history-item' + (id === currentSessionId ? ' active' : '');
        item.setAttribute('role', 'button'); item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `Chat: ${s.title}`);
        item.innerHTML = `<span class="history-item-title">${escapeHtml(s.title)}</span><span class="history-time">${time}</span><div class="history-item-actions"><button class="history-del-btn" title="Delete chat" aria-label="Delete chat: ${escapeHtml(s.title)}">✕</button></div>`;
        item.addEventListener('click', e => { if(e.target.closest('.history-del-btn')) return; switchSession(id); });
        item.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); switchSession(id); } });
        item.querySelector('.history-del-btn').addEventListener('click', e => { e.stopPropagation(); deleteSession(id); });
        historyList.appendChild(item);
    });
}

function clearChatFeed() {
    if (!chatFeed) return;
    chatFeed.innerHTML = `
        <div class="chat-bubble assistant" style="animation:none" aria-label="AI greeting">
            <div class="avatar ai-avatar" aria-hidden="true">AI</div>
            <div class="bubble-content">
                <p>Hello! I'm <strong>Campus AI</strong> — your free AI assistant. 👋</p>
                <p style="margin-top:8px;color:var(--text-sub);font-size:13px;line-height:1.8;">
                    🖼 <strong style="color:var(--accent-green)">Generate images free — no key needed!</strong><br>
                    Type <code>/imagine a sunset over mountains</code> or click the 🖼 button and press Enter.<br><br>
                    💬 <strong>For chat</strong>, click the <strong>⚙ provider button</strong> in the sidebar and add a free API key from Groq, Gemini, or OpenRouter.
                </p>
            </div>
        </div>`;
    scrollToBottom();
}

if (newChatBtn)       newChatBtn.addEventListener('click', startNewSession);
if (mobileNewChatBtn) mobileNewChatBtn.addEventListener('click', startNewSession);

// ═══════════════════════════════════════════
// BOOKMARKS
// ═══════════════════════════════════════════
function loadBookmarks()  { try { bookmarks=JSON.parse(localStorage.getItem('campus_bookmarks')||'[]'); } catch { bookmarks=[]; } }
function saveBookmarks()  { try { localStorage.setItem('campus_bookmarks',JSON.stringify(bookmarks)); } catch {} }
function addBookmark(text){ bookmarks.unshift({id:Date.now(),text,time:new Date().toLocaleString()}); saveBookmarks(); renderBookmarks(); }
function deleteBookmark(id){ bookmarks=bookmarks.filter(b=>b.id!==id); saveBookmarks(); renderBookmarks(); }
function renderBookmarks() {
    if (!bookmarksList) return;
    if (!bookmarks.length) { bookmarksList.innerHTML='<div class="empty-state">No saved responses yet.<br>Click ☆ on any AI bubble to save it.</div>'; return; }
    bookmarksList.innerHTML='';
    bookmarks.forEach(b => {
        const c=document.createElement('div'); c.className='bookmark-card';
        c.innerHTML=`<div class="bookmark-text">${escapeHtml(b.text.substring(0,300))}${b.text.length>300?'…':''}</div><div class="bookmark-meta">${b.time}</div><div class="bookmark-actions"><button class="bookmark-copy-btn">Copy</button><button class="bookmark-del-btn">Delete</button></div>`;
        c.querySelector('.bookmark-copy-btn').addEventListener('click',()=>navigator.clipboard.writeText(b.text));
        c.querySelector('.bookmark-del-btn').addEventListener('click',()=>deleteBookmark(b.id));
        bookmarksList.appendChild(c);
    });
}

// ═══════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════
function exportChat() {
    const sess = sessions[currentSessionId];
    if (!sess?.history?.length) { alert('No messages to export yet.'); return; }
    let txt = `Campus AI Export\n${sess.title}\n${new Date().toLocaleString()}\n${'─'.repeat(50)}\n\n`;
    sess.history.forEach(m => { txt += `[${m.role==='user'?'You':'Campus AI'}]  ${m.time||''}\n${m.content}\n\n`; });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt],{type:'text/plain;charset=utf-8'}));
    a.download = `campus-ai-${sess.title.replace(/[^a-z0-9]/gi,'_').substring(0,30)}.txt`;
    a.click(); URL.revokeObjectURL(a.href);
}

// ═══════════════════════════════════════════
// FORMATTING
// ═══════════════════════════════════════════
function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function extractThink(text) {
    const re = /<(?:think|thought)>([\s\S]*?)<\/(?:think|thought)>/gi;
    let think = '';
    const cleaned = text.replace(re, (_,inner) => { think += inner.trim()+'\n'; return ''; }).trim();
    return { cleaned, thinkContent: think.trim() };
}

function buildThinkAccordion(t, isLive=false) {
    if (!t) return '';
    if (isLive) return `<div class="think-accordion"><button class="think-toggle" style="cursor:default" aria-label="Reasoning in progress"><em class="think-arrow">▶</em><span>Reasoning… (${t.split(/\s+/).length} words)</span></button></div>`;
    return `<div class="think-accordion"><button class="think-toggle" onclick="toggleThink(this)" aria-expanded="false" aria-label="Show model reasoning"><em class="think-arrow">▶</em><span>Model reasoning · click to expand</span></button><div class="think-body" role="region">${escapeHtml(t)}</div></div>`;
}
window.toggleThink = function(btn) {
    const arrow=btn.querySelector('.think-arrow'), body=btn.nextElementSibling;
    const open=body.classList.toggle('open');
    arrow.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
};

function renderMarkdown(text) {
    if (!text) return '';
    if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true });
        const parts = text.split(/(```[\s\S]*?```)/g);
        return parts.map((part, i) => {
            if (i % 2 === 1) {
                const inner=part.slice(3,-3), nl=inner.indexOf('\n');
                let lang='code', code=inner;
                if(nl!==-1){ lang=inner.substring(0,nl).trim()||'code'; code=inner.substring(nl+1); }
                return `<div class="code-container" role="region" aria-label="${escapeHtml(lang)} code"><div class="code-header"><span>${escapeHtml(lang)}</span><button class="copy-btn" onclick="copyCode(this)" aria-label="Copy code">Copy</button></div><div class="code-block">${escapeHtml(code.trimEnd())}</div></div>`;
            }
            return part ? marked.parse(part) : '';
        }).join('');
    }
    return escapeHtml(text).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>');
}

function renderMessage(raw) { const{cleaned,thinkContent}=extractThink(raw); return buildThinkAccordion(thinkContent,false)+renderMarkdown(cleaned); }

window.copyCode = function(btn) {
    const block=btn.closest('.code-container').querySelector('.code-block');
    navigator.clipboard.writeText(block.innerText||block.textContent).then(()=>{ btn.textContent='Copied!'; setTimeout(()=>btn.textContent='Copy',2000); });
};

// ═══════════════════════════════════════════
// BUBBLE HELPERS
// ═══════════════════════════════════════════
function appendBubble(text, role, timeStr, animate=true, isImage=false, imgUrl='') {
    const now = timeStr || new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    const div = document.createElement('div');
    div.className = 'chat-bubble ' + role;
    if (!animate) div.style.animation = 'none';
    div.dataset.raw = text;
    div.setAttribute('role', role==='assistant' ? 'article' : 'note');

    const contentHtml = isImage && imgUrl ? buildImageBubble(text, imgUrl)
        : role === 'assistant' ? renderMessage(text)
        : escapeHtml(text).replace(/\n/g,'<br>');

    const provTag = role==='assistant' && !isImage && activeProvider
        ? `<div class="bubble-provider-tag">${PROVIDERS[activeProvider]?.icon||''} ${PROVIDERS[activeProvider]?.name||''}</div>` : '';

    if (role === 'assistant') {
        div.innerHTML = `<div class="avatar ai-avatar" aria-hidden="true">AI</div><div class="bubble-content"><div class="bubble-actions" aria-label="Message actions"><button class="bubble-action-btn" aria-label="Copy message" onclick="copyBubble(this)">⎘</button><button class="bubble-action-btn" aria-label="Save to bookmarks" onclick="saveBubble(this)">☆</button></div>${contentHtml}${provTag}<div class="bubble-time">${now}</div></div>`;
    } else {
        div.innerHTML = `<div class="bubble-content"><div class="bubble-actions" aria-label="Message actions"><button class="bubble-action-btn" aria-label="Copy message" onclick="copyBubble(this)">⎘</button></div>${contentHtml}<div class="bubble-time">${now}</div></div>`;
    }

    chatFeed.appendChild(div); scrollToBottom();
    return div.querySelector('.bubble-content');
}

function buildImageBubble(prompt, imgUrl) {
    return `<div class="img-bubble-wrap"><div class="img-bubble-prompt">🖼 "${escapeHtml(prompt)}"</div><img class="img-bubble-img" src="${imgUrl}" alt="${escapeHtml(prompt)}" loading="lazy" onclick="window.open('${imgUrl}','_blank')"><div class="img-bubble-actions"><button class="img-dl-btn" onclick="downloadImage('${imgUrl}','campus-ai-image.png')">⬇ Download</button><button class="img-dl-btn" onclick="window.open('${imgUrl}','_blank')">↗ Open full</button></div></div>`;
}

window.downloadImage = function(url, filename) {
    fetch(url).then(r=>r.blob()).then(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=filename; a.click(); URL.revokeObjectURL(a.href); }).catch(()=>window.open(url,'_blank'));
};
window.copyBubble = function(btn) { const b=btn.closest('.chat-bubble'); navigator.clipboard.writeText(b.dataset.raw||''); btn.textContent='✓'; setTimeout(()=>btn.textContent='⎘',1500); };
window.saveBubble = function(btn) { const b=btn.closest('.chat-bubble'); addBookmark(b.dataset.raw||''); btn.textContent='★'; btn.style.color='var(--accent-gold)'; setTimeout(()=>{ btn.textContent='☆'; btn.style.color=''; },2000); };

// ═══════════════════════════════════════════
// IMAGE GENERATION
// ═══════════════════════════════════════════
async function generateImage(prompt) {
    const msgTime = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    const userDiv = document.createElement('div');
    userDiv.className='chat-bubble user'; userDiv.dataset.raw='/imagine '+prompt;
    userDiv.innerHTML=`<div class="bubble-content"><div class="bubble-actions"><button class="bubble-action-btn" onclick="copyBubble(this)" aria-label="Copy">⎘</button></div>🖼 <em>${escapeHtml(prompt)}</em><div class="bubble-time">${msgTime}</div></div>`;
    chatFeed.appendChild(userDiv);
    const aiDiv=document.createElement('div'); aiDiv.className='chat-bubble assistant';
    aiDiv.innerHTML=`<div class="avatar ai-avatar" aria-hidden="true">AI</div><div class="bubble-content"><div class="img-loading"><div class="img-spinner" aria-hidden="true"></div><span role="status">Generating image…</span></div></div>`;
    chatFeed.appendChild(aiDiv); scrollToBottom();
    const liveContent=aiDiv.querySelector('.bubble-content');

    try {
        let imgUrl;
        if (activeImgProvider === 'pollinations') {
            const seed = Math.floor(Math.random()*9999999);
            imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=520&seed=${seed}&nologo=true&enhance=true&model=flux`;
        } else if (activeImgProvider === 'hf') {
            const hfKey = apiKeys['img_hf'];
            if (!hfKey) throw new Error('No Hugging Face API key set. Open ⚙ Provider settings to add one.');
            const res = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
                method:'POST', headers:{Authorization:`Bearer ${hfKey}`,'Content-Type':'application/json'},
                body:JSON.stringify({inputs:prompt,parameters:{num_inference_steps:4,guidance_scale:0}})
            });
            if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e.error||`HF error ${res.status}`); }
            imgUrl = URL.createObjectURL(await res.blob());
        }

        const aiTime=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
        liveContent.innerHTML=`<div class="bubble-actions"><button class="bubble-action-btn" onclick="saveBubble(this)" aria-label="Save">☆</button></div>${buildImageBubble(prompt,imgUrl)}<div class="bubble-provider-tag">${IMG_PROVIDERS[activeImgProvider]?.icon||''} ${IMG_PROVIDERS[activeImgProvider]?.name||''}</div><div class="bubble-time">${aiTime}</div>`;
        aiDiv.dataset.raw='[Image] '+prompt;
        sessions[currentSessionId].history.push({role:'assistant',content:'[Image] '+prompt,time:aiTime,isImage:true,imgUrl});
        saveSessions();
    } catch(err) {
        liveContent.innerHTML=`<span style="color:var(--accent-red)">⚠ Image generation failed: ${escapeHtml(err.message)}</span>`;
    }
    scrollToBottom();
}

if (imgGenBtn) imgGenBtn.addEventListener('click', () => {
    if (!userInput) return;
    const current = userInput.value.trim();
    if (current && !current.startsWith('/imagine')) {
        userInput.value = '/imagine ' + current;
    } else if (!current) {
        userInput.value = '/imagine ';
    }
    userInput.focus();
    userInput.selectionStart = userInput.selectionEnd = userInput.value.length;
});

// ═══════════════════════════════════════════
// API CALLS
// ═══════════════════════════════════════════
async function* streamSSE(res) {
    const reader=res.body.getReader(), dec=new TextDecoder('utf-8');
    while(true){
        const{done,value}=await reader.read(); if(done) break;
        const chunk=dec.decode(value,{stream:true});
        for(const line of chunk.split('\n')){
            const t=line.trim(); if(!t||!t.startsWith('data: ')) continue;
            const p=t.slice(6).trim(); if(p==='[DONE]') return;
            try{ yield JSON.parse(p); }catch{}
        }
    }
}

async function* streamGemini(res) {
    const reader=res.body.getReader(), dec=new TextDecoder('utf-8'); let buf='';
    while(true){
        const{done,value}=await reader.read(); if(done) break;
        buf+=dec.decode(value,{stream:true});
        const lines=buf.split('\n'); buf=lines.pop()||'';
        for(const line of lines){ const t=line.trim(); if(t.startsWith('data: ')){ try{ yield JSON.parse(t.slice(6)); }catch{} } }
    }
}

async function callOpenAICompat(endpoint, key, model, messages, signal) {
    const res=await fetch(endpoint,{method:'POST',signal,headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model,messages,stream:true,temperature:settings.temperature,max_tokens:settings.maxTokens,top_p:settings.topP})});
    if(!res.ok){ const e=await res.json().catch(()=>({})); throw new Error(e.error?.message||e.message||`API error ${res.status}`); }
    return streamSSE(res);
}

async function callGeminiAPI(model, messages, signal) {
    const key=apiKeys['gemini'];
    if(!key) throw new Error('No Gemini API key. Open ⚙ Provider settings (free at aistudio.google.com).');
    const url=`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${key}&alt=sse`;
    const sysMsg=messages.find(m=>m.role==='system');
    const contents=messages.filter(m=>m.role!=='system').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
    const body={contents,generationConfig:{temperature:settings.temperature,maxOutputTokens:settings.maxTokens,topP:settings.topP}};
    if(sysMsg) body.system_instruction={parts:[{text:sysMsg.content}]};
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
    if(!res.ok){ const e=await res.json().catch(()=>({})); throw new Error(e.error?.message||`Gemini error ${res.status}`); }
    return streamGemini(res);
}

// ═══════════════════════════════════════════
// SEND
// ═══════════════════════════════════════════
async function sendMessage() {
    const rawText = userInput ? userInput.value.trim() : '';
    if (!rawText || abortController) return;

    // ── IMAGE MODE — checked FIRST, needs no API key ──
    // Pollinations.ai is free with no key. Always allow /imagine.
    if (rawText.startsWith('/imagine ') || rawText.startsWith('/imagine')) {
        const prompt = rawText.replace(/^\/imagine\s*/i, '').trim();
        if (!prompt) {
            if (userInput) { userInput.value = '/imagine '; userInput.focus(); }
            return;
        }
        // Ensure a session exists
        if (!currentSessionId || !sessions[currentSessionId]) startNewSession();
        userInput.value = ''; userInput.style.height = 'auto';
        if (charCount) charCount.textContent = '0 chars';
        sessions[currentSessionId].history.push({ role:'user', content: rawText });
        sessions[currentSessionId].time = Date.now();
        if (sessions[currentSessionId].title === 'New Chat') {
            sessions[currentSessionId].title = '🖼 ' + prompt.substring(0, 24);
            setHeader(sessions[currentSessionId].title);
            renderSidebar();
        }
        // Make sure chat interface is visible
        if (welcomeHero) welcomeHero.hidden = true;
        if (chatInterface) chatInterface.style.display = 'flex';
        saveSessions();
        await generateImage(prompt);
        return;
    }

    // ── CHAT MODE — requires a provider + API key ──
    if (!activeProvider || !apiKeys[activeProvider]) {
        buildProviderDrawer(); showDrawer(providerDrawer);
        const msg = $('provider-status-msg');
        if (msg) {
            msg.style.color = 'var(--accent-red)';
            msg.textContent = '⚠ Add a free API key to start chatting. Image generation (/imagine) works without one!';
            setTimeout(() => { msg.textContent = ''; msg.style.color = ''; }, 5000);
        }
        return;
    }

    const wantsDetail=/\b(detailed|comprehensive|in detail|in depth|step by step|complete|full)\b/i.test(rawText);

    if (sessions[currentSessionId].history.length===0) {
        sessions[currentSessionId].title=rawText.substring(0,30)+(rawText.length>30?'…':'');
        setHeader(sessions[currentSessionId].title); renderSidebar();
    }

    promptHistory.unshift(rawText); if(promptHistory.length>50) promptHistory.pop(); promptHistoryIdx=-1;

    const msgTime=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    appendBubble(rawText,'user',msgTime);
    sessions[currentSessionId].history.push({role:'user',content:rawText,time:msgTime});
    sessions[currentSessionId].time=Date.now();

    userInput.value=''; userInput.style.height='auto'; if(charCount) charCount.textContent='0 chars';
    if(stopBtn) stopBtn.style.display='block';

    const liveDiv=document.createElement('div'); liveDiv.className='chat-bubble assistant';
    liveDiv.innerHTML=`<div class="avatar ai-avatar" aria-hidden="true">AI</div><div class="bubble-content streaming-cursor" role="status"><em style="color:var(--text-sub)">Thinking…</em></div>`;
    chatFeed.appendChild(liveDiv); scrollToBottom();
    const liveContent=liveDiv.querySelector('.bubble-content');

    abortController=new AbortController(); const signal=abortController.signal;
    const sysPrompt=getSystemPrompt(wantsDetail);
    const histSlice=sessions[currentSessionId].history.slice(-12);
    const messages=[{role:'system',content:sysPrompt},...histSlice.map(m=>({role:m.role,content:m.content}))];

    let accumulated='', promptTok=0, genTok=0;

    try {
        if (activeProvider==='groq') {
            const key=apiKeys['groq'];
            if(!key) throw new Error('No Groq API key. Open ⚙ Provider settings (free at console.groq.com).');
            for await (const obj of await callOpenAICompat('https://api.groq.com/openai/v1/chat/completions',key,activeModel,messages,signal)) {
                const delta=obj.choices?.[0]?.delta?.content??'';
                if(delta){ accumulated+=delta; const{cleaned,thinkContent}=extractThink(accumulated); liveContent.classList.add('streaming-cursor'); liveContent.innerHTML=buildThinkAccordion(thinkContent,true)+renderMarkdown(cleaned); scrollToBottom(); }
                if(obj.usage){ promptTok=obj.usage.prompt_tokens||0; genTok=obj.usage.completion_tokens||0; }
                if(obj.choices?.[0]?.finish_reason==='stop') break;
            }
        } else if (activeProvider==='openrouter') {
            const key=apiKeys['openrouter'];
            if(!key) throw new Error('No OpenRouter API key. Open ⚙ Provider settings (free at openrouter.ai/keys).');
            for await (const obj of await callOpenAICompat('https://openrouter.ai/api/v1/chat/completions',key,activeModel,messages,signal)) {
                const delta=obj.choices?.[0]?.delta?.content??'';
                if(delta){ accumulated+=delta; const{cleaned,thinkContent}=extractThink(accumulated); liveContent.classList.add('streaming-cursor'); liveContent.innerHTML=buildThinkAccordion(thinkContent,true)+renderMarkdown(cleaned); scrollToBottom(); }
                if(obj.usage){ promptTok=obj.usage.prompt_tokens||0; genTok=obj.usage.completion_tokens||0; }
                if(obj.choices?.[0]?.finish_reason==='stop') break;
            }
        } else if (activeProvider==='gemini') {
            for await (const obj of await callGeminiAPI(activeModel,messages,signal)) {
                const delta=obj.candidates?.[0]?.content?.parts?.[0]?.text??'';
                if(delta){ accumulated+=delta; liveContent.classList.add('streaming-cursor'); liveContent.innerHTML=renderMarkdown(accumulated); scrollToBottom(); }
                if(obj.usageMetadata){ promptTok=obj.usageMetadata.promptTokenCount||0; genTok=obj.usageMetadata.candidatesTokenCount||0; }
            }
        }

        if(promptTokensEl) promptTokensEl.textContent=promptTok;
        if(genTokensEl)    genTokensEl.textContent=genTok;
        updateCtxBar(promptTok);

        const aiTime=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
        const{cleaned:finalText,thinkContent:finalThink}=extractThink(accumulated);
        const provTag=`<div class="bubble-provider-tag">${PROVIDERS[activeProvider]?.icon||''} ${PROVIDERS[activeProvider]?.name||''}</div>`;

        liveContent.classList.remove('streaming-cursor');
        liveContent.innerHTML=`<div class="bubble-actions" aria-label="Message actions"><button class="bubble-action-btn" aria-label="Copy" onclick="copyBubble(this)">⎘</button><button class="bubble-action-btn" aria-label="Save" onclick="saveBubble(this)">☆</button></div>${buildThinkAccordion(finalThink,false)}${renderMarkdown(finalText)}${provTag}<div class="bubble-time">${aiTime}</div>`;
        liveDiv.dataset.raw=finalText;
        sessions[currentSessionId].history.push({role:'assistant',content:finalText,time:aiTime});
        saveSessions();

    } catch(err) {
        liveContent.classList.remove('streaming-cursor');
        if(err.name==='AbortError'){
            const{cleaned}=extractThink(accumulated);
            liveContent.innerHTML=renderMarkdown(cleaned)+'<br><br><strong style="color:var(--text-sub)">⬛ Generation stopped.</strong>';
            liveDiv.dataset.raw=accumulated;
            sessions[currentSessionId].history.push({role:'assistant',content:accumulated.replace(/<(?:think|thought)>[\s\S]*?<\/(?:think|thought)>/gi,'').trim()+' [Stopped]'});
            saveSessions();
        } else {
            console.error(err);
            liveContent.innerHTML=`<div style="color:var(--accent-red);font-size:13px;">⚠ ${escapeHtml(err.message)}</div>`;
        }
    } finally {
        abortController=null; if(stopBtn) stopBtn.style.display='none'; scrollToBottom();
    }
}

if(sendBtn) sendBtn.addEventListener('click', sendMessage);
if(stopBtn) stopBtn.addEventListener('click', () => { if(abortController){ abortController.abort(); abortController=null; } if(stopBtn) stopBtn.style.display='none'; });

if(userInput){
    userInput.addEventListener('input', function(){ this.style.height='auto'; this.style.height=Math.min(this.scrollHeight,150)+'px'; if(charCount) charCount.textContent=this.value.length+' chars'; });
    userInput.addEventListener('keydown', e => {
        if(e.key==='ArrowUp'&&!e.shiftKey&&userInput.value===''){
            e.preventDefault(); if(promptHistoryIdx<promptHistory.length-1){ promptHistoryIdx++; userInput.value=promptHistory[promptHistoryIdx]||''; userInput.dispatchEvent(new Event('input')); }
        } else if(e.key==='ArrowDown'&&!e.shiftKey&&promptHistoryIdx>=0){
            e.preventDefault(); promptHistoryIdx--; userInput.value=promptHistoryIdx>=0?(promptHistory[promptHistoryIdx]||''):''; userInput.dispatchEvent(new Event('input'));
        } else if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMessage(); }
    });
}

// ═══════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════
(function boot() {
    loadSettings();
    loadSessions();
    loadBookmarks();
    loadProviderState();
    updateProviderUI();
    initCookieBanner();
    if(presetLabel) presetLabel.textContent = 'General';

    // Restore last session or show hero
    const ids=Object.keys(sessions).sort((a,b)=>(sessions[b]?.time||0)-(sessions[a]?.time||0));
    if(ids.length) {
        currentSessionId=ids[0]; renderSidebar(); clearChatFeed();
        sessions[currentSessionId].history.forEach(m=>appendBubble(m.content,m.role,m.time,false,m.isImage,m.imgUrl));
        setHeader(sessions[currentSessionId].title); scrollToBottom();
        if(chatInterface) chatInterface.style.display='flex';
        if(welcomeHero)   welcomeHero.hidden=true;
    } else {
        // First visit — show hero
        showHero();
        // Start an empty session in background ready for when they begin
        const id='session_'+Date.now();
        sessions[id]={title:'New Chat',history:[],time:Date.now()};
        currentSessionId=id;
        saveSessions(); renderSidebar();
    }
})();
