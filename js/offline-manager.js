// Offline Manager & PWA Sync Handler for ApdaSetu

window.ApdaOfflineManager = {
  isOnline: navigator.onLine,
  offlineQueueKey: 'apdasetu_offline_sos_queue',

  init() {
    this.registerServiceWorker();
    this.setupNetworkListeners();
    this.applyPersistedPreferences();
    this.checkAndSyncOfflineQueue();
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('[ApdaSetu] ServiceWorker registered with scope:', reg.scope);
          })
          .catch(err => {
            console.warn('[ApdaSetu] ServiceWorker registration failed (file protocol or blocked):', err);
          });
      });
    }
  },

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateNetworkBadge();
      this.checkAndSyncOfflineQueue();
      if (window.ApdaState) {
        window.ApdaState.notify('Network Reconnected: All systems operational', 'success');
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateNetworkBadge();
      if (window.ApdaState) {
        window.ApdaState.notify('Offline Mode Activated: Safety guides & offline SOS queue enabled', 'warning');
      }
    });
  },

  updateNetworkBadge() {
    const badge = document.getElementById('network-status-indicator');
    if (badge) {
      if (this.isOnline) {
        badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
        badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> <span>Online</span>';
      } else {
        badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce';
        badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span> <span>Offline (Low Bandwidth)</span>';
      }
    }
  },

  // Queue SOS when user has zero connectivity
  queueOfflineSOS(sosPayload) {
    const queue = this.getOfflineQueue();
    sosPayload.queuedAt = new Date().toISOString();
    sosPayload.isOfflineQueued = true;
    queue.push(sosPayload);
    localStorage.setItem(this.offlineQueueKey, JSON.stringify(queue));
    console.log('[ApdaSetu] SOS queued offline:', sosPayload);
  },

  getOfflineQueue() {
    try {
      return JSON.parse(localStorage.getItem(this.offlineQueueKey)) || [];
    } catch (e) {
      return [];
    }
  },

  checkAndSyncOfflineQueue() {
    if (!this.isOnline) return;
    const queue = this.getOfflineQueue();
    if (queue.length > 0) {
      console.log(`[ApdaSetu] Syncing ${queue.length} offline SOS reports...`);
      queue.forEach(item => {
        if (window.ApdaState) {
          window.ApdaState.addEmergencyRequest(item);
        }
      });
      localStorage.removeItem(this.offlineQueueKey);
      if (window.ApdaState) {
        window.ApdaState.notify(`Synced ${queue.length} pending SOS reports with Rescue Command Center!`, 'success');
      }
    }
  },

  applyPersistedPreferences() {
    // High contrast mode
    const isHighContrast = localStorage.getItem('apdasetu_high_contrast') === 'true';
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    }

    // Low bandwidth mode
    const isLowBandwidth = localStorage.getItem('apdasetu_low_bandwidth') === 'true';
    if (isLowBandwidth) {
      document.body.classList.add('low-bandwidth');
    }
  },

  toggleHighContrast() {
    const isNowHigh = document.body.classList.toggle('high-contrast');
    localStorage.setItem('apdasetu_high_contrast', isNowHigh);
    window.dispatchEvent(new CustomEvent('apdasetu_contrast_changed', { detail: { isHighContrast: isNowHigh } }));
    return isNowHigh;
  },

  toggleLowBandwidth() {
    const isNowLow = document.body.classList.toggle('low-bandwidth');
    localStorage.setItem('apdasetu_low_bandwidth', isNowLow);
    window.dispatchEvent(new CustomEvent('apdasetu_bandwidth_changed', { detail: { isLowBandwidth: isNowLow } }));
    return isNowLow;
  }
};
