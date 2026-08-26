// Realistic Seed Data for ApdaSetu Platform

window.ApdaSeedData = {
  // Live National & Regional Alerts
  alerts: [
    {
      id: 'ALT-101',
      title: 'Brahmaputra Severe Inundation Alert - Red Category',
      title_hi: 'ब्रह्मपुत्र गंभीर जलभराव चेतावनी - रेड अलर्ट',
      category: 'flood',
      severity: 'critical', // critical, high, medium, low
      region: 'Kamrup & Morigaon, Assam',
      state: 'Assam',
      coordinates: [26.1445, 91.7362],
      timestamp: '10 mins ago',
      source: 'Central Water Commission (CWC) & SDMA',
      description: 'Water levels exceeded danger mark by 1.8m. 14 villages inundated. Evacuation underway across 8 relief camps. Inflatable rafts deployed.',
      channels: ['Web Push', 'SMS Broadcast', 'Sirens Activated'],
      active: true,
      helpline: '1070 / 1078'
    },
    {
      id: 'ALT-102',
      title: 'Cyclone Sagar-Vayu Windstorm & Storm Surge Warning',
      title_hi: 'चक्रवात सागर-वायु तीव्र तूफान व तटीय चेतावनी',
      category: 'cyclone',
      severity: 'high',
      region: 'Puri & Jagatsinghpur Coastal Belt',
      state: 'Odisha',
      coordinates: [19.8135, 85.8312],
      timestamp: '25 mins ago',
      source: 'India Meteorological Department (IMD)',
      description: 'Wind speeds gusting up to 130 km/h. Sea conditions rough to very rough. Coastal fishermen advised to return to shore immediately.',
      channels: ['Web Push', 'SMS Broadcast', 'WhatsApp Alert'],
      active: true,
      helpline: '0674-2534177'
    },
    {
      id: 'ALT-103',
      title: 'Major Landslide & Highway Blockade Warning',
      title_hi: 'बड़ा भूस्खलन एवं राजमार्ग अवरोध चेतावनी',
      category: 'landslide',
      severity: 'critical',
      region: 'NH-58 Near Rudraprayag & Chamoli',
      state: 'Uttarakhand',
      coordinates: [30.2844, 78.9811],
      timestamp: '45 mins ago',
      source: 'Disaster Management Cell Dehradun',
      description: 'Massive debris flow triggered by torrential cloudburst. Traffic halted. Specialized earthmovers and SDRF mountain rescue en route.',
      channels: ['Web Push', 'SMS Broadcast'],
      active: true,
      helpline: '1077'
    },
    {
      id: 'ALT-104',
      title: 'Dense Pine Forest Canopy Fire Spreading Fast',
      title_hi: 'जंगल में भीषण आग - सुरक्षित स्थानों पर जाने की सलाह',
      category: 'forest_fire',
      severity: 'high',
      region: 'Bhowali Valley, Nainital Range',
      state: 'Uttarakhand',
      coordinates: [29.3803, 79.4636],
      timestamp: '1 hour ago',
      source: 'Forest Fire Control & NDRF 15th Bn',
      description: 'Wildfire aggravated by high temperature & gusty winds. 3 perimeter fire breaks cut. Air Force Bambi bucket sorties on standby.',
      channels: ['Web Push', 'WhatsApp Alert'],
      active: true,
      helpline: '1926'
    },
    {
      id: 'ALT-105',
      title: 'Urban Flash Flood & High Tide Confluence',
      title_hi: 'शहरी भारी जलभराव एवं हाई टाइड चेतावनी',
      category: 'flood',
      severity: 'medium',
      region: 'Kurla & Hindmata, Mumbai Suburbs',
      state: 'Maharashtra',
      coordinates: [19.0728, 72.8826],
      timestamp: '2 hours ago',
      source: 'BMC Disaster Management Dept',
      description: 'Continuous rainfall (165mm in 6 hrs) paired with 4.5m high tide. High capacity dewatering pumps operational in 24 ward locations.',
      channels: ['Web Push', 'SMS Broadcast'],
      active: true,
      helpline: '1916'
    }
  ],

  // Relief Shelters with Live Vacancy & Facilities
  shelters: [
    {
      id: 'SHL-01',
      name: 'Kamrup Central Relief Hub & School Ground',
      type: 'School',
      state: 'Assam',
      location: 'Beltola, Guwahati, Assam',
      coordinates: [26.1345, 91.7862],
      totalCapacity: 350,
      occupied: 285,
      contactPerson: 'Arunav Baruah (Nodal Officer)',
      phone: '+91 98640 11223',
      status: 'Open',
      facilities: ['Clean Drinking Water', 'Community Kitchen', '24/7 Medical Clinic', 'Solar Power Backup', 'Mother & Infant Care'],
      verifiedBy: 'Assam SDMA',
      distanceKm: '1.4 km'
    },
    {
      id: 'SHL-02',
      name: 'Government Multipurpose Cyclone Shelter #04',
      state: 'Odisha',
      location: 'Marine Drive Road, Puri, Odisha',
      coordinates: [19.8055, 85.8212],
      totalCapacity: 500,
      occupied: 310,
      contactPerson: 'Subhasree Patnaik (Disaster Officer)',
      phone: '+91 94370 88991',
      status: 'Open',
      facilities: ['Underground Cisterns', 'First Aid Trauma Bay', 'Satellite Comms', 'High Wind Resistant Dome', 'Pet & Cattle Shed'],
      verifiedBy: 'OSDMA & Red Cross',
      distanceKm: '2.8 km'
    },
    {
      id: 'SHL-03',
      name: 'Chamoli Transit Camp & Sports Complex',
      state: 'Uttarakhand',
      location: 'Gopeshwar Road, Chamoli, Uttarakhand',
      coordinates: [30.4100, 79.3200],
      totalCapacity: 200,
      occupied: 188,
      contactPerson: 'Captain D.S. Rawat',
      phone: '+91 97560 44321',
      status: 'High Occupancy',
      facilities: ['Heated Rooms', 'Orthopedic First Aid', 'Dry Ration Kits', 'Helipad Access'],
      verifiedBy: 'SDRF 3rd Bn',
      distanceKm: '4.2 km'
    },
    {
      id: 'SHL-04',
      name: 'Bhowali Community Center Safe Zone',
      state: 'Uttarakhand',
      location: 'Ramgarh Road, Nainital District',
      coordinates: [29.3820, 79.5100],
      totalCapacity: 150,
      occupied: 62,
      contactPerson: 'Mahesh Joshi',
      phone: '+91 94120 77654',
      status: 'Open',
      facilities: ['Burn Dressing Unit', 'Oxygen Cylinders', 'Food Packets', 'Mobile Charging Station'],
      verifiedBy: 'District Magistrate Office',
      distanceKm: '3.1 km'
    },
    {
      id: 'SHL-05',
      name: 'Dharavi Sports Complex Relief Shelter',
      type: 'Safe Zone',
      state: 'Maharashtra',
      location: 'Sion Bandra Link Rd, Mumbai',
      coordinates: [19.0430, 72.8580],
      totalCapacity: 400,
      occupied: 175,
      contactPerson: 'P.K. Shinde (Ward Officer)',
      phone: '+91 98200 45678',
      status: 'Open',
      facilities: ['Dewatered Dry Halls', 'Pediatric Medical Aid', 'Meals on Wheels', 'Emergency Sanitization'],
      verifiedBy: 'BMC Disaster Control',
      distanceKm: '5.0 km'
    },
    {
      id: 'SHL-06',
      name: 'Guwahati Medical College (GMCH) Relief Wing',
      type: 'Hospital',
      state: 'Assam',
      location: 'Bhangagarh, Guwahati, Assam',
      coordinates: [26.1550, 91.7650],
      totalCapacity: 150,
      occupied: 80,
      contactPerson: 'Dr. Ramesh Talukdar',
      phone: '+91 94350 11222',
      status: 'Open',
      facilities: ['Trauma Center', 'ICU Beds', 'Ambulance Support', '24/7 Pharmacy'],
      verifiedBy: 'Health Dept Assam',
      distanceKm: '2.5 km'
    },
    {
      id: 'SHL-07',
      name: 'Nilachal Hill Elevated Safe Zone',
      type: 'Safe Zone',
      state: 'Assam',
      location: 'Kamakhya Temple Rd, Guwahati',
      coordinates: [26.1660, 91.7050],
      totalCapacity: 600,
      occupied: 210,
      contactPerson: 'Temple Trust Rescue Team',
      phone: '+91 98640 88990',
      status: 'Open',
      facilities: ['High Altitude', 'Food Distribution', 'Helipad', 'Tents Available'],
      verifiedBy: 'Assam SDMA',
      distanceKm: '6.0 km'
    }
  ],

  // Live Incident Requests (Incoming from Citizens)
  requests: [
    {
      id: 'REQ-2026-001',
      userId: 'USR-881',
      userName: 'Priya Sharma',
      userPhone: '+91 98765 43210',
      disasterType: 'flood',
      severity: 'critical',
      coordinates: [26.1480, 91.7450],
      address: 'House #42, By-lane 3, Hatigaon, Guwahati, Assam',
      peopleAffected: 6,
      vulnerable: { infants: 1, elderly: 2, injured: 1 },
      description: 'Flood water reached 1st floor ceiling. Trapped on rooftop with 8-month-old infant and 75yr old diabetic patient with no medicine. Immediate boat rescue needed!',
      media: [
        { type: 'image', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%231e3a8a"/%3E%3Cpath d="M0 120 Q75 100 150 120 T300 120 L300 200 L0 200 Z" fill="%233b82f6"/%3E%3Crect x="120" y="70" width="60" height="50" fill="%23b45309"/%3E%3Cpolygon points="110,70 150,40 190,70" fill="%23dc2626"/%3E%3Ccircle cx="150" cy="55" r="5" fill="%23ffffff"/%3E%3Ctext x="150" y="180" fill="%23ffffff" font-size="12" text-anchor="middle"%3ERooftop SOS: Water at 5.5ft%3C/text%3E%3C/svg%3E', tag: 'Submerged Structure & Rooftop Distress' }
      ],
      aiScore: {
        confidence: 94, // %
        riskScore: 92, // /100
        riskLevel: 'CRITICAL',
        keywordsDetected: ['trapped', 'rooftop', 'infant', 'medicine', 'flood water', 'immediate'],
        clusterCount: 4, // 4 reports within 800m
        aiNotes: 'High urgency NLP match + visual water level verification + vulnerable infant/elderly flag. Top priority dispatch.'
      },
      status: 'Resolved', // Submitted -> Verified -> Ground Confirmed -> Dispatched -> In Progress -> Resolved
      assignedTeam: null,
      groundConfirmedBy: {
        id: 'VLT-001',
        name: 'Rupam Saikia',
        verified: true,
        at: '15 mins ago'
      },
      submittedAt: '28 mins ago',
      timeline: [
        { time: '28 mins ago', status: 'Submitted', note: 'SOS reported by citizen via mobile app' },
        { time: '25 mins ago', status: 'AI Verified', note: 'AI Confidence 94%, Risk Score 92. Auto-escalated to priority 1' },
        { time: '20 mins ago', status: 'Ground Confirmed', note: 'Verified volunteer Rupam Saikia arrived on site and verified distress' },
        { time: '14 mins ago', status: 'Dispatched', note: 'NDRF Raft Unit #4 dispatched from Dispur Base' },
        { time: '5 mins ago', status: 'Resolved', note: 'Rooftop rescue completed safely. All 6 citizens evacuated to Kamrup Relief Hub.' }
      ]
    },
    {
      id: 'REQ-2026-002',
      userId: 'USR-882',
      userName: 'Debabrata Das',
      userPhone: '+91 94371 22334',
      disasterType: 'cyclone',
      severity: 'critical',
      coordinates: [19.8180, 85.8390],
      address: 'Fisherman Colony, Penthakata, Puri, Odisha',
      peopleAffected: 9,
      vulnerable: { infants: 2, elderly: 1, injured: 2 },
      description: 'Roof tin sheets blown away by severe cyclone winds. Heavy rain flooding mud walls, house might collapse any moment. 2 people have deep glass cuts from broken windows.',
      media: [],
      aiScore: {
        confidence: 88,
        riskScore: 89,
        riskLevel: 'CRITICAL',
        keywordsDetected: ['roof blown', 'collapse', 'injured', 'glass cuts', 'cyclone'],
        clusterCount: 7,
        aiNotes: 'Structural collapse risk + multiple active injuries. Requires medical trauma support.'
      },
      status: 'Ground Confirmed',
      groundConfirmedBy: {
        id: 'VLT-003',
        name: 'Aarav Mishra',
        verified: true,
        at: '2 mins ago'
      },
      assignedTeam: null,
      submittedAt: '14 mins ago',
      timeline: [
        { time: '14 mins ago', status: 'Submitted', note: 'Citizen emergency alert logged' },
        { time: '11 mins ago', status: 'AI Verified', note: 'AI Risk 89 (Critical Injury & Structural Risk)' },
        { time: '6 mins ago', status: 'Verified by Responder', note: 'Triage approved. Ready for multi-agency ambulance & ODRAF dispatch.' },
        { time: '2 mins ago', status: 'Ground Confirmed', note: 'Verified volunteer Aarav Mishra confirmed on ground. 2 critical trauma casualties.' }
      ]
    },
    {
      id: 'REQ-2026-003',
      userId: 'USR-883',
      userName: 'Kavita Joshi',
      userPhone: '+91 97561 88990',
      disasterType: 'landslide',
      severity: 'high',
      coordinates: [30.2910, 78.9750],
      address: 'Near Kali Temple Bend, Rudraprayag, Uttarakhand',
      peopleAffected: 4,
      vulnerable: { infants: 0, elderly: 1, injured: 0 },
      description: 'Hill slope boulders fell behind residential building. Cracks visible on kitchen wall. Ground shaking. Need evacuation assistance before nightfall.',
      media: [],
      aiScore: {
        confidence: 82,
        riskScore: 76,
        riskLevel: 'HIGH',
        keywordsDetected: ['boulders', 'cracks', 'ground shaking', 'evacuation', 'landslide'],
        clusterCount: 3,
        aiNotes: 'Geotechnical hazard confirmed by cluster reports along NH-58. SDRF Mountain Unit alerted.'
      },
      status: 'Submitted',
      assignedTeam: null,
      submittedAt: '8 mins ago',
      timeline: [
        { time: '8 mins ago', status: 'Submitted', note: 'New citizen incident queued for triage' },
        { time: '6 mins ago', status: 'AI Evaluated', note: 'AI Confidence 82%, Risk 76' }
      ]
    },
    {
      id: 'REQ-2026-004',
      userId: 'USR-884',
      userName: 'Tariq Hussain',
      userPhone: '+91 94190 33445',
      disasterType: 'forest_fire',
      severity: 'high',
      coordinates: [29.3850, 79.4690],
      address: 'Pine Wood Cottages, Bhowali Ridge, Nainital',
      peopleAffected: 8,
      vulnerable: { infants: 0, elderly: 2, injured: 0 },
      description: 'Forest fire smoke is extremely thick. Visibility under 10 meters. Asthmatic elderly coughing badly. Road down to Bhimtal is engulfed in smoke.',
      media: [],
      aiScore: {
        confidence: 86,
        riskScore: 81,
        riskLevel: 'HIGH',
        keywordsDetected: ['smoke thick', 'asthmatic', 'coughing', 'engulfed', 'fire'],
        clusterCount: 5,
        aiNotes: 'Severe respiratory hazard detected. Forest Fire unit & Ambulance dispatch recommended.'
      },
      status: 'Verified',
      assignedTeam: null,
      submittedAt: '35 mins ago',
      timeline: [
        { time: '35 mins ago', status: 'Submitted', note: 'Citizen emergency alert' },
        { time: '30 mins ago', status: 'AI Verified', note: 'High smoke asphyxiation risk' },
        { time: '15 mins ago', status: 'Verified by Responder', note: 'Command triage approved. No local volunteers in radius; escalating to unit deployment.' }
      ]
    }
  ],

  // Available Responder / Rescue Units
  rescueUnits: [
    {
      id: 'TEAM-NDRF-04',
      name: 'NDRF 1st Battalion - Raft Unit 04',
      agency: 'NDRF',
      leader: 'Sub-Inspector R.K. Bordoloi',
      phone: '+91 94350 99881',
      type: 'Boat / Water Rescue',
      status: 'Available', // Available, Deployed, On Break
      personnel: 6,
      equipment: ['Gemini Motor Inflatable Boat', '8x Life Jackets', 'Waterproof First Aid', 'Throw Bags', 'Satellite Handset'],
      assignedTo: null,
      coordinates: [26.1420, 91.7410]
    },
    {
      id: 'TEAM-NDRF-08',
      name: 'NDRF 1st Battalion - Heavy Debris & Search Unit',
      agency: 'NDRF',
      leader: 'Inspector Rajesh Kumar',
      phone: '+91 94350 55442',
      type: 'Urban Search & Rescue',
      status: 'Available',
      personnel: 12,
      equipment: ['Hydraulic Cutters', 'Life Detectors', 'Canine Search Unit', 'High Power Gensets'],
      assignedTo: null,
      coordinates: [26.1380, 91.7510]
    },
    {
      id: 'TEAM-MED-01',
      name: '108 Advanced Life Support Trauma Unit',
      agency: 'Medical',
      leader: 'Dr. Ananya Sen (Emergency Physician)',
      phone: '+91 98300 77112',
      type: 'Medical Ambulance',
      status: 'Available',
      personnel: 4,
      equipment: ['Defibrillator', 'Oxygen Ventilator', 'Pediatric ICU Kit', 'Burn Trauma Dressings', 'IV Saline Packs'],
      assignedTo: null,
      coordinates: [26.1510, 91.7600]
    },
    {
      id: 'TEAM-FIRE-01',
      name: 'State Fire Brigade High-Volume Dewatering & Rescue',
      agency: 'Fire Brigade',
      leader: 'Station Officer M. Gogoi',
      phone: '+91 94350 12345',
      type: 'Fire & Flood Drainage',
      status: 'Available',
      personnel: 8,
      equipment: ['Submersible Mud Pumps (2000 LPM)', 'Safety Harness Ropes', 'Aluminum Extension Ladders'],
      assignedTo: null,
      coordinates: [26.1300, 91.7300]
    },
    {
      id: 'TEAM-CIVIL-09',
      name: 'Red Cross & Civil Defense Volunteer Flood Boat',
      agency: 'NGO / Red Cross',
      leader: 'Tapan Hazarika',
      phone: '+91 98641 22998',
      type: 'Ration & Evacuation Support',
      status: 'Available',
      personnel: 5,
      equipment: ['200x Clean Water Pouches', '100x Dry Food Kits', 'Baby Food & Diapers', 'First Aid Box'],
      assignedTo: null,
      coordinates: [26.1400, 91.7480]
    },
    {
      id: 'TEAM-ODRAF-01',
      name: 'ODRAF Coastal Cyclone & Inflatable Raft Squad',
      agency: 'SDRF / ODRAF',
      leader: 'Inspector Bikash Nayak',
      phone: '+91 94370 44551',
      type: 'Coastal & Flood Rescue',
      status: 'Available',
      personnel: 8,
      equipment: ['Gemini Inflatable Powerboat', 'Tree Cutters', 'Life Buoys', 'Trauma Stretcher'],
      assignedTo: null,
      coordinates: [19.8120, 85.8320]
    },
    {
      id: 'TEAM-SDRF-03',
      name: 'SDRF Uttarakhand Mountain Search & Rope Rescue Unit',
      agency: 'SDRF',
      leader: 'Sub-Inspector Mohan Rawat',
      phone: '+91 97560 33441',
      type: 'Mountain & Debris Rescue',
      status: 'Available',
      personnel: 7,
      equipment: ['High-Angle Rope Rigging', 'Hydraulic Jack Spreaders', 'Thermal Search Sensors', 'Emergency Splints'],
      assignedTo: null,
      coordinates: [30.2850, 78.9720]
    },
    {
      id: 'TEAM-FIRE-02',
      name: 'Uttarakhand Fire & Wildfire Suppression Tender',
      agency: 'Fire Brigade',
      leader: 'Station Officer Surendra Negi',
      phone: '+91 94120 11999',
      type: 'Fire & Wildfire Control',
      status: 'Available',
      personnel: 6,
      equipment: ['Water Misting Cannons', 'Oxygen Respirators', 'Fire Proximity Suits', 'Chain Saws'],
      assignedTo: null,
      coordinates: [29.3810, 79.4620]
    },
    {
      id: 'TEAM-AIR-01',
      name: 'NDRF Air Wing & Disaster Heli-Evac Sortie',
      agency: 'Air Evacuation',
      leader: 'Wing Commander V. Joshi',
      phone: '+91 98110 55432',
      type: 'Air Evacuation Unit',
      status: 'Available',
      personnel: 4,
      equipment: ['Helicopter Winch Basket', 'Emergency Paramedic Bay', 'High-Altitude Oxygen'],
      assignedTo: null,
      coordinates: [30.1900, 79.2000]
    }
  ],

  // [volunteer done] Verified volunteer profiles used by the response-network demo.
  volunteers: [
    { id: 'VLT-001', name: 'Rupam Saikia', phone: '+91 98640 22331', verified: true, availability: 'available', skills: ['Boat handling', 'Elderly evacuation', 'First aid'], coordinates: [26.1462, 91.7428], completedTasks: 18, peopleAssisted: 74, hoursServed: 126, activeServiceHours: 8.2, responseHistory: ['Flood evacuation · Hatigaon', 'Medicine delivery · Beltola'] }, // [volunteer done] Active-service hours support the 12-hour safety limit.
    { id: 'VLT-002', name: 'Dr. Nilakshi Das', phone: '+91 98640 22332', verified: true, availability: 'available', skills: ['First aid', 'Triage', 'Child care'], coordinates: [26.1515, 91.7505], completedTasks: 31, peopleAssisted: 119, hoursServed: 208, activeServiceHours: 10.8, responseHistory: ['First-aid camp · Guwahati', 'Flood shelter triage'] }, // [volunteer done] Active-service hours support the 12-hour safety limit.
    { id: 'VLT-003', name: 'Aarav Mishra', phone: '+91 94370 88144', verified: true, availability: 'available', skills: ['Water rescue', 'Radio coordination'], coordinates: [19.8152, 85.8354], completedTasks: 14, peopleAssisted: 52, hoursServed: 97, activeServiceHours: 6.4, responseHistory: ['Coastal evacuation · Puri', 'Cyclone supply run'] }, // [volunteer done] Active-service hours support the 12-hour safety limit.
    { id: 'VLT-004', name: 'Meera Bora', phone: '+91 98640 22335', verified: true, availability: 'offline', skills: ['Logistics', 'Food distribution'], coordinates: [26.1370, 91.7330], completedTasks: 22, peopleAssisted: 91, hoursServed: 164, activeServiceHours: 12, responseHistory: ['Relief-kit distribution', 'Shelter coordination'] }, // [volunteer done] Limit-reached profile demonstrates automatic unavailability.
    { id: 'VLT-005', name: 'Kunal Rawat', phone: '+91 97561 77221', verified: true, availability: 'available', skills: ['Rope rescue', 'Terrain navigation'], coordinates: [30.2894, 78.9781], completedTasks: 26, peopleAssisted: 83, hoursServed: 187, activeServiceHours: 9.6, responseHistory: ['Landslide evacuation', 'Mountain search support'] } // [volunteer done] Active-service hours support the 12-hour safety limit.
  ,
    { id: 'VLT-006', name: 'Manish Patra', phone: '+91 94371 11222', verified: true, availability: 'available', skills: ['First aid', 'Evacuation', 'Cyclone response'], coordinates: [19.8250, 85.8450], completedTasks: 8, peopleAssisted: 14, hoursServed: 32, activeServiceHours: 2.1, responseHistory: ['Shelter setup'] },
    { id: 'VLT-007', name: 'Ankita Negi', phone: '+91 97560 22333', verified: true, availability: 'available', skills: ['Landslide response', 'Evacuation', 'First aid'], coordinates: [30.3100, 78.9650], completedTasks: 19, peopleAssisted: 42, hoursServed: 88, activeServiceHours: 4.5, responseHistory: ['Road clearance support'] },
    { id: 'VLT-008', name: 'Deepak Joshi', phone: '+91 94120 33444', verified: true, availability: 'available', skills: ['Fire suppression', 'First aid'], coordinates: [29.3800, 79.4650], completedTasks: 41, peopleAssisted: 105, hoursServed: 190, activeServiceHours: 8.0, responseHistory: ['Forest fire containment'] },
    { id: 'VLT-009', name: 'Pooja Tiwari', phone: '+91 94120 44555', verified: true, availability: 'available', skills: ['Evacuation', 'Emergency response'], coordinates: [29.3900, 79.4750], completedTasks: 27, peopleAssisted: 66, hoursServed: 110, activeServiceHours: 5.2, responseHistory: ['Smoke evacuation assistance'] }
],

  // Community Help Chat Rooms & Seed Messages
  chatRooms: [
    {
      id: 'ROOM-ASSAM-FLOOD',
      name: 'Assam Flood Relief & Mutual Aid (Guwahati / Kamrup)',
      name_hi: 'असम बाढ़ राहत एवं आपसी सहायता (गुवाहाटी / कामरूप)',
      disaster: 'flood',
      activeUsers: 84,
      pinnedNotice: '🚨 OFFICIAL NOTICE (SDMA): Relief boats operating between Hatigaon and Beltola. If stranded on rooftops, display bright cloth.',
      messages: [
        {
          id: 'MSG-1',
          sender: 'Bikash Kalita',
          senderRole: 'citizen',
          avatar: '👨',
          tag: 'Need Water/Food',
          text: 'We have 12 families taking shelter in Hatigaon High School terrace. We have run out of drinking water. Can anyone coordinate water pouch supply?',
          time: '18 mins ago',
          upvotes: 6,
          isModerated: false
        },
        {
          id: 'MSG-2',
          sender: 'Rupam Saikia (Volunteer)',
          senderRole: 'volunteer',
          avatar: '🦺',
          tag: 'Transport Available',
          text: 'I have a 6-person country boat stationed at Six Mile bridge. Doing shuttle trips to Beltola relief center. Call me at 98640-XXXXX for elderly evacuation.',
          time: '14 mins ago',
          upvotes: 11,
          isModerated: false
        },
        {
          id: 'MSG-3',
          sender: 'NDRF Control Room',
          senderRole: 'responder',
          avatar: '🚒',
          tag: 'Official Update',
          text: 'NDRF Raft Unit #4 is currently in Hatigaon By-lane 3. Severe medical cases please raise SOS on ApdaSetu immediately for priority triage.',
          time: '10 mins ago',
          upvotes: 19,
          isModerated: false,
          isOfficial: true
        },
        {
          id: 'MSG-4',
          sender: 'Dr. Nilakshi Das',
          senderRole: 'volunteer',
          avatar: '👩‍⚕️',
          tag: 'Medical Aid',
          text: 'Setting up a temporary first-aid counter at Beltola High School entrance. We have ORS, bandages, paracetamol, and water purifying tablets.',
          time: '6 mins ago',
          upvotes: 14,
          isModerated: false
        },
        {
          id: 'MSG-5',
          sender: 'Manjit Sharma',
          senderRole: 'citizen',
          avatar: '⚠️',
          tag: 'Hazard Alert',
          text: 'ALERT: Submerged transformer sparking near Zoo Road Tiniali! Avoid wading in that lane. Power grid helpline has been informed.',
          time: '3 mins ago',
          upvotes: 23,
          isModerated: false
        }
      ]
    },
    {
      id: 'ROOM-ODISHA-CYCLONE',
      name: 'Odisha Coastal Cyclone Helpdesk (Puri / Paradip)',
      name_hi: 'ओडिशा चक्रवात सहायता समूह (पुरी / पारादीप)',
      disaster: 'cyclone',
      activeUsers: 62,
      pinnedNotice: '🌪️ Coastal Shelter #04 on Marine Drive has 190 vacancies with generator power & hot food.',
      messages: [
        {
          id: 'MSG-11',
          sender: 'Chandan Mohanty',
          senderRole: 'citizen',
          avatar: '👨',
          tag: 'Need Shelter Space',
          text: 'Are there vacant rooms in Puri Town cyclone center for a family of 5 with an infant?',
          time: '20 mins ago',
          upvotes: 3,
          isModerated: false
        },
        {
          id: 'MSG-12',
          sender: 'ODRAF Rescue Desk',
          senderRole: 'responder',
          avatar: '🛡️',
          tag: 'Official Update',
          text: 'Yes Chandan, Marine Drive Shelter #04 has 190 spots open with warm meals and pediatric care. Bus evacuation leaving from railway station.',
          time: '15 mins ago',
          upvotes: 12,
          isModerated: false,
          isOfficial: true
        }
      ]
    },
    {
      id: 'ROOM-HIMALAYA-LANDSLIDE',
      name: 'Uttarakhand Landslide & Road Clearance Aid',
      name_hi: 'उत्तराखंड भूस्खलन एवं सड़क सहायता समूह',
      disaster: 'landslide',
      activeUsers: 41,
      pinnedNotice: '⚠️ NH-58 near Rudraprayag is single-lane only. Travel strictly restricted during night.',
      messages: [
        {
          id: 'MSG-21',
          sender: 'Ramesh Bisht',
          senderRole: 'citizen',
          avatar: '🚗',
          tag: 'Hazard Alert',
          text: 'Fallen rock near milepost 41. Small cars cannot pass. Heavy earthmovers just arrived.',
          time: '25 mins ago',
          upvotes: 8,
          isModerated: false
        }
      ]
    }
  ],

  // Family Check-In Mock Data
  familyMembers: [
    {
      id: 'FAM-1',
      name: 'Aarav Sharma (Son)',
      relation: 'Son',
      phone: '+91 98765 11111',
      status: 'Safe', // Safe, In Danger, Pending Check-in, Unknown
      lastLocation: 'Cotton University Campus, Guwahati',
      lastPingTime: '15 mins ago',
      battery: '82%'
    },
    {
      id: 'FAM-2',
      name: 'Sunita Sharma (Mother)',
      relation: 'Mother',
      phone: '+91 98765 22222',
      status: 'In Danger',
      lastLocation: 'Hatigaon By-lane 3 (Stranded with Priya)',
      lastPingTime: '20 mins ago',
      battery: '45%'
    },
    {
      id: 'FAM-3',
      name: 'Vikram Sharma (Brother)',
      relation: 'Brother',
      phone: '+91 98765 33333',
      status: 'Safe',
      lastLocation: 'Beltola Relief Camp Zone B',
      lastPingTime: '35 mins ago',
      battery: '91%'
    }
  ],

  // Community Updates Feed (Official Bulletins)
  communityUpdates: [
    {
      id: 'UPD-1',
      author: 'National Disaster Management Authority (NDMA)',
      verified: true,
      time: '30 mins ago',
      title: 'NDRF 8th Battalion Deployed to Kamrup & Dhubri for Deep Inundation Relief',
      content: '14 motorized rescue boats, 2 mobile drinking water purification trucks, and 500 dry ration hampers have been dispatched to Upper and Lower Assam riverine islands.',
      badge: 'National Advisory'
    },
    {
      id: 'UPD-2',
      author: 'India Meteorological Department (IMD) Radar Bureau',
      verified: true,
      time: '1 hour ago',
      title: 'Heavy Rainfall Spell Expected to Ease Over Bay of Bengal Coastal Strips',
      content: 'Doppler radar indicates cloud bands shifting north-eastwards. Wind speed expected to reduce from 120 km/h to 65 km/h over the next 18 hours.',
      badge: 'Weather Bulletin'
    },
    {
      id: 'UPD-3',
      author: 'District Magistrate Office, Kamrup Metro',
      verified: true,
      time: '2 hours ago',
      title: 'Free Emergency Medical Aid & Anti-Venom Stations Established in 12 Relief Hubs',
      content: 'Citizens are advised to avoid walking through flood waters barefoot due to submerged debris. Mobile ambulances are reachable on hotline 108.',
      badge: 'District Directive'
    }
  ],

  // Global Disaster Losses (USD Billion, 2000 - 2024)
  globalDisasterLosses: [
    { year: 2000, loss: 58 },
    { year: 2001, loss: 42 },
    { year: 2002, loss: 60 },
    { year: 2003, loss: 75 },
    { year: 2004, loss: 145 },
    { year: 2005, loss: 230 },
    { year: 2006, loss: 62 },
    { year: 2007, loss: 88 },
    { year: 2008, loss: 205 },
    { year: 2009, loss: 72 },
    { year: 2010, loss: 152 },
    { year: 2011, loss: 382 },
    { year: 2012, loss: 186 },
    { year: 2013, loss: 142 },
    { year: 2014, loss: 113 },
    { year: 2015, loss: 105 },
    { year: 2016, loss: 158 },
    { year: 2017, loss: 350 },
    { year: 2018, loss: 172 },
    { year: 2019, loss: 155 },
    { year: 2020, loss: 220 },
    { year: 2021, loss: 285 },
    { year: 2022, loss: 275 },
    { year: 2023, loss: 250 },
    { year: 2024, loss: 280 }
  ]
};
