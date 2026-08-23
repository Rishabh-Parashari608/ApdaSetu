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
        <section class="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <!-- Background Glows -->
          <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute top-1/3 right-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div class="text-center relative z-10 max-w-3xl mx-auto">
            
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-300/25 text-cyan-200 text-xs font-bold mb-6">
              <span class="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></span>
              National Multi-Agency Disaster Coordination Bridge
            </div>

            <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Rapid Alert & AI-Powered Rescue <br>
              <span class="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                When Seconds Save Lives.
              </span>
            </h1>

            <p class="mt-6 text-sm sm:text-base text-slate-300 leading-relaxed">
              ${t('missionStatement')}
            </p>

            <!-- Hero Action Buttons -->
            <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onclick="window.ApdaSOSModal.openReportModal()" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                <span class="text-xl">🚨</span>
                ${t('reportDisasterNow')}
              </button>

              <button onclick="window.ApdaState.setView('citizen'); window.ApdaState.setCitizenTab('shelters');" class="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                <span>📍</span>
                ${t('findShelters')}
              </button>

              <button onclick="window.ApdaAuthModal.open('demo')" class="w-full sm:w-auto px-7 py-4 rounded-2xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-sm transition-all flex items-center justify-center gap-2">
                <span>⚡</span>
                Demo Responder Login
              </button>
            </div>

            <!-- Fast Stat Counters -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 text-left">
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="text-2xl font-black text-white">5</span>
                <p class="text-xs text-cyan-300 font-semibold mt-0.5">Active Critical Zones</p>
                <p class="text-[10px] text-slate-400">Assam, Odisha, UK, MH</p>
              </div>
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="text-2xl font-black text-emerald-400">1,840+</span>
                <p class="text-xs text-slate-300 font-semibold mt-0.5">${t('citizensRescued')}</p>
                <p class="text-[10px] text-slate-400">Past 48 Hours</p>
              </div>
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="text-2xl font-black text-amber-400">1,600 Beds</span>
                <p class="text-xs text-slate-300 font-semibold mt-0.5">${t('activeShelters')}</p>
                <p class="text-[10px] text-slate-400">With Live Vacancy</p>
              </div>
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="text-2xl font-black text-info-sky">11 Mins</span>
                <p class="text-xs text-slate-300 font-semibold mt-0.5">Avg Response Time</p>
                <p class="text-[10px] text-slate-400">AI Triage to Dispatch</p>
              </div>
            </div>

          </div>
        </section>

        <!-- 4-Step Interactive Flow Section -->
        <section class="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
        <section class="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
        <section class="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
