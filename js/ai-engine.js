// AI Confidence & Urgency Risk Scoring Engine for ApdaSetu

window.ApdaAIEngine = {
  // Urgent & high-risk keywords dictionary
  urgencyKeywords: {
    critical: [
      'trapped', 'drowning', 'unconscious', 'bleeding', 'infant', 'baby', 'child', 
      'cardiac', 'heart', 'oxygen', 'pregnant', 'collapse', 'collapsed', 'fire', 
      'roof', 'rooftop', 'submerged', 'water rising', 'chest pain', 'choking', 
      'asthma', 'avalanche', 'debris', 'smoke thick', 'broken bone', 'electrocution',
      'फंसा', 'डूब', 'बच्चा', 'शिशु', 'सांस', 'आग', 'छत', 'जलभराव', 'ગંભીર', 'আবদ্ধ'
    ],
    high: [
      'elderly', 'senior', 'sick', 'fever', 'medicine', 'insulin', 'cracks', 'boulder',
      'flooded', 'heavy rain', 'wind', 'stranded', 'food needed', 'water needed', 
      'power cut', 'diabetic', 'dialysis', 'मदद', 'दवा', 'বুजुर्ग'
    ],
    medium: [
      'waterlogging', 'road blocked', 'traffic', 'tree fallen', 'leakage', 'shelter needed'
    ]
  },

  // Calculate Confidence Score (0 - 100%) - Genuineness of report
  calculateConfidence(report, existingReports = []) {
    let score = 40; // Base baseline
    const breakdown = {
      base: 40,
      gps: 0,
      media: 0,
      contact: 0,
      cluster: 0,
      nlpConsistency: 0
    };

    // 1. Geolocation accuracy
    if (report.coordinates && Array.isArray(report.coordinates) && report.coordinates.length === 2) {
      const [lat, lng] = report.coordinates;
      if (lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)) {
        breakdown.gps = 20;
        score += 20;
      }
    }

    // 2. Media evidence attached
    if (report.media && report.media.length > 0) {
      breakdown.media = 20;
      score += 20;
    }

    // 3. Contact info valid
    if (report.userPhone && report.userPhone.replace(/\D/g, '').length >= 10) {
      breakdown.contact = 10;
      score += 10;
    }

    // 4. Cluster correlation with nearby reports within ~2km
    let clusterCount = 0;
    if (existingReports.length > 0 && report.coordinates) {
      clusterCount = existingReports.filter(r => {
        if (!r.coordinates) return false;
        const dLat = Math.abs(r.coordinates[0] - report.coordinates[0]);
        const dLng = Math.abs(r.coordinates[1] - report.coordinates[1]);
        return (dLat < 0.05 && dLng < 0.05); // Approx 5km box
      }).length;

      if (clusterCount >= 2) {
        breakdown.cluster = 10;
        score += 10;
      } else if (clusterCount === 1) {
        breakdown.cluster = 5;
        score += 5;
      }
    }

    // Cap at 98% (realistic ML model confidence)
    const finalScore = Math.min(98, Math.max(35, score));
    return {
      score: finalScore,
      breakdown,
      clusterCount
    };
  },

  // Calculate Urgency Risk Score (0 - 100) & Severity Level
  calculateRiskScore(report) {
    let risk = 20; // Base minimum
    const detectedKeywords = [];
    const breakdown = {
      disasterBase: 0,
      peopleFactor: 0,
      vulnerableBonus: 0,
      keywordsWeight: 0,
      timeFactor: 0
    };

    // 1. Disaster Baseline Weight
    const disasterWeights = {
      flood: 30,
      cyclone: 28,
      landslide: 32,
      earthquake: 35,
      forest_fire: 30,
      collapse: 34,
      medical: 30
    };
    breakdown.disasterBase = disasterWeights[report.disasterType] || 25;
    risk += breakdown.disasterBase;

    // 2. People Affected Factor
    const count = parseInt(report.peopleAffected) || 1;
    if (count >= 10) breakdown.peopleFactor = 25;
    else if (count >= 5) breakdown.peopleFactor = 18;
    else if (count >= 2) breakdown.peopleFactor = 10;
    else breakdown.peopleFactor = 5;
    risk += breakdown.peopleFactor;

    // 3. Vulnerable Demographics (Infants, Elderly, Injured)
    if (report.vulnerable) {
      const vCount = (parseInt(report.vulnerable.infants) || 0) +
                     (parseInt(report.vulnerable.elderly) || 0) +
                     (parseInt(report.vulnerable.injured) || 0);
      if (vCount > 0) {
        breakdown.vulnerableBonus = Math.min(15, vCount * 5);
        risk += breakdown.vulnerableBonus;
      }
    }

    // 4. NLP Keyword Analysis
    const text = (report.description || '').toLowerCase();
    
    this.urgencyKeywords.critical.forEach(kw => {
      if (text.includes(kw.toLowerCase()) && !detectedKeywords.includes(kw)) {
        detectedKeywords.push(kw);
        breakdown.keywordsWeight += 8;
      }
    });

    this.urgencyKeywords.high.forEach(kw => {
      if (text.includes(kw.toLowerCase()) && !detectedKeywords.includes(kw)) {
        detectedKeywords.push(kw);
        breakdown.keywordsWeight += 4;
      }
    });

    breakdown.keywordsWeight = Math.min(25, breakdown.keywordsWeight);
    risk += breakdown.keywordsWeight;

    // Final score bound
    const finalRisk = Math.min(99, Math.max(20, Math.round(risk)));

    // Categorize Risk Level
    let riskLevel = 'LOW';
    if (finalRisk >= 80) riskLevel = 'CRITICAL';
    else if (finalRisk >= 60) riskLevel = 'HIGH';
    else if (finalRisk >= 40) riskLevel = 'MEDIUM';

    // Suggest Response Units
    const suggestedUnits = [];
    if (report.disasterType === 'flood' || text.includes('water') || text.includes('drowning') || text.includes('boat')) {
      suggestedUnits.push('NDRF Inflatable Raft Unit', 'Civil Defense Boat Squad');
    }
    if (report.disasterType === 'landslide' || report.disasterType === 'earthquake' || text.includes('collapse') || text.includes('trapped')) {
      suggestedUnits.push('NDRF Heavy Search & Rescue', 'Canine Search Unit');
    }
    if (report.disasterType === 'forest_fire' || text.includes('smoke') || text.includes('fire')) {
      suggestedUnits.push('Fire Brigade Emergency Tender', 'Forest Fire Control Unit');
    }
    if ((report.vulnerable && report.vulnerable.injured > 0) || text.includes('bleeding') || text.includes('heart') || text.includes('infant')) {
      suggestedUnits.push('108 Advanced Life Support Trauma Ambulance');
    }
    if (suggestedUnits.length === 0) {
      suggestedUnits.push('Local Quick Response Team', 'District Relief Volunteers');
    }

    return {
      riskScore: finalRisk,
      riskLevel,
      detectedKeywords,
      breakdown,
      suggestedUnits: [...new Set(suggestedUnits)],
      aiNotes: `AI evaluated ${detectedKeywords.length} critical NLP keyword(s) with ${count} people affected (${report.vulnerable ? (report.vulnerable.infants||0) + ' infants, ' + (report.vulnerable.injured||0) + ' injured' : '0 vulnerable'}).`
    };
  },

  // Perform full assessment for a new or live draft report
  evaluateReport(report, existingReports = []) {
    const confidenceResult = this.calculateConfidence(report, existingReports);
    const riskResult = this.calculateRiskScore(report);

    return {
      confidence: confidenceResult.score,
      confidenceBreakdown: confidenceResult.breakdown,
      clusterCount: confidenceResult.clusterCount,
      riskScore: riskResult.riskScore,
      riskLevel: riskResult.riskLevel,
      keywordsDetected: riskResult.detectedKeywords,
      riskBreakdown: riskResult.breakdown,
      suggestedUnits: riskResult.suggestedUnits,
      aiNotes: riskResult.aiNotes
    };
  }
};
