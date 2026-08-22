// Safety Guides & Offline Emergency Kit Checklist Component

window.ApdaSafetyGuidesComp = {
  activeDisasterTab: 'flood',

  setDisasterTab(tab) {
    this.activeDisasterTab = tab;
    const container = document.getElementById('citizen-subtab-container');
    if (container) container.innerHTML = this.render();
  },

  render() {
    const guides = window.ApdaSafetyGuides.categories;
    const activeGuide = guides.find(g => g.id === this.activeDisasterTab) || guides[0];
    const checklist = window.ApdaSafetyGuides.emergencyKitChecklist;
    const checkedItems = window.ApdaState.checkedKitItems;

    const checkedCount = checkedItems.size;
    const totalCount = checklist.length;
    const packPercentage = Math.round((checkedCount / totalCount) * 100);

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">${activeGuide.icon}</span>
              <h2 class="text-xl font-extrabold text-white">Offline Disaster Safety Guides & Go-Bag Kit</h2>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Field-tested survival protocols from NDMA. Fully accessible offline when power & internet fail.
            </p>
          </div>

          <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Cached for Offline Use
          </span>
        </div>

        <!-- Disaster Category Selector Tabs -->
        <div class="flex flex-wrap gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
          ${guides.map(g => `
            <button onclick="window.ApdaSafetyGuidesComp.setDisasterTab('${g.id}')" class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${this.activeDisasterTab === g.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}">
              <span>${g.icon}</span>
              <span>${g.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Do's and Don'ts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- DO'S CARD (Green) -->
          <div class="glass-panel-success rounded-3xl p-6 border-2 border-emerald-500/40 shadow-xl space-y-4">
            <div class="flex items-center gap-2.5 pb-3 border-b border-emerald-500/30">
              <span class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base">✓</span>
              <h3 class="font-extrabold text-lg text-emerald-300">CRITICAL DO'S (${activeGuide.name})</h3>
            </div>

            <ul class="space-y-3 text-xs sm:text-sm text-slate-200">
              ${activeGuide.dos.map(d => `
                <li class="flex items-start gap-2.5">
                  <span class="text-emerald-400 font-bold mt-0.5">✔</span>
                  <span class="leading-relaxed">${d}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- DON'TS CARD (Red) -->
          <div class="glass-panel-danger rounded-3xl p-6 border-2 border-red-500/40 shadow-xl space-y-4">
            <div class="flex items-center gap-2.5 pb-3 border-b border-red-500/30">
              <span class="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-base">✕</span>
              <h3 class="font-extrabold text-lg text-red-400">CRITICAL DON'TS (LIFE THREATS)</h3>
            </div>

            <ul class="space-y-3 text-xs sm:text-sm text-slate-200">
              ${activeGuide.donts.map(d => `
                <li class="flex items-start gap-2.5">
                  <span class="text-red-400 font-bold mt-0.5">✖</span>
                  <span class="leading-relaxed font-medium">${d}</span>
                </li>
              `).join('')}
            </ul>
          </div>

        </div>

        <!-- Emergency Gear Box for Active Disaster -->
        <div class="glass-panel p-6 rounded-3xl border border-white/10">
          <h4 class="font-bold text-sm text-white mb-3 flex items-center gap-2">
            <span>🎒</span> Essential Survival Gear for ${activeGuide.name}
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            ${activeGuide.emergencyGear.map(gear => `
              <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 flex items-center gap-2">
                <span class="text-base">⚡</span>
                <span class="font-semibold">${gear}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Interactive 72-Hour Emergency Go-Bag Checklist -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-amber-950/20 shadow-xl space-y-5">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-2xl">🎒</span>
                <h3 class="font-extrabold text-lg text-white">72-Hour Disaster Go-Bag Preparedness Checklist</h3>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Check off items as you pack them. Your state is saved automatically to your device.</p>
            </div>

            <!-- Readiness Progress -->
            <div class="sm:text-right">
              <span class="text-xs font-extrabold ${packPercentage === 100 ? 'text-emerald-400' : 'text-amber-400'}">
                ${checkedCount} of ${totalCount} Packed (${packPercentage}%)
              </span>
              <div class="w-44 bg-slate-800 rounded-full h-2.5 mt-1 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300 ${packPercentage === 100 ? 'bg-emerald-500' : 'bg-amber-500'}" style="width: ${packPercentage}%"></div>
              </div>
            </div>
          </div>

          <!-- Checklist Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${checklist.map(item => {
              const isChecked = checkedItems.has(item.id);
              return `
                <label class="p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${isChecked ? 'bg-emerald-950/30 border-emerald-500/50 text-white' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'}">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.ApdaState.toggleKitItem('${item.id}')" class="mt-0.5 w-4 h-4 rounded accent-emerald-500 cursor-pointer">
                  <div class="flex-1">
                    <span class="text-xs font-semibold leading-snug block ${isChecked ? 'line-through opacity-80 text-emerald-300' : ''}">
                      ${item.title}
                    </span>
                    <span class="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 block">
                      Category: ${item.category} • ${item.priority}
                    </span>
                  </div>
                </label>
              `;
            }).join('')}
          </div>

        </div>

      </div>
    `;
  }
};
