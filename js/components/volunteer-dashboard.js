// [volunteer done] Verified Volunteer Response Dashboard.
window.ApdaVolunteerDashboard = {
  mutedScrambleIds: new Set(), // [volunteer done] Per-tab mute applies only to the current emergency alert.
  sirenListenerReady: false, // [volunteer done] Lets the visual audio-control state follow the shared sound engine.
  render() {
    // [volunteer done] Refresh only when Web Audio changes, so autoplay fallback messaging is accurate.
    if (!this.sirenListenerReady) {
      window.addEventListener('apdasetu_siren_state', () => window.ApdaState.emitChange());
      this.sirenListenerReady = true;
    }
    const user = window.ApdaState.currentUser;
    const volunteer = window.ApdaState.volunteers.find(v => v.id === user.id) || window.ApdaState.volunteers[0];
    if (!volunteer) return '<div class="p-8 text-slate-300">Volunteer profile unavailable.</div>';
    const tasks = window.ApdaState.volunteerMobilizations.filter(m => m.targets.some(t => t.volunteerId === volunteer.id));
    const activeTasks = tasks.filter(m => !['completed', 'declined', 'resolved'].includes(m.targets.find(t => t.volunteerId === volunteer.id).status));
    const resolvedScramble = tasks.find(m => m.isScramble && m.status === 'resolved'); // [volunteer done] Preserve a clear Command Center closure message after the alert disappears.
    const serviceInfo = window.ApdaState.getVolunteerServiceInfo(volunteer); // [volunteer done] Show the live 12-hour safety limit without a chart dependency.
    const activeScramble = window.ApdaState.volunteerMobilizations.find(m => m.isScramble && !['resolved', 'escalated'].includes(m.status)); // [volunteer done] Share only the incident details already visible through the volunteer response network.
    const activeTarget = activeScramble?.targets.find(target => target.volunteerId === volunteer.id);
    const activeDistance = activeScramble ? window.ApdaState.calculateDistanceKm(volunteer.coordinates, activeScramble.incidentCoordinates) : null;
    const activeEligible = activeScramble && activeDistance !== null && activeDistance <= activeScramble.rules.radiusKm && window.ApdaState.isVolunteerEligible(volunteer);
    return `
      <div class="min-h-screen pb-20 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <section class="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-400/50 flex items-center justify-center text-3xl">🦺</div>
            <div><div class="flex flex-wrap items-center gap-2"><h1 class="text-xl sm:text-2xl font-black text-white">Volunteer Response Dashboard</h1><span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">✓ VERIFIED VOLUNTEER</span></div><p class="text-xs text-slate-300 mt-1"><strong>${volunteer.name}</strong> · ${volunteer.skills.join(' · ')}</p></div>
          </div>
          <div class="flex items-center gap-2 rounded-2xl p-1 bg-slate-950/70 border border-white/10">
            <button onclick="window.ApdaState.setVolunteerAvailability('${volunteer.id}', 'available')" class="px-4 py-2 rounded-xl text-xs font-black ${volunteer.availability === 'available' ? 'bg-emerald-600 text-white' : 'text-slate-400'}">● AVAILABLE</button>
            <button onclick="window.ApdaState.setVolunteerAvailability('${volunteer.id}', 'offline')" class="px-4 py-2 rounded-xl text-xs font-black ${volunteer.availability === 'offline' ? 'bg-slate-700 text-white' : 'text-slate-400'}">OFFLINE</button>
          </div>
        </section>
        <section class="glass-panel rounded-3xl p-4 border ${activeScramble ? 'border-cyan-500/40 bg-cyan-950/15' : 'border-white/10'}"><div class="flex items-start justify-between gap-3"><div><p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Command Center Event</p>${activeScramble ? `<h2 class="mt-1 font-black text-white">${String(activeScramble.disasterType || 'Emergency').toUpperCase()} RESCUE · <span class="text-red-300">${String(activeScramble.severity).toUpperCase()}</span></h2><p class="mt-1 text-xs text-slate-300">📍 ${activeDistance?.toFixed(1)} km away · Estimated response: ~${window.ApdaState.estimateVolunteerEta(activeDistance)} min</p>` : '<h2 class="mt-1 font-black text-slate-200">No active Command Center event</h2><p class="mt-1 text-xs text-slate-400">You will be notified if an eligible nearby scramble begins.</p>'}</div>${activeScramble ? `<span class="px-2.5 py-1 rounded-lg text-[10px] font-black ${activeTarget || activeEligible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}">${activeTarget || activeEligible ? '✓ ELIGIBLE' : '✕ OUTSIDE RESPONSE RADIUS'}</span>` : ''}</div></section>
        <section class="glass-panel rounded-3xl p-5 border ${serviceInfo.reached ? 'border-red-500/60 bg-red-950/25' : serviceInfo.warning ? 'border-amber-500/50 bg-amber-950/20' : 'border-emerald-500/30'}"><div class="flex items-start justify-between gap-4"><div><h2 class="font-black text-white">Volunteer Service Limit</h2><p class="text-xs text-slate-400 mt-1">Maximum active service: 12 hours</p></div><span class="text-xs font-black ${serviceInfo.reached ? 'text-red-300' : serviceInfo.warning ? 'text-amber-300' : 'text-emerald-300'}">${serviceInfo.reached ? '🛑 SERVICE LIMIT REACHED' : serviceInfo.warning ? `⚠️ ${serviceInfo.warning}` : '✓ WITHIN SERVICE LIMIT'}</span></div><div class="mt-4 h-3 rounded-full bg-slate-950 overflow-hidden"><div class="h-full rounded-full ${serviceInfo.reached ? 'bg-red-500' : serviceInfo.warning ? 'bg-amber-500' : 'bg-emerald-500'}" style="width:${serviceInfo.percent}%"></div></div><div class="mt-2 flex items-center justify-between text-xs"><strong class="text-white">${serviceInfo.usedHours.toFixed(1)}h / ${serviceInfo.maxHours}h</strong><span class="text-slate-400">${serviceInfo.percent}% used · ${serviceInfo.remainingHours.toFixed(1)}h remaining</span></div>${serviceInfo.reached ? '<p class="mt-3 text-xs font-bold text-red-200">You have reached the 12-hour volunteer service limit and are OFFLINE for new emergency requests.</p>' : ''}</section>
        ${resolvedScramble ? `<section class="rounded-2xl p-4 border border-emerald-500/40 bg-emerald-950/25"><p class="font-black text-emerald-300">🟢 SCRAMBLE RESOLVED</p><p class="text-xs text-slate-300 mt-1">This emergency request has been closed by Command Center. You are back to your normal available state.</p></section>` : ''}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          ${[[activeTasks.length, 'Active emergency alerts', 'text-red-400'], [volunteer.completedTasks, 'Completed tasks', 'text-emerald-400'], [volunteer.peopleAssisted, 'People assisted', 'text-sky-400'], [volunteer.hoursServed, 'Hours served', 'text-amber-400']].map(([value, label, color]) => `<div class="glass-panel rounded-2xl p-4 border border-white/10"><div class="text-2xl font-black ${color}">${value}</div><p class="text-xs text-slate-400 mt-1">${label}</p></div>`).join('')}
        </div>
        <div class="grid lg:grid-cols-3 gap-5">
          <section class="lg:col-span-2 space-y-4"><div class="flex justify-between items-center"><h2 class="font-black text-white">Emergency requests</h2><span class="text-xs text-slate-400">Live synchronized across command tabs</span></div>${activeTasks.length ? activeTasks.map(m => this.renderTask(m, volunteer)).join('') : `<div class="glass-panel rounded-3xl p-8 border border-white/10 text-center"><div class="text-4xl">🛡️</div><h3 class="font-bold text-white mt-3">Standing by for nearby requests</h3><p class="text-xs text-slate-400 mt-1">Only available, verified volunteers receive mobilization alerts.</p></div>`}</section>
          <aside class="glass-panel rounded-3xl p-5 border border-white/10"><h2 class="font-black text-white">Response history</h2><div class="mt-4 space-y-3">${volunteer.responseHistory.map(item => `<div class="border-l-2 border-emerald-500/60 pl-3 text-xs text-slate-300">${item}</div>`).join('')}</div><div class="mt-5 pt-4 border-t border-white/10"><p class="text-[10px] font-bold text-slate-500 uppercase">Response skills</p><div class="flex flex-wrap gap-1.5 mt-2">${volunteer.skills.map(skill => `<span class="px-2 py-1 rounded-lg bg-slate-800 text-xs text-slate-200">${skill}</span>`).join('')}</div></div></aside>
        </div>
      </div>`;
  },

  // [volunteer done] Urgent request card with a live, explicitly estimated arrival time.
  renderTask(mobilization, volunteer) {
    const target = mobilization.targets.find(t => t.volunteerId === volunteer.id);
    const remaining = Math.max(0, mobilization.expiresAt - Date.now());
    const minutes = String(Math.floor(remaining / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
    const severity = String(mobilization.severity).toUpperCase();
    const isDone = ['completed', 'declined'].includes(target.status);
    const isActiveScramble = mobilization.isScramble && target.status === 'notified' && !mobilization.escalated && remaining > 0;
    if (isActiveScramble) setTimeout(() => this.startScrambleSiren(mobilization.id), 0); // [volunteer done] Start only after the alert renders and never block interaction.
    const isMuted = this.mutedScrambleIds.has(mobilization.id);
    return `<article class="glass-panel rounded-3xl p-5 border ${isActiveScramble ? 'border-red-400 bg-red-950/35 shadow-xl shadow-red-900/30 animate-pulse' : severity === 'CRITICAL' ? 'border-red-500/70 bg-red-950/25 shadow-lg shadow-red-900/20' : 'border-amber-500/40 bg-amber-950/15'}">
      ${isActiveScramble ? `<div class="mb-4 p-3 rounded-2xl bg-red-600 text-white border border-red-300/70"><div class="font-black tracking-wide text-base">🚨🚨 EMERGENCY SCRAMBLE 🚨🚨</div><div class="text-xs font-bold mt-1">${severity} INCIDENT · ${String(mobilization.disasterType || 'emergency').toUpperCase()} RESCUE REQUIRED</div></div>` : mobilization.isScramble && mobilization.escalated ? '<div class="mb-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs font-black text-amber-200">⚠️ RESPONSE WINDOW EXPIRED — professional response has been escalated.</div>' : ''}
      <div class="flex flex-col sm:flex-row sm:justify-between gap-3"><div><div class="flex gap-2 items-center"><span class="text-lg">${target.status === 'notified' ? '🚨' : '🦺'}</span><span class="font-black text-sm ${severity === 'CRITICAL' ? 'text-red-400 animate-pulse' : 'text-amber-300'}">${target.status === 'notified' ? 'NEW EMERGENCY REQUEST · ' : ''}${severity}</span></div><p class="text-sm font-bold text-white mt-2">${mobilization.incidentAddress}</p><p class="text-xs text-slate-300 mt-1">📍 ${target.distanceKm} km away · <strong>Estimated response: ~${target.etaMinutes} min</strong> <span class="text-slate-500">(estimate, not guaranteed)</span></p></div>${!isDone ? `<div class="rounded-2xl px-4 py-3 bg-slate-950/80 border border-red-500/30 text-center"><div class="text-[10px] uppercase font-bold text-slate-400">${isActiveScramble ? '🔊 EMERGENCY ALERT ACTIVE' : 'Response window'}</div><div class="text-2xl font-black text-red-400">${minutes}:${seconds} <span class="text-xs">remaining</span></div></div>` : ''}</div>
      ${target.etaExceeded ? '<div class="mt-3 p-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-200">⚠️ ETA EXCEEDED — command has been notified.</div>' : ''}
      <div class="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">${isActiveScramble ? this.sirenButton(mobilization.id, isMuted) : ''}${this.actionButtons(mobilization, volunteer, target)}</div>
    </article>`;
  },

  // [volunteer done] Mute keeps the alert, countdown, and task fully active for accessibility and control.
  sirenButton(mobilizationId, isMuted) {
    return `<button onclick="window.ApdaVolunteerDashboard.toggleScrambleSiren('${mobilizationId}')" class="px-4 py-2.5 rounded-xl text-xs font-black ${isMuted ? 'bg-slate-700 text-white' : 'bg-slate-950 border border-red-400/50 text-red-200'}">${isMuted ? '🔊 UNMUTE SIREN' : '🔇 MUTE SIREN'}</button>${!window.ApdaSoundEngine?.isSirenPlaying && !isMuted ? `<button onclick="window.ApdaVolunteerDashboard.enableEmergencyAudio('${mobilizationId}')" class="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black">🔊 TAP TO ENABLE EMERGENCY AUDIO</button>` : ''}`;
  },

  // [volunteer done] Start a repeating Web Audio siren only for the receiving volunteer's active scramble.
  startScrambleSiren(mobilizationId) {
    if (!this.mutedScrambleIds.has(mobilizationId) && !window.ApdaSoundEngine?.isSirenPlaying) window.ApdaSoundEngine?.startVolunteerScrambleSiren();
  },

  // [volunteer done] Local mute never acknowledges or synchronizes a task state.
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

  // [volunteer done] Explicit user interaction retries audio when autoplay is unavailable.
  enableEmergencyAudio(mobilizationId) {
    if (!this.mutedScrambleIds.has(mobilizationId)) window.ApdaSoundEngine?.enableEmergencyAudio();
  },

  // [volunteer done] Enforce the notified → accepted → on the way → on site → completed field workflow.
  actionButtons(mobilization, volunteer, target) {
    const action = (label, status, classes) => `<button onclick="window.ApdaState.updateVolunteerTask('${mobilization.id}', '${volunteer.id}', '${status}')" class="px-4 py-2.5 rounded-xl text-xs font-black ${classes}">${label}</button>`;
    if (target.status === 'notified') return action('ACCEPT TASK', 'accepted', 'bg-red-600 hover:bg-red-500 text-white') + action('DECLINE', 'declined', 'bg-slate-800 hover:bg-slate-700 text-slate-300');
    if (target.status === 'accepted') return action('ON THE WAY', 'on_the_way', 'bg-sky-600 hover:bg-sky-500 text-white');
    if (target.status === 'on_the_way') return action("I'M ON SITE", 'on_site', 'bg-emerald-600 hover:bg-emerald-500 text-white');
    if (target.status === 'on_site') return action('COMPLETE TASK', 'completed', 'bg-emerald-700 hover:bg-emerald-600 text-white');
    return `<span class="px-3 py-2 rounded-xl text-xs font-bold ${target.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}">${target.status.toUpperCase().replace('_', ' ')}</span>`;
  }
};
