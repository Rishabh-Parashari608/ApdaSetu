// Persistent Floating SOS Trigger & Full Emergency Report Modal

window.ApdaSOSModal = {
  countdownTimer: null,
  countdownSeconds: 5,
  currentCoords: [26.1445, 91.7362],
  uploadedMedia: [],
  speechRecognition: null,

  init() {
    this.setupSpeechRecognition();
  },

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = 'en-IN';

      this.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const descInput = document.getElementById('sos-description');
        if (descInput) {
          descInput.value = (descInput.value + ' ' + transcript).trim();
          this.updateLiveAIScore();
        }
        this.updateMicButton(false);
      };

      this.speechRecognition.onerror = () => {
        this.updateMicButton(false);
      };

      this.speechRecognition.onend = () => {
        this.updateMicButton(false);
      };
    }
  },

  toggleVoiceInput() {
    if (!this.speechRecognition) {
      if (window.ApdaState) {
        window.ApdaState.notify('Speech recognition is not supported on this browser', 'warning');
      }
      return;
    }
    try {
      this.speechRecognition.start();
      this.updateMicButton(true);
    } catch (e) {
      this.speechRecognition.stop();
      this.updateMicButton(false);
    }
  },

  updateMicButton(isListening) {
    const btn = document.getElementById('mic-btn');
    if (btn) {
      if (isListening) {
        btn.className = 'p-2 rounded-xl bg-red-600 text-white animate-pulse shadow-lg';
        btn.innerHTML = '🎙️ Listening...';
      } else {
        btn.className = 'p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1';
        btn.innerHTML = '🎙️ Voice Input';
      }
    }
  },

  // 1-Tap Quick Panic Countdown Trigger
  triggerPanicSOS() {
    this.close();
    this.countdownSeconds = 5;

    const modal = document.createElement('div');
    modal.id = 'panic-countdown-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-lg modal-animate-in';
    modal.innerHTML = `
      <div class="glass-panel-danger w-full max-w-md rounded-3xl p-8 text-center text-white border-2 border-red-500 shadow-2xl relative animate-radar">
        <div class="w-24 h-24 rounded-full bg-red-600/30 border-4 border-red-500 flex items-center justify-center mx-auto mb-4 animate-beacon">
          <span class="text-4xl font-black text-white" id="panic-countdown-num">5</span>
        </div>
        
        <h2 class="text-2xl font-black text-red-400 uppercase tracking-wide">Transmitting Emergency SOS</h2>
        <p class="text-xs text-slate-300 mt-2">
          Locking GPS coordinates & notifying NDRF Command + 3 Family Contacts...
        </p>

        <div class="mt-6 flex flex-col gap-3">
          <button onclick="window.ApdaSOSModal.executeInstantSOS()" class="w-full py-3.5 bg-red-600 hover:bg-red-500 font-extrabold text-white rounded-2xl shadow-xl shadow-red-600/60 uppercase tracking-wider text-sm transition-transform active:scale-95">
            🚨 Send Immediately (Skip Timer)
          </button>
          
          <button onclick="window.ApdaSOSModal.cancelPanicSOS()" class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl border border-slate-700 text-xs transition-colors">
            ✕ False Alarm / Cancel SOS
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    if (window.ApdaSoundEngine) {
      window.ApdaSoundEngine.playChime('sos');
    }

    this.countdownTimer = setInterval(() => {
      this.countdownSeconds -= 1;
      const numEl = document.getElementById('panic-countdown-num');
      if (numEl) numEl.textContent = this.countdownSeconds;

      if (this.countdownSeconds <= 0) {
        clearInterval(this.countdownTimer);
        this.executeInstantSOS();
      }
    }, 1000);
  },

  cancelPanicSOS() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    const modal = document.getElementById('panic-countdown-modal');
    if (modal) modal.remove();
    if (window.ApdaState) {
      window.ApdaState.notify('Emergency SOS cancelled by user', 'info');
    }
  },

  executeInstantSOS() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    const modal = document.getElementById('panic-countdown-modal');
    if (modal) modal.remove();

    // Auto capture GPS or default
    const sosPayload = {
      userName: window.ApdaState.currentUser ? window.ApdaState.currentUser.name : 'Citizen Emergency Distress',
      userPhone: window.ApdaState.currentUser ? window.ApdaState.currentUser.phone : '+91 98765 43210',
      disasterType: 'flood',
      severity: 'critical',
      coordinates: this.currentCoords,
      address: 'GPS Auto-Lock: Sector 4, Kamrup Metro Inundation Zone',
      peopleAffected: 4,
      vulnerable: { infants: 1, elderly: 1, injured: 0 },
      description: 'IMMEDIATE PANIC SOS: Water rising rapidly. Urgent rescue boat required.',
      media: []
    };

    window.ApdaState.addEmergencyRequest(sosPayload);
  },

  // Open Full Emergency Report Modal
  openReportModal(prefillType = 'flood') {
    this.close();
    this.uploadedMedia = [];

    const modal = document.createElement('div');
    modal.id = 'sos-report-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto modal-animate-in';
    modal.innerHTML = `
      <div class="glass-panel-danger w-full max-w-2xl rounded-3xl p-6 sm:p-8 text-white border-2 border-red-500/80 shadow-2xl relative my-8">
        
        <div class="flex items-center justify-between pb-4 border-b border-red-500/30">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-2xl animate-pulse">
              🚨
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-white">Emergency SOS Report</h2>
              <p class="text-xs text-red-300">AI-Assisted Triage • Direct Transmit to NDRF & State Command</p>
            </div>
          </div>
          <button onclick="window.ApdaSOSModal.close()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-bold">×</button>
        </div>

        <form onsubmit="window.ApdaSOSModal.handleFormSubmit(event)" class="space-y-4 mt-5">
          
          <!-- Disaster Type Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">1. Disaster Category</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${[
                { id: 'flood', label: 'Flood / Water', icon: '🌊' },
                { id: 'cyclone', label: 'Cyclone / Storm', icon: '🌀' },
                { id: 'landslide', label: 'Landslide', icon: '⛰️' },
                { id: 'earthquake', label: 'Earthquake', icon: '🏚️' },
                { id: 'forest_fire', label: 'Forest Fire', icon: '🔥' },
                { id: 'collapse', label: 'Building Collapse', icon: '🏢' },
                { id: 'medical', label: 'Medical Trauma', icon: '🩺' },
                { id: 'other', label: 'Other Hazard', icon: '⚠️' }
              ].map(d => `
                <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-700 bg-slate-900/80 cursor-pointer hover:border-red-500 transition-all">
                  <input type="radio" name="sos-disaster-type" value="${d.id}" ${d.id === prefillType ? 'checked' : ''} onchange="window.ApdaSOSModal.updateLiveAIScore()" class="accent-red-500">
                  <span class="text-sm">${d.icon}</span>
                  <span class="text-xs font-semibold text-slate-200">${d.label}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- GPS Location Capture -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">2. Location & GPS Coordinate</label>
              <button type="button" onclick="window.ApdaSOSModal.fetchCurrentGPS()" class="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
                <span>📍 Auto-Fetch GPS</span>
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" id="sos-address" required placeholder="House / Landmark / Street" value="Hatigaon By-lane 3, Guwahati" class="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              <input type="text" id="sos-coords" readonly value="26.1445, 91.7362" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-emerald-400 font-mono text-center">
            </div>
          </div>

          <!-- People Affected & Vulnerable Demographics -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">3. Total People Affected</label>
              <div class="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
                <button type="button" onclick="window.ApdaSOSModal.adjustCount('sos-people-count', -1)" class="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-lg hover:bg-slate-700">-</button>
                <input type="number" id="sos-people-count" min="1" max="500" value="4" onchange="window.ApdaSOSModal.updateLiveAIScore()" class="flex-1 bg-transparent text-center text-sm font-bold text-white focus:outline-none">
                <button type="button" onclick="window.ApdaSOSModal.adjustCount('sos-people-count', 1)" class="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-lg hover:bg-slate-700">+</button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Vulnerable Population</label>
              <div class="grid grid-cols-3 gap-1.5 text-center">
                <div class="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <span class="text-[10px] text-slate-400 block">Infants</span>
                  <input type="number" id="sos-infants" min="0" value="1" onchange="window.ApdaSOSModal.updateLiveAIScore()" class="w-full bg-transparent text-center font-bold text-xs text-white">
                </div>
                <div class="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <span class="text-[10px] text-slate-400 block">Elderly</span>
                  <input type="number" id="sos-elderly" min="0" value="1" onchange="window.ApdaSOSModal.updateLiveAIScore()" class="w-full bg-transparent text-center font-bold text-xs text-white">
                </div>
                <div class="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <span class="text-[10px] text-slate-400 block">Injured</span>
                  <input type="number" id="sos-injured" min="0" value="0" onchange="window.ApdaSOSModal.updateLiveAIScore()" class="w-full bg-transparent text-center font-bold text-xs text-red-400">
                </div>
              </div>
            </div>
          </div>

          <!-- Photo/Media Upload Mock Simulator -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">4. Photo / Video Evidence</label>
              <span class="text-[11px] text-emerald-400">+20% AI Confidence boost</span>
            </div>
            <div class="flex items-center gap-3">
              <button type="button" onclick="window.ApdaSOSModal.simulateMediaAttach()" class="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-600 hover:border-red-500 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all">
                <span>📷</span> Attach Disaster Photo / Clip
              </button>
              <div id="attached-media-preview" class="flex items-center gap-2"></div>
            </div>
          </div>

          <!-- Description with Voice-to-Text -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">5. Situation Description</label>
              <button type="button" id="mic-btn" onclick="window.ApdaSOSModal.toggleVoiceInput()" class="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1">
                🎙️ Voice Input
              </button>
            </div>
            <textarea id="sos-description" rows="3" oninput="window.ApdaSOSModal.updateLiveAIScore()" placeholder="Mention trapped victims, medical urgency, water level, structural damage..." class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500">Trapped on 2nd floor roof. Flood water rising fast. Infant and 75yr elderly with insulin requirement need boat evacuation.</textarea>
          </div>

          <!-- LIVE AI SCORE PREVIEW CARD -->
          <div id="live-ai-preview-box" class="p-4 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-amber-950/70 border border-red-500/40">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <span>🤖</span> Live AI Triage Assessment
              </span>
              <span id="ai-risk-badge" class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-600/30 text-red-300 border border-red-500/50">
                CRITICAL (92/100)
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-slate-400 block text-[11px]">AI Confidence (Genuineness)</span>
                <div class="w-full bg-slate-800 rounded-full h-2 mt-1 overflow-hidden">
                  <div id="ai-conf-bar" class="bg-emerald-500 h-full rounded-full transition-all duration-300" style="width: 94%"></div>
                </div>
                <span id="ai-conf-text" class="text-[11px] font-bold text-emerald-400 mt-0.5 block">94% Verified</span>
              </div>

              <div>
                <span class="text-slate-400 block text-[11px]">Urgency Risk Score</span>
                <div class="w-full bg-slate-800 rounded-full h-2 mt-1 overflow-hidden">
                  <div id="ai-risk-bar" class="bg-red-500 h-full rounded-full transition-all duration-300" style="width: 92%"></div>
                </div>
                <span id="ai-risk-text" class="text-[11px] font-bold text-red-400 mt-0.5 block">92/100 (Immediate Dispatch)</span>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 font-extrabold text-white rounded-2xl shadow-xl shadow-red-600/40 uppercase tracking-wider text-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
            <span>🚨</span> Broadcast Multi-Channel SOS
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    this.updateLiveAIScore();
  },

  close() {
    const el = document.getElementById('sos-report-modal');
    if (el) el.remove();
  },

  adjustCount(inputId, delta) {
    const el = document.getElementById(inputId);
    if (el) {
      const current = parseInt(el.value) || 1;
      el.value = Math.max(1, current + delta);
      this.updateLiveAIScore();
    }
  },

  fetchCurrentGPS() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.currentCoords = [pos.coords.latitude, pos.coords.longitude];
          const coordsInput = document.getElementById('sos-coords');
          if (coordsInput) coordsInput.value = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          this.updateLiveAIScore();
          if (window.ApdaState) {
            window.ApdaState.notify('High-precision GPS coordinates locked', 'success');
          }
        },
        () => {
          // Fallback simulation
          this.currentCoords = [26.1445, 91.7362];
          const coordsInput = document.getElementById('sos-coords');
          if (coordsInput) coordsInput.value = `26.1445, 91.7362 (Simulated GPS)`;
        }
      );
    }
  },

  simulateMediaAttach() {
    this.uploadedMedia = [
      {
        type: 'image',
        url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="60" viewBox="0 0 80 60"%3E%3Crect width="80" height="60" fill="%231e3a8a"/%3E%3Cpath d="M0 35 Q20 30 40 35 T80 35 L80 60 L0 60 Z" fill="%233b82f6"/%3E%3Crect x="30" y="20" width="20" height="15" fill="%23b45309"/%3E%3C/svg%3E',
        tag: 'Flooded Ground Floor & Rooftop Distress'
      }
    ];

    const preview = document.getElementById('attached-media-preview');
    if (preview) {
      preview.innerHTML = `
        <div class="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-slate-800 border border-emerald-500/40 text-[11px] text-emerald-300">
          <span>🖼️ Inundation_Evidence.jpg</span>
          <button type="button" onclick="window.ApdaSOSModal.uploadedMedia = []; this.parentElement.remove(); window.ApdaSOSModal.updateLiveAIScore();" class="text-red-400 font-bold ml-1">×</button>
        </div>
      `;
    }
    this.updateLiveAIScore();
  },

  updateLiveAIScore() {
    const typeEl = document.querySelector('input[name="sos-disaster-type"]:checked');
    const disasterType = typeEl ? typeEl.value : 'flood';
    const peopleAffected = document.getElementById('sos-people-count') ? parseInt(document.getElementById('sos-people-count').value) : 4;
    const infants = document.getElementById('sos-infants') ? parseInt(document.getElementById('sos-infants').value) : 0;
    const elderly = document.getElementById('sos-elderly') ? parseInt(document.getElementById('sos-elderly').value) : 0;
    const injured = document.getElementById('sos-injured') ? parseInt(document.getElementById('sos-injured').value) : 0;
    const description = document.getElementById('sos-description') ? document.getElementById('sos-description').value : '';

    const draftReport = {
      disasterType,
      peopleAffected,
      coordinates: this.currentCoords,
      media: this.uploadedMedia,
      userPhone: '+91 98765 43210',
      vulnerable: { infants, elderly, injured },
      description
    };

    const aiRes = window.ApdaAIEngine.evaluateReport(draftReport, window.ApdaState.requests);

    const badge = document.getElementById('ai-risk-badge');
    const confBar = document.getElementById('ai-conf-bar');
    const confText = document.getElementById('ai-conf-text');
    const riskBar = document.getElementById('ai-risk-bar');
    const riskText = document.getElementById('ai-risk-text');

    if (badge) {
      badge.textContent = `${aiRes.riskLevel} (${aiRes.riskScore}/100)`;
      badge.className = `px-2.5 py-0.5 rounded-full text-xs font-extrabold ${aiRes.riskScore >= 80 ? 'bg-red-600/30 text-red-300 border border-red-500/50' : aiRes.riskScore >= 60 ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'}`;
    }
    if (confBar) confBar.style.width = `${aiRes.confidence}%`;
    if (confText) confText.textContent = `${aiRes.confidence}% Verified (Cluster: ${aiRes.clusterCount} nearby)`;
    if (riskBar) riskBar.style.width = `${aiRes.riskScore}%`;
    if (riskText) riskText.textContent = `${aiRes.riskScore}/100 (${aiRes.keywordsDetected.slice(0, 3).join(', ') || 'Standard Triage'})`;
  },

  handleFormSubmit(e) {
    e.preventDefault();
    const typeEl = document.querySelector('input[name="sos-disaster-type"]:checked');
    const payload = {
      userName: window.ApdaState.currentUser ? window.ApdaState.currentUser.name : 'Citizen Emergency Distress',
      userPhone: window.ApdaState.currentUser ? window.ApdaState.currentUser.phone : '+91 98765 43210',
      disasterType: typeEl ? typeEl.value : 'flood',
      severity: 'critical',
      coordinates: this.currentCoords,
      address: document.getElementById('sos-address').value || 'Guwahati Sector 4',
      peopleAffected: parseInt(document.getElementById('sos-people-count').value) || 1,
      vulnerable: {
        infants: parseInt(document.getElementById('sos-infants').value) || 0,
        elderly: parseInt(document.getElementById('sos-elderly').value) || 0,
        injured: parseInt(document.getElementById('sos-injured').value) || 0
      },
      description: document.getElementById('sos-description').value,
      media: this.uploadedMedia
    };

    this.close();
    window.ApdaState.addEmergencyRequest(payload);
  }
};
