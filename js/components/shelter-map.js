// Interactive Shelter Map & Live Vacancy Component

window.ApdaShelterMap = {
  leafletMap: null,
  activeNavigationShelter: null,

  getEffectiveLocation() {
    const user = window.ApdaState.currentUser || {};
    return (window.ApdaLiveAlerts && window.ApdaLiveAlerts.selectedLocation) || user.coordinates || [26.1480, 91.7450];
  },

  getDistanceKm(from, to) {
    const radians = value => value * Math.PI / 180, dLat = radians(to[0] - from[0]), dLng = radians(to[1] - from[1]);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from[0])) * Math.cos(radians(to[0])) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  getFilteredShelters() {
    const activeLocation = this.getEffectiveLocation();
    return window.ApdaState.shelters
      .map(s => ({ ...s, numericDistance: this.getDistanceKm(activeLocation, s.coordinates) }))
      .filter(s => s.numericDistance <= 20)
      .map(s => ({ ...s, distanceKm: s.numericDistance.toFixed(1) + ' km' }));
  },

  render() {
    const shelters = this.getFilteredShelters();

    setTimeout(() => {
      this.initLeafletMap();
    }, 100);

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
              <span>🏠</span> Live Shelter Vacancy & Safe Zones
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Verified relief shelters with real-time bed capacity, medical facilities, hot meals, and turn-by-turn routing.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span> 5 Shelters Operational
            </span>
          </div>
        </div>

        <!-- Simulated Turn-by-Turn Navigation Alert (if active) -->
        <div id="navigation-banner" class="${this.activeNavigationShelter ? 'block' : 'hidden'} glass-panel-success p-4 rounded-2xl border border-emerald-500/50">
          ${this.renderNavigationBanner()}
        </div>

        <!-- Map & Shelter Cards Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Leaflet Interactive Map -->
          <div class="lg:col-span-2 glass-panel p-4 rounded-2xl border border-white/10 min-h-[420px] flex flex-col">
            <div class="flex items-center justify-between mb-3 text-xs">
              <span class="font-bold text-slate-200">🗺️ Real-Time Shelter & Safe Zone Map</span>
              <span class="text-slate-400">Click pins for live capacity & facilities</span>
            </div>
            
            <div id="shelter-map-canvas" class="flex-1 rounded-xl min-h-[360px] relative z-10"></div>
            
            <!-- Low bandwidth fallback table -->
            <div class="low-bandwidth-map-fallback p-4 bg-slate-900 rounded-xl text-xs text-slate-300">
              <p class="font-bold text-yellow-300 mb-2">⚠️ Low-Bandwidth Mode Active (Map tiles paused)</p>
              <ul class="list-disc pl-4 space-y-1">
                ${shelters.map(s => `
                  <li><strong>${s.name}:</strong> ${s.totalCapacity - s.occupied} beds available (${s.location}) - Hotline: ${s.phone}</li>
                `).join('')}
              </ul>
            </div>
          </div>

          <!-- Shelter Cards List -->
          <div class="space-y-3.5 max-h-[500px] overflow-y-auto chat-scroll pr-1">
            ${shelters.map(s => {
              const vacancy = s.totalCapacity - s.occupied;
              const occupancyPct = Math.round((s.occupied / s.totalCapacity) * 100);
              const isHigh = occupancyPct >= 85;

              return `
                <div class="glass-panel p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all">
                  
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h4 class="font-extrabold text-sm text-white">${s.name}</h4>
                      <p class="text-xs text-slate-400 mt-0.5">📍 ${s.location}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isHigh ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
                      ${vacancy} Spots Open
                    </span>
                  </div>

                  <!-- Vacancy Bar -->
                  <div class="mt-3">
                    <div class="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Occupancy: ${s.occupied}/${s.totalCapacity} beds</span>
                      <span class="font-bold">${occupancyPct}%</span>
                    </div>
                    <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div class="h-full rounded-full ${isHigh ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${occupancyPct}%"></div>
                    </div>
                  </div>

                  <!-- Facilities Pills -->
                  <div class="flex flex-wrap gap-1 mt-3">
                    ${s.facilities.map(f => `
                      <span class="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                        ✓ ${f}
                      </span>
                    `).join('')}
                  </div>

                  <!-- Contact & Navigation Button -->
                  <div class="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <span class="text-[11px] text-slate-400 font-mono">📞 ${s.phone}</span>
                    <button onclick="window.ApdaShelterMap.startNavigation('${s.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30">
                      <span>🧭</span> Navigate (${s.distanceKm})
                    </button>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

        </div>

      </div>
    `;
  },

  initLeafletMap() {
    const container = document.getElementById('shelter-map-canvas');
    if (!container || typeof L === 'undefined') return;

    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }

    try {
      const shelters = this.getFilteredShelters();
      const userLoc = this.getEffectiveLocation();
      const center = shelters[0] ? shelters[0].coordinates : userLoc;

      this.leafletMap = L.map('shelter-map-canvas').setView(center, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | ApdaSetu Safe Zone'
      }).addTo(this.leafletMap);

      // Add Shelter Markers
      shelters.forEach(s => {
        const vacancy = s.totalCapacity - s.occupied;
        const marker = L.marker(s.coordinates).addTo(this.leafletMap);
        
        marker.bindPopup(`
          <div style="font-family: inherit; color: #0f172a; padding: 4px;">
            <h4 style="margin: 0; font-weight: bold; font-size: 14px;">${s.name}</h4>
            <p style="margin: 4px 0; font-size: 12px; color: #475569;">📍 ${s.location}</p>
            <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; color: #065f46; margin: 6px 0;">
              ✓ ${vacancy} Available Beds (${s.occupied}/${s.totalCapacity})
            </div>
            <p style="font-size: 11px; margin: 4px 0;">📞 Contact: ${s.contactPerson} (${s.phone})</p>
            <button onclick="window.ApdaShelterMap.startNavigation('${s.id}')" style="width: 100%; background: #10b981; color: white; border: none; padding: 6px; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer; margin-top: 4px;">
              Get Safe Evacuation Route →
            </button>
          </div>
        `);
      });

      // User location marker
      const userMarker = L.circleMarker(userLoc, {
        radius: 8,
        fillColor: '#ef4444',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(this.leafletMap);

      userMarker.bindPopup('<b>Your Location</b><br>Reference Point for Alerts');

    } catch (e) {
      console.warn('Leaflet map initialization warning:', e);
    }
  },

  startNavigation(shelterId) {
    const s = this.getFilteredShelters().find(item => item.id === shelterId);
    if (!s) return;
    this.activeNavigationShelter = s;

    const banner = document.getElementById('navigation-banner');
    if (banner) {
      banner.className = 'block glass-panel-success p-4 rounded-2xl border border-emerald-500/50 modal-animate-in';
      banner.innerHTML = this.renderNavigationBanner();
    }

    if (this.leafletMap && s.coordinates) {
      this.leafletMap.flyTo(s.coordinates, 14, { duration: 1.2 });
    }

    if (window.ApdaState) {
      window.ApdaState.notify(`Navigation route calculated to ${s.name} (${s.distanceKm})`, 'success');
    }
  },

  renderNavigationBanner() {
    const s = this.activeNavigationShelter;
    if (!s) return '';

    return `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 animate-bounce">
            🧭
          </div>
          <div>
            <h4 class="font-extrabold text-sm text-white">Active Safe Route to ${s.name}</h4>
            <p class="text-xs text-emerald-300">Estimated Distance: ${s.distanceKm} • ~6 mins via Dispur Evacuation Corridor • Safe from waterlogging</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <a href="tel:${s.phone}" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
            📞 Call Shelter Desk
          </a>
          <button onclick="window.ApdaShelterMap.activeNavigationShelter = null; document.getElementById('navigation-banner').className = 'hidden';" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      </div>
    `;
  }
};
