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
    // Demo data may persist, but an authenticated persona must always be chosen
    // explicitly for each new application load.
    this.currentUser = null;
    this.currentView = 'home';
    localStorage.removeItem('apdasetu_user');

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
        if (Array.isArray(network.requests)) this.requests = network.requests;
      } catch (e) {
        this.volunteers = [...window.ApdaSeedData.volunteers];
      }
    } else {
      this.volunteers = [...window.ApdaSeedData.volunteers];
    }
    // [volunteer done] Safely upgrade persisted demo profiles and enforce an already-reached service limit.
    this.volunteers.forEach(volunteer => {
      if (typeof volunteer.activeServiceHours !== 'number') volunteer.activeServiceHours = 0;
      if (this.getVolunteerServiceInfo(volunteer).reached) volunteer.availability = 'offline';
    });

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
    const payload = { type: 'volunteer-network', updatedAt: Date.now(), volunteers: this.volunteers, mobilizations: this.volunteerMobilizations, requests: this.requests };
    localStorage.setItem('apdasetu_volunteer_network', JSON.stringify(payload));
    if (this.volunteerSyncChannel) this.volunteerSyncChannel.postMessage(payload);
  },

  // [volunteer done] Accept only the shared volunteer domain; each tab retains its own logged-in persona.
  receiveVolunteerNetwork(payload, fromStorage = false) {
    if (!payload || payload.type !== 'volunteer-network') return;
    this.volunteers = payload.volunteers || this.volunteers;
    this.volunteerMobilizations = payload.mobilizations || this.volunteerMobilizations;
    this.requests = Array.isArray(payload.requests) ? payload.requests : this.requests;
    this.saveRequests();
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

  // [volunteer done] Severity-specific volunteer radius and decision window (2-minute window per requirements).
  getVolunteerRules(severity) {
    const sev = String(severity || '').toLowerCase();
    const radiusKm = sev === 'critical' ? 5 : sev === 'high' ? 6 : 10;
    return { radiusKm, windowMinutes: 2, windowSeconds: 120 };
  },

  // [volunteer done] ETA is deliberately labelled as an estimate, based on local response travel assumptions.
  estimateVolunteerEta(distanceKm) {
    return Math.max(2, Math.ceil((distanceKm || 0) / 0.45));
  },

  // [volunteer done] A 12-hour shift cap protects availability while preserving total historical hours served.
  getVolunteerServiceInfo(volunteer) {
    const maxHours = 12;
    const liveHours = volunteer.activeServiceStartedAt ? (Date.now() - volunteer.activeServiceStartedAt) / 3600000 : 0;
    const usedHours = Math.min(maxHours, (Number(volunteer.activeServiceHours) || 0) + liveHours);
    const remainingHours = Math.max(0, maxHours - usedHours);
    return { maxHours, usedHours, remainingHours, percent: Math.min(100, Math.round((usedHours / maxHours) * 100)), reached: usedHours >= maxHours, warning: remainingHours <= 1 ? '1 HOUR REMAINING' : remainingHours <= 2 ? '2 HOURS REMAINING' : '' };
  },

  // [volunteer done] Base eligibility: verified, available, and within service limit.
  isVolunteerEligible(volunteer) {
    return Boolean(volunteer?.verified && volunteer.availability === 'available' && !this.getVolunteerServiceInfo(volunteer).reached);
  },

  // Disaster type & requirements to relevant skills mapping
  getRequiredSkillsForIncident(disasterType, description = '') {
    const text = String(description || '').toLowerCase();
    const type = String(disasterType || '').toLowerCase();
    const skills = new Set();

    if (type === 'flood' || text.includes('water') || text.includes('drown') || text.includes('boat')) {
      skills.add('Boat handling');
      skills.add('Water rescue');
      skills.add('First aid');
      skills.add('Elderly evacuation');
    }
    if (type === 'cyclone' || text.includes('wind') || text.includes('roof')) {
      skills.add('Water rescue');
      skills.add('Radio coordination');
      skills.add('First aid');
      skills.add('Elderly evacuation');
    }
    if (type === 'landslide' || type === 'earthquake' || text.includes('boulder') || text.includes('debris') || text.includes('collapse')) {
      skills.add('Rope rescue');
      skills.add('Terrain navigation');
      skills.add('First aid');
    }
    if (type === 'forest_fire' || text.includes('fire') || text.includes('smoke')) {
      skills.add('Terrain navigation');
      skills.add('First aid');
      skills.add('Elderly evacuation');
    }
    if (text.includes('injur') || text.includes('cut') || text.includes('bleed') || text.includes('infant') || text.includes('elderly') || text.includes('medicine')) {
      skills.add('First aid');
      skills.add('Triage');
      skills.add('Child care');
      skills.add('Elderly evacuation');
    }
    return Array.from(skills);
  },

  // Incident-specific volunteer eligibility check
  isVolunteerEligibleForIncident(volunteer, request) {
    if (!this.isVolunteerEligible(volunteer)) return false;
    if (!request || !request.coordinates || !volunteer.coordinates) return false;

    const rules = this.getVolunteerRules(request.severity);
    const distanceKm = this.calculateDistanceKm(volunteer.coordinates, request.coordinates);
    if (distanceKm === null || distanceKm > rules.radiusKm) return false;

    const requiredSkills = this.getRequiredSkillsForIncident(request.disasterType, request.description);
    if (requiredSkills.length > 0 && Array.isArray(volunteer.skills)) {
      const hasMatchingSkill = volunteer.skills.some(skill =>
        requiredSkills.some(reqSkill =>
          reqSkill.toLowerCase() === skill.toLowerCase() ||
          skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
          reqSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasMatchingSkill) return false;
    }
    return true;
  },

  // Returns actual eligible volunteers for an incident with exact calculated distances
  getEligibleVolunteersForIncident(request) {
    if (!request || !request.coordinates) return [];
    return this.volunteers
      .filter(v => this.isVolunteerEligibleForIncident(v, request))
      .map(v => {
        const dist = this.calculateDistanceKm(v.coordinates, request.coordinates);
        return {
          volunteer: v,
          volunteerId: v.id,
          distanceKm: Number((dist || 0).toFixed(1)),
          etaMinutes: this.estimateVolunteerEta(dist)
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  },

  // Incident Lifecycle & Active Status Helpers
  isIncidentActive(request) {
    if (!request) return false;
    const status = String(request.status || '').toLowerCase();
    return !['resolved', 'closed', 'rejected'].includes(status);
  },

  // Returns all active incidents sorted by priority
  getActiveRequests() {
    return this.requests
      .filter(r => this.isIncidentActive(r))
      .sort((a, b) => {
        const aRisk = Number(a.aiScore?.riskScore) || 0;
        const bRisk = Number(b.aiScore?.riskScore) || 0;
        const aCrit = a.severity === 'critical' ? 200 : 0;
        const bCrit = b.severity === 'critical' ? 200 : 0;
        const aGC = a.groundConfirmedBy ? 50 : 0;
        const bGC = b.groundConfirmedBy ? 50 : 0;
        const aPeople = (Number(a.peopleAffected) || 1) * 2;
        const bPeople = (Number(b.peopleAffected) || 1) * 2;
        return (bCrit + bRisk + bGC + bPeople) - (aCrit + aRisk + aGC + aPeople);
      });
  },

  // Returns resolved & closed historical incidents
  getResolvedRequests() {
    return this.requests.filter(r => ['resolved', 'closed'].includes(String(r.status || '').toLowerCase()));
  },

  // Get tailored multi-agency response options for an incident
  getIncidentResponseOptions(request) {
    if (!request || !this.isIncidentActive(request)) return [];
    const text = String(request.description || '').toLowerCase();
    const type = String(request.disasterType || '').toLowerCase();
    const eligibleVolunteers = this.getEligibleVolunteersForIncident(request);
    const rules = this.getVolunteerRules(request.severity);
    const options = [];

    // 1. Nearby Verified Volunteers Option
    options.push({
      id: 'opt-volunteers',
      category: 'volunteers',
      title: 'Nearby Verified Volunteers',
      icon: '🦺',
      badge: eligibleVolunteers.length ? `${eligibleVolunteers.length} Available` : '0 Nearby',
      badgeType: eligibleVolunteers.length ? 'success' : 'warning',
      description: eligibleVolunteers.length
        ? `${eligibleVolunteers.length} verified volunteer(s) within ${rules.radiusKm} km radius with needed skills.`
        : `0 eligible verified volunteers within ${rules.radiusKm} km response radius. Escalation available.`,
      volunteers: eligibleVolunteers,
      actionLabel: eligibleVolunteers.length ? `🚨 Scramble Volunteers (${eligibleVolunteers.length})` : '🚨 Scramble Volunteers',
      actionType: 'volunteer_scramble'
    });

    // 2. Medical / Trauma Response Option
    const hasMedicalNeed = Boolean(
      (request.vulnerable && (request.vulnerable.injured > 0 || request.vulnerable.elderly > 0 || request.vulnerable.infants > 0)) ||
      text.includes('injur') || text.includes('cut') || text.includes('bleed') || text.includes('asthma') || text.includes('medicine') || text.includes('cardiac')
    );
    const medUnit = this.rescueUnits.find(u => u.agency === 'Medical' && u.status === 'Available') || this.rescueUnits.find(u => u.agency === 'Medical');
    if (hasMedicalNeed || type === 'medical' || request.severity === 'critical') {
      options.push({
        id: 'opt-medical',
        category: 'medical',
        title: 'Emergency Medical & Trauma Ambulance',
        icon: '🚑',
        badge: medUnit ? medUnit.status : 'On Standby',
        badgeType: medUnit?.status === 'Available' ? 'success' : 'warning',
        description: medUnit ? `${medUnit.name} (${medUnit.leader}) • ALS Defibrillator & ICU gear` : '108 Advanced Life Support Trauma Unit',
        unit: medUnit,
        actionLabel: medUnit?.status === 'Available' ? 'Deploy Medical Team' : 'Medical Unit Assigned',
        actionType: 'deploy_unit',
        unitId: medUnit?.id
      });
    }

    // 3. Search & Rescue / Raft / Boat Unit Option
    const isWater = type === 'flood' || type === 'cyclone' || text.includes('water') || text.includes('drown') || text.includes('boat') || text.includes('roof');
    const isMountain = type === 'landslide' || type === 'earthquake' || text.includes('boulder') || text.includes('debris') || text.includes('collapse');
    
    if (isWater) {
      const raftUnit = this.rescueUnits.find(u => (u.type.includes('Boat') || u.type.includes('Water') || u.id === 'TEAM-NDRF-04' || u.id === 'TEAM-ODRAF-01') && u.status === 'Available') || this.rescueUnits.find(u => u.type.includes('Boat'));
      options.push({
        id: 'opt-rescue-raft',
        category: 'rescue',
        title: 'NDRF / SDRF Inflatable Powerboat Unit',
        icon: '🚤',
        badge: raftUnit ? raftUnit.status : 'Standby',
        badgeType: raftUnit?.status === 'Available' ? 'success' : 'warning',
        description: raftUnit ? `${raftUnit.name} • Gemini Inflatable Boats & Life Jackets` : 'High-capacity watercraft rescue unit',
        unit: raftUnit,
        actionLabel: raftUnit?.status === 'Available' ? 'Deploy Raft Unit' : 'Unit Assigned',
        actionType: 'deploy_unit',
        unitId: raftUnit?.id
      });
    }

    if (isMountain) {
      const heavyUnit = this.rescueUnits.find(u => (u.type.includes('Search') || u.type.includes('Mountain') || u.id === 'TEAM-SDRF-03' || u.id === 'TEAM-NDRF-08') && u.status === 'Available') || this.rescueUnits.find(u => u.type.includes('Search'));
      options.push({
        id: 'opt-rescue-heavy',
        category: 'rescue',
        title: 'SDRF / NDRF Mountain & Heavy USAR Unit',
        icon: '🧗',
        badge: heavyUnit ? heavyUnit.status : 'Standby',
        badgeType: heavyUnit?.status === 'Available' ? 'success' : 'warning',
        description: heavyUnit ? `${heavyUnit.name} • Rope Rigging & Hydraulic Life Detectors` : 'Mountain rescue & debris search squad',
        unit: heavyUnit,
        actionLabel: heavyUnit?.status === 'Available' ? 'Deploy USAR Unit' : 'Unit Assigned',
        actionType: 'deploy_unit',
        unitId: heavyUnit?.id
      });
    }

    // 4. Fire & Emergency Unit Option
    const isFire = type === 'forest_fire' || text.includes('fire') || text.includes('smoke') || text.includes('burn') || text.includes('spark');
    if (isFire) {
      const fireUnit = this.rescueUnits.find(u => (u.agency === 'Fire Brigade' || u.id === 'TEAM-FIRE-01' || u.id === 'TEAM-FIRE-02') && u.status === 'Available') || this.rescueUnits.find(u => u.agency === 'Fire Brigade');
      options.push({
        id: 'opt-fire',
        category: 'fire',
        title: 'Fire & Wildfire Emergency Tender',
        icon: '🚒',
        badge: fireUnit ? fireUnit.status : 'Standby',
        badgeType: fireUnit?.status === 'Available' ? 'success' : 'warning',
        description: fireUnit ? `${fireUnit.name} • Water Cannons & Smoke Respirators` : 'State Fire & Rescue Tender',
        unit: fireUnit,
        actionLabel: fireUnit?.status === 'Available' ? 'Deploy Fire Tender' : 'Unit Assigned',
        actionType: 'deploy_unit',
        unitId: fireUnit?.id
      });
    }

    // 5. Evacuation & Relief Support Option
    const evacUnit = this.rescueUnits.find(u => u.id === 'TEAM-CIVIL-09' || u.agency === 'NGO / Red Cross' || u.id === 'TEAM-AIR-01') || this.rescueUnits[0];
    options.push({
      id: 'opt-evac',
      category: 'evacuation',
      title: 'Evacuation & Relief Pouch Support',
      icon: '🛟',
      badge: evacUnit?.status || 'Available',
      badgeType: 'info',
      description: 'Civil Defense & Red Cross dry ration, potable water & safe shelter transit.',
      unit: evacUnit,
      actionLabel: 'Deploy Evacuation Unit',
      actionType: 'deploy_unit',
      unitId: evacUnit?.id
    });

    return options;
  },

  // Ground volunteer confirmation: triggers immediate response coordination & starts 2-min window
  confirmGroundArrival(requestId, volunteerId) {
    const request = this.requests.find(r => r.id === requestId);
    const volunteer = this.volunteers.find(v => v.id === volunteerId) || this.volunteers[0];
    if (!request) return;

    request.status = 'Ground Confirmed';
    request.groundConfirmedBy = {
      id: volunteer.id,
      name: volunteer.name,
      phone: volunteer.phone,
      verified: true,
      at: 'Just now',
      timestamp: Date.now()
    };

    request.timeline.unshift({
      time: 'Just now',
      status: 'Ground Confirmed',
      note: `Verified volunteer ${volunteer.name} arrived on site and confirmed emergency situation.`
    });

    // Start 2-minute volunteer response window for this incident
    this.mobilizeNearbyVolunteers(requestId, { scramble: true });

    this.saveRequests();
    this.syncVolunteerNetwork();
    this.notify(`GROUND CONFIRMED by verified volunteer ${volunteer.name}. Response coordination active.`, 'success');
    if (window.ApdaSoundEngine) window.ApdaSoundEngine.playChime('sos');
    this.emitChange();
  },

  // Assign a verified volunteer directly as the responder
  assignVolunteer(requestId, volunteerId, customNote = '') {
    const request = this.requests.find(r => r.id === requestId);
    const volunteer = this.volunteers.find(v => v.id === volunteerId);
    if (!request || !volunteer) return;

    const dist = request.coordinates ? this.calculateDistanceKm(volunteer.coordinates, request.coordinates) : 1.0;
    const eta = this.estimateVolunteerEta(dist);

    request.status = 'Volunteer Assigned';
    request.assignedResponder = {
      id: volunteer.id,
      name: volunteer.name,
      phone: volunteer.phone,
      skills: volunteer.skills,
      distanceKm: dist ? Number(dist.toFixed(1)) : 1.0,
      etaMinutes: eta,
      assignedAt: 'Just now'
    };

    request.timeline.unshift({
      time: 'Just now',
      status: 'Volunteer Assigned',
      note: customNote || `Verified volunteer ${volunteer.name} accepted task (${volunteer.skills.join(', ')}). ETA ~${eta} mins.`
    });

    // Mark active mobilization as accepted/in_progress, stopping countdown
    const mobilization = this.volunteerMobilizations.find(m => m.requestId === requestId);
    if (mobilization) {
      mobilization.status = 'volunteer_assigned';
      const target = mobilization.targets.find(t => t.volunteerId === volunteerId);
      if (target) target.status = 'accepted';
    }

    if (this.currentUser && this.currentUser.id === volunteerId && window.ApdaSoundEngine) {
      window.ApdaSoundEngine.stopEmergencySiren();
    }

    this.saveRequests();
    this.syncVolunteerNetwork();
    this.notify(`Volunteer ${volunteer.name} ASSIGNED to Incident ${requestId}!`, 'success');
    if (window.ApdaSoundEngine) window.ApdaSoundEngine.playChime('success');
    this.emitChange();
  },

  // Mobilize nearby verified volunteers for an incident (2-minute window)
  mobilizeNearbyVolunteers(requestId, options = {}) {
    const request = this.requests.find(r => r.id === requestId);
    if (!request || !request.coordinates) {
      this.notify('Volunteer mobilization needs a valid incident location.', 'warning');
      return;
    }
    const existing = this.volunteerMobilizations.find(m => m.requestId === requestId && !['completed', 'escalated', 'resolved'].includes(m.status));
    if (existing) {
      if (options.scramble && !existing.isScramble) {
        existing.isScramble = true;
        this.syncVolunteerNetwork();
        this.notify(`Volunteers scrambled for ${requestId}!`, 'success');
        this.emitChange();
      }
      return;
    }

    const rules = this.getVolunteerRules(request.severity);
    const eligibleMatches = this.getEligibleVolunteersForIncident(request);
    const targets = eligibleMatches.map(m => ({
      volunteerId: m.volunteer.id,
      distanceKm: m.distanceKm,
      etaMinutes: m.etaMinutes,
      status: 'notified'
    }));

    const now = Date.now();
    // 2-minute volunteer response window (120 seconds)
    const mobilization = {
      id: `MOB-${now}`,
      requestId,
      severity: request.severity,
      incidentAddress: request.address,
      incidentCoordinates: request.coordinates,
      disasterType: request.disasterType,
      createdAt: now,
      expiresAt: now + (rules.windowSeconds || 120) * 1000,
      rules,
      targets,
      status: targets.length ? 'notified' : 'escalated',
      escalated: targets.length === 0,
      groundConfirmedBy: request.groundConfirmedBy || null,
      isScramble: Boolean(options.scramble)
    };

    this.volunteerMobilizations.unshift(mobilization);
    request.timeline.unshift({
      time: 'Just now',
      status: 'Volunteer Mobilization',
      note: targets.length
        ? `${targets.length} verified nearby volunteer(s) notified within ${rules.radiusKm} km. 2-minute response window started.`
        : `0 eligible volunteers in ${rules.radiusKm} km. Escalated for emergency unit deployment.`
    });

    this.saveRequests();
    this.syncVolunteerNetwork();
    this.notify(
      targets.length
        ? `${targets.length} eligible verified volunteer(s) notified for ${requestId}.`
        : `0 eligible volunteers within ${rules.radiusKm} km for ${requestId}. Escalation ready.`,
      targets.length ? 'success' : 'warning'
    );
    this.emitChange();
  },

  // Scramble nearby volunteers
  scrambleNearbyVolunteers(requestId) {
    this.mobilizeNearbyVolunteers(requestId, { scramble: true });
  },

  // Close volunteer scramble
  resolveVolunteerScramble(mobilizationId) {
    const mobilization = this.volunteerMobilizations.find(item => item.id === mobilizationId);
    if (!mobilization || mobilization.status === 'resolved') return;
    mobilization.targets.forEach(target => {
      if (!['completed', 'declined'].includes(target.status)) target.status = 'resolved';
    });
    mobilization.status = 'resolved';
    mobilization.resolvedAt = Date.now();
    const request = this.requests.find(item => item.id === mobilization.requestId);
    if (request) {
      request.timeline.unshift({
        time: 'Just now',
        status: 'Scramble Resolved',
        note: 'Command Center closed the volunteer scramble.'
      });
      this.saveRequests();
    }
    if (this.currentUser && mobilization.targets.some(target => target.volunteerId === this.currentUser.id)) {
      window.ApdaSoundEngine?.stopEmergencySiren();
    }
    this.syncVolunteerNetwork();
    this.notify(`SCRAMBLE RESOLVED for ${mobilization.requestId}.`, 'success');
    this.emitChange();
  },

  // Set volunteer availability
  setVolunteerAvailability(volunteerId, availability) {
    const volunteer = this.volunteers.find(v => v.id === volunteerId);
    if (!volunteer) return;
    if (availability === 'available' && this.getVolunteerServiceInfo(volunteer).reached) {
      this.notify('MAXIMUM SERVICE LIMIT REACHED — volunteer remains OFFLINE.', 'warning');
      return;
    }
    volunteer.availability = availability;
    this.syncVolunteerNetwork();
    this.notify(`Volunteer status set to ${availability === 'available' ? 'AVAILABLE' : 'OFFLINE'}.`, 'info');
    this.emitChange();
  },

  // Status workflow update
  updateVolunteerTask(mobilizationId, volunteerId, status) {
    const mobilization = this.volunteerMobilizations.find(m => m.id === mobilizationId);
    const target = mobilization && mobilization.targets.find(t => t.volunteerId === volunteerId);
    const volunteer = this.volunteers.find(v => v.id === volunteerId);
    if (!mobilization || !target || !volunteer) return;

    if (mobilization.isScramble && ['accepted', 'declined'].includes(status) && this.currentUser?.id === volunteerId && window.ApdaSoundEngine) {
      window.ApdaSoundEngine.stopEmergencySiren();
    }
    target.status = status;
    target.updatedAt = Date.now();
    const req = this.requests.find(r => r.id === mobilization.requestId);
    const statusDetails = {
      accepted: ['Volunteer Responding', `Verified volunteer ${volunteer.name} accepted the request and is responding.`],
      on_the_way: ['Volunteer On The Way', `Verified volunteer ${volunteer.name} is on the way. ETA ~${target.etaMinutes || 5} mins.`],
      on_site: ['Volunteer Arrived', `Verified volunteer ${volunteer.name} arrived at the incident site.`],
      completed: ['Volunteer Assistance Completed', `Verified volunteer ${volunteer.name} completed assistance.`],
      declined: ['Volunteer Declined', `Verified volunteer ${volunteer.name} declined the request.`]
    };

    if (status === 'accepted') {
      target.acceptedAt = target.updatedAt;
      if (!volunteer.activeServiceStartedAt) volunteer.activeServiceStartedAt = target.updatedAt;
      if (req && this.isIncidentActive(req)) {
        req.status = 'Volunteer Responding';
        req.assignedResponder = {
          id: volunteer.id,
          name: volunteer.name,
          phone: volunteer.phone,
          skills: volunteer.skills,
          distanceKm: target.distanceKm,
          etaMinutes: target.etaMinutes || 5,
          volunteerStatus: status
        };
      }
    }
    if (status === 'on_the_way' && req && this.isIncidentActive(req)) {
      req.status = 'Volunteer On The Way';
      if (req.assignedResponder) req.assignedResponder.volunteerStatus = status;
    }
    if (status === 'on_site') {
      mobilization.groundConfirmedBy = { id: volunteer.id, name: volunteer.name, verified: true, at: target.updatedAt };
      mobilization.status = 'ground_confirmed';
      if (req) {
        req.status = 'Volunteer Arrived';
        req.groundConfirmedBy = { id: volunteer.id, name: volunteer.name, phone: volunteer.phone, verified: true, at: 'Just now' };
        if (req.assignedResponder) req.assignedResponder.volunteerStatus = status;
      }
    }
    if (status === 'completed') {
      const serviceInfo = this.getVolunteerServiceInfo(volunteer);
      const liveHours = volunteer.activeServiceStartedAt ? (Date.now() - volunteer.activeServiceStartedAt) / 3600000 : 0;
      volunteer.activeServiceHours = serviceInfo.usedHours;
      volunteer.hoursServed = Number((volunteer.hoursServed + liveHours).toFixed(1));
      volunteer.activeServiceStartedAt = null;
      volunteer.completedTasks += 1;
      volunteer.peopleAssisted += 1;
      volunteer.responseHistory.unshift(`Completed ${mobilization.severity} assistance · ${mobilization.incidentAddress}`);
      mobilization.status = mobilization.targets.some(t => !['completed', 'declined'].includes(t.status)) ? mobilization.status : 'completed';
      if (req && this.isIncidentActive(req)) {
        req.status = 'Volunteer Assistance Completed';
        if (req.assignedResponder) req.assignedResponder.volunteerStatus = status;
      }
    }
    if (req && statusDetails[status]) {
      const [timelineStatus, note] = statusDetails[status];
      req.timeline = req.timeline || [];
      req.timeline.unshift({ time: 'Just now', status: timelineStatus, note });
    }

    this.saveRequests();
    this.syncVolunteerNetwork();
    this.notify(
      status === 'on_site'
        ? `GROUND CONFIRMED by verified volunteer ${volunteer.name}.`
        : `${volunteer.name}: ${status.replace('_', ' ').toUpperCase()}`,
      status === 'on_site' ? 'success' : 'info'
    );
    this.emitChange();
  },

  // Check volunteer ETA
  checkVolunteerEta(mobilization, target) {
    if (!target.acceptedAt || !['accepted', 'on_the_way'].includes(target.status) || target.etaExceeded) return;
    if (Date.now() > target.acceptedAt + target.etaMinutes * 60000) {
      target.etaExceeded = true;
      this.syncVolunteerNetwork();
      this.notify(`ETA EXCEEDED: ${this.volunteers.find(v => v.id === target.volunteerId)?.name || 'Volunteer'} has not arrived yet.`, 'warning');
    }
  },

  // Check volunteer service limits (12h cap)
  checkVolunteerServiceLimits() {
    let changed = false;
    this.volunteers.forEach(volunteer => {
      const serviceInfo = this.getVolunteerServiceInfo(volunteer);
      if (serviceInfo.reached && volunteer.availability !== 'offline') {
        volunteer.availability = 'offline';
        changed = true;
        if (this.currentUser?.id === volunteer.id) this.notify('MAXIMUM SERVICE LIMIT REACHED — you are now OFFLINE for new tasks.', 'warning');
      }
    });
    if (changed) this.syncVolunteerNetwork();
  },

  // Periodic timer check: auto-escalates when 2-minute window expires without volunteer response
  checkVolunteerTimeouts() {
    this.checkVolunteerServiceLimits();
    this.volunteerMobilizations.forEach(mobilization => {
      mobilization.targets.forEach(target => this.checkVolunteerEta(mobilization, target));
      const hasAccepted = mobilization.targets.some(t => ['accepted', 'on_the_way', 'on_site', 'completed'].includes(t.status));
      if (Date.now() >= mobilization.expiresAt && !hasAccepted && !mobilization.escalated && mobilization.status !== 'resolved') {
        this.autoEscalateVolunteerMobilization(mobilization.id);
      }
    });
  },

  // Auto-escalation triggers ESCALATION REQUIRED state for Commander to explicitly deploy units
  autoEscalateVolunteerMobilization(mobilizationId) {
    const mobilization = this.volunteerMobilizations.find(m => m.id === mobilizationId);
    if (!mobilization || mobilization.escalated) return;
    const lockKey = `apdasetu_volunteer_escalation_${mobilizationId}`;
    if (localStorage.getItem(lockKey)) return;
    localStorage.setItem(lockKey, String(Date.now()));

    mobilization.escalated = true;
    mobilization.status = 'escalated';

    if (mobilization.isScramble && this.currentUser && mobilization.targets.some(target => target.volunteerId === this.currentUser.id)) {
      window.ApdaSoundEngine?.stopEmergencySiren();
    }

    const request = this.requests.find(r => r.id === mobilization.requestId);
    if (request && this.isIncidentActive(request)) {
      request.timeline.unshift({
        time: 'Just now',
        status: 'Volunteer Response Timeout',
        note: '2-minute volunteer response window expired without volunteer response. Commander escalation enabled.'
      });
      this.saveRequests();
    }

    this.syncVolunteerNetwork();
    this.notify(`VOLUNTEER RESPONSE TIMEOUT for ${mobilization.requestId} — Response unit escalation enabled.`, 'warning');
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
    if (window.ApdaResponderDashboard) {
      window.ApdaResponderDashboard.activeTab = tabName;
    }
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

      if (['Resolved', 'Closed'].includes(newStatus)) {
        if (req.assignedTeam) {
          const unit = this.rescueUnits.find(u => u.id === req.assignedTeam.id);
          if (unit) {
            unit.status = 'Available';
            unit.assignedTo = null;
          }
        }
        const mobilization = this.volunteerMobilizations.find(m => m.requestId === requestId && m.status !== 'resolved');
        if (mobilization) {
          mobilization.status = 'resolved';
          mobilization.resolvedAt = Date.now();
          mobilization.targets.forEach(t => {
            if (!['completed', 'declined'].includes(t.status)) t.status = 'resolved';
          });
        }
        if (window.ApdaSoundEngine) {
          window.ApdaSoundEngine.stopEmergencySiren();
        }
      }

      this.saveRequests();
      this.syncVolunteerNetwork();
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
