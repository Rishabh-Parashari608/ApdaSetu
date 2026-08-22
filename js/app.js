// Main Application Bootstrap & Router for ApdaSetu

window.ApdaApp = {
  init() {
    console.log('[ApdaSetu] Initializing platform...');
    
    // Initialize core subsystems
    window.ApdaState.init();
    window.ApdaOfflineManager.init();
    window.ApdaSOSModal.init();

    // Subscribe to reactive state updates
    window.ApdaState.subscribe(() => {
      this.render();
    });

    // Listen for language changes
    window.addEventListener('apdasetu_lang_changed', () => {
      this.render();
    });

    // Setup global keyboard listeners
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.ApdaSOSModal.close();
        window.ApdaAuthModal.close();
        window.ApdaEmergencyCallModal.close();
        const dispatchModal = document.getElementById('dispatch-modal-backdrop');
        if (dispatchModal) dispatchModal.remove();
      }
    });

    // Initial render
    this.render();
  },

  render() {
    const appContainer = document.getElementById('app-root');
    if (!appContainer) return;

    const currentView = window.ApdaState.currentView;

    let mainContent = '';
    if (currentView === 'home') {
      mainContent = window.ApdaHomepage.render();
    } else if (currentView === 'citizen') {
      mainContent = window.ApdaCitizenDashboard.render();
    } else if (currentView === 'responder') {
      mainContent = window.ApdaResponderDashboard.render();
    } else {
      mainContent = window.ApdaHomepage.render();
    }

    appContainer.innerHTML = `
      <div class="min-h-screen flex flex-col justify-between">
        <div>
          ${window.ApdaNavbar.render()}
          <main>
            ${mainContent}
          </main>
        </div>

        ${this.renderFooter()}
      </div>
    `;
  },

  renderFooter() {
    const t = (k) => window.ApdaI18n.t(k);

    return `
      <footer class="glass-panel border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-400">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white text-base">
              🛡️
            </div>
            <div>
              <span class="font-extrabold text-sm text-white">${t('appName')}</span>
              <p class="text-[11px] text-slate-400">Government & Community Disaster Rescue Network</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span class="text-slate-300 font-bold">National Helplines:</span>
            <a href="tel:112" class="hover:text-red-400 font-bold">112 (Emergency)</a>
            <a href="tel:1078" class="hover:text-red-400 font-bold">1078 (NDRF)</a>
            <a href="tel:108" class="hover:text-red-400 font-bold">108 (Ambulance)</a>
            <a href="tel:101" class="hover:text-red-400 font-bold">101 (Fire)</a>
            <a href="tel:1070" class="hover:text-red-400 font-bold">1070 (SDMA)</a>
          </div>

          <div class="text-[11px] text-slate-500">
            Smart India Hackathon Prototype • WCAG Accessible • Offline PWA
          </div>

        </div>
      </footer>
    `;
  }
};

// Auto-boot on DOM content ready
document.addEventListener('DOMContentLoaded', () => {
  window.ApdaApp.init();
});
