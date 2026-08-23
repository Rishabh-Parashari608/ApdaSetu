// Main Citizen Dashboard Component
window.ApdaCitizenDashboard = {
  render() {
    const activeTab = window.ApdaState.citizenTab;
    const user = window.ApdaState.currentUser || { name: 'Priya Sharma', city: 'Hatigaon, Guwahati' };
    const navTabs = [
      { id: 'alerts', label: 'Live Alerts', icon: '🚨' }, { id: 'shelters', label: 'Shelter Map', icon: '🏠' }, { id: 'requests', label: 'My Requests', icon: '📋' }, { id: 'chat', label: 'Community Chat', icon: '💬' },
      { id: 'family', label: 'Family Check-in', icon: '👨‍👩‍👧' }, { id: 'guides', label: 'Safety Guides', icon: '📖' }, { id: 'updates', label: 'Official Updates', icon: '📢' }, { id: 'profile', label: 'Medical Profile', icon: '🩺' }
    ];
    const components = { alerts: 'ApdaLiveAlerts', shelters: 'ApdaShelterMap', requests: 'ApdaMyRequests', chat: 'ApdaCommunityChat', family: 'ApdaFamilyCheckin', guides: 'ApdaSafetyGuidesComp', updates: 'ApdaCommunityUpdates', profile: 'ApdaProfileSettings' };
    const contentHtml = window[components[activeTab] || components.alerts].render();
    const location = user.city || 'Hatigaon, Guwahati';
    const avatar = user.profileImage ? `<img src="${user.profileImage}" alt="${user.name}'s profile picture" class="w-full h-full object-cover rounded-[inherit]">` : (user.name ? user.name.charAt(0) : 'C');
    const openAlerts = window.ApdaState.alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    return `<div class="citizen-dashboard min-h-screen pb-28">
      <section class="citizen-hero px-4 sm:px-6 lg:px-8 pt-6 pb-12"><div class="max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-5"><div class="flex items-center gap-4"><div class="citizen-avatar overflow-hidden">${avatar}</div><div><p class="text-red-200 text-xs font-bold uppercase tracking-[0.18em]">Citizen Dashboard</p><h1 class="text-2xl sm:text-3xl font-black text-white mt-1">Good to see you, ${user.name.split(' ')[0]}.</h1><div class="mt-2 flex items-center gap-2 text-sm text-slate-300"><span>⌖ ${location}</span><button onclick="window.ApdaState.setCitizenTab('profile')" class="inline-grid h-7 w-7 place-items-center rounded-lg border border-white/15 bg-white/10 text-xs text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60" title="Edit profile details" aria-label="Edit profile details">✎</button></div></div></div><button onclick="window.ApdaSOSModal.openReportModal()" class="citizen-sos-action"><span class="text-lg">🚨</span> Report an emergency <span>→</span></button></div>
      </div></section>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12"><div class="citizen-workspace"><aside class="citizen-sidebar glass-panel"><p class="px-3 pt-4 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Your workspace</p><nav class="space-y-1">${navTabs.map(t => `<button onclick="window.ApdaState.setCitizenTab('${t.id}')" class="citizen-nav-item ${activeTab === t.id ? 'is-active' : ''}"><span class="text-base">${t.icon}</span><span>${t.label}</span>${t.id === 'alerts' && openAlerts ? `<b>${openAlerts}</b>` : ''}</button>`).join('')}</nav></aside>
      <div class="min-w-0"><div id="citizen-subtab-container" class="citizen-content-enter">${contentHtml}</div></div>
      </div></div><button onclick="window.ApdaSOSModal.triggerPanicSOS()" class="floating-sos-btn w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center text-white border-2 border-white/80 cursor-pointer" title="Emergency 1-Tap Distress Signal"><span class="text-xl sm:text-2xl animate-pulse">🚨</span><span class="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter mt-0.5">SOS</span></button></div>`;
  }
};
