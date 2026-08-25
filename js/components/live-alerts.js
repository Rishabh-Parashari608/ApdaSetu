// Live alerts with map-based location selection.
window.ApdaLiveAlerts = {
  selectedLocation: null, selectedAddress: null, locationMap: null, locationMarker: null, locationPickerCoords: null,
  getUserAddress() {
    const user = window.ApdaState.currentUser || {};
    const parts = [user.locality, user.cityName || user.city, user.district, user.state, user.pincode].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Hatigaon By-lane 3, Guwahati, Kamrup Metropolitan, Assam - 781038';
  },
  getEffectiveLocation() {
    const user = window.ApdaState.currentUser || {};
    return this.selectedLocation || user.coordinates || [26.1445, 91.7362];
  },
  getDistanceKm(from, to) {
    const radians = value => value * Math.PI / 180, dLat = radians(to[0] - from[0]), dLng = radians(to[1] - from[1]);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from[0])) * Math.cos(radians(to[0])) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },
  openLocationPicker() {
    const modal = document.createElement('div'); modal.id = 'alerts-location-picker';
    modal.className = 'fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center';
    modal.innerHTML = `<div class="w-full max-w-4xl rounded-3xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl"><div class="flex items-center justify-between p-4 border-b border-slate-700"><div><h3 class="font-black text-white">Choose a location</h3><p class="text-xs text-slate-400 mt-0.5">Click the map or drag the pin to see alerts near that spot.</p></div><button onclick="window.ApdaLiveAlerts.closeLocationPicker()" class="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white" aria-label="Close map">&times;</button></div><div id="alerts-location-map" class="h-[55vh] min-h-[320px]"></div><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-slate-700"><p class="text-xs text-slate-400">Alerts within 250 km of the selected spot will be shown.</p><button onclick="window.ApdaLiveAlerts.confirmLocation()" class="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black">Show alerts for this location</button></div></div>`;
    document.body.appendChild(modal); setTimeout(() => this.initLocationMap(), 80);
  },
  initLocationMap() {
    if (typeof L === 'undefined') { window.ApdaState.notify('Map could not be loaded. Please check your internet connection.', 'warning'); return; }
    const initial = this.getEffectiveLocation();
    this.locationMap = L.map('alerts-location-map').setView(initial, this.selectedLocation ? 10 : 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(this.locationMap);
    this.locationPickerCoords = [...initial]; this.locationMarker = L.marker(initial, { draggable: true }).addTo(this.locationMap);
    const update = latlng => { this.locationPickerCoords = [latlng.lat, latlng.lng]; };
    this.locationMap.on('click', event => { this.locationMarker.setLatLng(event.latlng); update(event.latlng); }); this.locationMarker.on('dragend', event => update(event.target.getLatLng()));
    window.ApdaState.alerts.forEach(alert => L.circleMarker(alert.coordinates, { radius: 6, color: alert.severity === 'critical' ? '#fb5c66' : '#fbbf24', fillOpacity: .9 }).bindTooltip(alert.region).addTo(this.locationMap));
  },
  confirmLocation() {
    this.selectedLocation = this.locationPickerCoords;
    this.selectedAddress = `Selected map location (${this.selectedLocation[0].toFixed(4)}, ${this.selectedLocation[1].toFixed(4)})`;
    this.closeLocationPicker(); this.refresh(); this.resolveSelectedAddress();
  },
  async resolveSelectedAddress() {
    try {
      const [lat, lng] = this.selectedLocation;
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`);
      const result = await response.json(); if (result.display_name) { this.selectedAddress = result.display_name; this.refresh(); }
    } catch (error) { console.warn('Could not resolve selected map address:', error); }
  },
  refresh() { const container = document.getElementById('citizen-subtab-container'); if (container) container.innerHTML = this.render(); },
  closeLocationPicker() { if (this.locationMap) { this.locationMap.remove(); this.locationMap = null; } const modal = document.getElementById('alerts-location-picker'); if (modal) modal.remove(); },
  render() {
    const alerts = window.ApdaState.alerts, currentLang = window.ApdaI18n.currentLang, displayAddress = this.selectedAddress || this.getUserAddress();
    const activeLocation = this.getEffectiveLocation();
    const withDistance = alerts.map(alert => ({ ...alert, distance: this.getDistanceKm(activeLocation, alert.coordinates) }));
    const nearby = withDistance.filter(alert => alert.distance <= 50);
    const shown = nearby;
    return `
      <div class="space-y-6">
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"><div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-500 animate-ping"></span><h2 class="text-xl font-extrabold text-white">Live Disaster Alerts Feed</h2></div><p class="text-xs text-slate-400 mt-1">Real-time multi-channel bulletins from NDMA, IMD, CWC, and State Disaster Management Authorities.</p></div><button onclick="window.ApdaLiveAlerts.openLocationPicker()" class="apd-location-button px-5 py-2.5 rounded-xl text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg uppercase tracking-wider transition-all whitespace-nowrap">⌖ Go To Location</button></div>
        <div class="rounded-2xl border border-cyan-300/20 bg-cyan-400/5 px-4 py-3"><p class="text-xs text-cyan-100">Showing ${nearby.length} alert${nearby.length === 1 ? '' : 's'} within 50 km of ${this.selectedLocation ? 'your selected location' : 'your saved location'}.</p></div>
        <div class="space-y-4">${shown.length === 0 ? `<div class="glass-panel p-12 text-center rounded-2xl text-slate-400"><p class="text-sm font-semibold">No active disaster alerts were found near this location.</p></div>` : shown.map(alert => `
          <div class="glass-panel rounded-2xl p-5 border transition-all hover:scale-[1.005] ${alert.severity === 'critical' ? 'border-red-500/50 bg-red-950/20 shadow-lg shadow-red-950/30' : alert.severity === 'high' ? 'border-amber-500/40 bg-amber-950/20' : 'border-slate-700 bg-slate-900/60'}">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5"><div class="flex items-center gap-2 flex-wrap"><span class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${alert.severity === 'critical' ? 'badge-critical' : alert.severity === 'high' ? 'badge-high' : 'badge-medium'}">${alert.severity}</span><span class="text-xs font-bold text-slate-300">📍 ${displayAddress}${alert.distance !== undefined ? ` · ${Math.round(alert.distance)} km away` : ''}</span><span class="text-xs text-slate-400">• ${alert.timestamp}</span></div><span class="text-[11px] text-slate-400 font-mono">Source: ${alert.source}</span></div>
            <div class="mt-3"><h3 class="text-base sm:text-lg font-black text-white">${currentLang === 'hi' && alert.title_hi ? alert.title_hi : alert.title}</h3><p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">${alert.description}</p></div>
            <div class="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"><div class="flex flex-wrap items-center gap-1.5"><span class="text-[11px] text-slate-400 mr-1">Broadcast Channels:</span>${alert.channels.map(channel => `<span class="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-semibold text-emerald-300">${channel}</span>`).join('')}</div><div class="flex items-center gap-2"><button onclick="window.ApdaSoundEngine.speakText('${alert.title}. ${alert.description}', '${currentLang}');" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200">Listen</button><a href="tel:${alert.helpline.split(' ')[0]}" class="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-xs font-bold text-red-300">Hotline: ${alert.helpline}</a></div></div>
          </div>`).join('')}</div>
      </div>`;
  }
};
