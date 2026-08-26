// Volunteer & Responder Unified Command Center Component

window.ApdaResponderDashboard = {
  activeTab: 'queue', // 'queue' | 'map' | 'dispatch' | 'analytics'
  selectedRequestId: null,
  showResolvedArchive: false,
  responderLeafletMap: null,
  countdownIntervalId: null,

  setTab(tab) {
    this.updateActiveTab(tab);
  },

  updateActiveTab(tabId) {
    this.activeTab = tabId;
    if (window.ApdaState) {
      window.ApdaState.responderTab = tabId;
    }

    const tabButtons = document.querySelectorAll('[data-responder-tab]');
    tabButtons.forEach(btn => {
      const btnTab = btn.getAttribute('data-responder-tab');
      if (btnTab === tabId) {
        btn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
        btn.classList.add('bg-amber-600', 'text-white', 'shadow-lg', 'shadow-amber-600/30');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('bg-amber-600', 'text-white', 'shadow-lg', 'shadow-amber-600/30');
        btn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    const container = document.getElementById('responder-content-container');
    if (container) {
      container.innerHTML = this.renderActiveTab();
      if (tabId === 'map') {
        setTimeout(() => this.initResponderMap(), 50);
      }
    }
  },

  selectIncident(requestId) {
    this.selectedRequestId = requestId;
    const container = document.getElementById('responder-content-container');
    if (container) {
      container.innerHTML = this.renderActiveTab();
      if (this.activeTab === 'map') {
        setTimeout(() => this.initResponderMap(), 100);
      }
    }
  },

  toggleResolvedArchive() {
    this.showResolvedArchive = !this.showResolvedArchive;
    const container = document.getElementById('responder-content-container');
    if (container) {
      container.innerHTML = this.renderActiveTab();
    }
  },

  startCountdownTimer() {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
    }
    this.countdownIntervalId = setInterval(() => {
      const countdownElements = document.querySelectorAll('[data-countdown-expires]');
      let needsRefresh = false;
      const now = Date.now();

      countdownElements.forEach(el => {
        const expiresAt = parseInt(el.getAttribute('data-countdown-expires'), 10);
        if (isNaN(expiresAt)) return;

        const remainingMs = expiresAt - now;
        if (remainingMs <= 0) {
          el.innerHTML = '<span class="text-red-400 font-bold animate-pulse">00:00 — WINDOW EXPIRED</span>';
          const mobId = el.getAttribute('data-mob-id');
          if (mobId) {
            const mob = window.ApdaState.volunteerMobilizations.find(m => m.id === mobId);
            if (mob && !mob.escalated && mob.status !== 'resolved') {
              window.ApdaState.autoEscalateVolunteerMobilization(mobId);
              needsRefresh = true;
            }
          }
        } else {
          const totalSeconds = Math.floor(remainingMs / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          el.textContent = `${formatted} remaining`;
        }
      });

      if (needsRefresh) {
        const container = document.getElementById('responder-content-container');
        if (container && this.activeTab === 'queue') {
          container.innerHTML = this.renderActiveTab();
        }
      }
    }, 1000);
  },

  render() {
    this.activeTab = window.ApdaState?.responderTab || this.activeTab || 'queue';
    const user = window.ApdaState.currentUser || {
      name: 'Inspector Rajesh Kumar',
      role: 'responder',
      org: 'NDRF 1st Bn Command Desk',
      badge: 'NDRF-8842'
    };

    const activeRequests = window.ApdaState.getActiveRequests();
    const resolvedRequests = window.ApdaState.getResolvedRequests();
    const deployedCount = window.ApdaState.rescueUnits.filter(u => u.status === 'Deployed').length;

    setTimeout(() => {
      this.startCountdownTimer();
      if (this.activeTab === 'map') {
        this.initResponderMap();
      }
    }, 100);

    return `
      <div class="min-h-screen pb-20 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

        <!-- Command Header & Operations Badge (Part 10: Citizen switch button removed) -->
        <div class="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-amber-600/30 border border-amber-500/50 text-amber-400 flex items-center justify-center text-3xl flex-shrink-0 animate-pulse">
              🚒
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-black text-white">
                  Unified Disaster Response Command Center
                </h1>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Duty Desk
                </span>
              </div>
              <p class="text-xs text-slate-300 mt-1">
                Commander: <strong>${user.name}</strong> • ${user.org || 'NDRF HQ'} • Badge: <span class="font-mono text-amber-300">${user.badge || 'NDRF-8842'}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="window.ApdaEmergencyCallModal.open()" class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30">
              <span>📞</span> Hotlines (112 / 108)
            </button>
          </div>
        </div>

        <!-- Operations KPI Counters Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div class="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-950/20">
            <span class="text-2xl font-black text-red-400">${activeRequests.length}</span>
            <p class="text-xs text-slate-300 font-semibold mt-0.5">Active Incidents</p>
            <span class="text-[10px] text-red-300 font-bold">${activeRequests.filter(r => r.status === 'Submitted' || r.status === 'Verified' || r.status === 'Ground Confirmed').length} Need Action</span>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20">
            <span class="text-2xl font-black text-amber-400">${deployedCount} Units</span>
            <p class="text-xs text-slate-300 font-semibold mt-0.5">Active Deployed</p>
            <span class="text-[10px] text-slate-400">NDRF, Fire, Medical, SDRF</span>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
            <span class="text-2xl font-black text-emerald-400">${resolvedRequests.length}</span>
            <p class="text-xs text-slate-300 font-semibold mt-0.5">Resolved Incidents</p>
            <span class="text-[10px] text-emerald-300">Evacuation Completed</span>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-sky-500/30 bg-sky-950/20">
            <span class="text-2xl font-black text-sky-400">${window.ApdaState.shelters.length} Shelters</span>
            <p class="text-xs text-slate-300 font-semibold mt-0.5">Active Safe Hubs</p>
            <span class="text-[10px] text-slate-400">1,600 Bed Capacity</span>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 col-span-2 sm:col-span-1">
            <span class="text-2xl font-black text-purple-400">120s</span>
            <p class="text-xs text-slate-300 font-semibold mt-0.5">Response Window</p>
            <span class="text-[10px] text-slate-400">Volunteer → Unit Escalation</span>
          </div>
        </div>

        <!-- Responder Tabs Navigation -->
        <div class="flex items-center gap-2 border-b border-white/10 pb-1 overflow-x-auto" role="tablist">
          ${[
            { id: 'queue', label: 'Active Triage & Response Queue', icon: '🚨', badge: activeRequests.length },
            { id: 'map', label: 'Live Operations Map & Dispatch', icon: '🗺️', badge: null },
            { id: 'dispatch', label: 'Multi-Agency Units Directory', icon: '🚒', badge: deployedCount },
            { id: 'analytics', label: 'Incident Analytics & Insights', icon: '📊', badge: null }
          ].map(t => `
            <button data-responder-tab="${t.id}" role="tab" aria-selected="${this.activeTab === t.id ? 'true' : 'false'}" onclick="window.ApdaResponderDashboard.setTab('${t.id}')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${this.activeTab === t.id ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
              <span>${t.icon}</span>
              <span>${t.label}</span>
              ${t.badge !== null ? `<span class="px-2 py-0.2 rounded-full text-[10px] font-mono bg-slate-900 text-amber-300 border border-amber-400/40">${t.badge}</span>` : ''}
            </button>
          `).join('')}
        </div>

        <!-- Active Tab Container -->
        <div id="responder-content-container">
          ${this.renderActiveTab()}
        </div>

      </div>
    `;
  },

  renderActiveTab() {
    if (this.activeTab === 'queue') return this.renderTriageQueue();
    if (this.activeTab === 'map') return this.renderOperationsMap();
    if (this.activeTab === 'dispatch') return this.renderDispatchPanel();
    if (this.activeTab === 'analytics') return this.renderAnalytics();
    return this.renderTriageQueue();
  },

  // 1. Prioritized AI Verification & Active Triage Queue (Part 3 & Part 16)
  renderTriageQueue() {
    const activeRequests = window.ApdaState.getActiveRequests();
    const resolvedRequests = window.ApdaState.getResolvedRequests();

    return `
      <div class="space-y-4">

        <div class="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Active emergency incidents prioritized by urgency score, severity, trapped persons, and ground verification:</span>
          <span class="text-amber-400 font-bold">${activeRequests.length} Active Incident${activeRequests.length === 1 ? '' : 's'}</span>
        </div>

        ${activeRequests.length === 0 ? `
          <div class="glass-panel p-8 rounded-3xl border border-slate-800 text-center text-slate-400">
            <span class="text-4xl block mb-2">🟢</span>
            <h3 class="text-base font-bold text-white">No Active Emergency Incidents</h3>
            <p class="text-xs mt-1">All distress reports have been resolved safely or evacuated.</p>
          </div>
        ` : `
          <div class="space-y-4">
            ${activeRequests.map(req => this.renderIncidentCard(req)).join('')}
          </div>
        `}

        <!-- Resolved Incidents Archive Section (Part 3: Resolved incidents cleanly isolated) -->
        <div class="mt-8 pt-4 border-t border-white/10">
          <button onclick="window.ApdaResponderDashboard.toggleResolvedArchive()" class="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-slate-300 transition-all">
            <span class="flex items-center gap-2">
              <span class="text-emerald-400">📁</span>
              <span>Resolved & Evacuated Incident Archive (${resolvedRequests.length})</span>
            </span>
            <span class="text-slate-400">${this.showResolvedArchive ? '▴ Hide Archive' : '▾ View Archive'}</span>
          </button>

          ${this.showResolvedArchive ? `
            <div class="mt-3 space-y-3">
              ${resolvedRequests.map(req => `
                <div class="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-bold text-white">${req.id}</span>
                      <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">✓ RESOLVED</span>
                      <span class="text-slate-300">${req.userName} • ${req.address}</span>
                    </div>
                    <p class="text-slate-400 mt-1">"${req.description}"</p>
                    ${req.groundConfirmedBy ? `<p class="text-[11px] text-emerald-400 mt-1">Ground Confirmed by: <strong>${req.groundConfirmedBy.name}</strong></p>` : ''}
                  </div>
                  <div class="text-right flex-shrink-0">
                    <span class="text-[10px] text-slate-400 block">${req.timeline?.[0]?.time || req.submittedAt}</span>
                    <span class="text-[11px] text-emerald-300 font-semibold">${req.timeline?.[0]?.note || 'Evacuation completed safely'}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

      </div>
    `;
  },

  // Individual Incident Card with Ground Confirmation & 2-Minute Response Coordination
  renderIncidentCard(req) {
    const isCritical = req.severity === 'critical' || (req.aiScore && req.aiScore.riskScore >= 80);
    const isGroundConfirmed = req.status === 'Ground Confirmed' || Boolean(req.groundConfirmedBy);
    const isVolunteerAssigned = req.status === 'Volunteer Assigned' || Boolean(req.assignedResponder);
    const isDispatched = req.status === 'Dispatched' || Boolean(req.assignedTeam);

    const mobilization = window.ApdaState.volunteerMobilizations.find(m => m.requestId === req.id && m.status !== 'resolved');
    const rules = window.ApdaState.getVolunteerRules(req.severity);
    const eligibleMatches = window.ApdaState.getEligibleVolunteersForIncident(req);
    const responseOptions = window.ApdaState.getIncidentResponseOptions(req);

    const now = Date.now();
    const isExpired = mobilization && now >= mobilization.expiresAt;
    const isEscalated = (mobilization && (mobilization.escalated || mobilization.status === 'escalated')) || (eligibleMatches.length === 0 && !isVolunteerAssigned && !isDispatched);

    return `
      <div class="glass-panel p-6 rounded-3xl border transition-all ${isCritical ? 'border-red-500/50 bg-red-950/15' : 'border-slate-700 bg-slate-900/60'} hover:border-amber-500/40">

        <!-- Incident Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-sm font-black text-white">${req.id}</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${req.severity === 'critical' ? 'badge-critical' : 'badge-high'}">
                ${req.disasterType} • ${req.severity}
              </span>
              
              <!-- Status Badge -->
              ${isGroundConfirmed && !isVolunteerAssigned && !isDispatched ? `
                <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  ✓ GROUND CONFIRMED
                </span>
              ` : isVolunteerAssigned ? `
                <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  🦺 VOLUNTEER ASSIGNED
                </span>
              ` : isDispatched ? `
                <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  🚒 DISPATCHED
                </span>
              ` : isEscalated ? `
                <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                  🚨 ESCALATION REQUIRED
                </span>
              ` : `
                <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-800 text-slate-300 border border-slate-700">
                  ${req.status}
                </span>
              `}

              <span class="text-xs text-slate-300 font-semibold">
                👤 ${req.userName} (${req.userPhone})
              </span>
              <span class="text-xs text-slate-400">• Logged ${req.submittedAt}</span>
            </div>

            <p class="text-xs text-slate-300 mt-1 font-medium">📍 Location: <strong>${req.address}</strong></p>
          </div>

          <!-- AI Confidence & Risk Score Meters -->
          <div class="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-white/10 flex-shrink-0">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Confidence</span>
              <span class="text-sm font-black text-emerald-400">${req.aiScore?.confidence || 90}% Verified</span>
              <span class="text-[10px] text-slate-400 block">${req.aiScore?.clusterCount || 1} Cluster Match</span>
            </div>

            <div class="pl-4 border-l border-white/10">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Urgency Risk</span>
              <span class="text-sm font-black ${isCritical ? 'text-red-400 animate-pulse' : 'text-amber-400'}">${req.aiScore?.riskScore || 85}/100</span>
              <span class="text-[10px] text-slate-400 block">${req.peopleAffected} People Affected</span>
            </div>
          </div>
        </div>

        <!-- Description & NLP Keywords -->
        <div class="mt-4 space-y-2">
          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            "${req.description}"
          </p>

          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            <span class="text-[11px] text-slate-400 mr-1">NLP Indicators:</span>
            ${(req.aiScore?.keywordsDetected || []).map(kw => `
              <span class="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30 text-[10px] font-bold">
                ⚡ ${kw}
              </span>
            `).join('')}
            ${req.vulnerable ? `
              <span class="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                👶 ${req.vulnerable.infants || 0} Infant(s) • 👵 ${req.vulnerable.elderly || 0} Senior(s) • 🩹 ${req.vulnerable.injured || 0} Injured
              </span>
            ` : ''}
          </div>
        </div>

        <!-- Ground Confirmation Banner (Parts 5 & 6) -->
        ${isGroundConfirmed ? `
          <div class="mt-4 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg flex-shrink-0">
                ✓
              </div>
              <div>
                <h4 class="text-xs font-black text-emerald-300">
                  GROUND CONFIRMED by Verified Volunteer ${req.groundConfirmedBy?.name || 'Rupam Saikia'}
                </h4>
                <p class="text-[11px] text-slate-300 mt-0.5">
                  Distress verified on scene • ${req.groundConfirmedBy?.at || 'Just now'} • Response coordination active.
                </p>
              </div>
            </div>
            ${!isVolunteerAssigned && !isDispatched ? `
              <button onclick="window.ApdaResponderDashboard.openDispatchModal('${req.id}')" class="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-900/40 flex-shrink-0">
                <span>🚒</span> Deploy Response Units →
              </button>
            ` : ''}
          </div>
        ` : ''}

        <!-- 2-Minute Volunteer Response Window & Matching Panel (Parts 4, 7, 14) -->
        ${window.ApdaState.isIncidentActive(req) ? `
        <div class="mt-4 p-4 rounded-2xl border ${isEscalated ? 'border-red-500/50 bg-red-950/20' : 'border-cyan-500/30 bg-slate-950/60'}">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black ${isEscalated ? 'text-red-400' : 'text-cyan-300'}">
                  ${isVolunteerAssigned ? '🦺 RESPONDER ASSIGNED' : isEscalated ? '⚠️ VOLUNTEER RESPONSE WINDOW EXPIRED / 0 VOLUNTEERS' : '⏱️ VOLUNTEER RESPONSE WINDOW (2 MIN)'}
                </span>
                ${mobilization && !isVolunteerAssigned && !isEscalated ? `
                  <span class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono text-[11px] font-bold" data-countdown-expires="${mobilization.expiresAt}" data-mob-id="${mobilization.id}">
                    02:00 remaining
                  </span>
                ` : ''}
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">
                ${eligibleMatches.length} eligible verified volunteer${eligibleMatches.length === 1 ? '' : 's'} within ${rules.radiusKm} km radius
              </p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              ${isEscalated && !isVolunteerAssigned && !isDispatched ? `
                <button onclick="window.ApdaResponderDashboard.openDispatchModal('${req.id}')" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg shadow-amber-900/50 flex items-center gap-1.5 animate-pulse">
                  <span>🚒</span> DEPLOY RESPONSE UNITS
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Eligible Volunteers Match List (Part 4) -->
          ${isVolunteerAssigned && req.assignedResponder ? `
            <div class="mt-3 p-3 rounded-xl bg-slate-900/90 border border-sky-500/40 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span class="text-xl">🦺</span>
                <div>
                  <h5 class="text-xs font-bold text-white">${req.assignedResponder.name} <span class="text-[10px] text-emerald-300 font-bold">✓ VERIFIED</span></h5>
                  <p class="text-[11px] text-slate-400">Skills: ${req.assignedResponder.skills?.join(', ')} • Contact: ${req.assignedResponder.phone || 'Available'}</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-bold text-xs">Assigned • ETA ~${req.assignedResponder.etaMinutes || 5}m</span>
            </div>
          ` : eligibleMatches.length > 0 ? `
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nearby Verified Responders</p>
                <span class="text-[10px] font-bold text-emerald-400">${eligibleMatches.length} Nearby</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
                ${eligibleMatches.map(m => `
                  <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs">🦺</span>
                        <span class="font-bold text-xs text-white">${m.volunteer.name}</span>
                        <span class="text-[9px] text-emerald-400 font-bold">✓</span>
                      </div>
                      <p class="text-[10px] text-slate-400">📍 ${m.distanceKm} km • ⏱️ ETA ${m.etaMinutes} min</p>
                      <p class="text-[10px] text-slate-500 truncate max-w-[140px]">${m.volunteer.skills.slice(0, 2).join(', ')}</p>
                    </div>
                    <button onclick="window.ApdaState.assignVolunteer('${req.id}', '${m.volunteer.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors flex-shrink-0">
                      Assign →
                    </button>
                  </div>
                `).join('')}
              </div>
              <button onclick="window.ApdaState.scrambleNearbyVolunteers('${req.id}')" class="w-full mt-2 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-[11px] uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-colors">
                🚨 SCRAMBLE VOLUNTEERS
              </button>
            </div>
          ` : `
            <div class="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
              <span class="text-slate-400 text-xs">0 eligible verified volunteers within ${rules.radiusKm} km radius with required capabilities. No eligible verified volunteers are currently available within the response radius.</span>
              <div class="flex flex-wrap items-center gap-2">
                <button onclick="window.ApdaState.scrambleNearbyVolunteers('${req.id}')" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  🚨 SCRAMBLE VOLUNTEERS
                </button>
                ${!isDispatched ? `
                  <button onclick="window.ApdaResponderDashboard.openDispatchModal('${req.id}')" class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-black text-[11px] uppercase shadow-md flex items-center gap-1.5">
                    DEPLOY UNITS →
                  </button>
                ` : ''}
              </div>
            </div>
          `}

        </div>
        ` : ''}

        <!-- Multi-Agency Response Options (Parts 5 & 6) -->
        ${responseOptions.length > 0 ? `
        <div class="mt-4 pt-3 border-t border-white/5">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Multi-Agency Response Coordination Options</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            ${responseOptions.map(opt => `
              <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-2">
                <div>
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>${opt.icon}</span> ${opt.title}
                    </span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-bold ${opt.badgeType === 'success' ? 'bg-emerald-500/20 text-emerald-300' : opt.badgeType === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}">
                      ${opt.badge}
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 leading-tight">${opt.description}</p>
                </div>
                ${opt.actionType === 'deploy_unit' ? `
                  <button onclick="window.ApdaResponderDashboard.openDispatchModal('${req.id}', '${opt.unitId || ''}')" class="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white font-bold text-[10px] transition-colors text-center">
                    ${opt.actionLabel} →
                  </button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Incident Actions Footer -->
        <div class="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button onclick="window.ApdaResponderDashboard.selectedRequestId = '${req.id}'; window.ApdaResponderDashboard.setTab('map')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700">
              🗺️ Locate on Map
            </button>
            ${req.status === 'Submitted' ? `
              <button onclick="window.ApdaState.verifyRequest('${req.id}', true)" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs rounded-xl shadow-md">
                ✓ Verify & Triage
              </button>
              <button onclick="window.ApdaState.verifyRequest('${req.id}', false)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-semibold border border-slate-700">
                ✕ Reject (Hoax)
              </button>
            ` : ''}
          </div>

          <div class="flex items-center gap-2">
            ${window.ApdaState.isIncidentActive(req) && !isDispatched ? `
              <button onclick="window.ApdaResponderDashboard.openDispatchModal('${req.id}')" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 font-extrabold text-white text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all">
                <span>🚒</span> Dispatch Rescue Unit
              </button>
            ` : isDispatched ? `
              <div class="flex items-center gap-2">
                <span class="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                  ✓ ${req.assignedTeam?.name || 'Unit Dispatched'}
                </span>
                ${window.ApdaState.isIncidentActive(req) ? `
                <button onclick="window.ApdaState.updateRequestStatus('${req.id}', 'Resolved', 'Evacuation and rescue completed safely by response unit.')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all">
                  Mark Resolved ✓
                </button>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>

      </div>
    `;
  },

  // 2. Live Operations Map & Dedicated Split Dispatch Panel (Parts 11, 12, 13, 15)
  renderOperationsMap() {
    const activeRequests = window.ApdaState.getActiveRequests();
    const rescueUnits = window.ApdaState.rescueUnits;
    const selectedReq = activeRequests.find(r => r.id === this.selectedRequestId) || activeRequests[0];

    return `
      <div class="space-y-4">

        <!-- Split Layout Grid: Map on Left (8 cols), Dispatch Panel on Right (4 cols) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">

          <!-- Left Column: Uncluttered Leaflet Map Canvas -->
          <div class="lg:col-span-8 glass-panel p-4 rounded-3xl border border-white/10 flex flex-col min-h-[560px]">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs">
              <span class="font-bold text-white flex items-center gap-2">
                <span>🗺️</span> Multi-Agency Live Operations Map
              </span>
              <div class="flex items-center gap-3 text-[11px]">
                <span class="flex items-center gap-1 text-red-400 font-bold"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> Incidents (${activeRequests.length})</span>
                <span class="flex items-center gap-1 text-amber-400 font-bold"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Units (${rescueUnits.length})</span>
                <span class="flex items-center gap-1 text-emerald-400 font-bold"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Volunteers</span>
                <span class="flex items-center gap-1 text-sky-400 font-bold"><span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Shelters</span>
              </div>
            </div>

            <div id="responder-map-canvas" class="flex-1 rounded-2xl min-h-[500px] relative z-10 w-full"></div>
          </div>

          <!-- Right Column: Interactive Multi-Agency Dispatch Panel -->
          <div class="lg:col-span-4 glass-panel p-5 rounded-3xl border border-amber-500/30 bg-slate-900/90 flex flex-col justify-between gap-4">
            
            <div class="space-y-4">
              <div class="pb-3 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 class="font-black text-sm text-white flex items-center gap-2">
                    <span>⚡</span> Instant Dispatch Control
                  </h3>
                  <p class="text-[11px] text-slate-400 mt-0.5">Select incident to assign rescue teams</p>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Duty Desk
                </span>
              </div>

              <!-- Incident Selector -->
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">Active Incident Focus</label>
                <select onchange="window.ApdaResponderDashboard.selectIncident(this.value)" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500">
                  ${activeRequests.map(r => `
                    <option value="${r.id}" ${r.id === selectedReq?.id ? 'selected' : ''}>
                      ${r.id} • ${r.disasterType.toUpperCase()} (${r.severity}) - ${r.userName}
                    </option>
                  `).join('')}
                </select>
              </div>

              ${selectedReq ? `
                <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-white">${selectedReq.userName}</span>
                    <span class="font-mono text-amber-300 font-bold">${selectedReq.aiScore?.riskScore || 85}/100 Risk</span>
                  </div>
                  <p class="text-slate-400 text-[11px]">📍 ${selectedReq.address}</p>
                  <p class="text-slate-300 text-[11px] font-medium">"${selectedReq.description}"</p>
                  
                  ${selectedReq.groundConfirmedBy ? `
                    <div class="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-[10px] text-emerald-300">
                      ✓ Ground Confirmed by <strong>${selectedReq.groundConfirmedBy.name}</strong>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              <!-- Available Units Quick List -->
              <div class="space-y-2">
                <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Available Response Units</label>
                <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                  ${rescueUnits.map(u => {
                    const isAvail = u.status === 'Available';
                    return `
                      <div class="p-2.5 rounded-xl bg-slate-950 border ${isAvail ? 'border-slate-800 hover:border-amber-500/50' : 'border-slate-800 opacity-60'} flex items-center justify-between gap-2 text-xs">
                        <div class="min-w-0">
                          <div class="flex items-center gap-1.5 truncate">
                            <span>${u.agency === 'Medical' ? '🚑' : u.agency === 'NDRF' ? '🚤' : u.agency === 'Fire Brigade' ? '🚒' : '🤝'}</span>
                            <span class="font-bold text-white truncate">${u.name}</span>
                          </div>
                          <p class="text-[10px] text-slate-400 truncate mt-0.5">${u.agency} • ${u.leader} (${u.phone})</p>
                        </div>
                        ${isAvail && selectedReq ? `
                          <button onclick="window.ApdaState.dispatchTeam('${selectedReq.id}', '${u.id}', 'Direct map dispatch');" class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] flex-shrink-0 transition-colors">
                            Deploy →
                          </button>
                        ` : `
                          <span class="px-2 py-0.5 rounded text-[9px] font-bold ${isAvail ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'} flex-shrink-0">
                            ${u.status}
                          </span>
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            ${selectedReq ? `
              <button onclick="window.ApdaResponderDashboard.openDispatchModal('${selectedReq.id}')" class="w-full py-3 bg-amber-600 hover:bg-amber-500 font-black text-white text-xs rounded-xl shadow-lg shadow-amber-600/40 uppercase tracking-wider transition-all">
                🚀 Open Full Dispatch Modal
              </button>
            ` : ''}

          </div>

        </div>

      </div>
    `;
  },

  // Initialize Leaflet Map
  initResponderMap() {
    const container = document.getElementById('responder-map-canvas');
    if (!container || typeof L === 'undefined') return;

    if (this.responderLeafletMap) {
      this.responderLeafletMap.remove();
      this.responderLeafletMap = null;
    }

    try {
      const activeRequests = window.ApdaState.getActiveRequests();
      const rescueUnits = window.ApdaState.rescueUnits;
      const volunteers = window.ApdaState.volunteers || [];
      const shelters = window.ApdaState.shelters;

      const selectedReq = activeRequests.find(r => r.id === this.selectedRequestId) || activeRequests[0];
      const centerCoords = selectedReq?.coordinates || [26.1445, 91.7362];

      this.responderLeafletMap = L.map('responder-map-canvas').setView(centerCoords, 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | ApdaSetu Command'
      }).addTo(this.responderLeafletMap);

      // Add Active Incident Markers (Red/Orange Pulsing)
      activeRequests.forEach(req => {
        if (!req.coordinates) return;
        const isCrit = req.severity === 'critical';
        const isSelected = req.id === this.selectedRequestId;

        const marker = L.circleMarker(req.coordinates, {
          radius: isSelected ? 12 : isCrit ? 10 : 8,
          fillColor: isCrit ? '#ef4444' : '#f59e0b',
          color: isSelected ? '#38bdf8' : '#ffffff',
          weight: isSelected ? 3 : 2,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(this.responderLeafletMap);

        marker.on('click', () => {
          this.selectIncident(req.id);
        });

        marker.bindPopup(`
          <div style="font-family: inherit; color: #241d16; padding: 4px; max-width: 200px;">
            <span style="font-size: 10px; font-weight: bold; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px;">${req.id} • ${req.severity.toUpperCase()}</span>
            <h4 style="margin: 4px 0; font-size: 12px; font-weight: bold;">${req.disasterType.toUpperCase()}: ${req.userName}</h4>
            <p style="margin: 2px 0; font-size: 11px; color: #695847;">${req.address}</p>
            <button onclick="window.ApdaResponderDashboard.selectIncident('${req.id}')" style="width: 100%; background: #b45309; color: white; border: none; padding: 4px; border-radius: 6px; font-weight: bold; font-size: 10px; cursor: pointer; margin-top: 4px;">
              Select & Dispatch →
            </button>
          </div>
        `);
      });

      // Add Rescue Unit Markers (Amber)
      rescueUnits.forEach(u => {
        if (!u.coordinates) return;
        const marker = L.circleMarker(u.coordinates, {
          radius: 9,
          fillColor: '#f59e0b',
          color: '#000000',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(this.responderLeafletMap);

        marker.bindPopup(`
          <div style="font-family: inherit; color: #241d16; padding: 4px;">
            <h4 style="margin: 0; font-size: 12px; color: #b45309; font-weight: bold;">🚒 ${u.name}</h4>
            <p style="margin: 2px 0; font-size: 10px;">Agency: <strong>${u.agency}</strong> • Leader: ${u.leader}</p>
            <p style="margin: 2px 0; font-size: 10px;">Status: <strong>${u.status}</strong></p>
          </div>
        `);
      });

      // Add Volunteer Markers (Emerald)
      volunteers.forEach(v => {
        if (!v.coordinates || !v.verified) return;
        const marker = L.circleMarker(v.coordinates, {
          radius: 7,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(this.responderLeafletMap);

        marker.bindPopup(`
          <div style="font-family: inherit; color: #241d16; padding: 4px;">
            <h4 style="margin: 0; font-size: 12px; color: #047857; font-weight: bold;">🦺 ${v.name} (Verified)</h4>
            <p style="margin: 2px 0; font-size: 10px;">Skills: ${v.skills.join(', ')}</p>
            <p style="margin: 2px 0; font-size: 10px;">Status: <strong>${v.availability}</strong></p>
          </div>
        `);
      });

      // Add Shelters (Sky Blue)
      shelters.forEach(s => {
        if (!s.coordinates) return;
        const marker = L.circleMarker(s.coordinates, {
          radius: 8,
          fillColor: '#0284c7',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(this.responderLeafletMap);

        marker.bindPopup(`
          <div style="font-family: inherit; color: #241d16; padding: 4px;">
            <h4 style="margin: 0; font-size: 12px; color: #0369a1; font-weight: bold;">🏠 ${s.name}</h4>
            <p style="margin: 2px 0; font-size: 10px;">Occupied: ${s.occupied}/${s.totalCapacity} beds</p>
          </div>
        `);
      });

    } catch (e) {
      console.warn('Responder map init warning:', e);
    }
  },

  // 3. Multi-Agency Units Directory
  renderDispatchPanel() {
    const units = window.ApdaState.rescueUnits;

    return `
      <div class="space-y-6">

        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Active Response Battalions, Medical Ambulances, Fire Tenders & Rescue Squads:</span>
          <span class="text-amber-400 font-bold">${units.length} Registered Units</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${units.map(unit => {
            const isDeployed = unit.status === 'Deployed';

            return `
              <div class="glass-panel p-5 rounded-3xl border transition-all ${isDeployed ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-700 bg-slate-900/60'} flex flex-col justify-between gap-3">

                <div>
                  <div class="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-2xl ${isDeployed ? 'bg-amber-600' : 'bg-slate-800'} flex items-center justify-center text-xl text-white">
                        ${unit.agency === 'Medical' ? '🚑' : unit.agency === 'NDRF' ? '🚤' : unit.agency === 'Fire Brigade' ? '🚒' : unit.agency.includes('SDRF') ? '🧗' : '🤝'}
                      </div>
                      <div>
                        <h3 class="font-extrabold text-sm text-white">${unit.name}</h3>
                        <p class="text-xs text-slate-400 mt-0.5">Leader: <strong>${unit.leader}</strong></p>
                      </div>
                    </div>

                    <span class="px-2.5 py-0.5 rounded text-xs font-bold ${isDeployed ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}">
                      ${unit.status}
                    </span>
                  </div>

                  <div class="mt-3 text-xs text-slate-300 space-y-1">
                    <p>Agency: <strong class="text-amber-300">${unit.agency}</strong> • Personnel: <strong>${unit.personnel} Responders</strong></p>
                    <p>Type: <strong>${unit.type}</strong></p>
                    ${unit.assignedTo ? `<p class="text-red-300 font-bold">Assigned to Incident: ${unit.assignedTo}</p>` : ''}
                  </div>

                  <!-- Equipment Inventory -->
                  <div class="mt-3 pt-3 border-t border-white/5">
                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Equipment & Capabilities</span>
                    <div class="flex flex-wrap gap-1">
                      ${(unit.equipment || []).map(eq => `
                        <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                          ⚡ ${eq}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <div class="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                  <a href="tel:${unit.phone}" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-center text-xs text-slate-200 rounded-xl border border-slate-700 transition-all">
                    📞 Radio Contact
                  </a>
                  ${isDeployed ? `
                    <button onclick="window.ApdaState.updateRequestStatus('${unit.assignedTo}', 'Resolved', 'Recalled to base and resolved');" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl">
                      Recall Base
                    </button>
                  ` : ''}
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  },

  // 4. Analytics & Incident Intelligence
  renderAnalytics() {
    return `
      <div class="space-y-6">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Breakdown by Disaster Category -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 class="font-extrabold text-sm text-white flex items-center gap-2">
              <span>📊</span> Disaster Incident Distribution Breakdown
            </h3>

            <div class="space-y-3">
              ${[
                { label: 'Floods & Inundation', pct: 45, color: 'bg-blue-500', count: '18 Incidents' },
                { label: 'Cyclones & Storm Surge', pct: 25, color: 'bg-cyan-500', count: '10 Incidents' },
                { label: 'Landslides & Debris Flow', pct: 15, color: 'bg-amber-500', count: '6 Incidents' },
                { label: 'Forest Wildfires', pct: 10, color: 'bg-red-500', count: '4 Incidents' },
                { label: 'Building Structural Collapse', pct: 5, color: 'bg-purple-500', count: '2 Incidents' }
              ].map(d => `
                <div>
                  <div class="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                    <span>${d.label}</span>
                    <span>${d.count} (${d.pct}%)</span>
                  </div>
                  <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div class="${d.color} h-full rounded-full" style="width: ${d.pct}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Shelter Occupancy Status -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 class="font-extrabold text-sm text-white flex items-center gap-2">
              <span>🏠</span> Shelter Capacity & Bed Occupancy
            </h3>

            <div class="space-y-3">
              ${window.ApdaState.shelters.map(s => {
                const pct = Math.round((s.occupied / s.totalCapacity) * 100);
                return `
                  <div>
                    <div class="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                      <span class="truncate max-w-[200px]">${s.name}</span>
                      <span>${s.occupied}/${s.totalCapacity} Beds (${pct}%)</span>
                    </div>
                    <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div class="${pct >= 85 ? 'bg-amber-500' : 'bg-emerald-500'} h-full rounded-full" style="width: ${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>

      </div>
    `;
  },

  // Deploy Response Unit Modal (Part 8)
  openDispatchModal(requestId, suggestedUnitId = '') {
    const req = window.ApdaState.requests.find(r => r.id === requestId);
    if (!req) return;

    const modal = document.createElement('div');
    modal.id = 'dispatch-modal-backdrop';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md modal-animate-in';
    modal.innerHTML = `
      <div class="glass-panel-danger w-full max-w-lg rounded-3xl p-6 text-white border-2 border-amber-500/80 shadow-2xl relative">
        <div class="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🚒</span>
            <div>
              <h3 class="font-black text-lg text-white">Deploy Response Unit</h3>
              <p class="text-xs text-amber-300">Incident: ${req.id} • ${req.disasterType.toUpperCase()} (${req.severity})</p>
            </div>
          </div>
          <button onclick="document.getElementById('dispatch-modal-backdrop').remove()" class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">×</button>
        </div>

        <div class="mt-4 space-y-4">
          <div class="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 space-y-1">
            <p><strong>Victim / Reporter:</strong> ${req.userName} (${req.peopleAffected} persons)</p>
            <p><strong>Location:</strong> ${req.address}</p>
            ${req.groundConfirmedBy ? `<p class="text-emerald-300"><strong>✓ Ground Confirmed:</strong> ${req.groundConfirmedBy.name}</p>` : ''}
            <p class="text-amber-300"><strong>AI Note:</strong> ${req.aiScore?.aiNotes || 'High priority dispatch recommended.'}</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Select Response Unit to Deploy</label>
            <select id="dispatch-unit-select" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500">
              ${window.ApdaState.rescueUnits.map(u => `
                <option value="${u.id}" ${u.id === suggestedUnitId ? 'selected' : ''}>
                  ${u.name} (${u.agency} - ${u.status}) • Leader: ${u.leader}
                </option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Operational Orders & Notes</label>
            <textarea id="dispatch-notes" rows="2" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500">Proceed with emergency equipment and high-water gear. Coordinate directly with local command.</textarea>
          </div>

          <button onclick="window.ApdaResponderDashboard.executeDispatch('${req.id}')" class="w-full py-3.5 bg-amber-600 hover:bg-amber-500 font-black text-white text-xs rounded-xl shadow-xl shadow-amber-600/40 uppercase tracking-wider transition-all">
            🚀 Confirm Immediate Deployment
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  executeDispatch(requestId) {
    const selectEl = document.getElementById('dispatch-unit-select');
    const notesEl = document.getElementById('dispatch-notes');
    if (!selectEl) return;

    const unitId = selectEl.value;
    const notes = notesEl ? notesEl.value : '';

    const modal = document.getElementById('dispatch-modal-backdrop');
    if (modal) modal.remove();

    window.ApdaState.dispatchTeam(requestId, unitId, notes);
    this.setTab('queue');
  }
};
