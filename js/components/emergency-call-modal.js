// Emergency Helplines & Direct Call Modal

window.ApdaEmergencyCallModal = {
  open() {
    this.close();
    const modal = document.createElement('div');
    modal.id = 'emergency-call-modal-backdrop';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md modal-animate-in';
    modal.innerHTML = `
      <div class="glass-panel-danger w-full max-w-lg rounded-2xl p-6 text-white border-2 border-red-500 shadow-2xl relative">
        <div class="flex items-center justify-between pb-3 border-b border-red-500/30">
          <div class="flex items-center gap-3">
            <span class="p-2.5 rounded-xl bg-red-600/30 text-2xl">📞</span>
            <div>
              <h3 class="font-extrabold text-xl text-white">Emergency Helplines</h3>
              <p class="text-xs text-red-300">Toll-free 24/7 National & State Disaster Response Lines</p>
            </div>
          </div>
          <button onclick="window.ApdaEmergencyCallModal.close()" class="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white font-bold text-lg">×</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          
          <a href="tel:112" class="p-4 rounded-xl bg-red-950/60 border border-red-500/40 hover:bg-red-900/60 transition-all flex items-center justify-between group">
            <div>
              <span class="text-xs font-semibold text-red-300 uppercase tracking-wider block">National Unified</span>
              <span class="text-2xl font-black text-white">112</span>
              <p class="text-[11px] text-slate-300">Police / Fire / Ambulance</p>
            </div>
            <span class="p-3 rounded-full bg-red-600 text-white text-lg group-hover:scale-110 transition-transform">📲</span>
          </a>

          <a href="tel:1078" class="p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 transition-all flex items-center justify-between group">
            <div>
              <span class="text-xs font-semibold text-amber-300 uppercase tracking-wider block">NDRF HQ Helpline</span>
              <span class="text-2xl font-black text-white">1078</span>
              <p class="text-[11px] text-slate-300">Disaster Rescue & Flood Ops</p>
            </div>
            <span class="p-3 rounded-full bg-amber-600 text-white text-lg group-hover:scale-110 transition-transform">📲</span>
          </a>

          <a href="tel:108" class="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 transition-all flex items-center justify-between group">
            <div>
              <span class="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">Medical Trauma</span>
              <span class="text-2xl font-black text-white">108</span>
              <p class="text-[11px] text-slate-300">Emergency Ambulance ALS/BLS</p>
            </div>
            <span class="p-3 rounded-full bg-emerald-600 text-white text-lg group-hover:scale-110 transition-transform">📲</span>
          </a>

          <a href="tel:101" class="p-4 rounded-xl bg-orange-950/60 border border-orange-500/40 hover:bg-orange-900/60 transition-all flex items-center justify-between group">
            <div>
              <span class="text-xs font-semibold text-orange-300 uppercase tracking-wider block">Fire & Rescue</span>
              <span class="text-2xl font-black text-white">101</span>
              <p class="text-[11px] text-slate-300">Building Collapse & Wildfire</p>
            </div>
            <span class="p-3 rounded-full bg-orange-600 text-white text-lg group-hover:scale-110 transition-transform">📲</span>
          </a>

          <a href="tel:1070" class="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-between group">
            <div>
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider block">State SDMA Desk</span>
              <span class="text-2xl font-black text-white">1070</span>
              <p class="text-[11px] text-slate-300">District Magistrate Relief Cell</p>
            </div>
            <span class="p-3 rounded-full bg-slate-700 text-white text-lg group-hover:scale-110 transition-transform">📲</span>
          </a>

          <a href="tel:1090" class="p-4 rounded-xl bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/60 transition-all flex items-center justify-between group">
            <div>
              <span class="text-xs font-semibold text-purple-300 uppercase tracking-wider block">Women & Child Safety</span>
              <span class="text-2xl font-black text-white">1090</span>
              <p class="text-[11px] text-slate-300">Special Vulnerable Aid Cell</p>
            </div>
            <span class="p-3 rounded-full bg-purple-600 text-white text-lg group-hover:scale-110 transition-transform">📲</span>
          </a>

        </div>

        <div class="mt-4 p-3 rounded-xl bg-black/40 border border-white/10 text-center text-xs text-slate-300">
          💡 <strong>Tip for Low Network:</strong> Dialing 112 connects to the nearest available cell tower across any telecom carrier even with zero mobile balance.
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  close() {
    const el = document.getElementById('emergency-call-modal-backdrop');
    if (el) el.remove();
  }
};
