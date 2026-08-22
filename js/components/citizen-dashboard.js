// Main Citizen Dashboard Component

window.ApdaCitizenDashboard = {
  render() {
    const activeTab = window.ApdaState.citizenTab;
    const user = window.ApdaState.currentUser || { name: 'Priya Sharma (Assam Zone)' };

    const navTabs = [
      { id: 'alerts', label: 'Live Alerts', icon: '🚨' },
      { id: 'shelters', label: 'Shelter Map', icon: '🏠' },
      { id: 'requests', label: 'My Requests', icon: '📋' },
      { id: 'chat', label: 'Community Chat', icon: '💬' },
      { id: 'family', label: 'Family Check-in', icon: '👨‍👩‍👧' },
      { id: 'guides', label: 'Safety Guides', icon: '📖' },
      { id: 'updates', label: 'Official Updates', icon: '📢' },
      { id: 'profile', label: 'Medical Profile', icon: '🩺' }
    ];

    let contentHtml = '';
    if (activeTab === 'alerts') contentHtml = window.ApdaLiveAlerts.render();
    else if (activeTab === 'shelters') contentHtml = window.ApdaShelterMap.render();
    else if (activeTab === 'requests') contentHtml = window.ApdaMyRequests.render();
    else if (activeTab === 'chat') contentHtml = window.ApdaCommunityChat.render();
    else if (activeTab === 'family') contentHtml = window.ApdaFamilyCheckin.render();
    else if (activeTab === 'guides') contentHtml = window.ApdaSafetyGuidesComp.render();
    else if (activeTab === 'updates') contentHtml = window.ApdaCommunityUpdates.render();
    else if (activeTab === 'profile') contentHtml = window.ApdaProfileSettings.render();
    else contentHtml = window.ApdaLiveAlerts.render();

    return `
      <div class="min-h-screen pb-28 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        
        <!-- Welcome User Bar -->
        <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-red-600/30">
              👤
            </div>
            <div>
              <h1 class="text-base sm:text-lg font-black text-white">
                Citizen Portal — ${user.name}
              </h1>
              <p class="text-xs text-slate-400">
                Location: ${user.city || 'Hatigaon, Guwahati (Assam Inundation Sector)'}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- 1-Tap Trigger SOS -->
            <button onclick="window.ApdaSOSModal.openReportModal()" class="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 font-extrabold text-white text-xs rounded-xl shadow-lg shadow-red-600/40 uppercase tracking-wider flex items-center gap-2">
              <span>🚨</span> New SOS Report
            </button>
            <button onclick="window.ApdaState.setView('responder')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700">
              Switch to Responder ➔
            </button>
          </div>
        </div>

        <!-- Navigation Tabs Bar -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/10 chat-scroll">
          ${navTabs.map(t => `
            <button onclick="window.ApdaState.setCitizenTab('${t.id}')" class="px-3.5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
              <span>${t.icon}</span>
              <span>${t.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- Subtab Content Injection Container -->
        <div id="citizen-subtab-container">
          ${contentHtml}
        </div>

        <!-- Persistent Floating Panic SOS Button (Always visible on Citizen portal) -->
        <button onclick="window.ApdaSOSModal.triggerPanicSOS()" class="floating-sos-btn w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center text-white border-2 border-white/80 cursor-pointer" title="Emergency 1-Tap Distress Signal">
          <span class="text-xl sm:text-2xl animate-pulse">🚨</span>
          <span class="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter mt-0.5">SOS</span>
        </button>

      </div>
    `;
  }
};
