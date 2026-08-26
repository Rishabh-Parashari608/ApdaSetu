// My Requests & Live Rescue Status Tracker Component

window.ApdaMyRequests = {
  render() {
    const user = window.ApdaState.currentUser;
    const requests = window.ApdaState.requests;
    
    // Filter requests for current user or show all active citizen requests
    const userRequests = user && user.role === 'citizen' 
      ? requests.filter(r => r.userId === user.id || r.id === 'REQ-2026-001')
      : requests;

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
              <span>📋</span> My Emergency Assistance Requests
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Track live rescue team dispatch, assigned NDRF/Medical units, ETA, and real-time status.
            </p>
          </div>

          <button onclick="window.ApdaSOSModal.openReportModal()" class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/40">
            <span>🚨</span> New SOS Request
          </button>
        </div>

        <!-- Requests List -->
        ${userRequests.length === 0 ? `
          <div class="glass-panel p-12 text-center rounded-2xl text-slate-400">
            <span class="text-4xl block mb-2">🛡️</span>
            <h3 class="text-base font-bold text-white">No Active Emergency Requests</h3>
            <p class="text-xs text-slate-400 mt-1">If you or someone nearby is in distress, click below to trigger SOS.</p>
            <button onclick="window.ApdaSOSModal.openReportModal()" class="mt-4 px-6 py-2.5 bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg">
              Report Emergency Now
            </button>
          </div>
        ` : userRequests.map(req => {
          
          const steps = ['Submitted', 'Verified', 'Ground Confirmed', 'Dispatched', 'Resolved'];
          let activeIndex = 0;
          if (req.status === 'Submitted') activeIndex = 0;
          else if (req.status === 'Verified' || req.status === 'Verification') activeIndex = 1;
          else if (req.status === 'Ground Confirmed' || req.status === 'Volunteer Assigned') activeIndex = 2;
          else if (req.status === 'Dispatched' || req.status === 'In Progress') activeIndex = 3;
          else if (req.status === 'Resolved' || req.status === 'Closed') activeIndex = 4;

          return `
            <div class="glass-panel rounded-3xl p-6 border border-white/10 space-y-6 transition-all hover:border-slate-600">
              
              <!-- Top Row: ID, Time, Severity -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-mono text-sm font-black text-white">${req.id}</span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${req.severity === 'critical' ? 'badge-critical' : 'badge-high'} uppercase">
                      ${req.disasterType} • ${req.severity}
                    </span>
                    ${req.status === 'Resolved' ? `
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">✓ RESOLVED</span>
                    ` : req.status === 'Ground Confirmed' ? `
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">✓ GROUND CONFIRMED</span>
                    ` : ''}
                    <span class="text-xs text-slate-400">Logged ${req.submittedAt}</span>
                  </div>
                  <p class="text-xs text-slate-300 font-semibold mt-1">📍 ${req.address}</p>
                </div>
              </div>

              <!-- Status Progress Stepper -->
              <div class="pt-2">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-4">Live Rescue Progression</span>
                <div class="flex items-center justify-between">
                  ${steps.map((step, idx) => {
                    const isCompleted = idx < activeIndex || (activeIndex === 4 && idx === 4);
                    const isActive = idx === activeIndex && activeIndex !== 4;
                    return `
                      <div class="stepper-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                        <div class="stepper-node text-xs">
                          ${isCompleted ? '✓' : (idx + 1)}
                        </div>
                        <span class="text-[11px] font-semibold mt-2 text-center ${isActive ? 'text-amber-400 font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}">
                          ${step}
                        </span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Assigned Volunteer Card (If assigned) -->
              ${req.assignedResponder ? `
                <div class="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center text-xl">
                      🦺
                    </div>
                    <div>
                      <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Assigned Local Volunteer Responder</span>
                      <h4 class="font-extrabold text-sm text-white">${req.assignedResponder.name} <span class="text-[10px] text-emerald-300 font-bold">✓ VERIFIED</span></h4>
                      <p class="text-xs text-slate-300 mt-0.5">Skills: ${req.assignedResponder.skills?.join(', ') || 'First aid'}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="bg-slate-950 px-3 py-1.5 rounded-xl border border-sky-500/30 text-right">
                      <span class="text-[9px] text-slate-400 block uppercase">ESTIMATED ARRIVAL</span>
                      <span class="text-xs font-bold text-sky-300 animate-pulse">~${req.assignedResponder.etaMinutes || 5} Mins</span>
                    </div>
                    ${req.assignedResponder.phone ? `
                      <a href="tel:${req.assignedResponder.phone}" class="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1">
                        <span>📞</span> Contact
                      </a>
                    ` : ''}
                  </div>
                </div>
              ` : ''}

              <!-- Assigned Team Card (If dispatched) -->
              ${req.assignedTeam ? `
                <div class="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/90 to-amber-950/30 border border-amber-500/30 shadow-lg">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    <div class="flex items-center gap-3.5">
                      <div class="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl animate-pulse">
                        🚤
                      </div>
                      <div>
                        <span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Assigned Rescue Unit</span>
                        <h4 class="font-extrabold text-sm text-white">${req.assignedTeam.name}</h4>
                        <p class="text-xs text-slate-300 mt-0.5">Leader: ${req.assignedTeam.leader} • Vehicle: ${req.assignedTeam.vehicle}</p>
                      </div>
                    </div>

                    <!-- ETA & Contact -->
                    <div class="flex items-center gap-3">
                      <div class="text-left sm:text-right bg-slate-950/80 px-3.5 py-2 rounded-xl border border-amber-500/30">
                        <span class="text-[10px] text-amber-300 font-bold block uppercase">ETA ON SCENE</span>
                        <span class="text-base font-black text-white animate-pulse">~${req.assignedTeam.etaMinutes} Mins</span>
                      </div>
                      <a href="tel:${req.assignedTeam.phone}" class="px-3.5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition-all">
                        <span>📞</span> Call Team
                      </a>
                    </div>
                  </div>

                  <!-- Equipment Allocated -->
                  <div class="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    <span>Onboard Gear:</span>
                    ${(req.assignedTeam.equipment || []).map(eq => `
                      <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        ${eq}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Timeline Details -->
              <div>
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Incident Audit Timeline</span>
                <div class="space-y-2 border-l-2 border-slate-800 pl-3 ml-1 text-xs">
                  ${req.timeline.map(t => `
                    <div class="relative">
                      <span class="w-2 h-2 rounded-full bg-red-500 absolute -left-[17px] top-1"></span>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-300">${['AI Verified', 'AI Evaluated'].includes(t.status) ? 'Verification' : t.status}</span>
                        <span class="text-[10px] text-slate-500">${t.time}</span>
                      </div>
                      <p class="text-slate-400 text-[11px] mt-0.5">${t.note}</p>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>
          `;
        }).join('')}

      </div>
    `;
  }
};
