// ═══════════════════════════════════════════════════════════════
// ApdaCitizenDashboard — Professional Emergency Operations Layout
// Complete redesign with serious color palette & modern architecture
// ═══════════════════════════════════════════════════════════════

window.ApdaCitizenDashboard = {
  render() {
    const activeTab = window.ApdaState.citizenTab;
    const user = window.ApdaState.currentUser || { name: 'Priya Sharma', city: 'Hatigaon, Guwahati' };

    const navTabs = [
      { id: 'alerts', label: 'Alerts', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>' },
      { id: 'shelters', label: 'Shelters', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>' },
      { id: 'requests', label: 'Requests', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>' },
      { id: 'chat', label: 'Chat', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>' },
      { id: 'family', label: 'Family', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>' },
      { id: 'guides', label: 'Guides', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
      { id: 'updates', label: 'Updates', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>' },
      { id: 'profile', label: 'Profile', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' }
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
      ? `<img src="${user.profileImage}" alt="${user.name}" class="w-full h-full object-cover">`
      : `<span class="text-sm font-bold">${user.name ? user.name.charAt(0) : 'C'}</span>`;

    const openAlerts = window.ApdaState.alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    const firstName = user.name.split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    return `
      <style>
        /* ═══ Professional Emergency Dashboard Styles ═══ */
        .apd-dash { font-family: 'Inter', system-ui, sans-serif; background: #0c1220; color: #f1f5f9; min-height: 100vh; }

        /* Header Bar */
        .apd-header { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(148,163,184,0.08); position: sticky; top: 0; z-index: 50; }
        .apd-header-inner { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }

        /* Logo & Brand */
        .apd-brand { display: flex; align-items: center; gap: 0.75rem; }
        .apd-logo-mark { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #1e3a5f, #0f172a); border: 1px solid rgba(56, 189, 248, 0.2); display: grid; place-items: center; color: #38bdf8; font-weight: 900; font-size: 14px; box-shadow: 0 0 20px rgba(56, 189, 248, 0.1); }
        .apd-brand-text { font-size: 1.125rem; font-weight: 800; letter-spacing: -0.02em; color: #f8fafc; }
        .apd-brand-sub { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; margin-top: -2px; }

        /* Location Pill */
        .apd-loc { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.875rem; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(148,163,184,0.1); border-radius: 999px; font-size: 0.8125rem; color: #94a3b8; transition: all 0.2s; }
        .apd-loc:hover { border-color: rgba(56, 189, 248, 0.25); background: rgba(30, 41, 59, 0.8); }
        .apd-loc svg { color: #38bdf8; }

        /* User Block */
        .apd-user { display: flex; align-items: center; gap: 0.875rem; }
        .apd-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #1e3a5f, #1e40af); display: grid; place-items: center; color: white; border: 2px solid rgba(56, 189, 248, 0.15); transition: all 0.3s; cursor: pointer; }
        .apd-avatar:hover { border-color: rgba(56, 189, 248, 0.4); box-shadow: 0 0 15px rgba(56, 189, 248, 0.15); transform: scale(1.05); }
        .apd-user-info { text-align: right; display: none; }
        @media (min-width: 640px) { .apd-user-info { display: block; } }
        .apd-user-name { font-size: 0.8125rem; font-weight: 700; color: #f1f5f9; }
        .apd-user-role { font-size: 0.6875rem; color: #64748b; font-weight: 500; }

        /* Emergency Banner */
        .apd-banner { background: linear-gradient(90deg, rgba(185, 28, 28, 0.12), rgba(153, 27, 27, 0.06)); border-bottom: 1px solid rgba(185, 28, 28, 0.15); }
        .apd-banner-inner { max-width: 1400px; margin: 0 auto; padding: 0.625rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
        .apd-banner-pulse { width: 8px; height: 8px; border-radius: 50%; background: #dc2626; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); animation: bannerPulse 2s infinite; flex-shrink: 0; }
        @keyframes bannerPulse { 0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7); } 70% { box-shadow: 0 0 0 6px rgba(220,38,38,0); } 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); } }
        .apd-banner-text { font-size: 0.8125rem; font-weight: 600; color: #fca5a5; }
        .apd-banner-count { margin-left: auto; font-size: 0.75rem; font-weight: 700; color: #f87171; background: rgba(220, 38, 38, 0.15); padding: 0.25rem 0.625rem; border-radius: 999px; border: 1px solid rgba(220, 38, 38, 0.2); }

        /* Stats Bar */
        .apd-stats { max-width: 1400px; margin: 0 auto; padding: 1.25rem 1.5rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
        @media (min-width: 768px) { .apd-stats { grid-template-columns: repeat(4, 1fr); } }
        .apd-stat { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148,163,184,0.08); border-radius: 12px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 0.875rem; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); cursor: pointer; position: relative; overflow: hidden; }
        .apd-stat::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, currentColor, transparent); opacity: 0; transition: opacity 0.3s; }
        .apd-stat:hover { transform: translateY(-2px); border-color: rgba(148,163,184,0.15); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .apd-stat:hover::before { opacity: 0.5; }
        .apd-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .apd-stat:hover .apd-stat-icon { transform: scale(1.1) rotate(-3deg); }
        .apd-stat-val { font-size: 1.25rem; font-weight: 800; color: #f8fafc; line-height: 1; }
        .apd-stat-label { font-size: 0.6875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.25rem; }
        .apd-stat-red { color: #f87171; }
        .apd-stat-red .apd-stat-icon { background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.15); color: #f87171; }
        .apd-stat-blue { color: #60a5fa; }
        .apd-stat-blue .apd-stat-icon { background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.15); color: #60a5fa; }
        .apd-stat-green { color: #34d399; }
        .apd-stat-green .apd-stat-icon { background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.15); color: #34d399; }
        .apd-stat-amber { color: #fbbf24; }
        .apd-stat-amber .apd-stat-icon { background: rgba(180, 83, 9, 0.1); border: 1px solid rgba(180, 83, 9, 0.15); color: #fbbf24; }

        /* Main Grid */
        .apd-main { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem 2rem; display: grid; gap: 1.5rem; }
        @media (min-width: 1024px) { .apd-main { grid-template-columns: 1fr 320px; } }

        /* Tab Navigation */
        .apd-tabs { display: flex; gap: 0.25rem; padding: 0.25rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148,163,184,0.08); border-radius: 12px; margin-bottom: 1.25rem; overflow-x: auto; scrollbar-width: none; }
        .apd-tabs::-webkit-scrollbar { display: none; }
        .apd-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; border-radius: 10px; font-size: 0.8125rem; font-weight: 600; color: #64748b; white-space: nowrap; transition: all 0.2s; border: none; background: transparent; cursor: pointer; position: relative; }
        .apd-tab:hover { color: #94a3b8; background: rgba(255,255,255,0.03); }
        .apd-tab.active { color: #f8fafc; background: rgba(30, 41, 59, 0.8); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .apd-tab.active::after { content: ''; position: absolute; bottom: -0.25rem; left: 50%; transform: translateX(-50%); width: 16px; height: 2px; background: #38bdf8; border-radius: 999px; }
        .apd-tab-badge { min-width: 18px; height: 18px; padding: 0 5px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: #dc2626; color: white; font-size: 0.625rem; font-weight: 800; }

        /* Content Panel */
        .apd-content { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148,163,184,0.08); border-radius: 16px; padding: 1.5rem; min-height: 500px; animation: contentFade 0.35s cubic-bezier(0.16,1,0.3,1); }
        @keyframes contentFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .apd-content-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(148,163,184,0.06); }
        .apd-content-title { font-size: 1.125rem; font-weight: 800; color: #f8fafc; display: flex; align-items: center; gap: 0.5rem; }
        .apd-content-title svg { color: #38bdf8; }

        /* Sidebar Panel */
        .apd-side { display: flex; flex-direction: column; gap: 1rem; }
        .apd-side-card { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148,163,184,0.08); border-radius: 16px; padding: 1.25rem; transition: all 0.3s; }
        .apd-side-card:hover { border-color: rgba(148,163,184,0.12); }
        .apd-side-title { font-size: 0.6875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; margin-bottom: 0.875rem; display: flex; align-items: center; gap: 0.5rem; }
        .apd-side-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(148,163,184,0.1), transparent); }

        /* Quick Actions */
        .apd-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        .apd-action { padding: 0.625rem; border-radius: 10px; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(148,163,184,0.06); color: #94a3b8; font-size: 0.75rem; font-weight: 600; text-align: center; transition: all 0.2s; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.375rem; }
        .apd-action:hover { background: rgba(30, 41, 59, 0.7); border-color: rgba(56, 189, 248, 0.2); color: #e2e8f0; transform: translateY(-1px); }
        .apd-action svg { width: 20px; height: 20px; }
        .apd-action-red { background: rgba(185, 28, 28, 0.1); border-color: rgba(220, 38, 38, 0.15); color: #f87171; }
        .apd-action-red:hover { background: rgba(185, 28, 28, 0.15); border-color: rgba(220, 38, 38, 0.25); }

        /* Activity Feed */
        .apd-activity-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.625rem 0; border-bottom: 1px solid rgba(148,163,184,0.04); transition: all 0.2s; }
        .apd-activity-item:last-child { border-bottom: none; }
        .apd-activity-item:hover { padding-left: 0.25rem; }
        .apd-activity-dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 0.375rem; flex-shrink: 0; }
        .apd-activity-text { font-size: 0.8125rem; color: #cbd5e1; line-height: 1.4; }
        .apd-activity-time { font-size: 0.6875rem; color: #475569; margin-top: 0.125rem; }

        /* Emergency Contacts */
        .apd-contact { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 8px; transition: all 0.2s; cursor: pointer; }
        .apd-contact:hover { background: rgba(255,255,255,0.03); }
        .apd-contact-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(30, 41, 59, 0.6); display: grid; place-items: center; color: #38bdf8; font-size: 0.75rem; font-weight: 800; flex-shrink: 0; }
        .apd-contact-name { font-size: 0.8125rem; font-weight: 600; color: #e2e8f0; }
        .apd-contact-num { font-size: 0.6875rem; color: #64748b; font-weight: 500; }
        .apd-contact-call { margin-left: auto; width: 28px; height: 28px; border-radius: 6px; background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.15); color: #34d399; display: grid; place-items: center; opacity: 0; transition: all 0.2s; }
        .apd-contact:hover .apd-contact-call { opacity: 1; }
        .apd-contact-call:hover { background: rgba(5, 150, 105, 0.2); }

        /* SOS Button */
        .apd-sos { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 100; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .apd-sos-btn { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #b91c1c, #991b1b); border: 1px solid rgba(220, 38, 38, 0.3); color: white; display: grid; place-items: center; cursor: pointer; box-shadow: 0 8px 24px rgba(185, 28, 28, 0.3), 0 0 0 0 rgba(220, 38, 38, 0.4); transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); animation: sosPulse 2.5s ease-in-out infinite; }
        .apd-sos-btn:hover { transform: scale(1.1) translateY(-3px); box-shadow: 0 12px 32px rgba(185, 28, 28, 0.4), 0 0 30px rgba(220, 38, 38, 0.2); }
        .apd-sos-btn:active { transform: scale(0.95); }
        .apd-sos-label { font-size: 0.625rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #f87171; background: rgba(15, 23, 42, 0.9); padding: 0.25rem 0.5rem; border-radius: 6px; border: 1px solid rgba(220, 38, 38, 0.15); }
        @keyframes sosPulse { 0%,100% { box-shadow: 0 8px 24px rgba(185,28,28,0.3), 0 0 0 0 rgba(220,38,38,0.4); } 50% { box-shadow: 0 8px 24px rgba(185,28,28,0.3), 0 0 0 8px rgba(220,38,38,0); } }

        /* Greeting Section */
        .apd-greeting { padding: 1.5rem 0 0.5rem; }
        .apd-greeting-date { font-size: 0.75rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.375rem; }
        .apd-greeting-text { font-size: 1.5rem; font-weight: 800; color: #f8fafc; letter-spacing: -0.02em; }
        .apd-greeting-text span { color: #38bdf8; }

        /* Weather Widget */
        .apd-weather { display: flex; align-items: center; gap: 1rem; padding: 0.875rem; background: rgba(30, 41, 59, 0.3); border-radius: 12px; border: 1px solid rgba(148,163,184,0.06); }
        .apd-weather-icon { font-size: 1.75rem; }
        .apd-weather-temp { font-size: 1.5rem; font-weight: 800; color: #f8fafc; }
        .apd-weather-desc { font-size: 0.75rem; color: #64748b; font-weight: 500; }
        .apd-weather-meta { display: flex; gap: 0.75rem; margin-top: 0.25rem; }
        .apd-weather-meta span { font-size: 0.6875rem; color: #475569; }

        /* Scrollbar */
        .apd-scroll::-webkit-scrollbar { width: 4px; }
        .apd-scroll::-webkit-scrollbar-track { background: transparent; }
        .apd-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 999px; }
        .apd-scroll::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.25); }
      </style>

      <div class="apd-dash">

        <!-- Sticky Header -->
        <header class="apd-header">
          <div class="apd-header-inner">
            <div class="apd-brand">
              <div class="apd-logo-mark">A</div>
              <div>
                <div class="apd-brand-text">ApdaSetu</div>
                <div class="apd-brand-sub">Emergency Management</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="apd-loc">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>${location}</span>
              </div>

              <div class="apd-user">
                <div class="apd-user-info">
                  <div class="apd-user-name">${firstName}</div>
                  <div class="apd-user-role">Citizen</div>
                </div>
                <div class="apd-avatar" onclick="window.ApdaState.setCitizenTab('profile')" title="View Profile">
                  ${avatar}
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Emergency Alert Banner (conditional) -->
        ${openAlerts > 0 ? `
          <div class="apd-banner">
            <div class="apd-banner-inner">
              <div class="apd-banner-pulse"></div>
              <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span class="apd-banner-text">${openAlerts} active emergency alert${openAlerts > 1 ? 's' : ''} in your area. Stay vigilant.</span>
              <span class="apd-banner-count">${openAlerts} OPEN</span>
            </div>
          </div>
        ` : ''}

        <!-- Greeting & Date -->
        <div class="max-w-[1400px] mx-auto px-6">
          <div class="apd-greeting">
            <div class="apd-greeting-date">${currentDate}</div>
            <h1 class="apd-greeting-text">${greeting}, <span>${firstName}</span>.</h1>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="apd-stats">
          <div class="apd-stat apd-stat-red" onclick="window.ApdaState.setCitizenTab('alerts')">
            <div class="apd-stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <div class="apd-stat-val">${openAlerts || 0}</div>
              <div class="apd-stat-label">Active Alerts</div>
            </div>
          </div>
          <div class="apd-stat apd-stat-blue" onclick="window.ApdaState.setCitizenTab('shelters')">
            <div class="apd-stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </div>
            <div>
              <div class="apd-stat-val">24</div>
              <div class="apd-stat-label">Nearby Shelters</div>
            </div>
          </div>
          <div class="apd-stat apd-stat-green" onclick="window.ApdaState.setCitizenTab('requests')">
            <div class="apd-stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <div class="apd-stat-val">3.2m</div>
              <div class="apd-stat-label">Avg Response</div>
            </div>
          </div>
          <div class="apd-stat apd-stat-amber" onclick="window.ApdaState.setCitizenTab('chat')">
            <div class="apd-stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <div>
              <div class="apd-stat-val">156</div>
              <div class="apd-stat-label">Online Now</div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="apd-main">

          <!-- Left: Content Area -->
          <div class="min-w-0">
            <!-- Horizontal Tab Navigation -->
            <div class="apd-tabs">
              ${navTabs.map(t => {
      const isActive = activeTab === t.id;
      const badge = t.id === 'alerts' && openAlerts ? `<span class="apd-tab-badge">${openAlerts}</span>` : '';
      return `
                  <button onclick="window.ApdaState.setCitizenTab('${t.id}')" class="apd-tab ${isActive ? 'active' : ''}">
                    ${t.icon}
                    <span>${t.label}</span>
                    ${badge}
                  </button>
                `;
    }).join('')}
            </div>

            <!-- Content Panel -->
            <div class="apd-content" id="citizen-subtab-container">
              <div class="apd-content-header">
                <div class="apd-content-title">
                  ${navTabs.find(t => t.id === activeTab)?.icon || ''}
                  ${navTabs.find(t => t.id === activeTab)?.label || 'Live Alerts'}
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 font-medium">Last updated: Just now</span>
                  <button onclick="window.location.reload()" class="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Refresh">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  </button>
                </div>
              </div>
              ${contentHtml}
            </div>
          </div>

          <!-- Right: Sidebar Widgets -->
          <div class="apd-side">

            <!-- Weather Widget -->
            <div class="apd-side-card">
              <div class="apd-side-title">Weather</div>
              <div class="apd-weather">
                <div class="apd-weather-icon">🌧️</div>
                <div>
                  <div class="apd-weather-temp">28°C</div>
                  <div class="apd-weather-desc">Heavy Rain Expected</div>
                  <div class="apd-weather-meta">
                    <span>💧 89% Humidity</span>
                    <span>💨 24 km/h</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="apd-side-card">
              <div class="apd-side-title">Quick Actions</div>
              <div class="apd-actions">
                <button onclick="window.ApdaSOSModal.openReportModal()" class="apd-action apd-action-red">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  <span>Report</span>
                </button>
                <button onclick="window.ApdaState.setCitizenTab('family')" class="apd-action">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  <span>Family</span>
                </button>
                <button onclick="window.ApdaState.setCitizenTab('guides')" class="apd-action">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  <span>Guides</span>
                </button>
                <button onclick="window.ApdaState.setCitizenTab('chat')" class="apd-action">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  <span>Chat</span>
                </button>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="apd-side-card">
              <div class="apd-side-title">Recent Activity</div>
              <div class="apd-scroll max-h-[200px] overflow-y-auto">
                <div class="apd-activity-item">
                  <div class="apd-activity-dot" style="background: #dc2626;"></div>
                  <div>
                    <div class="apd-activity-text">Flood warning issued for Kamrup district</div>
                    <div class="apd-activity-time">12 minutes ago</div>
                  </div>
                </div>
                <div class="apd-activity-item">
                  <div class="apd-activity-dot" style="background: #2563eb;"></div>
                  <div>
                    <div class="apd-activity-text">Relief camp opened at Dispur Stadium</div>
                    <div class="apd-activity-time">45 minutes ago</div>
                  </div>
                </div>
                <div class="apd-activity-item">
                  <div class="apd-activity-dot" style="background: #059669;"></div>
                  <div>
                    <div class="apd-activity-text">Your request #4821 has been resolved</div>
                    <div class="apd-activity-time">2 hours ago</div>
                  </div>
                </div>
                <div class="apd-activity-item">
                  <div class="apd-activity-dot" style="background: #d97706;"></div>
                  <div>
                    <div class="apd-activity-text">Road clearance team dispatched to Beltola</div>
                    <div class="apd-activity-time">3 hours ago</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Emergency Contacts -->
            <div class="apd-side-card">
              <div class="apd-side-title">Emergency Contacts</div>
              <div class="space-y-1">
                <div class="apd-contact" onclick="window.location.href='tel:108'">
                  <div class="apd-contact-icon">108</div>
                  <div>
                    <div class="apd-contact-name">Ambulance</div>
                    <div class="apd-contact-num">National Emergency</div>
                  </div>
                  <div class="apd-contact-call">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                </div>
                <div class="apd-contact" onclick="window.location.href='tel:101'">
                  <div class="apd-contact-icon">101</div>
                  <div>
                    <div class="apd-contact-name">Fire Service</div>
                    <div class="apd-contact-num">State Emergency</div>
                  </div>
                  <div class="apd-contact-call">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                </div>
                <div class="apd-contact" onclick="window.location.href='tel:100'">
                  <div class="apd-contact-icon">100</div>
                  <div>
                    <div class="apd-contact-name">Police</div>
                    <div class="apd-contact-num">Law Enforcement</div>
                  </div>
                  <div class="apd-contact-call">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                </div>
                <div class="apd-contact" onclick="window.location.href='tel:1078'">
                  <div class="apd-contact-icon" style="font-size: 0.625rem;">NDRF</div>
                  <div>
                    <div class="apd-contact-name">Disaster Response</div>
                    <div class="apd-contact-num">NDRF Helpline</div>
                  </div>
                  <div class="apd-contact-call">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Fixed SOS Button -->
        <div class="apd-sos">
          <button onclick="window.ApdaSOSModal.triggerPanicSOS()" class="apd-sos-btn" title="Emergency 1-Tap Distress Signal" aria-label="Send emergency distress signal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </button>
          <span class="apd-sos-label">SOS</span>
        </div>

      </div>
    `;
  }
};