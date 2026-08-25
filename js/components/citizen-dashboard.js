// ═══════════════════════════════════════════════════════════════
// ApdaCitizenDashboard — Professional Emergency Operations Layout
// Complete redesign with serious color palette & modern architecture
// ═══════════════════════════════════════════════════════════════

window.ApdaCitizenDashboard = {
  lossesGraphAnimated: false,
  initLossesGraph() {
    const card = document.getElementById('apd-losses-graph-card');
    if (!card) return;

    // Fade in graph container
    setTimeout(() => {
      card.style.opacity = '1';
    }, 50);

    const svg = document.getElementById('apd-losses-svg');
    if (!svg) return;

    const data = window.ApdaSeedData.globalDisasterLosses || [];
    if (data.length === 0) return;

    const width = 600;
    const height = 200;
    const padding = { left: 50, right: 40, top: 20, bottom: 30 };

    // X-scale maps indices (0 to data.length - 1) to (padding.left to width - padding.right)
    const getX = (index) => padding.left + index * ((width - padding.left - padding.right) / (data.length - 1));

    // Y-scale maps losses (0 to 400) to (height - padding.bottom to padding.top)
    const maxYVal = 400;
    const getY = (val) => (height - padding.bottom) - (val / maxYVal) * (height - padding.top - padding.bottom);

    // Save calculated coordinates for reference
    const points = data.map((item, idx) => ({
      year: item.year,
      loss: item.loss,
      x: getX(idx),
      y: getY(item.loss)
    }));

    // Precalculate % changes
    const pctChanges = data.map((item, idx) => {
      if (idx === 0) return 0;
      const prev = data[idx - 1].loss;
      return ((item.loss - prev) / prev) * 100;
    });

    // Draw Grid Lines & Axes Labels
    const gridG = document.getElementById('apd-losses-grid');
    if (gridG) {
      gridG.innerHTML = '';
      const yTicks = [0, 100, 200, 300, 400];
      yTicks.forEach(tick => {
        const y = getY(tick);
        // Draw grid line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y2', y);
        gridG.appendChild(line);

        // Draw Y label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding.left - 10);
        text.setAttribute('y', y + 3);
        text.setAttribute('fill', 'rgba(148, 163, 184, 0.45)');
        text.setAttribute('font-size', '9');
        text.setAttribute('font-weight', '700');
        text.setAttribute('text-anchor', 'end');
        text.textContent = `$${tick}B`;
        gridG.appendChild(text);
      });

      // Draw X axis years (every 5 years to keep it clean: 2000, 2005, 2010, 2015, 2020, 2024)
      data.forEach((item, idx) => {
        if (item.year % 5 === 0 || item.year === 2024) {
          const x = getX(idx);
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', x);
          text.setAttribute('y', height - 10);
          text.setAttribute('fill', 'rgba(148, 163, 184, 0.45)');
          text.setAttribute('font-size', '9');
          text.setAttribute('font-weight', '700');
          text.setAttribute('text-anchor', 'middle');
          text.textContent = item.year;
          gridG.appendChild(text);
        }
      });
    }

    const linePath = document.getElementById('apd-losses-line');
    const areaPath = document.getElementById('apd-losses-area');
    const pointsG = document.getElementById('apd-losses-points');
    const yearCounter = document.getElementById('apd-graph-year-counter');
    const valueCounter = document.getElementById('apd-graph-value-counter');
    const tooltip = document.getElementById('apd-graph-tooltip');

    let isDragPanning = false;
    let dragStart = { x: 0, y: 0 };
    // Current viewBox state: [minX, minY, width, height]
    let currentVb = [0, 0, width, height];

    const updateViewBoxAttr = () => {
      svg.setAttribute('viewBox', currentVb.join(' '));
    };

    const animateGraph = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        window.ApdaCitizenDashboard.lossesGraphAnimated = true;
        enableInteractivity();
        return;
      }

      const duration = 5000; // exactly 5 seconds
      const startTime = performance.now();

      const run = (now) => {
        const elapsed = now - startTime;
        let progress = Math.min(elapsed / duration, 1);

        // Smooth ease-in-out progress curve
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;

        const maxIndexFloat = easeProgress * (points.length - 1);
        const maxIndex = Math.floor(maxIndexFloat);
        const segmentProgress = maxIndexFloat - maxIndex;

        let currentPoints = points.slice(0, maxIndex + 1);
        let tipX = points[maxIndex].x;
        let tipY = points[maxIndex].y;

        if (maxIndex < points.length - 1) {
          const nextPt = points[maxIndex + 1];
          tipX = points[maxIndex].x + segmentProgress * (nextPt.x - points[maxIndex].x);
          tipY = points[maxIndex].y + segmentProgress * (nextPt.y - points[maxIndex].y);
          currentPoints.push({ x: tipX, y: tipY });
        }

        // Draw Line
        const lineD = 'M ' + currentPoints.map(p => `${p.x} ${p.y}`).join(' L ');
        linePath.setAttribute('d', lineD);

        // Draw Area
        const areaD = `${lineD} L ${tipX} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
        areaPath.setAttribute('d', areaD);

        // Draw circles for completed points
        if (pointsG) {
          pointsG.innerHTML = '';
          for (let i = 0; i <= maxIndex; i++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', points[i].x);
            circle.setAttribute('cy', points[i].y);
            circle.setAttribute('r', i === maxIndex && maxIndex === points.length - 1 ? '6' : '3.5');
            circle.setAttribute('fill', '#090d16');
            circle.setAttribute('stroke', '#22d3ee');
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('class', 'apd-losses-svg-point');
            pointsG.appendChild(circle);
          }
          // Dynamic glowing point for the current drawing tip
          const tipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          tipCircle.setAttribute('cx', tipX);
          tipCircle.setAttribute('cy', tipY);
          tipCircle.setAttribute('r', '5.5');
          tipCircle.setAttribute('fill', '#22d3ee');
          tipCircle.setAttribute('stroke', '#ffffff');
          tipCircle.setAttribute('stroke-width', '1.5');
          tipCircle.setAttribute('style', 'filter: drop-shadow(0px 0px 4px #22d3ee);');
          pointsG.appendChild(tipCircle);
        }

        // Dynamic Counters
        const currentYear = 2000 + Math.round(easeProgress * 24);
        const currentIdx = Math.min(24, Math.round(easeProgress * 24));
        if (yearCounter) yearCounter.textContent = currentYear;
        if (valueCounter) valueCounter.textContent = `$${points[currentIdx].loss}B`;

        // Smooth camera zoom out effect
        const vbWidth = 120 + easeProgress * (width - 120);
        currentVb = [0, 0, vbWidth, height];
        updateViewBoxAttr();

        if (progress < 1) {
          requestAnimationFrame(run);
        } else {
          // Animation completed
          window.ApdaCitizenDashboard.lossesGraphAnimated = true;
          enableInteractivity();
        }
      };

      requestAnimationFrame(run);
    };

    const enableInteractivity = () => {
      // 1. Reset viewBox to standard
      currentVb = [0, 0, width, height];
      updateViewBoxAttr();

      // 2. Draw standard full paths
      const lineD = 'M ' + points.map(p => `${p.x} ${p.y}`).join(' L ');
      linePath.setAttribute('d', lineD);
      const areaD = `${lineD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
      areaPath.setAttribute('d', areaD);

      // Render all hoverable points
      if (pointsG) {
        pointsG.innerHTML = '';
        points.forEach((pt, idx) => {
          const isLatest = idx === points.length - 1;
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', pt.x);
          circle.setAttribute('cy', pt.y);
          circle.setAttribute('r', isLatest ? '6' : '3.5');
          circle.setAttribute('fill', isLatest ? '#22d3ee' : '#090d16');
          circle.setAttribute('stroke', '#22d3ee');
          circle.setAttribute('stroke-width', '2');
          circle.setAttribute('class', 'apd-losses-svg-point');
          if (isLatest) {
            circle.setAttribute('style', 'filter: drop-shadow(0px 0px 4px #22d3ee);');
          }

          // Tooltip Hover Listeners
          circle.addEventListener('mouseenter', (e) => {
            circle.setAttribute('r', isLatest ? '8' : '6.5');
            const pct = pctChanges[idx];
            let pctHtml = '';
            if (idx > 0) {
              const direction = pct >= 0 ? 'up' : 'down';
              const arrow = pct >= 0 ? '▲' : '▼';
              pctHtml = `<div class="apd-graph-tooltip-diff ${direction}">${arrow} ${Math.abs(pct).toFixed(1)}% vs prev year</div>`;
            } else {
              pctHtml = `<div class="apd-graph-tooltip-diff flat">— base year</div>`;
            }

            tooltip.innerHTML = `
              <div class="apd-graph-tooltip-year">${pt.year}</div>
              <div class="apd-graph-tooltip-loss">Losses: $${pt.loss} Billion</div>
              ${pctHtml}
            `;

            // Position tooltip relative to the SVG element
            const rect = svg.getBoundingClientRect();
            const scaleX = rect.width / currentVb[2];
            const scaleY = rect.height / currentVb[3];
            const clientX = (pt.x - currentVb[0]) * scaleX;
            const clientY = (pt.y - currentVb[1]) * scaleY;

            tooltip.style.left = `${clientX}px`;
            tooltip.style.top = `${clientY - 12}px`;
            tooltip.classList.add('is-visible');
          });

          circle.addEventListener('mouseleave', () => {
            circle.setAttribute('r', isLatest ? '6' : '3.5');
            tooltip.classList.remove('is-visible');
          });

          pointsG.appendChild(circle);
        });
      }

      // Restore final year / loss values to UI header
      if (yearCounter) yearCounter.textContent = '2024';
      if (valueCounter) valueCounter.textContent = `$280B`;

      // 3. Pan and Zoom Handlers
      svg.classList.add('apd-losses-svg-interactive');

      // Mouse drag to pan
      svg.addEventListener('mousedown', (e) => {
        isDragPanning = true;
        svg.classList.add('apd-losses-svg-panning');
        dragStart = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragPanning) return;
        const rect = svg.getBoundingClientRect();
        const scaleX = currentVb[2] / rect.width;
        const scaleY = currentVb[3] / rect.height;

        const dx = (e.clientX - dragStart.x) * scaleX;
        const dy = (e.clientY - dragStart.y) * scaleY;

        currentVb[0] -= dx;
        currentVb[1] -= dy;

        // Constraint panning inside realistic bounds
        currentVb[0] = Math.max(-100, Math.min(width - currentVb[2] + 100, currentVb[0]));
        currentVb[1] = Math.max(-50, Math.min(height - currentVb[3] + 50, currentVb[1]));

        updateViewBoxAttr();
        dragStart = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('mouseup', () => {
        if (isDragPanning) {
          isDragPanning = false;
          svg.classList.remove('apd-losses-svg-panning');
        }
      });

      // Scroll wheel to zoom
      svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const svgMouseX = currentVb[0] + (mouseX / rect.width) * currentVb[2];
        const svgMouseY = currentVb[1] + (mouseY / rect.height) * currentVb[3];

        const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;

        const newWidth = currentVb[2] * zoomFactor;
        const newHeight = currentVb[3] * zoomFactor;

        if (newWidth > width * 1.5 || newWidth < 80) return;

        currentVb[0] = svgMouseX - (mouseX / rect.width) * newWidth;
        currentVb[1] = svgMouseY - (mouseY / rect.height) * newHeight;
        currentVb[2] = newWidth;
        currentVb[3] = newHeight;

        updateViewBoxAttr();
      });
    };

    if (!window.ApdaCitizenDashboard.lossesGraphAnimated) {
      animateGraph();
    } else {
      enableInteractivity();
    }
  },

  resetGraphAnimation() {
    window.ApdaCitizenDashboard.lossesGraphAnimated = false;
    this.initLossesGraph();
  },

  showForecast() {
    const modal = document.getElementById('apd-forecast-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    this.selectForecast('Today', '28', '72', 'Heavy rain expected. Keep an umbrella handy and plan travel carefully.', '89', '24', '2');
  },
  toggleCalendar() {
    const calendar = document.getElementById('apd-forecast-calendar');
    if (!calendar) return;
    calendar.classList.toggle('is-open');
    if (calendar.classList.contains('is-open')) this.renderCalendar();
  },
  changeCalendarMonth(offset) {
    const cursor = this.calendarCursor || new Date();
    this.calendarCursor = new Date(cursor.getFullYear(), cursor.getMonth() + offset, 1);
    this.renderCalendar('is-shifting');
  },
  changeCalendarYear(offset) {
    const cursor = this.calendarCursor || new Date();
    this.calendarCursor = new Date(cursor.getFullYear() + offset, cursor.getMonth(), 1);
    this.renderCalendar('is-shifting');
  },
  renderCalendar(animationClass = '') {
    const cursor = this.calendarCursor || new Date();
    this.calendarCursor = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthLabel = document.getElementById('apd-calendar-month');
    const grid = document.getElementById('apd-calendar-grid');
    if (!monthLabel || !grid) return;
    const monthName = this.calendarCursor.toLocaleDateString('en-IN', { month: 'long' });
    monthLabel.textContent = `${monthName} ${this.calendarCursor.getFullYear()}`;
    const firstWeekday = this.calendarCursor.getDay();
    const totalDays = new Date(this.calendarCursor.getFullYear(), this.calendarCursor.getMonth() + 1, 0).getDate();
    const today = new Date();
    grid.classList.remove('is-shifting');
    grid.innerHTML = `${'<span></span>'.repeat(firstWeekday)}${Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(this.calendarCursor.getFullYear(), this.calendarCursor.getMonth(), index + 1);
      const isToday = date.toDateString() === today.toDateString() ? ' is-selected' : '';
      const indianDate = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      return `<button type="button" class="apd-calendar-day${isToday}" data-date="${indianDate}" data-iso="${date.toISOString().slice(0, 10)}" onclick="window.ApdaCitizenDashboard.selectCalendarDate(this)">${index + 1}</button>`;
    }).join('')}`;
    if (animationClass) requestAnimationFrame(() => grid.classList.add(animationClass));
  },
  selectForecast(day, temp, rain, message, humidity, wind, uv) {
    const detail = document.getElementById('apd-forecast-detail');
    const selectedDay = document.getElementById('apd-forecast-selected-day');
    const selectedDate = document.getElementById('apd-forecast-selected-date');
    const humidityEl = document.getElementById('apd-fc-humidity');
    const visibilityEl = document.getElementById('apd-fc-visibility');
    const feelsLikeEl = document.getElementById('apd-fc-feels-like');
    const windEl = document.getElementById('apd-fc-wind');
    const rainMeter = document.getElementById('apd-fc-rain-meter');
    const rainMeterLabel = document.getElementById('apd-fc-rain-meter-label');
    if (detail) {
      detail.style.opacity = '0';
      detail.style.transform = 'translateY(6px)';
      setTimeout(() => {
        detail.textContent = `${day}: ${message}`;
        detail.style.opacity = '1';
        detail.style.transform = 'translateY(0)';
      }, 180);
    }
    if (selectedDay) selectedDay.textContent = day;
    if (selectedDate) {
      const offsets = { Today: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
      const date = new Date();
      date.setDate(date.getDate() + (offsets[day] ?? 0));
      selectedDate.textContent = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    const visibility = { Today: '4.2 km', Monday: '6.8 km', Tuesday: '3.5 km', Wednesday: '8.0 km', Thursday: '5.4 km', Friday: '9.2 km', Saturday: '4.8 km' };
    if (humidityEl) humidityEl.textContent = humidity ? `${humidity}%` : '—';
    if (visibilityEl) visibilityEl.textContent = visibility[day] || '—';
    if (feelsLikeEl) feelsLikeEl.textContent = `${Number(temp) + 2}°C`;
    if (windEl) windEl.textContent = wind ? `${wind} km/h` : '—';
    if (rainMeter) rainMeter.style.width = `${rain}%`;
    if (rainMeterLabel) rainMeterLabel.textContent = `${rain}%`;
    // highlight active day card
    document.querySelectorAll('.apd-day-card').forEach(c => c.classList.remove('active'));
    const active = document.querySelector(`.apd-day-card[data-day="${day}"]`);
    if (active) active.classList.add('active');
  },
  getForecastDays(startDate) {
    const seed = Math.floor(startDate.getTime() / 86400000);
    const icons = ['🌧️', '⛅', '🌦️', '🌤️', '☀️'];
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      const wave = Math.sin((seed + index) * 1.37);
      const temperature = Math.round(28 + wave * 2.8 + (index === 4 ? 1 : 0));
      const rain = Math.max(28, Math.min(88, Math.round(58 - wave * 17 + (index % 3) * 4)));
      const humidity = Math.max(58, Math.min(94, Math.round(76 + rain / 5)));
      const wind = Math.round(11 + Math.abs(wave) * 14);
      const visibility = Math.max(3.2, 10 - rain / 12).toFixed(1);
      return { date, temperature, rain, humidity, wind, visibility, icon: icons[Math.min(icons.length - 1, Math.floor((100 - rain) / 20))] };
    });
  },
  applyForecastDate(date) {
    const days = this.getForecastDays(date);
    const current = days[0];
    const indianDate = current.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const weekday = current.date.toLocaleDateString('en-IN', { weekday: 'long' });
    const outlook = current.rain > 70 ? 'Heavy showers likely. Avoid waterlogged roads and carry rain protection.' : current.rain > 50 ? 'Cloudy with intermittent showers. Keep travel plans flexible.' : 'Mostly warm and settled conditions, with a low chance of short showers.';
    const set = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
    set('apd-forecast-selected-day', weekday);
    set('apd-forecast-selected-date', indianDate);
    set('apd-fc-humidity', `${current.humidity}%`);
    set('apd-fc-visibility', `${current.visibility} km`);
    set('apd-fc-feels-like', `${current.temperature + 2}°C`);
    set('apd-fc-wind', `${current.wind} km/h`);
    set('apd-fc-rain-meter-label', `${current.rain}%`);
    set('apd-forecast-detail', `${weekday}, ${indianDate}: ${outlook}`);
    const meter = document.getElementById('apd-fc-rain-meter');
    if (meter) meter.style.width = `${current.rain}%`;
    const strip = document.querySelector('.apd-day-strip');
    if (strip) strip.innerHTML = days.map((item, index) => {
      const iso = item.date.toISOString().slice(0, 10);
      const name = index === 0 ? 'Selected' : item.date.toLocaleDateString('en-IN', { weekday: 'short' });
      return `<div class="apd-day-card${index === 0 ? ' active' : ''}" onclick="window.ApdaCitizenDashboard.applyForecastDate(new Date('${iso}T12:00:00'))"><div class="apd-day-name">${name}</div><div class="apd-day-icon">${item.icon}</div><div class="apd-day-temp">${item.temperature}°</div><div class="apd-day-rain">💧 ${item.rain}%</div></div>`;
    }).join('');
    this.drawForecastCharts(days);
  },
  drawForecastCharts(days) {
    const x = [73, 160, 247, 334, 421, 508, 582];
    const labels = days.map((item, index) => index === 0 ? 'Selected' : item.date.toLocaleDateString('en-IN', { weekday: 'short' }));
    const tempY = days.map(item => Math.round(198 - (item.temperature - 20) * 14));
    const tempChart = document.getElementById('apd-temp-chart');
    if (tempChart) {
      const grid = [30, 72, 114, 156, 198].map(y => `<line x1="54" y1="${y}" x2="600" y2="${y}"/>`).join('');
      const bars = days.map((item, index) => `<rect x="${x[index] - 18}" y="${198 - item.rain * 1.3}" width="36" height="${item.rain * 1.3}" rx="4" fill="#fbbf24"/>`).join('');
      const points = tempY.map((y, index) => `${x[index]},${y}`).join(' ');
      const labelsSvg = days.map((item, index) => `<text x="${x[index] - 11}" y="${tempY[index] - 10}">${item.temperature}°</text>`).join('');
      const daysSvg = labels.map((label, index) => `<text x="${x[index]}" y="220">${label}</text>`).join('');
      tempChart.innerHTML = `<defs><linearGradient id="fc-area-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fbbf24" stop-opacity=".28"/><stop offset="100%" stop-color="#fbbf24" stop-opacity=".02"/></linearGradient><linearGradient id="fc-line-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs><g stroke="rgba(251,191,36,.08)" stroke-width="1">${grid}</g><g fill="rgba(251,191,36,.4)" font-size="10" font-weight="700"><text x="10" y="34">32°</text><text x="10" y="76">29°</text><text x="10" y="118">26°</text><text x="10" y="160">23°</text><text x="10" y="202">20°</text></g><g opacity=".22">${bars}</g><path d="M${x[0]} ${tempY[0]} ${tempY.map((y, i) => `L${x[i]} ${y}`).join(' ')} L582 198 L73 198 Z" fill="url(#fc-area-grad)"/><polyline points="${points}" fill="none" stroke="url(#fc-line-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><g fill="#1a1400" stroke="#fbbf24" stroke-width="2.5">${tempY.map((y, i) => `<circle cx="${x[i]}" cy="${y}" r="5"/>`).join('')}</g><g fill="rgba(253,230,138,.92)" font-size="10" font-weight="800">${labelsSvg}</g><g fill="rgba(251,191,36,.48)" font-size="10" font-weight="700" text-anchor="middle">${daysSvg}</g>`;
    }
    const riverChart = document.getElementById('apd-river-chart');
    if (riverChart) {
      const levels = days.map((item, index) => +(3.4 + item.rain / 75 + Math.sin(index * 1.5) * .18).toFixed(1));
      const levelY = levels.map(level => Math.round(161 - (level - 2.5) * 36));
      riverChart.innerHTML = `<defs><linearGradient id="river-area-live" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fbbf24" stop-opacity=".28"/><stop offset="100%" stop-color="#fbbf24" stop-opacity=".02"/></linearGradient><linearGradient id="river-line-live" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs><g stroke="rgba(251,191,36,.08)" stroke-width="1"><line x1="54" y1="25" x2="600" y2="25"/><line x1="54" y1="61" x2="600" y2="61"/><line x1="54" y1="97" x2="600" y2="97"/><line x1="54" y1="133" x2="600" y2="133"/><line x1="54" y1="161" x2="600" y2="161"/></g><line x1="54" y1="43" x2="600" y2="43" stroke="rgba(251,191,36,.42)" stroke-width="1" stroke-dasharray="4 4"/><text x="57" y="39" fill="rgba(253,230,138,.55)" font-size="9" font-weight="700">alert level 5.0 m</text><path d="M${x[0]} ${levelY[0]} ${levelY.map((y, i) => `L${x[i]} ${y}`).join(' ')} L582 161 L73 161 Z" fill="url(#river-area-live)"/><polyline points="${levelY.map((y, i) => `${x[i]},${y}`).join(' ')}" fill="none" stroke="url(#river-line-live)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><g fill="#1a1400" stroke="#fbbf24" stroke-width="2.5">${levelY.map((y, i) => `<circle cx="${x[i]}" cy="${y}" r="4"/>`).join('')}</g><g fill="rgba(253,230,138,.9)" font-size="10" font-weight="800">${levels.map((level, i) => `<text x="${x[i] - 11}" y="${levelY[i] - 10}">${level}</text>`).join('')}</g><g fill="rgba(251,191,36,.48)" font-size="10" font-weight="700" text-anchor="middle">${labels.map((label, i) => `<text x="${x[i]}" y="182">${label}</text>`).join('')}</g>`;
      setTimeout(() => { const status = document.querySelector('.apd-river-status'); if (status) status.textContent = `${levels[0] > 4.7 ? 'Watch' : 'Normal'} · ${levels[0]} m`; }, 0);
    }
  },
  selectCalendarDate(button, dateLabel) {
    document.querySelectorAll('.apd-calendar-day.is-selected').forEach(day => day.classList.remove('is-selected'));
    button.classList.add('is-selected');
    const selectedDate = document.getElementById('apd-forecast-calendar-date');
    const detail = document.getElementById('apd-forecast-detail');
    const indianDate = dateLabel || button.dataset.date;
    if (selectedDate) selectedDate.textContent = indianDate;
    if (detail) detail.textContent = `${indianDate}: Forecast selected. Temperature and conditions will update for your chosen date.`;
    const selected = button.dataset.iso ? new Date(`${button.dataset.iso}T12:00:00`) : null;
    if (selected) this.applyForecastDate(selected);
    const calendar = document.getElementById('apd-forecast-calendar');
    if (calendar) calendar.classList.remove('is-open');
  },
  render() {
    const activeTab = window.ApdaState.citizenTab;
    const user = window.ApdaState.currentUser || { name: 'Priya Sharma', city: 'Hatigaon, Guwahati' };

    const navTabs = [
      { id: 'alerts', label: 'Alerts', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>' },
      { id: 'shelters', label: 'Shelters', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>' },
      { id: 'requests', label: 'Requests', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>' },
      { id: 'chat', label: 'Chat', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>' },
      { id: 'family', label: 'Family', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>' },
      { id: 'guides', label: 'Guides', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
      { id: 'activity', label: 'Activity', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
      { id: 'updates', label: 'Updates', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>' },
      { id: 'profile', label: 'Profile', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' }
    ];

    const components = {
      alerts: 'ApdaLiveAlerts',
      shelters: 'ApdaShelterMap',
      requests: 'ApdaMyRequests',
      chat: 'ApdaCommunityChat',
      family: 'ApdaFamilyCheckin',
      guides: 'ApdaSafetyGuidesComp',
      activity: 'ApdaRecentActivity',
      updates: 'ApdaCommunityUpdates',
      profile: 'ApdaProfileSettings'
    };

    const activityHtml = `
      <div class="space-y-2">
        <div class="apd-activity-item"><div class="apd-activity-dot" style="background:#ef4444"></div><div><div class="apd-activity-text">Flood warning issued for Kamrup district</div><div class="apd-activity-time">12 minutes ago</div></div></div>
        <div class="apd-activity-item"><div class="apd-activity-dot" style="background:#f59e0b"></div><div><div class="apd-activity-text">Relief camp opened at Dispur Stadium</div><div class="apd-activity-time">45 minutes ago</div></div></div>
        <div class="apd-activity-item"><div class="apd-activity-dot" style="background:#10b981"></div><div><div class="apd-activity-text">Your request #4821 has been resolved</div><div class="apd-activity-time">2 hours ago</div></div></div>
        <div class="apd-activity-item"><div class="apd-activity-dot" style="background:#f59e0b"></div><div><div class="apd-activity-text">Road clearance team dispatched to Beltola</div><div class="apd-activity-time">3 hours ago</div></div></div>
      </div>`;
    const contentHtml = activeTab === 'activity'
      ? activityHtml
      : window[components[activeTab] || components.alerts].render();
    const location = user.city || 'Hatigaon, Guwahati';
    const avatar = user.profileImage
      ? `<img src="${user.profileImage}" alt="${user.name}" class="w-full h-full object-cover">`
      : `<span>${user.name ? user.name.charAt(0) : 'C'}</span>`;

    const openAlerts = window.ApdaState.alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    const firstName = user.name.split(' ')[0];
    const calendarDate = new Date();
    const calendarMonth = calendarDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const forecastDateLabel = calendarDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return `
      <style>
        /* ═══ Professional Emergency Dashboard Styles ═══ */
        .apd-dash { font-family: 'Inter', system-ui, sans-serif; background: #18130d; color: #f1f5f9; min-height: 100vh; }

        /* Emergency Banner */
        .apd-banner { background: linear-gradient(90deg, rgba(185, 28, 28, 0.12), rgba(153, 27, 27, 0.06)); border-bottom: 1px solid rgba(185, 28, 28, 0.15); }
        .apd-banner-inner { max-width: 1400px; margin: 0 auto; padding: 0.625rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
        .apd-banner-pulse { width: 8px; height: 8px; border-radius: 50%; background: #dc2626; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); animation: bannerPulse 2s infinite; flex-shrink: 0; }
        @keyframes bannerPulse { 0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7); } 70% { box-shadow: 0 0 0 6px rgba(220,38,38,0); } 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); } }
        .apd-banner-text { font-size: 0.8125rem; font-weight: 600; color: #fca5a5; }
        .apd-banner-count { margin-left: auto; font-size: 0.75rem; font-weight: 700; color: #f87171; background: rgba(220, 38, 38, 0.15); padding: 0.25rem 0.625rem; border-radius: 999px; border: 1px solid rgba(220, 38, 38, 0.2); }

        /* Stats Bar */
        .apd-stats { max-width: 1400px; margin: 0 auto; padding: 1.25rem 1.5rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
        @media (min-width: 768px) { .apd-stats { grid-template-columns: repeat(4, 1fr); } }
        .apd-stat { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148,163,184,0.08); border-radius: 12px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 0.875rem; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); cursor: pointer; position: relative; overflow: hidden; }
        .apd-stat::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, currentColor, transparent); opacity: 0; transition: opacity 0.3s; }
        .apd-stat:hover { transform: translateY(-2px); border-color: rgba(148,163,184,0.15); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .apd-stat:hover::before { opacity: 0.5; }
        .apd-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .apd-stat:hover .apd-stat-icon { transform: scale(1.1) rotate(-3deg); }
        .apd-stat-val { font-size: 1.25rem; font-weight: 800; color: #f8fafc; line-height: 1; }
        .apd-stat-label { font-size: 0.6875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.25rem; }
        .apd-stat-red { color: #f87171; }
        .apd-stat-red .apd-stat-icon { background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.15); color: #f87171; }
        .apd-stat-blue { color: #fde047; }
        .apd-stat-blue .apd-stat-icon { background: rgba(250, 204, 21, 0.14); border: 1px solid rgba(250, 204, 21, 0.3); color: #fde047; }
        .apd-stat-green { color: #34d399; }
        .apd-stat-green .apd-stat-icon { background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.15); color: #34d399; }
        .apd-stat-amber { color: #fbbf24; }
        .apd-stat-amber .apd-stat-icon { background: rgba(180, 83, 9, 0.1); border: 1px solid rgba(180, 83, 9, 0.15); color: #fbbf24; }

        /* Main Grid */
        .apd-main { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem 2rem; display: grid; gap: 1.5rem; }
        @media (min-width: 1024px) { .apd-main { grid-template-columns: minmax(0, 1fr) 220px; } }

        /* Tab Navigation */
        .apd-tabs { display: flex; gap: 0.25rem; padding: 0.25rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148,163,184,0.08); border-radius: 12px; margin-bottom: 1.25rem; overflow-x: auto; scrollbar-width: none; }
        .apd-tabs::-webkit-scrollbar { display: none; }
        .apd-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; border-radius: 10px; font-size: 0.8125rem; font-weight: 600; color: #64748b; white-space: nowrap; transition: all 0.2s; border: none; background: transparent; cursor: pointer; position: relative; }
        .apd-tab:hover { color: #94a3b8; background: rgba(255,255,255,0.03); }
        .apd-tab.active { color: #f8fafc; background: rgba(30, 41, 59, 0.8); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .apd-tab.active::after { content: ''; position: absolute; bottom: -0.25rem; left: 50%; transform: translateX(-50%); width: 16px; height: 2px; background: #fbbf24; border-radius: 999px; }
        .apd-tab-badge { min-width: 18px; height: 18px; padding: 0 5px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: #dc2626; color: white; font-size: 0.625rem; font-weight: 800; }
        @media (min-width: 1024px) {
          .apd-tabs { flex-direction: column; align-items: stretch; gap: 0.25rem; margin-bottom: 0; overflow: visible; }
          .apd-tab { width: 100%; padding: 0.625rem 0.75rem; }
          .apd-tab.active::after { top: 50%; bottom: auto; left: -0.75rem; transform: translateY(-50%); width: 2px; height: 18px; }
        }

        /* Content Panel */
        .apd-content { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148,163,184,0.08); border-radius: 16px; padding: 1.5rem; min-height: 500px; animation: contentFade 0.35s cubic-bezier(0.16,1,0.3,1); }
        @keyframes contentFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .apd-content-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(148,163,184,0.06); }
        .apd-content-title { font-size: 1.125rem; font-weight: 800; color: #f8fafc; display: flex; align-items: center; gap: 0.5rem; }
        .apd-content-title svg { color: #fbbf24; }

        /* Sidebar Panel */
        .apd-side { display: flex; flex-direction: column; gap: 1rem; }
        .apd-side-card { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148,163,184,0.08); border-radius: 16px; padding: 1.25rem; transition: all 0.3s; }
        .apd-side-card:hover { border-color: rgba(148,163,184,0.12); }
        .apd-side-title { font-size: 0.6875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #95806b; margin-bottom: 0.875rem; display: flex; align-items: center; gap: 0.5rem; }
        .apd-side-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(148,163,184,0.1), transparent); }

        /* Activity Feed */
        .apd-activity-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.625rem 0; border-bottom: 1px solid rgba(148,163,184,0.04); transition: all 0.2s; }
        .apd-activity-item:last-child { border-bottom: none; }
        .apd-activity-item:hover { padding-left: 0.25rem; }
        .apd-activity-dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 0.375rem; flex-shrink: 0; }
        .apd-activity-text { font-size: 0.8125rem; color: #cbd5e1; line-height: 1.4; }
        .apd-activity-time { font-size: 0.6875rem; color: #95806b; margin-top: 0.125rem; }

        /* Emergency Contacts */
        .apd-contacts-card { padding: 1rem; }
        .apd-contacts-card .apd-side-title { margin-bottom: 0.625rem; }
        .apd-contacts-list { display: grid; gap: 0.25rem; }
        .apd-contact { display: flex; align-items: center; gap: 0.625rem; padding: 0.375rem; border-radius: 8px; transition: background-color 0.2s ease, transform 0.2s ease; cursor: pointer; }
        .apd-contact:hover, .apd-contact:focus-visible { background: rgba(255,255,255,0.05); transform: translateX(2px); outline: none; }
        .apd-contact-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(30, 41, 59, 0.6); display: grid; place-items: center; color: #fbbf24; font-size: 0.75rem; font-weight: 800; flex-shrink: 0; }
        .apd-contact-name { font-size: 0.8125rem; font-weight: 600; color: #e2e8f0; }
        .apd-contact-num { font-size: 0.6875rem; color: #64748b; font-weight: 500; }
        .apd-contact-call { margin-left: auto; width: 26px; height: 26px; border-radius: 6px; background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.15); color: #34d399; display: grid; place-items: center; opacity: 0; transform: translateX(4px); transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease; }
        .apd-contact:hover .apd-contact-call, .apd-contact:focus-visible .apd-contact-call { opacity: 1; transform: translateX(0); }
        .apd-contact-call:hover { background: rgba(5, 150, 105, 0.2); }

        /* SOS Button */
        /* Clear the bottom-right Emergency AI launcher. */
        .apd-sos { position: fixed; bottom: 7.5rem; right: 1.8rem; z-index: 100; display: grid; place-items: center; width: 94px; height: 94px; }
        .apd-sos::before, .apd-sos::after { content: none; }
        .apd-sos::before { content: ''; position: absolute; inset: -31px; z-index: -2; border-radius: 50%; background: conic-gradient(from 0deg, transparent 0 8%, rgba(255,197,57,.42) 12%, transparent 17% 31%, rgba(248,80,53,.52) 37%, transparent 43% 58%, rgba(255,197,57,.42) 65%, transparent 72% 86%, rgba(248,80,53,.46) 92%, transparent); filter: blur(4px); animation: sosRays 4s linear infinite; }
        .apd-sos::after { content: ''; position: absolute; inset: -20px; z-index: -1; border-radius: 50%; background: radial-gradient(circle, rgba(255,214,74,.32) 0%, rgba(249,80,53,.22) 39%, transparent 70%); filter: blur(8px); animation: sosGlow 1.9s ease-in-out infinite; }
        .apd-sos-btn { position: relative; isolation: isolate; width: 70px; height: 70px; overflow: visible; border-radius: 23px; background: linear-gradient(145deg, #ff4b42 0%, #df1c2e 48%, #a60920 100%); border: 1px solid rgba(255, 238, 178, 0.74); color: white; display: grid; place-items: center; cursor: pointer; box-shadow: 0 15px 30px rgba(127, 14, 35, .62), 0 0 17px rgba(255, 210, 72, .46), 0 0 0 5px rgba(239, 68, 68, .24), inset 0 2px 1px rgba(255,255,255,.4), inset 0 -4px 8px rgba(105, 10, 24, .26); transition: transform .25s cubic-bezier(.2,.9,.25,1.3), box-shadow .25s ease, filter .25s ease; animation: sosPulse 1.9s ease-out infinite; }
        .apd-sos-btn::before { content: none; }
        .apd-sos-btn::before { content: ''; position: absolute; z-index: -1; inset: -8px; border-radius: 27px; border: 1px solid rgba(251,113,133,.52); animation: sosRing 2.35s ease-out infinite; }
        .apd-sos-btn::after { content: ''; position: absolute; inset: 2px 8px auto; height: 22px; border-radius: 16px 16px 50% 50%; background: linear-gradient(180deg, rgba(255,255,255,.23), transparent); pointer-events: none; }
        .apd-sos-btn svg { position: relative; z-index: 1; width: 35px; height: 35px; stroke-width: 2.15; filter: drop-shadow(0 2px 2px rgba(92, 8, 20, .5)); }
        .apd-sos-btn:hover { transform: translateY(-6px) scale(1.1); filter: saturate(1.2) brightness(1.13); box-shadow: 0 22px 42px rgba(127, 14, 35, .68), 0 0 0 6px rgba(239,68,68,.28), 0 0 40px rgba(255,205,74,.58), inset 0 2px 1px rgba(255,255,255,.42); }
        .apd-sos-btn:active { transform: translateY(-1px) scale(.96); }
        .apd-sos-btn:focus-visible { outline: 3px solid #fde68a; outline-offset: 5px; }
        @keyframes sosPulse { 0%, 100% { box-shadow: 0 15px 30px rgba(127,14,35,.62), 0 0 17px rgba(255,210,72,.46), 0 0 0 5px rgba(239,68,68,.24), inset 0 2px 1px rgba(255,255,255,.4), inset 0 -4px 8px rgba(105,10,24,.26); } 50% { box-shadow: 0 18px 35px rgba(127,14,35,.68), 0 0 30px rgba(255,210,72,.72), 0 0 0 13px rgba(239,68,68,0), inset 0 2px 1px rgba(255,255,255,.4), inset 0 -4px 8px rgba(105,10,24,.26); } }
        @keyframes sosRing { 0%, 100% { opacity: .9; transform: scale(.94); } 55% { opacity: 0; transform: scale(1.2); } }
        @keyframes sosRays { to { transform: rotate(360deg); } }
        @keyframes sosGlow { 50% { opacity: .65; transform: scale(1.14); } }
        /* Professional emergency control: no decorative circular halo */
        .apd-sos { width: 76px; height: 76px; }
        .apd-sos::before, .apd-sos::after, .apd-sos-btn::before { content: none; animation: none; }
        .apd-sos-btn { width: 68px; height: 68px; border-radius: 18px; background: linear-gradient(145deg, #ef353d, #c9122a 56%, #940d22); box-shadow: 0 14px 26px rgba(103,12,28,.55), inset 0 1px rgba(255,255,255,.38), inset 0 -5px 10px rgba(91,8,23,.3); animation: none; }
        .apd-sos-btn:hover { box-shadow: 0 18px 32px rgba(103,12,28,.62), inset 0 1px rgba(255,255,255,.4), inset 0 -5px 10px rgba(91,8,23,.3); }
        @media (prefers-reduced-motion: reduce) { .apd-sos, .apd-sos::before, .apd-sos::after, .apd-sos-btn, .apd-sos-btn::before { animation: none; } }

        /* Profile Summary */
        .apd-greeting-row { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding: 1.5rem 0 0.5rem; }
        .apd-greeting { min-width: 0; }
        .apd-profile-summary { display: flex; flex-direction: column; align-items: flex-start; }
        .apd-profile-avatar { width: 96px; height: 96px; border-radius: 28px; background: linear-gradient(135deg, #78350f, #b45309); display: grid; place-items: center; overflow: hidden; color: #fff; border: 2px solid rgba(251,191,36,.22); font-size: 1.5rem; font-weight: 800; box-shadow: 0 12px 28px rgba(180,83,9,.25); }
        .apd-profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .apd-profile-name { margin-top: 0.75rem; color: #f8fafc; font-size: 1.25rem; font-weight: 800; }
        .apd-profile-address { display: flex; align-items: center; gap: 0.375rem; margin-top: 0.25rem; color: #64748b; font-size: 0.75rem; font-weight: 600; }
        .apd-profile-address svg { width: 14px; height: 14px; color: #fbbf24; }

        /* Weather Widget */
        .apd-weather { display: flex; align-items: center; gap: 1rem; padding: 0.875rem; background: rgba(30, 41, 59, 0.3); border-radius: 12px; border: 1px solid rgba(148,163,184,0.06); }
        .apd-weather-icon { font-size: 1.75rem; }
        .apd-weather-temp { font-size: 1.5rem; font-weight: 800; color: #f8fafc; }
        .apd-weather-desc { font-size: 0.75rem; color: #64748b; font-weight: 500; }
        .apd-weather-meta { display: flex; gap: 0.75rem; margin-top: 0.25rem; }
        .apd-weather-meta span { font-size: 0.6875rem; color: #95806b; }
        .apd-forecast-btn { width: 100%; margin-top: 0.75rem; padding: 0.5rem 0.75rem; border: 1px solid rgba(56,189,248,0.25); border-radius: 8px; background: rgba(14,116,144,0.12); color: #7dd3fc; font-size: 0.75rem; font-weight: 700; transition: all 0.2s; cursor: pointer; }
        .apd-forecast-btn:hover { background: rgba(14,116,144,0.22); border-color: rgba(56,189,248,0.45); color: #e0f2fe; }
        /* ══ Forecast Modal — Warm Amber/Yellow Premium Theme ══ */
        .apd-forecast-modal {
          position: fixed; inset: 0; z-index: 200; display: none;
          align-items: center; justify-content: center;
          padding: 1rem;
          background: rgba(10, 8, 2, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .apd-forecast-modal.is-open { display: flex; }
        .apd-forecast-dialog {
          width: min(740px, 100%);
          max-height: 92dvh;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: rgba(251,191,36,.3) transparent;
          background: linear-gradient(160deg, #1a1400 0%, #12100a 55%, #0d0d08 100%);
          border: 1px solid rgba(251,191,36,0.22);
          border-radius: 22px;
          box-shadow:
            0 0 0 1px rgba(251,191,36,0.06),
            0 32px 80px rgba(0,0,0,0.7),
            0 0 60px rgba(180,130,0,0.12);
          padding: 1.5rem;
          position: relative;
        }
        .apd-forecast-dialog::-webkit-scrollbar { width: 5px; }
        .apd-forecast-dialog::-webkit-scrollbar-thumb { background: rgba(251,191,36,.25); border-radius: 999px; }
        /* top amber glow strip */
        .apd-forecast-dialog::before {
          content: '';
          position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent);
          border-radius: 999px;
        }
        .apd-forecast-head {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .apd-forecast-title {
          font-size: 1.2rem; font-weight: 900; letter-spacing: -0.01em;
          background: linear-gradient(135deg, #fde68a 0%, #f59e0b 55%, #fbbf24 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .apd-forecast-subtitle { margin-top: 0.25rem; font-size: 0.72rem; color: rgba(251,191,36,0.45); }
        .apd-forecast-close {
          width: 30px; height: 30px; border: 0; border-radius: 8px; flex-shrink: 0;
          background: rgba(251,191,36,0.08); color: rgba(251,191,36,0.6);
          font-size: 1.25rem; line-height: 1; cursor: pointer; transition: all .2s;
        }
        .apd-forecast-close:hover { background: rgba(251,191,36,0.16); color: #fde68a; }
         /* selected date */
         .apd-fc-info-grid {
           display: grid;
           grid-template-columns: minmax(180px, 250px) repeat(4, minmax(100px, 1fr));
          gap: 0.6rem;
          margin-bottom: 1.1rem;
        }
         @media (max-width: 680px) { .apd-fc-info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .apd-fc-info-card:first-child { grid-column: 1 / -1; } }
        .apd-fc-info-card {
          padding: 0.7rem 0.85rem;
          border-radius: 12px;
          background: linear-gradient(145deg, rgba(40,30,5,0.85), rgba(25,20,5,0.9));
          border: 1px solid rgba(251,191,36,0.12);
          transition: border-color .25s, transform .2s;
        }
        .apd-fc-info-card:hover { border-color: rgba(251,191,36,0.3); transform: translateY(-1px); }
        .apd-fc-info-lbl {
          font-size: 0.58rem; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(251,191,36,0.45); margin-bottom: 0.3rem;
        }
         .apd-fc-info-val {
          font-size: 1.1rem; font-weight: 900;
          background: linear-gradient(135deg, #fde68a, #f59e0b);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
           background-clip: text;
         }
         .apd-fc-info-date { margin-top: 0.18rem; color: rgba(253,230,138,0.58); font-size: 0.68rem; font-weight: 700; }
         .apd-fc-condition-card { display: flex; min-height: 76px; flex-direction: column; justify-content: center; }
         .apd-fc-condition-card .apd-fc-info-lbl { line-height: 1.35; }
         .apd-fc-condition-card .apd-fc-info-val { font-size: 0.96rem; }
        /* horizontal day-card strip */
        .apd-day-strip {
          display: flex;
          gap: 0.6rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(251,191,36,.2) transparent;
        }
        .apd-day-strip::-webkit-scrollbar { height: 4px; }
        .apd-day-strip::-webkit-scrollbar-thumb { background: rgba(251,191,36,.2); border-radius: 999px; }
        .apd-day-card {
          flex: 0 0 auto;
          min-width: 78px;
          padding: 0.75rem 0.6rem;
          border-radius: 14px;
          background: linear-gradient(160deg, rgba(40,30,3,0.9), rgba(22,17,3,0.95));
          border: 1px solid rgba(251,191,36,0.1);
          text-align: center;
          cursor: pointer;
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .apd-day-card:hover { border-color: rgba(251,191,36,0.35); transform: translateY(-3px); box-shadow: 0 8px 20px rgba(180,130,0,0.18); }
        .apd-day-card.active {
          border-color: rgba(251,191,36,0.65);
          background: linear-gradient(145deg, rgba(60,44,6,0.95), rgba(35,28,4,0.98));
          box-shadow: 0 0 0 1px rgba(251,191,36,0.18), 0 10px 28px rgba(180,130,0,0.25);
        }
        .apd-day-name { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(253,230,138,0.5); margin-bottom: 0.4rem; }
        .apd-day-icon { font-size: 1.35rem; margin-bottom: 0.35rem; }
        .apd-day-temp {
          font-size: 1rem; font-weight: 900;
          background: linear-gradient(135deg, #fde68a, #fbbf24);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .apd-day-rain { font-size: 0.6rem; color: rgba(147,197,253,0.65); margin-top: 0.25rem; font-weight: 700; }
        /* SVG chart area */
         .apd-fc-chart-wrap { position: relative; margin-bottom: 1rem; }
         .apd-chart-title-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0 0 0.65rem; }
         .apd-chart-title { color: #fff4bf; font-size: 0.78rem; font-weight: 850; letter-spacing: 0.01em; }
          .apd-forecast-chart { width: 100%; height: auto; display: block; overflow: visible; }
          .apd-river-chart-wrap { padding-top: 0.95rem; border-top: 1px solid rgba(251,191,36,0.12); }
          .apd-river-meta { color: rgba(253,230,138,0.56); font-size: 0.64rem; font-weight: 750; }
          .apd-river-status { display: inline-flex; align-items: center; gap: .35rem; color: #bbf7d0; font-size: .64rem; font-weight: 800; }
          .apd-river-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #86efac; box-shadow: 0 0 8px rgba(134,239,172,.65); }
        .apd-forecast-point { cursor: pointer; transition: all 0.2s ease; }
        .apd-forecast-point:hover { r: 7; filter: drop-shadow(0 0 8px #fbbf24); }
        /* draw-on animation */
        .apd-forecast-modal.is-open .apd-temp-line {
          stroke-dasharray: 700; stroke-dashoffset: 700;
          animation: forecastDraw 1.2s cubic-bezier(.16,1,.3,1) forwards;
        }
        .apd-forecast-modal.is-open .apd-forecast-point { animation: forecastPoint .5s backwards; }
        .apd-forecast-modal.is-open .apd-forecast-point:nth-child(1) { animation-delay:.05s; }
        .apd-forecast-modal.is-open .apd-forecast-point:nth-child(2) { animation-delay:.12s; }
        .apd-forecast-modal.is-open .apd-forecast-point:nth-child(3) { animation-delay:.19s; }
        .apd-forecast-modal.is-open .apd-forecast-point:nth-child(4) { animation-delay:.26s; }
        .apd-forecast-modal.is-open .apd-forecast-point:nth-child(5) { animation-delay:.33s; }
        .apd-forecast-modal.is-open .apd-forecast-point:nth-child(6) { animation-delay:.40s; }
        .apd-forecast-modal.is-open .apd-forecast-point:nth-child(7) { animation-delay:.47s; }
        @keyframes forecastDraw { to { stroke-dashoffset: 0; } }
        @keyframes forecastPoint { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
        /* detail bar */
         .apd-forecast-detail {
          min-height: 52px; padding: 0.85rem 1rem;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(40,32,4,0.9), rgba(25,20,3,0.95));
          border: 1px solid rgba(251,191,36,0.16);
          color: rgba(253,230,138,0.85);
          font-size: 0.8rem; line-height: 1.55;
           transition: opacity .2s ease, transform .2s ease;
         }
         .apd-fc-summary {
           display: grid; grid-template-columns: 1.15fr 1fr; gap: 0.7rem; margin-bottom: 1rem;
         }
         .apd-fc-summary-card {
           padding: 0.8rem 0.9rem; border: 1px solid rgba(251,191,36,0.14); border-radius: 13px;
           background: linear-gradient(145deg, rgba(68,49,4,0.48), rgba(31,24,4,0.72));
         }
         .apd-fc-summary-label { color: rgba(253,230,138,0.52); font-size: 0.6rem; font-weight: 850; letter-spacing: .09em; text-transform: uppercase; }
         .apd-fc-summary-value { margin-top: .3rem; color: #fff1a7; font-size: .8rem; font-weight: 800; line-height: 1.4; }
         .apd-rain-meter { display: flex; align-items: center; gap: .55rem; margin-top: .5rem; }
         .apd-rain-meter-track { height: 5px; flex: 1; overflow: hidden; border-radius: 99px; background: rgba(147,197,253,.13); }
         .apd-rain-meter-fill { display: block; width: 72%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #fcd34d, #f97316); box-shadow: 0 0 12px rgba(249,115,22,.35); }
         .apd-rain-meter span { color: #bfdbfe; font-size: .65rem; font-weight: 800; white-space: nowrap; }
          @media (max-width: 520px) { .apd-fc-summary { grid-template-columns: 1fr; } .apd-chart-title-row { align-items: flex-start; flex-direction: column; gap: .2rem; } }
        /* calendar */
        .apd-calendar-toggle {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.45rem 0.75rem; border-radius: 8px;
          background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.22);
          color: rgba(253,230,138,0.75); font-size: 0.72rem; font-weight: 700; cursor: pointer;
          transition: all .2s;
        }
        .apd-calendar-toggle:hover { background: rgba(251,191,36,0.16); color: #fde68a; }
        .apd-forecast-calendar { position: fixed; inset: 0; z-index: 220; display: none; align-items: center; justify-content: center; padding: 1.25rem; background: rgba(10,8,2,0.88); backdrop-filter: blur(6px); }
        .apd-forecast-calendar.is-open { display: flex; }
        .apd-calendar-page { width: min(540px, 100%); padding: 1.3rem; border: 1px solid rgba(251,191,36,0.27); border-radius: 19px; background: linear-gradient(155deg, #1b1604, #100d04); box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 50px rgba(180,130,0,.08); }
        .apd-calendar-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.7rem; color: rgba(253,230,138,0.8); font-size: 0.76rem; font-weight: 800; }
        .apd-calendar-navigation { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: .55rem; padding: .65rem; margin-bottom: .85rem; border: 1px solid rgba(251,191,36,.12); border-radius: 13px; background: rgba(62,46,4,.35); }
        .apd-calendar-month-label { color: #fff0ad; font-size: .9rem; font-weight: 900; text-align: center; letter-spacing: -.01em; }
        .apd-calendar-nav-group { display: inline-flex; align-items: center; gap: .25rem; }
        .apd-calendar-nav-btn { width: 29px; height: 29px; border: 1px solid rgba(251,191,36,.19); border-radius: 8px; background: rgba(251,191,36,.07); color: #fde68a; font-weight: 900; cursor: pointer; transition: transform .2s ease, background .2s ease, border-color .2s ease; }
        .apd-calendar-nav-btn:hover { transform: translateY(-2px); border-color: rgba(251,191,36,.58); background: rgba(251,191,36,.18); }
        .apd-calendar-weekdays, .apd-calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.25rem; }
        .apd-calendar-weekdays { margin-bottom: 0.25rem; color: rgba(251,191,36,0.4); font-size: 0.625rem; font-weight: 800; text-align: center; text-transform: uppercase; }
        .apd-calendar-grid { min-height: 190px; }
        .apd-calendar-grid.is-shifting { animation: calendarSlide .28s cubic-bezier(.2,.8,.2,1); }
        .apd-calendar-day { min-height: 2.25rem; border: 1px solid transparent; border-radius: 9px; background: rgba(61,45,4,0.45); color: rgba(253,230,138,0.67); font-size: 0.78rem; font-weight: 800; cursor: pointer; transition: transform .2s ease, background .2s ease, border-color .2s ease, color .2s ease; }
        .apd-calendar-day:hover { transform: translateY(-2px); border-color: rgba(251,191,36,.4); background: rgba(124,92,7,.32); color: #fff1a8; }
        .apd-calendar-day.is-selected { border-color: rgba(251,191,36,.85); background: linear-gradient(145deg, rgba(151,109,5,.47), rgba(85,63,4,.6)); color: #fff4bd; box-shadow: 0 0 16px rgba(251,191,36,.18), inset 0 1px rgba(255,255,255,.13); }
        @keyframes calendarSlide { from { opacity: .15; transform: translateX(12px) scale(.98); } to { opacity: 1; transform: translateX(0) scale(1); } }
        @media (max-width: 500px) { .apd-calendar-day { min-height: 1.8rem; font-size: 0.6875rem; } }
        .apd-greeting-weather { width: 320px; flex: 0 0 320px; }
        @media (max-width: 639px) {
          .apd-greeting-row { align-items: stretch; flex-direction: column; gap: 1rem; }
          .apd-greeting-weather { width: 100%; flex-basis: auto; }
        }
        .apd-weather-sidebar { display: none; }

        /* Scrollbar */
        .apd-scroll::-webkit-scrollbar { width: 4px; }
        .apd-scroll::-webkit-scrollbar-track { background: transparent; }
        .apd-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 999px; }
        .apd-scroll::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.25); }

        /* Citizen dashboard — vivid emergency palette */
        .apd-dash { background: radial-gradient(900px 520px at 3% -5%, rgba(239,68,68,.18), transparent 58%), radial-gradient(780px 480px at 100% 0%, rgba(250,204,21,.15), transparent 55%), radial-gradient(720px 500px at 70% 100%, rgba(34,197,94,.11), transparent 58%), #11140f; color: #fff8dc; }
        .apd-banner { background: linear-gradient(90deg, rgba(185,28,28,.42), rgba(234,88,12,.18) 48%, rgba(250,204,21,.12)); border-bottom-color: rgba(253,224,71,.3); }
        .apd-banner-text { color: #fff0ac; } .apd-banner-count { color: #fff5c2; background: rgba(239,68,68,.33); border-color: rgba(254,202,202,.42); }
        .apd-stat, .apd-tabs, .apd-content, .apd-side-card { background: linear-gradient(145deg, rgba(45,38,13,.88), rgba(24,27,15,.92)); border-color: rgba(250,204,21,.19); box-shadow: 0 12px 32px rgba(0,0,0,.22); }
        .apd-stat:hover, .apd-side-card:hover { border-color: rgba(253,224,71,.48); box-shadow: 0 16px 34px rgba(0,0,0,.32), 0 0 22px rgba(250,204,21,.08); }
        .apd-stat-val, .apd-content-title, .apd-profile-name, .apd-weather-temp { color: #fff7cf; }
        .apd-stat-label, .apd-weather-desc, .apd-weather-meta span, .apd-profile-address { color: #d2c791; }
        .apd-stat-blue { color: #fde047; } .apd-stat-blue .apd-stat-icon { background: rgba(250,204,21,.14); border-color: rgba(250,204,21,.3); color: #fde047; }
        .apd-stat-green { color: #86efac; } .apd-stat-green .apd-stat-icon { background: rgba(34,197,94,.13); border-color: rgba(74,222,128,.3); color: #86efac; }
        .apd-stat-amber { color: #facc15; } .apd-tab { color: #c9bd80; } .apd-tab:hover { color: #fff0a8; background: rgba(250,204,21,.1); } .apd-tab.active { color: #fff8dc; background: linear-gradient(135deg, rgba(180,83,9,.32), rgba(127,29,29,.28)); } .apd-tab.active::after { background: #facc15; }
        .apd-weather { background: linear-gradient(135deg, rgba(101,76,8,.22), rgba(25,55,24,.25)); border-color: rgba(250,204,21,.2); }
        .apd-forecast-btn { background: linear-gradient(135deg, rgba(250,204,21,.22), rgba(22,163,74,.2)); border-color: rgba(253,224,71,.45); color: #fff2ae; box-shadow: 0 8px 18px rgba(202,138,4,.13); }
        .apd-forecast-btn:hover { background: linear-gradient(135deg, rgba(250,204,21,.36), rgba(22,163,74,.32)); color: #fffbe5; border-color: #fde047; }
        .apd-content-title svg { color: #facc15; }
        .apd-sos-btn { border-color: #ffe08a; background: linear-gradient(145deg, #ff4b39, #d91527 58%, #9c1020); box-shadow: 0 15px 28px rgba(104,9,25,.68), 0 0 0 3px rgba(255,222,110,.38), inset 0 2px rgba(255,255,255,.42), inset 0 -6px 10px rgba(88,8,20,.3); animation: sosAttention 1.7s ease-in-out infinite; }
        .apd-sos-btn:hover { box-shadow: 0 20px 38px rgba(104,9,25,.74), 0 0 0 5px rgba(255,222,110,.58), inset 0 2px rgba(255,255,255,.46), inset 0 -6px 10px rgba(88,8,20,.3); }
        @keyframes sosAttention { 0%,100% { transform: translateY(0); filter: saturate(1); } 50% { transform: translateY(-3px); filter: saturate(1.18) brightness(1.08); } }
        @media (prefers-reduced-motion: reduce) { .apd-sos-btn { animation: none; } }

        /* ═══ Global Losses Graph Styling ═══ */
        .apd-losses-graph-card {
          flex: 1 1 auto;
          max-width: 600px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          background: linear-gradient(145deg, rgba(17, 24, 39, 0.9), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(250, 204, 21, 0.19);
          border-radius: 16px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
        }
        .apd-graph-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }
        .apd-graph-title {
          font-size: 1rem;
          font-weight: 800;
          color: #22d3ee;
          letter-spacing: -0.01em;
        }
        .apd-graph-subtitle {
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 0.125rem;
        }
        .apd-graph-counter-wrap {
          font-size: 1.125rem;
          font-weight: 900;
          color: #f59e0b;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.2);
          padding: 0.25rem 0.625rem;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .apd-counter-year {
          color: #fbbf24;
        }
        .apd-counter-val {
          color: #22d3ee;
          text-shadow: 0 0 8px rgba(34, 211, 238, 0.3);
        }
        .apd-graph-svg-container {
          position: relative;
          width: 100%;
          background: #090d16;
          border: 1px solid rgba(148, 163, 184, 0.08);
          border-radius: 12px;
          margin-top: 0.75rem;
          overflow: hidden;
          touch-action: none;
        }
        .apd-losses-svg-panning {
          cursor: grabbing !important;
        }
        .apd-losses-svg-interactive {
          cursor: grab;
        }
        .apd-graph-tooltip {
          position: absolute;
          display: none;
          pointer-events: none;
          background: rgba(15, 23, 42, 0.95);
          border: 1.5px solid #22d3ee;
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 0.725rem;
          color: #f8fafc;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 12px rgba(34, 211, 238, 0.25);
          z-index: 100;
          transition: opacity 0.15s ease, transform 0.15s ease;
          transform: translate(-50%, -100%) scale(0.95);
          opacity: 0;
        }
        .apd-graph-tooltip.is-visible {
          display: block;
          transform: translate(-50%, -100%) scale(1);
          opacity: 1;
        }
        .apd-graph-tooltip-year {
          font-weight: 800;
          color: #fbbf24;
          margin-bottom: 0.125rem;
        }
        .apd-graph-tooltip-loss {
          font-weight: 700;
          color: #e2e8f0;
        }
        .apd-graph-tooltip-diff {
          font-size: 0.65rem;
          margin-top: 0.125rem;
          font-weight: 600;
        }
        .apd-graph-tooltip-diff.up {
          color: #f87171;
        }
        .apd-graph-tooltip-diff.down {
          color: #34d399;
        }
        .apd-graph-tooltip-diff.flat {
          color: #94a3b8;
        }
        .apd-graph-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }
        .apd-graph-reset-btn {
          padding: 0.375rem 0.75rem;
          border: 1px solid rgba(34, 211, 238, 0.25);
          border-radius: 6px;
          background: rgba(6, 182, 212, 0.1);
          color: #22d3ee;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .apd-graph-reset-btn:hover {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(34, 211, 238, 0.5);
          color: #e0f2fe;
          transform: translateY(-1px);
        }
        .apd-graph-reset-btn:active {
          transform: translateY(0);
        }

        /* SVG styles */
        .apd-losses-svg-point {
          transition: r 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.2s, stroke 0.2s;
          cursor: pointer;
        }
        .apd-losses-svg-point:hover {
          r: 6.5;
        }

        /* Layout modifications */
        @media (min-width: 640px) {
          .apd-losses-graph-card {
            margin: 0 1rem;
          }
        }
        @media (max-width: 1023px) {
          .apd-losses-graph-card {
            max-width: 100%;
            margin: 1rem 0;
            flex: 1 1 100%;
          }
        }
      </style>

      <div class="apd-dash">

        <!-- Profile & Weather -->
        <div class="max-w-[1400px] mx-auto px-6">
          <div class="apd-greeting-row">
            <div class="apd-greeting">
              <div class="apd-profile-summary" onclick="window.ApdaState.setCitizenTab('profile')" title="View Profile">
                <div class="apd-profile-avatar">${avatar}</div>
                <div class="apd-profile-name">${user.name}</div>
                <div class="apd-profile-address"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>${location}</div>
              </div>
            </div>

            <div class="apd-greeting-weather">
              <div class="apd-side-card">
                <div class="apd-side-title">Weather</div>
                <div class="apd-weather">
                  <div class="apd-weather-icon">&#x1F327;&#xFE0F;</div>
                  <div>
                    <div class="apd-weather-temp">28&deg;C</div>
                    <div class="apd-weather-desc">Heavy Rain Expected</div>
                    <div class="apd-weather-meta">
                      <span>&#x1F4A7; 89% Humidity</span>
                      <span>&#x1F4A8; 24 km/h</span>
                    </div>
                  </div>
                </div>
                <button type="button" class="apd-forecast-btn" onclick="window.ApdaCitizenDashboard.showForecast()">View Forecast</button>
              </div>
            </div>
          </div>
        </div>

        <div id="apd-forecast-modal" class="apd-forecast-modal" role="dialog" aria-modal="true" aria-labelledby="apd-forecast-title" onclick="if(event.target===this)this.classList.remove('is-open')">
          <div class="apd-forecast-dialog">

            <!-- Header -->
            <div class="apd-forecast-head">
              <div>
                <h2 id="apd-forecast-title" class="apd-forecast-title">🌤 7-Day Weather Forecast</h2>
                <p class="apd-forecast-subtitle">📍 Hatigaon, Guwahati &middot; Updated just now</p>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0">
                <button type="button" class="apd-calendar-toggle" onclick="window.ApdaCitizenDashboard.toggleCalendar()">▣ Calendar</button>
                <button type="button" class="apd-forecast-close" aria-label="Close" onclick="document.getElementById('apd-forecast-modal').classList.remove('is-open')">&times;</button>
              </div>
            </div>

            <!-- Selected date and day -->
            <div class="apd-fc-info-grid">
              <div class="apd-fc-info-card">
                <div class="apd-fc-info-lbl">Selected date</div>
                <div class="apd-fc-info-val" id="apd-forecast-selected-day">Today</div>
                <div class="apd-fc-info-date" id="apd-forecast-selected-date">${forecastDateLabel}</div>
              </div>
              <div class="apd-fc-info-card apd-fc-condition-card">
                <div class="apd-fc-info-lbl">Humidity</div>
                <div class="apd-fc-info-val" id="apd-fc-humidity">89%</div>
              </div>
              <div class="apd-fc-info-card apd-fc-condition-card">
                <div class="apd-fc-info-lbl">Visibility</div>
                <div class="apd-fc-info-val" id="apd-fc-visibility">4.2 km</div>
              </div>
              <div class="apd-fc-info-card apd-fc-condition-card">
                <div class="apd-fc-info-lbl">Feels like</div>
                <div class="apd-fc-info-val" id="apd-fc-feels-like">30°C</div>
              </div>
              <div class="apd-fc-info-card apd-fc-condition-card">
                <div class="apd-fc-info-lbl">Wind speed</div>
                <div class="apd-fc-info-val" id="apd-fc-wind">24 km/h</div>
              </div>
            </div>

            <!-- Horizontal scrollable day cards -->
            <div class="apd-day-strip">
              <div class="apd-day-card active" data-day="Today" onclick="window.ApdaCitizenDashboard.selectForecast('Today','28','72','Heavy rain expected. Keep an umbrella handy and plan travel carefully.','89','24','2')">
                <div class="apd-day-name">Today</div>
                <div class="apd-day-icon">🌧️</div>
                <div class="apd-day-temp">28°</div>
                <div class="apd-day-rain">💧 72%</div>
              </div>
              <div class="apd-day-card" data-day="Monday" onclick="window.ApdaCitizenDashboard.selectForecast('Monday','29','64','Cloudy intervals with showers possible in the afternoon.','78','18','3')">
                <div class="apd-day-name">Mon</div>
                <div class="apd-day-icon">⛅</div>
                <div class="apd-day-temp">29°</div>
                <div class="apd-day-rain">💧 64%</div>
              </div>
              <div class="apd-day-card" data-day="Tuesday" onclick="window.ApdaCitizenDashboard.selectForecast('Tuesday','27','79','The wettest day this week; avoid low-lying routes where possible.','92','30','1')">
                <div class="apd-day-name">Tue</div>
                <div class="apd-day-icon">🌧️</div>
                <div class="apd-day-temp">27°</div>
                <div class="apd-day-rain">💧 79%</div>
              </div>
              <div class="apd-day-card" data-day="Wednesday" onclick="window.ApdaCitizenDashboard.selectForecast('Wednesday','30','55','Warmer and brighter, with brief evening showers.','70','14','5')">
                <div class="apd-day-name">Wed</div>
                <div class="apd-day-icon">🌤️</div>
                <div class="apd-day-temp">30°</div>
                <div class="apd-day-rain">💧 55%</div>
              </div>
              <div class="apd-day-card" data-day="Thursday" onclick="window.ApdaCitizenDashboard.selectForecast('Thursday','29','58','Humid conditions with scattered showers.','75','20','4')">
                <div class="apd-day-name">Thu</div>
                <div class="apd-day-icon">🌦️</div>
                <div class="apd-day-temp">29°</div>
                <div class="apd-day-rain">💧 58%</div>
              </div>
              <div class="apd-day-card" data-day="Friday" onclick="window.ApdaCitizenDashboard.selectForecast('Friday','31','48','Warmest day of the week with lower rain probability.','60','12','7')">
                <div class="apd-day-name">Fri</div>
                <div class="apd-day-icon">☀️</div>
                <div class="apd-day-temp">31°</div>
                <div class="apd-day-rain">💧 48%</div>
              </div>
              <div class="apd-day-card" data-day="Saturday" onclick="window.ApdaCitizenDashboard.selectForecast('Saturday','30','68','Cloudy and rainy spells returning through the day.','83','22','3')">
                <div class="apd-day-name">Sat</div>
                <div class="apd-day-icon">🌧️</div>
                <div class="apd-day-temp">30°</div>
                <div class="apd-day-rain">💧 68%</div>
              </div>
            </div>

            <div class="apd-fc-summary" aria-label="Weekly weather outlook">
              <div class="apd-fc-summary-card">
                <div class="apd-fc-summary-label">Weekly outlook</div>
                <div class="apd-fc-summary-value">Warm, humid days with showers easing toward Friday.</div>
              </div>
              <div class="apd-fc-summary-card">
                <div class="apd-fc-summary-label">Today's rain probability</div>
                <div class="apd-rain-meter"><div class="apd-rain-meter-track"><i id="apd-fc-rain-meter" class="apd-rain-meter-fill"></i></div><span id="apd-fc-rain-meter-label">72%</span></div>
              </div>
            </div>

            <!-- SVG Area Chart -->
            <div class="apd-fc-chart-wrap">
              <div class="apd-chart-title-row">
                <div class="apd-chart-title">Temperature trend</div>
              </div>
              <svg id="apd-temp-chart" class="apd-forecast-chart" viewBox="0 0 620 240" role="img" aria-label="Seven-day temperature forecast">
                <defs>
                  <linearGradient id="fc-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.02"/>
                  </linearGradient>
                  <linearGradient id="fc-line-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#fde68a"/>
                    <stop offset="100%" stop-color="#f59e0b"/>
                  </linearGradient>
                  <filter id="fc-glow">
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <!-- Grid lines -->
                <g stroke="rgba(251,191,36,0.08)" stroke-width="1">
                  <line x1="54" y1="30"  x2="600" y2="30"/>
                  <line x1="54" y1="72"  x2="600" y2="72"/>
                  <line x1="54" y1="114" x2="600" y2="114"/>
                  <line x1="54" y1="156" x2="600" y2="156"/>
                  <line x1="54" y1="198" x2="600" y2="198"/>
                </g>
                <!-- Y axis labels -->
                <g fill="rgba(251,191,36,0.38)" font-size="10" font-family="Inter,system-ui,sans-serif" font-weight="700">
                  <text x="10" y="34">32°</text>
                  <text x="10" y="76">29°</text>
                  <text x="10" y="118">26°</text>
                  <text x="10" y="160">23°</text>
                  <text x="10" y="202">20°</text>
                </g>
                <!-- Rain % bar (faint, behind) -->
                <g opacity="0.22">
                  <rect x="55"  y="92"  width="36" height="106" rx="4" fill="#fbbf24"/>
                  <rect x="142" y="101" width="36" height="97"  rx="4" fill="#fbbf24"/>
                  <rect x="229" y="80"  width="36" height="118" rx="4" fill="#fbbf24"/>
                  <rect x="316" y="117" width="36" height="81"  rx="4" fill="#fbbf24"/>
                  <rect x="403" y="110" width="36" height="88"  rx="4" fill="#fbbf24"/>
                  <rect x="490" y="134" width="36" height="64"  rx="4" fill="#fbbf24"/>
                  <rect x="564" y="104" width="36" height="94"  rx="4" fill="#fbbf24"/>
                </g>
                <!-- Area fill -->
                <path d="M73 90 L160 78 L247 104 L334 64 L421 78 L508 50 L582 64 L582 198 L73 198 Z" fill="url(#fc-area-grad)"/>
                <!-- Temperature line -->
                <polyline class="apd-temp-line" points="73,90 160,78 247,104 334,64 421,78 508,50 582,64"
                  fill="none" stroke="url(#fc-line-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#fc-glow)"/>
                <!-- Data points -->
                <g fill="#1a1400" stroke="#fbbf24" stroke-width="2.5" filter="url(#fc-glow)">
                  <circle class="apd-forecast-point" cx="73"  cy="90"  r="5" onclick="window.ApdaCitizenDashboard.selectForecast('Today','28','72','Heavy rain expected. Keep an umbrella handy and plan travel carefully.','89','24','2')"/>
                  <circle class="apd-forecast-point" cx="160" cy="78"  r="5" onclick="window.ApdaCitizenDashboard.selectForecast('Monday','29','64','Cloudy intervals with showers possible in the afternoon.','78','18','3')"/>
                  <circle class="apd-forecast-point" cx="247" cy="104" r="5" onclick="window.ApdaCitizenDashboard.selectForecast('Tuesday','27','79','The wettest day this week; avoid low-lying routes where possible.','92','30','1')"/>
                  <circle class="apd-forecast-point" cx="334" cy="64"  r="5" onclick="window.ApdaCitizenDashboard.selectForecast('Wednesday','30','55','Warmer and brighter, with brief evening showers.','70','14','5')"/>
                  <circle class="apd-forecast-point" cx="421" cy="78"  r="5" onclick="window.ApdaCitizenDashboard.selectForecast('Thursday','29','58','Humid conditions with scattered showers.','75','20','4')"/>
                  <circle class="apd-forecast-point" cx="508" cy="50"  r="5" onclick="window.ApdaCitizenDashboard.selectForecast('Friday','31','48','Warmest day of the week with lower rain probability.','60','12','7')"/>
                  <circle class="apd-forecast-point" cx="582" cy="64"  r="5" onclick="window.ApdaCitizenDashboard.selectForecast('Saturday','30','68','Cloudy and rainy spells returning through the day.','83','22','3')"/>
                </g>
                <!-- Temp labels on chart -->
                <g fill="rgba(253,230,138,0.9)" font-size="10" font-weight="800" font-family="Inter,system-ui,sans-serif">
                  <text x="62"  y="80">28°</text>
                  <text x="149" y="68">29°</text>
                  <text x="236" y="94">27°</text>
                  <text x="323" y="54">30°</text>
                  <text x="410" y="68">29°</text>
                  <text x="497" y="40">31°</text>
                  <text x="571" y="54">30°</text>
                </g>
                <!-- X axis day labels -->
                <g fill="rgba(251,191,36,0.45)" font-size="10" font-weight="700" font-family="Inter,system-ui,sans-serif" text-anchor="middle">
                  <text x="73"  y="220">Today</text>
                  <text x="160" y="220">Mon</text>
                  <text x="247" y="220">Tue</text>
                  <text x="334" y="220">Wed</text>
                  <text x="421" y="220">Thu</text>
                  <text x="508" y="220">Fri</text>
                  <text x="582" y="220">Sat</text>
                </g>
              </svg>
            </div>

            <!-- Nearest river water-level chart -->
            <div class="apd-river-chart-wrap">
              <div class="apd-chart-title-row">
                <div>
                  <div class="apd-chart-title">Nearest river water level</div>
                  <div class="apd-river-meta">Bharalu River · Hatigaon monitoring point</div>
                </div>
                <div class="apd-river-status">Normal · 3.8 m</div>
              </div>
              <svg id="apd-river-chart" class="apd-forecast-chart" viewBox="0 0 620 190" role="img" aria-label="Bharalu River seven-day water-level forecast">
                <defs>
                  <linearGradient id="river-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#fcd34d" stop-opacity="0.28"/>
                    <stop offset="100%" stop-color="#fcd34d" stop-opacity="0.03"/>
                  </linearGradient>
                  <linearGradient id="river-line-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#fde68a"/>
                    <stop offset="100%" stop-color="#f59e0b"/>
                  </linearGradient>
                </defs>
                <g stroke="rgba(251,191,36,0.08)" stroke-width="1">
                  <line x1="54" y1="25" x2="600" y2="25"/><line x1="54" y1="61" x2="600" y2="61"/>
                  <line x1="54" y1="97" x2="600" y2="97"/><line x1="54" y1="133" x2="600" y2="133"/><line x1="54" y1="161" x2="600" y2="161"/>
                </g>
                <line x1="54" y1="43" x2="600" y2="43" stroke="rgba(251,191,36,0.42)" stroke-width="1" stroke-dasharray="4 4"/>
                <text x="57" y="39" fill="rgba(253,230,138,0.55)" font-size="9" font-weight="700">alert level 5.0 m</text>
                <g fill="rgba(251,191,36,0.38)" font-size="10" font-family="Inter,system-ui,sans-serif" font-weight="700">
                  <text x="10" y="29">5.5m</text><text x="10" y="65">4.5m</text><text x="10" y="101">3.5m</text><text x="10" y="137">2.5m</text>
                </g>
                <path d="M73 110 L160 104 L247 94 L334 82 L421 88 L508 101 L582 107 L582 161 L73 161 Z" fill="url(#river-area-grad)"/>
                <polyline points="73,110 160,104 247,94 334,82 421,88 508,101 582,107" fill="none" stroke="url(#river-line-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#fc-glow)"/>
                <g fill="#1a1400" stroke="#fbbf24" stroke-width="2.5">
                  <circle cx="73" cy="110" r="4"/><circle cx="160" cy="104" r="4"/><circle cx="247" cy="94" r="4"/><circle cx="334" cy="82" r="4"/><circle cx="421" cy="88" r="4"/><circle cx="508" cy="101" r="4"/><circle cx="582" cy="107" r="4"/>
                </g>
                <g fill="rgba(253,230,138,0.88)" font-size="10" font-weight="800" font-family="Inter,system-ui,sans-serif">
                  <text x="61" y="100">3.8</text><text x="148" y="94">4.0</text><text x="235" y="84">4.3</text><text x="322" y="72">4.6</text><text x="409" y="78">4.4</text><text x="496" y="91">4.1</text><text x="570" y="97">3.9</text>
                </g>
                <g fill="rgba(251,191,36,0.45)" font-size="10" font-weight="700" font-family="Inter,system-ui,sans-serif" text-anchor="middle">
                  <text x="73" y="182">Today</text><text x="160" y="182">Mon</text><text x="247" y="182">Tue</text><text x="334" y="182">Wed</text><text x="421" y="182">Thu</text><text x="508" y="182">Fri</text><text x="582" y="182">Sat</text>
                </g>
              </svg>
            </div>

            <!-- Detail message bar -->
            <div id="apd-forecast-detail" class="apd-forecast-detail">☔ Today: Heavy rain expected. Keep an umbrella handy and plan travel carefully.</div>
          </div>
        </div>

        <!-- Calendar Modal -->
        <div id="apd-forecast-calendar" class="apd-forecast-calendar" role="dialog" aria-modal="true" aria-label="Calendar" onclick="if(event.target===this)this.classList.remove('is-open')">
          <div class="apd-calendar-page">
            <div class="apd-calendar-heading"><span>📅 Calendar</span><button type="button" class="apd-forecast-close" aria-label="Close" onclick="document.getElementById('apd-forecast-calendar').classList.remove('is-open')">&times;</button></div>
            <div class="apd-calendar-heading"><span>Select a forecast date</span><span id="apd-forecast-calendar-date">${forecastDateLabel}</span></div>
            <div class="apd-calendar-navigation">
              <div class="apd-calendar-nav-group"><button type="button" class="apd-calendar-nav-btn" aria-label="Previous year" onclick="window.ApdaCitizenDashboard.changeCalendarYear(-1)">&laquo;</button><button type="button" class="apd-calendar-nav-btn" aria-label="Previous month" onclick="window.ApdaCitizenDashboard.changeCalendarMonth(-1)">&lsaquo;</button></div>
              <div id="apd-calendar-month" class="apd-calendar-month-label">${calendarMonth}</div>
              <div class="apd-calendar-nav-group"><button type="button" class="apd-calendar-nav-btn" aria-label="Next month" onclick="window.ApdaCitizenDashboard.changeCalendarMonth(1)">&rsaquo;</button><button type="button" class="apd-calendar-nav-btn" aria-label="Next year" onclick="window.ApdaCitizenDashboard.changeCalendarYear(1)">&raquo;</button></div>
            </div>
            <div class="apd-calendar-weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
            <div id="apd-calendar-grid" class="apd-calendar-grid"></div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="apd-stats">
          <div class="apd-stat apd-stat-red" onclick="window.ApdaState.setCitizenTab('alerts')">
            <div class="apd-stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <div class="apd-stat-val">${openAlerts || 0}</div>
              <div class="apd-stat-label">Active Alerts</div>
            </div>
          </div>
          <div class="apd-stat apd-stat-blue" onclick="window.ApdaState.setCitizenTab('shelters')">
            <div class="apd-stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </div>
            <div>
              <div class="apd-stat-val">24</div>
              <div class="apd-stat-label">Nearby Shelters</div>
            </div>
          </div>
          <div class="apd-stat apd-stat-green" onclick="window.ApdaState.setCitizenTab('requests')">
            <div class="apd-stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <div class="apd-stat-val">3.2m</div>
              <div class="apd-stat-label">Avg Response</div>
            </div>
          </div>
          <div class="apd-stat apd-stat-amber" onclick="window.ApdaState.setCitizenTab('chat')">
            <div class="apd-stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <div>
              <div class="apd-stat-val">156</div>
              <div class="apd-stat-label">Online Now</div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="apd-main">

          <!-- Left: Content Area -->
          <div class="min-w-0">
            <!-- Content Panel -->
            <div class="apd-content" id="citizen-subtab-container">
              <div class="apd-content-header">
                <div class="apd-content-title">
                  ${navTabs.find(t => t.id === activeTab)?.icon || ''}
                  ${navTabs.find(t => t.id === activeTab)?.label || 'Live Alerts'}
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 font-medium">Last updated: Just now</span>
                  <button onclick="window.ApdaLiveAlerts.refresh()" class="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Refresh">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  </button>
                </div>
              </div>
              ${contentHtml}
            </div>
          </div>

          <!-- Right: Sidebar Widgets -->
          <div class="apd-side">

            <!-- Feature Navigation Rail -->
            <div class="apd-side-card apd-contacts-card">
              <div class="apd-side-title">Features</div>
              <nav class="apd-tabs" aria-label="Citizen dashboard features">
                ${navTabs.map(t => {
      const isActive = activeTab === t.id;
      const badge = t.id === 'alerts' && openAlerts ? `<span class="apd-tab-badge">${openAlerts}</span>` : '';
      return `
                  <button onclick="window.ApdaState.setCitizenTab('${t.id}')" class="apd-tab ${isActive ? 'active' : ''}">
                    ${t.icon}
                    <span>${t.label}</span>
                    ${badge}
                  </button>
                `;
    }).join('')}
              </nav>
            </div>

            <!-- Weather Widget -->
            <div class="apd-side-card apd-weather-sidebar">
              <div class="apd-side-title">Weather</div>
              <div class="apd-weather">
                <div class="apd-weather-icon">🌧️</div>
                <div>
                  <div class="apd-weather-temp">28°C</div>
                  <div class="apd-weather-desc">Heavy Rain Expected</div>
                  <div class="apd-weather-meta">
                    <span>💧 89% Humidity</span>
                    <span>💨 24 km/h</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Emergency Contacts -->
            <div class="apd-side-card">
              <div class="apd-side-title">Emergency Contacts</div>
              <div class="apd-contacts-list">
                <div class="apd-contact" role="button" tabindex="0" onclick="window.location.href='tel:108'" onkeydown="if (event.key === 'Enter' || event.key === ' ') window.location.href='tel:108'">
                  <div class="apd-contact-icon">108</div>
                  <div>
                    <div class="apd-contact-name">Ambulance</div>
                    <div class="apd-contact-num">National Emergency</div>
                  </div>
                  <div class="apd-contact-call">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                </div>
                <div class="apd-contact" role="button" tabindex="0" onclick="window.location.href='tel:101'" onkeydown="if (event.key === 'Enter' || event.key === ' ') window.location.href='tel:101'">
                  <div class="apd-contact-icon">101</div>
                  <div>
                    <div class="apd-contact-name">Fire Service</div>
                    <div class="apd-contact-num">State Emergency</div>
                  </div>
                  <div class="apd-contact-call">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                </div>
                <div class="apd-contact" role="button" tabindex="0" onclick="window.location.href='tel:100'" onkeydown="if (event.key === 'Enter' || event.key === ' ') window.location.href='tel:100'">
                  <div class="apd-contact-icon">100</div>
                  <div>
                    <div class="apd-contact-name">Police</div>
                    <div class="apd-contact-num">Law Enforcement</div>
                  </div>
                  <div class="apd-contact-call">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                </div>
                <div class="apd-contact" role="button" tabindex="0" onclick="window.location.href='tel:1078'" onkeydown="if (event.key === 'Enter' || event.key === ' ') window.location.href='tel:1078'">
                  <div class="apd-contact-icon" style="font-size: 0.625rem;">NDRF</div>
                  <div>
                    <div class="apd-contact-name">Disaster Response</div>
                    <div class="apd-contact-num">NDRF Helpline</div>
                  </div>
                  <div class="apd-contact-call">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>

        <!-- Fixed SOS Button -->
        <div class="apd-sos">
          <button onclick="window.ApdaSOSModal.triggerPanicSOS()" class="apd-sos-btn" title="Medical emergency — send SOS" aria-label="Send medical emergency SOS">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18h12M7 18v-5a5 5 0 0 1 10 0v5M5 10l-2-2m16 2 2-2M12 6V3M5 21h14"/><path stroke-linecap="round" stroke-linejoin="round" d="M10 13h4m-2-2v4"/></svg>
          </button>
        </div>

      </div>
    `;
  }
};
