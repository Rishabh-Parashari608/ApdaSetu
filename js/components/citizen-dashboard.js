// Main Citizen Dashboard Component — Premium Redesign
window.ApdaCitizenDashboard = {
  render() {
    const activeTab = window.ApdaState.citizenTab;
    const user = window.ApdaState.currentUser || { name: 'Priya Sharma', city: 'Hatigaon, Guwahati' };

    const navTabs = [
      { id: 'alerts', label: 'Live Alerts', icon: '🚨', desc: 'Real-time warnings' },
      { id: 'shelters', label: 'Shelter Map', icon: '🏠', desc: 'Find safe zones' },
      { id: 'requests', label: 'My Requests', icon: '📋', desc: 'Track your reports' },
      { id: 'chat', label: 'Community Chat', icon: '💬', desc: 'Connect with others' },
      { id: 'family', label: 'Family Check-in', icon: '👨‍👩‍👧', desc: 'Loved ones status' },
      { id: 'guides', label: 'Safety Guides', icon: '📖', desc: 'Emergency protocols' },
      { id: 'updates', label: 'Official Updates', icon: '📢', desc: 'Government news' },
      { id: 'profile', label: 'Medical Profile', icon: '🩺', desc: 'Your health info' }
    ];

    const components = {
      alerts: 'ApdaLiveAlerts',
      shelters: 'ApdaShelterMap',
      requests: 'ApdaMyRequests',
      chat: 'ApdaCommunityChat',
      family: 'ApdaFamilyCheckin',
      guides: 'ApdaSafetyGuidesComp',
      updates: 'ApdaCommunityUpdates',
      profile: 'ApdaProfileSettings'
    };

    const contentHtml = window[components[activeTab] || components.alerts].render();
    const location = user.city || 'Hatigaon, Guwahati';
    const avatar = user.profileImage
      ? `<img src="${user.profileImage}" alt="${user.name}'s profile picture" class="w-full h-full object-cover rounded-[inherit]">`
      : (user.name ? user.name.charAt(0) : 'C');

    const openAlerts = window.ApdaState.alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    const firstName = user.name.split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return `
      <div class="citizen-dashboard min-h-screen pb-28 relative">

        <!-- Ambient Background Orbs -->
        <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div class="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-[rgba(72,219,251,0.04)] blur-[120px]"></div>
          <div class="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-[rgba(255,71,87,0.03)] blur-[100px]"></div>
          <div class="absolute bottom-0 left-1/3 w-[600px] h-[300px] rounded-full bg-[rgba(29,209,161,0.03)] blur-[100px]"></div>
        </div>

        <!-- Hero Section -->
        <section class="citizen-hero relative z-10 px-4 sm:px-6 lg:px-8 pt-8 pb-16 overflow-hidden">
          <div class="max-w-7xl mx-auto relative">

            <!-- Decorative grid lines -->
            <div class="absolute inset-0 pointer-events-none opacity-[0.03]" aria-hidden="true"
              style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px); background-size: 60px 60px;">
            </div>

            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">

              <!-- User Profile Block -->
              <div class="flex items-center gap-5">
                <div class="citizen-avatar relative group cursor-pointer" onclick="window.ApdaState.setCitizenTab('profile')">
                  <div class="w-full h-full flex items-center justify-center text-white text-xl font-black">${avatar}</div>
                  <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1dd1a1] border-2 border-[#0a1628] shadow-[0_0_8px_rgba(29,209,161,0.6)] animate-pulse"></div>
                  <div class="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10"></div>
                </div>

                <div class="space-y-1">
                  <p class="text-[10px] font-black uppercase tracking-[0.25em] text-[#48dbfb]">Citizen Dashboard</p>
                  <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                    ${greeting}, <span class="text-gradient">${firstName}</span>.
                  </h1>
                  <div class="flex items-center gap-3 mt-2">
                    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
                      <span class="text-sm">📍</span>
                      <span class="text-sm text-[#94a3b8] font-medium">${location}</span>
                    </div>
                    <button onclick="window.ApdaState.setCitizenTab('profile')" 
                      class="group relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/[0.12] bg-white/[0.05] text-white text-xs transition-all duration-300 hover:bg-white/[0.12] hover:border-[#48dbfb]/30 hover:shadow-[0_0_15px_rgba(72,219,251,0.15)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#48dbfb]/50"
                      title="Edit profile details" aria-label="Edit profile details">
                      <span class="transition-transform duration-300 group-hover:rotate-12">✎</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Emergency Report CTA -->
              <button onclick="window.ApdaSOSModal.openReportModal()" 
                class="citizen-sos-action group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2.5">
                  <span class="text-xl group-hover:animate-bounce">🚨</span>
                  <span class="font-black tracking-wide">Report Emergency</span>
                  <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>

            <!-- Quick Stats Row -->
            <div class="citizen-stat-grid mt-8">
              <div class="citizen-stat-card group cursor-pointer" onclick="window.ApdaState.setCitizenTab('alerts')">
                <div class="stat-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                  <span class="text-sm">🚨</span>
                </div>
                <div>
                  <strong>${openAlerts || 0}</strong>
                  <small>Active Alerts</small>
                </div>
                ${openAlerts > 0 ? `<div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444] animate-pulse"></div>` : ''}
              </div>
              <div class="citizen-stat-card group cursor-pointer" onclick="window.ApdaState.setCitizenTab('shelters')">
                <div class="stat-icon" style="background: linear-gradient(135deg, #38bdf8, #4f46e5);">
                  <span class="text-sm">🏠</span>
                </div>
                <div>
                  <strong>24 Nearby</strong>
                  <small>Shelters Available</small>
                </div>
              </div>
              <div class="citizen-stat-card group cursor-pointer" onclick="window.ApdaState.setCitizenTab('requests')">
                <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                  <span class="text-sm">✓</span>
                </div>
                <div>
                  <strong>3.2 min</strong>
                  <small>Avg Response Time</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Main Workspace -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div class="citizen-workspace">

            <!-- Sidebar Navigation -->
            <aside class="citizen-sidebar glass-panel">
              <div class="px-3 pt-4 pb-3">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#475569]">Navigation</p>
              </div>

              <nav class="space-y-1 px-1.5 pb-2">
                ${navTabs.map((t, i) => {
      const isActive = activeTab === t.id;
      const badgeCount = t.id === 'alerts' && openAlerts ? `<b class="ml-auto min-w-[1.25rem] h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-black ${isActive ? 'bg-white/20' : 'bg-[#ef4444] text-white shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'}">${openAlerts}</b>` : '';
      return `
                    <button onclick="window.ApdaState.setCitizenTab('${t.id}')" 
                      class="citizen-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-300 ${isActive ? 'is-active' : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.06]'}"
                      style="${isActive ? '' : 'transform: translateX(0);'}"
                      onmouseover="if(!this.classList.contains('is-active')) this.style.transform='translateX(4px)'"
                      onmouseout="if(!this.classList.contains('is-active')) this.style.transform='translateX(0)'">
                      <span class="text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}">${t.icon}</span>
                      <div class="flex-1 min-w-0">
                        <div class="text-[13px] font-semibold leading-tight">${t.label}</div>
                        <div class="text-[10px] text-[#64748b] mt-0.5 ${isActive ? 'text-[#94a3b8]' : ''}">${t.desc}</div>
                      </div>
                      ${badgeCount}
                    </button>
                  `;
    }).join('')}
              </nav>

              <!-- Sidebar Footer -->
              <div class="citizen-sidebar-help mx-2 mb-2 p-3 rounded-lg">
                <div class="flex items-center gap-2 mb-1.5">
                  <div class="w-1.5 h-1.5 rounded-full bg-[#1dd1a1] shadow-[0_0_6px_#1dd1a1]"></div>
                  <span class="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">System Status</span>
                </div>
                <span class="text-[11px] text-[#94a3b8] leading-relaxed">All emergency services are operational. Response teams on standby.</span>
                <a href="#" class="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-[#48dbfb] hover:text-[#67e8f9] transition-colors">
                  View status page
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
              </div>
            </aside>

            <!-- Content Area -->
            <div class="min-w-0">
              <!-- Tab Transition Wrapper -->
              <div id="citizen-subtab-container" class="citizen-content-enter relative">
                <!-- Active Tab Indicator -->
                <div class="flex items-center gap-3 mb-4 px-1">
                  <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
                  <span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#475569]">${navTabs.find(t => t.id === activeTab)?.label || 'Live Alerts'}</span>
                  <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
                </div>
                ${contentHtml}
              </div>
            </div>
          </div>
        </div>

        <!-- Floating SOS Button — Premium Redesign -->
        <button onclick="window.ApdaSOSModal.triggerPanicSOS()" 
          class="floating-sos-btn w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full flex flex-col items-center justify-center text-white border-2 border-white/20 cursor-pointer group"
          title="Emergency 1-Tap Distress Signal"
          aria-label="Emergency SOS button. Press to send distress signal.">
          <span class="text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:animate-bounce">🚨</span>
          <span class="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter mt-0.5 opacity-90">SOS</span>
        </button>

      </div>
    `;
  }
};