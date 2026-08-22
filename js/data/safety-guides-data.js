// Comprehensive Disaster Safety Guides & Offline Emergency Kit Checklists

window.ApdaSafetyGuides = {
  categories: [
    {
      id: 'flood',
      name: 'Floods & Inundation',
      name_hi: 'बाढ़ एवं जलभराव',
      icon: '🌊',
      color: 'blue',
      dos: [
        'Turn off main electricity switch and gas supply valve immediately if water begins entering.',
        'Move vulnerable family members (elderly, infants, pregnant women) and critical medical supplies to top floors or high ground.',
        'Drink only boiled or chlorine-treated water to prevent water-borne epidemics like cholera and typhoid.',
        'Keep a dry battery-powered torch, emergency whistle, and phone sealed in a ziplock bag.',
        'Signal rescue helicopters/boats using bright colored cloth or reflective surfaces from your roof.'
      ],
      donts: [
        'DO NOT walk, swim, or drive through moving flood waters — 6 inches of rapid water can knock you down, and 2 feet will float a car.',
        'DO NOT touch submerged electrical wires, appliances, or fallen utility poles.',
        'DO NOT consume food items that have come in direct contact with flood water.',
        'DO NOT ignore official evacuation orders issued by NDMA or District Magistrate.'
      ],
      emergencyGear: ['Inflatable life vest or makeshift float', 'Waterproof pouch for ID & deeds', 'Whistle for sound beacon', 'Water purification tablets']
    },
    {
      id: 'cyclone',
      name: 'Cyclones & Super Storms',
      name_hi: 'चक्रवात एवं भीषण तूफान',
      icon: '🌀',
      color: 'cyan',
      dos: [
        'Board up or tape large glass windows criss-cross with strong tape to prevent shattered glass splinters.',
        'Move into the strongest interior room of your house (away from outer windows) or head to a fortified cyclone shelter.',
        'Keep mobile phones, power banks, and rechargeable emergency lamps fully charged before landfall.',
        'Anchor loose rooftop tin sheets, solar panels, and outdoor water tanks securely.'
      ],
      donts: [
        'DO NOT step outside when the calm "Eye of the Cyclone" passes over — fierce opposite-direction winds will strike within minutes.',
        'DO NOT stand under tall trees, electric transmission towers, or large advertising hoardings.',
        'DO NOT spread unverified social media rumors regarding storm track or tidal heights.'
      ],
      emergencyGear: ['Heavy duty adhesive tape', 'Battery FM radio', 'Heavy rain poncho', 'Multi-day dry food (poha, chana, biscuits)']
    },
    {
      id: 'earthquake',
      name: 'Earthquake & Tremors',
      name_hi: 'भूकंप एवं झटके',
      icon: '🏚️',
      color: 'amber',
      dos: [
        'Practice "DROP, COVER, AND HOLD ON": Drop to hands and knees, take cover under a sturdy wooden desk/table, and hold on firmly.',
        'If in bed, stay in bed, curl up and protect your head with heavy pillows.',
        'If outdoors, move immediately to an open field away from buildings, streetlights, overhead cables, and flyovers.',
        'After tremors stop, check for gas leaks using smell (never light a matchstick or lighter).'
      ],
      donts: [
        'DO NOT use elevators during or immediately after an earthquake — stairwells only.',
        'DO NOT rush towards building exits in a panic stampede.',
        'DO NOT stand in doorways unless you know with certainty they are heavy load-bearing structural frames.'
      ],
      emergencyGear: ['Hard protective headgear or thick helmet', 'Sturdy work gloves', 'Dust mask (N95)', 'Loud emergency whistle']
    },
    {
      id: 'landslide',
      name: 'Landslides & Debris Flow',
      name_hi: 'भूस्खलन एवं मलबा प्रवाह',
      icon: '⛰️',
      color: 'yellow',
      dos: [
        'Listen for unusual sounds like cracking trees, rumbling boulders, or sudden muddy water trickling down slopes.',
        'Evacuate immediately away from mountain slope valleys, riverbanks, and ravine bottoms if heavy torrential rains persist.',
        'If caught in a debris flow and escape is impossible, curl into a tight ball and protect your head.',
        'Inform SDRF/Highway patrol about hairline fissures appearing on hillside roads.'
      ],
      donts: [
        'DO NOT build or camp near steep slopes, drainage ravines, or natural hill erosion channels.',
        'DO NOT attempt to cross landslide debris paths immediately — secondary slides frequently follow within hours.',
        'DO NOT sleep on ground-floor rooms facing unstable hillside retaining walls during cloudbursts.'
      ],
      emergencyGear: ['Emergency rope & carabiner', 'High-lumens headlamp', 'Waterproof trekking boots', 'Thermal blanket']
    },
    {
      id: 'forest_fire',
      name: 'Forest Fires & Wildfires',
      name_hi: 'जंगल की आग (दावानल)',
      icon: '🔥',
      color: 'red',
      dos: [
        'Evacuate immediately in the direction opposite to prevailing wind and downslope away from dense pine/dry brush.',
        'Cover nose and mouth with a wet handkerchief, bandana, or N95 respirator to prevent hot smoke inhalation.',
        'Clear dry leaves, twigs, and combustible vegetation 30 feet around your perimeter if residing in hill villages.',
        'Keep water hoses, buckets of sand, and wet blankets ready for roof ember defense.'
      ],
      donts: [
        'DO NOT attempt to outrun a wildfire uphill — fires travel uphill exponentially faster due to rising heat convection.',
        'DO NOT discard cigarette butts, campfire embers, or burn crop stubble near dry forest fringes.',
        'DO NOT return to burnt residential zones until declared safe by Fire and Forest authorities.'
      ],
      emergencyGear: ['Smoke particulate mask / Respirator', 'Goggles for smoke eye protection', 'Fire retardant blanket', 'Burn injury ointment']
    }
  ],

  // Interactive Emergency Go-Bag Kit Checklist (Persisted in LocalStorage)
  emergencyKitChecklist: [
    { id: 'kit-1', title: 'Drinking Water (3 Litres per person per day for at least 72 hours)', category: 'survival', priority: 'essential' },
    { id: 'kit-2', title: 'Non-perishable Dry Food (Energy bars, roasted grams, dry fruits, biscuits)', category: 'survival', priority: 'essential' },
    { id: 'kit-3', title: 'Comprehensive First Aid Kit (Antiseptic, bandages, ORS packets, burn gel, pain relievers)', category: 'medical', priority: 'essential' },
    { id: 'kit-4', title: 'Critical Prescription Medications (Insulin, BP tablets, Inhalers - 7 days backup)', category: 'medical', priority: 'essential' },
    { id: 'kit-5', title: 'Heavy Duty LED Torch / Flashlight with extra batteries', category: 'tools', priority: 'essential' },
    { id: 'kit-6', title: 'High Capacity Power Bank (20,000mAh) & Multi-pin charging cables', category: 'tools', priority: 'essential' },
    { id: 'kit-7', title: 'Loud Emergency Distress Whistle (Carried on neck lanyard)', category: 'safety', priority: 'essential' },
    { id: 'kit-8', title: 'Waterproof Ziplock Pouch for Aadhar, Passports, Property Deeds, Bank Cards', category: 'documents', priority: 'essential' },
    { id: 'kit-9', title: 'Emergency Cash in Small Denominations (₹100, ₹200, ₹500 notes - ATMs fail)', category: 'financial', priority: 'essential' },
    { id: 'kit-10', title: 'Multi-tool Pocket Knife, Duct Tape, and Sturdy Paracord (15 meters)', category: 'tools', priority: 'recommended' },
    { id: 'kit-11', title: 'N95 Respirator Masks & Protective Eye Goggles', category: 'medical', priority: 'recommended' },
    { id: 'kit-12', title: 'Lightweight Foil Thermal Emergency Space Blankets', category: 'survival', priority: 'recommended' },
    { id: 'kit-13', title: 'Infant Essentials (Milk formula, feeding bottles, diapers, baby wipes)', category: 'special_needs', priority: 'conditional' },
    { id: 'kit-14', title: 'Pet Food, Leash, and Pet Medication (if applicable)', category: 'special_needs', priority: 'conditional' }
  ]
};
