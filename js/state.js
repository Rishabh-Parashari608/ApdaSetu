// Central Reactive State Store for ApdaSetu Platform

window.ApdaState = {
  // Current logged in user
  currentUser: null,
  currentView: 'home', // 'home' | 'citizen' | 'responder'
  citizenTab: 'alerts', // 'sos' | 'alerts' | 'shelters' | 'requests' | 'family' | 'chat' | 'guides' | 'updates' | 'profile'
  responderTab: 'queue', // 'queue' | 'map' | 'dispatch' | 'analytics'
  volunteerTab: 'alerts', // [volunteer done] 'alerts' | 'history'

  // Data collections
  alerts: [],
  shelters: [],
  requests: [],
  rescueUnits: [],
  chatRooms: [],
  familyMembers: [],
  communityUpdates: [],
  volunteers: [], // [volunteer done] Verified volunteer directory
  volunteerMobilizations: [], // [volunteer done] Active and historical volunteer requests
  volunteerSyncChannel: null, // [volunteer done] Cross-tab response-network channel
  volunteerTimer: null, // [volunteer done] Response-window safety monitor
  checkedKitItems: new Set(),
  activeChatRoomId: 'ROOM-ASSAM-FLOOD',

  // Listeners
  subscribers: [],

  init() {
    this.loadStateFromStorage();
    this.initVolunteerNetwork(); // [volunteer done] Start immediate multi-tab volunteer updates
    this.startLiveSimulation();
  },

  loadStateFromStorage() {
    const savedUser = localStorage.getItem('apdasetu_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        this.currentUser = null;
      }
    }

    const savedRequests = localStorage.getItem('apdasetu_requests');
    if (savedRequests) {
      try {
        this.requests = JSON.parse(savedRequests);
      } catch (e) {
        this.requests = window.ApdaSeedData.requests;
      }
    } else {
      this.requests = [...window.ApdaSeedData.requests];
    }

    this.alerts = [...window.ApdaSeedData.alerts];
    this.shelters = [...window.ApdaSeedData.shelters];
    this.rescueUnits = [...window.ApdaSeedData.rescueUnits];
    this.chatRooms = [...window.ApdaSeedData.chatRooms];
    this.familyMembers = [...window.ApdaSeedData.familyMembers];
    this.communityUpdates = [...window.ApdaSeedData.communityUpdates];
    // [volunteer done] Preserve response progress independently of regular incident seed data.
    const savedVolunteerNetwork = localStorage.getItem('apdasetu_volunteer_network');
    if (savedVolunteerNetwork) {
      try {
        const network = JSON.parse(savedVolunteerNetwork);
        this.volunteers = network.volunteers || [...window.ApdaSeedData.volunteers];
        this.volunteerMobilizations = network.mobilizations || [];
      } catch (e) {
        this.volunteers = [...window.ApdaSeedData.volunteers];
      }
    } else {
      this.volunteers = [...window.ApdaSeedData.volunteers];
    }

    const savedKit = localStorage.getItem('apdasetu_kit_checked');
    if (savedKit) {
      try {
        this.checkedKitItems = new Set(JSON.parse(savedKit));
      } catch (e) {}
    }
  },

  saveRequests() {
    localStorage.setItem('apdasetu_requests', JSON.stringify(this.requests));
  },

  // [volunteer done] BroadcastChannel with storage-event fallback for instant demo synchronization.
  initVolunteerNetwork() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.volunteerSyncChannel = new BroadcastChannel('apda_sync');
      this.volunteerSyncChannel.onmessage = (event) => this.receiveVolunteerNetwork(event.data);
    }
    window.addEventListener('storage', (event) => {
      if (event.key === 'apdasetu_volunteer_network' && event.newValue) {
        try { this.receiveVolunteerNetwork(JSON.parse(event.newValue), true); } catch (e) {}
      }
    });
    this.volunteerTimer = setInterval(() => this.checkVolunteerTimeouts(), 1000);
  },

  // [volunteer done] Persist a compact network snapshot and notify every open application tab.
  syncVolunteerNetwork() {
    const payload = { type: 'volunteer-network', updatedAt: Date.now(), volunteers: this.volunteers, mobilizations: this.volunteerMobilizations };
    localStorage.setItem('apdasetu_volunteer_network', JSON.stringify(payload));
    if (this.volunteerSyncChannel) this.volunteerSyncChannel.postMessage(payload);
  },

  // [volunteer done] Accept only the shared volunteer domain; each tab retains its own logged-in persona.
  receiveVolunteerNetwork(payload, fromStorage = false) {
    if (!payload || payload.type !== 'volunteer-network') return;
    this.volunteers = payload.volunteers || this.volunteers;
    this.volunteerMobilizations = payload.mobilizations || this.volunteerMobilizations;
    this.emitChange();
  },

  // [volunteer done] Geographic matching uses Haversine distance and safely rejects incomplete locations.
  calculateDistanceKm(from, to) {
    if (!Array.isArray(from) || !Array.isArray(to) || from.length < 2 || to.length < 2) return null;
    const radians = (value) => value * Math.PI / 180;
    const earthRadiusKm = 6371;
    const dLat = radians(to[0] - from[0]);
    const dLng = radians(to[1] - from[1]);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from[0])) * Math.cos(radians(to[0])) * Math.sin(dLng / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  // [volunteer done] Severity-specific volunteer radius and decision window.
  getVolunteerRules(severity) {
    return ({ critical: { radiusKm: 5, windowMinutes: 5 }, high: { radiusKm: 6, windowMinutes: 7 }, medium: { radiusKm: 10, windowMinutes: 10 } })[String(severity).toLowerCase()] || { radiusKm: 10, windowMinutes: 10 };
  },

  // [volunteer done] ETA is deliberately labelled as an estimate, based on local response travel assumptions.
  estimateVolunteerEta(distanceKm) {
    return Math.max(3, Math.ceil((distanceKm || 0) / 0.47));
  },

  // [volunteer done] Commander creates one targeted request per incident; only verified, available volunteers qualify.
  mobilizeNearbyVolunteers(requestId, options = {}) {
    const request = this.requests.find(r => r.id === requestId);
    if (!request || !request.coordinates) {
      this.notify('Volunteer mobilization needs a valid incident location.', 'warning');
      return;
    }
    const existing = this.volunteerMobilizations.find(m => m.requestId === requestId && !['completed', 'escalated'].includes(m.status));
    if (existing) {
      this.notify(`Volunteer mobilization is already active for ${requestId}.`, 'info');
      return;
    }
    const rules = this.getVolunteerRules(request.severity);
    const targets = this.volunteers.filter(v => v.verified && v.availability === 'available').map(v => {
      const distanceKm = this.calculateDistanceKm(v.coordinates, request.coordinates);
      return distanceKm !== null && distanceKm <= rules.radiusKm ? { volunteerId: v.id, distanceKm: Number(distanceKm.toFixed(1)), etaMinutes: this.estimateVolunteerEta(distanceKm), status: 'notified' } : null;
    }).filter(Boolean);
    const now = Date.now();
    const mobilization = { id: `MOB-${now}`, requestId, severity: request.severity, incidentAddress: request.address, incidentCoordinates: request.coordinates, disasterType: request.disasterType, createdAt: now, expiresAt: now + rules.windowMinutes * 60000, rules, targets, status: 'notified', escalated: false, groundConfirmedBy: null, isScramble: Boolean(options.scramble) }; // [volunteer done] Flag drives the emergency scramble presentation and siren.
    this.volunteerMobilizations.unshift(mobilization);
    request.timeline.unshift({ time: 'Just now', status: 'Volunteer Mobilization', note: `${targets.length} verified nearby volunteer(s) notified within ${rules.radiusKm} km.` });
    this.saveRequests();
    this.syncVolunteerNetwork();
    this.notify(`${targets.length} eligible verified volunteer(s) ${options.scramble ? 'SCRAMBLED' : 'mobilized'} for ${requestId}.`, targets.length ? 'success' : 'warning'); // [volunteer done] Distinguish the emergency action in command feedback.
    this.emitChange();
  },

  // [volunteer done] Scramble reuses the matching, sync, countdown, and escalation pipeline.
  scrambleNearbyVolunteers(requestId) {
    this.mobilizeNearbyVolunteers(requestId, { scramble: true });
  },

  // [volunteer done] Volunteer availability controls whether the person can receive future alerts.
  setVolunteerAvailability(volunteerId, availability) {
    const volunteer = this.volunteers.find(v => v.id === volunteerId);
    if (!volunteer) return;
    volunteer.availability = availability;
    this.syncVolunteerNetwork();
    this.notify(`Volunteer status set to ${availability === 'available' ? 'AVAILABLE' : 'OFFLINE'}.`, 'info');
    this.emitChange();
  },

  // [volunteer done] Status workflow is shared with commanders immediately, including verified ground confirmation.
  updateVolunteerTask(mobilizationId, volunteerId, status) {
    const mobilization = this.volunteerMobilizations.find(m => m.id === mobilizationId);
    const target = mobilization && mobilization.targets.find(t => t.volunteerId === volunteerId);
    const volunteer = this.volunteers.find(v => v.id === volunteerId);
    if (!mobilization || !target || !volunteer) return;
    // [volunteer done] The local recipient's siren ends on accept or decline without changing other volunteers' alerts.
    if (mobilization.isScramble && ['accepted', 'declined'].includes(status) && this.currentUser?.id === volunteerId && window.ApdaSoundEngine) window.ApdaSoundEngine.stopEmergencySiren();
    target.status = status;
    target.updatedAt = Date.now();
    if (status === 'accepted') target.acceptedAt = target.updatedAt;
    if (status === 'on_site') {
      mobilization.groundConfirmedBy = { id: volunteer.id, name: volunteer.name, verified: true, at: target.updatedAt };
      mobilization.status = 'ground_confirmed';
    }
    if (status === 'completed') {
      volunteer.completedTasks += 1;
      volunteer.peopleAssisted += 1;
      volunteer.responseHistory.unshift(`Completed ${mobilization.severity} assistance · ${mobilization.incidentAddress}`);
      mobilization.status = mobilization.targets.some(t => !['completed', 'declined'].includes(t.status)) ? mobilization.status : 'completed';
    }
    const request = this.requests.find(r => r.id === mobilization.requestId);
    if (request && status === 'on_site') request.timeline.unshift({ time: 'Just now', status: 'Ground Confirmed', note: `Verified volunteer ${volunteer.name} confirmed arrival on site.` });
    this.saveRequests();
    this.syncVolunteerNetwork();
    this.notify(status === 'on_site' ? `GROUND CONFIRMED by verified volunteer ${volunteer.name}.` : `${volunteer.name}: ${status.replace('_', ' ').toUpperCase()}`, status === 'on_site' ? 'success' : 'info');
    this.emitChange();
  },

  // [volunteer done] A non-guaranteed ETA breach informs command without labelling the volunteer a failure.
  checkVolunteerEta(mobilization, target) {
    if (!target.acceptedAt || !['accepted', 'on_the_way'].includes(target.status) || target.etaExceeded) return;
    if (Date.now() > target.acceptedAt + target.etaMinutes * 60000) {
      target.etaExceeded = true;
      this.syncVolunteerNetwork();
      this.notify(`ETA EXCEEDED: ${this.volunteers.find(v => v.id === target.volunteerId)?.name || 'Volunteer'} has not arrived yet.`, 'warning');
    }
  },

  // [volunteer done] Timeout escalates exactly once through the existing dispatchTeam path.
  checkVolunteerTimeouts() {
    this.volunteerMobilizations.forEach(mobilization => {
      mobilization.targets.forEach(target => this.checkVolunteerEta(mobilization, target));
      if (Date.now() >= mobilization.expiresAt && !mobilization.groundConfirmedBy && !mobilization.escalated) this.autoEscalateVolunteerMobilization(mobilization.id);
    });
    // [volunteer done] Refresh active volunteer cards so the urgency countdown visibly advances.
    if (this.volunteerMobilizations.some(m => !m.escalated && !m.groundConfirmedBy && Date.now() < m.expiresAt)) this.emitChange();
  },

  // [volunteer done] localStorage lock suppresses duplicate automatic dispatch across racing browser tabs.
  autoEscalateVolunteerMobilization(mobilizationId) {
    const mobilization = this.volunteerMobilizations.find(m => m.id === mobilizationId);
    if (!mobilization || mobilization.escalated || mobilization.groundConfirmedBy) return;
    const lockKey = `apdasetu_volunteer_escalation_${mobilizationId}`;
    if (localStorage.getItem(lockKey)) return;
    localStorage.setItem(lockKey, String(Date.now()));
    mobilization.escalated = true;
    mobilization.status = 'escalated';
    // [volunteer done] Stop the recipient's repeating siren when its scramble window expires.
    if (mobilization.isScramble && this.currentUser && mobilization.targets.some(target => target.volunteerId === this.currentUser.id)) window.ApdaSoundEngine?.stopEmergencySiren();
    const request = this.requests.find(r => r.id === mobilization.requestId);
    if (request) {
      request.timeline.unshift({ time: 'Just now', status: 'Volunteer Response Timeout', note: 'Professional response automatically escalated after the volunteer response window.' });
      const availableUnit = this.rescueUnits.find(unit => unit.status === 'Available');
      if (availableUnit && request.status !== 'Dispatched') this.dispatchTeam(request.id, availableUnit.id, 'AUTO-ESCALATE: volunteer response window expired.');
      else this.saveRequests();
    }
    this.syncVolunteerNetwork();
    this.notify('VOLUNTEER RESPONSE TIMEOUT — Professional response automatically escalated.', 'warning');
    this.emitChange();
  },

  subscribe(fn) {
    this.subscribers.push(fn);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== fn);
    };
  },

  emitChange() {
    this.subscribers.forEach(fn => {
      try { fn(this); } catch (e) { console.error('State subscriber error:', e); }
    });
  },

  // Auth Operations
  login(userObj) {
    this.currentUser = userObj;
    localStorage.setItem('apdasetu_user', JSON.stringify(userObj));
    if (userObj.role === 'responder') {
      this.currentView = 'responder';
    } else if (userObj.role === 'volunteer') { // [volunteer done] Dedicated volunteer destination
      this.currentView = 'volunteer';
    } else {
      this.currentView = 'citizen';
    }
    // [volunteer done] Keep the role label accurate for the volunteer demo account.
    this.notify(`Logged in as ${userObj.name} (${userObj.role === 'responder' ? 'Responder/Command' : userObj.role === 'volunteer' ? 'Verified Volunteer' : 'Citizen'})`, 'success');
    this.emitChange();
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('apdasetu_user');
    this.currentView = 'home';
    this.notify('Logged out successfully', 'info');
    this.emitChange();
  },

  setView(viewName) {
    if (viewName === 'home' && this.currentUser) {
      this.currentView = this.currentUser.role === 'responder' ? 'responder' : this.currentUser.role === 'volunteer' ? 'volunteer' : 'citizen'; // [volunteer done] Restore the correct dashboard
      this.emitChange();
      return;
    }
    if (viewName === 'citizen' && (!this.currentUser || this.currentUser.role !== 'citizen')) {
      window.ApdaAuthModal.open('citizen', 'login');
      return;
    }
    if (viewName === 'responder' && (!this.currentUser || this.currentUser.role !== 'responder')) {
      window.ApdaAuthModal.open('responder', 'login');
      return;
    }
    // [volunteer done] Guard the volunteer dashboard with its dedicated role.
    if (viewName === 'volunteer' && (!this.currentUser || this.currentUser.role !== 'volunteer')) {
      window.ApdaAuthModal.open('volunteer', 'login');
      return;
    }
    this.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.emitChange();
  },

  setCitizenTab(tabName) {
    this.citizenTab = tabName;
    this.emitChange();
  },

  setResponderTab(tabName) {
    this.responderTab = tabName;
    this.emitChange();
  },

  // [volunteer done] Volunteer dashboard navigation state.
  setVolunteerTab(tabName) {
    this.volunteerTab = tabName;
    this.emitChange();
  },

  setActiveChatRoom(roomId) {
    this.activeChatRoomId = roomId;
    this.emitChange();
  },

  // Emergency SOS Submission
  addEmergencyRequest(formData) {
    const aiEvaluation = window.ApdaAIEngine.evaluateReport(formData, this.requests);
    
    const newId = 'REQ-2026-' + String(this.requests.length + 1).padStart(3, '0');
    const newRequest = {
      id: newId,
      userId: this.currentUser ? this.currentUser.id : 'USR-ANON-' + Math.floor(Math.random() * 1000),
      userName: formData.userName || (this.currentUser ? this.currentUser.name : 'Anonymous Citizen'),
      userPhone: formData.userPhone || (this.currentUser ? this.currentUser.phone : '+91 98765 00000'),
      disasterType: formData.disasterType || 'flood',
      severity: formData.severity || 'high',
      coordinates: formData.coordinates || [26.1445, 91.7362],
      address: formData.address || 'Guwahati Flood Sector 4',
      peopleAffected: parseInt(formData.peopleAffected) || 1,
      vulnerable: formData.vulnerable || { infants: 0, elderly: 0, injured: 0 },
      description: formData.description || 'Emergency SOS assistance required immediately.',
      media: formData.media || [],
      aiScore: aiEvaluation,
      status: 'Submitted',
      assignedTeam: null,
      submittedAt: 'Just now',
      timeline: [
        { time: 'Just now', status: 'Submitted', note: 'SOS Distress Signal broadcast to NDRF & State Command' },
        { time: 'Just now', status: 'Verification', note: 'Report verified and shared with emergency command.' }
      ]
    };

    this.requests.unshift(newRequest);
    this.saveRequests();

    // Trigger audio chime & multi-channel stub
    if (window.ApdaSoundEngine) {
      window.ApdaSoundEngine.playChime('sos');
    }

    this.showMultiChannelAlertStub(newRequest);
    this.notify(`SOS transmitted! ID: ${newId}. AI Risk Score: ${aiEvaluation.riskScore}/100`, 'critical');
    this.emitChange();
    return newRequest;
  },

  // Responder Actions
  verifyRequest(requestId, approved = true, notes = '') {
    const req = this.requests.find(r => r.id === requestId);
    if (req) {
      req.status = approved ? 'Verified' : 'Rejected';
      req.timeline.unshift({
        time: 'Just now',
        status: req.status,
        note: notes || (approved ? 'Verified by Command Desk Officer' : 'Marked duplicate / invalid by officer')
      });
      this.saveRequests();
      this.notify(`Request ${requestId} ${approved ? 'VERIFIED & queued for dispatch' : 'REJECTED'}`, approved ? 'success' : 'warning');
      this.emitChange();
    }
  },

  dispatchTeam(requestId, unitId, customNotes = '') {
    const req = this.requests.find(r => r.id === requestId);
    const unit = this.rescueUnits.find(u => u.id === unitId);

    if (req && unit) {
      unit.status = 'Deployed';
      unit.assignedTo = requestId;

      req.status = 'Dispatched';
      req.assignedTeam = {
        id: unit.id,
        name: unit.name,
        leader: unit.leader,
        phone: unit.phone,
        vehicle: unit.type,
        equipment: unit.equipment,
        currentLocation: unit.coordinates,
        etaMinutes: 10,
        dispatchedAt: 'Just now'
      };

      req.timeline.unshift({
        time: 'Just now',
        status: 'Dispatched',
        note: `Dispatched ${unit.name} (${unit.leader}). ETA ~10 mins. ${customNotes}`
      });

      this.saveRequests();
      this.notify(`Unit ${unit.name} successfully DISPATCHED to Incident ${requestId}!`, 'success');
      if (window.ApdaSoundEngine) {
        window.ApdaSoundEngine.playChime('success');
      }
      this.emitChange();
    }
  },

  updateRequestStatus(requestId, newStatus, note = '') {
    const req = this.requests.find(r => r.id === requestId);
    if (req) {
      req.status = newStatus;
      req.timeline.unshift({
        time: 'Just now',
        status: newStatus,
        note: note || `Status updated to ${newStatus}`
      });

      if (newStatus === 'Resolved' && req.assignedTeam) {
        const unit = this.rescueUnits.find(u => u.id === req.assignedTeam.id);
        if (unit) {
          unit.status = 'Available';
          unit.assignedTo = null;
        }
      }

      this.saveRequests();
      this.notify(`Incident ${requestId} status updated: ${newStatus}`, 'info');
      this.emitChange();
    }
  },

  // Family Check-In Actions
  markSelfSafe(locationText = 'Kamrup Metro Safe Zone') {
    if (this.currentUser) {
      this.currentUser.isSafe = true;
      this.currentUser.safeTimestamp = new Date().toLocaleTimeString();
    }
    
    // Also add to family members
    const myEntry = this.familyMembers.find(f => f.relation === 'Self' || f.name.includes('Priya'));
    if (myEntry) {
      myEntry.status = 'Safe';
      myEntry.lastPingTime = 'Just now';
      myEntry.lastLocation = locationText;
    }

    this.notify('Broadcasting "I AM SAFE" signal to family circle & emergency network', 'success');
    if (window.ApdaSoundEngine) {
      window.ApdaSoundEngine.playChime('success');
    }
    this.emitChange();
  },

  pingFamilyMember(memberId) {
    const member = this.familyMembers.find(m => m.id === memberId);
    if (member) {
      this.notify(`Ping sent to ${member.name} (${member.phone}). An SMS request for check-in was triggered.`, 'info');
    }
  },

  addFamilyMember(member) {
    member.id = 'FAM-' + (this.familyMembers.length + 1);
    member.status = 'Pending Check-in';
    member.lastPingTime = 'Invited just now';
    member.battery = 'Unknown';
    this.familyMembers.push(member);
    this.notify(`Added ${member.name} to Family Safety Circle`, 'success');
    this.emitChange();
  },

  // Community Chat Actions
  sendChatMessage(roomId, text, tag = 'General Aid') {
    const room = this.chatRooms.find(r => r.id === roomId);
    if (!room || !text.trim()) return;

    const user = this.currentUser || { name: 'Priya Sharma (Citizen)', role: 'citizen' };
    const newMsg = {
      id: 'MSG-' + Date.now(),
      sender: user.name,
      senderRole: user.role,
      avatar: user.role === 'responder' ? '🚒' : '👨',
      tag: tag,
      text: text.trim(),
      time: 'Just now',
      upvotes: 0,
      isModerated: false,
      isOfficial: user.role === 'responder'
    };

    room.messages.push(newMsg);
    this.emitChange();

    // Trigger realistic simulated reply after 3 seconds if not responder
    if (user.role !== 'responder') {
      setTimeout(() => {
        this.simulateCommunityResponse(room, tag, text);
      }, 3500);
    }
  },

  simulateCommunityResponse(room, tag, originalText) {
    const simulatedReplies = [
      { sender: 'NDRF Regional Helpline', role: 'responder', avatar: '🚒', text: 'Received your query. Rescue boats are actively operating in that grid. Keep your phone charged.' },
      { sender: 'Red Cross Guwahati Cell', role: 'volunteer', avatar: '🦺', text: 'We have dispatched dry ration pouches to the nearby shelter. Please check the Shelter Map tab.' },
      { sender: 'Local Volunteer Anand', role: 'volunteer', avatar: '🤝', text: 'Noted! I am coordinating with local youth for boat transport. Stay at high ground.' }
    ];
    const reply = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
    room.messages.push({
      id: 'MSG-' + Date.now(),
      sender: reply.sender,
      senderRole: reply.role,
      avatar: reply.avatar,
      tag: 'Volunteer Response',
      text: reply.text,
      time: 'Just now',
      upvotes: 2,
      isModerated: false,
      isOfficial: reply.role === 'responder'
    });
    this.notify(`New message in ${room.name}: from ${reply.sender}`, 'info');
    this.emitChange();
  },

  flagMessage(roomId, msgId) {
    const room = this.chatRooms.find(r => r.id === roomId);
    if (room) {
      const msg = room.messages.find(m => m.id === msgId);
      if (msg) {
        msg.isModerated = true;
        this.notify('Message flagged for volunteer / admin moderation review.', 'warning');
        this.emitChange();
      }
    }
  },

  // Emergency Kit Checklist
  toggleKitItem(itemId) {
    if (this.checkedKitItems.has(itemId)) {
      this.checkedKitItems.delete(itemId);
    } else {
      this.checkedKitItems.add(itemId);
    }
    localStorage.setItem('apdasetu_kit_checked', JSON.stringify([...this.checkedKitItems]));
    this.emitChange();
  },

  // Notifications and Toasts
  notify(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    const bgColors = {
      critical: 'bg-red-600 border-red-400 text-white shadow-red-500/50',
      success: 'bg-emerald-700 border-emerald-400 text-white shadow-emerald-500/30',
      warning: 'bg-amber-600 border-amber-300 text-white shadow-amber-500/30',
      info: 'bg-slate-800 border-slate-600 text-slate-100 shadow-black/40'
    };

    const icons = {
      critical: '🚨',
      success: '✅',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-lg transform transition-all duration-300 mb-2.5 max-w-md pointer-events-auto modal-animate-in ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
      <span class="text-xl flex-shrink-0">${icons[type] || '🔔'}</span>
      <div class="flex-1 text-sm font-medium leading-tight">${message}</div>
      <button onclick="this.parentElement.remove()" class="text-white/70 hover:text-white text-lg font-bold ml-2">×</button>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  },

  showMultiChannelAlertStub(request) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm modal-animate-in';
    modal.id = 'multichannel-modal';
    modal.innerHTML = `
      <div class="glass-panel-danger w-full max-w-lg rounded-2xl p-6 text-white border-2 border-red-500 shadow-2xl relative">
        <div class="flex items-center justify-between pb-3 border-b border-red-500/30">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-lg bg-red-600/30 text-red-400 text-xl">📡</span>
            <div>
              <h3 class="font-bold text-lg text-red-400">Multi-Channel SOS Dispatched</h3>
              <p class="text-xs text-slate-300">Incident ID: ${request.id} • AI Risk: ${request.aiScore.riskScore}/100</p>
            </div>
          </div>
          <button onclick="document.getElementById('multichannel-modal').remove()" class="text-slate-400 hover:text-white text-2xl font-bold">×</button>
        </div>

        <div class="space-y-3 mt-4 text-sm">
          <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-emerald-500/30">
            <div class="flex items-center gap-2.5">
              <span class="text-emerald-400 font-bold">✓ Web Push Alert</span>
              <span class="text-xs text-slate-400">Sent to NDRF & State Command Center</span>
            </div>
            <span class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300">Delivered</span>
          </div>

          <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-emerald-500/30">
            <div class="flex items-center gap-2.5">
              <span class="text-emerald-400 font-bold">✓ SMS Broadcast (MSG91)</span>
              <span class="text-xs text-slate-400">Dispatched to 3 Emergency Contacts</span>
            </div>
            <span class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300">Sent</span>
          </div>

          <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-emerald-500/30">
            <div class="flex items-center gap-2.5">
              <span class="text-emerald-400 font-bold">✓ WhatsApp Emergency Ping</span>
              <span class="text-xs text-slate-400">Location GPS link shared with Family Circle</span>
            </div>
            <span class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300">Active</span>
          </div>

          <div class="hidden">
            <strong>🤖 AI Triage Summary:</strong> ${request.aiScore.aiNotes}
          </div>
        </div>

        <div class="mt-5 flex gap-3">
          <button onclick="document.getElementById('multichannel-modal').remove(); window.ApdaState.setCitizenTab('requests');" class="flex-1 py-2.5 bg-red-600 hover:bg-red-500 font-bold rounded-xl text-center text-sm transition-all shadow-lg shadow-red-600/40">
            Track Rescue Unit Status →
          </button>
          <button onclick="document.getElementById('multichannel-modal').remove()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // Live periodic simulation for demo
  startLiveSimulation() {
    setInterval(() => {
      // Fluctuate ETA on dispatched requests
      let changed = false;
      this.requests.forEach(req => {
        if (req.status === 'Dispatched' && req.assignedTeam && req.assignedTeam.etaMinutes > 1) {
          req.assignedTeam.etaMinutes -= 1;
          changed = true;
        }
      });
      if (changed) {
        this.emitChange();
      }
    }, 45000);
  }
};
