// Universal Navbar Component

window.ApdaNavbar = {
  isMenuOpen: false,

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateMenuVisibility();
  },

  openMenu() {
    this.isMenuOpen = true;
    this.updateMenuVisibility();
  },

  updateMenuVisibility() {
    const menu = document.getElementById('navbar-overflow-menu');
    const button = document.getElementById('navbar-overflow-toggle');
    if (menu) menu.classList.toggle('hidden', !this.isMenuOpen);
    if (button) button.setAttribute('aria-expanded', String(this.isMenuOpen));
  },

  closeMenu() {
    this.isMenuOpen = false;
    const menu = document.getElementById('navbar-overflow-menu');
    const button = document.getElementById('navbar-overflow-toggle');
    if (menu) menu.classList.add('hidden');
    if (button) button.setAttribute('aria-expanded', 'false');
  },

  render() {
    const t = (k) => window.ApdaI18n.t(k);
    const user = window.ApdaState.currentUser;
    const currentLang = window.ApdaI18n.currentLang;

    return `
      <nav class="glass-panel sticky top-0 z-40 border-b border-white/10 px-4 lg:px-8 py-3 transition-all duration-300">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          <!-- Logo & Brand -->
          <!-- [volunteer done] Route the brand safely to all three role dashboards -->
          <div class="flex items-center gap-3 cursor-pointer" onclick="window.ApdaState.setView(window.ApdaState.currentUser ? (window.ApdaState.currentUser.role === 'responder' ? 'responder' : window.ApdaState.currentUser.role === 'volunteer' ? 'volunteer' : 'citizen') : 'home')">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                  ${t('appName')}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 font-medium hidden sm:block">
                ${t('tagline')}
              </p>
            </div>
          </div>

          <!-- Utility Controls & Actions -->
          <div class="relative flex items-center gap-2 sm:gap-3">
            <!-- Emergency Helplines Quick Modal -->
            <button onclick="window.ApdaEmergencyCallModal.open()" 
                    class="px-2.5 sm:px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all">
              <span>📞</span>
              <span class="hidden sm:inline">112 / Helplines</span>
            </button>

            <!-- Language Switcher -->
            <div class="relative hidden">
              <select onchange="window.ApdaI18n.setLanguage(this.value)" 
                      class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-red-500 cursor-pointer">
                ${window.ApdaI18n.languages.map(l => `
                  <option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.native}</option>
                `).join('')}
              </select>
            </div>

            <!-- Auth / User Indicator -->
            ${user ? `
              <div class="hidden">
                <button onclick="window.ApdaState.setView(user.role === 'responder' ? 'responder' : user.role === 'volunteer' ? 'volunteer' : 'citizen')" class="flex items-center gap-2 text-left hover:opacity-80">
                  <div class="w-8 h-8 rounded-full ${user.role === 'responder' ? 'bg-amber-600' : user.role === 'volunteer' ? 'bg-emerald-600' : 'bg-red-600'} flex items-center justify-center font-bold text-white text-xs">
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
              <button onclick="window.ApdaAuthModal.open('citizen', 'login')" class="hidden">
                Login
              </button>
              <button onclick="window.ApdaAuthModal.open('citizen', 'signup')" class="hidden">
                Sign up
              </button>
            `}

            <div class="relative" onmouseleave="window.ApdaNavbar.closeMenu()">
            <button id="navbar-overflow-toggle" onclick="window.ApdaNavbar.openMenu()" onmouseenter="window.ApdaNavbar.openMenu()" onfocus="window.ApdaNavbar.openMenu()"
                    class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black leading-none shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all"
                    title="More options" aria-label="More options" aria-expanded="${this.isMenuOpen}">&#8942;</button>

              <div id="navbar-overflow-menu" class="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/50 ${this.isMenuOpen ? '' : 'hidden'}">
                ${user ? `
                  <button onclick="window.ApdaState.setView('${user.role === 'responder' ? 'responder' : user.role === 'volunteer' ? 'volunteer' : 'citizen'}'); window.ApdaNavbar.closeMenu()" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-800">
                    <span class="grid h-7 w-7 place-items-center rounded-full ${user.role === 'responder' ? 'bg-amber-600' : user.role === 'volunteer' ? 'bg-emerald-600' : 'bg-red-600'} font-bold text-white">${user.name ? user.name.charAt(0) : 'U'}</span>
                    <span><strong class="block text-white">${user.name}</strong><small class="capitalize text-slate-400">${user.role} dashboard</small></span>
                  </button>
                ` : `
                  <button onclick="window.ApdaAuthModal.open('citizen', 'login'); window.ApdaNavbar.closeMenu()" class="w-full rounded-xl bg-red-600 px-3 py-2.5 text-left text-xs font-bold text-white hover:bg-red-500">Enter the Website</button>
                `}
                <div class="my-2 border-t border-slate-700"></div>
                <label class="block px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500" for="navbar-language">Language</label>
                <select id="navbar-language" onchange="window.ApdaI18n.setLanguage(this.value); window.ApdaNavbar.isMenuOpen = false" class="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs text-slate-200 focus:border-red-500 focus:outline-none">
                  ${window.ApdaI18n.languages.map(l => `<option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.native}</option>`).join('')}
                </select>
                ${user ? `
                  <div class="my-2 border-t border-slate-700"></div>
                  <button onclick="window.ApdaState.logout(); window.ApdaNavbar.isMenuOpen = false" class="w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-300 hover:bg-red-500/10">Log out</button>
                ` : ''}
              </div>

            </div>

          </div>
        </div>
      </nav>
    `;
  }
};
