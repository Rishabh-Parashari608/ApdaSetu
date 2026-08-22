// Community Help Chat Component (Disaster Event & Location Groups)

window.ApdaCommunityChat = {
  selectedTag: 'Need Water/Food',
  filterTag: 'all',

  selectTag(tag) {
    this.selectedTag = tag;
    const btns = document.querySelectorAll('.chat-tag-selector-btn');
    btns.forEach(b => {
      if (b.dataset.tag === tag) {
        b.className = 'chat-tag-selector-btn px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white shadow';
      } else {
        b.className = 'chat-tag-selector-btn px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700';
      }
    });
  },

  filterByTag(tag) {
    this.filterTag = tag;
    const container = document.getElementById('citizen-subtab-container');
    if (container) container.innerHTML = this.render();
  },

  render() {
    const rooms = window.ApdaState.chatRooms;
    const activeRoomId = window.ApdaState.activeChatRoomId;
    const room = rooms.find(r => r.id === activeRoomId) || rooms[0];
    const user = window.ApdaState.currentUser;

    const messages = (room.messages || []).filter(m => {
      if (this.filterTag === 'all') return true;
      return m.tag === this.filterTag;
    });

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
              <span>💬</span> Community Help & Mutual Aid Chat
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Real-time grassroots communication for stranded citizens, volunteer boat drivers, resource sharing, and verified responders.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ${room.activeUsers || 48} Active in this channel
            </span>
          </div>
        </div>

        <!-- Main Chat Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <!-- Left: Room Selector -->
          <div class="space-y-2">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">Disaster Channels</span>
            ${rooms.map(r => `
              <button onclick="window.ApdaState.setActiveChatRoom('${r.id}')" class="w-full p-3.5 rounded-2xl border text-left transition-all ${r.id === activeRoomId ? 'bg-red-950/40 border-red-500/50 text-white shadow-lg' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-white block">${r.name.split('(')[0]}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">${r.messages ? r.messages.length : 0}</span>
                </div>
                <p class="text-[11px] text-slate-400 mt-1 truncate">${r.pinnedNotice ? r.pinnedNotice.substring(0, 40) + '...' : ''}</p>
              </button>
            `).join('')}
          </div>

          <!-- Center/Right: Active Chat Conversation -->
          <div class="lg:col-span-3 glass-panel rounded-3xl border border-white/10 flex flex-col h-[600px] overflow-hidden">
            
            <!-- Room Top Bar & Pinned Notice -->
            <div class="p-4 border-b border-white/10 bg-slate-900/80">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-extrabold text-base text-white flex items-center gap-2">
                    <span>📍</span> ${room.name}
                  </h3>
                </div>

                <!-- Tag Filter Pills in chat -->
                <div class="flex items-center gap-1 overflow-x-auto text-[11px]">
                  <span class="text-slate-500 mr-1">Filter:</span>
                  <button onclick="window.ApdaCommunityChat.filterByTag('all')" class="px-2 py-0.5 rounded-lg ${this.filterTag === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}">All</button>
                  <button onclick="window.ApdaCommunityChat.filterByTag('Need Water/Food')" class="px-2 py-0.5 rounded-lg ${this.filterTag === 'Need Water/Food' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}">Water/Food</button>
                  <button onclick="window.ApdaCommunityChat.filterByTag('Transport Available')" class="px-2 py-0.5 rounded-lg ${this.filterTag === 'Transport Available' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}">Transport</button>
                  <button onclick="window.ApdaCommunityChat.filterByTag('Hazard Alert')" class="px-2 py-0.5 rounded-lg ${this.filterTag === 'Hazard Alert' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'}">Hazards</button>
                </div>
              </div>

              <!-- Pinned Notice -->
              ${room.pinnedNotice ? `
                <div class="mt-2.5 p-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                  <span class="text-base flex-shrink-0">📌</span>
                  <span class="leading-tight">${room.pinnedNotice}</span>
                </div>
              ` : ''}
            </div>

            <!-- Messages Stream Area -->
            <div id="chat-messages-container" class="flex-1 p-4 overflow-y-auto chat-scroll space-y-3.5 bg-slate-950/40">
              ${messages.length === 0 ? `
                <div class="h-full flex items-center justify-center text-slate-500 text-xs">
                  No messages under this filter. Post a message below to coordinate help.
                </div>
              ` : messages.map(msg => {
                const isOfficial = msg.isOfficial || msg.senderRole === 'responder';
                const isVol = msg.senderRole === 'volunteer';

                return `
                  <div class="p-3.5 rounded-2xl border transition-all ${msg.isModerated ? 'bg-red-950/20 border-red-800/40 opacity-60' : isOfficial ? 'bg-gradient-to-r from-red-950/40 to-slate-900 border-red-500/40 shadow-md' : isVol ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-900/70 border-slate-800'}">
                    
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-lg">${msg.avatar || '👤'}</span>
                        <span class="font-bold text-xs text-white">${msg.sender}</span>
                        
                        ${isOfficial ? `
                          <span class="px-1.5 py-0.2 rounded bg-red-600/30 text-red-300 border border-red-500/40 text-[9px] font-extrabold uppercase">
                            ✓ Official Responder
                          </span>
                        ` : isVol ? `
                          <span class="px-1.5 py-0.2 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold uppercase">
                            🦺 Volunteer
                          </span>
                        ` : ''}

                        <!-- Category Tag Badge -->
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${msg.tag.includes('Hazard') ? 'badge-critical' : msg.tag.includes('Transport') ? 'badge-low' : msg.tag.includes('Water') || msg.tag.includes('Food') ? 'badge-high' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
                          ${msg.tag}
                        </span>
                      </div>

                      <span class="text-[10px] text-slate-500 font-mono">${msg.time}</span>
                    </div>

                    <!-- Message Body -->
                    <p class="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
                      ${msg.text}
                    </p>

                    <!-- Message Footer Actions -->
                    <div class="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <div class="flex items-center gap-3">
                        <button onclick="this.innerHTML = '❤️ ' + (${msg.upvotes} + 1)" class="hover:text-red-400 flex items-center gap-1 transition-colors">
                          <span>👍</span> Helpful (${msg.upvotes || 0})
                        </button>
                      </div>

                      <button onclick="window.ApdaState.flagMessage('${room.id}', '${msg.id}')" title="Report Inappropriate/Spam" class="text-slate-500 hover:text-red-400 transition-colors">
                        🚩 Flag
                      </button>
                    </div>

                  </div>
                `;
              }).join('')}
            </div>

            <!-- Chat Input Form & Help Category Selector -->
            <div class="p-3.5 border-t border-white/10 bg-slate-900/90">
              
              <!-- Tag Selector Buttons -->
              <div class="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-white/5">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Tag:</span>
                ${[
                  'Need Water/Food',
                  'Need Shelter Space',
                  'Transport Available',
                  'Hazard Alert',
                  'Medical Aid',
                  'General Aid'
                ].map(tag => `
                  <button type="button" data-tag="${tag}" onclick="window.ApdaCommunityChat.selectTag('${tag}')" class="chat-tag-selector-btn px-2 py-0.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${this.selectedTag === tag ? 'bg-red-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'}">
                    ${tag}
                  </button>
                `).join('')}
              </div>

              <!-- Input Row -->
              <form onsubmit="window.ApdaCommunityChat.handleMessageSend(event, '${room.id}')" class="flex items-center gap-2">
                <input type="text" id="chat-input-text" required placeholder="Type help request or share local resource..." class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
                
                <button type="submit" class="px-5 py-2.5 bg-red-600 hover:bg-red-500 font-bold rounded-xl text-white text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5">
                  <span>Send</span> ➔
                </button>
              </form>

            </div>

          </div>

        </div>

      </div>
    `;
  },

  handleMessageSend(e, roomId) {
    e.preventDefault();
    const input = document.getElementById('chat-input-text');
    if (!input || !input.value.trim()) return;

    window.ApdaState.sendChatMessage(roomId, input.value, this.selectedTag);
    input.value = '';
    
    // Auto scroll chat
    setTimeout(() => {
      const container = document.getElementById('chat-messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }
};
