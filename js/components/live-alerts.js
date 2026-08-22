// Live Alerts Feed Component

window.ApdaLiveAlerts = {
  selectedCategory: 'all',
  selectedSeverity: 'all',

  filterCategory(cat) {
    this.selectedCategory = cat;
    const container = document.getElementById('citizen-subtab-container');
    if (container) container.innerHTML = this.render();
  },

  filterSeverity(sev) {
    this.selectedSeverity = sev;
    const container = document.getElementById('citizen-subtab-container');
    if (container) container.innerHTML = this.render();
  },

  render() {
    const alerts = window.ApdaState.alerts;
    const currentLang = window.ApdaI18n.currentLang;

    const filtered = alerts.filter(a => {
      const matchCat = this.selectedCategory === 'all' || a.category === this.selectedCategory;
      const matchSev = this.selectedSeverity === 'all' || a.severity === this.selectedSeverity;
      return matchCat && matchSev;
    });

    return `
      <div class="space-y-6">
        
        <!-- Header & Top Action Banner -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
              <h2 class="text-xl font-extrabold text-white">Live Disaster Alerts Feed</h2>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Real-time multi-channel bulletins from NDMA, IMD, CWC, and State Disaster Management Authorities.
            </p>
          </div>

          <!-- Quick SOS Trigger in Alerts Feed -->
          <button onclick="window.ApdaSOSModal.openReportModal()" class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-red-600/40 uppercase tracking-wider transition-all whitespace-nowrap">
            <span>🚨</span> Report Emergency in My Area
          </button>
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          
          <!-- Category Pills -->
          <div class="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            ${[
              { id: 'all', label: 'All Disasters', icon: '🌐' },
              { id: 'flood', label: 'Floods', icon: '🌊' },
              { id: 'cyclone', label: 'Cyclones', icon: '🌀' },
              { id: 'landslide', label: 'Landslides', icon: '⛰️' },
              { id: 'forest_fire', label: 'Forest Fires', icon: '🔥' }
            ].map(c => `
              <button onclick="window.ApdaLiveAlerts.filterCategory('${c.id}')" class="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${this.selectedCategory === c.id ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}">
                <span>${c.icon}</span>
                <span>${c.label}</span>
              </button>
            `).join('')}
          </div>

          <!-- Severity Filter -->
          <div class="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <span class="text-slate-400 text-[11px] px-2 font-medium">Severity:</span>
            <button onclick="window.ApdaLiveAlerts.filterSeverity('all')" class="px-2.5 py-1 rounded-lg ${this.selectedSeverity === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}">All</button>
            <button onclick="window.ApdaLiveAlerts.filterSeverity('critical')" class="px-2.5 py-1 rounded-lg ${this.selectedSeverity === 'critical' ? 'bg-red-600 text-white font-bold' : 'text-red-400'}">Critical</button>
            <button onclick="window.ApdaLiveAlerts.filterSeverity('high')" class="px-2.5 py-1 rounded-lg ${this.selectedSeverity === 'high' ? 'bg-amber-600 text-white font-bold' : 'text-amber-400'}">High</button>
          </div>

        </div>

        <!-- Alert Cards Grid -->
        <div class="space-y-4">
          ${filtered.length === 0 ? `
            <div class="glass-panel p-12 text-center rounded-2xl text-slate-400">
              <span class="text-4xl block mb-2">🛡️</span>
              <p class="text-sm font-semibold">No active disaster alerts found matching the selected filter.</p>
            </div>
          ` : filtered.map(alert => `
            <div class="glass-panel rounded-2xl p-5 border transition-all hover:scale-[1.005] ${alert.severity === 'critical' ? 'border-red-500/50 bg-red-950/20 shadow-lg shadow-red-950/30' : alert.severity === 'high' ? 'border-amber-500/40 bg-amber-950/20' : 'border-slate-700 bg-slate-900/60'}">
              
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${alert.severity === 'critical' ? 'badge-critical' : alert.severity === 'high' ? 'badge-high' : 'badge-medium'}">
                    ${alert.severity}
                  </span>
                  <span class="text-xs font-bold text-slate-300">
                    📍 ${alert.region} (${alert.state})
                  </span>
                  <span class="text-xs text-slate-400">
                    • ${alert.timestamp}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-slate-400 font-mono">Source: ${alert.source}</span>
                </div>
              </div>

              <!-- Title & Description -->
              <div class="mt-3">
                <h3 class="text-base sm:text-lg font-black text-white">
                  ${currentLang === 'hi' && alert.title_hi ? alert.title_hi : alert.title}
                </h3>
                <p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  ${alert.description}
                </p>
              </div>

              <!-- Multi-Channel Delivery Badges & Audio TTS -->
              <div class="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="text-[11px] text-slate-400 mr-1">Broadcast Channels:</span>
                  ${alert.channels.map(ch => `
                    <span class="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ${ch}
                    </span>
                  `).join('')}
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                  
                  <!-- Read Out Loud (Text to Speech) -->
                  <button onclick="window.ApdaSoundEngine.speakText('${alert.title}. ${alert.description}', '${currentLang}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all">
                    <span>🔊</span> Listen
                  </button>

                  <a href="tel:${alert.helpline.split(' ')[0]}" class="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-all">
                    <span>📞</span> Hotline: ${alert.helpline}
                  </a>

                </div>

              </div>

            </div>
          `).join('')}
        </div>

      </div>
    `;
  }
};
