// Official Verified Community Updates Component

window.ApdaCommunityUpdates = {
  render() {
    const updates = window.ApdaState.communityUpdates;

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
              <span>📢</span> Official Disaster Directives & Verified Bulletins
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Verified news directly from NDMA, State Chief Secretary relief cells, and District Collectors.
            </p>
          </div>

          <span class="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5">
            <span>🛡️</span> 100% Anti-Misinformation Verified
          </span>
        </div>

        <!-- Updates Stream -->
        <div class="space-y-4">
          ${updates.map(upd => `
            <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 hover:border-slate-600 transition-all">
              
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-400 flex items-center justify-center font-bold text-xs">
                    🏛️
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-white flex items-center gap-1.5">
                      ${upd.author}
                      <span class="text-blue-400 text-xs font-bold" title="Verified Authority">✓</span>
                    </h4>
                    <span class="text-[11px] text-slate-400 font-mono">${upd.time}</span>
                  </div>
                </div>

                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-950 text-blue-300 border border-blue-500/40 self-start sm:self-auto">
                  ${upd.badge}
                </span>
              </div>

              <div>
                <h3 class="text-base font-extrabold text-white">${upd.title}</h3>
                <p class="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                  ${upd.content}
                </p>
              </div>

              <div class="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span class="text-[11px]">Authorized Dispatch: State Emergency Operations Centre</span>
                <button onclick="window.ApdaSoundEngine.speakText('${upd.title}. ${upd.content}')" class="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1">
                  <span>🔊</span> Listen Bulletin
                </button>
              </div>

            </div>
          `).join('')}
        </div>

      </div>
    `;
  }
};
