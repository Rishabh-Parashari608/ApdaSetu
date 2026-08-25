// Public Homepage Component

window.ApdaHomepage = {
  _graphVisible: false,
  _graphAnimated: false,

  showLossesGraph() {
    // Remove any stale modal
    const existing = document.getElementById('losses-modal-overlay');
    if (existing) { this.closeLossesModal(); return; }

    // Reset animation so it always replays on open
    this._graphAnimated = false;

    // Build modal DOM dynamically
    const overlay = document.createElement('div');
    overlay.id = 'losses-modal-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9000;
      display:flex;align-items:center;justify-content:center;
      padding:1.5rem;
      background:rgba(3,4,8,0.88);
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
      opacity:0;transition:opacity 0.35s ease;
    `;
    overlay.innerHTML = `
      <div id="losses-modal-card" style="
        position:relative;
        width:min(900px,100%);
        background:linear-gradient(145deg,rgba(18,14,6,0.98) 0%,rgba(10,8,3,0.99) 100%);
        border:1px solid rgba(251,191,36,0.22);
        border-radius:24px;
        padding:2rem;
        box-shadow:
          0 40px 100px rgba(0,0,0,0.85),
          0 0 0 1px rgba(251,191,36,0.05),
          inset 0 1px 0 rgba(255,220,80,0.06),
          0 0 80px rgba(202,138,4,0.07);
        transform:scale(0.9) translateY(24px);
        transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1),opacity 0.35s ease;
        opacity:0;
        overflow:hidden;
      ">

        <!-- Decorative amber glow orbs -->
        <div style="position:absolute;top:-70px;left:-50px;width:220px;height:220px;background:radial-gradient(circle,rgba(251,191,36,0.1),transparent 70%);pointer-events:none;border-radius:50%;"></div>
        <div style="position:absolute;bottom:-70px;right:-50px;width:240px;height:240px;background:radial-gradient(circle,rgba(202,138,4,0.08),transparent 70%);pointer-events:none;border-radius:50%;"></div>

        <!-- Header Row -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;">
          <div>
            <div style="display:flex;align-items:center;gap:0.625rem;margin-bottom:0.375rem;">
              <div style="width:28px;height:28px;border-radius:8px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.28);display:flex;align-items:center;justify-content:center;font-size:0.875rem;">📊</div>
              <span style="font-size:1.3rem;font-weight:900;color:#fbbf24;letter-spacing:-0.02em;text-shadow:0 0 20px rgba(251,191,36,0.3);">Global Disaster Losses</span>
            </div>
            <div style="font-size:0.72rem;color:#78716c;font-weight:500;padding-left:2.25rem;">
              Economic damage in USD Billions · 2000 – 2024 · Scroll to zoom · Drag to pan
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:0.625rem;flex-shrink:0;">
            <!-- Live Year / Value Counter -->
            <div style="background:rgba(120,80,0,0.12);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:0.4rem 0.875rem;display:flex;flex-direction:column;align-items:center;">
              <span id="homepage-losses-year" style="color:#fde68a;font-size:1rem;font-weight:900;line-height:1;">2000</span>
              <span id="homepage-losses-val" style="color:#f59e0b;font-size:0.75rem;font-weight:700;margin-top:1px;text-shadow:0 0 8px rgba(245,158,11,0.5);">$58B</span>
            </div>

            <!-- Replay Button -->
            <button type="button" onclick="window.ApdaHomepage.resetLossesGraph()"
              style="padding:0.45rem 0.875rem;border:1px solid rgba(251,191,36,0.22);border-radius:8px;
                     background:rgba(120,80,0,0.12);color:#fbbf24;font-size:0.72rem;
                     font-weight:700;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:0.375rem;"
              onmouseover="this.style.background='rgba(180,120,0,0.22)';this.style.borderColor='rgba(251,191,36,0.5)'"
              onmouseout="this.style.background='rgba(120,80,0,0.12)';this.style.borderColor='rgba(251,191,36,0.22)'">
              🔄 Replay
            </button>

            <!-- Close Button -->
            <button type="button" onclick="window.ApdaHomepage.closeLossesModal()"
              aria-label="Close"
              style="width:36px;height:36px;border-radius:10px;border:1px solid rgba(120,100,60,0.2);
                     background:rgba(30,22,8,0.7);color:#78716c;font-size:1rem;
                     cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;"
              onmouseover="this.style.background='rgba(239,68,68,0.15)';this.style.color='#f87171';this.style.borderColor='rgba(239,68,68,0.3)'"
              onmouseout="this.style.background='rgba(30,22,8,0.7)';this.style.color='#78716c';this.style.borderColor='rgba(120,100,60,0.2)'">
              ✕
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(251,191,36,0.18),transparent);margin-bottom:1.25rem;"></div>

        <!-- SVG Container -->
        <div style="position:relative;width:100%;background:rgba(8,6,2,0.85);border:1px solid rgba(120,90,20,0.12);border-radius:14px;overflow:hidden;touch-action:none;">
          <svg id="homepage-losses-svg" viewBox="0 0 600 200" style="width:100%;display:block;">
            <defs>
              <linearGradient id="hl-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#d97706" stop-opacity="0.45"/>
                <stop offset="60%" stop-color="#92400e" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="#78350f" stop-opacity="0.0"/>
              </linearGradient>
              <linearGradient id="hl-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#b45309"/>
                <stop offset="40%" stop-color="#f59e0b"/>
                <stop offset="100%" stop-color="#fde68a"/>
              </linearGradient>
              <filter id="hl-glow" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="4.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="hl-dot-glow" x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="3.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g id="homepage-losses-grid" stroke="rgba(120,90,20,0.12)" stroke-width="1"></g>
            <path id="homepage-losses-area" d="" fill="url(#hl-area-grad)" opacity="1"></path>
            <path id="homepage-losses-line" d="" fill="none" stroke="url(#hl-line-grad)" stroke-width="2.5" filter="url(#hl-glow)" stroke-linecap="round" stroke-linejoin="round"></path>
            <g id="homepage-losses-points"></g>
          </svg>
          <div id="homepage-losses-tooltip" style="
            position:absolute;display:none;pointer-events:none;
            background:linear-gradient(135deg,rgba(18,14,6,0.97),rgba(10,8,3,0.99));
            border:1.5px solid #f59e0b;border-radius:10px;
            padding:0.625rem 0.875rem;font-size:0.72rem;color:#fef3c7;
            box-shadow:0 12px 28px rgba(0,0,0,0.7),0 0 16px rgba(245,158,11,0.25);
            z-index:200;opacity:0;transition:opacity 0.15s ease;
            transform:translate(-50%,-100%);min-width:130px;
          "></div>
        </div>

        <!-- Footer note -->
        <div style="margin-top:1rem;text-align:center;font-size:0.65rem;color:#44403c;font-weight:500;letter-spacing:0.02em;">
          SOURCE: Munich Re NatCatSERVICE · Swiss Re sigma · World Bank · UNDRR &nbsp;·&nbsp; Values in 2024 USD
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      const card = document.getElementById('losses-modal-card');
      if (card) {
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1) translateY(0)';
        });
      }
    });

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeLossesModal();
    });

    // Close on ESC key
    this._escHandler = (e) => { if (e.key === 'Escape') this.closeLossesModal(); };
    window.addEventListener('keydown', this._escHandler);

    // Init graph after animation frame
    setTimeout(() => this.initLossesGraph(), 380);
  },

  closeLossesModal() {
    const overlay = document.getElementById('losses-modal-overlay');
    if (!overlay) return;
    const card = document.getElementById('losses-modal-card');
    if (card) { card.style.opacity = '0'; card.style.transform = 'scale(0.92) translateY(16px)'; }
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 380);
    if (this._escHandler) { window.removeEventListener('keydown', this._escHandler); this._escHandler = null; }
  },



  initLossesGraph() {
    const svg = document.getElementById('homepage-losses-svg');
    if (!svg) return;

    const data = window.ApdaSeedData.globalDisasterLosses || [];
    if (data.length === 0) return;

    const width = 600;
    const height = 200;
    const padding = { left: 50, right: 40, top: 20, bottom: 30 };

    const getX = (index) => padding.left + index * ((width - padding.left - padding.right) / (data.length - 1));
    const maxYVal = 400;
    const getY = (val) => (height - padding.bottom) - (val / maxYVal) * (height - padding.top - padding.bottom);

    const points = data.map((item, idx) => ({
      year: item.year, loss: item.loss,
      x: getX(idx), y: getY(item.loss)
    }));

    const pctChanges = data.map((item, idx) => {
      if (idx === 0) return 0;
      const prev = data[idx - 1].loss;
      return ((item.loss - prev) / prev) * 100;
    });

    // Draw Grid
    const gridG = document.getElementById('homepage-losses-grid');
    if (gridG) {
      gridG.innerHTML = '';
      [0, 100, 200, 300, 400].forEach(tick => {
        const y = getY(tick);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left); line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding.right); line.setAttribute('y2', y);
        gridG.appendChild(line);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding.left - 10); text.setAttribute('y', y + 3);
        text.setAttribute('fill', 'rgba(180,140,60,0.5)'); text.setAttribute('font-size', '9');
        text.setAttribute('font-weight', '700'); text.setAttribute('text-anchor', 'end');
        text.textContent = '$' + tick + 'B';
        gridG.appendChild(text);
      });
      data.forEach((item, idx) => {
        if (item.year % 5 === 0 || item.year === 2024) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', getX(idx)); text.setAttribute('y', height - 10);
          text.setAttribute('fill', 'rgba(180,140,60,0.5)'); text.setAttribute('font-size', '9');
          text.setAttribute('font-weight', '700'); text.setAttribute('text-anchor', 'middle');
          text.textContent = item.year;
          gridG.appendChild(text);
        }
      });
    }

    const linePath = document.getElementById('homepage-losses-line');
    const areaPath = document.getElementById('homepage-losses-area');
    const pointsG  = document.getElementById('homepage-losses-points');
    const yearEl   = document.getElementById('homepage-losses-year');
    const valEl    = document.getElementById('homepage-losses-val');
    const tooltip  = document.getElementById('homepage-losses-tooltip');

    let currentVb = [0, 0, width, height];
    const setVb = () => svg.setAttribute('viewBox', currentVb.join(' '));

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const enableInteractivity = () => {
      currentVb = [0, 0, width, height]; setVb();
      const lineD = 'M ' + points.map(p => p.x + ' ' + p.y).join(' L ');
      linePath.setAttribute('d', lineD);
      const areaD = lineD + ' L ' + points[points.length-1].x + ' ' + (height - padding.bottom) + ' L ' + points[0].x + ' ' + (height - padding.bottom) + ' Z';
      areaPath.setAttribute('d', areaD);
      if (pointsG) {
        pointsG.innerHTML = '';
        points.forEach((pt, idx) => {
          const isLatest = idx === points.length - 1;
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y);
          c.setAttribute('r', isLatest ? '6' : '3.5');
          c.setAttribute('fill', isLatest ? '#f59e0b' : '#0a0802');
          c.setAttribute('stroke', '#fbbf24'); c.setAttribute('stroke-width', '2');
          c.style.cursor = 'pointer';
          if (isLatest) c.style.filter = 'drop-shadow(0 0 6px #f59e0b)';

          c.addEventListener('mouseenter', () => {
            c.setAttribute('r', isLatest ? '8' : '6');
            const pct = pctChanges[idx];
            const arrow = pct >= 0 ? '▲' : '▼';
            const pctHtml = idx > 0
              ? '<div style="color:' + (pct >= 0 ? '#f87171' : '#34d399') + ';font-size:0.65rem;font-weight:600;margin-top:2px">' + arrow + ' ' + Math.abs(pct).toFixed(1) + '% vs prev year</div>'
              : '<div style="color:#92400e;font-size:0.65rem;font-weight:600;margin-top:2px">— base year</div>';
            tooltip.innerHTML = '<div style="font-weight:800;color:#fbbf24">' + pt.year + '</div><div style="font-weight:700;color:#fef3c7">Losses: $' + pt.loss + 'B</div>' + pctHtml;
            const rect = svg.getBoundingClientRect();
            const sx = rect.width / currentVb[2], sy = rect.height / currentVb[3];
            tooltip.style.left = ((pt.x - currentVb[0]) * sx) + 'px';
            tooltip.style.top  = ((pt.y - currentVb[1]) * sy - 12) + 'px';
            tooltip.style.display = 'block'; tooltip.style.opacity = '1';
          });
          c.addEventListener('mouseleave', () => {
            c.setAttribute('r', isLatest ? '6' : '3.5');
            tooltip.style.opacity = '0';
            setTimeout(() => { tooltip.style.display = 'none'; }, 150);
          });
          pointsG.appendChild(c);
        });
      }
      if (yearEl) yearEl.textContent = '2024';
      if (valEl)  valEl.textContent  = '$280B';
      this._graphAnimated = true;

      // Pan
      let dragging = false, ds = {x:0,y:0};
      svg.style.cursor = 'grab';
      svg.addEventListener('mousedown', e => { dragging = true; svg.style.cursor='grabbing'; ds={x:e.clientX,y:e.clientY}; });
      window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const rect = svg.getBoundingClientRect();
        const dx = (e.clientX - ds.x) * (currentVb[2]/rect.width);
        const dy = (e.clientY - ds.y) * (currentVb[3]/rect.height);
        currentVb[0] = Math.max(-100, Math.min(width - currentVb[2] + 100, currentVb[0] - dx));
        currentVb[1] = Math.max(-50, Math.min(height - currentVb[3] + 50, currentVb[1] - dy));
        setVb(); ds = {x:e.clientX,y:e.clientY};
      });
      window.addEventListener('mouseup', () => { dragging = false; svg.style.cursor='grab'; });
      svg.addEventListener('wheel', e => {
        e.preventDefault();
        const rect = svg.getBoundingClientRect();
        const mx = currentVb[0] + (e.clientX - rect.left)/rect.width * currentVb[2];
        const my = currentVb[1] + (e.clientY - rect.top)/rect.height * currentVb[3];
        const f = e.deltaY < 0 ? 0.9 : 1.1;
        const nw = currentVb[2] * f, nh = currentVb[3] * f;
        if (nw > width * 1.5 || nw < 80) return;
        currentVb[0] = mx - (e.clientX-rect.left)/rect.width * nw;
        currentVb[1] = my - (e.clientY-rect.top)/rect.height * nh;
        currentVb[2] = nw; currentVb[3] = nh; setVb();
      }, { passive: false });
    };

    if (prefersReduced || this._graphAnimated) { enableInteractivity(); return; }

    const duration = 5000;
    const startTime = performance.now();
    const run = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ep = progress < 0.5 ? 2*progress*progress : -1 + (4 - 2*progress)*progress;
      const mif = ep * (points.length - 1);
      const mi  = Math.floor(mif);
      const seg = mif - mi;
      let cPts = points.slice(0, mi + 1);
      let tx = points[mi].x, ty = points[mi].y;
      if (mi < points.length - 1) {
        const np = points[mi+1];
        tx = points[mi].x + seg*(np.x - points[mi].x);
        ty = points[mi].y + seg*(np.y - points[mi].y);
        cPts = [...cPts, {x:tx, y:ty}];
      }
      const lineD = 'M ' + cPts.map(p => p.x + ' ' + p.y).join(' L ');
      linePath.setAttribute('d', lineD);
      areaPath.setAttribute('d', lineD + ' L ' + tx + ' ' + (height-padding.bottom) + ' L ' + points[0].x + ' ' + (height-padding.bottom) + ' Z');

      if (pointsG) {
        pointsG.innerHTML = '';
        for (let i = 0; i <= mi; i++) {
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('cx', points[i].x); c.setAttribute('cy', points[i].y);
          c.setAttribute('r', '3.5'); c.setAttribute('fill', '#0a0802');
          c.setAttribute('stroke', '#f59e0b'); c.setAttribute('stroke-width', '2');
          pointsG.appendChild(c);
        }
        const tip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        tip.setAttribute('cx', tx); tip.setAttribute('cy', ty);
        tip.setAttribute('r', '5.5'); tip.setAttribute('fill', '#fbbf24');
        tip.setAttribute('stroke', '#fff8e1'); tip.setAttribute('stroke-width', '1.5');
        tip.style.filter = 'drop-shadow(0 0 6px #f59e0b)';
        pointsG.appendChild(tip);
      }

      const ci = Math.min(24, Math.round(ep * 24));
      if (yearEl) yearEl.textContent = 2000 + ci;
      if (valEl)  valEl.textContent  = '$' + points[ci].loss + 'B';

      const vbW = 120 + ep * (width - 120);
      currentVb = [0, 0, vbW, height]; setVb();

      if (progress < 1) { requestAnimationFrame(run); }
      else { enableInteractivity(); }
    };
    requestAnimationFrame(run);
  },

  resetLossesGraph() {
    this._graphAnimated = false;
    this.initLossesGraph();
  },

  render() {
    const t = (k) => window.ApdaI18n.t(k);
    const alerts = window.ApdaState.alerts;

    // Helper to split text into animated words and characters for smooth left-to-right typing reveal
    const animateText = (text, startIndex = 0, charDelay = 0.045) => {
      const words = text.split(' ');
      let charCount = startIndex;
      const wordSpans = words.map(word => {
        const chars = word.split('').map(char => {
          const delay = charCount * charDelay;
          charCount++;
          return `<span class="animate-char-reveal" style="animation-delay: ${delay.toFixed(3)}s">${char}</span>`;
        }).join('');
        return `<span class="inline-block whitespace-nowrap">${chars}</span>`;
      });
      return { html: wordSpans.join(' '), nextIndex: charCount };
    };

    const line1 = animateText("Rapid Alert & AI-Powered Rescue", 0, 0.045);

    return `
      <div class="min-h-screen pb-20">
        
        <!-- Live Disaster Alert Marquee Bar -->
        <div class="bg-red-950/80 border-b border-red-500/30 py-2.5 px-4 overflow-hidden relative">
          <div class="max-w-7xl mx-auto flex items-center gap-3">
            <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[11px] uppercase tracking-wider flex-shrink-0 animate-pulse">
              <span>⚠️</span> LIVE ALERTS
            </span>
            <div class="overflow-hidden flex-1 relative whitespace-nowrap">
              <div class="animate-marquee inline-block text-xs font-semibold text-red-200">
                ${alerts.map(a => `
                  <span class="inline-flex items-center gap-2 mx-6">
                    <span class="w-2 h-2 rounded-full ${a.severity === 'critical' ? 'bg-red-400 animate-ping' : 'bg-amber-400'}"></span>
                    <strong>${a.region}:</strong> ${a.title}
                  </span>
                `).join(' • ')}
              </div>
            </div>
          </div>
        </div>

        <!-- Hero Section -->
        <section class="home-hero reveal-on-scroll relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-none mx-auto">
          
          <div class="hero-slideshow">
            <div class="hero-slide slide-1"><img src="assets/disaster_flood.jpg" alt="" /></div>
            <div class="hero-slide slide-2"><img src="assets/disaster_cyclone.jpg" alt="" /></div>
            <div class="hero-slide slide-3"><img src="assets/disaster_landslide.jpg" alt="" /></div>
            <div class="hero-slide slide-4"><img src="assets/disaster_earthquake.jpg" alt="" /></div>
            <div class="hero-slide slide-5"><img src="assets/disaster_wildfire.jpg" alt="" /></div>
          </div>

          <div class="home-hero-overlay absolute inset-0 rounded-[2rem] pointer-events-none"></div>
          <!-- Background Glows -->
          <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute top-1/3 right-10 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div class="home-hero__content text-left relative z-10 max-w-3xl mr-auto ml-0">
            
            <div class="home-hero__eyebrow inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-300/25 text-cyan-200 text-xs font-bold mb-6">
              <span class="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></span>
              National Multi-Agency Disaster Coordination Bridge
            </div>

            <h1 class="home-hero__title text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight" aria-label="Rapid Alert &amp; AI-Powered Rescue When Seconds Save Lives.">
              <span aria-hidden="true">
                ${line1.html} <br>
                <span class="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent typing-reveal-line-2">
                  When Seconds Save Lives.
                </span>
              </span>
            </h1>

            <p class="mt-6 max-w-2xl mr-auto text-sm sm:text-base text-slate-300 leading-relaxed">
              ${t('missionStatement')}
            </p>

            <!-- Hero Action Buttons -->
            <div class="mt-8 flex flex-col sm:flex-row items-center justify-start gap-4">
              <button onclick="window.ApdaSOSModal.openReportModal()" class="hero-primary-cta w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                <span class="text-xl">🚨</span>
                ${t('reportDisasterNow')}
              </button>

              <button onclick="window.ApdaAuthModal.open('citizen', 'login')" class="hero-secondary-cta w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                <span>📍</span>
                ${t('enterWebsite')}
              </button>

              <button id="homepage-losses-btn" onclick="window.ApdaHomepage.showLossesGraph()" class="w-full sm:w-auto px-7 py-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 hover:border-cyan-400/50 text-cyan-300 font-bold text-sm transition-all flex items-center justify-center gap-2">
                <span>📊</span>
                <span class="losses-btn-label">View Global Disaster Losses</span>
              </button>
            </div>

            <!-- Fast Stat Counters -->
            <div class="stats-bar reveal-on-scroll grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 p-3 sm:p-4 rounded-2xl text-left">
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="stat-icon text-cyan-300 mb-3">⚠️</span>
                <span class="text-2xl font-black text-white">5</span>
                <p class="text-xs text-amber-300 font-semibold mt-0.5">Active Critical Zones</p>
                <p class="text-[10px] text-slate-400">Assam, Odisha, UK, MH</p>
              </div>
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="stat-icon text-emerald-300 mb-3">🛟</span>
                <span class="text-2xl font-black text-emerald-400">1,840+</span>
                <p class="text-xs text-slate-300 font-semibold mt-0.5">${t('citizensRescued')}</p>
                <p class="text-[10px] text-slate-400">Past 48 Hours</p>
              </div>
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="stat-icon text-amber-300 mb-3">🏠</span>
                <span class="text-2xl font-black text-amber-400">1,600 Beds</span>
                <p class="text-xs text-slate-300 font-semibold mt-0.5">${t('activeShelters')}</p>
                <p class="text-[10px] text-slate-400">With Live Vacancy</p>
              </div>
              <div class="glass-panel p-4 rounded-2xl border border-white/10">
                <span class="stat-icon text-sky-300 mb-3">⏱️</span>
                <span class="text-2xl font-black text-info-sky">11 Mins</span>
                <p class="text-xs text-slate-300 font-semibold mt-0.5">Avg Response Time</p>
                <p class="text-[10px] text-slate-400">AI Triage to Dispatch</p>
              </div>
            </div>

          </div>
        </section>

        <!-- 4-Step Interactive Flow Section -->
        <section class="reveal-on-scroll py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs font-extrabold text-amber-300 uppercase tracking-widest block mb-2">END-TO-END WORKFLOW</span>
            <h2 class="text-3xl font-extrabold text-white">${t('howItWorks')}</h2>
            <p class="text-xs sm:text-sm text-slate-400 mt-2">
              From the moment a citizen clicks SOS to boots on the ground and safe shelter transfer.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <!-- Step 1 -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all relative group">
              <div class="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-400/30 flex items-center justify-center text-2xl font-black mb-4 group-hover:scale-110 transition-transform">
                📱
              </div>
              <span class="text-xs font-bold text-amber-300 uppercase tracking-wider">Step 01</span>
              <h3 class="font-extrabold text-base text-white mt-1">${t('step1Title')}</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                ${t('step1Desc')}
              </p>
            </div>

            <!-- Step 2 -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all relative group">
              <div class="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl font-black mb-4 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 02</span>
              <h3 class="font-extrabold text-base text-white mt-1">${t('step2Title')}</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                ${t('step2Desc')}
              </p>
            </div>

            <!-- Step 3 -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-orange-400/40 transition-all relative group">
              <div class="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-2xl font-black mb-4 group-hover:scale-110 transition-transform">
                🚒
              </div>
              <span class="text-xs font-bold text-orange-400 uppercase tracking-wider">Step 03</span>
              <h3 class="font-extrabold text-base text-white mt-1">${t('step3Title')}</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                ${t('step3Desc')}
              </p>
            </div>

            <!-- Step 4 -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all relative group">
              <div class="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl font-black mb-4 group-hover:scale-110 transition-transform">
                🏠
              </div>
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 04</span>
              <h3 class="font-extrabold text-base text-white mt-1">${t('step4Title')}</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                ${t('step4Desc')}
              </p>
            </div>

          </div>
        </section>

        <!-- Feature Highlight Cards -->
        <section class="reveal-on-scroll py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs font-extrabold text-amber-300 uppercase tracking-widest block mb-2">PLATFORM CAPABILITIES</span>
            <h2 class="text-3xl font-extrabold text-white">Built for Critical Disaster Infrastructure</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <!-- Feature 1: Multi-Channel Communication -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">📡</div>
              <h3 class="font-bold text-lg text-white">Multi-Channel Broadcast Alerting</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Simultaneous web push, SMS (MSG91/Twilio stub), WhatsApp notifications, and audio siren chimes reach vulnerable communities across all channels.
              </p>
            </div>

            <!-- Feature 2: Community Help Chat -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">💬</div>
              <h3 class="font-bold text-lg text-white">Community Help Chat Rooms</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Disaster & location-based mutual aid channels where citizens coordinate water, shelter space, boat transport, hazard alerts, and volunteer moderation.
              </p>
            </div>

            <!-- Feature 3: Interactive Shelter Map -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">🗺️</div>
              <h3 class="font-bold text-lg text-white">Live Shelter Vacancy Network</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Real-time occupancy tracking across NDRF and district shelters, with facilities breakdown (hot meals, infant care, medical bay) and navigation paths.
              </p>
            </div>

            <!-- Feature 4: Unified Command Dashboard -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">⚡</div>
              <h3 class="font-bold text-lg text-white">Unified Responder Command Center</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Live verification triage queue with explainable AI scores, cluster anomaly detection, and seamless multi-agency resource dispatch.
              </p>
            </div>

            <!-- Feature 5: Family Safety Circle -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">👨‍👩‍👧</div>
              <h3 class="font-bold text-lg text-white">Family Safety Circle & Check-in</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                One-tap "I Am Safe" signal broadcast, battery & location status pinging, and peace-of-mind tracking during communication blackouts.
              </p>
            </div>

            <!-- Feature 6: Offline PWA & Low-Bandwidth -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <div class="text-3xl mb-3">📶</div>
              <h3 class="font-bold text-lg text-white">Offline PWA & Low-Bandwidth Mode</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Service Worker caches critical Do's & Don'ts and offline SOS queues that auto-sync once cell reception is restored.
              </p>
            </div>

          </div>
        </section>

        <!-- Emergency Helplines Quick Banner -->
        <section class="reveal-on-scroll py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="glass-panel-danger rounded-3xl p-6 sm:p-8 border-2 border-red-500/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center text-3xl flex-shrink-0 animate-pulse">
                📞
              </div>
              <div>
                <h3 class="text-xl font-black text-white">24/7 National Disaster Emergency Hotlines</h3>
                <p class="text-xs text-slate-300 mt-1">Dial 112 (Unified), 1078 (NDRF), 108 (Ambulance), 101 (Fire) — Toll-free across India</p>
              </div>
            </div>
            <button onclick="window.ApdaEmergencyCallModal.open()" class="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap shadow-lg shadow-red-600/40">
              View All Helpline Numbers →
            </button>
          </div>
        </section>

      </div>
    `;
  }
};

window.ApdaEmergencyAssistant = {
  isOpen: false,
  position: null,
  messages: [{ role: 'assistant', text: 'Hello. I can help you understand local risk status, evacuation steps, nearby shelters, and medical support.', source: 'Safety guidance' }],

  renderWidget() {
    return `
      <aside id="emergency-ai-widget" class="emergency-ai-widget ${this.isOpen ? 'is-open' : ''}" aria-label="Emergency AI Assistant">
        <section id="emergency-ai-panel" class="emergency-assistant emergency-ai-panel" style="${this.position ? `left:${this.position.left}px;top:${this.position.top}px;right:auto;bottom:auto;` : ''}" aria-hidden="${!this.isOpen}">
          <div id="emergency-ai-drag-handle" class="emergency-assistant__header emergency-ai-panel__header">
            <div class="flex min-w-0 items-center gap-3">
              <div class="emergency-assistant__bot-icon" aria-hidden="true">&#129302;</div>
              <div class="min-w-0">
                <h2 class="truncate text-sm font-extrabold tracking-wide text-white">Emergency AI Assistant</h2>
                <p class="mt-0.5 truncate text-[10px] text-amber-100/70">Safety guidance &amp; emergency resources</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="emergency-ai-status"><i></i> Ready</span>
              <button type="button" onclick="window.ApdaEmergencyAssistant.close()" class="emergency-ai-cancel" aria-label="Close emergency assistant" title="Close assistant">&#215;</button>
            </div>
          </div>
          <div id="emergency-ai-history" class="emergency-assistant__messages chat-scroll space-y-3 px-4 py-4" aria-live="polite">
            ${this.messages.map(message => this.renderMessage(message.role, message.text, message.source)).join('')}
          </div>
          <div class="emergency-ai-panel__footer">
            <div class="mb-2 flex flex-wrap gap-1.5" aria-label="Suggested questions">
              <button type="button" onclick="window.ApdaEmergencyAssistant.askSuggestion('Where is the nearest shelter?')" class="emergency-assistant__suggestion">Nearest shelter</button>
              <button type="button" onclick="window.ApdaEmergencyAssistant.askSuggestion('What should I do during a flood?')" class="emergency-assistant__suggestion">Flood safety</button>
              <button type="button" onclick="window.ApdaEmergencyAssistant.askSuggestion('Where is the nearest hospital?')" class="emergency-assistant__suggestion">Medical support</button>
            </div>
            <form onsubmit="window.ApdaEmergencyAssistant.handleSubmit(event)" class="flex items-center gap-2">
              <label class="sr-only" for="emergency-ai-input">Ask the emergency AI assistant</label>
              <input id="emergency-ai-input" type="text" required maxlength="500" autocomplete="off" placeholder="Ask about safety, shelters, or medical help..." class="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none">
              <button type="submit" class="emergency-assistant__send shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-950 transition-all">Send <span aria-hidden="true">&#8594;</span></button>
            </form>
            <p class="mt-2 text-[9px] leading-relaxed text-amber-50/55">Immediate danger? Call <a class="font-extrabold text-amber-300 hover:text-amber-100" href="tel:112">112</a>. AI guidance does not replace official instructions.</p>
          </div>
        </section>
        <button type="button" onclick="window.ApdaEmergencyAssistant.toggle()" class="emergency-ai-launcher" aria-expanded="${this.isOpen}" aria-controls="emergency-ai-panel">
          <span class="emergency-ai-launcher__icon" aria-hidden="true">&#129302;</span>
          <span>Emergency AI</span>
          <i aria-hidden="true"></i>
        </button>
      </aside>
    `;
  },

  toggle() { this.isOpen = !this.isOpen; window.ApdaApp.render(); },
  close() { this.isOpen = false; window.ApdaApp.render(); },

  renderMessage(role, text, source) {
    const isUser = role === 'user';
    return `
      <div class="emergency-assistant__message ${isUser ? 'emergency-assistant__message--user' : 'emergency-assistant__message--bot'}">
        <p>${this.escapeHtml(text)}</p>
        ${source ? `<span>${this.escapeHtml(source)}</span>` : ''}
      </div>
    `;
  },

  escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = String(value || '');
    return element.innerHTML;
  },

  appendMessage(role, text, source) {
    this.messages.push({ role, text, source });
    const history = document.getElementById('emergency-ai-history');
    if (!history) return;
    history.insertAdjacentHTML('beforeend', this.renderMessage(role, text, source));
    history.scrollTop = history.scrollHeight;
  },

  fallbackResponse(query) {
    if (/shelter|safe area/i.test(query)) return 'Open the Shelter Map from the citizen dashboard for live locations and vacancies. If travel is unsafe, call 112 for evacuation guidance.';
    if (/flood|water/i.test(query)) return 'Move to higher ground, avoid flooded roads and drains, switch off electricity if it is safe to do so, and follow district authority alerts.';
    if (/hospital|medical|doctor|injur/i.test(query)) return 'For urgent medical care, call 108. Keep the person warm and safe, avoid moving anyone with a suspected spine injury, and share your location with responders.';
    return 'Please follow verified instructions from local emergency managers. For immediate danger, call 112 or submit an SOS report through ApdaSetu.';
  },

  async ask(query) {
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery) return;
    this.appendMessage('user', cleanQuery);
    const history = document.getElementById('emergency-ai-history');
    if (!history) return;
    const loading = document.createElement('div');
    loading.className = 'emergency-assistant__message emergency-assistant__message--bot emergency-assistant__typing';
    loading.textContent = 'Checking safety guidance…';
    history.appendChild(loading);
    history.scrollTop = history.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery })
      });
      if (!response.ok) throw new Error('Chat service unavailable');
      const data = await response.json();
      loading.remove();
      this.appendMessage('assistant', data.response || this.fallbackResponse(cleanQuery), data.source || 'Emergency knowledge base');
    } catch (error) {
      loading.remove();
      this.appendMessage('assistant', this.fallbackResponse(cleanQuery), 'Offline safety guidance');
    }
  },

  handleSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('emergency-ai-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;
    input.value = '';
    this.ask(query);
  },

  askSuggestion(query) {
    this.ask(query);
  },

  initDrag() {
    const panel = document.getElementById('emergency-ai-panel');
    const handle = document.getElementById('emergency-ai-drag-handle');
    if (!panel || !handle) return;
    let startX; let startY; let originLeft; let originTop;
    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      startX = event.clientX; startY = event.clientY;
      const rect = panel.getBoundingClientRect();
      originLeft = rect.left; originTop = rect.top;
      panel.classList.add('is-dragging');
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', (event) => {
      if (!panel.classList.contains('is-dragging')) return;
      const maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
      panel.style.left = `${Math.min(maxLeft, Math.max(8, originLeft + event.clientX - startX))}px`;
      panel.style.top = `${Math.min(maxTop, Math.max(8, originTop + event.clientY - startY))}px`;
      panel.style.right = 'auto'; panel.style.bottom = 'auto';
      this.position = { left: parseInt(panel.style.left, 10), top: parseInt(panel.style.top, 10) };
    });
    const stopDrag = () => panel.classList.remove('is-dragging');
    handle.addEventListener('pointerup', stopDrag);
    handle.addEventListener('pointercancel', stopDrag);
  }
};
