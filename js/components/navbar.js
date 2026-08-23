// Universal Navbar Component

window.ApdaNavbar = {
  render() {
    const t = (k) => window.ApdaI18n.t(k);
    const user = window.ApdaState.currentUser;
    const currentLang = window.ApdaI18n.currentLang;
    const isSirenActive = window.ApdaSoundEngine && window.ApdaSoundEngine.isSirenPlaying;

    return `
      <nav class="glass-panel sticky top-0 z-40 border-b border-white/10 px-4 lg:px-8 py-3 transition-all duration-300">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3 cursor-pointer" onclick="window.ApdaState.setView('home')">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <span class="text-2xl">🛡️</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                  ${t('appName')}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/10 text-cyan-200 border border-cyan-300/25 uppercase tracking-wider">
                  Live Triage
                </span>
              </div>
              <p class="text-[11px] text-slate-400 font-medium hidden sm:block">
                ${t('tagline')}
              </p>
            </div>
          </div>

          <!-- Central Quick Links (When logged in) -->
          <div class="hidden md:flex items-center gap-1">
            <button onclick="window.ApdaState.setView('home')" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${window.ApdaState.currentView === 'home' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}">
              Home
            </button>
            <button onclick="window.ApdaState.setView('citizen'); window.ApdaState.setCitizenTab('alerts');" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${window.ApdaState.currentView === 'citizen' ? 'bg-cyan-400/15 text-cyan-100 border border-cyan-300/25' : 'text-slate-300 hover:text-white hover:bg-white/5'}">
              Citizen Dashboard
            </button>
            <button onclick="window.ApdaState.setView('responder');" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${window.ApdaState.currentView === 'responder' ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-300/25' : 'text-slate-300 hover:text-white hover:bg-white/5'}">
              Responder Command ⚡
            </button>
          </div>

          <!-- Utility Controls & Actions -->
          <div class="flex items-center gap-2 sm:gap-3">
            
            <!-- Siren / Audio Alert Toggle -->
            <button onclick="window.ApdaSoundEngine.isSirenPlaying ? window.ApdaSoundEngine.stopEmergencySiren() : window.ApdaSoundEngine.startEmergencySiren()" 
                    title="Toggle Disaster Warning Siren"
                    class="p-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 ${isSirenActive ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-lg shadow-red-600/50' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'}">
              <span>🚨</span>
              <span class="hidden lg:inline">${isSirenActive ? 'Siren Active' : 'Siren'}</span>
            </button>

            <!-- Emergency Helplines Quick Modal -->
            <button onclick="window.ApdaEmergencyCallModal.open()" 
                    class="px-2.5 sm:px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all">
              <span>📞</span>
              <span class="hidden sm:inline">112 / Helplines</span>
            </button>

            <!-- Language Switcher -->
            <div class="relative">
              <select onchange="window.ApdaI18n.setLanguage(this.value)" 
                      class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-red-500 cursor-pointer">
                ${window.ApdaI18n.languages.map(l => `
                  <option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.native}</option>
                `).join('')}
              </select>
            </div>

            <!-- Auth / User Indicator -->
            ${user ? `
              <div class="flex items-center gap-2 pl-1 sm:pl-2 border-l border-white/10">
                <button onclick="window.ApdaState.setView(user.role === 'responder' ? 'responder' : 'citizen')" class="flex items-center gap-2 text-left hover:opacity-80">
                  <div class="w-8 h-8 rounded-full ${user.role === 'responder' ? 'bg-amber-600' : 'bg-red-600'} flex items-center justify-center font-bold text-white text-xs">
                    ${user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div class="hidden xl:block text-xs">
                    <p class="font-bold text-white leading-tight">${user.name.split(' ')[0]}</p>
                    <p class="text-[10px] text-slate-400 capitalize">${user.role}</p>
                  </div>
                </button>
                <button onclick="window.ApdaState.logout()" title="Logout" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs">
                  🚪
                </button>
              </div>
            ` : `
              <button onclick="window.ApdaAuthModal.open()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs transition-all">
                Login / Demo
              </button>
            `}

          </div>
        </div>
      </nav>
    `;
  }
};
