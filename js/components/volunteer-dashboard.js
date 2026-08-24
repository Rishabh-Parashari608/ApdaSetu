// [volunteer done] Verified Volunteer Response Dashboard with scoped emergency scramble animations and localized countdowns.
window.ApdaVolunteerDashboard = {
  mutedScrambleIds: new Set(), // [volunteer done] Per-tab mute applies only to the current emergency alert.
  sirenListenerReady: false, // [volunteer done] Lets the visual audio-control state follow the shared sound engine.
  countdownInterval: null, // [volunteer done] Dedicated local timer updater that prevents global app re-renders.

  render() {
    // [volunteer done] Refresh only when Web Audio changes, so autoplay fallback messaging is accurate.
    if (!this.sirenListenerReady) {
      window.addEventListener('apdasetu_siren_state', () => window.ApdaState.emitChange());
      this.sirenListenerReady = true;
    }

    const user = window.ApdaState.currentUser;
    const volunteer = (window.ApdaState.volunteers || []).find(v => v.id === user?.id) || window.ApdaState.volunteers[0];
    if (!volunteer) return '<div class="p-8 text-slate-300">Volunteer profile unavailable.</div>';

    const tasks = (window.ApdaState.volunteerMobilizations || []).filter(m => m.targets.some(t => t.volunteerId === volunteer.id));
    const activeTasks = tasks.filter(m => !['completed', 'declined', 'resolved'].includes(m.targets.find(t => t.volunteerId === volunteer.id)?.status));
    const resolvedScramble = tasks.find(m => m.isScramble && m.status === 'resolved'); // [volunteer done] Clear Command Center closure feedback.
    const serviceInfo = window.ApdaState.getVolunteerServiceInfo(volunteer); // [volunteer done] Live 12-hour safety limit calculations.
    const activeScramble = (window.ApdaState.volunteerMobilizations || []).find(m => m.isScramble && !['resolved', 'escalated'].includes(m.status));
    const activeTarget = activeScramble?.targets.find(target => target.volunteerId === volunteer.id);
    const activeDistance = activeScramble ? window.ApdaState.calculateDistanceKm(volunteer.coordinates, activeScramble.incidentCoordinates) : null;
    const activeEligible = activeScramble && activeDistance !== null && activeDistance <= activeScramble.rules.radiusKm && window.ApdaState.isVolunteerEligible(volunteer);

    // [volunteer done] Schedule local countdown update after DOM render without triggering global app renders
    setTimeout(() => this.startLocalizedCountdowns(), 0);

    return `
      <div class="min-h-screen pb-20 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-5">

        <!-- Header & Availability Controls -->
        <section class="glass-panel p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600/20 border border-emerald-400/40 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
              🦺
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-black text-white">Volunteer Response Dashboard</h1>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">✓ VERIFIED VOLUNTEER</span>
              </div>
              <p class="text-xs text-slate-300 mt-1 font-medium"><strong>${volunteer.name}</strong> · ${volunteer.skills.join(' · ')}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 rounded-xl p-1 bg-slate-950/70 border border-white/10 w-fit">
            <button onclick="window.ApdaState.setVolunteerAvailability('${volunteer.id}', 'available')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${volunteer.availability === 'available' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">● AVAILABLE</button>
            <button onclick="window.ApdaState.setVolunteerAvailability('${volunteer.id}', 'offline')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${volunteer.availability === 'offline' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">OFFLINE</button>
          </div>
        </section>

        <!-- Command Center Active Event Banner -->
        <section class="glass-panel rounded-2xl p-4 border ${activeScramble ? 'border-cyan-500/40 bg-cyan-950/15' : 'border-white/10'}">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Command Center Event</p>
              ${activeScramble ? `
                <h2 class="mt-0.5 font-bold text-sm text-white">${String(activeScramble.disasterType || 'Emergency').toUpperCase()} RESCUE · <span class="text-red-300 font-black">${String(activeScramble.severity).toUpperCase()}</span></h2>
                <p class="mt-0.5 text-xs text-slate-300">📍 ${activeDistance !== null ? activeDistance.toFixed(1) : '~'} km away · Estimated response: ~${window.ApdaState.estimateVolunteerEta(activeDistance)} min</p>
              ` : `
                <h2 class="mt-0.5 font-bold text-sm text-slate-200">No active Command Center event</h2>
                <p class="mt-0.5 text-xs text-slate-400">You will be notified if an eligible nearby emergency scramble begins.</p>
              `}
            </div>
            ${activeScramble ? `
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold ${activeTarget || activeEligible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
                ${activeTarget || activeEligible ? '✓ ELIGIBLE' : '✕ OUTSIDE RADIUS'}
              </span>
            ` : ''}
          </div>
        </section>

        <!-- 12-Hour Volunteer Service Safety Limit -->
        <section class="glass-panel rounded-2xl p-4 sm:p-5 border ${serviceInfo.reached ? 'border-red-500/60 bg-red-950/20' : serviceInfo.warning ? 'border-amber-500/50 bg-amber-950/15' : 'border-emerald-500/25'}">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="font-bold text-sm text-white">Volunteer Service Limit</h2>
              <p class="text-xs text-slate-400 mt-0.5">Maximum active duty limit: 12 hours</p>
            </div>
            <span class="text-xs font-bold ${serviceInfo.reached ? 'text-red-300' : serviceInfo.warning ? 'text-amber-300' : 'text-emerald-300'}">
              ${serviceInfo.reached ? '🛑 LIMIT REACHED' : serviceInfo.warning ? `⚠️ ${serviceInfo.warning}` : '✓ WITHIN LIMIT'}
            </span>
          </div>
          <div class="mt-3 h-2.5 rounded-full bg-slate-950/80 overflow-hidden border border-white/5">
            <div class="h-full rounded-full transition-all duration-500 ${serviceInfo.reached ? 'bg-red-500' : serviceInfo.warning ? 'bg-amber-500' : 'bg-emerald-500'}" style="width:${serviceInfo.percent}%"></div>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs">
            <strong class="text-white">${serviceInfo.usedHours.toFixed(1)}h / ${serviceInfo.maxHours}h</strong>
            <span class="text-slate-400 font-medium">${serviceInfo.percent}% used · ${serviceInfo.remainingHours.toFixed(1)}h remaining</span>
          </div>
          ${serviceInfo.reached ? '<p class="mt-2.5 text-xs font-bold text-red-300">You have reached the 12-hour volunteer service limit and are OFFLINE for new emergency requests.</p>' : ''}
        </section>

        <!-- Scramble Resolved Notice -->
        ${resolvedScramble ? `
          <section class="rounded-2xl p-4 border border-emerald-500/40 bg-emerald-950/25">
            <p class="font-bold text-sm text-emerald-300">🟢 SCRAMBLE RESOLVED</p>
            <p class="text-xs text-slate-300 mt-1">This emergency request has been closed by Command Center. You are back to your normal available state.</p>
          </section>
        ` : ''}

        <!-- KPI Statistics -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          ${[
            [activeTasks.length, 'Active emergency alerts', 'text-red-400'],
            [volunteer.completedTasks || 0, 'Completed tasks', 'text-emerald-400'],
            [volunteer.peopleAssisted || 0, 'People assisted', 'text-sky-400'],
            [volunteer.hoursServed || 0, 'Hours served', 'text-amber-400']
          ].map(([value, label, color]) => `
            <div class="glass-panel rounded-2xl p-4 border border-white/10">
              <div class="text-2xl font-black ${color}">${value}</div>
              <p class="text-xs text-slate-400 mt-0.5 font-medium">${label}</p>
            </div>
          `).join('')}
        </div>

        <!-- Main Task List & History Grid -->
        <div class="grid lg:grid-cols-3 gap-5">

          <!-- Task List Column -->
          <section class="lg:col-span-2 space-y-4">
            <div class="flex justify-between items-center px-0.5">
              <h2 class="font-bold text-base text-white">Emergency Requests</h2>
              <span class="text-xs text-slate-400">Live synchronized with Command Center</span>
            </div>

            ${activeTasks.length ? activeTasks.map(m => this.renderTask(m, volunteer)).join('') : `
              <div class="glass-panel rounded-2xl p-8 border border-white/10 text-center">
                <div class="text-4xl">🛡️</div>
                <h3 class="font-bold text-white mt-3 text-sm">Standing by for nearby emergency requests</h3>
                <p class="text-xs text-slate-400 mt-1">Only available, verified volunteers inside the incident radius receive mobilization alerts.</p>
              </div>
            `}
          </section>

          <!-- History & Skills Column -->
          <aside class="glass-panel rounded-2xl p-5 border border-white/10 space-y-4 h-fit">
            <div>
              <h2 class="font-bold text-sm text-white">Response History</h2>
              <div class="mt-3 space-y-2.5">
                ${(volunteer.responseHistory || []).length ? volunteer.responseHistory.map(item => `
                  <div class="border-l-2 border-emerald-500/60 pl-3 text-xs text-slate-300 leading-relaxed">${item}</div>
                `).join('') : '<p class="text-xs text-slate-500">No previous responses logged yet.</p>'}
              </div>
            </div>

            <div class="pt-3 border-t border-white/10">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response Skills</p>
              <div class="flex flex-wrap gap-1.5 mt-2">
                ${(volunteer.skills || []).map(skill => `
                  <span class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium">${skill}</span>
                `).join('')}
              </div>
            </div>
          </aside>

        </div>

      </div>
    `;
  },

  // [volunteer done] Render task card with strictly scoped scramble emergency glow and localized countdown target
  renderTask(mobilization, volunteer) {
    const target = mobilization.targets.find(t => t.volunteerId === volunteer.id);
    const remaining = Math.max(0, mobilization.expiresAt - Date.now());
    const minutes = String(Math.floor(remaining / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
    const severity = String(mobilization.severity).toUpperCase();
    const isDone = ['completed', 'declined'].includes(target.status);
    const isActiveScramble = mobilization.isScramble && target.status === 'notified' && !mobilization.escalated && remaining > 0;

    // [volunteer done] Start siren only for active scramble on volunteer's task
    if (isActiveScramble) setTimeout(() => this.startScrambleSiren(mobilization.id), 0);
    const isMuted = this.mutedScrambleIds.has(mobilization.id);

    return `
      <article class="glass-panel rounded-2xl p-5 border transition-all ${
        isActiveScramble
          ? 'volunteer-scramble-card'
          : severity === 'CRITICAL'
            ? 'border-red-500/60 bg-red-950/20'
            : 'border-amber-500/35 bg-amber-950/15'
      }">

        <!-- [volunteer done] Scoped Scramble Banner with subtle badge animation -->
        ${isActiveScramble ? `
          <div class="volunteer-scramble-badge mb-4 p-3 rounded-xl bg-red-600 text-white border border-red-300/60 shadow-lg shadow-red-900/30">
            <div class="font-extrabold tracking-wide text-sm flex items-center gap-2">
              <span>🚨</span>
              <span>EMERGENCY SCRAMBLE ALERT</span>
            </div>
            <div class="text-xs font-semibold mt-0.5 text-red-100">
              ${severity} INCIDENT · ${String(mobilization.disasterType || 'emergency').toUpperCase()} RESCUE REQUIRED
            </div>
          </div>
        ` : mobilization.isScramble && mobilization.escalated ? `
          <div class="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-200">
            ⚠️ RESPONSE WINDOW EXPIRED — professional response has been escalated.
          </div>
        ` : ''}

        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <div class="flex gap-2 items-center">
              <span class="text-lg">${target.status === 'notified' ? '🚨' : '🦺'}</span>
              <span class="font-bold text-sm ${severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-300'}">
                ${target.status === 'notified' ? 'NEW EMERGENCY REQUEST · ' : ''}${severity}
              </span>
            </div>
            <p class="text-sm font-bold text-white mt-1.5">${mobilization.incidentAddress}</p>
            <p class="text-xs text-slate-300 mt-1">
              📍 ${target.distanceKm} km away · <strong>Estimated response: ~${target.etaMinutes} min</strong> <span class="text-slate-500 text-[11px]">(estimate, not guaranteed)</span>
            </p>
          </div>

          <!-- [volunteer done] Targeted countdown container with data-attributes for non-re-rendering ticking -->
          ${!isDone ? `
            <div class="rounded-xl px-4 py-2.5 bg-slate-950/80 border border-red-500/30 text-center flex-shrink-0">
              <div class="text-[10px] uppercase font-bold text-slate-400">
                ${isActiveScramble ? '🔊 EMERGENCY ALERT ACTIVE' : 'Response Window'}
              </div>
              <div class="text-xl font-black text-red-400" data-countdown-for="${mobilization.id}" data-expires-at="${mobilization.expiresAt}">
                ${minutes}:${seconds} <span class="text-xs font-medium text-slate-400">remaining</span>
              </div>
            </div>
          ` : ''}
        </div>

        ${target.etaExceeded ? `
          <div class="mt-3 p-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-200">
            ⚠️ ETA EXCEEDED — Command Center has been notified.
          </div>
        ` : ''}

        <!-- Audio & Action Buttons -->
        <div class="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-2">
          ${isActiveScramble ? this.sirenButton(mobilization.id, isMuted) : ''}
          ${this.actionButtons(mobilization, volunteer, target)}
        </div>

      </article>
    `;
  },

  // [volunteer done] Localized countdown updater that modifies only timer DOM elements every second without tearing down the UI
  startLocalizedCountdowns() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      const countdownElements = document.querySelectorAll('[data-countdown-for]');
      if (!countdownElements.length) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        return;
      }
      countdownElements.forEach(el => {
        const expiresAt = Number(el.getAttribute('data-expires-at')) || 0;
        const remaining = Math.max(0, expiresAt - Date.now());
        const minutes = String(Math.floor(remaining / 60000)).padStart(2, '0');
        const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
        el.innerHTML = `${minutes}:${seconds} <span class="text-xs font-medium text-slate-400">remaining</span>`;
        if (remaining <= 0) {
          window.ApdaState.checkVolunteerTimeouts();
        }
      });
    }, 1000);
  },

  // [volunteer done] Mute button keeps alert active while controlling audio siren
  sirenButton(mobilizationId, isMuted) {
    return `
      <button onclick="window.ApdaVolunteerDashboard.toggleScrambleSiren('${mobilizationId}')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${isMuted ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-950 border border-red-400/50 text-red-200 hover:bg-red-950/40'}">
        ${isMuted ? '🔊 UNMUTE SIREN' : '🔇 MUTE SIREN'}
      </button>
      ${!window.ApdaSoundEngine?.isSirenPlaying && !isMuted ? `
        <button onclick="window.ApdaVolunteerDashboard.enableEmergencyAudio('${mobilizationId}')" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md">
          🔊 TAP TO ENABLE EMERGENCY AUDIO
        </button>
      ` : ''}
    `;
  },

  // [volunteer done] Start siren only for active scramble without blocking user interactions
  startScrambleSiren(mobilizationId) {
    if (!this.mutedScrambleIds.has(mobilizationId) && !window.ApdaSoundEngine?.isSirenPlaying) {
      window.ApdaSoundEngine?.startVolunteerScrambleSiren();
    }
  },

  // [volunteer done] Local mute toggling
  toggleScrambleSiren(mobilizationId) {
    if (this.mutedScrambleIds.has(mobilizationId)) {
      this.mutedScrambleIds.delete(mobilizationId);
      this.startScrambleSiren(mobilizationId);
    } else {
      this.mutedScrambleIds.add(mobilizationId);
      window.ApdaSoundEngine?.stopEmergencySiren();
    }
    window.ApdaState.emitChange();
  },

  // [volunteer done] User gesture audio enablement for browser autoplay policies
  enableEmergencyAudio(mobilizationId) {
    if (!this.mutedScrambleIds.has(mobilizationId)) {
      window.ApdaSoundEngine?.enableEmergencyAudio();
    }
  },

  // [volunteer done] Action buttons for field task lifecycle: NOTIFIED -> ACCEPTED -> ON THE WAY -> ON SITE -> COMPLETED
  actionButtons(mobilization, volunteer, target) {
    const action = (label, status, classes) => `
      <button onclick="window.ApdaState.updateVolunteerTask('${mobilization.id}', '${volunteer.id}', '${status}')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${classes}">
        ${label}
      </button>
    `;
    if (target.status === 'notified') {
      return action('ACCEPT TASK', 'accepted', 'bg-red-600 hover:bg-red-500 text-white font-extrabold') + action('DECLINE', 'declined', 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700');
    }
    if (target.status === 'accepted') {
      return action('ON THE WAY', 'on_the_way', 'bg-sky-600 hover:bg-sky-500 text-white font-extrabold');
    }
    if (target.status === 'on_the_way') {
      return action("I'M ON SITE", 'on_site', 'bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold');
    }
    if (target.status === 'on_site') {
      return action('COMPLETE TASK', 'completed', 'bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold');
    }
    return `
      <span class="px-3 py-1.5 rounded-lg text-xs font-bold ${target.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
        ${target.status.toUpperCase().replace('_', ' ')}
      </span>
    `;
  }
};
