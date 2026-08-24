// Auth & Role Selection Modal

window.ApdaAuthModal = {
  activeTab: 'citizen', // 'citizen' | 'responder' | 'volunteer'
  authMode: 'login', // 'login' | 'signup'
  selectedDemoVolunteerId: 'VLT-001', // [volunteer done] Presenter-selected identity for the volunteer response demo.

  open(defaultTab = 'citizen', authMode = 'login') {
    this.activeTab = ['citizen', 'responder', 'volunteer'].includes(defaultTab) ? defaultTab : 'citizen';
    this.authMode = authMode;
    this.close();

    const modal = document.createElement('div');
    modal.id = 'auth-modal-backdrop';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md modal-animate-in';
    modal.innerHTML = this.renderContent();
    document.body.appendChild(modal);
  },

  close() {
    const el = document.getElementById('auth-modal-backdrop');
    if (el) el.remove();
  },

  switchTab(tab) {
    this.activeTab = tab;
    const modal = document.getElementById('auth-modal-backdrop');
    if (modal) {
      modal.innerHTML = this.renderContent();
    }
  },

  switchMode(mode) {
    this.authMode = mode;
    const modal = document.getElementById('auth-modal-backdrop');
    if (modal) modal.innerHTML = this.renderContent();
  },

  renderContent() {
    return `
      <div class="glass-panel w-full max-w-lg rounded-2xl p-6 text-white border border-white/20 shadow-2xl relative">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${this.authMode === 'signup' ? '📝' : '🔐'}</span>
            <div>
              <h3 class="font-extrabold text-xl text-white">${this.authMode === 'signup' ? 'Create your ApdaSetu account' : 'Login to ApdaSetu'}</h3>
              <p class="text-xs text-slate-400">${this.authMode === 'signup' ? 'Choose the interface that matches your role' : 'Select your role to continue securely'}</p>
            </div>
          </div>
          <button onclick="window.ApdaAuthModal.close()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-bold">×</button>
        </div>

        <div class="flex gap-2 mt-4">
          <button onclick="window.ApdaAuthModal.switchMode('login')" class="flex-1 py-2 rounded-lg text-xs font-bold ${this.authMode === 'login' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}">Login</button>
          <button onclick="window.ApdaAuthModal.switchMode('signup')" class="flex-1 py-2 rounded-lg text-xs font-bold ${this.authMode === 'signup' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}">Sign up</button>
        </div>

        <!-- Role Tabs -->
        <div class="flex rounded-xl bg-slate-900/90 p-1 mt-4 border border-slate-800">
          <button onclick="window.ApdaAuthModal.switchTab('citizen')" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all ${this.activeTab === 'citizen' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            👤 Citizen
          </button>
          <button onclick="window.ApdaAuthModal.switchTab('responder')" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all ${this.activeTab === 'responder' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            🚒 Responder
          </button>
          <!-- [volunteer done] Third authentication role -->
          <button onclick="window.ApdaAuthModal.switchTab('volunteer')" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all ${this.activeTab === 'volunteer' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            🦺 Volunteer
          </button>
        </div>

        <!-- Tab Body -->
        <div class="mt-5">
          ${this.activeTab === 'citizen' ? this.renderCitizenTab() : ''}
          ${this.activeTab === 'responder' ? this.renderResponderTab() : ''}
          ${this.activeTab === 'volunteer' ? this.renderVolunteerTab() : ''}
        </div>
      </div>
    `;
  },

  renderDemoTab() {
    return `
      <div class="space-y-3">
        <p class="text-xs text-slate-300">
          Click any persona below to immediately access the respective dashboard with realistic seeded data:
        </p>

        <!-- Citizen Preset -->
        <button onclick="window.ApdaAuthModal.loginDemo('citizen')" class="w-full p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-red-500/40 hover:border-red-500 transition-all flex items-center justify-between text-left group">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xl">
              👩
            </div>
            <div>
              <h4 class="font-bold text-sm text-white group-hover:text-red-400 transition-colors">Priya Sharma</h4>
              <p class="text-xs text-slate-400">Citizen • Hatigaon Flood Zone, Assam</p>
              <div class="flex items-center gap-2 mt-1 text-[11px] text-red-300">
                <span>Active SOS Request: #REQ-2026-001</span>
              </div>
            </div>
          </div>
          <span class="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white group-hover:bg-red-500">Login →</span>
        </button>

        <!-- [volunteer done] All verified demo identities are visible before entering the volunteer dashboard. -->
        ${this.renderVolunteerDemoSelector()}

        <!-- NDRF Commander Preset -->
        <button onclick="window.ApdaAuthModal.loginDemo('ndrf')" class="w-full p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 transition-all flex items-center justify-between text-left group">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl">
              🚒
            </div>
            <div>
              <h4 class="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">Inspector Rajesh Kumar</h4>
              <p class="text-xs text-slate-400">Duty Commander • NDRF 1st Bn Control</p>
              <div class="flex items-center gap-2 mt-1 text-[11px] text-amber-300">
                <span>Access Triage Queue & Multi-Agency Dispatch</span>
              </div>
            </div>
          </div>
          <span class="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-600 text-white group-hover:bg-amber-500">Command →</span>
        </button>

        <!-- Medical Officer Preset -->
        <button onclick="window.ApdaAuthModal.loginDemo('medical')" class="w-full p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-500 transition-all flex items-center justify-between text-left group">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl">
              🩺
            </div>
            <div>
              <h4 class="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">Dr. Ananya Sen</h4>
              <p class="text-xs text-slate-400">Disaster Trauma Lead • 108 Emergency Corps</p>
              <div class="flex items-center gap-2 mt-1 text-[11px] text-emerald-300">
                <span>Trauma Dispatch & Emergency Bed Allocation</span>
              </div>
            </div>
          </div>
          <span class="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white group-hover:bg-emerald-500">Login →</span>
        </button>
      </div>
    `;
  },

  renderCitizenTab() {
    return `
      <form onsubmit="window.ApdaAuthModal.handleCustomLogin(event, 'citizen')" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
          <input type="text" id="citizen-name" required autocomplete="name" placeholder="Enter your full name" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Mobile Number</label>
          <input type="tel" id="citizen-phone" required autocomplete="tel" placeholder="+91 98765 43210" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Current Disaster Zone / City</label>
          <input type="text" id="citizen-city" autocomplete="address-level2" placeholder="e.g. Guwahati, Assam" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500">
        </div>
        <button type="submit" class="w-full py-3 bg-red-600 hover:bg-red-500 font-bold rounded-xl text-white text-sm shadow-lg shadow-red-600/30 transition-all mt-2">
          ${this.authMode === 'signup' ? 'Create Citizen Account →' : 'Continue as Citizen →'}
        </button>
      </form>
    `;
  },

  renderResponderTab() {
    return `
      <form onsubmit="window.ApdaAuthModal.handleCustomLogin(event, 'responder')" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Responder Officer Name</label>
          <input type="text" id="responder-name" required autocomplete="name" placeholder="Enter officer name" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Organization / Agency</label>
          <select id="responder-org" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500">
            <option value="NDRF">NDRF (National Disaster Response Force)</option>
            <option value="SDRF">SDRF (State Disaster Response Force)</option>
            <option value="Fire Brigade">State Fire & Rescue Service</option>
            <option value="108 Medical">108 Emergency Medical Service</option>
            <option value="Red Cross">Indian Red Cross Society / NGO</option>
            <option value="Civil Defense">Civil Defense Corps</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Official ID / Badge #</label>
          <input type="text" id="responder-badge" autocomplete="off" placeholder="e.g. NDRF-HQ-492" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500">
        </div>
        <button type="submit" class="w-full py-3 bg-amber-600 hover:bg-amber-500 font-bold rounded-xl text-white text-sm shadow-lg shadow-amber-600/30 transition-all mt-2">
          ${this.authMode === 'signup' ? 'Create Responder Account →' : 'Open Command Dashboard →'}
        </button>
      </form>
    `;
  },

  // [volunteer done] Clear selector shows seeded skills, verification, availability, and proximity to the live demo incident.
  renderVolunteerDemoSelector(compact = false) {
    const volunteers = (window.ApdaState.volunteers || []).filter(volunteer => volunteer.verified);
    const activeMobilization = (window.ApdaState.volunteerMobilizations || []).find(mobilization => mobilization.isScramble && !['resolved', 'escalated'].includes(mobilization.status)); // [volunteer done] Eligibility preview is tied only to an actual active scramble.
    const incident = activeMobilization ? window.ApdaState.requests.find(request => request.id === activeMobilization.requestId) : null;
    const selectedId = volunteers.some(volunteer => volunteer.id === this.selectedDemoVolunteerId) ? this.selectedDemoVolunteerId : volunteers[0]?.id;
    this.selectedDemoVolunteerId = selectedId;
    return `<section class="rounded-2xl p-3 bg-emerald-950/20 border border-emerald-500/35 ${compact ? '' : 'my-1'}"><div class="flex items-center justify-between gap-3 mb-2"><div><h4 class="text-xs font-black text-emerald-200">🦺 VOLUNTEER DEMO SELECTOR</h4><p class="text-[10px] text-slate-400">Choose a verified identity for this dashboard session</p></div><span class="text-[10px] text-emerald-300 font-bold">${volunteers.length} VERIFIED</span></div>${incident ? `<div class="mb-2 p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-[10px] text-red-100">🚨 Active incident: <strong>${String(incident.disasterType).toUpperCase()} · ${String(incident.severity).toUpperCase()}</strong> · ${activeMobilization.rules.radiusKm} km radius</div>` : '<div class="mb-2 p-2 rounded-lg bg-slate-900/70 border border-slate-700 text-[10px] text-slate-400">No active incident. Volunteer eligibility will be calculated when Commander starts a scramble.</div>'}<div class="max-h-72 overflow-y-auto pr-1 space-y-2">${volunteers.map(volunteer => { const distance = incident ? window.ApdaState.calculateDistanceKm(volunteer.coordinates, incident.coordinates) : null; const service = window.ApdaState.getVolunteerServiceInfo(volunteer); const eligible = distance !== null && distance <= activeMobilization?.rules.radiusKm && window.ApdaState.isVolunteerEligible(volunteer); const eligibilityLabel = !incident ? '' : eligible ? `🟢 ELIGIBLE FOR ${String(incident.severity).toUpperCase()} SCRAMBLE · ~${window.ApdaState.estimateVolunteerEta(distance)} min ETA` : service.reached ? '🔴 SERVICE LIMIT REACHED' : volunteer.availability !== 'available' ? '🔴 UNAVAILABLE' : '🔴 OUTSIDE RESPONSE RADIUS'; const isSelected = volunteer.id === selectedId; return `<div class="p-3 rounded-xl border transition-all ${isSelected ? 'bg-emerald-600/20 border-emerald-400 shadow-md shadow-emerald-950/40' : 'bg-slate-900/70 border-slate-700'}"><div class="flex items-start justify-between gap-2"><div><div class="flex items-center gap-1.5"><span class="font-bold text-sm text-white">🦺 ${volunteer.name}</span><span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black">✓ VERIFIED</span></div><p class="text-[10px] text-slate-400 mt-1">${volunteer.skills.join(' · ')}</p></div><span class="text-[10px] font-black ${volunteer.availability === 'available' && !service.reached ? 'text-emerald-300' : 'text-slate-400'}">${volunteer.availability === 'available' && !service.reached ? '● AVAILABLE' : '● OFFLINE'}</span></div><p class="text-[10px] ${incident ? 'text-cyan-300' : 'text-slate-500'} mt-2">${distance !== null ? `📍 ${distance.toFixed(1)} km from current incident` : 'Demo location ready'}</p>${eligibilityLabel ? `<p class="text-[10px] font-bold mt-1 ${eligible ? 'text-emerald-300' : 'text-red-300'}">${eligibilityLabel}</p>` : ''}<div class="mt-2 flex gap-2"><button type="button" onclick="window.ApdaAuthModal.selectDemoVolunteer('${volunteer.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200">${isSelected ? 'SELECTED' : 'SELECT'}</button><button type="button" onclick="window.ApdaAuthModal.loginAsVolunteer('${volunteer.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white">LOGIN AS THIS VOLUNTEER</button></div></div>`; }).join('')}</div></section>`;
  },

  // [volunteer done] Keep selection in the modal only; response-network availability is never changed here.
  selectDemoVolunteer(volunteerId) {
    this.selectedDemoVolunteerId = volunteerId;
    const modal = document.getElementById('auth-modal-backdrop');
    if (modal) modal.innerHTML = this.renderContent();
  },

  // [volunteer done] Direct card login makes multi-tab presenter testing deterministic.
  loginAsVolunteer(volunteerId) {
    this.selectedDemoVolunteerId = volunteerId;
    this.loginDemo('volunteer');
  },

  // [volunteer done] The role-specific login also uses the same seeded identity selector.
  renderVolunteerTab() {
    return `<div class="space-y-3.5">${this.renderVolunteerDemoSelector(true)}<p class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">✓ Demo profiles are verified. Only volunteers marked available receive new emergency requests.</p></div>`;
  },

  loginDemo(preset) {
    let user;
    if (preset === 'citizen') {
      user = {
        id: 'USR-881',
        name: 'Priya Sharma',
        role: 'citizen',
        phone: '+91 98765 43210',
        city: 'Guwahati, Assam',
        bloodGroup: 'O+',
        emergencyContact: '+91 98765 11111 (Son)',
        medicalNotes: 'Asthmatic family member, 8-month infant'
      };
    } else if (preset === 'ndrf') {
      user = {
        id: 'RESP-NDRF-01',
        name: 'Inspector Rajesh Kumar',
        role: 'responder',
        org: 'NDRF 1st Bn Command HQ',
        phone: '+91 94350 55442',
        badge: 'NDRF-8842',
        agencyType: 'NDRF'
      };
    } else if (preset === 'volunteer') { // [volunteer done] Use the identity selected by the presenter.
      const volunteer = window.ApdaState.volunteers.find(v => v.id === this.selectedDemoVolunteerId) || window.ApdaState.volunteers.find(v => v.verified);
      user = { ...volunteer, role: 'volunteer', city: 'Hatigaon, Guwahati' };
    } else {
      user = {
        id: 'RESP-MED-01',
        name: 'Dr. Ananya Sen',
        role: 'responder',
        org: '108 Advanced Trauma Response',
        phone: '+91 98300 77112',
        badge: 'DOC-9041',
        agencyType: 'Medical'
      };
    }
    this.close();
    window.ApdaState.login(user);
  },

  handleCustomLogin(e, role) {
    e.preventDefault();
    let user;
    if (role === 'citizen') {
      user = {
        id: 'USR-' + Math.floor(Math.random() * 10000),
        name: document.getElementById('citizen-name').value || 'Citizen User',
        role: 'citizen',
        phone: document.getElementById('citizen-phone').value || '+91 98765 00000',
        city: document.getElementById('citizen-city').value || 'Disaster Zone'
      };
    } else if (role === 'volunteer') { // [volunteer done] Kept for compatibility with any existing volunteer login calls.
      const volunteer = window.ApdaState.volunteers.find(v => v.id === this.selectedDemoVolunteerId) || window.ApdaState.volunteers.find(v => v.verified);
      user = { ...volunteer, role: 'volunteer' };
    } else {
      user = {
        id: 'RESP-' + Math.floor(Math.random() * 10000),
        name: document.getElementById('responder-name').value || 'Officer',
        role: 'responder',
        org: document.getElementById('responder-org').value || 'NDRF',
        badge: document.getElementById('responder-badge').value || 'OFF-101'
      };
    }
    this.close();
    window.ApdaState.login(user);
  }
};
