// ═══════════════════════════════════════════════════════════════
// ApdaCitizenDashboard — Professional Emergency Operations Layout
// Complete redesign with serious color palette & modern architecture
// ═══════════════════════════════════════════════════════════════

window.ApdaCitizenDashboard = {
  showForecast() {
    const modal = document.getElementById('apd-forecast-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    this.selectForecast('Today', '28', '72', 'Heavy rain expected. Keep an umbrella handy and plan travel carefully.');
  },
  toggleCalendar() {
    const calendar = document.getElementById('apd-forecast-calendar');
    if (calendar) calendar.classList.toggle('is-open');
  },
  selectForecast(day, temp, rain, message) {
    const detail = document.getElementById('apd-forecast-detail');
    const selectedDay = document.getElementById('apd-forecast-selected-day');
    const selectedTemp = document.getElementById('apd-forecast-selected-temp');
    if (detail) detail.textContent = `${day}: ${message}`;
    if (selectedDay) selectedDay.textContent = day;
    if (selectedTemp) selectedTemp.textContent = `${temp}°C`;
  },
  selectCalendarDate(button, dateLabel) {
    document.querySelectorAll('.apd-calendar-day.is-selected').forEach(day => day.classList.remove('is-selected'));
    button.classList.add('is-selected');
    const selectedDate = document.getElementById('apd-forecast-calendar-date');
    const detail = document.getElementById('apd-forecast-detail');
    if (selectedDate) selectedDate.textContent = dateLabel;
    if (detail) detail.textContent = `${dateLabel}: Forecast selected. Temperature and conditions will update for your chosen date.`;
    const calendar = document.getElementById('apd-forecast-calendar');
    if (calendar) calendar.classList.remove('is-open');
  },
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
      { id: 'activity', label: 'Activity', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
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
      activity: 'ApdaRecentActivity',
      updates: 'ApdaCommunityUpdates',
      profile: 'ApdaProfileSettings'
    };

    const activityHtml = `
      <div class="space-y-2">
        <div class="apd-activity-item"><div class="apd-activity-dot" style="background:#ef4444"></div><div><div class="apd-activity-text">Flood warning issued for Kamrup district</div><div class="apd-activity-time">12 minutes ago</div></div></div>
        <div class="apd-activity-item"><div class="apd-activity-dot" style="background:#3b82f6"></div><div><div class="apd-activity-text">Relief camp opened at Dispur Stadium</div><div class="apd-activity-time">45 minutes ago</div></div></div>
        <div class="apd-activity-item"><div class="apd-activity-dot" style="background:#10b981"></div><div><div class="apd-activity-text">Your request #4821 has been resolved</div><div class="apd-activity-time">2 hours ago</div></div></div>
        <div class="apd-activity-item"><div class="apd-activity-dot" style="background:#f59e0b"></div><div><div class="apd-activity-text">Road clearance team dispatched to Beltola</div><div class="apd-activity-time">3 hours ago</div></div></div>
      </div>`;
    const contentHtml = activeTab === 'activity'
      ? activityHtml
      : window[components[activeTab] || components.alerts].render();
    const location = user.city || 'Hatigaon, Guwahati';
    const avatar = user.profileImage
      ? `<img src="${user.profileImage}" alt="${user.name}" class="w-full h-full object-cover">`
      : `<span class="text-sm font-bold">${user.name ? user.name.charAt(0) : 'C'}</span>`;

    const openAlerts = window.ApdaState.alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    const firstName = user.name.split(' ')[0];
    const calendarDate = new Date();
    const calendarMonth = calendarDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
    const firstWeekday = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
    const calendarDays = `${'<span></span>'.repeat(firstWeekday)}${Array.from({ length: daysInMonth }, (_, i) => { const day = i + 1; const selected = day === calendarDate.getDate() ? ' is-selected' : ''; return `<button type="button" class="apd-calendar-day${selected}" onclick="window.ApdaCitizenDashboard.selectCalendarDate(this, '${calendarMonth} ${day}')">${day}</button>`; }).join('')}`;

    return `
      <style>
        /* ═══ Professional Emergency Dashboard Styles ═══ */
        .apd-dash { font-family: 'Inter', system-ui, sans-serif; background: #0c1220; color: #f1f5f9; min-height: 100vh; }

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
        @media (min-width: 1024px) { .apd-main { grid-template-columns: minmax(0, 1fr) 220px; } }

        /* Tab Navigation */
        .apd-tabs { display: flex; gap: 0.25rem; padding: 0.25rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148,163,184,0.08); border-radius: 12px; margin-bottom: 1.25rem; overflow-x: auto; scrollbar-width: none; }
        .apd-tabs::-webkit-scrollbar { display: none; }
        .apd-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; border-radius: 10px; font-size: 0.8125rem; font-weight: 600; color: #64748b; white-space: nowrap; transition: all 0.2s; border: none; background: transparent; cursor: pointer; position: relative; }
        .apd-tab:hover { color: #94a3b8; background: rgba(255,255,255,0.03); }
        .apd-tab.active { color: #f8fafc; background: rgba(30, 41, 59, 0.8); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .apd-tab.active::after { content: ''; position: absolute; bottom: -0.25rem; left: 50%; transform: translateX(-50%); width: 16px; height: 2px; background: #38bdf8; border-radius: 999px; }
        .apd-tab-badge { min-width: 18px; height: 18px; padding: 0 5px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: #dc2626; color: white; font-size: 0.625rem; font-weight: 800; }
        @media (min-width: 1024px) {
          .apd-tabs { flex-direction: column; align-items: stretch; gap: 0.25rem; margin-bottom: 0; overflow: visible; }
          .apd-tab { width: 100%; padding: 0.625rem 0.75rem; }
          .apd-tab.active::after { top: 50%; bottom: auto; left: -0.75rem; transform: translateY(-50%); width: 2px; height: 18px; }
        }

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

        /* Profile Summary */
        .apd-greeting-row { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding: 1.5rem 0 0.5rem; }
        .apd-greeting { min-width: 0; }
        .apd-profile-summary { display: flex; flex-direction: column; align-items: flex-start; }
        .apd-profile-avatar { width: 96px; height: 96px; border-radius: 28px; background: linear-gradient(135deg, #1e3a5f, #1e40af); display: grid; place-items: center; overflow: hidden; color: #fff; border: 2px solid rgba(56,189,248,.22); font-size: 1.5rem; font-weight: 800; box-shadow: 0 12px 28px rgba(30,64,175,.25); }
        .apd-profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .apd-profile-name { margin-top: 0.75rem; color: #f8fafc; font-size: 1.25rem; font-weight: 800; }
        .apd-profile-address { display: flex; align-items: center; gap: 0.375rem; margin-top: 0.25rem; color: #64748b; font-size: 0.75rem; font-weight: 600; }
        .apd-profile-address svg { width: 14px; height: 14px; color: #38bdf8; }

        /* Weather Widget */
        .apd-weather { display: flex; align-items: center; gap: 1rem; padding: 0.875rem; background: rgba(30, 41, 59, 0.3); border-radius: 12px; border: 1px solid rgba(148,163,184,0.06); }
        .apd-weather-icon { font-size: 1.75rem; }
        .apd-weather-temp { font-size: 1.5rem; font-weight: 800; color: #f8fafc; }
        .apd-weather-desc { font-size: 0.75rem; color: #64748b; font-weight: 500; }
        .apd-weather-meta { display: flex; gap: 0.75rem; margin-top: 0.25rem; }
        .apd-weather-meta span { font-size: 0.6875rem; color: #475569; }
        .apd-forecast-btn { width: 100%; margin-top: 0.75rem; padding: 0.5rem 0.75rem; border: 1px solid rgba(56,189,248,0.25); border-radius: 8px; background: rgba(14,116,144,0.12); color: #7dd3fc; font-size: 0.75rem; font-weight: 700; transition: all 0.2s; cursor: pointer; }
        .apd-forecast-btn:hover { background: rgba(14,116,144,0.22); border-color: rgba(56,189,248,0.45); color: #e0f2fe; }
        .apd-forecast-modal { position: fixed; inset: 0; z-index: 200; display: none; align-items: center; justify-content: center; padding: 1.25rem; background: rgba(2,6,23,0.78); backdrop-filter: blur(5px); }
        .apd-forecast-modal.is-open { display: flex; }
        .apd-forecast-dialog { width: min(680px, 100%); background: #0f172a; border: 1px solid rgba(56,189,248,0.2); border-radius: 18px; box-shadow: 0 24px 64px rgba(0,0,0,0.5); padding: 1.5rem; }
        .apd-forecast-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
        .apd-forecast-title { font-size: 1.125rem; font-weight: 800; color: #f8fafc; }
        .apd-forecast-subtitle { margin-top: 0.25rem; font-size: 0.75rem; color: #64748b; }
        .apd-forecast-close { width: 30px; height: 30px; border: 0; border-radius: 8px; background: rgba(148,163,184,0.1); color: #94a3b8; font-size: 1.25rem; line-height: 1; cursor: pointer; }
        .apd-forecast-close:hover { background: rgba(148,163,184,0.18); color: #f8fafc; }
        .apd-forecast-legend { display: flex; gap: 1rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #94a3b8; }
        .apd-forecast-key { display: inline-flex; align-items: center; gap: 0.375rem; }
        .apd-forecast-key i { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
        .apd-forecast-chart { width: 100%; height: auto; display: block; overflow: visible; }
        .apd-forecast-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.625rem; margin: 0 0 1rem; }
        .apd-forecast-stat { padding: 0.75rem; border: 1px solid rgba(148,163,184,0.1); border-radius: 10px; background: linear-gradient(135deg, rgba(30,41,59,0.75), rgba(15,23,42,0.45)); }
        .apd-forecast-stat-label { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #64748b; }
        .apd-forecast-stat-value { margin-top: 0.25rem; font-size: 1rem; font-weight: 800; color: #f8fafc; }
        .apd-forecast-detail { min-height: 45px; margin-top: 1rem; padding: 0.75rem 0.875rem; border-radius: 10px; background: rgba(14,116,144,0.12); border: 1px solid rgba(56,189,248,0.16); color: #bae6fd; font-size: 0.8125rem; transition: all 0.25s ease; }
        .apd-calendar-toggle { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.75rem; border: 1px solid rgba(56,189,248,0.3); border-radius: 8px; background: rgba(14,116,144,0.14); color: #bae6fd; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
        .apd-calendar-toggle:hover { background: rgba(14,116,144,0.28); }
        .apd-forecast-calendar { position: fixed; inset: 0; z-index: 220; display: none; align-items: center; justify-content: center; padding: 1.25rem; background: rgba(2,6,23,0.82); backdrop-filter: blur(6px); }
        .apd-forecast-calendar.is-open { display: flex; }
        .apd-calendar-page { width: min(520px, 100%); padding: 1.25rem; border: 1px solid rgba(56,189,248,0.25); border-radius: 16px; background: #111c31; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
        .apd-calendar-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.625rem; color: #cbd5e1; font-size: 0.75rem; font-weight: 700; }
        .apd-calendar-weekdays, .apd-calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.25rem; }
        .apd-calendar-weekdays { margin-bottom: 0.25rem; color: #64748b; font-size: 0.625rem; font-weight: 800; text-align: center; text-transform: uppercase; }
        .apd-calendar-day { min-height: 2rem; border: 1px solid transparent; border-radius: 8px; background: rgba(30,41,59,0.55); color: #cbd5e1; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
        .apd-calendar-day:hover, .apd-calendar-day.is-selected { border-color: rgba(56,189,248,0.55); background: rgba(14,116,144,0.35); color: #f8fafc; }
        @media (max-width: 500px) { .apd-calendar-day { min-height: 1.8rem; font-size: 0.6875rem; } }
        .apd-forecast-point { cursor: pointer; transition: r 0.2s ease, filter 0.2s ease; }
        .apd-forecast-point:hover { r: 7; filter: drop-shadow(0 0 6px #38bdf8); }
        .apd-forecast-modal.is-open .apd-temp-line { stroke-dasharray: 700; stroke-dashoffset: 700; animation: forecastDraw 1.1s cubic-bezier(.16,1,.3,1) forwards; }
        .apd-forecast-modal.is-open .apd-forecast-point { animation: forecastPoint .45s backwards; }
        .apd-forecast-modal.is-open .apd-forecast-point:nth-child(2) { animation-delay:.08s; }.apd-forecast-modal.is-open .apd-forecast-point:nth-child(3) { animation-delay:.16s; }.apd-forecast-modal.is-open .apd-forecast-point:nth-child(4) { animation-delay:.24s; }.apd-forecast-modal.is-open .apd-forecast-point:nth-child(5) { animation-delay:.32s; }.apd-forecast-modal.is-open .apd-forecast-point:nth-child(6) { animation-delay:.4s; }.apd-forecast-modal.is-open .apd-forecast-point:nth-child(7) { animation-delay:.48s; }
        @keyframes forecastDraw { to { stroke-dashoffset: 0; } }
        @keyframes forecastPoint { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
        @media (max-width: 500px) { .apd-forecast-summary { grid-template-columns: 1fr; } .apd-forecast-legend { flex-wrap: wrap; } }
        .apd-greeting-weather { width: 320px; flex: 0 0 320px; }
        @media (max-width: 639px) {
          .apd-greeting-row { align-items: stretch; flex-direction: column; gap: 1rem; }
          .apd-greeting-weather { width: 100%; flex-basis: auto; }
        }
        .apd-weather-sidebar { display: none; }

        /* Scrollbar */
        .apd-scroll::-webkit-scrollbar { width: 4px; }
        .apd-scroll::-webkit-scrollbar-track { background: transparent; }
        .apd-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 999px; }
        .apd-scroll::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.25); }
      </style>

      <div class="apd-dash">

        <!-- Profile & Weather -->
        <div class="max-w-[1400px] mx-auto px-6">
          <div class="apd-greeting-row">
            <div class="apd-greeting">
              <div class="apd-profile-summary" onclick="window.ApdaState.setCitizenTab('profile')" title="View Profile">
                <div class="apd-profile-avatar">${avatar}</div>
                <div class="apd-profile-name">${user.name}</div>
                <div class="apd-profile-address"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>${location}</div>
              </div>
            </div>
            <div class="apd-greeting-weather">
              <div class="apd-side-card">
                <div class="apd-side-title">Weather</div>
                <div class="apd-weather">
                  <div class="apd-weather-icon">&#x1F327;&#xFE0F;</div>
                  <div>
                    <div class="apd-weather-temp">28&deg;C</div>
                    <div class="apd-weather-desc">Heavy Rain Expected</div>
                    <div class="apd-weather-meta">
                      <span>&#x1F4A7; 89% Humidity</span>
                      <span>&#x1F4A8; 24 km/h</span>
                    </div>
                  </div>
                </div>
                <button type="button" class="apd-forecast-btn" onclick="window.ApdaCitizenDashboard.showForecast()">View Forecast</button>
              </div>
            </div>
          </div>
        </div>

        <div id="apd-forecast-modal" class="apd-forecast-modal" role="dialog" aria-modal="true" aria-labelledby="apd-forecast-title" onclick="if (event.target === this) this.classList.remove('is-open')">
          <div class="apd-forecast-dialog">
            <div class="apd-forecast-head">
              <div>
                <h2 id="apd-forecast-title" class="apd-forecast-title">7-Day Weather Forecast</h2>
                <p class="apd-forecast-subtitle">Hatigaon, Guwahati &middot; Updated just now</p>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="apd-calendar-toggle" onclick="window.ApdaCitizenDashboard.toggleCalendar()"><span>▣</span> Calendar</button>
                <button type="button" class="apd-forecast-close" aria-label="Close forecast" onclick="document.getElementById('apd-forecast-modal').classList.remove('is-open')">&times;</button>
              </div>
            </div>
            <div class="apd-forecast-legend"><span class="apd-forecast-key"><i style="background:#38bdf8"></i>Temperature (&deg;C)</span></div>
            <div class="apd-forecast-summary">
              <div class="apd-forecast-stat"><div class="apd-forecast-stat-label">Selected day</div><div id="apd-forecast-selected-day" class="apd-forecast-stat-value">Today</div></div>
              <div class="apd-forecast-stat"><div class="apd-forecast-stat-label">Temperature</div><div id="apd-forecast-selected-temp" class="apd-forecast-stat-value">28&deg;C</div></div>
            </div>
            <svg class="apd-forecast-chart" viewBox="0 0 620 280" role="img" aria-label="Seven-day temperature forecast graph">
              <g stroke="rgba(148,163,184,0.16)" stroke-width="1"><line x1="54" y1="35" x2="590" y2="35"/><line x1="54" y1="82" x2="590" y2="82"/><line x1="54" y1="129" x2="590" y2="129"/><line x1="54" y1="176" x2="590" y2="176"/><line x1="54" y1="223" x2="590" y2="223"/></g>
              <g fill="#64748b" font-size="11" font-family="Inter, system-ui, sans-serif"><text x="16" y="39">32&deg;</text><text x="16" y="86">28&deg;</text><text x="16" y="133">24&deg;</text><text x="16" y="180">20&deg;</text><text x="55" y="249">Today</text><text x="141" y="249">Mon</text><text x="228" y="249">Tue</text><text x="315" y="249">Wed</text><text x="402" y="249">Thu</text><text x="489" y="249">Fri</text><text x="566" y="249">Sat</text></g>
              <path d="M60 111 L147 99 L234 123 L321 87 L408 99 L495 75 L582 87 L582 223 L60 223 Z" fill="rgba(56,189,248,0.10)"/>
              <polyline class="apd-temp-line" points="60,111 147,99 234,123 321,87 408,99 495,75 582,87" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <g fill="#0f172a" stroke="#38bdf8" stroke-width="3"><circle class="apd-forecast-point" cx="60" cy="111" r="4" onclick="window.ApdaCitizenDashboard.selectForecast('Today','28','72','Heavy rain expected. Keep an umbrella handy and plan travel carefully.')"/><circle class="apd-forecast-point" cx="147" cy="99" r="4" onclick="window.ApdaCitizenDashboard.selectForecast('Monday','29','64','Cloudy intervals with showers possible in the afternoon.')"/><circle class="apd-forecast-point" cx="234" cy="123" r="4" onclick="window.ApdaCitizenDashboard.selectForecast('Tuesday','27','79','The wettest day this week; avoid low-lying routes where possible.')"/><circle class="apd-forecast-point" cx="321" cy="87" r="4" onclick="window.ApdaCitizenDashboard.selectForecast('Wednesday','30','55','Warmer and brighter, with brief evening showers.')"/><circle class="apd-forecast-point" cx="408" cy="99" r="4" onclick="window.ApdaCitizenDashboard.selectForecast('Thursday','29','58','Humid conditions with scattered showers.')"/><circle class="apd-forecast-point" cx="495" cy="75" r="4" onclick="window.ApdaCitizenDashboard.selectForecast('Friday','31','48','Warmest day of the week with lower rain probability.')"/><circle class="apd-forecast-point" cx="582" cy="87" r="4" onclick="window.ApdaCitizenDashboard.selectForecast('Saturday','30','68','Cloudy and rainy spells returning through the day.')"/></g>
              <g fill="#f8fafc" font-size="11" font-weight="700" font-family="Inter, system-ui, sans-serif"><text x="48" y="99">28&deg;</text><text x="135" y="87">29&deg;</text><text x="222" y="111">27&deg;</text><text x="309" y="75">30&deg;</text><text x="396" y="87">29&deg;</text><text x="483" y="63">31&deg;</text><text x="570" y="75">30&deg;</text></g>
            </svg>
            <div id="apd-forecast-detail" class="apd-forecast-detail">Today: Heavy rain expected. Keep an umbrella handy and plan travel carefully.</div>
          </div>
        </div>
        <div id="apd-forecast-calendar" class="apd-forecast-calendar" role="dialog" aria-modal="true" aria-label="Calendar" onclick="if (event.target === this) this.classList.remove('is-open')">
          <div class="apd-calendar-page">
            <div class="apd-calendar-heading"><span>Calendar</span><button type="button" class="apd-forecast-close" aria-label="Close calendar" onclick="document.getElementById('apd-forecast-calendar').classList.remove('is-open')">&times;</button></div>
            <div class="apd-calendar-heading"><span>Select a forecast date</span><span id="apd-forecast-calendar-date">${calendarMonth} ${calendarDate.getDate()}</span></div>
            <div class="apd-calendar-weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
            <div class="apd-calendar-grid">${calendarDays}</div>
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

            <!-- Feature Navigation Rail -->
            <div class="apd-side-card">
              <div class="apd-side-title">Features</div>
              <nav class="apd-tabs" aria-label="Citizen dashboard features">
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
              </nav>
            </div>

            <!-- Weather Widget -->
            <div class="apd-side-card apd-weather-sidebar">
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
