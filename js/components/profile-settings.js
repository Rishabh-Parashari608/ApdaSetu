// Profile & Medical ID Settings Component

window.ApdaProfileSettings = {
  render() {
    const user = window.ApdaState.currentUser || {
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      city: 'Guwahati, Assam',
      bloodGroup: 'O+',
      emergencyContact: '+91 98765 11111 (Son: Aarav)',
      medicalNotes: 'Asthma patient in household, 8-month-old infant requiring formula'
    };

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
              <span>👤</span> Emergency Profile & Medical ID
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Critical triage information automatically shared with First Responders and Trauma Ambulances during SOS.
            </p>
          </div>
        </div>

        <form onsubmit="window.ApdaProfileSettings.handleSave(event)" class="space-y-6">
          
          <!-- Personal & Location -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 class="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <span>🪪</span> Personal & Residence Information
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Full Legal Name</label>
                <input type="text" id="prof-name" value="${user.name}" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Primary Mobile Number</label>
                <input type="tel" id="prof-phone" value="${user.phone}" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-300 mb-1">Current Residence / Disaster Sector</label>
                <input type="text" id="prof-city" value="${user.city || 'Guwahati, Assam'}" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              </div>
            </div>
          </div>

          <!-- Medical Emergency ID (Used for 108 / Trauma triage) -->
          <div class="glass-panel p-6 rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-950/20 to-slate-900 space-y-4">
            <h3 class="font-extrabold text-sm text-red-400 flex items-center gap-2 pb-2 border-b border-red-500/20">
              <span>🩺</span> Medical Emergency ID & Vulnerability Matrix
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Blood Group</label>
                <select id="prof-blood" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
                  ${['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => `
                    <option value="${bg}" ${user.bloodGroup === bg ? 'selected' : ''}>${bg}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Primary Emergency Contact</label>
                <input type="text" id="prof-contact" value="${user.emergencyContact || '+91 98765 11111 (Aarav - Son)'}" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-300 mb-1">Chronic Conditions / Mobility / Allergies / Infants</label>
                <textarea id="prof-med" rows="2" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500">${user.medicalNotes || 'Asthma patient in household, 8-month infant'}</textarea>
              </div>
            </div>
          </div>

          <!-- Notification Channel Preferences -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 class="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <span>🔔</span> Emergency Alert Delivery Channels
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <input type="checkbox" checked class="accent-red-500 w-4 h-4">
                <div>
                  <span class="text-xs font-bold text-white block">Web Push Alerts</span>
                  <span class="text-[10px] text-slate-400">High priority device push</span>
                </div>
              </label>

              <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <input type="checkbox" checked class="accent-red-500 w-4 h-4">
                <div>
                  <span class="text-xs font-bold text-white block">SMS Broadcast</span>
                  <span class="text-[10px] text-slate-400">Works without data plan</span>
                </div>
              </label>

              <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <input type="checkbox" checked class="accent-red-500 w-4 h-4">
                <div>
                  <span class="text-xs font-bold text-white block">WhatsApp Alerts</span>
                  <span class="text-[10px] text-slate-400">Family location pins</span>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" class="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-red-600/30 uppercase tracking-wider transition-all">
            Save Medical Profile & Preferences
          </button>
        </form>

      </div>
    `;
  },

  handleSave(e) {
    e.preventDefault();
    const updated = {
      ...(window.ApdaState.currentUser || {}),
      name: document.getElementById('prof-name').value,
      phone: document.getElementById('prof-phone').value,
      city: document.getElementById('prof-city').value,
      bloodGroup: document.getElementById('prof-blood').value,
      emergencyContact: document.getElementById('prof-contact').value,
      medicalNotes: document.getElementById('prof-med').value
    };

    window.ApdaState.currentUser = updated;
    localStorage.setItem('apdasetu_user', JSON.stringify(updated));
    window.ApdaState.notify('Emergency Medical ID & Profile saved successfully', 'success');
  }
};
