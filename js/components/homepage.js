// Public Homepage Component

window.ApdaHomepage = {
  render() {
    const t = (k) => window.ApdaI18n.t(k);
    const alerts = window.ApdaState.alerts;

    return `
      <div class="min-h-screen pb-20">
        
        <!-- Live Disaster Alert Marquee Bar -->
        <div class="bg-red-950/80 border-b border-red-500/30 py-2.5 px-4 overflow-hidden relative">
          <div class="max-w-7xl mx-auto flex items-center gap-3">
            <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[11px] uppercase tracking-wider flex-shrink-0 animate-pulse">
              <span>⚠️</span> LIVE ALERTS
            </span>
            <div class="overflow-hidden flex-1 relative whitespace-nowrap">
              <div class="animate-marquee inline-block text-xs font-semibold text-red-200">
                ${alerts.map(a => `
                  <span class="inline-flex items-center gap-2 mx-6">
                    <span class="w-2 h-2 rounded-full ${a.severity === 'critical' ? 'bg-red-400 animate-ping' : 'bg-amber-400'}"></span>
                    <strong>${a.region}:</strong> ${a.title}
                  </span>
                `).join(' • ')}
              </div>
            </div>
          </div>
        </div>

        <!-- Hero Section -->
        <section class="home-hero reveal-on-scroll relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-none mx-auto">
          <div class="home-hero-overlay absolute inset-0 rounded-[2rem] pointer-events-none"></div>
          <!-- Background Glows -->
          <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute top-1/3 right-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div class="home-hero__content text-center relative z-10 max-w-3xl mx-auto">
            
            <div class="home-hero__eyebrow inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-300/25 text-cyan-200 text-xs font-bold mb-6">
              <span class="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></span>
              National Multi-Agency Disaster Coordination Bridge
            </div>

            <h1 class="home-hero__title text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Rapid Alert & AI-Powered Rescue <br>
              <span class="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                When Seconds Save Lives.
              </span>
            </h1>

            <p class="mt-6 max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
              ${t('missionStatement')}
            </p>

            <!-- Hero Action Buttons -->
            <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onclick="window.ApdaSOSModal.openReportModal()" class="hero-primary-cta w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                <span class="text-xl">🚨</span>
                ${t('reportDisasterNow')}
              </button>

              <button onclick="window.ApdaState.setView('citizen'); window.ApdaState.setCitizenTab('shelters');" class="hero-secondary-cta w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                <span>📍</span>
                ${t('findShelters')}
              </button>
            </div>

            <!-- Fast Stat Counters -->
            <div class="stats-bar reveal-on-scroll grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 p-3 sm:p-4 rounded-2xl text-left">
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="stat-icon text-cyan-300 mb-3">⚠️</span>
                <span class="text-2xl font-black text-white">5</span>
                <p class="text-xs text-cyan-300 font-semibold mt-0.5">Active Critical Zones</p>
                <p class="text-[10px] text-slate-400">Assam, Odisha, UK, MH</p>
              </div>
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="stat-icon text-emerald-300 mb-3">🛟</span>
                <span class="text-2xl font-black text-emerald-400">1,840+</span>
                <p class="text-xs text-slate-300 font-semibold mt-0.5">${t('citizensRescued')}</p>
                <p class="text-[10px] text-slate-400">Past 48 Hours</p>
              </div>
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="stat-icon text-amber-300 mb-3">🏠</span>
                <span class="text-2xl font-black text-amber-400">1,600 Beds</span>
                <p class="text-xs text-slate-300 font-semibold mt-0.5">${t('activeShelters')}</p>
                <p class="text-[10px] text-slate-400">With Live Vacancy</p>
              </div>
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="stat-icon text-sky-300 mb-3">⏱️</span>
                <span class="text-2xl font-black text-info-sky">11 Mins</span>
                <p class="text-xs text-slate-300 font-semibold mt-0.5">Avg Response Time</p>
                <p class="text-[10px] text-slate-400">AI Triage to Dispatch</p>
              </div>
            </div>

          </div>
        </section>

        <!-- 4-Step Interactive Flow Section -->
        <section class="reveal-on-scroll py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs font-extrabold text-cyan-300 uppercase tracking-widest block mb-2">END-TO-END WORKFLOW</span>
            <h2 class="text-3xl font-extrabold text-white">${t('howItWorks')}</h2>
            <p class="text-xs sm:text-sm text-slate-400 mt-2">
              From the moment a citizen clicks SOS to boots on the ground and safe shelter transfer.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <!-- Step 1 -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all relative group">
              <div class="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 flex items-center justify-center text-2xl font-black mb-4 group-hover:scale-110 transition-transform">
                📱
              </div>
              <span class="text-xs font-bold text-cyan-300 uppercase tracking-wider">Step 01</span>
              <h3 class="font-extrabold text-base text-white mt-1">${t('step1Title')}</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                ${t('step1Desc')}
              </p>
            </div>

            <!-- Step 2 -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all relative group">
              <div class="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl font-black mb-4 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 02</span>
              <h3 class="font-extrabold text-base text-white mt-1">${t('step2Title')}</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                ${t('step2Desc')}
              </p>
            </div>

            <!-- Step 3 -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-info-sky/40 transition-all relative group">
              <div class="w-12 h-12 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-2xl font-black mb-4 group-hover:scale-110 transition-transform">
                🚒
              </div>
              <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">Step 03</span>
              <h3 class="font-extrabold text-base text-white mt-1">${t('step3Title')}</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                ${t('step3Desc')}
              </p>
            </div>

            <!-- Step 4 -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all relative group">
              <div class="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl font-black mb-4 group-hover:scale-110 transition-transform">
                🏠
              </div>
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 04</span>
              <h3 class="font-extrabold text-base text-white mt-1">${t('step4Title')}</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                ${t('step4Desc')}
              </p>
            </div>

          </div>
        </section>

        <!-- Feature Highlight Cards -->
        <section class="reveal-on-scroll py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs font-extrabold text-cyan-300 uppercase tracking-widest block mb-2">PLATFORM CAPABILITIES</span>
            <h2 class="text-3xl font-extrabold text-white">Built for Critical Disaster Infrastructure</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <!-- Feature 1: Multi-Channel Communication -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">📡</div>
              <h3 class="font-bold text-lg text-white">Multi-Channel Broadcast Alerting</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Simultaneous web push, SMS (MSG91/Twilio stub), WhatsApp notifications, and audio siren chimes reach vulnerable communities across all channels.
              </p>
            </div>

            <!-- Feature 2: Community Help Chat -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">💬</div>
              <h3 class="font-bold text-lg text-white">Community Help Chat Rooms</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Disaster & location-based mutual aid channels where citizens coordinate water, shelter space, boat transport, hazard alerts, and volunteer moderation.
              </p>
            </div>

            <!-- Feature 3: Interactive Shelter Map -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">🗺️</div>
              <h3 class="font-bold text-lg text-white">Live Shelter Vacancy Network</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Real-time occupancy tracking across NDRF and district shelters, with facilities breakdown (hot meals, infant care, medical bay) and navigation paths.
              </p>
            </div>

            <!-- Feature 4: Unified Command Dashboard -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">⚡</div>
              <h3 class="font-bold text-lg text-white">Unified Responder Command Center</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Live verification triage queue with explainable AI scores, cluster anomaly detection, and seamless multi-agency resource dispatch.
              </p>
            </div>

            <!-- Feature 5: Family Safety Circle -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">👨‍👩‍👧</div>
              <h3 class="font-bold text-lg text-white">Family Safety Circle & Check-in</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                One-tap "I Am Safe" signal broadcast, battery & location status pinging, and peace-of-mind tracking during communication blackouts.
              </p>
            </div>

            <!-- Feature 6: Offline PWA & Low-Bandwidth -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">📶</div>
              <h3 class="font-bold text-lg text-white">Offline PWA & Low-Bandwidth Mode</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Service Worker caches critical Do's & Don'ts and offline SOS queues that auto-sync once cell reception is restored.
              </p>
            </div>

          </div>
        </section>

        <!-- Emergency Helplines Quick Banner -->
        <section class="reveal-on-scroll py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="glass-panel-danger rounded-3xl p-6 sm:p-8 border-2 border-red-500/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center text-3xl flex-shrink-0 animate-pulse">
                📞
              </div>
              <div>
                <h3 class="text-xl font-black text-white">24/7 National Disaster Emergency Hotlines</h3>
                <p class="text-xs text-slate-300 mt-1">Dial 112 (Unified), 1078 (NDRF), 108 (Ambulance), 101 (Fire) — Toll-free across India</p>
              </div>
            </div>
            <button onclick="window.ApdaEmergencyCallModal.open()" class="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap shadow-lg shadow-red-600/40">
              View All Helpline Numbers →
            </button>
          </div>
        </section>

      </div>
    `;
  }
};

window.ApdaEmergencyAssistant = {
  isOpen: false,
  position: null,
  messages: [{ role: 'assistant', text: 'Hello. I can help you understand local risk status, evacuation steps, nearby shelters, and medical support.', source: 'Safety guidance' }],

  renderWidget() {
    return `
      <aside id="emergency-ai-widget" class="emergency-ai-widget ${this.isOpen ? 'is-open' : ''}" aria-label="Emergency AI Assistant">
        <section id="emergency-ai-panel" class="emergency-assistant emergency-ai-panel" style="${this.position ? `left:${this.position.left}px;top:${this.position.top}px;right:auto;bottom:auto;` : ''}" aria-hidden="${!this.isOpen}">
          <div id="emergency-ai-drag-handle" class="emergency-assistant__header emergency-ai-panel__header">
            <div class="flex min-w-0 items-center gap-3">
              <div class="emergency-assistant__bot-icon" aria-hidden="true">&#129302;</div>
              <div class="min-w-0">
                <h2 class="truncate text-sm font-extrabold tracking-wide text-white">Emergency AI Assistant</h2>
                <p class="mt-0.5 truncate text-[10px] text-amber-100/70">Safety guidance &amp; emergency resources</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="emergency-ai-status"><i></i> Ready</span>
              <button type="button" onclick="window.ApdaEmergencyAssistant.close()" class="emergency-ai-cancel" aria-label="Close emergency assistant" title="Close assistant">&#215;</button>
            </div>
          </div>
          <div id="emergency-ai-history" class="emergency-assistant__messages chat-scroll space-y-3 px-4 py-4" aria-live="polite">
            ${this.messages.map(message => this.renderMessage(message.role, message.text, message.source)).join('')}
          </div>
          <div class="emergency-ai-panel__footer">
            <div class="mb-2 flex flex-wrap gap-1.5" aria-label="Suggested questions">
              <button type="button" onclick="window.ApdaEmergencyAssistant.askSuggestion('Where is the nearest shelter?')" class="emergency-assistant__suggestion">Nearest shelter</button>
              <button type="button" onclick="window.ApdaEmergencyAssistant.askSuggestion('What should I do during a flood?')" class="emergency-assistant__suggestion">Flood safety</button>
              <button type="button" onclick="window.ApdaEmergencyAssistant.askSuggestion('Where is the nearest hospital?')" class="emergency-assistant__suggestion">Medical support</button>
            </div>
            <form onsubmit="window.ApdaEmergencyAssistant.handleSubmit(event)" class="flex items-center gap-2">
              <label class="sr-only" for="emergency-ai-input">Ask the emergency AI assistant</label>
              <input id="emergency-ai-input" type="text" required maxlength="500" autocomplete="off" placeholder="Ask about safety, shelters, or medical help..." class="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none">
              <button type="submit" class="emergency-assistant__send shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-950 transition-all">Send <span aria-hidden="true">&#8594;</span></button>
            </form>
            <p class="mt-2 text-[9px] leading-relaxed text-amber-50/55">Immediate danger? Call <a class="font-extrabold text-amber-300 hover:text-amber-100" href="tel:112">112</a>. AI guidance does not replace official instructions.</p>
          </div>
        </section>
        <button type="button" onclick="window.ApdaEmergencyAssistant.toggle()" class="emergency-ai-launcher" aria-expanded="${this.isOpen}" aria-controls="emergency-ai-panel">
          <span class="emergency-ai-launcher__icon" aria-hidden="true">&#129302;</span>
          <span>Emergency AI</span>
          <i aria-hidden="true"></i>
        </button>
      </aside>
    `;
  },

  toggle() { this.isOpen = !this.isOpen; window.ApdaApp.render(); },
  close() { this.isOpen = false; window.ApdaApp.render(); },

  renderMessage(role, text, source) {
    const isUser = role === 'user';
    return `
      <div class="emergency-assistant__message ${isUser ? 'emergency-assistant__message--user' : 'emergency-assistant__message--bot'}">
        <p>${this.escapeHtml(text)}</p>
        ${source ? `<span>${this.escapeHtml(source)}</span>` : ''}
      </div>
    `;
  },

  escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = String(value || '');
    return element.innerHTML;
  },

  appendMessage(role, text, source) {
    this.messages.push({ role, text, source });
    const history = document.getElementById('emergency-ai-history');
    if (!history) return;
    history.insertAdjacentHTML('beforeend', this.renderMessage(role, text, source));
    history.scrollTop = history.scrollHeight;
  },

  fallbackResponse(query) {
    if (/shelter|safe area/i.test(query)) return 'Open the Shelter Map from the citizen dashboard for live locations and vacancies. If travel is unsafe, call 112 for evacuation guidance.';
    if (/flood|water/i.test(query)) return 'Move to higher ground, avoid flooded roads and drains, switch off electricity if it is safe to do so, and follow district authority alerts.';
    if (/hospital|medical|doctor|injur/i.test(query)) return 'For urgent medical care, call 108. Keep the person warm and safe, avoid moving anyone with a suspected spine injury, and share your location with responders.';
    return 'Please follow verified instructions from local emergency managers. For immediate danger, call 112 or submit an SOS report through ApdaSetu.';
  },

  async ask(query) {
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery) return;
    this.appendMessage('user', cleanQuery);
    const history = document.getElementById('emergency-ai-history');
    if (!history) return;
    const loading = document.createElement('div');
    loading.className = 'emergency-assistant__message emergency-assistant__message--bot emergency-assistant__typing';
    loading.textContent = 'Checking safety guidance…';
    history.appendChild(loading);
    history.scrollTop = history.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery })
      });
      if (!response.ok) throw new Error('Chat service unavailable');
      const data = await response.json();
      loading.remove();
      this.appendMessage('assistant', data.response || this.fallbackResponse(cleanQuery), data.source || 'Emergency knowledge base');
    } catch (error) {
      loading.remove();
      this.appendMessage('assistant', this.fallbackResponse(cleanQuery), 'Offline safety guidance');
    }
  },

  handleSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('emergency-ai-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;
    input.value = '';
    this.ask(query);
  },

  askSuggestion(query) {
    this.ask(query);
  },

  initDrag() {
    const panel = document.getElementById('emergency-ai-panel');
    const handle = document.getElementById('emergency-ai-drag-handle');
    if (!panel || !handle) return;
    let startX; let startY; let originLeft; let originTop;
    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      startX = event.clientX; startY = event.clientY;
      const rect = panel.getBoundingClientRect();
      originLeft = rect.left; originTop = rect.top;
      panel.classList.add('is-dragging');
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', (event) => {
      if (!panel.classList.contains('is-dragging')) return;
      const maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
      panel.style.left = `${Math.min(maxLeft, Math.max(8, originLeft + event.clientX - startX))}px`;
      panel.style.top = `${Math.min(maxTop, Math.max(8, originTop + event.clientY - startY))}px`;
      panel.style.right = 'auto'; panel.style.bottom = 'auto';
      this.position = { left: parseInt(panel.style.left, 10), top: parseInt(panel.style.top, 10) };
    });
    const stopDrag = () => panel.classList.remove('is-dragging');
    handle.addEventListener('pointerup', stopDrag);
    handle.addEventListener('pointercancel', stopDrag);
  }
};
