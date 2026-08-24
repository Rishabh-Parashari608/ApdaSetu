// Volunteer & Responder Unified Command Center Component

window.ApdaResponderDashboard = {
  activeTab: 'queue', // 'queue' | 'map' | 'dispatch' | 'analytics'
  selectedRequestForTriage: null,
  responderLeafletMap: null,

  setTab(tab) {
    this.activeTab = tab;
    const container = document.getElementById('responder-content-container');
    if (container) {
      container.innerHTML = this.renderActiveTab();
      if (tab === 'map') {
        setTimeout(() => this.initResponderMap(), 100);
      }
    }
  },

  render() {
    const user = window.ApdaState.currentUser || {
      name: 'Inspector Rajesh Kumar',
      role: 'responder',
      org: 'NDRF 1st Bn Command Desk',
      badge: 'NDRF-8842'
    };

    const requests = window.ApdaState.requests;
    const pendingCount = requests.filter(r => r.status === 'Submitted' || r.status === 'Verified').length;
    const deployedCount = window.ApdaState.rescueUnits.filter(u => u.status === 'Deployed').length;

    setTimeout(() => {
      if (this.activeTab === 'map') {
        this.initResponderMap();
      }
    }, 100);

    return `
      <div class="min-h-screen pb-20 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        
        <!-- Command Header & Operations Badge -->
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
            <button onclick="window.ApdaState.setView('citizen')" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700">
              ← Switch to Citizen View
            </button>
            <button onclick="window.ApdaEmergencyCallModal.open()" class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30">
              <span>📞</span> Hotlines
            </button>
          </div>
        </div>

        <!-- Operations KPI Counters Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div class="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-950/20">
            <span class="text-2xl font-black text-red-400">${requests.length}</span>
            <p class="text-xs text-slate-300 font-semibold mt-0.5">Total Incidents</p>
            <span class="text-[10px] text-red-300 font-bold">${pendingCount} Need Triage / Action</span>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20">
            <span class="text-2xl font-black text-amber-400">${deployedCount} Units</span>
            <p class="text-xs text-slate-300 font-semibold mt-0.5">Active Deployed</p>
            <span class="text-[10px] text-slate-400">NDRF, Fire, Medical</span>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
            <span class="text-2xl font-black text-emerald-400">1,840+</span>
            <p class="text-xs text-slate-300 font-semibold mt-0.5">Citizens Rescued</p>
            <span class="text-[10px] text-slate-400">Past 48 Hours</span>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-sky-500/30 bg-sky-950/20">
            <span class="text-2xl font-black text-sky-400">5 Shelters</span>
            <p class="text-xs text-slate-300 font-semibold mt-0.5">Active Safe Hubs</p>
            <span class="text-[10px] text-slate-400">1,600 Total Bed Cap</span>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 col-span-2 sm:col-span-1">
            <span class="text-2xl font-black text-purple-400">11 Mins</span>
            <p class="text-xs text-slate-300 font-semibold mt-0.5">Avg Response Time</p>
            <span class="text-[10px] text-slate-400">AI Scoring + Dispatch</span>
          </div>
        </div>

        <!-- Responder Tabs Navigation -->
        <div class="flex items-center gap-2 border-b border-white/10 pb-1">
          ${[
            { id: 'queue', label: 'AI Verification & Triage Queue', icon: '🤖', badge: pendingCount },
            { id: 'map', label: 'Live Operations Map', icon: '🗺️', badge: null },
            { id: 'dispatch', label: 'Multi-Agency Dispatch Panel', icon: '🚒', badge: deployedCount },
            { id: 'analytics', label: 'Incident Analytics & Insights', icon: '📊', badge: null }
          ].map(t => `
            <button onclick="window.ApdaResponderDashboard.setTab('${t.id}')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${this.activeTab === t.id ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
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

  // 1. AI Verification & Triage Queue
  renderTriageQueue() {
    const requests = window.ApdaState.requests;
    const rescueUnits = window.ApdaState.rescueUnits;

    return `
      <div class="space-y-4">
        
        <div class="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Incoming distress reports scored by AI Confidence (Genuineness) and Urgency Risk:</span>
          <span>Showing ${requests.length} incident records</span>
        </div>

        <div class="space-y-4">
          ${requests.map(req => {
            const isCritical = req.aiScore.riskScore >= 80;
            const isDispatched = req.status === 'Dispatched';
            // [volunteer done] Surface the linked verified-volunteer response in the existing triage card.
            const mobilization = window.ApdaState.volunteerMobilizations.find(m => m.requestId === req.id && !['completed', 'escalated', 'resolved'].includes(m.status));
            const rules = window.ApdaState.getVolunteerRules(req.severity);
            const eligibleCount = req.coordinates ? window.ApdaState.volunteers.filter(v => window.ApdaState.isVolunteerEligible(v) && window.ApdaState.calculateDistanceKm(v.coordinates, req.coordinates) !== null && window.ApdaState.calculateDistanceKm(v.coordinates, req.coordinates) <= rules.radiusKm).length : 0; // [volunteer done] Service-limited profiles are never counted as new-task candidates.
            // [volunteer done] Live scramble totals are derived from synchronized per-volunteer task states.
            const scrambleStats = mobilization?.isScramble ? mobilization.targets.reduce((stats, target) => { stats[target.status] = (stats[target.status] || 0) + 1; return stats; }, {}) : null;

            return `
              <div class="glass-panel p-6 rounded-3xl border transition-all ${isCritical ? 'border-red-500/50 bg-red-950/15' : 'border-slate-700 bg-slate-900/60'} hover:border-amber-500/40">
                
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-mono text-sm font-black text-white">${req.id}</span>
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${req.severity === 'critical' ? 'badge-critical' : 'badge-high'}">
                        ${req.disasterType} • ${req.severity}
                      </span>
                      <span class="text-xs text-slate-300 font-semibold">
                        👤 ${req.userName} (${req.userPhone})
                      </span>
                      <span class="text-xs text-slate-400">• Logged ${req.submittedAt}</span>
                    </div>

                    <p class="text-xs text-slate-300 mt-1 font-medium">📍 Location: <strong>${req.address}</strong></p>
                  </div>

                  <!-- AI Confidence & Risk Score Meters -->
                  <div class="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-white/10">
                    <div>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Confidence</span>
                      <span class="text-sm font-black text-emerald-400">${req.aiScore.confidence}% Verified</span>
                      <span class="text-[10px] text-slate-400 block">${req.aiScore.clusterCount || 1} Cluster Match</span>
                    </div>

                    <div class="pl-4 border-l border-white/10">
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Urgency Risk</span>
                      <span class="text-sm font-black ${isCritical ? 'text-red-400 animate-pulse' : 'text-amber-400'}">${req.aiScore.riskScore}/100 (${req.aiScore.riskLevel})</span>
                      <span class="text-[10px] text-slate-400 block">${req.peopleAffected} People Trapped</span>
                    </div>
                  </div>

                </div>

                <!-- Description & Detected Urgency Keywords -->
                <div class="mt-4 space-y-2">
                  <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    "${req.description}"
                  </p>

                  <div class="flex flex-wrap items-center gap-1.5 pt-1">
                    <span class="text-[11px] text-slate-400 mr-1">NLP Keywords:</span>
                    ${(req.aiScore.keywordsDetected || []).map(kw => `
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

                <!-- AI Recommendation & Action Buttons -->
                <!-- [volunteer done] Commander mobilization is embedded into the existing incident flow. -->
                <div class="mt-4 p-3 rounded-2xl border ${mobilization?.groundConfirmedBy ? 'border-emerald-500/50 bg-emerald-950/25' : 'border-cyan-500/25 bg-slate-950/50'} flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="text-xs"><p class="font-black ${mobilization?.groundConfirmedBy ? 'text-emerald-300' : mobilization?.isScramble ? 'text-red-300 animate-pulse' : 'text-cyan-200'}">${mobilization?.groundConfirmedBy ? `✓ GROUND CONFIRMED · ${mobilization.groundConfirmedBy.name} (verified volunteer)` : mobilization?.isScramble ? '🚨 SCRAMBLE ACTIVE' : `🦺 ${eligibleCount} eligible verified volunteer${eligibleCount === 1 ? '' : 's'} within ${rules.radiusKm} km`}</p><p class="text-slate-400 mt-1">${scrambleStats ? `${mobilization.targets.length} notified · ${scrambleStats.accepted || 0} accepted · ${scrambleStats.on_the_way || 0} on the way · ${scrambleStats.on_site || 0} on site · ${scrambleStats.notified || 0} pending` : mobilization ? `Status: ${mobilization.status.replace('_', ' ')} · ${mobilization.targets.filter(t => ['accepted', 'on_the_way', 'on_site'].includes(t.status)).length} responding` : `Response window: ${rules.windowMinutes} minutes`}</p></div>
                  ${mobilization ? `<span class="px-3 py-2 rounded-xl ${mobilization.isScramble ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'} font-bold text-xs">${mobilization.isScramble ? '🚨 SCRAMBLE ACTIVE' : 'MOBILIZATION ACTIVE'}</span>` : `<button onclick="window.ApdaState.scrambleNearbyVolunteers('${req.id}')" class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-900/40 animate-pulse">🚨 SCRAMBLE VOLUNTEERS</button>`}
                </div>
                ${mobilization?.isScramble ? this.renderScrambleTargetPanel(mobilization) : ''}
                <div class="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                    <span>🤖 Suggested:</span>
                    <span class="text-white">${(req.aiScore.suggestedUnits || ['NDRF Inflatable Raft Unit']).join(', ')}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    ${req.status === 'Submitted' ? `
                      <button onclick="window.ApdaState.verifyRequest('${req.id}', true)" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs rounded-xl shadow-md transition-all">
                        ✓ Verify & Approve
                      </button>
                      <button onclick="window.ApdaState.verifyRequest('${req.id}', false)" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-semibold border border-slate-700">
                        ✕ Reject (Hoax)
                      </button>
                    ` : ''}

                    ${req.status !== 'Dispatched' && req.status !== 'Resolved' ? `
                      <button onclick="window.ApdaResponderDashboard.openDispatchModal('${req.id}')" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 font-extrabold text-white text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all">
                        <span>🚒</span> Dispatch Unit
                      </button>
                    ` : `
                      <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                        ✓ ${req.assignedTeam ? req.assignedTeam.name : 'Dispatched'}
                      </span>
                    `}

                    ${isDispatched ? `
                      <button onclick="window.ApdaState.updateRequestStatus('${req.id}', 'Resolved', 'Rescue completed safely by NDRF')" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                        Mark Evacuation Resolved ✓
                      </button>
                    ` : ''}
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  },

  // [volunteer done] Command sees the actual matching result and every synchronized volunteer task state.
  renderScrambleTargetPanel(mobilization) {
    const statusLabels = { notified: 'NOTIFIED', accepted: 'ACCEPTED', on_the_way: 'ON THE WAY', on_site: 'ON SITE', completed: 'COMPLETED', declined: 'DECLINED', resolved: 'RESOLVED' };
    return `<section class="mt-4 rounded-2xl border border-red-500/40 bg-slate-950/60 overflow-hidden"><div class="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-red-500/25"><div><h4 class="text-sm font-black text-red-300">🚨 SCRAMBLE ACTIVE</h4><p class="text-xs text-slate-400 mt-1">Incident: ${mobilization.disasterType || 'Emergency'} · ${String(mobilization.severity).toUpperCase()} · ${mobilization.rules.radiusKm} km radius · ${mobilization.rules.windowMinutes} min window</p></div><button onclick="window.ApdaState.resolveVolunteerScramble('${mobilization.id}')" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950/40">🟢 DE-SCRAMBLE / RESOLVE</button></div><div class="p-4"><p class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Targeted volunteers · ${mobilization.targets.length}</p><div class="space-y-2">${mobilization.targets.length ? mobilization.targets.map(target => { const volunteer = window.ApdaState.volunteers.find(item => item.id === target.volunteerId); const service = volunteer ? window.ApdaState.getVolunteerServiceInfo(volunteer) : null; return `<div class="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div><p class="text-xs font-black text-white">🦺 ${volunteer?.name || 'Verified Volunteer'} <span class="ml-1 text-[10px] text-emerald-300">✓ VERIFIED</span></p><p class="text-[10px] text-slate-400 mt-1">📍 ${target.distanceKm} km · ⏱️ ~${target.etaMinutes} min ETA · <span class="${service?.reached ? 'text-red-300' : service?.warning ? 'text-amber-300' : 'text-emerald-300'}">${service?.reached ? 'SERVICE LIMIT REACHED' : `${service?.usedHours.toFixed(1) || '0.0'} / 12h`}</span></p></div><span class="w-fit px-2.5 py-1 rounded-lg text-[10px] font-black ${target.status === 'on_site' ? 'bg-emerald-500/20 text-emerald-300' : target.status === 'declined' ? 'bg-slate-700 text-slate-300' : 'bg-red-500/15 text-red-200'}">${statusLabels[target.status] || String(target.status).toUpperCase()}</span></div>`; }).join('') : '<p class="text-xs text-slate-400">No verified available volunteers were inside the response radius.</p>'}</div></div></section>`;
  },

  // 2. Live Operations Map (Command View)
  renderOperationsMap() {
    return `
      <div class="space-y-4">
        <div class="glass-panel p-4 rounded-3xl border border-white/10 min-h-[500px] flex flex-col">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs">
            <span class="font-bold text-white">🗺️ Multi-Agency Live Operations Map (Incidents, Units & Shelters)</span>
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1 text-red-400 font-bold"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> Incident SOS</span>
              <span class="flex items-center gap-1 text-amber-400 font-bold"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Rescue Unit</span>
              <span class="flex items-center gap-1 text-emerald-400 font-bold"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Shelter</span>
            </div>
          </div>

          <div id="responder-map-canvas" class="flex-1 rounded-2xl min-h-[460px] relative z-10"></div>
        </div>
      </div>
    `;
  },

  initResponderMap() {
    const container = document.getElementById('responder-map-canvas');
    if (!container || typeof L === 'undefined') return;

    if (this.responderLeafletMap) {
      this.responderLeafletMap.remove();
      this.responderLeafletMap = null;
    }

    try {
      const requests = window.ApdaState.requests;
      const rescueUnits = window.ApdaState.rescueUnits;
      const shelters = window.ApdaState.shelters;

      this.responderLeafletMap = L.map('responder-map-canvas').setView([26.1445, 91.7362], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | ApdaSetu Command'
      }).addTo(this.responderLeafletMap);

      // Add Incident Markers (Red/Orange)
      requests.forEach(req => {
        if (!req.coordinates) return;
        const isCrit = req.severity === 'critical';
        const marker = L.circleMarker(req.coordinates, {
          radius: isCrit ? 10 : 8,
          fillColor: isCrit ? '#ef4444' : '#f59e0b',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(this.responderLeafletMap);

        marker.bindPopup(`
          <div style="font-family: inherit; color: #0f172a; padding: 4px;">
            <span style="font-size: 10px; font-weight: bold; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px;">${req.id} • ${req.severity.toUpperCase()}</span>
            <h4 style="margin: 4px 0; font-size: 13px;">${req.disasterType.toUpperCase()}: ${req.userName}</h4>
            <p style="margin: 2px 0; font-size: 11px; color: #475569;">${req.address}</p>
            <p style="font-size: 11px; margin: 4px 0;"><strong>${req.peopleAffected} People</strong> | AI Risk: <strong>${req.aiScore.riskScore}/100</strong></p>
            <button onclick="window.ApdaResponderDashboard.openDispatchModal('${req.id}')" style="width: 100%; background: #b45309; color: white; border: none; padding: 5px; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer; margin-top: 4px;">
              Dispatch Response Unit →
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
          <div style="font-family: inherit; color: #0f172a; padding: 4px;">
            <h4 style="margin: 0; font-size: 13px; color: #b45309;">🚒 ${u.name}</h4>
            <p style="margin: 3px 0; font-size: 11px;">Leader: ${u.leader} (${u.phone})</p>
            <p style="margin: 3px 0; font-size: 11px;">Status: <strong>${u.status}</strong> (${u.personnel} personnel)</p>
          </div>
        `);
      });

      // Add Shelters (Green)
      shelters.forEach(s => {
        if (!s.coordinates) return;
        const marker = L.circleMarker(s.coordinates, {
          radius: 8,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(this.responderLeafletMap);

        marker.bindPopup(`
          <div style="font-family: inherit; color: #0f172a; padding: 4px;">
            <h4 style="margin: 0; font-size: 13px; color: #065f46;">🏠 ${s.name}</h4>
            <p style="margin: 3px 0; font-size: 11px;">Occupied: ${s.occupied}/${s.totalCapacity} beds</p>
          </div>
        `);
      });

    } catch (e) {
      console.warn('Responder map init warning:', e);
    }
  },

  // 3. Multi-Agency Dispatch Panel
  renderDispatchPanel() {
    const units = window.ApdaState.rescueUnits;

    return `
      <div class="space-y-6">
        
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Active Response Battalions, Medical Ambulances & Civil Defense Squads:</span>
          <span class="text-amber-400 font-bold">5 Registered Units</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${units.map(unit => {
            const isDeployed = unit.status === 'Deployed';

            return `
              <div class="glass-panel p-6 rounded-3xl border transition-all ${isDeployed ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-700 bg-slate-900/60'}">
                
                <div class="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl ${isDeployed ? 'bg-amber-600' : 'bg-slate-800'} flex items-center justify-center text-xl text-white">
                      ${unit.agency === 'Medical' ? '🩺' : unit.agency === 'NDRF' ? '🚤' : unit.agency === 'Fire Brigade' ? '🚒' : '🤝'}
                    </div>
                    <div>
                      <h3 class="font-extrabold text-sm text-white">${unit.name}</h3>
                      <p class="text-xs text-slate-400 mt-0.5">Leader: <strong>${unit.leader}</strong> (${unit.phone})</p>
                    </div>
                  </div>

                  <span class="px-2.5 py-0.5 rounded text-xs font-bold ${isDeployed ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}">
                    ${unit.status}
                  </span>
                </div>

                <div class="mt-3 text-xs text-slate-300 space-y-1.5">
                  <p>Agency: <strong class="text-amber-300">${unit.agency}</strong> • Personnel: <strong>${unit.personnel} Responders</strong></p>
                  <p>Type: <strong>${unit.type}</strong></p>
                  ${unit.assignedTo ? `<p class="text-red-300 font-bold">Currently Assigned to: Incident ${unit.assignedTo}</p>` : ''}
                </div>

                <!-- Equipment Inventory -->
                <div class="mt-3 pt-3 border-t border-white/5">
                  <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Assigned Gear & Equipment</span>
                  <div class="flex flex-wrap gap-1">
                    ${unit.equipment.map(eq => `
                      <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                        ⚡ ${eq}
                      </span>
                    `).join('')}
                  </div>
                </div>

                <div class="mt-4 flex items-center gap-2">
                  <a href="tel:${unit.phone}" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-center text-xs text-slate-200 rounded-xl border border-slate-700 transition-all">
                    📞 Radio Contact
                  </a>
                  ${isDeployed ? `
                    <button onclick="window.ApdaState.updateRequestStatus('${unit.assignedTo}', 'Resolved');" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl">
                      Recall to Base
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

  openDispatchModal(requestId) {
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
              <h3 class="font-black text-lg text-white">Dispatch Rescue Unit</h3>
              <p class="text-xs text-amber-300">Incident: ${req.id} • AI Risk: ${req.aiScore.riskScore}/100 (${req.aiScore.riskLevel})</p>
            </div>
          </div>
          <button onclick="document.getElementById('dispatch-modal-backdrop').remove()" class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">×</button>
        </div>

        <div class="mt-4 space-y-4">
          <div class="p-3 bg-slate-900 rounded-xl text-xs text-slate-300">
            <p><strong>Victim:</strong> ${req.userName} (${req.peopleAffected} persons)</p>
            <p><strong>Location:</strong> ${req.address}</p>
            <p class="text-amber-300 mt-1"><strong>AI Note:</strong> ${req.aiScore.aiNotes}</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Select Response Unit to Deploy</label>
            <select id="dispatch-unit-select" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500">
              ${window.ApdaState.rescueUnits.map(u => `
                <option value="${u.id}">${u.name} (${u.agency} - ${u.status}) - ${u.leader}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Operational Orders & Notes</label>
            <textarea id="dispatch-notes" rows="2" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500">Proceed immediately via high-water corridor. Inflatable raft required for rooftop access.</textarea>
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
    const unitId = document.getElementById('dispatch-unit-select').value;
    const notes = document.getElementById('dispatch-notes').value;

    const modal = document.getElementById('dispatch-modal-backdrop');
    if (modal) modal.remove();

    window.ApdaState.dispatchTeam(requestId, unitId, notes);
    this.setTab('queue');
  }
};
