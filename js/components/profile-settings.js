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
    const savedLocation = (user.city || 'Guwahati, Assam').split(',').map(part => part.trim());
    const city = user.cityName || savedLocation[0] || 'Guwahati';
    const state = user.state || savedLocation[1] || 'Assam';
    const emergencyContacts = user.emergencyContacts || [];
    const primaryContact = emergencyContacts[0] || { name: 'Aarav', relation: 'Son', phone: '+91 98765 11111' };

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
              <span>👤</span> Emergency Profile & Medical ID
            </h2>
          </div>
          <label class="flex items-center gap-3 cursor-pointer group" title="Set profile picture">
            <span class="relative w-14 h-14 rounded-2xl overflow-hidden border border-cyan-300/35 bg-slate-800 flex items-center justify-center text-xl font-black text-cyan-200">
              ${user.profileImage ? `<img id="profile-photo-preview" src="${user.profileImage}" alt="Profile picture" class="w-full h-full object-cover">` : `<span id="profile-photo-placeholder">${user.name ? user.name.charAt(0) : 'P'}</span>`}
              <span class="absolute inset-0 grid place-items-center bg-slate-950/60 opacity-0 group-hover:opacity-100 text-[10px] font-bold transition-opacity">Edit</span>
            </span>
            <span><span class="block text-xs font-extrabold text-cyan-200">Set profile picture</span><span class="block text-[10px] text-slate-400 mt-0.5">JPG, PNG, or WebP (max 2 MB)</span></span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onchange="window.ApdaProfileSettings.handleProfileImage(this)" class="hidden">
          </label>
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
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="text" id="prof-locality" value="${user.locality || 'Hatigaon By-lane 3'}" required placeholder="Locality / landmark" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
                  <input type="text" id="prof-city" value="${city}" required placeholder="Village or city" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
                  <input type="text" id="prof-district" value="${user.district || 'Kamrup Metropolitan'}" required placeholder="District" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
                  <input type="text" id="prof-state" value="${state}" required placeholder="State" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
                  <input type="text" id="prof-pincode" value="${user.pincode || '781038'}" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="Pincode" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
                </div>
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

              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-300 mb-1">Chronic Conditions / Mobility / Allergies / Infants</label>
                <textarea id="prof-med" rows="2" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500">${user.medicalNotes || 'Asthma patient in household, 8-month infant'}</textarea>
              </div>
            </div>
          </div>

          <!-- Emergency Contacts -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 class="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <span>☎</span> My Emergency Contacts
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Name</label>
                <input type="text" id="prof-contact-name" value="${primaryContact.name}" placeholder="Contact name" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Relation</label>
                <input type="text" id="prof-contact-relation" value="${primaryContact.relation}" placeholder="e.g. Parent, Friend" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Contact No.</label>
                <input type="tel" id="prof-contact-phone" value="${primaryContact.phone}" placeholder="Phone number" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
              </div>
            </div>
            <button type="button" onclick="window.ApdaProfileSettings.addContact()" class="px-5 py-2.5 border border-red-400/60 text-red-300 hover:bg-red-500/10 font-extrabold text-xs rounded-xl transition-all">Add Contact</button>
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
            Save
          </button>
        </form>

      </div>
    `;
  },

  handleSave(e) {
    e.preventDefault();
    const existingContacts = (window.ApdaState.currentUser || {}).emergencyContacts || [];
    const contact = this.getContactDraft();
    const updated = {
      ...(window.ApdaState.currentUser || {}),
      name: document.getElementById('prof-name').value,
      phone: document.getElementById('prof-phone').value,
      locality: document.getElementById('prof-locality').value,
      cityName: document.getElementById('prof-city').value,
      district: document.getElementById('prof-district').value,
      state: document.getElementById('prof-state').value,
      pincode: document.getElementById('prof-pincode').value,
      city: `${document.getElementById('prof-city').value}, ${document.getElementById('prof-state').value}`,
      bloodGroup: document.getElementById('prof-blood').value,
      emergencyContacts: contact ? [contact, ...existingContacts.slice(1)] : existingContacts,
      emergencyContact: contact ? `${contact.phone} (${contact.relation}: ${contact.name})` : '',
      medicalNotes: document.getElementById('prof-med').value
    };

    window.ApdaState.currentUser = updated;
    localStorage.setItem('apdasetu_user', JSON.stringify(updated));
    window.ApdaState.notify('Emergency Medical ID & Profile saved successfully', 'success');
  },

  getContactDraft() {
    const name = document.getElementById('prof-contact-name').value.trim();
    const relation = document.getElementById('prof-contact-relation').value.trim();
    const phone = document.getElementById('prof-contact-phone').value.trim();
    return name && relation && phone ? { name, relation, phone } : null;
  },

  handleProfileImage(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      window.ApdaState.notify('Choose a JPG, PNG, or WebP image smaller than 2 MB.', 'warning');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      const existing = window.ApdaState.currentUser || { name: 'Priya Sharma', phone: '+91 98765 43210', city: 'Guwahati, Assam' };
      window.ApdaState.currentUser = { ...existing, profileImage: event.target.result };
      localStorage.setItem('apdasetu_user', JSON.stringify(window.ApdaState.currentUser));
      const preview = document.getElementById('profile-photo-preview');
      if (preview) preview.src = event.target.result;
      else {
        const holder = document.getElementById('profile-photo-placeholder');
        if (holder) holder.outerHTML = `<img id="profile-photo-preview" src="${event.target.result}" alt="Profile picture" class="w-full h-full object-cover">`;
      }
      window.ApdaState.emitChange();
      window.ApdaState.notify('Profile picture updated successfully.', 'success');
    };
    reader.readAsDataURL(file);
  },

  addContact() {
    const contact = this.getContactDraft();
    if (!contact) {
      window.ApdaState.notify('Enter a name, relation, and contact number first.', 'warning');
      return;
    }
    const user = window.ApdaState.currentUser || {};
    const contacts = user.emergencyContacts || [];
    window.ApdaState.currentUser = { ...user, emergencyContacts: [...contacts, contact] };
    localStorage.setItem('apdasetu_user', JSON.stringify(window.ApdaState.currentUser));
    ['prof-contact-name', 'prof-contact-relation', 'prof-contact-phone'].forEach(id => { document.getElementById(id).value = ''; });
    window.ApdaState.notify('Emergency contact added. You can add another or press Save.', 'success');
  }
};
