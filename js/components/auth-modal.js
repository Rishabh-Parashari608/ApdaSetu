// [volunteer done] Auth & Role Selection Modal with unified design system and minimalist volunteer demo dropdown
window.ApdaAuthModal = {
  activeTab: 'citizen', // 'demo' | 'citizen' | 'responder' | 'volunteer'
  authMode: 'login', // 'login' | 'signup'
  selectedDemoVolunteerId: 'VLT-001', // [volunteer done] Selected identity for the volunteer response demo.
  volunteerDropdownOpen: false, // [volunteer done] Dropdown is closed by default and reveals names only on user interaction.
  outsideClickListenerBound: false, // [volunteer done] Global click handler for outside click dismissal.

  open(defaultTab = 'citizen', authMode = 'login') {
    this.activeTab = ['demo', 'citizen', 'responder', 'volunteer'].includes(defaultTab) ? defaultTab : 'citizen';
    this.authMode = authMode;
    this.volunteerDropdownOpen = false; // [volunteer done] Reset dropdown state on open
    this.close();

    const modal = document.createElement('div');
    modal.id = 'auth-modal-backdrop';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md modal-animate-in';
    modal.innerHTML = this.renderContent();
    document.body.appendChild(modal);

    // [volunteer done] Bind single outside-click listener for dropdown dismissal
    if (!this.outsideClickListenerBound) {
      document.addEventListener('click', (e) => {
        const trigger = document.getElementById('volunteer-dropdown-trigger');
        const menu = document.getElementById('volunteer-dropdown-menu');
        if (this.volunteerDropdownOpen && trigger && !trigger.contains(e.target) && (!menu || !menu.contains(e.target))) {
          this.closeVolunteerDropdown();
        }
      });
      this.outsideClickListenerBound = true;
    }
  },

  close() {
    this.volunteerDropdownOpen = false;
    const el = document.getElementById('auth-modal-backdrop');
    if (el) el.remove();
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.volunteerDropdownOpen = false;
    this.refreshModalContent();
  },

  switchMode(mode) {
    this.authMode = mode;
    this.volunteerDropdownOpen = false;
    this.refreshModalContent();
  },

  // [volunteer done] Toggle dropdown on user click
  toggleVolunteerDropdown(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.volunteerDropdownOpen = !this.volunteerDropdownOpen;
    this.refreshModalContent();
  },

  // [volunteer done] Select volunteer from dropdown and close it
  selectDemoVolunteer(volunteerId, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.selectedDemoVolunteerId = volunteerId;
    this.volunteerDropdownOpen = false;
    this.refreshModalContent();
  },

  // [volunteer done] Close dropdown
  closeVolunteerDropdown() {
    if (this.volunteerDropdownOpen) {
      this.volunteerDropdownOpen = false;
      this.refreshModalContent();
    }
  },

  refreshModalContent() {
    const modal = document.getElementById('auth-modal-backdrop');
    if (modal) {
      modal.innerHTML = this.renderContent();
    }
  },

  renderContent() {
    return `
      <div class="glass-panel w-full max-w-lg rounded-2xl p-6 text-white border border-white/20 shadow-2xl relative">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${this.authMode === 'signup' ? '📝' : '🔐'}</span>
            <div>
              <h3 class="font-extrabold text-xl text-white">${this.authMode === 'signup' ? 'Create your ApdaSetu account' : 'Login to ApdaSetu'}</h3>
              <p class="text-xs text-slate-400">${this.authMode === 'signup' ? 'Choose the interface that matches your role' : 'Select your role or use 1-Click Quick Demo'}</p>
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
          <button onclick="window.ApdaAuthModal.switchTab('demo')" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all ${this.activeTab === 'demo' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            ⚡ Quick Demo
          </button>
          <button onclick="window.ApdaAuthModal.switchTab('citizen')" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all ${this.activeTab === 'citizen' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            👤 Citizen
          </button>
          <button onclick="window.ApdaAuthModal.switchTab('responder')" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all ${this.activeTab === 'responder' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            🚒 Responder
          </button>
          <!-- [volunteer done] Third authentication role tab aligned with shared design system -->
          <button onclick="window.ApdaAuthModal.switchTab('volunteer')" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all ${this.activeTab === 'volunteer' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
            🦺 Volunteer
          </button>
        </div>

        <!-- Tab Body -->
        <div class="mt-5">
          ${this.activeTab === 'demo' ? this.renderDemoTab() : ''}
          ${this.activeTab === 'citizen' ? this.renderCitizenTab() : ''}
          ${this.activeTab === 'responder' ? this.renderResponderTab() : ''}
          ${this.activeTab === 'volunteer' ? this.renderVolunteerTab() : ''}
        </div>
      </div>
    `;
  },

  // [volunteer done] Quick demo preset tab with consistent card proportions and a compact volunteer selector
  renderDemoTab() {
    const volunteers = (window.ApdaState.volunteers || []).filter(v => v.verified);
    const selectedVolunteer = volunteers.find(v => v.id === this.selectedDemoVolunteerId) || volunteers[0] || { name: 'Rupam Saikia', skills: ['Boat handling', 'First aid'], availability: 'available', completedTasks: 18 };
    this.selectedDemoVolunteerId = selectedVolunteer.id;

    return `
      <div class="space-y-3">
        <p class="text-xs text-slate-300">
          Click any persona below to immediately access the respective dashboard with realistic seeded data:
        </p>

        <!-- Citizen Preset -->
        <button onclick="window.ApdaAuthModal.loginDemo('citizen')" class="w-full p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-red-500/40 hover:border-red-500 transition-all flex items-center justify-between text-left group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xl flex-shrink-0">
              👩
            </div>
            <div>
              <h4 class="font-bold text-sm text-white group-hover:text-red-400 transition-colors">Priya Sharma</h4>
              <p class="text-xs text-slate-400">Citizen • Hatigaon Flood Zone, Assam</p>
              <div class="flex items-center gap-2 mt-0.5 text-[11px] text-red-300">
                <span>Active SOS Request: #REQ-2026-001</span>
              </div>
            </div>
          </div>
          <span class="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white group-hover:bg-red-500 flex-shrink-0">Login →</span>
        </button>

        <!-- [volunteer done] Minimalist Volunteer Preset Card matching Citizen and Responder styling -->
        <div class="w-full p-3.5 rounded-xl bg-slate-800/80 border border-emerald-500/40 hover:border-emerald-500/80 transition-all relative">
          <div class="flex items-center justify-between text-left">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl flex-shrink-0">
                🦺
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <h4 class="font-bold text-sm text-white truncate">${selectedVolunteer.name}</h4>
                  <span class="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold flex-shrink-0">✓ VERIFIED</span>
                </div>
                <p class="text-xs text-slate-400 truncate">Volunteer • ${selectedVolunteer.skills.slice(0, 2).join(' · ')}</p>
                <div class="flex items-center gap-2 mt-0.5 text-[11px] text-emerald-300">
                  <span>● ${selectedVolunteer.availability === 'available' ? 'Available' : 'Offline'}</span>
                  <span class="text-slate-500">•</span>
                  <span class="text-slate-400">${selectedVolunteer.completedTasks || 0} tasks</span>
                </div>
              </div>
            </div>
            <button onclick="window.ApdaAuthModal.loginDemo('volunteer')" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors ml-2 flex-shrink-0">
              Login →
            </button>
          </div>

          <!-- [volunteer done] Compact dropdown selector: closed by default, opens only on click -->
          <div class="mt-2.5 pt-2 border-t border-slate-700/60 relative">
            <button id="volunteer-dropdown-trigger" type="button" onclick="window.ApdaAuthModal.toggleVolunteerDropdown(event)" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-emerald-500/60 text-xs text-slate-300 transition-colors focus:outline-none">
              <span class="flex items-center gap-1.5 truncate">
                <span class="text-slate-400">Profile:</span>
                <strong class="text-emerald-300 font-bold truncate">${selectedVolunteer.name}</strong>
              </span>
              <span class="text-slate-400 ml-2 text-xs font-bold">${this.volunteerDropdownOpen ? '▴' : '▾'}</span>
            </button>

            <!-- [volunteer done] Floating dropdown menu with mouse/keyboard/outside-click support -->
            ${this.volunteerDropdownOpen ? this.renderVolunteerDropdownMenu() : ''}
          </div>
        </div>

        <!-- NDRF Commander Preset -->
        <button onclick="window.ApdaAuthModal.loginDemo('ndrf')" class="w-full p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 transition-all flex items-center justify-between text-left group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl flex-shrink-0">
              🚒
            </div>
            <div>
              <h4 class="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">Inspector Rajesh Kumar</h4>
              <p class="text-xs text-slate-400">Duty Commander • NDRF 1st Bn Control</p>
              <div class="flex items-center gap-2 mt-0.5 text-[11px] text-amber-300">
                <span>Access Triage Queue & Multi-Agency Dispatch</span>
              </div>
            </div>
          </div>
          <span class="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-600 text-white group-hover:bg-amber-500 flex-shrink-0">Command →</span>
        </button>

        <!-- Medical Officer Preset -->
        <button onclick="window.ApdaAuthModal.loginDemo('medical')" class="w-full p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-500 transition-all flex items-center justify-between text-left group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl flex-shrink-0">
              🩺
            </div>
            <div>
              <h4 class="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">Dr. Ananya Sen</h4>
              <p class="text-xs text-slate-400">Disaster Trauma Lead • 108 Emergency Corps</p>
              <div class="flex items-center gap-2 mt-0.5 text-[11px] text-emerald-300">
                <span>Trauma Dispatch & Emergency Bed Allocation</span>
              </div>
            </div>
          </div>
          <span class="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white group-hover:bg-emerald-500 flex-shrink-0">Login →</span>
        </button>
      </div>
    `;
  },

  // [volunteer done] Minimalist dropdown renders available verified volunteers only when opened.
  renderVolunteerDropdownMenu() {
    const volunteers = (window.ApdaState.volunteers || []).filter(volunteer => volunteer.verified);
    const activeMobilization = (window.ApdaState.volunteerMobilizations || []).find(mobilization => mobilization.isScramble && !['resolved', 'escalated'].includes(mobilization.status)); // [volunteer done] Eligibility preview is tied only to an actual active scramble.
    const incident = activeMobilization ? window.ApdaState.requests.find(request => request.id === activeMobilization.requestId) : null;
    const selectedId = volunteers.some(volunteer => volunteer.id === this.selectedDemoVolunteerId) ? this.selectedDemoVolunteerId : volunteers[0]?.id;
    this.selectedDemoVolunteerId = selectedId;

    return `
      <div id="volunteer-dropdown-menu" class="volunteer-dropdown-menu absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900/98 border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto backdrop-blur-xl">
        ${incident ? `<div class="px-2.5 py-1.5 bg-red-950/50 border-b border-red-500/30 text-[10px] text-red-100">🚨 ${String(incident.disasterType).toUpperCase()} · ${String(incident.severity).toUpperCase()} · ${activeMobilization.rules.radiusKm} km radius</div>` : `<div class="px-2.5 py-1.5 bg-slate-950/70 border-b border-slate-800 text-[10px] text-slate-400">No active scramble. Eligibility is calculated when Commander starts one.</div>`}
        <div class="p-1.5 space-y-1">
          ${volunteers.map(volunteer => {
            const isSelected = volunteer.id === selectedId;
            const service = window.ApdaState.getVolunteerServiceInfo(volunteer);
            const distance = incident ? window.ApdaState.calculateDistanceKm(volunteer.coordinates, incident.coordinates) : null;
            const isAvailable = volunteer.availability === 'available' && !service.reached;
            const eligible = distance !== null && distance <= activeMobilization?.rules.radiusKm && window.ApdaState.isVolunteerEligible(volunteer);
            const eligibilityLabel = !incident ? '' : eligible ? `Eligible · ~${window.ApdaState.estimateVolunteerEta(distance)} min` : service.reached ? 'Service limit' : volunteer.availability !== 'available' ? 'Unavailable' : 'Outside radius';

            return `
              <div onclick="window.ApdaAuthModal.selectDemoVolunteer('${volunteer.id}', event)" class="px-2.5 py-2 rounded-lg hover:bg-slate-800/90 cursor-pointer transition-colors flex items-center justify-between gap-2 ${isSelected ? 'bg-emerald-950/40 border border-emerald-500/40' : 'border border-transparent'}">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs">🦺</span>
                    <span class="font-bold text-xs text-white truncate">${volunteer.name}</span>
                    <span class="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">✓</span>
                  </div>
                  <p class="text-[10px] text-slate-400 truncate mt-0.5">${volunteer.skills.slice(0, 2).join(' · ')} ${distance !== null ? `• 📍 ${distance.toFixed(1)}km (~${window.ApdaState.estimateVolunteerEta(distance)}m)` : ''}</p>
                  ${eligibilityLabel ? `<p class="text-[10px] font-bold mt-0.5 ${eligible ? 'text-emerald-300' : 'text-red-300'}">${eligibilityLabel}</p>` : ''}
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <span class="text-[10px] font-bold ${isAvailable ? 'text-emerald-400' : 'text-slate-500'}">
                    ● ${isAvailable ? 'Available' : 'Offline'}
                  </span>
                  ${isSelected ? '<span class="text-emerald-400 text-xs font-black">✓</span>' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // [volunteer done] Direct card login remains available for multi-tab presenter testing.
  loginAsVolunteer(volunteerId) {
    this.selectedDemoVolunteerId = volunteerId;
    this.loginDemo('volunteer');
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

  // [volunteer done] Volunteer tab fully matched in layout, typography, input styling, and buttons to Citizen/Responder tabs
  renderVolunteerTab() {
    const volunteers = (window.ApdaState.volunteers || []).filter(v => v.verified);
    const selectedVolunteer = volunteers.find(v => v.id === this.selectedDemoVolunteerId) || volunteers[0] || { name: 'Rupam Saikia', phone: '+91 98640 22331', skills: ['Boat handling', 'First aid'] };

    return `
      <form onsubmit="window.ApdaAuthModal.handleCustomLogin(event, 'volunteer')" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Select Volunteer Profile / Preset</label>
          <div class="relative">
            <button id="volunteer-dropdown-trigger" type="button" onclick="window.ApdaAuthModal.toggleVolunteerDropdown(event)" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-sm text-slate-200 transition-colors focus:outline-none focus:border-emerald-500">
              <span class="flex items-center gap-2 truncate">
                <span class="text-emerald-400">🦺</span>
                <span class="font-bold text-white">${selectedVolunteer.name}</span>
                <span class="text-slate-400 text-xs truncate">(${selectedVolunteer.skills.slice(0, 2).join(' · ')})</span>
              </span>
              <span class="text-slate-400 text-xs ml-2">${this.volunteerDropdownOpen ? '▴' : '▾'}</span>
            </button>
            ${this.volunteerDropdownOpen ? this.renderVolunteerDropdownMenu() : ''}
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Volunteer Full Name</label>
          <input type="text" id="volunteer-name" required placeholder="e.g. Rupam Saikia" value="${selectedVolunteer.name}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Contact Number (with OTP stub)</label>
          <input type="tel" id="volunteer-phone" required placeholder="+91 98765 43210" value="${selectedVolunteer.phone || '+91 98640 22331'}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Assigned Disaster Zone / City</label>
          <input type="text" id="volunteer-city" placeholder="e.g. Hatigaon, Guwahati" value="Hatigaon, Guwahati" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>

        <button type="submit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-white text-sm shadow-lg shadow-emerald-600/30 transition-all mt-2">
          ${this.authMode === 'signup' ? 'Register Verified Volunteer →' : 'Continue as Volunteer →'}
        </button>
      </form>
    `;
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
    } else if (preset === 'volunteer') { // [volunteer done] Use the selected verified volunteer profile
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
        name: document.getElementById('citizen-name')?.value || 'Citizen User',
        role: 'citizen',
        phone: document.getElementById('citizen-phone')?.value || '+91 98765 00000',
        city: document.getElementById('citizen-city')?.value || 'Disaster Zone'
      };
    } else if (role === 'volunteer') { // [volunteer done] Authenticate volunteer with form values while retaining verified volunteer metadata
      const base = window.ApdaState.volunteers.find(v => v.id === this.selectedDemoVolunteerId) || window.ApdaState.volunteers.find(v => v.verified);
      user = {
        ...base,
        name: document.getElementById('volunteer-name')?.value || base.name,
        phone: document.getElementById('volunteer-phone')?.value || base.phone,
        city: document.getElementById('volunteer-city')?.value || 'Guwahati, Assam',
        role: 'volunteer'
      };
    } else {
      user = {
        id: 'RESP-' + Math.floor(Math.random() * 10000),
        name: document.getElementById('responder-name')?.value || 'Officer',
        role: 'responder',
        org: document.getElementById('responder-org')?.value || 'NDRF',
        badge: document.getElementById('responder-badge')?.value || 'OFF-101'
      };
    }
    this.close();
    window.ApdaState.login(user);
  }
};
