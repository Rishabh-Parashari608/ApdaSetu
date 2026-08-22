// Family & Group Safety Check-In Component

window.ApdaFamilyCheckin = {
  render() {
    const family = window.ApdaState.familyMembers;
    const user = window.ApdaState.currentUser;
    const isSafe = user && user.isSafe;

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
              <span>👨‍👩‍👧</span> Family & Contact Safety Circle
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Broadcast your safety status to your loved ones and track family members during disaster blackouts.
            </p>
          </div>

          <button onclick="window.ApdaFamilyCheckin.openAddMemberModal()" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all">
            <span>➕</span> Add Family Contact
          </button>
        </div>

        <!-- "I AM SAFE" Master Banner -->
        <div class="glass-panel-success p-6 rounded-3xl border-2 border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-950/20">
          <div class="flex items-center gap-4 text-center sm:text-left">
            <div class="w-16 h-16 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 flex items-center justify-center text-3xl flex-shrink-0 animate-pulse">
              🛡️
            </div>
            <div>
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest block">PERSONAL STATUS BROADCAST</span>
              <h3 class="text-xl sm:text-2xl font-black text-white mt-0.5">
                ${isSafe ? 'You Marked Yourself SAFE' : 'Are You Safe Right Now?'}
              </h3>
              <p class="text-xs text-slate-300 mt-1">
                ${isSafe ? `Last broadcasted at ${user.safeTimestamp || 'Just now'} from Kamrup Metro Safe Hub` : 'One tap notifies your registered family circle and rescue coordinators.'}
              </p>
            </div>
          </div>

          <button onclick="window.ApdaState.markSelfSafe()" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
            <span>✅</span> ${isSafe ? 'Re-Broadcast "I AM SAFE"' : 'I AM SAFE (Mark Safe)'}
          </button>
        </div>

        <!-- Family Contacts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${family.map(member => {
            const isMemberSafe = member.status === 'Safe';
            const isDanger = member.status === 'In Danger';

            return `
              <div class="glass-panel p-5 rounded-2xl border transition-all ${isDanger ? 'border-red-500/60 bg-red-950/20' : isMemberSafe ? 'border-emerald-500/30' : 'border-slate-700'}">
                
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full ${isDanger ? 'bg-red-600' : isMemberSafe ? 'bg-emerald-600' : 'bg-amber-600'} flex items-center justify-center font-bold text-white text-sm shadow-md">
                      ${member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 class="font-bold text-sm text-white">${member.name}</h4>
                      <span class="text-[11px] text-slate-400 font-mono">${member.phone}</span>
                    </div>
                  </div>

                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${isDanger ? 'badge-critical' : isMemberSafe ? 'badge-low' : 'badge-medium'}">
                    ${member.status}
                  </span>
                </div>

                <!-- Last Known Details -->
                <div class="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Last Known Location:</span>
                    <span class="font-semibold text-right max-w-[160px] truncate">${member.lastLocation}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Last Status Ping:</span>
                    <span class="font-mono">${member.lastPingTime}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Device Battery:</span>
                    <span class="font-semibold ${parseInt(member.battery) < 30 ? 'text-red-400' : 'text-emerald-400'}">🔋 ${member.battery}</span>
                  </div>
                </div>

                <!-- Ping Action Button -->
                <div class="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                  <button onclick="window.ApdaState.pingFamilyMember('${member.id}')" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5">
                    <span>📡</span> Ping for Status
                  </button>
                  <a href="tel:${member.phone}" class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs">
                    📞
                  </a>
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  },

  openAddMemberModal() {
    const modal = document.createElement('div');
    modal.id = 'add-family-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md modal-animate-in';
    modal.innerHTML = `
      <div class="glass-panel w-full max-w-md rounded-2xl p-6 text-white border border-white/20 shadow-2xl relative">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 class="font-bold text-lg text-white">Add Family Safety Contact</h3>
          <button onclick="document.getElementById('add-family-modal').remove()" class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">×</button>
        </div>

        <form onsubmit="window.ApdaFamilyCheckin.handleAddSubmit(event)" class="space-y-3.5 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Contact Name</label>
            <input type="text" id="fam-name" required placeholder="e.g. Ramesh Sharma" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Relation</label>
            <input type="text" id="fam-rel" required placeholder="e.g. Brother, Spouse, Parent" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
            <input type="tel" id="fam-phone" required placeholder="+91 98765 00000" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Known Location / City</label>
            <input type="text" id="fam-loc" placeholder="e.g. Beltola, Guwahati" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
          </div>
          <button type="submit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-white text-xs shadow-lg shadow-emerald-600/30 transition-all mt-2">
            Save to Family Circle
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },

  handleAddSubmit(e) {
    e.preventDefault();
    const newMember = {
      name: document.getElementById('fam-name').value,
      relation: document.getElementById('fam-rel').value,
      phone: document.getElementById('fam-phone').value,
      lastLocation: document.getElementById('fam-loc').value || 'Location Pending'
    };
    const modal = document.getElementById('add-family-modal');
    if (modal) modal.remove();
    window.ApdaState.addFamilyMember(newMember);
  }
};
