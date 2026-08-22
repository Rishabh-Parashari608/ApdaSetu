// Persistent Floating SOS Trigger & Full Emergency Report Modal

window.ApdaSOSModal = {
  countdownTimer: null,
  countdownSeconds: 5,
  currentCoords: [26.1445, 91.7362],
  uploadedMedia: [],
  speechRecognition: null,
  audioRecorder: null,
  audioStream: null,
  audioChunks: [],
  recordedAudioUrl: null,

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

  async toggleVoiceInput() {
    if (this.audioRecorder && this.audioRecorder.state === 'recording') {
      this.audioRecorder.stop();
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
      window.ApdaState.notify('Audio recording is not supported in this browser', 'warning');
      return;
    }
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.audioRecorder = new MediaRecorder(this.audioStream);
      this.audioRecorder.ondataavailable = event => { if (event.data.size) this.audioChunks.push(event.data); };
      this.audioRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: this.audioRecorder.mimeType || 'audio/webm' });
        if (audioBlob.size) {
          this.recordedAudioUrl = URL.createObjectURL(audioBlob);
          this.uploadedMedia.push({ type: 'audio', url: this.recordedAudioUrl, tag: 'Voice recording' });
        }
        this.audioStream.getTracks().forEach(track => track.stop());
        this.updateMicButton(false, true);
        window.ApdaState.notify('Voice recording attached successfully', 'success');
        this.updateLiveAIScore();
      };
      this.audioRecorder.start();
      this.updateMicButton(true);
    } catch (error) {
      window.ApdaState.notify('Microphone permission is required to record audio', 'warning');
    }
  },

  updateMicButton(isListening, hasRecording = false) {
    const btn = document.getElementById('mic-btn');
    if (btn) {
      if (isListening) {
        btn.className = 'p-2 rounded-xl bg-red-600 text-white animate-pulse shadow-lg';
        btn.textContent = 'Stop Recording';
        return;
        btn.innerHTML = '🎙️ Listening...';
      } else {
        btn.className = 'p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1';
        if (hasRecording) {
          btn.innerHTML = '<span>▶ Play</span><span id="remove-audio-btn" class="ml-1 border-l border-slate-500/60 pl-2 text-red-300 hover:text-white" title="Remove recording">×</span>';
          btn.onclick = () => this.playRecordedAudio();
          document.getElementById('remove-audio-btn').onclick = event => { event.stopPropagation(); this.removeRecordedAudio(); };
          return;
        }
        btn.innerHTML = '🎙️ Voice Input';
      }
    }
  },

  playRecordedAudio() {
    if (!this.recordedAudioUrl) return;
    const player = new Audio(this.recordedAudioUrl);
    player.play().catch(() => window.ApdaState.notify('Unable to play the recorded audio', 'warning'));
  },

  removeRecordedAudio() {
    if (this.recordedAudioUrl) URL.revokeObjectURL(this.recordedAudioUrl);
    this.uploadedMedia = this.uploadedMedia.filter(media => media.type !== 'audio');
    this.recordedAudioUrl = null;
    this.updateMicButton(false);
    window.ApdaState.notify('Voice recording removed', 'info');
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
    this.recordedAudioUrl = null;

    const modal = document.createElement('div');
    modal.id = 'sos-report-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto modal-animate-in sos-report-backdrop';
    modal.innerHTML = `
      <div class="glass-panel-danger w-full max-w-2xl rounded-none sm:rounded-3xl p-5 sm:p-8 text-white border-0 sm:border-2 border-red-500/80 shadow-2xl relative sos-report-panel">
        
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

        <form onsubmit="window.ApdaSOSModal.handleFormSubmit(event)" class="space-y-4 mt-5 sos-report-form">
          
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
              ].filter(d => !['collapse', 'medical', 'other'].includes(d.id)).map(d => `
                <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-700 bg-slate-900/80 cursor-pointer hover:border-red-500 transition-all">
                  <input type="radio" name="sos-disaster-type" value="${d.id}" ${d.id === prefillType ? 'checked' : ''} onchange="window.ApdaSOSModal.updateLiveAIScore()" class="accent-red-500">
                  <span class="text-sm">${d.icon}</span>
                  <span class="text-xs font-semibold text-slate-200">${d.id === 'forest_fire' ? 'Fire' : d.label}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- GPS Location Capture -->
          <div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">2. Location & GPS Coordinate</label>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" onclick="window.ApdaSOSModal.fetchCurrentGPS()" class="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all">◎ My Current Location</button>
                <button type="button" onclick="window.ApdaSOSModal.openMapPicker()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all">⌖ Select On Map</button>
              </div>
              <button type="button" onclick="window.ApdaSOSModal.fetchCurrentGPS()" class="hidden">
                <span>📍 Auto-Fetch GPS</span>
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" id="sos-locality" required placeholder="Locality / landmark" value="Hatigaon By-lane 3" oninput="window.ApdaSOSModal.queueAddressGeocode()" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              <input type="text" id="sos-city" required placeholder="Village or city" value="Guwahati" oninput="window.ApdaSOSModal.queueAddressGeocode()" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              <input type="text" id="sos-district" required placeholder="District" value="Kamrup Metropolitan" oninput="window.ApdaSOSModal.queueAddressGeocode()" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              <input type="text" id="sos-state" required placeholder="State" value="Assam" oninput="window.ApdaSOSModal.queueAddressGeocode()" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              <input type="text" id="sos-coords" readonly value="26.1445, 91.7362" class="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-emerald-400 font-mono text-center">
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
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                <div class="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <span class="text-[10px] text-slate-400 block">Children</span>
                  <input type="number" id="sos-children" min="0" value="0" onchange="window.ApdaSOSModal.updateLiveAIScore()" class="w-full bg-transparent text-center font-bold text-xs text-white">
                </div>
                <div class="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <span class="text-[10px] text-slate-400 block">Female</span>
                  <input type="number" id="sos-female" min="0" value="0" onchange="window.ApdaSOSModal.updateLiveAIScore()" class="w-full bg-transparent text-center font-bold text-xs text-white">
                </div>
                <div class="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <span class="text-[10px] text-slate-400 block">Senior Citizens</span>
                  <input type="number" id="sos-seniors" min="0" value="0" onchange="window.ApdaSOSModal.updateLiveAIScore()" class="w-full bg-transparent text-center font-bold text-xs text-white">
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
              <span class="hidden">+20% AI Confidence boost</span>
            </div>
            <div class="flex items-center gap-3">
              <button type="button" onclick="window.ApdaSOSModal.simulateMediaAttach()" class="hidden">
                <span>📷</span> Attach Disaster Photo / Clip
              </button>
              <button type="button" id="video-attach-btn" onclick="document.getElementById('sos-video-input').click()" class="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-600 hover:border-red-500 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all">Attach Disaster Clip</button>
              <input id="sos-video-input" type="file" accept="video/*" class="hidden" onchange="window.ApdaSOSModal.attachVideo(this)">
              <div id="attached-media-preview" class="hidden"></div>
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
          <div class="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-center"><span id="simple-risk-score" class="text-sm font-black text-red-300">Risk Score: 92%</span></div>
          <div id="live-ai-preview-box" class="hidden">
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
          <button type="submit" class="sos-submit-button w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 font-extrabold text-white rounded-2xl shadow-xl shadow-red-600/40 uppercase tracking-wider text-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
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

  getAddress() {
    return ['sos-locality', 'sos-city', 'sos-district', 'sos-state'].map(id => document.getElementById(id)?.value.trim()).filter(Boolean).join(', ');
  },

  setCoordinates(lat, lng, message = 'Location ready') {
    this.currentCoords = [Number(lat), Number(lng)];
    const coordsInput = document.getElementById('sos-coords');
    if (coordsInput) coordsInput.value = `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
    this.updateLiveAIScore();
  },

  queueAddressGeocode() {
    clearTimeout(this.addressGeocodeTimer);
    this.addressGeocodeTimer = setTimeout(() => this.geocodeAddress(), 700);
  },

  async geocodeAddress() {
    const address = this.getAddress();
    if (address.length < 5) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`);
      const results = await response.json();
      if (!results.length) throw new Error('not found');
      this.setCoordinates(results[0].lat, results[0].lon, 'Coordinates updated from address');
    } catch (error) {
      if (window.ApdaState) window.ApdaState.notify('Address could not be located. Select it on the map instead.', 'warning');
    }
  },

  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const result = await response.json(); const a = result.address || {};
      const fields = { 'sos-locality': a.road || a.neighbourhood || a.suburb || '', 'sos-city': a.city || a.town || a.village || '', 'sos-district': a.county || a.state_district || '', 'sos-state': a.state || '' };
      Object.entries(fields).forEach(([id, value]) => { const input = document.getElementById(id); if (input && value) input.value = value; });
    } catch (error) { /* Coordinates remain usable if reverse geocoding is unavailable. */ }
  },

  fetchCurrentGPS() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.setCoordinates(pos.coords.latitude, pos.coords.longitude, 'Live location acquired');
          this.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (window.ApdaState) {
            window.ApdaState.notify('High-precision GPS coordinates locked', 'success');
          }
        },
        () => {
          // Fallback simulation
          this.setCoordinates(26.1445, 91.7362, 'Location permission unavailable');
        }
      );
    }
  },

  openMapPicker() {
    const modal = document.createElement('div');
    modal.id = 'sos-map-picker';
    modal.className = 'fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center';
    modal.innerHTML = `<div class="w-full max-w-3xl rounded-3xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl"><div class="flex items-center justify-between p-4 border-b border-slate-700"><div><h3 class="font-black text-white">Select emergency location</h3><p class="text-xs text-slate-400 mt-0.5">Tap or click the map to place the location pin.</p></div><button onclick="window.ApdaSOSModal.closeMapPicker()" class="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white">×</button></div><div id="sos-map-picker-canvas" class="h-[52vh] min-h-[300px]"></div><div class="flex justify-end p-4 border-t border-slate-700"><button onclick="window.ApdaSOSModal.confirmMapLocation()" class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black">Use this location</button></div></div>`;
    document.body.appendChild(modal); setTimeout(() => this.initMapPicker(), 80);
  },

  initMapPicker() {
    if (typeof L === 'undefined') return;
    this.mapPicker = L.map('sos-map-picker-canvas').setView(this.currentCoords, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(this.mapPicker);
    this.mapPickerMarker = L.marker(this.currentCoords, { draggable: true }).addTo(this.mapPicker); this.mapPickerCoords = [...this.currentCoords];
    const update = latlng => { this.mapPickerCoords = [latlng.lat, latlng.lng]; };
    this.mapPicker.on('click', event => { this.mapPickerMarker.setLatLng(event.latlng); update(event.latlng); }); this.mapPickerMarker.on('dragend', event => update(event.target.getLatLng()));
  },

  confirmMapLocation() {
    if (this.mapPickerCoords) { this.setCoordinates(this.mapPickerCoords[0], this.mapPickerCoords[1], 'Location selected on map'); this.reverseGeocode(this.mapPickerCoords[0], this.mapPickerCoords[1]); }
    this.closeMapPicker();
  },

  closeMapPicker() {
    if (this.mapPicker) { this.mapPicker.remove(); this.mapPicker = null; }
    const modal = document.getElementById('sos-map-picker'); if (modal) modal.remove();
  },

  attachVideo(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      window.ApdaState.notify('Please select a video clip', 'warning');
      input.value = '';
      return;
    }
    this.uploadedMedia.push({ type: 'video', url: URL.createObjectURL(file), tag: file.name });
    const button = document.getElementById('video-attach-btn');
    if (button) {
      button.disabled = true;
      button.className = 'px-3.5 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-not-allowed';
      button.textContent = 'Disaster Clip Attached';
    }
    window.ApdaState.notify('Disaster clip attached successfully', 'success');
    this.updateLiveAIScore();
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
    const infants = document.getElementById('sos-children') ? parseInt(document.getElementById('sos-children').value) : 0;
    const elderly = document.getElementById('sos-seniors') ? parseInt(document.getElementById('sos-seniors').value) : 0;
    const female = document.getElementById('sos-female') ? parseInt(document.getElementById('sos-female').value) : 0;
    const injured = document.getElementById('sos-injured') ? parseInt(document.getElementById('sos-injured').value) : 0;
    const description = document.getElementById('sos-description') ? document.getElementById('sos-description').value : '';

    const draftReport = {
      disasterType,
      peopleAffected,
      coordinates: this.currentCoords,
      media: this.uploadedMedia,
      userPhone: '+91 98765 43210',
      vulnerable: { infants, elderly, female, injured },
      description
    };

    const aiRes = window.ApdaAIEngine.evaluateReport(draftReport, window.ApdaState.requests);

    const simpleRiskScore = document.getElementById('simple-risk-score');
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
    if (simpleRiskScore) simpleRiskScore.textContent = `Risk Score: ${aiRes.riskScore}%`;
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
      address: this.getAddress() || 'Guwahati Sector 4',
      peopleAffected: parseInt(document.getElementById('sos-people-count').value) || 1,
      vulnerable: {
        infants: parseInt(document.getElementById('sos-children').value) || 0,
        elderly: parseInt(document.getElementById('sos-seniors').value) || 0,
        female: parseInt(document.getElementById('sos-female').value) || 0,
        injured: parseInt(document.getElementById('sos-injured').value) || 0
      },
      description: document.getElementById('sos-description').value,
      media: this.uploadedMedia
    };

    this.close();
    window.ApdaState.addEmergencyRequest(payload);
  }
};
