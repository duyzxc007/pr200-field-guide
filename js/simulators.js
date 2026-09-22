/* PR200 FIELD GUIDE — INTERACTIVE SIMULATION & VECTOR ENGINE */

class WebAudioToneGenerator {
  constructor() {
    this.ctx = null;
    this.osc = null;
    this.gain = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.level = -85; // dBm
    this.enabled = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  toggle(enable) {
    this.enabled = enable;
    if (!this.enabled) {
      this.stop();
      return false;
    }
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.startLoop();
    return true;
  }

  setLevel(dBm) {
    this.level = Math.max(-110, Math.min(-20, dBm));
  }

  startLoop() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (!this.enabled) return;

    const playBeep = () => {
      if (!this.enabled || !this.ctx) return;
      
      // Map level (-90 dBm to -40 dBm) to frequency (400 Hz to 1800 Hz)
      const norm = Math.max(0, Math.min(1, (this.level - (-90)) / 50));
      const freq = 440 + norm * 1200;
      const duration = 0.05 + (1 - norm) * 0.08;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio tone error', e);
      }

      // Interval between beeps: Weak = 800ms, Strong = 90ms
      const nextInterval = 90 + Math.pow(1 - norm, 2) * 800;
      this.intervalId = setTimeout(playBeep, nextInterval);
    };

    playBeep();
  }

  stop() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Exported instance
const toneGen = new WebAudioToneGenerator();

/* =========================================================================
   1. HERO PREVIEW CANVAS
   ========================================================================= */
class HeroPreviewCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
    this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
    this.waterfallRows = [];
    this.maxRows = 70;
    this.time = 0;
    this.active = true;
    this.currentPreset = '01_FAST_SURVEY';
    this.scanBeamX = 40;
    this.burstTimer = 0;
    this.maxHoldBuffer = [];
    
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
    this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  setPreset(presetKey) {
    this.currentPreset = presetKey;
    this.waterfallRows = [];
    this.maxHoldBuffer = [];
    this.time = 0;
    this.burstTimer = 0;
    this.scanBeamX = 40;
  }

  loop() {
    if (!this.active) return;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      this.time += 0.05;
      this.burstTimer += 0.05;
    }
    if (document.visibilityState === 'visible' && this.canvas && this.canvas.offsetParent !== null) {
      this.render();
    }
    requestAnimationFrame(() => this.loop());
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const splitY = h * 0.58;

    ctx.fillStyle = '#08080B';
    ctx.fillRect(0, 0, w, h);

    // Draw Grid Lines in Spectrum Area
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 20; y < splitY; y += 24) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
    }
    for (let x = 40; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, splitY - 5);
      ctx.stroke();
    }

    ctx.font = '11px JetBrains Mono, monospace';

    switch (this.currentPreset) {
      case '01_FAST_SURVEY':
        this.renderPScanSurvey(ctx, w, h, splitY);
        break;
      case '02_NARROW_SIGNAL':
        this.renderNarrowReceiver(ctx, w, h, splitY);
        break;
      case '03_INTERFERENCE':
        this.renderInterferenceMaxHold(ctx, w, h, splitY);
        break;
      case '04_DF':
        this.renderDirectionFinding(ctx, w, h, splitY);
        break;
      case '05_TDD_HUNT':
        this.renderGatedTDD(ctx, w, h, splitY);
        break;
      case '06_RECORD':
        this.renderIQRecording(ctx, w, h, splitY);
        break;
      default:
        this.renderPScanSurvey(ctx, w, h, splitY);
    }
  }

  /* -------------------------------------------------------------------------
     PRESET 1: PSCAN FAST SURVEY (60 GHz/s, Wide multi-carrier, Scan beam)
     ------------------------------------------------------------------------- */
  renderPScanSurvey(ctx, w, h, splitY) {
    ctx.fillStyle = '#FACC15';
    ctx.fillText('[ PSCAN 100–1000 MHz | SPEED: สูงสุด 60 GHz/s @ 1 MHz res | AUTO ATT ]', 45, 16);

    const c1 = Math.floor(w * 0.22);
    const c2 = Math.floor(w * 0.52);
    const c3 = Math.floor(w * 0.78);

    ctx.beginPath();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.8;

    for (let x = 40; x < w - 10; x++) {
      let noise = (Math.sin(x * 0.25 + this.time * 2) * 2 + Math.cos(x * 0.8 - this.time) * 3 + Math.random() * 4);
      let baselineY = splitY - 22 + noise;
      let peakH = 0;

      const d1 = Math.abs(x - c1);
      const d2 = Math.abs(x - c2);
      const d3 = Math.abs(x - c3);

      if (d1 < 22) peakH = Math.pow(Math.cos((d1 / 22) * (Math.PI / 2)), 2) * 45;
      if (d2 < 30) peakH = Math.max(peakH, Math.pow(Math.cos((d2 / 30) * (Math.PI / 2)), 3) * (splitY - 50));
      if (d3 < 20) peakH = Math.max(peakH, Math.pow(Math.cos((d3 / 20) * (Math.PI / 2)), 2) * 38);

      const y = baselineY - peakH;
      if (x === 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fast Sweeping Beam
    this.scanBeamX += 14;
    if (this.scanBeamX > w - 10) this.scanBeamX = 40;

    const grad = ctx.createLinearGradient(this.scanBeamX - 35, 0, this.scanBeamX, 0);
    grad.addColorStop(0, 'rgba(250, 204, 21, 0)');
    grad.addColorStop(1, 'rgba(250, 204, 21, 0.28)');
    ctx.fillStyle = grad;
    ctx.fillRect(this.scanBeamX - 35, 10, 35, splitY - 12);

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.scanBeamX, 10);
    ctx.lineTo(this.scanBeamX, splitY - 5);
    ctx.stroke();

    // Marker
    const peakY = splitY - 22 - (splitY - 50);
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(c2, peakY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8F9FA';
    ctx.fillText('138.000 MHz', c2 - 35, peakY - 10);
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('-45.0 dBm', c2 - 25, peakY + 16);

    this.renderWaterfallGeneric(w, h, splitY, [c1, c2, c3], [160, 230, 150], 'amber');
  }

  /* -------------------------------------------------------------------------
     PRESET 2: NARROW SIGNAL (Ultra-narrow RBW 1 kHz, Clean laser line)
     ------------------------------------------------------------------------- */
  renderNarrowReceiver(ctx, w, h, splitY) {
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('[ RECEIVER (VFO A) | SPAN: 50 kHz | RBW: 1 kHz | DEMOD: FM ]', 45, 16);

    const centerBin = Math.floor(w * 0.50);

    // Squelch line
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(40, splitY - 32);
    ctx.lineTo(w - 10, splitY - 32);
    ctx.stroke();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.fillText('SQL: -100 dBm', w - 110, splitY - 36);
    ctx.restore();

    ctx.beginPath();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.8;

    for (let x = 40; x < w - 10; x++) {
      let noise = (Math.sin(x * 0.4 + this.time) * 1.2 + Math.cos(x * 1.1) * 1.2 + Math.random() * 2);
      let baselineY = splitY - 14 + noise; // Very low noise floor -118 dBm
      let peakH = 0;

      const dist = Math.abs(x - centerBin);
      if (dist < 10) {
        peakH = Math.pow(Math.cos((dist / 10) * (Math.PI / 2)), 4) * (splitY - 45);
      } else if (dist >= 14 && dist < 22) {
        peakH = Math.cos(((dist - 18) / 4) * (Math.PI / 2)) * 12; // FM sideband
      }

      const y = baselineY - peakH;
      if (x === 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Marker
    const peakY = splitY - 14 - (splitY - 45);
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(centerBin, peakY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8F9FA';
    ctx.fillText('138.125 MHz', centerBin - 35, peakY - 10);
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('-58.0 dBm (SNR +60dB)', centerBin - 45, peakY + 16);

    this.renderWaterfallGeneric(w, h, splitY, [centerBin], [240], 'cyan');
  }

  /* -------------------------------------------------------------------------
     PRESET 3: INTERFERENCE (Max Hold & Polychrome color map, Burst signal)
     ------------------------------------------------------------------------- */
  renderInterferenceMaxHold(ctx, w, h, splitY) {
    ctx.fillStyle = '#F43F5E';
    ctx.fillText('[ MAX HOLD + POLYCHROME | 433.920 MHz | PERSISTENCE: 2.5s ]', 45, 16);

    const c1 = Math.floor(w * 0.50);
    const isBurst = (Math.sin(this.burstTimer * 2.5) > -0.15);

    if (this.maxHoldBuffer.length !== w) {
      this.maxHoldBuffer = new Array(w).fill(splitY - 25);
    }

    const currentTraceY = [];

    // Live trace
    ctx.beginPath();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.6;

    for (let x = 40; x < w - 10; x++) {
      let noise = (Math.sin(x * 0.3 + this.time * 3) * 2.5 + Math.random() * 4.5);
      let baselineY = splitY - 26 + noise; // Elevated noise floor -98 dBm
      let peakH = 0;

      if (isBurst) {
        const dist = Math.abs(x - c1);
        if (dist < 28) {
          peakH = Math.pow(Math.cos((dist / 28) * (Math.PI / 2)), 2) * (splitY - 50);
        }
      }

      const y = baselineY - peakH;
      currentTraceY[x] = y;

      if (y < this.maxHoldBuffer[x]) {
        this.maxHoldBuffer[x] = y;
      } else {
        this.maxHoldBuffer[x] += 0.08; // slow decay for persistence
      }

      if (x === 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Max Hold Trace (Red/Rose)
    ctx.beginPath();
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 1.6;
    for (let x = 40; x < w - 10; x++) {
      const my = this.maxHoldBuffer[x];
      if (x === 40) ctx.moveTo(x, my);
      else ctx.lineTo(x, my);
    }
    ctx.stroke();

    // Marker on Max Hold
    const maxHoldPeakY = Math.min(...this.maxHoldBuffer.slice(c1 - 5, c1 + 5));
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(c1, maxHoldPeakY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8F9FA';
    ctx.fillText('MAX: -52.0 dBm', c1 - 40, maxHoldPeakY - 10);
    ctx.fillStyle = '#F43F5E';
    ctx.fillText(isBurst ? '● BURST ACTIVE' : '○ BURST SILENT', c1 - 40, maxHoldPeakY + 16);

    this.renderWaterfallGeneric(w, h, splitY, isBurst ? [c1] : [], isBurst ? [250] : [], 'polychrome');
  }

  /* -------------------------------------------------------------------------
     PRESET 4: DIRECTION FINDING (CS-DF Gate, AoA Compass Badge, Interferometer)
     ------------------------------------------------------------------------- */
  renderDirectionFinding(ctx, w, h, splitY) {
    ctx.fillStyle = '#10B981';
    ctx.fillText('[ CS-DF AUTOMATIC DF | 156.800 MHz | CORRELATIVE INTERFEROMETER ]', 45, 16);

    const c1 = Math.floor(w * 0.50);

    // DF Bandwidth Gate
    const gateW = 70;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(c1 - gateW / 2, 24, gateW, splitY - 30);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.strokeRect(c1 - gateW / 2, 24, gateW, splitY - 30);
    ctx.fillStyle = '#10B981';
    ctx.fillText('DF BW: 15 kHz', c1 - 32, 36);

    // Floating AoA Compass Badge
    ctx.fillStyle = 'rgba(20, 20, 27, 0.9)';
    ctx.fillRect(w - 230, 10, 220, 28);
    ctx.strokeStyle = '#10B981';
    ctx.strokeRect(w - 230, 10, 220, 28);
    ctx.fillStyle = '#F8F9FA';
    ctx.fillText('🧭 AoA: 087° · QUALITY: 94%', w - 220, 26);

    // Signal trace
    ctx.beginPath();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1.8;

    for (let x = 40; x < w - 10; x++) {
      let noise = (Math.sin(x * 0.3 + this.time) * 1.5 + Math.random() * 3);
      let baselineY = splitY - 20 + noise;
      let peakH = 0;

      const dist = Math.abs(x - c1);
      if (dist < 26) {
        peakH = Math.pow(Math.cos((dist / 26) * (Math.PI / 2)), 2.5) * (splitY - 50);
      }

      const y = baselineY - peakH;
      if (x === 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Marker
    const peakY = splitY - 20 - (splitY - 50);
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(c1, peakY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8F9FA';
    ctx.fillText('156.800 MHz', c1 - 35, peakY - 10);
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('-62.0 dBm', c1 - 25, peakY + 16);

    this.renderWaterfallGeneric(w, h, splitY, [c1], [220], 'emerald');
  }

  /* -------------------------------------------------------------------------
     PRESET 5: TDD HUNT (CS-ZS Gated Spectrum, Downlink Masked, Guard Intf)
     ------------------------------------------------------------------------- */
  renderGatedTDD(ctx, w, h, splitY) {
    ctx.fillStyle = '#A855F7';
    ctx.fillText('[ CS-ZS GATED SPECTRUM | 5G TDD 2600 MHz | TIMING: GUARD SLOT ]', 45, 16);

    const dlEnd = Math.floor(w * 0.55);
    const gpEnd = Math.floor(w * 0.75);

    // DL Masked Box
    ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    ctx.fillRect(40, 24, dlEnd - 40, splitY - 30);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
    ctx.strokeRect(40, 24, dlEnd - 40, splitY - 30);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
    ctx.fillText('DL HIGH POWER (+25dBm BLOCKED)', 48, 36);

    // Guard Slot Highlight
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(dlEnd, 24, gpEnd - dlEnd, splitY - 30);
    ctx.strokeStyle = '#10B981';
    ctx.strokeRect(dlEnd, 24, gpEnd - dlEnd, splitY - 30);
    ctx.fillStyle = '#10B981';
    ctx.fillText('GUARD SLOT (400–450µs)', dlEnd + 8, 36);

    const intfX = Math.floor((dlEnd + gpEnd) / 2);

    ctx.beginPath();
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 1.8;

    for (let x = 40; x < w - 10; x++) {
      let noise = (Math.sin(x * 0.3 + this.time) * 1.5 + Math.random() * 2.5);
      let baselineY = splitY - 20 + noise;
      let peakH = 0;

      // In guard period, an interference signal is revealed!
      const dist = Math.abs(x - intfX);
      if (dist < 15) {
        peakH = Math.pow(Math.cos((dist / 15) * (Math.PI / 2)), 2) * (splitY - 55);
      }

      const y = baselineY - peakH;
      if (x === 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Marker
    const peakY = splitY - 20 - (splitY - 55);
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(intfX, peakY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8F9FA';
    ctx.fillText('INTF REVEALED', intfX - 40, peakY - 10);
    ctx.fillStyle = '#10B981';
    ctx.fillText('-68.0 dBm', intfX - 25, peakY + 16);

    this.renderWaterfallGeneric(w, h, splitY, [intfX], [200], 'tdd');
  }

  /* -------------------------------------------------------------------------
     PRESET 6: IQ RECORDING & TECHNICAL AUDIT TRAIL (Flashing REC, 40 MHz Flat-top)
     ------------------------------------------------------------------------- */
  renderIQRecording(ctx, w, h, splitY) {
    ctx.fillStyle = '#EF4444';
    ctx.fillText('[ CS-IQ RECORDING | 40 MHz RTBW | 50 MSa/s | TECHNICAL AUDIT ]', 45, 16);

    // Flashing REC Dot
    const isBlink = Math.floor(this.time * 2) % 2 === 0;
    if (isBlink) {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(w - 120, 18, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#F8F9FA';
    ctx.fillText('REC 00:04:32', w - 105, 22);

    const c1 = Math.floor(w * 0.50);
    const bandW = Math.floor(w * 0.40);

    ctx.beginPath();
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.8;

    for (let x = 40; x < w - 10; x++) {
      let noise = (Math.sin(x * 0.3 + this.time * 2) * 1.5 + Math.random() * 3);
      let baselineY = splitY - 18 + noise;
      let peakH = 0;

      const dist = Math.abs(x - c1);
      if (dist < bandW / 2) {
        // Flat top with subtle ripples
        peakH = (splitY - 50) + Math.sin(x * 0.2) * 2;
      } else if (dist < bandW / 2 + 16) {
        // Steep filter roll-off
        const skirt = 1 - (dist - bandW / 2) / 16;
        peakH = (splitY - 50) * Math.pow(skirt, 2);
      }

      const y = baselineY - peakH;
      if (x === 40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Geostamp on Canvas
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('📍 GNSS: 13.7563° N, 100.5018° E | UTC 07:10:45', 45, splitY - 14);

    // Marker
    const peakY = splitY - 18 - (splitY - 50);
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(c1, peakY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8F9FA';
    ctx.fillText('138.000 MHz', c1 - 35, peakY - 10);
    ctx.fillStyle = '#EF4444';
    ctx.fillText('-65.0 dBm (40MHz RTBW)', c1 - 50, peakY + 16);

    this.renderWaterfallGeneric(w, h, splitY, [c1], [220], 'record', bandW);
  }

  /* -------------------------------------------------------------------------
     DYNAMIC WATERFALL RENDERER
     ------------------------------------------------------------------------- */
  renderWaterfallGeneric(w, h, splitY, centers, intensities, theme = 'amber', bandW = 0) {
    const ctx = this.ctx;

    // Separator Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, splitY);
    ctx.lineTo(w, splitY);
    ctx.stroke();

    if (Math.random() < 0.35) {
      const row = new Uint8Array(w);
      for (let x = 40; x < w - 10; x++) {
        let baseInt = Math.random() * 30;
        
        if (theme === 'record' && bandW > 0) {
          const d = Math.abs(x - centers[0]);
          if (d < bandW / 2) {
            baseInt = 160 + Math.random() * 70;
          }
        } else {
          for (let i = 0; i < centers.length; i++) {
            const dist = Math.abs(x - centers[i]);
            if (dist < 16) {
              baseInt = Math.max(baseInt, intensities[i] - dist * 5 + Math.random() * 30);
            }
          }
        }
        row[x] = Math.min(255, baseInt);
      }
      this.waterfallRows.unshift(row);
      if (this.waterfallRows.length > this.maxRows) this.waterfallRows.pop();
    }

    const wfHeight = h - splitY;
    const rowH = wfHeight / this.maxRows;

    for (let r = 0; r < this.waterfallRows.length; r++) {
      const rowData = this.waterfallRows[r];
      const curY = splitY + r * rowH;

      for (let x = 40; x < w - 10; x += 2) {
        const val = rowData[x] || 0;

        if (theme === 'polychrome') {
          if (val > 180) ctx.fillStyle = '#F43F5E';
          else if (val > 120) ctx.fillStyle = '#FACC15';
          else if (val > 60) ctx.fillStyle = '#38BDF8';
          else ctx.fillStyle = `rgb(10, 15, ${20 + val})`;
        } else if (theme === 'cyan') {
          if (val > 160) ctx.fillStyle = `rgb(56, 189, 248)`;
          else if (val > 80) ctx.fillStyle = `rgb(14, 116, 144)`;
          else ctx.fillStyle = `rgb(8, 20, ${25 + val})`;
        } else if (theme === 'emerald') {
          if (val > 160) ctx.fillStyle = `rgb(16, 185, 129)`;
          else if (val > 80) ctx.fillStyle = `rgb(5, 150, 105)`;
          else ctx.fillStyle = `rgb(6, 30, ${20 + val})`;
        } else if (theme === 'tdd') {
          // TDD frame striped pattern
          const isFrameSlot = (r % 6 < 3);
          if (isFrameSlot && val > 140) ctx.fillStyle = '#A855F7';
          else if (val > 80) ctx.fillStyle = '#10B981';
          else ctx.fillStyle = `rgb(15, 10, ${25 + val})`;
        } else if (theme === 'record') {
          if (val > 150) ctx.fillStyle = `rgb(239, 68, 68)`;
          else if (val > 80) ctx.fillStyle = `rgb(245, 158, 11)`;
          else ctx.fillStyle = `rgb(15, 15, ${30 + val})`;
        } else {
          // Default Amber
          if (val > 150) ctx.fillStyle = `rgb(250, ${Math.min(255, val + 20)}, 21)`;
          else if (val > 70) ctx.fillStyle = `rgb(20, ${val + 40}, 200)`;
          else ctx.fillStyle = `rgb(10, 15, ${30 + val})`;
        }

        ctx.fillRect(x, curY, 2, rowH + 0.5);
      }
    }
  }
}

/* =========================================================================
   2. MAIN INTERACTIVE SPECTRUM & WATERFALL / ZERO SPAN ENGINE
   ========================================================================= */
class SignalAnalysisSimulator {
  constructor() {
    this.specCanvas = document.getElementById('lessonSpectrumCanvas');
    this.wfCanvas = document.getElementById('lessonWaterfallCanvas');
    this.zeroSpanCanvas = document.getElementById('zeroSpanCanvas');
    
    this.mode = 'continuous'; // 'continuous' or 'burst'
    this.signalType = 'cw'; // 'cw', 'am', 'fm', 'digital', 'noise', 'burst', 'harmonic', 'intermod'
    this.span = 400; // kHz
    this.rbw = 10; // kHz
    this.att = 0; // dB
    this.detector = 'peak'; // 'peak', 'rms'
    this.traceMode = 'normal'; // 'normal', 'maxhold', 'avg'
    this.viewDomain = 'freq'; // 'freq' or 'time' (Zero Span)
    
    this.centerFreq = 138.125; // MHz
    this.time = 0;
    this.maxHoldBuffer = [];
    this.avgBuffer = [];
    this.waterfallRows = [];
    this.isBurstOn = true;
    this.burstTimer = 0;

    // Zero Span dynamic profile parameters
    this.zsProfile = 'radar';
    this.zsPulseWidth = 20; // ms
    this.zsPeriod = 100; // ms
    this.zsAtt = 0; // dB
    this.zsPeakBase = -65; // dBm
    
    if (this.specCanvas && this.wfCanvas) {
      this.initCanvases();
      this.bindEvents();
      this.startLoop();
    }
  }

  initCanvases() {
    this.specCtx = this.specCanvas ? this.specCanvas.getContext('2d') : null;
    this.wfCtx = this.wfCanvas ? this.wfCanvas.getContext('2d') : null;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // P0-01 Fix: Bind ResizeObserver to containers so Zero Span and Spectrum never display 0 width
    if (window.ResizeObserver) {
      if (this.specCanvas && this.specCanvas.parentElement) {
        new ResizeObserver(() => this.resize()).observe(this.specCanvas.parentElement);
      }
      if (this.zeroSpanCanvas && this.zeroSpanCanvas.parentElement) {
        new ResizeObserver(() => {
          this.resize();
          if (this.zeroSpanCanvas.offsetParent !== null) {
            this.renderZeroSpan();
          }
        }).observe(this.zeroSpanCanvas.parentElement);
      }
    }
  }

  resize() {
    if (this.specCanvas && this.specCanvas.parentElement) {
      const w = this.specCanvas.parentElement.clientWidth;
      if (w > 0) {
        this.specCanvas.width = w;
        this.specCanvas.height = 240;
        if (this.wfCanvas) {
          this.wfCanvas.width = w;
          this.wfCanvas.height = 120;
        }
        if (!this.maxHoldBuffer || this.maxHoldBuffer.length !== w) {
          this.maxHoldBuffer = new Array(w).fill(-120);
          this.avgBuffer = new Array(w).fill(-100);
        }
      }
    }
    if (this.zeroSpanCanvas && this.zeroSpanCanvas.parentElement) {
      const zw = this.zeroSpanCanvas.parentElement.clientWidth;
      if (zw > 0) {
        this.zeroSpanCanvas.width = zw;
        this.zeroSpanCanvas.height = 240;
      }
    }
  }

  bindEvents() {
    // Mode toggles
    const contBtn = document.getElementById('btnModeCont');
    const burstBtn = document.getElementById('btnModeBurst');
    if (contBtn && burstBtn) {
      contBtn.addEventListener('click', () => {
        this.mode = 'continuous';
        contBtn.classList.add('active');
        burstBtn.classList.remove('active');
      });
      burstBtn.addEventListener('click', () => {
        this.mode = 'burst';
        burstBtn.classList.add('active');
        contBtn.classList.remove('active');
      });
    }

    // Span Slider
    const spanSlider = document.getElementById('spanSlider');
    const spanVal = document.getElementById('spanValDisplay');
    if (spanSlider && spanVal) {
      spanSlider.addEventListener('input', (e) => {
        this.span = parseInt(e.target.value);
        spanVal.innerText = `${this.span} kHz`;
      });
    }

    // Attenuation Slider
    const attSlider = document.getElementById('attSlider');
    const attVal = document.getElementById('attValDisplay');
    if (attSlider && attVal) {
      attSlider.addEventListener('input', (e) => {
        this.att = parseInt(e.target.value);
        attVal.innerText = `${this.att} dB`;
      });
    }

    // Trace Mode select
    const traceSelect = document.getElementById('traceModeSelect');
    if (traceSelect) {
      traceSelect.addEventListener('change', (e) => {
        this.traceMode = e.target.value;
        this.maxHoldBuffer.fill(-120);
      });
    }

    // Signal Shape selector
    const shapeSelect = document.getElementById('signalShapeSelect');
    if (shapeSelect) {
      shapeSelect.addEventListener('change', (e) => {
        this.signalType = e.target.value;
        this.maxHoldBuffer.fill(-120);
      });
    }

    // Zero Span Profile Buttons
    const zsButtons = document.querySelectorAll('.zs-profile-btn');
    zsButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        zsButtons.forEach(b => {
          b.classList.remove('active');
          b.style.border = '1px solid rgba(255,255,255,0.15)';
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
        });
        btn.classList.add('active');
        btn.style.border = '1px solid var(--accent-amber)';
        btn.style.background = 'rgba(250,204,21,0.15)';
        btn.style.color = 'var(--accent-amber)';

        const profile = btn.getAttribute('data-profile');
        this.setZeroSpanProfile(profile);
      });
    });

    // Zero Span Attenuator Slider
    const zsAttSlider = document.getElementById('zsAttSlider');
    const zsAttVal = document.getElementById('zsAttVal');
    if (zsAttSlider && zsAttVal) {
      zsAttSlider.addEventListener('input', (e) => {
        this.zsAtt = parseInt(e.target.value) || 0;
        zsAttVal.innerText = `${this.zsAtt} dB`;
        this.updateZeroSpanMetrics();
      });
    }

    // Initial metrics update
    this.updateZeroSpanMetrics();
  }

  setZeroSpanProfile(profile) {
    this.zsProfile = profile;
    if (profile === 'radar') {
      this.zsPulseWidth = 20;
      this.zsPeriod = 100;
    } else if (profile === 'dmr') {
      this.zsPulseWidth = 27.5;
      this.zsPeriod = 60;
    } else if (profile === 'tdd') {
      this.zsPulseWidth = 10;
      this.zsPeriod = 40;
    } else if (profile === 'cw') {
      this.zsPulseWidth = 200;
      this.zsPeriod = 200;
    } else if (profile === 'glitch') {
      this.zsPulseWidth = 6;
      this.zsPeriod = 160;
    }
    this.updateZeroSpanMetrics();
  }

  updateZeroSpanMetrics() {
    const typeDisplay = document.getElementById('zsMetricType');
    const tonDisplay = document.getElementById('zsMetricTon');
    const periodDisplay = document.getElementById('zsMetricPeriod');
    const dutyDisplay = document.getElementById('zsMetricDuty');
    const prfDisplay = document.getElementById('zsMetricPrf');
    const powerDisplay = document.getElementById('zsMetricPower');

    const pwHeader = document.getElementById('zsPulseWidthDisplay');
    const pHeader = document.getElementById('zsPeriodDisplay');

    const duty = this.zsProfile === 'cw' ? 100 : ((this.zsPulseWidth / this.zsPeriod) * 100);
    const prf = this.zsProfile === 'cw' ? 0 : (1000 / this.zsPeriod);
    const peakPower = this.zsPeakBase - this.zsAtt;

    const names = {
      radar: 'PULSE RADAR',
      dmr: 'DMR TDMA SLOT',
      tdd: '5G TDD FRAME',
      cw: 'CW CONTINUOUS',
      glitch: 'EMI TRANSIENT'
    };

    if (typeDisplay) typeDisplay.innerText = names[this.zsProfile] || 'CUSTOM';
    if (tonDisplay) tonDisplay.innerText = this.zsProfile === 'cw' ? 'CONTINUOUS' : `${this.zsPulseWidth.toFixed(1)} ms`;
    if (periodDisplay) periodDisplay.innerText = this.zsProfile === 'cw' ? 'N/A' : `${this.zsPeriod.toFixed(1)} ms`;
    if (dutyDisplay) dutyDisplay.innerText = `${duty.toFixed(1)} %`;
    if (prfDisplay) prfDisplay.innerText = this.zsProfile === 'cw' ? '0 Hz' : `${prf.toFixed(1)} Hz`;
    if (powerDisplay) powerDisplay.innerText = `${peakPower.toFixed(1)} dBm`;

    if (pwHeader) pwHeader.innerText = this.zsProfile === 'cw' ? 'Duty: 100% CW' : `Pulse Width: ${this.zsPulseWidth.toFixed(1)} ms`;
    if (pHeader) pHeader.innerText = this.zsProfile === 'cw' ? 'Continuous Wave' : `Period: ${this.zsPeriod.toFixed(1)} ms (Duty ${duty.toFixed(1)}%)`;
  }

  startLoop() {
    const loop = () => {
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        this.time += 0.05;
        this.burstTimer += 0.05;
      }
      
      // Burst logic: 80ms ON every 2s in real life -> scaled for web demo: 0.5s ON every 2.5s
      if (this.mode === 'burst') {
        this.isBurstOn = (this.burstTimer % 2.5) < 0.6;
      } else {
        this.isBurstOn = true;
      }

      // Pause rendering when chapter sections are hidden or tab is in background
      if (document.visibilityState === 'visible') {
        if (this.specCanvas && this.specCanvas.offsetParent !== null) {
          this.renderSpectrum();
          this.renderWaterfall();
        }
        if (this.zeroSpanCanvas && this.zeroSpanCanvas.offsetParent !== null) {
          this.renderZeroSpan();
        }
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  renderSpectrum() {
    const ctx = this.specCtx;
    const w = this.specCanvas.width;
    const h = this.specCanvas.height;

    ctx.fillStyle = '#09090C';
    ctx.fillRect(0, 0, w, h);

    // Grid dBm (-20 to -120 dBm)
    const yMin = -120;
    const yMax = -20;
    const toY = (dBm) => h - ((dBm - yMin) / (yMax - yMin)) * (h - 30) - 20;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = '#64748B';

    for (let dBm = -120; dBm <= -20; dBm += 20) {
      const y = toY(dBm);
      ctx.beginPath();
      ctx.moveTo(45, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
      ctx.fillText(`${dBm}`, 10, y + 3);
    }

    // Frequency grid ticks
    const startF = this.centerFreq - this.span / 2000;
    const stopF = this.centerFreq + this.span / 2000;
    for (let i = 0; i <= 4; i++) {
      const frac = i / 4;
      const x = 45 + frac * (w - 55);
      const fVal = (startF + frac * (stopF - startF)).toFixed(3);
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, h - 20);
      ctx.stroke();
      ctx.fillText(`${fVal} MHz`, x - 25, h - 6);
    }

    // Generate Signal Profile
    const centerBin = 45 + 0.5 * (w - 55);
    const trace = [];
    const baseNoise = -100 - (this.att * 0.1); // baseline noise

    for (let x = 45; x < w - 10; x++) {
      const relX = (x - centerBin) / (w - 55); // -0.5 to +0.5
      const freqOffsetKhz = relX * this.span;

      let noise = (Math.random() - 0.5) * 4;
      let power = baseNoise + noise;

      if (this.isBurstOn) {
        // Base signal power before attenuation
        let signalPeak = -65 - this.att;

        if (this.signalType === 'cw') {
          // Narrow carrier
          const dF = Math.abs(freqOffsetKhz);
          if (dF < 15) {
            power = Math.max(power, signalPeak - Math.pow(dF / 4, 2) * 5);
          }
        } else if (this.signalType === 'am') {
          // Carrier + 2 sidebands (e.g. at +- 50 kHz)
          const dF0 = Math.abs(freqOffsetKhz);
          const dFL = Math.abs(freqOffsetKhz - 40);
          const dFR = Math.abs(freqOffsetKhz + 40);
          if (dF0 < 10) power = Math.max(power, signalPeak - Math.pow(dF0 / 3, 2) * 6);
          if (dFL < 8) power = Math.max(power, signalPeak - 12 - Math.pow(dFL / 3, 2) * 6);
          if (dFR < 8) power = Math.max(power, signalPeak - 12 - Math.pow(dFR / 3, 2) * 6);
        } else if (this.signalType === 'fm') {
          // FM hump with wider Bessel distribution
          const dF = Math.abs(freqOffsetKhz);
          if (dF < 50) {
            power = Math.max(power, signalPeak - Math.pow(dF / 35, 4) * 35);
          }
        } else if (this.signalType === 'digital') {
          // Broadband flat top
          const dF = Math.abs(freqOffsetKhz);
          if (dF < 70) {
            power = Math.max(power, signalPeak - 6 + (Math.random() - 0.5) * 3);
          }
        } else if (this.signalType === 'noise') {
          // Broadband EMI noise lift
          power += 25;
        } else if (this.signalType === 'intermod') {
          // Intermod artifact: sensitive to ATT! Drops by 3x ATT if 3rd order
          const artifactLoss = this.att * 2.8;
          const dF1 = Math.abs(freqOffsetKhz + 60);
          const dF2 = Math.abs(freqOffsetKhz - 60);
          if (dF1 < 12) power = Math.max(power, -60 - artifactLoss - Math.pow(dF1 / 3, 2) * 5);
          if (dF2 < 12) power = Math.max(power, -60 - artifactLoss - Math.pow(dF2 / 3, 2) * 5);
        }
      }

      // Trace Processing
      if (this.traceMode === 'maxhold') {
        this.maxHoldBuffer[x] = Math.max(this.maxHoldBuffer[x] || -120, power);
        power = this.maxHoldBuffer[x];
      } else if (this.traceMode === 'avg') {
        this.avgBuffer[x] = (this.avgBuffer[x] || power) * 0.85 + power * 0.15;
        power = this.avgBuffer[x];
      }

      trace.push({ x, y: toY(power), power });
    }

    // Draw Main Trace
    ctx.beginPath();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < trace.length; i++) {
      if (i === 0) ctx.moveTo(trace[i].x, trace[i].y);
      else ctx.lineTo(trace[i].x, trace[i].y);
    }
    ctx.stroke();

    // Callout Leader Markers
    const peakPt = trace.reduce((max, pt) => pt.power > max.power ? pt : max, trace[0]);
    if (peakPt && peakPt.power > -90) {
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(peakPt.x, peakPt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Dashed yellow leader line down
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.beginPath();
      ctx.moveTo(peakPt.x, 15);
      ctx.lineTo(peakPt.x, h - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top Peak Badge
      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`${this.centerFreq.toFixed(3)} MHz`, peakPt.x - 38, 14);
      ctx.fillText(`${peakPt.power.toFixed(1)} dBm`, peakPt.x + 8, peakPt.y - 8);

      // Update Annotation Rail DOM values
      const domFreq = document.getElementById('railFreqVal');
      const domLvl = document.getElementById('railLevelVal');
      const domNoise = document.getElementById('railNoiseVal');
      if (domFreq) domFreq.innerText = `${this.centerFreq.toFixed(3)} MHz`;
      if (domLvl) domLvl.innerText = `${peakPt.power.toFixed(1)} dBm`;
      if (domNoise) domNoise.innerText = `${baseNoise.toFixed(1)} dBm`;
    }

    this.currentTrace = trace;
  }

  renderWaterfall() {
    const ctx = this.wfCtx;
    const w = this.wfCanvas.width;
    const h = this.wfCanvas.height;

    if (!this.currentTrace || this.currentTrace.length === 0) return;

    // Sample current trace into a waterfall row
    const row = new Uint8Array(w);
    for (const pt of this.currentTrace) {
      // map power -120 to -40 dBm into 0..255
      const norm = Math.max(0, Math.min(1, (pt.power - (-110)) / 60));
      row[pt.x] = Math.floor(norm * 255);
    }

    this.waterfallRows.unshift(row);
    if (this.waterfallRows.length > 70) this.waterfallRows.pop();

    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, w, h);

    const rowH = h / 70;
    for (let r = 0; r < this.waterfallRows.length; r++) {
      const curRow = this.waterfallRows[r];
      const y = r * rowH;
      for (let x = 45; x < w - 10; x += 2) {
        const val = curRow[x] || 0;
        if (val > 180) {
          ctx.fillStyle = `rgb(250, ${220 - (val - 180)}, 21)`; // Amber/Yellow
        } else if (val > 110) {
          ctx.fillStyle = `rgb(56, ${val + 40}, 248)`; // Cyan/Electric Blue
        } else if (val > 40) {
          ctx.fillStyle = `rgb(10, 30, ${80 + val})`; // Dark Navy
        } else {
          ctx.fillStyle = '#070709';
        }
        ctx.fillRect(x, y, 2, rowH + 0.5);
      }
    }
  }

  renderZeroSpan() {
    if (!this.zeroSpanCanvas) return;
    if (this.zeroSpanCanvas.parentElement && this.zeroSpanCanvas.parentElement.clientWidth > 0) {
      const parentW = this.zeroSpanCanvas.parentElement.clientWidth;
      if (this.zeroSpanCanvas.width !== parentW) {
        this.zeroSpanCanvas.width = parentW;
        this.zeroSpanCanvas.height = 240;
      }
    }
    const w = this.zeroSpanCanvas.width;
    const h = this.zeroSpanCanvas.height;
    if (w <= 0 || h <= 0) return;
    const ctx = this.zeroSpanCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#08080B';
    ctx.fillRect(0, 0, w, h);

    // Grid (dBm axis: -30 to -110 dBm)
    const yMin = -110;
    const yMax = -30;
    const toY = (dBm) => h - ((dBm - yMin) / (yMax - yMin)) * (h - 40) - 25;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = '#64748B';

    for (let dBm = -110; dBm <= -30; dBm += 20) {
      const y = toY(dBm);
      ctx.beginPath();
      ctx.moveTo(45, y);
      ctx.lineTo(w - 15, y);
      ctx.stroke();
      ctx.fillText(`${dBm} dBm`, 5, y + 3);
    }

    // Time Axis Ticks (0 ms to 200 ms total window)
    const timeSpanMs = 200;
    for (let t = 0; t <= timeSpanMs; t += 50) {
      const x = 45 + (t / timeSpanMs) * (w - 60);
      ctx.beginPath();
      ctx.moveTo(x, 15);
      ctx.lineTo(x, h - 25);
      ctx.stroke();
      ctx.fillText(`${t} ms`, x - 14, h - 10);
    }

    // Dynamic Scrolling Time Domain Waveform
    const periodMs = this.zsPeriod || 100;
    const pulseWidthMs = this.zsPulseWidth || 20;
    const scrollOffsetMs = (this.time * 25) % periodMs;

    ctx.beginPath();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;

    const baseNoiseY = toY(-98);
    const pulseHighY = toY(this.zsPeakBase - (this.zsAtt || 0));

    let first = true;
    for (let px = 45; px < w - 15; px += 2) {
      const tAtX = ((px - 45) / (w - 60)) * timeSpanMs;
      const tInPeriod = (tAtX + scrollOffsetMs) % periodMs;

      let yVal = baseNoiseY + (Math.random() - 0.5) * 4;
      if (this.zsProfile === 'cw' || tInPeriod < pulseWidthMs) {
        yVal = pulseHighY + (Math.random() - 0.5) * 3;
      }

      if (first) {
        ctx.moveTo(px, yVal);
        first = false;
      } else {
        ctx.lineTo(px, yVal);
      }
    }
    ctx.stroke();

    // Measurement Overlays and Markers (when not CW)
    if (this.zsProfile !== 'cw') {
      const markerT = (periodMs - scrollOffsetMs + periodMs) % periodMs;
      if (markerT + pulseWidthMs <= timeSpanMs) {
        const mStartX = 45 + (markerT / timeSpanMs) * (w - 60);
        const mEndX = 45 + ((markerT + pulseWidthMs) / timeSpanMs) * (w - 60);

        // Pulse Width Marker Arrow
        ctx.strokeStyle = '#FACC15';
        ctx.fillStyle = '#FACC15';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(mStartX, pulseHighY - 15);
        ctx.lineTo(mEndX, pulseHighY - 15);
        ctx.stroke();

        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText(`Ton: ${pulseWidthMs.toFixed(1)} ms`, mStartX + 4, pulseHighY - 20);

        // Period Bracket
        const nextStartX = mStartX + (periodMs / timeSpanMs) * (w - 60);
        if (nextStartX < w - 20) {
          ctx.strokeStyle = '#10B981';
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.moveTo(mStartX, 28);
          ctx.lineTo(nextStartX, 28);
          ctx.stroke();
          const duty = ((pulseWidthMs / periodMs) * 100).toFixed(1);
          ctx.fillText(`Period T = ${periodMs.toFixed(1)} ms (Duty ${duty}%)`, mStartX + 10, 22);
        }
      }
    } else {
      // CW Indicator
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText('CONTINUOUS WAVE (100% DUTY) • NO PULSING DETECTED', 55, pulseHighY - 15);
    }

    // Top Status Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('R&S PR200 CS-ZS ZERO SPAN • 138.125 MHz', w - 260, 20);
  }
}

/* =========================================================================
   3. HE400 POLAR LOBE & MANUAL HOMING SIMULATOR
   ========================================================================= */
class HE400ManualDFSimulator {
  constructor() {
    this.canvas = document.getElementById('he400RadarCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.antennaHeading = 0; // 0 to 360 deg
    this.targetAzimuth = 91; // Source is at ~91° (East)
    this.sourcePolarization = 'vertical';
    this.antennaPolarization = 'vertical';
    this.isDragging = false;
    this.currentLevel = -85;

    this.resize();
    this.bindEvents();
    window.addEventListener('resize', () => {
      this.resize();
      this.render();
    });
    if (window.ResizeObserver && this.canvas.parentElement) {
      new ResizeObserver(() => {
        if (this.canvas.offsetParent !== null) {
          this.resize();
          this.render();
        }
      }).observe(this.canvas.parentElement);
    }
    this.render();
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const clientW = parent ? parent.clientWidth : 0;
    const size = Math.min(clientW > 0 ? clientW : 360, 380);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(size * dpr);
    this.canvas.height = Math.round(size * dpr);
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.size = size;
    this.cx = size / 2;
    this.cy = size / 2;
    this.radius = Math.max(50, size * 0.42);
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  bindEvents() {
    const updateAngleFromEvent = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - (rect.left + this.cx);
      const dy = clientY - (rect.top + this.cy);
      let angleRad = Math.atan2(dx, -dy); // 0 at top (North)
      if (angleRad < 0) angleRad += Math.PI * 2;
      this.antennaHeading = Math.round((angleRad * 180) / Math.PI);
      this.render();
    };

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      updateAngleFromEvent(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) updateAngleFromEvent(e);
    });
    window.addEventListener('mouseup', () => { this.isDragging = false; });

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      updateAngleFromEvent(e);
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
      if (this.isDragging) updateAngleFromEvent(e);
    });
    window.addEventListener('touchend', () => { this.isDragging = false; });

    // Polarization Toggle
    const polV = document.getElementById('btnPolVertical');
    const polH = document.getElementById('btnPolHorizontal');
    if (polV && polH) {
      polV.addEventListener('click', () => {
        this.antennaPolarization = 'vertical';
        polV.classList.add('active');
        polH.classList.remove('active');
        this.render();
      });
      polH.addEventListener('click', () => {
        this.antennaPolarization = 'horizontal';
        polH.classList.add('active');
        polV.classList.remove('active');
        this.render();
      });
    }

    // Tone Toggle Button
    const btnTone = document.getElementById('btnToggleTone');
    if (btnTone) {
      btnTone.addEventListener('click', () => {
        const active = toneGen.toggle(!toneGen.enabled);
        btnTone.classList.toggle('active', active);
        btnTone.innerHTML = active ? '🔊 Level Tone: เปิด' : '🔈 Level Tone: ปิด';
      });
    }
  }

  calculateLevel() {
    // Relative angle between antenna and source
    const diff = Math.abs((this.antennaHeading - this.targetAzimuth + 540) % 360 - 180);
    
    // Directional antenna pattern model
    let patternLoss = 0;
    if (diff < 35) {
      // Main Lobe
      patternLoss = Math.pow(diff / 35, 2) * 18;
    } else if (diff >= 35 && diff < 80) {
      // First null + side lobe (around 50°-60°)
      const sidePeak = Math.abs(diff - 55);
      patternLoss = 18 + Math.min(15, sidePeak * 1.2);
    } else if (diff >= 160 && diff <= 180) {
      // Back lobe
      patternLoss = 16;
    } else {
      // Attenuated sides
      patternLoss = 28 + Math.random() * 2;
    }

    // Polarization mismatch loss
    let polLoss = 0;
    if (this.sourcePolarization !== this.antennaPolarization) {
      polLoss = 18; // ~18 dB cross-polarization drop
    }

    const peakLevel = -53; // dBm at exact line of sight
    this.currentLevel = peakLevel - patternLoss - polLoss;
    
    // Update Tone Generator
    toneGen.setLevel(this.currentLevel);

    // Update DOM indicators
    const domHeading = document.getElementById('he400HeadingDisplay');
    const domLevel = document.getElementById('he400LevelDisplay');
    if (domHeading) domHeading.innerText = `${this.antennaHeading.toString().padStart(3, '0')}°`;
    if (domLevel) domLevel.innerText = `${this.currentLevel.toFixed(1)} dBm`;
  }

  render() {
    this.calculateLevel();
    const ctx = this.ctx;
    const cx = this.cx;
    const cy = this.cy;
    const r = this.radius;

    ctx.clearRect(0, 0, this.size, this.size);

    // Background circle
    ctx.fillStyle = '#08080B';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric Range Rings (dBm steps)
    [0.33, 0.66, 1.0].forEach((scale) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Compass Labels (N, E, S, W)
    ctx.font = 'bold 12px Inter';
    ctx.fillStyle = '#F8F9FA';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N 0°', cx, cy - r + 14);
    ctx.fillText('E 90°', cx + r - 22, cy);
    ctx.fillText('S 180°', cx, cy + r - 14);
    ctx.fillText('W 270°', cx - r + 24, cy);

    // Source Transmitter Indicator (at ~91°)
    const srcRad = ((this.targetAzimuth - 90) * Math.PI) / 180;
    const srcX = cx + Math.cos(srcRad) * (r - 20);
    const srcY = cy + Math.sin(srcRad) * (r - 20);
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(srcX, srcY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = '#F43F5E';
    ctx.fillText('TX (Source)', srcX + 2, srcY - 10);

    // Draw Antenna Lobe Shape rotated by antennaHeading
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((this.antennaHeading - 90) * Math.PI) / 180);

    // Main Lobe Beam (Forward)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(r * 0.4, -r * 0.35, r * 0.8, -r * 0.25, r * 0.95, 0);
    ctx.bezierCurveTo(r * 0.8, r * 0.25, r * 0.4, r * 0.35, 0, 0);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
    ctx.fill();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Back Lobe
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-r * 0.15, -r * 0.15, -r * 0.25, -r * 0.1, -r * 0.3, 0);
    ctx.bezierCurveTo(-r * 0.25, r * 0.1, -r * 0.15, r * 0.15, 0, 0);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.stroke();

    // Antenna Pointer Needle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.98, 0);
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();

    // Center Hub Operator
    ctx.fillStyle = '#14141B';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/* =========================================================================
   4. AUTOMATIC DF (CS-DF) INTERFEROMETER SIMULATOR
   ========================================================================= */
class AutomaticDFSimulator {
  constructor() {
    this.canvas = document.getElementById('autoDfPolarCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.trueAzimuth = 87;
    this.scenario = 'los'; // 'los', 'multipath', 'low_snr', 'cochannel'
    this.signalLevel = 45; // dBµV/m
    this.dfSquelch = 20; // dBµV/m
    this.isDragging = false;
    this.time = 0;
    
    this.resize();
    this.bindEvents();
    window.addEventListener('resize', () => this.resize());
    if (window.ResizeObserver && this.canvas.parentElement) {
      new ResizeObserver(() => {
        if (this.canvas.offsetParent !== null) {
          this.resize();
          this.render();
        }
      }).observe(this.canvas.parentElement);
    }
    this.startLoop();
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const clientW = parent ? parent.clientWidth : 0;
    const size = Math.min(clientW > 0 ? clientW : 320, 520);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(size * dpr);
    this.canvas.height = Math.round(size * dpr);
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.size = size;
    this.cx = size / 2;
    this.cy = size / 2;
    this.radius = Math.max(55, size * 0.42);
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  bindEvents() {
    // Mouse & Touch Drag on Canvas to reposition TX
    const updateTargetFromEvent = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      
      const angleRad = Math.atan2(my - this.cy, mx - this.cx);
      let angleDeg = (angleRad * 180 / Math.PI) + 90;
      if (angleDeg < 0) angleDeg += 360;
      this.trueAzimuth = Math.round(angleDeg);
      
      const slider = document.getElementById('dfAzimuthSlider');
      const valDisp = document.getElementById('dfSliderAzVal');
      if (slider) slider.value = this.trueAzimuth;
      if (valDisp) valDisp.innerText = `${String(this.trueAzimuth).padStart(3, '0')}°`;
    };

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      updateTargetFromEvent(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) updateTargetFromEvent(e);
    });
    window.addEventListener('mouseup', () => { this.isDragging = false; });

    this.canvas.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      updateTargetFromEvent(e);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (this.isDragging) updateTargetFromEvent(e);
    }, { passive: true });
    window.addEventListener('touchend', () => { this.isDragging = false; });

    // Scenario Preset Buttons
    const scenarioBtns = document.querySelectorAll('.df-scenario-btn');
    scenarioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        scenarioBtns.forEach(b => {
          b.classList.remove('active');
          b.style.border = '1px solid rgba(255,255,255,0.12)';
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
        });
        btn.classList.add('active');
        btn.style.border = '1px solid var(--accent-amber)';
        btn.style.background = 'rgba(250,204,21,0.15)';
        btn.style.color = 'var(--accent-amber)';

        const sc = btn.getAttribute('data-scenario');
        this.setScenario(sc);
      });
    });

    // Azimuth Slider
    const azSlider = document.getElementById('dfAzimuthSlider');
    const azVal = document.getElementById('dfSliderAzVal');
    if (azSlider && azVal) {
      azSlider.addEventListener('input', (e) => {
        this.trueAzimuth = parseInt(e.target.value) || 0;
        azVal.innerText = `${String(this.trueAzimuth).padStart(3, '0')}°`;
      });
    }

    // Squelch Slider
    const sqSlider = document.getElementById('dfSquelchSlider');
    const sqVal = document.getElementById('dfSliderSqVal');
    if (sqSlider && sqVal) {
      sqSlider.addEventListener('input', (e) => {
        this.dfSquelch = parseInt(e.target.value) || 20;
        sqVal.innerText = `${this.dfSquelch} dBµV/m`;
        this.updateSquelchWarning();
      });
    }
  }

  setScenario(sc) {
    this.scenario = sc;
    const modeLabel = document.getElementById('dfModeLabel');
    if (sc === 'los') {
      this.signalLevel = 45;
      if (modeLabel) modeLabel.innerText = 'Line-of-Sight (คลื่นตรง แม่นยำสูง)';
      if (modeLabel) modeLabel.style.color = '#10B981';
    } else if (sc === 'multipath') {
      this.signalLevel = 42;
      if (modeLabel) modeLabel.innerText = 'Multipath (คลื่นสะท้อนตึก)';
      if (modeLabel) modeLabel.style.color = '#F43F5E';
    } else if (sc === 'low_snr') {
      this.signalLevel = 15; // Below squelch (20 dBµV/m)
      if (modeLabel) modeLabel.innerText = 'Low SNR (สัญญาณต่ำกว่า Squelch)';
      if (modeLabel) modeLabel.style.color = '#FACC15';
    } else if (sc === 'cochannel') {
      this.signalLevel = 40;
      if (modeLabel) modeLabel.innerText = 'Co-Channel (สัญญาณชนกัน 2 สถานี)';
      if (modeLabel) modeLabel.style.color = '#A855F7';
    }
    this.updateSquelchWarning();
  }

  updateSquelchWarning() {
    const warn = document.getElementById('dfSquelchWarning');
    if (!warn) return;
    if (this.signalLevel < this.dfSquelch) {
      warn.style.display = 'block';
      warn.innerHTML = `⚠️ <strong>DF SQUELCH CLOSED:</strong> ระดับสัญญาณ (${this.signalLevel} dBµV/m) ต่ำกว่า Squelch Threshold (${this.dfSquelch} dBµV/m) ทำให้เครื่อง PR200 ตัดการประมวลผล (ขึ้น <em>NO BEARING</em> แม้ในหูฟังจะได้ยินเสียงชัดเจน!)`;
    } else {
      warn.style.display = 'none';
    }
  }

  startLoop() {
    const loop = () => {
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        this.time += 0.035;
      }
      if (document.visibilityState === 'visible' && this.canvas && this.canvas.offsetParent !== null) {
        this.render();
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  render() {
    if (!this.canvas) return;
    if (this.canvas.parentElement && this.canvas.parentElement.clientWidth > 0) {
      const targetSize = Math.min(this.canvas.parentElement.clientWidth, 520);
      if (Math.abs(this.size - targetSize) > 8) {
        this.resize();
      }
    }
    const ctx = this.ctx;
    const cx = this.cx;
    const cy = this.cy;
    const r = Math.max(70, this.radius);

    ctx.clearRect(0, 0, this.size, this.size);

    // 1. Dark Compass Radar Base
    ctx.fillStyle = '#08080B';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Range Rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    [0.33, 0.66, 1.0].forEach(ratio => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * ratio, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Degree markings
    ctx.font = '9px JetBrains Mono';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = ((deg - 90) * Math.PI) / 180;
      const x1 = cx + Math.cos(rad) * (r - 7);
      const y1 = cy + Math.sin(rad) * (r - 7);
      const x2 = cx + Math.cos(rad) * r;
      const y2 = cy + Math.sin(rad) * r;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Compass Cardinal Labels
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.fillStyle = '#F8F9FA';
    ctx.fillText('000° N', cx, cy - r + 15);
    ctx.fillText('090° E', cx + r - 24, cy + 4);
    ctx.fillText('180° S', cx, cy + r - 8);
    ctx.fillText('270° W', cx - r + 24, cy + 4);

    // 2. Position of TX Source
    const targetRad = ((this.trueAzimuth - 90) * Math.PI) / 180;
    const targetDist = r * 0.85;
    const txX = cx + Math.cos(targetRad) * targetDist;
    const txY = cy + Math.sin(targetRad) * targetDist;

    // 3. Animated Wavefronts traveling from TX towards Antenna Center
    const waveSpeed = 22;
    const waveCount = 4;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.2;
    for (let w = 0; w < waveCount; w++) {
      const waveRadius = ((this.time * waveSpeed + w * 40) % (targetDist + 30));
      if (waveRadius > 10 && waveRadius < targetDist + 20) {
        ctx.beginPath();
        // Arc centered at TX facing towards array
        ctx.arc(txX, txY, waveRadius, targetRad + Math.PI - 0.7, targetRad + Math.PI + 0.7);
        ctx.stroke();
      }
    }

    // 4. Multipath Scenario Building & Reflection Ray
    const isMultipath = (this.scenario === 'multipath');
    const isCoChannel = (this.scenario === 'cochannel');
    const isSquelchClosed = (this.signalLevel < this.dfSquelch);

    let displayedBearing = this.trueAzimuth;
    let quality = 94;
    let jitter = 0;
    let stabilityText = '✓ Stable (±1°)';
    let stabilityColor = '#10B981';

    if (isMultipath) {
      // Building location at ~215°
      const bldgAngleRad = ((215 - 90) * Math.PI) / 180;
      const bldgX = cx + Math.cos(bldgAngleRad) * (r * 0.65);
      const bldgY = cy + Math.sin(bldgAngleRad) * (r * 0.65);

      // Draw Building Block
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(bldgX - 16, bldgY - 14, 32, 28);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 9px JetBrains Mono';
      ctx.fillStyle = '#F97316';
      ctx.fillText('🏢 ตึกสะท้อน', bldgX, bldgY + 22);

      // Ray 1: TX to Building (Dashed Orange)
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(txX, txY);
      ctx.lineTo(bldgX, bldgY);
      ctx.stroke();

      // Ray 2: Building to Array Center (Dashed Orange)
      ctx.beginPath();
      ctx.moveTo(bldgX, bldgY);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Severe bearing jitter and quality degradation
      jitter = Math.sin(this.time * 4) * 22 + Math.cos(this.time * 9) * 12;
      displayedBearing = (this.trueAzimuth + jitter + 360) % 360;
      quality = Math.max(22, 45 - Math.abs(jitter) * 0.8);
      stabilityText = '⚠️ แกว่งรุนแรง (คลื่นสะท้อน)';
      stabilityColor = '#F43F5E';
    } else if (isCoChannel) {
      // Secondary transmitter at 140°
      const secRad = ((140 - 90) * Math.PI) / 180;
      const secX = cx + Math.cos(secRad) * (r * 0.75);
      const secY = cy + Math.sin(secRad) * (r * 0.75);

      ctx.fillStyle = '#A855F7';
      ctx.beginPath();
      ctx.arc(secX, secY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.fillText('⚠️ TX 2 (140°)', secX, secY - 12);

      jitter = Math.sin(this.time * 5) * 18;
      displayedBearing = (this.trueAzimuth + jitter + 360) % 360;
      quality = 40;
      stabilityText = '⚠️ สับสน (2 คลื่นชนกัน)';
      stabilityColor = '#A855F7';
    } else if (isSquelchClosed) {
      quality = 0;
      stabilityText = '❌ No Bearing (Squelch ปิด)';
      stabilityColor = '#94A3B8';
    } else {
      // Normal Line of Sight
      jitter = Math.sin(this.time * 2) * 0.7;
      displayedBearing = (this.trueAzimuth + jitter + 360) % 360;
      quality = 94;
      stabilityText = '✓ Stable (±1°) แม่นยำ';
      stabilityColor = '#10B981';
    }

    // 5. Draw Target Pin (TX Marker)
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(txX, txY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Crosshair on TX
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(txX - 10, txY);
    ctx.lineTo(txX + 10, txY);
    ctx.moveTo(txX, txY - 10);
    ctx.lineTo(txX, txY + 10);
    ctx.stroke();

    ctx.font = 'bold 10px JetBrains Mono';
    ctx.fillStyle = '#EF4444';
    ctx.fillText(`🎯 TX (${String(this.trueAzimuth).padStart(3, '0')}°)`, txX, txY - 14);

    // 6. Center ADDx07 5-Element Array
    const elemRadius = 18;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.beginPath();
    ctx.arc(cx, cy, elemRadius + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5 Antenna Elements with numbers
    for (let i = 0; i < 5; i++) {
      const eRad = (i * (2 * Math.PI / 5)) - Math.PI / 2;
      const ex = cx + Math.cos(eRad) * elemRadius;
      const ey = cy + Math.sin(eRad) * elemRadius;

      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Number badge
      ctx.font = '8px JetBrains Mono';
      ctx.fillStyle = '#0B0B0E';
      ctx.fillText(`${i + 1}`, ex, ey + 2.5);
    }

    ctx.font = '9px JetBrains Mono';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('ADDx07 5-Elem', cx, cy + elemRadius + 18);

    // 7. Bearing Needle & Uncertainty Wedge (If Squelch Open)
    if (!isSquelchClosed) {
      const safeArcR = Math.max(25, r - 10);
      const bearingRad = ((displayedBearing - 90) * Math.PI) / 180;
      const bx = cx + Math.cos(bearingRad) * safeArcR;
      const by = cy + Math.sin(bearingRad) * safeArcR;

      // Uncertainty Wedge
      const beamSpread = isMultipath ? 0.35 : (isCoChannel ? 0.28 : 0.06);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, safeArcR, bearingRad - beamSpread, bearingRad + beamSpread);
      ctx.closePath();
      ctx.fillStyle = isMultipath ? 'rgba(244, 63, 94, 0.25)' : 'rgba(250, 204, 21, 0.25)';
      ctx.fill();

      // Sharp Needle Line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = isMultipath ? '#F43F5E' : '#FACC15';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Tip Dot
      ctx.fillStyle = isMultipath ? '#F43F5E' : '#FACC15';
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Squelch Closed: Show Blinking NO BEARING
      const isBlink = Math.floor(this.time * 3) % 2 === 0;
      if (isBlink) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.85)';
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(cx - 75, cy - 20, 150, 40);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('⚠️ NO BEARING', cx, cy - 2);
        ctx.font = '9px JetBrains Mono';
        ctx.fillText('SQUELCH CLOSED', cx, cy + 12);
      }
    }

    // 8. On-Canvas Legend Pill Box (Top-left)
    ctx.fillStyle = 'rgba(11, 11, 14, 0.8)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(10, 10, 165, 54, 6);
    } else {
      ctx.rect(10, 10, 165, 54);
    }
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '9.5px JetBrains Mono';
    ctx.fillStyle = '#FECDD3';
    ctx.fillText('🔴 TX = แหล่งคลื่นเป้าหมาย', 16, 26);
    ctx.fillStyle = '#FEF08A';
    ctx.fillText('🟡 เข็ม = ทิศทาง AoA ที่คำนวณ', 16, 41);
    ctx.fillStyle = '#BAE6FD';
    ctx.fillText('🔵 จุดกลาง = เสา 5 ต้น ADDx07', 16, 55);

    // 9. Update UI DOM stats
    const domAz = document.getElementById('autoDfAzimuthVal');
    const domQual = document.getElementById('autoDfQualityVal');
    const domStab = document.getElementById('autoDfStabilityVal');
    const qBar = document.getElementById('dfQualityBar');
    const qText = document.getElementById('dfQualityLevelText');

    if (domAz) domAz.innerText = isSquelchClosed ? '---.-°' : `${displayedBearing.toFixed(1).padStart(5, '0')}°`;
    if (domQual) domQual.innerText = `${Math.round(quality)}%`;
    if (domStab) {
      domStab.innerText = stabilityText;
      domStab.style.color = stabilityColor;
    }

    if (qBar) {
      qBar.style.width = `${quality}%`;
      if (quality > 80) qBar.style.backgroundColor = '#10B981';
      else if (quality > 50) qBar.style.backgroundColor = '#FACC15';
      else qBar.style.backgroundColor = '#F43F5E';
    }

    if (qText) {
      if (isSquelchClosed) {
        qText.innerText = 'สัญญาณต่ำกว่า Squelch (No Bearing)';
        qText.style.color = '#94A3B8';
      } else if (quality > 80) {
        qText.innerText = 'คุณภาพสูง (>80% มั่นใจได้)';
        qText.style.color = '#10B981';
      } else if (quality > 50) {
        qText.innerText = 'ปานกลาง (ระวังคลื่นสะท้อน)';
        qText.style.color = '#FACC15';
      } else {
        qText.innerText = 'ต่ำมาก (<50% สัญญาณสะท้อน ไม่ควรใช้)';
        qText.style.color = '#F43F5E';
      }
    }
  }
}

/* =========================================================================
   5. TRIANGULATION INTERACTIVE MAP CANVAS
   ========================================================================= */
class TriangulationMapSimulator {
  constructor() {
    this.canvas = document.getElementById('triangulationCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.multipathOutlier = false;
    this.resize();
    this.bindEvents();
    window.addEventListener('resize', () => {
      this.resize();
      this.render();
    });
    if (window.ResizeObserver && this.canvas.parentElement) {
      new ResizeObserver(() => {
        if (this.canvas.offsetParent !== null) {
          this.resize();
          this.render();
        }
      }).observe(this.canvas.parentElement);
    }
    this.render();
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const w = parent && parent.clientWidth > 0 ? parent.clientWidth : 600;
    const h = 240;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.w = w;
    this.h = h;
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  bindEvents() {
    const btnToggleOutlier = document.getElementById('btnToggleOutlier');
    if (btnToggleOutlier) {
      btnToggleOutlier.addEventListener('click', () => {
        this.multipathOutlier = !this.multipathOutlier;
        btnToggleOutlier.classList.toggle('active', this.multipathOutlier);
        btnToggleOutlier.innerText = this.multipathOutlier ? '⚠️ Point B: โดนเงาสะท้อน (230° Outlier)' : '✓ Point B: Line of sight ปกติ (210°)';
        this.render();
      });
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;

    ctx.fillStyle = '#08080B';
    ctx.fillRect(0, 0, w, h);

    // Target Source X coordinate
    const tx = w * 0.52;
    const ty = h * 0.48;

    // Station coordinates
    const stA = { x: w * 0.22, y: h * 0.25, name: 'Point A (100°)' };
    const stB = { x: w * 0.78, y: h * 0.28, name: 'Point B' };
    const stC = { x: w * 0.50, y: h * 0.82, name: 'Point C (20°)' };

    // Draw Bearing Rays
    ctx.lineWidth = 1.8;

    // Ray A -> Target
    ctx.beginPath();
    ctx.moveTo(stA.x, stA.y);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
    ctx.stroke();

    // Ray C -> Target
    ctx.beginPath();
    ctx.moveTo(stC.x, stC.y);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
    ctx.stroke();

    // Ray B -> Target OR Outlier
    ctx.beginPath();
    ctx.moveTo(stB.x, stB.y);
    if (this.multipathOutlier) {
      // Points away towards bottom right
      ctx.lineTo(w * 0.88, h * 0.85);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
    } else {
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
    }
    ctx.stroke();

    // Intersection Target X
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(tx, ty, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.fillStyle = '#10B981';
    ctx.fillText('TARGET X (Source)', tx + 12, ty + 4);

    // Stations
    [stA, stB, stC].forEach((st) => {
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(st.x, st.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '11px JetBrains Mono';
      ctx.fillStyle = '#F8F9FA';
      ctx.fillText(st.name, st.x - 30, st.y - 10);
    });
  }
}


/* =========================================================================
   GATED SPECTRUM SIMULATOR (CHAPTER 3)
   ========================================================================= */
class GatedSpectrumSimulator {
  constructor(canvasId = 'canvasGatedSpectrum') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.gatedEnabled = false;
    this.gateDelay = 400; // us
    this.gateLength = 50; // us
    this.animTime = 0;

    this.initControls();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const clientW = parent ? parent.clientWidth : 0;
    this.canvas.width = clientW > 0 ? clientW : 640;
    this.canvas.height = 240;
  }

  initControls() {
    const btnToggle = document.getElementById('btnToggleGated');
    const delaySlider = document.getElementById('gateDelaySlider');
    const lengthSlider = document.getElementById('gateLengthSlider');
    const delayVal = document.getElementById('gateDelayVal');
    const lengthVal = document.getElementById('gateLengthVal');
    const stateText = document.getElementById('gatedStateText');

    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        this.gatedEnabled = !this.gatedEnabled;
        btnToggle.textContent = this.gatedEnabled ? 'ปิดระบบ Gated Spectrum' : 'เปิดระบบ Gated Spectrum';
        btnToggle.className = this.gatedEnabled ? 'btn-secondary' : 'btn-primary';
        if (stateText) {
          stateText.textContent = this.gatedEnabled ? 'GATED: ACTIVE' : 'GATED: OFF';
          stateText.style.color = this.gatedEnabled ? '#10B981' : '#F43F5E';
        }
      });
    }

    if (delaySlider) {
      delaySlider.addEventListener('input', (e) => {
        this.gateDelay = parseInt(e.target.value, 10);
        if (delayVal) delayVal.textContent = `${this.gateDelay} µs`;
      });
    }

    if (lengthSlider) {
      lengthSlider.addEventListener('input', (e) => {
        this.gateLength = parseInt(e.target.value, 10);
        if (lengthVal) lengthVal.textContent = `${this.gateLength} µs`;
      });
    }
  }

  animate() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      this.animTime += 0.05;
    }
    if (document.visibilityState === 'visible' && this.canvas && this.canvas.offsetParent !== null) {
      this.render();
    }
    requestAnimationFrame(this.animate);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (!ctx || w === 0 || h === 0) return;

    ctx.fillStyle = '#0B0B0E';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 30; y < h; y += 35) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }
    for (let x = 40; x < w - 20; x += (w - 60) / 10) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, h - 25);
      ctx.stroke();
    }

    // Two Halves: Left half is Time Domain TDD Slot (0 - 1000 us), Right half is Resulting Spectrum
    const splitX = Math.floor(w * 0.48);

    // Divider
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
    ctx.beginPath();
    ctx.moveTo(splitX, 15);
    ctx.lineTo(splitX, h - 20);
    ctx.stroke();

    // --- LEFT PANEL: TIME DOMAIN (TDD FRAME 1000 µs) ---
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('1. TDD FRAME TIMING (0–1000 µs)', 45, 22);

    const tStartX = 45;
    const tEndX = splitX - 15;
    const tW = tEndX - tStartX;
    const tBaseY = h - 45;

    // Slot 1: Downlink (0 to 400 us)
    const dlW = tW * 0.40;
    ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
    ctx.fillRect(tStartX, 35, dlW, tBaseY - 35);
    ctx.fillStyle = '#F43F5E';
    ctx.fillText('DL (Station)', tStartX + 10, 50);

    // Slot 2: Guard Period (400 to 450 us)
    const gpX = tStartX + dlW;
    const gpW = tW * 0.05;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(gpX, 35, gpW, tBaseY - 35);
    ctx.fillStyle = '#10B981';
    ctx.fillText('GP', gpX + 2, 50);

    // Slot 3: Uplink (450 to 1000 us)
    const ulX = gpX + gpW;
    const ulW = tEndX - ulX;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fillRect(ulX, 35, ulW, tBaseY - 35);
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('UL (Mobile UE)', ulX + 15, 50);

    // Draw RF Power envelope in Time Domain
    ctx.beginPath();
    ctx.strokeStyle = '#F8F9FA';
    ctx.lineWidth = 1.5;
    for (let px = tStartX; px <= tEndX; px++) {
      const frac = (px - tStartX) / tW;
      const tUs = frac * 1000;
      let pDbm = -95;
      if (tUs < 400) {
        pDbm = 20 + Math.sin(this.animTime * 10 + tUs * 0.1) * 3;
      } else if (tUs >= 400 && tUs <= 450) {
        pDbm = -85 + Math.random() * 2;
      } else {
        pDbm = -20 + Math.sin(this.animTime * 5 + tUs * 0.08) * 6;
      }
      const y = tBaseY - ((pDbm - (-100)) / 130) * (tBaseY - 40);
      if (px === tStartX) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();

    // Gate Window Overlay (if enabled)
    const gateStartFrac = this.gateDelay / 1000;
    const gateLenFrac = this.gateLength / 1000;
    const gateX = tStartX + gateStartFrac * tW;
    const gateWPix = gateLenFrac * tW;

    if (this.gatedEnabled) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2;
      ctx.fillRect(gateX, 30, gateWPix, tBaseY - 30);
      ctx.strokeRect(gateX, 30, gateWPix, tBaseY - 30);
      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText('GATE', gateX + 2, tBaseY - 10);
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('0 µs', tStartX, h - 8);
    ctx.fillText('400', gpX - 8, h - 8);
    ctx.fillText('1000 µs', tEndX - 35, h - 8);

    // --- RIGHT PANEL: SPECTRUM SNAPSHOT ---
    const sStartX = splitX + 20;
    const sEndX = w - 20;
    const sW = sEndX - sStartX;
    const sBaseY = h - 45;

    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('2. PR200 SPECTRUM RESULT', sStartX, 22);

    const isGateInsideGuard = this.gatedEnabled && (this.gateDelay >= 380 && (this.gateDelay + this.gateLength) <= 460);
    const isGateInDownlink = this.gatedEnabled && (this.gateDelay < 400 && !isGateInsideGuard);

    ctx.beginPath();
    ctx.lineWidth = 2;

    if (!this.gatedEnabled || isGateInDownlink) {
      ctx.strokeStyle = '#F43F5E';
      for (let px = sStartX; px <= sEndX; px++) {
        const frac = (px - sStartX) / sW;
        const distFromCenter = Math.abs(frac - 0.5);
        let pDbm = -95 + Math.random() * 4;
        if (distFromCenter < 0.35) {
          pDbm = 15 - distFromCenter * 40 + Math.random() * 5;
        }
        const y = sBaseY - ((pDbm - (-100)) / 130) * (sBaseY - 40);
        if (px === sStartX) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#F43F5E';
      ctx.font = 'bold 11px Sukhumvit Set, sans-serif';
      ctx.fillText('❌ ไม่เปิด Gated หรือ Gate ทับ Downlink: คลื่นสถานีฐานกลบมิด!', sStartX + 10, 55);
    } else if (isGateInsideGuard) {
      ctx.strokeStyle = '#10B981';
      for (let px = sStartX; px <= sEndX; px++) {
        const frac = (px - sStartX) / sW;
        let pDbm = -98 + Math.random() * 3;
        const distFromPeak = Math.abs(frac - 0.5);
        if (distFromPeak < 0.03) {
          pDbm = -65 + Math.random() * 2;
        }
        const y = sBaseY - ((pDbm - (-100)) / 130) * (sBaseY - 40);
        if (px === sStartX) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();

      const peakX = sStartX + sW * 0.5;
      const peakY = sBaseY - ((-65 - (-100)) / 130) * (sBaseY - 40);

      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(peakX, peakY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(peakX, peakY - 15);
      ctx.lineTo(peakX, peakY - 5);
      ctx.stroke();

      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText('Peak -65 dBm', peakX + 8, peakY - 10);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 11px Sukhumvit Set, sans-serif';
      ctx.fillText('✅ GATED สำเร็จ: ปรากฏยอดคลื่นรบกวนในช่อง Guard ชัดเจน!', sStartX + 10, 55);
    } else {
      ctx.strokeStyle = '#38BDF8';
      for (let px = sStartX; px <= sEndX; px++) {
        const frac = (px - sStartX) / sW;
        let pDbm = -90 + Math.random() * 4;
        if (Math.abs(frac - 0.5) < 0.03) pDbm = -65;
        const y = sBaseY - ((pDbm - (-100)) / 130) * (sBaseY - 40);
        if (px === sStartX) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 11px Sukhumvit Set, sans-serif';
      ctx.fillText('⚠️ Gate อยู่ใน Uplink: มีทราฟฟิกมือถือปะปน', sStartX + 10, 55);
    }

    ctx.font = '9px JetBrains Mono';
    ctx.fillStyle = '#64748B';
    [-80, -60, -40, -20, 0, 20].forEach(db => {
      const y = sBaseY - ((db - (-100)) / 130) * (sBaseY - 40);
      ctx.fillText(`${db} dBm`, sStartX + 5, y - 2);
    });
  }
}

/* =========================================================================
   RBW CALCULATOR (CHAPTER 2)
   ========================================================================= */
function initRBWCalculator() {
  const sel = document.getElementById('rbwCalcSelect');
  const noiseVal = document.getElementById('rbwCalcNoiseVal');
  const snrVal = document.getElementById('rbwCalcSnrVal');
  const alertBox = document.getElementById('rbwCalcAlertBox');

  if (!sel) return;

  function update() {
    const rbw = parseFloat(sel.value);
    const deltaNf = 10 * Math.log10(rbw / 100000);
    const noiseFloor = -105.0 + deltaNf;
    const signalLevel = -115.0;
    const snr = signalLevel - noiseFloor;

    if (noiseVal) noiseVal.textContent = `${noiseFloor.toFixed(1)} dBm`;
    if (snrVal) {
      snrVal.textContent = `${snr >= 0 ? '+' : ''}${snr.toFixed(1)} dB`;
      snrVal.style.color = snr >= 10 ? '#10B981' : (snr >= 0 ? '#FACC15' : '#F43F5E');
    }

    if (alertBox) {
      if (snr < -5) {
        alertBox.className = 'quiz-feedback-box show error';
        alertBox.innerHTML = `❌ <strong>สัญญาณจมอยู่ใต้ Noise Floor ลึกมาก:</strong> สัญญาณ -115 dBm ถูกกลบมิดด้วย Noise floor (${noiseFloor.toFixed(1)} dBm) ตัวเครื่องมองไม่เห็นยอดสเปกตรัม ต้องลด RBW ลงต่ำกว่า 10 kHz ทันที`;
      } else if (snr >= -5 && snr < 3) {
        alertBox.className = 'quiz-feedback-box show error';
        alertBox.innerHTML = `⚠️ <strong>ปริ่มระดับ Noise Floor (Borderline Detection):</strong> SNR อยู่ที่ ${snr.toFixed(1)} dB ยอดสัญญาณจะเต้นกระเพื่อมปะปนกับ Noise peaks เสี่ยงต่อการตรวจจับผิดพลาด`;
      } else if (snr >= 3 && snr < 12) {
        alertBox.className = 'quiz-feedback-box show success';
        alertBox.innerHTML = `✅ <strong>ตรวจจับสัญญาณสำเร็จ (Clear Signal):</strong> เมื่อปรับ RBW แคบลง Noise Floor ดิ่งลงเหลือ ${noiseFloor.toFixed(1)} dBm ทำให้สัญญาณอ่อน -115 dBm โผล่พ้น Noise ด้วย SNR ${snr.toFixed(1)} dB อย่างชัดเจน`;
      } else {
        alertBox.className = 'quiz-feedback-box show success';
        alertBox.innerHTML = `🌟 <strong>ไดนามิกเรนจ์ยอดเยี่ยม (High Dynamic Range):</strong> SNR สูงถึง ${snr.toFixed(1)} dB สัญญาณโดดเด่นสมบูรณ์แบบ เหมาะอย่างยิ่งสำหรับการวัดแบนด์วิดท์ OBW และการทำ Direction Finding แต่ Sweep time จะช้าลง`;
      }
    }
  }

  sel.addEventListener('change', update);
  update();
}

/* =========================================================================
   SCAN RESOLUTION CALCULATOR (CHAPTER 3)
   ========================================================================= */
function initScanResolutionCalculator() {
  const targetSel = document.getElementById('targetSignalSelect');
  const resSel = document.getElementById('scanResSelect');
  const poiDisplay = document.getElementById('calcPoiDisplay');
  const scallopDisplay = document.getElementById('calcScallopDisplay');
  const verdictAlert = document.getElementById('calcVerdictAlert');

  if (!targetSel || !resSel) return;

  function calculate() {
    const targetBw = parseFloat(targetSel.value);
    const scanRes = parseFloat(resSel.value);
    const ratio = scanRes / targetBw;

    let confidence = '';
    let lossTrend = '';
    let alertClass = '';
    let alertMsg = '';

    if (ratio <= 0.5) {
      confidence = 'ละเอียดกว่าเป้าหมาย (Fine Resolution)';
      lossTrend = 'ต่ำมาก (Minimal Dipping Risk)';
      alertClass = 'quiz-feedback-box show success';
      alertMsg = `✅ <strong>ความละเอียดสูงกว่าขนาดสัญญาณ:</strong> Scan Resolution (${(scanRes/1000).toFixed(1)} kHz) ละเอียดกว่ากึ่งหนึ่งของขนาดสัญญาณเป้าหมาย (${(targetBw/1000).toFixed(1)} kHz) ช่วยลดความเสี่ยงจากการข้ามยอดคลื่น แต่รอบการกวาด (Sweep Time) จะใช้เวลานานขึ้น`;
    } else if (ratio <= 1.0) {
      confidence = 'ใกล้เคียงเป้าหมาย (Moderate / Compromise)';
      lossTrend = 'ปานกลาง (Moderate Dipping Risk)';
      alertClass = 'quiz-feedback-box show success';
      alertMsg = `⚠️ <strong>การตั้งค่าแบบประนีประนอม:</strong> Scan Resolution ใกล้เคียงกับขนาดสัญญาณ ช่วยให้กวาดสเปกตรัมได้เร็วกว่า แต่อาจมีระดับสัญญาณตกหล่นบ้างหากยอดคลื่นไม่ตรงกับจุดวัดพอดี`;
    } else if (ratio <= 2.0) {
      confidence = 'หยาบกว่าเป้าหมาย (Coarse Resolution)';
      lossTrend = 'สูง (Significant Dipping Risk)';
      alertClass = 'quiz-feedback-box show error';
      alertMsg = `⚠️ <strong>ความละเอียดหยาบกว่าขนาดสัญญาณ:</strong> Scan Resolution (${(scanRes/1000).toFixed(1)} kHz) หยาบกว่าแบนด์วิดท์ของสัญญาณ (${(targetBw/1000).toFixed(1)} kHz) มีความเสี่ยงสูงที่ระดับสัญญาณที่วัดได้จะต่ำกว่าความเป็นจริงอย่างมีนัยสำคัญ`;
    } else {
      confidence = 'ไม่เหมาะสม (Inadequate)';
      lossTrend = 'สูงมาก (Severe Risk / ข้ามยอดคลื่น)';
      alertClass = 'quiz-feedback-box show error';
      alertMsg = `❌ <strong>ความละเอียดหยาบเกินไปอย่างมาก:</strong> Scan Resolution กว้างกว่าขนาดสัญญาณมากเกินไป เสี่ยงต่อการกวาดข้ามสัญญาณพัลส์สั้นหรือ Narrowband Carrier ไปโดยไม่สามารถตรวจจับได้ แนะนำให้ปรับลด Scan Resolution ลงมา`;
    }

    if (poiDisplay) {
      poiDisplay.textContent = confidence;
      poiDisplay.style.color = ratio <= 1.0 ? '#10B981' : '#F43F5E';
    }
    if (scallopDisplay) {
      scallopDisplay.textContent = lossTrend;
      scallopDisplay.style.color = ratio <= 1.0 ? '#10B981' : '#F43F5E';
    }
    if (verdictAlert) {
      verdictAlert.className = alertClass;
      verdictAlert.innerHTML = alertMsg + `<br><small style="color: var(--text-muted); font-size: 11px; margin-top: 6px; display: block;">ℹ️ หมายเหตุ: การคำนวณนี้เป็นการสาธิตแนวโน้มเชิงคุณภาพ (Qualitative Demonstration) ตามสัดส่วน Sampling Step ต่อ Bandwidth ไม่ใช่แบบจำลองเวลาสถิติ (POI จริงขึ้นกับ Signal Duration, Sweep Cycle Time และ Window Function)</small>`;
    }
  }

  targetSel.addEventListener('change', calculate);
  resSel.addEventListener('change', calculate);
  calculate();
}

/* =========================================================================
   7. DEDICATED SCAN MODES SIMULATOR (PScan vs FScan vs MScan)
   ========================================================================= */
class ScanModesSimulator {
  constructor(canvasId = 'scanModesCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.height = 230;
    this.mode = 'pscan'; // 'pscan' | 'fscan' | 'mscan'
    this.animTime = 0;
    this.sweepX = 0;

    // FScan state
    this.fscanChannels = 10;
    this.fscanCurrentCh = 0;
    this.fscanDwellTimer = 0;
    this.fscanActiveCh = 3; // 150.075 MHz (CH4, index 3) is active!

    // MScan state
    this.mscanCurrentIndex = 0;
    this.mscanTimer = 0;
    this.mscanList = [
      { ch: 1, freq: '118.100 MHz', name: 'Airband Tower', band: 'VHF Air', level: -62, active: true },
      { ch: 2, freq: '138.000 MHz', name: 'Gov Tactical', band: 'VHF High', level: -92, active: false },
      { ch: 3, freq: '151.250 MHz', name: 'Railway Dispatch', band: 'VHF Band', level: -55, active: true },
      { ch: 4, freq: '433.920 MHz', name: 'ISM Telemetry', band: 'UHF ISM', level: -70, active: true },
      { ch: 5, freq: '450.125 MHz', name: 'Digital Trunking', band: 'UHF Trunk', level: -88, active: false }
    ];

    this.initControls();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const clientW = parent ? parent.clientWidth : 0;
    this.canvas.width = clientW > 0 ? clientW : 640;
    this.canvas.height = this.height;
  }

  initControls() {
    const btns = document.querySelectorAll('.scan-mode-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => {
          b.classList.remove('active');
          b.style.border = '1px solid rgba(255,255,255,0.15)';
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
        });
        btn.classList.add('active');
        btn.style.border = '1px solid var(--accent-amber)';
        btn.style.background = 'rgba(250,204,21,0.15)';
        btn.style.color = 'var(--accent-amber)';

        const mode = btn.getAttribute('data-mode');
        this.setMode(mode);
      });
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.sweepX = 0;
    this.fscanCurrentCh = 0;
    this.fscanDwellTimer = 0;
    this.mscanCurrentIndex = 0;
    this.mscanTimer = 0;

    const modeDisplay = document.getElementById('scanActiveModeDisplay');
    const speedDisplay = document.getElementById('scanSpeedDisplay');
    const statusDisplay = document.getElementById('scanStatusDisplay');
    const expContent = document.getElementById('scanModeExplanationContent');

    if (mode === 'pscan') {
      if (modeDisplay) modeDisplay.textContent = 'Mode: PScan (Continuous Band Search)';
      if (speedDisplay) speedDisplay.textContent = 'Speed: สูงสุด 60 GHz/s @ 1 MHz resolution';
      if (statusDisplay) {
        statusDisplay.textContent = 'Scanning 100–500 MHz...';
        statusDisplay.style.color = '#10B981';
      }
      if (expContent) {
        expContent.innerHTML = '<strong>PScan (Panorama Scan):</strong> ใช้เมื่อ <em>"ยังไม่รู้ว่าความถี่สัญญาณอยู่ที่ไหน"</em> ต้องการกวาดสำรวจสเปกตรัมช่วงกว้างต่อเนื่อง (Search a BAND) เช่น 100–500 MHz กว้างกว่า Real-time Bandwidth (40 MHz) ด้วยความเร็วสูงสุด 60 GHz/s (@ 1 MHz resolution ตามตารางสเปกผู้ผลิต) เพื่อค้นหายอดคลื่นผิดปกติ (Unknown Interference)';
      }
    } else if (mode === 'fscan') {
      if (modeDisplay) modeDisplay.textContent = 'Mode: FScan (Equidistant Frequency Grid)';
      if (speedDisplay) speedDisplay.textContent = 'Speed: ~2,000 channels/s';
      if (statusDisplay) {
        statusDisplay.textContent = 'Stepping 25 kHz Grid (Squelch/Dwell Active)';
        statusDisplay.style.color = '#38BDF8';
      }
      if (expContent) {
        expContent.innerHTML = '<strong>FScan (Frequency Scan):</strong> เหมาะสำหรับกรณีที่ <em>"เรารู้ว่าช่องสัญญาณเรียงเป็นระยะห่างเท่าๆ กัน"</em> (Scan a GRID) เช่น Land Mobile Radio 150–160 MHz ก้าวละ 25 kHz เครื่อง PR200 จะ Tune ตรวจวัดทีละ Center Frequency ด้วยความเร็วสูงถึง 2,000 ch/s พร้อมตั้ง Squelch หยุดฟัง (Dwell) ช่องที่มีการใช้งาน';
      }
    } else if (mode === 'mscan') {
      if (modeDisplay) modeDisplay.textContent = 'Mode: MScan (Distinct Memory List)';
      if (speedDisplay) speedDisplay.textContent = 'Scan Rate: Fast List Hop';
      if (statusDisplay) {
        statusDisplay.textContent = 'Monitoring 5 Discrete Channels';
        statusDisplay.style.color = '#F59E0B';
      }
      if (expContent) {
        expContent.innerHTML = '<strong>MScan (Memory Scan):</strong> ใช้กับ <em>"รายการความถี่ที่กำหนดไว้ล่วงหน้า"</em> (Scan a LIST) เช่น รายชื่อสถานีที่ได้รับใบอนุญาต ความถี่กระจายข้ามแบนด์และระยะห่างไม่เท่ากัน เครื่องจะวนสแกนเฉพาะช่องใน Memory List อย่างรวดเร็ว เหมาะสำหรับงาน PM/MA สถานีส่งและเฝ้าระวังช่องสำคัญ';
      }
    }
  }

  animate() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      this.animTime += 0.02;
    }
    if (document.visibilityState === 'visible' && this.canvas && this.canvas.offsetParent !== null) {
      this.render();
    }
    requestAnimationFrame(this.animate);
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Dark grid background
    ctx.fillStyle = '#08080C';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, h - 30);
      ctx.stroke();
    }
    for (let y = 30; y < h - 30; y += 35) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 15, y);
      ctx.stroke();
    }

    if (this.mode === 'pscan') {
      this.renderPScan(w, h, ctx);
    } else if (this.mode === 'fscan') {
      this.renderFScan(w, h, ctx);
    } else if (this.mode === 'mscan') {
      this.renderMScan(w, h, ctx);
    }
  }

  renderPScan(w, h, ctx) {
    const marginL = 45;
    const marginR = 20;
    const marginT = 25;
    const marginB = 32;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    // Y Axis labels (dBm)
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'right';
    ctx.fillText('-40', marginL - 6, marginT + 10);
    ctx.fillText('-70', marginL - 6, marginT + plotH * 0.5);
    ctx.fillText('-100', marginL - 6, marginT + plotH - 5);

    // X Axis labels (Frequency: 100 to 500 MHz)
    ctx.textAlign = 'center';
    const freqs = ['100 MHz', '200 MHz', '300 MHz', '400 MHz', '500 MHz'];
    freqs.forEach((f, idx) => {
      const fx = marginL + (idx / 4) * plotW;
      ctx.fillText(f, fx, h - 14);
    });

    // Advance sweep line
    this.sweepX += plotW * 0.015;
    if (this.sweepX > plotW) this.sweepX = 0;

    // Draw Spectrum Trace
    ctx.beginPath();
    const noiseBaseY = marginT + plotH * 0.85;
    for (let x = 0; x <= plotW; x += 3) {
      const frac = x / plotW;
      const freq = 100 + frac * 400; // 100 to 500 MHz
      
      let level = noiseBaseY + Math.sin(x * 0.3 + this.animTime * 3) * 4 + (Math.random() - 0.5) * 6;

      // Peak 1: 138.125 MHz (frac = (138.125 - 100) / 400 = 0.0953) -> Candidate
      const p1Dist = Math.abs(freq - 138.125);
      if (p1Dist < 6) {
        level -= Math.max(0, (1 - p1Dist / 6)) * (plotH * 0.72);
      }

      // Peak 2: 245.500 MHz (frac = (245.5 - 100) / 400 = 0.363) -> Spur
      const p2Dist = Math.abs(freq - 245.5);
      if (p2Dist < 5) {
        level -= Math.max(0, (1 - p2Dist / 5)) * (plotH * 0.42);
      }

      // Peak 3: 433.920 MHz (frac = (433.92 - 100) / 400 = 0.834) -> ISM Telemetry
      const p3Dist = Math.abs(freq - 433.92);
      if (p3Dist < 6) {
        level -= Math.max(0, (1 - p3Dist / 6)) * (plotH * 0.48);
      }

      const canvasX = marginL + x;
      if (x === 0) ctx.moveTo(canvasX, level);
      else ctx.lineTo(canvasX, level);
    }
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Fast Sweep Bar (60 GHz/s indicator)
    const sweepCanvasX = marginL + this.sweepX;
    const sweepGrad = ctx.createLinearGradient(sweepCanvasX - 35, 0, sweepCanvasX, 0);
    sweepGrad.addColorStop(0, 'rgba(250, 204, 21, 0)');
    sweepGrad.addColorStop(1, 'rgba(250, 204, 21, 0.4)');
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(sweepCanvasX - 35, marginT, 35, plotH);

    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sweepCanvasX, marginT);
    ctx.lineTo(sweepCanvasX, marginT + plotH);
    ctx.stroke();

    // Peak 1 Highlight (138.125 MHz Unknown Peak)
    const p1X = marginL + ((138.125 - 100) / 400) * plotW;
    const p1Y = marginT + plotH * 0.18;

    // Pulsing crosshair
    const pulse = 4 + Math.sin(this.animTime * 6) * 2;
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p1X, p1Y, pulse + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(p1X, p1Y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Callout badge
    ctx.fillStyle = 'rgba(20, 20, 27, 0.88)';
    ctx.strokeStyle = 'var(--accent-amber)';
    ctx.lineWidth = 1;
    ctx.fillRect(p1X + 8, p1Y - 14, 195, 26);
    ctx.strokeRect(p1X + 8, p1Y - 14, 195, 26);

    ctx.fillStyle = '#FACC15';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('★ พบ Unknown Peak: 138.125 MHz', p1X + 14, p1Y + 3);

    // Subtitle annotation
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('PScan = Search a BAND (>40 MHz) ➔ ส่งความถี่เข้า Receiver ต่อไป', w - marginR, marginT + 12);
  }

  renderFScan(w, h, ctx) {
    const marginL = 45;
    const marginR = 20;
    const marginT = 30;
    const marginB = 40;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    // Step channels logic
    this.fscanDwellTimer++;
    const isAtActive = this.fscanCurrentCh === this.fscanActiveCh;
    const maxTimer = isAtActive ? 65 : 4; // Dwell on active channel for voice listen

    if (this.fscanDwellTimer > maxTimer) {
      this.fscanDwellTimer = 0;
      this.fscanCurrentCh = (this.fscanCurrentCh + 1) % this.fscanChannels;
    }

    const chSpacing = plotW / this.fscanChannels;

    // Y Axis
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'right';
    ctx.fillText('-40', marginL - 6, marginT + 10);
    ctx.fillText('-85 (SQ)', marginL - 6, marginT + plotH * 0.7);
    ctx.fillText('-100', marginL - 6, marginT + plotH - 5);

    // Squelch Line
    const sqY = marginT + plotH * 0.7;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(marginL, sqY);
    ctx.lineTo(marginL + plotW, sqY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.font = '9.5px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SQUELCH THRESHOLD (-85 dBm)', marginL + 6, sqY - 4);

    // Spacing bracket label: Δf = 25 kHz
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    const brX1 = marginL + chSpacing * 0.5;
    const brX2 = brX1 + chSpacing;
    ctx.beginPath();
    ctx.moveTo(brX1, marginT - 10);
    ctx.lineTo(brX2, marginT - 10);
    ctx.stroke();
    ctx.fillStyle = '#38BDF8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('◀ 25 kHz Step ▶', (brX1 + brX2) / 2, marginT - 14);

    // Draw Channel Slots
    for (let i = 0; i < this.fscanChannels; i++) {
      const cx = marginL + i * chSpacing + chSpacing / 2;
      const freq = (150.000 + i * 0.025).toFixed(3);
      const isActive = i === this.fscanActiveCh;
      const isCurrent = i === this.fscanCurrentCh;

      // Channel bar
      const barH = isActive ? plotH * 0.75 : plotH * 0.15 + (Math.random() * 5);
      const barY = marginT + plotH - barH;

      ctx.fillStyle = isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.06)';
      if (isActive && isCurrent) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
      }
      ctx.fillRect(cx - 12, barY, 24, barH);
      ctx.strokeStyle = isActive ? '#10B981' : 'rgba(255, 255, 255, 0.15)';
      ctx.strokeRect(cx - 12, barY, 24, barH);

      // Channel number & freq label
      ctx.font = '9px monospace';
      ctx.fillStyle = isCurrent ? '#FACC15' : '#94A3B8';
      ctx.textAlign = 'center';
      ctx.fillText(`CH${i+1}`, cx, h - 22);
      ctx.fillText(freq, cx, h - 10);

      // Current scanner cursor box
      if (isCurrent) {
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 15, marginT - 4, 30, plotH + 8);

        if (isActive) {
          // Voice burst active!
          ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
          ctx.fillRect(cx - 48, marginT + 10, 96, 22);
          ctx.fillStyle = '#0B0B0E';
          ctx.font = 'bold 9.5px sans-serif';
          ctx.fillText('🔊 SQUELCH OPEN', cx, marginT + 25);
        }
      }
    }

    // Header info
    ctx.fillStyle = '#38BDF8';
    ctx.font = '10.5px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('FScan = Equidistant Grid (25 kHz) | Scanning 2,000 ch/s', w - marginR, marginT - 10);
  }

  renderMScan(w, h, ctx) {
    const marginL = 25;
    const marginR = 25;
    const marginT = 25;
    const marginB = 30;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    this.mscanTimer++;
    if (this.mscanTimer > 35) {
      this.mscanTimer = 0;
      this.mscanCurrentIndex = (this.mscanCurrentIndex + 1) % this.mscanList.length;
    }

    const cardW = (plotW - 40) / 5;

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MScan = Scan a Memory LIST (Distinct licensed frequencies across bands)', marginL, marginT - 6);

    this.mscanList.forEach((item, idx) => {
      const cx = marginL + idx * (cardW + 10);
      const isCur = idx === this.mscanCurrentIndex;

      // Card Background
      ctx.fillStyle = isCur ? 'rgba(250, 204, 21, 0.12)' : 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = isCur ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = isCur ? 1.8 : 1;
      ctx.fillRect(cx, marginT + 12, cardW, plotH - 5);
      ctx.strokeRect(cx, marginT + 12, cardW, plotH - 5);

      // Channel tag
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = isCur ? '#FACC15' : '#E2E8F0';
      ctx.textAlign = 'left';
      ctx.fillText(`CH 0${item.ch}`, cx + 8, marginT + 30);

      // Band tag
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(item.band, cx + 8, marginT + 44);

      // Frequency
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#38BDF8';
      ctx.fillText(item.freq, cx + 8, marginT + 64);

      // Service name
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(item.name, cx + 8, marginT + 80);

      // Level meter bar
      const meterW = cardW - 16;
      const meterH = 10;
      const meterX = cx + 8;
      const meterY = marginT + 100;

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(meterX, meterY, meterW, meterH);

      // Level norm (-110 to -40 dBm)
      const norm = Math.max(0, Math.min(1, (item.level - (-110)) / 70));
      ctx.fillStyle = item.active ? '#10B981' : '#64748B';
      ctx.fillRect(meterX, meterY, meterW * norm, meterH);

      // Level text
      ctx.font = '10px monospace';
      ctx.fillStyle = item.active ? '#10B981' : '#64748B';
      ctx.fillText(`${item.level} dBm`, meterX, meterY + 22);

      // Status indicator
      if (item.active) {
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(cx + cardW - 12, marginT + 28, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scanner indicator badge
      if (isCur) {
        ctx.fillStyle = '#FACC15';
        ctx.font = 'bold 9.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▶ SCANNING', cx + cardW / 2, marginT + plotH - 2);
      }
    });
  }
}

/* =========================================================================
   8. POLYCHROME SPECTRUM SIMULATOR (CS-PC Occurrence Density)
   ========================================================================= */
class PolychromeSimulator {
  constructor(canvasId = 'polychromeCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.height = 260;
    this.mode = 'polychrome'; // 'polychrome' | 'normal' | 'maxhold'
    this.scenario = 'burst'; // 'burst' | 'tdd' | 'overlap'
    this.timeWindow = 50; // 100% time in ms (10 - 300)
    this.animTime = 0;

    this.initControls();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const clientW = parent ? parent.clientWidth : 0;
    this.canvas.width = clientW > 0 ? clientW : 640;
    this.canvas.height = this.height;
  }

  initControls() {
    // Mode switcher buttons
    const modeBtns = document.querySelectorAll('.poly-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => {
          b.classList.remove('active');
          b.style.border = '1px solid rgba(255,255,255,0.15)';
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
        });
        btn.classList.add('active');
        btn.style.border = '1px solid var(--accent-amber)';
        btn.style.background = 'rgba(250,204,21,0.15)';
        btn.style.color = 'var(--accent-amber)';

        this.setMode(btn.getAttribute('data-mode'));
      });
    });

    // Scenario buttons
    const scenBtns = document.querySelectorAll('.poly-scen-btn');
    scenBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        scenBtns.forEach(b => {
          b.classList.remove('active');
          b.style.border = '1px solid rgba(255,255,255,0.1)';
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
        });
        btn.classList.add('active');
        btn.style.border = '1px solid rgba(250,204,21,0.4)';
        btn.style.background = 'rgba(250,204,21,0.1)';
        btn.style.color = 'var(--accent-amber)';

        this.setScenario(btn.getAttribute('data-scen'));
      });
    });

    // 100% Time Slider
    const slider = document.getElementById('polyTimeSlider');
    const valText = document.getElementById('polyTimeVal');
    const timeDisplay = document.getElementById('polyTimeDisplay');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.timeWindow = parseInt(e.target.value, 10);
        if (valText) valText.textContent = `${this.timeWindow} ms`;
        if (timeDisplay) timeDisplay.textContent = `100% Time: ${this.timeWindow} ms`;
      });
    }
  }

  setMode(mode) {
    this.mode = mode;
    const modeDisplay = document.getElementById('polyModeDisplay');
    const expContent = document.getElementById('polyExplanationContent');

    if (mode === 'polychrome') {
      if (modeDisplay) modeDisplay.textContent = 'Display: Polychrome (Occurrence Density)';
      if (expContent) {
        expContent.innerHTML = '<strong>Polychrome Spectrum (CS-PC):</strong> แยกสัญญาณด้วย <em>"สถิติความถี่การเกิด" (Occurrence Distribution)</em> ในแต่ละ FFT Bin แมปเป็นเฉดสี: สัญญาณปกติ <strong>-80 dBm เกิดบ่อย 80% (สีแดงเข้ม)</strong> ขณะที่สัญญาณกวน <strong>-50 dBm โผล่มาแค่ 5% ชั่วพริบตา (สีฟ้าเรืองแสง)</strong> แยกแยะสองพฤติกรรมได้อย่างเด็ดขาด';
      }
    } else if (mode === 'normal') {
      if (modeDisplay) modeDisplay.textContent = 'Display: Standard Spectrum (Clear/Write Trace)';
      if (expContent) {
        expContent.innerHTML = '<strong>Standard Spectrum (Trace เดี่ยว):</strong> แสดงระดับปัจจุบันตามรอบการกวาดกะพริบไปมา สัญญาณกวนแบบ Burst สั้นๆ (20 ms) จะโผล่ขึ้นมาแวบเดียวแล้วหายไป ทำให้สายตามนุษย์สังเกตไม่ทัน หรือคิดว่าเป็นสัญญาณรบกวนชั่วคราวทั่วไป';
      }
    } else if (mode === 'maxhold') {
      if (modeDisplay) modeDisplay.textContent = 'Display: Max Hold (Misleading Peak Lock)';
      if (expContent) {
        expContent.innerHTML = '<strong>Max Hold (หลอกตาอย่างร้ายแรง!):</strong> จำค่ายอดพีคสูงสุดที่เคยโผล่มา (-50 dBm) แล้วค้างไว้ถาวร ทำให้วิศวกรหลงคิดว่ามีสัญญาณรบกวนกำลังสูง -50 dBm ส่งอยู่ตลอดเวลา ทั้งที่ความจริง 95% ของเวลา สัญญาณอยู่ที่ -80 dBm เท่านั้น!';
      }
    }
  }

  setScenario(scen) {
    this.scenario = scen;
  }

  animate() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      this.animTime += 0.03;
    }
    if (document.visibilityState === 'visible' && this.canvas && this.canvas.offsetParent !== null) {
      this.render();
    }
    requestAnimationFrame(this.animate);
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Deep Obsidian / Dark background
    ctx.fillStyle = '#07070A';
    ctx.fillRect(0, 0, w, h);

    const marginL = 50;
    const marginR = 20;
    const marginT = 25;
    const marginB = 30;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    // Grid lines & labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Y Axis levels (-110 to -30 dBm)
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'right';
    const dbmSteps = [-30, -50, -70, -90, -110];
    dbmSteps.forEach((db, i) => {
      const y = marginT + (i / 4) * plotH;
      ctx.beginPath();
      ctx.moveTo(marginL, y);
      ctx.lineTo(marginL + plotW, y);
      ctx.stroke();
      ctx.fillText(`${db} dBm`, marginL - 6, y + 3);
    });

    // X Axis Frequency labels
    ctx.textAlign = 'center';
    let f1 = '137.5 MHz', f2 = '138.0 MHz', f3 = '138.125 MHz', f4 = '138.5 MHz';
    if (this.scenario === 'tdd') {
      f1 = '2600.0 MHz'; f2 = '2601.0 MHz'; f3 = '2602.0 MHz'; f4 = '2604.0 MHz';
    }
    ctx.fillText(f1, marginL, h - 12);
    ctx.fillText(f2, marginL + plotW * 0.35, h - 12);
    ctx.fillText(f3, marginL + plotW * 0.62, h - 12);
    ctx.fillText(f4, marginL + plotW, h - 12);

    // Render mode logic
    if (this.mode === 'polychrome') {
      this.renderPolychromeDensity(w, h, ctx, marginL, marginT, plotW, plotH);
    } else if (this.mode === 'normal') {
      this.renderNormalTrace(w, h, ctx, marginL, marginT, plotW, plotH);
    } else if (this.mode === 'maxhold') {
      this.renderMaxHoldTrace(w, h, ctx, marginL, marginT, plotW, plotH);
    }
  }

  renderPolychromeDensity(w, h, ctx, marginL, marginT, plotW, plotH) {
    // Contrast multiplier from 100% time slider
    const contrast = Math.max(0.5, Math.min(2.5, 80 / this.timeWindow));

    // Draw background noise floor occurrence (blue / cyan speckles around -100 dBm)
    const noiseY = marginT + plotH * 0.88;
    ctx.fillStyle = 'rgba(2, 132, 199, 0.08)';
    ctx.fillRect(marginL, noiseY - 10, plotW, 18);

    if (this.scenario === 'burst') {
      // 1. Continuous Carrier at 138.125 MHz (-80 dBm, occurrence 80%)
      const cx = marginL + plotW * 0.62;
      const yCont = marginT + plotH * 0.625; // -80 dBm

      // Draw heat layers (Red hot center, yellow halo)
      const redGrad = ctx.createRadialGradient(cx, yCont, 2, cx, yCont, 35);
      redGrad.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
      redGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.8)');
      redGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.3)');
      redGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = redGrad;
      ctx.beginPath();
      ctx.ellipse(cx, yCont, 30, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Rare Intermittent Burst (-50 dBm, occurrence 5%)
      const yBurst = marginT + plotH * 0.25; // -50 dBm
      const cyanAlpha = Math.min(0.9, 0.45 * contrast);
      const cyanGrad = ctx.createRadialGradient(cx, yBurst, 1, cx, yBurst, 25);
      cyanGrad.addColorStop(0, `rgba(6, 182, 212, ${cyanAlpha})`);
      cyanGrad.addColorStop(0.4, `rgba(14, 116, 144, ${cyanAlpha * 0.6})`);
      cyanGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = cyanGrad;
      ctx.beginPath();
      ctx.ellipse(cx, yBurst, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Connective skirt between -80 and -50 dBm
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fillRect(cx - 8, yBurst + 5, 16, yCont - yBurst);

      // Callout Labels
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🔴 สัญญาณปกติ -80 dBm (เกิด 80% time ➔ สีแดง)', cx + 38, yCont + 4);

      ctx.fillStyle = '#38BDF8';
      ctx.fillText('🔵 สัญญาณกวน Burst -50 dBm (เกิดแค่ 5% time ➔ สีฟ้า)', cx + 38, yBurst + 4);

      // Connecting pointer lines
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.beginPath();
      ctx.moveTo(cx + 10, yCont);
      ctx.lineTo(cx + 34, yCont);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.beginPath();
      ctx.moveTo(cx + 10, yBurst);
      ctx.lineTo(cx + 34, yBurst);
      ctx.stroke();

    } else if (this.scenario === 'tdd') {
      // TDD Frame at 2600-2604 MHz (Pulsing 40-50% occurrence -> Green/Yellow)
      const tddX = marginL + plotW * 0.45;
      const tddY = marginT + plotH * 0.45;

      ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.fillRect(tddX - 80, tddY, 160, plotH * 0.42);

      ctx.fillStyle = 'rgba(250, 204, 21, 0.6)';
      ctx.fillRect(tddX - 60, tddY + 10, 120, plotH * 0.25);

      // Continuous Jammer at 2602 MHz (-65 dBm, 100% continuous -> Solid Hot Red)
      const jx = marginL + plotW * 0.62;
      const jy = marginT + plotH * 0.44;

      const jGrad = ctx.createRadialGradient(jx, jy, 1, jx, jy, 20);
      jGrad.addColorStop(0, 'rgba(239, 68, 68, 1)');
      jGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.8)');
      jGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = jGrad;
      ctx.beginPath();
      ctx.ellipse(jx, jy, 12, plotH * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🔴 2602 MHz Continuous Jammer (100% ส่งตลอด ➔ แดงเข้ม)', jx + 20, jy - 15);

      ctx.fillStyle = '#10B981';
      ctx.fillText('🟡 TDD Frame (สลับ DL/UL 50% ➔ เหลือง/เขียว)', tddX - 110, tddY - 15);

    } else if (this.scenario === 'overlap') {
      // 2 Overlapping Signals: Wideband continuous (-75 dBm, red) + Narrowband pulsed (-55 dBm, cyan)
      const cx = marginL + plotW * 0.5;
      const yWide = marginT + plotH * 0.55;
      const yNarrow = marginT + plotH * 0.32;

      // Wideband carrier
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.fillRect(cx - 70, yWide, 140, plotH * 0.3);

      // Narrowband burst
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.fillRect(cx - 15, yNarrow, 30, plotH * 0.18);

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Wideband Continuous (-75 dBm, แดง)', cx, yWide + 25);

      ctx.fillStyle = '#38BDF8';
      ctx.fillText('Narrowband Burst (-55 dBm, ฟ้า)', cx, yNarrow - 8);
    }
  }

  renderNormalTrace(w, h, ctx, marginL, marginT, plotW, plotH) {
    const cx = marginL + plotW * 0.62;
    const noiseBaseY = marginT + plotH * 0.88;

    // Burst occurs randomly ~5% of frames
    const burstActive = Math.sin(this.animTime * 12) > 0.88;

    ctx.beginPath();
    for (let x = 0; x <= plotW; x += 4) {
      const px = marginL + x;
      let py = noiseBaseY + (Math.random() - 0.5) * 8;

      const dist = Math.abs(px - cx);
      if (dist < 20) {
        if (burstActive) {
          // Jumps to -50 dBm
          py = marginT + plotH * 0.25 + (Math.random() - 0.5) * 4;
        } else {
          // Normal -80 dBm
          py = marginT + plotH * 0.625 + (Math.random() - 0.5) * 4;
        }
      }

      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Callout
    ctx.fillStyle = burstActive ? '#38BDF8' : '#94A3B8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(burstActive ? '⚡ BURST โผล่มาแวบเดียว (-50 dBm)!' : 'ปกติอยู่ที่ -80 dBm (มองไม่เห็น Burst)', cx + 30, marginT + 40);
  }

  renderMaxHoldTrace(w, h, ctx, marginL, marginT, plotW, plotH) {
    const cx = marginL + plotW * 0.62;
    const noiseBaseY = marginT + plotH * 0.88;

    ctx.beginPath();
    for (let x = 0; x <= plotW; x += 4) {
      const px = marginL + x;
      let py = noiseBaseY - 12;

      const dist = Math.abs(px - cx);
      if (dist < 18) {
        // Pinned permanently at -50 dBm
        py = marginT + plotH * 0.25;
      }

      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Warning callout
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1;
    ctx.fillRect(cx - 150, marginT + 15, 300, 48);
    ctx.strokeRect(cx - 150, marginT + 15, 300, 48);

    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('❌ MAX HOLD หลอกตา!', cx, marginT + 33);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText('ล็อคที่ -50 dBm ถาวร แต่ความจริง 95% ของเวลา สัญญาณอยู่ที่ -80 dBm', cx, marginT + 48);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.heroSim = new HeroPreviewCanvas('heroCanvas');
  window.signalSim = new SignalAnalysisSimulator();
  window.he400Sim = new HE400ManualDFSimulator();
  window.autoDfSim = new AutomaticDFSimulator();
  window.triangSim = new TriangulationMapSimulator();
  window.gatedSim = new GatedSpectrumSimulator('canvasGatedSpectrum');
  window.scanModesSim = new ScanModesSimulator('scanModesCanvas');
  window.polychromeSim = new PolychromeSimulator('polychromeCanvas');
  initRBWCalculator();
  initScanResolutionCalculator();
});
