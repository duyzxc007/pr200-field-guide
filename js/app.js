/* PR200 FIELD GUIDE — APPLICATION CONTROLLER & EXAM ENGINE */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDiagnosticLab();
  initComprehensiveExam();
});

/* =========================================================================
   1. NAVIGATION & CHAPTER SWITCHER
   ========================================================================= */
function initNavigation() {
  const chapterPills = document.querySelectorAll('.roadmap-pill');
  const chapterSections = document.querySelectorAll('.chapter-content-section');
  const sidebarButtons = document.querySelectorAll('.sidebar-item-btn');
  const pillArray = Array.from(chapterPills);

  // Initialize roving tabindex (APG Tabs Pattern)
  pillArray.forEach(p => {
    if (p.classList.contains('active')) {
      p.setAttribute('tabindex', '0');
      p.setAttribute('aria-selected', 'true');
    } else {
      p.setAttribute('tabindex', '-1');
      p.setAttribute('aria-selected', 'false');
    }
  });

  // Chapter pill switching
  chapterPills.forEach((pill, idx) => {
    pill.addEventListener('click', () => {
      const targetChapter = pill.getAttribute('data-chapter');
      
      chapterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
        p.setAttribute('tabindex', '-1');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      pill.setAttribute('tabindex', '0');

      chapterSections.forEach(sec => {
        if (sec.id === `section-${targetChapter}`) {
          sec.style.display = 'block';
        } else {
          sec.style.display = 'none';
        }
      });

      // Update active state in sidebar if matching chapter
      updateSidebarActive(targetChapter);

      // Trigger resize on simulators so canvases scale cleanly
      window.dispatchEvent(new Event('resize'));

      // Smooth scroll to top of workspace
      const ws = document.querySelector('.workspace-wrapper');
      if (ws) {
        ws.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Keyboard Arrow Navigation for tabs (WCAG APG Tabs Pattern)
    pill.addEventListener('keydown', (e) => {
      let nextIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (idx + 1) % pillArray.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (idx - 1 + pillArray.length) % pillArray.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = pillArray.length - 1;
      }
      if (nextIndex >= 0) {
        pillArray[nextIndex].focus();
        pillArray[nextIndex].click();
      }
    });
  });

  // Chapter Prev / Next Navigation Buttons
  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('.btn-chapter-nav');
    if (navBtn) {
      const targetChapter = navBtn.getAttribute('data-goto');
      if (targetChapter) {
        const pill = document.querySelector(`.roadmap-pill[data-chapter="${targetChapter}"]`);
        if (pill) {
          pill.click();
        }
      }
    }
  });

  // Sidebar item jumping to specific subsections
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sidebarButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetId = btn.getAttribute('data-target');
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Presets selector dropdown
  const presetSelector = document.getElementById('pr200PresetSelect');
  if (presetSelector) {
    presetSelector.addEventListener('change', (e) => {
      applyPR200Preset(e.target.value);
    });
  }

  // Initialize sidebar for Chapter 1 on startup
  updateSidebarActive('ch1');
}

function updateSidebarActive(chapterKey) {
  const sidebarBadges = document.querySelectorAll('.sidebar-chapter-badge');
  const sidebarTitles = document.querySelectorAll('.sidebar-chapter-title');
  const sidebarItemsList = document.querySelector('.sidebar-items');
  
  const chapterData = {
    'ch1': { 
      badge: 'บทที่ 1 · พื้นฐาน', 
      title: 'รู้จักเครื่อง & สถาปัตยกรรม 6 งานหลัก',
      items: [
        { id: 'ch1-core-arch', label: '6 งานหลักของ PR200' },
        { id: 'ch1-interactive-hardware', label: 'กายวิภาคเครื่อง & แอนิเมชั่นปุ่มกด' },
        { id: 'ch1-button-guide', label: 'คู่มือปุ่มกดจริง & วิธีตั้งค่า 7 สเต็ป' },
        { id: 'ch1-hardware-ports', label: 'พอร์ตเชื่อมต่อ & กายวิภาคฮาร์ดแวร์' },
        { id: 'ch1-stealth-mode', label: 'Stealth Mode & ปลดล็อกฉุกเฉิน' },
        { id: 'ch1-osm-wizard', label: 'แผนที่ RsOsmWizard (โฟลเดอร์ Maps)' },
        { id: 'ch1-options-matrix', label: 'ตาราง R&S Option Evaluation' },
        { id: 'ch1-level-mapping', label: 'Level Mapping & GNSS Drive Test' },
        { id: 'ch1-field-workflow', label: '10 ขั้นตอน Field Execution Chain' },
        { id: 'ch1-preset-setup', label: 'พรีเซ็ตมาตรฐาน 6 แบบ' },
        { id: 'ch1-rules-formulas', label: '7 กฎเหล็ก & สูตรจำขึ้นใจ' }
      ]
    },
    'ch2': { 
      badge: 'บทที่ 2 · Receiver', 
      title: 'Spectrum, Waterfall & Demodulation',
      items: [
        { id: 'ch2-simulator', label: 'หน้าจอ Spectrum & Waterfall จำลอง' },
        { id: 'ch2-rbw-guide', label: 'ความสำคัญของ RBW' },
        { id: 'ch2-rbw-calc', label: 'เครื่องคิดเลข RBW vs Noise Floor' },
        { id: 'ch2-demod-squelch', label: 'Audio Demodulation & Squelch' },
        { id: 'ch2-att-test', label: 'Attenuator Test แยก Overload' },
        { id: 'ch2-dual-vfo', label: 'Dual VFO (VFO A & VFO B)' },
        { id: 'ch2-markers-hist', label: 'ระบบ 6 Markers & HIST Marker' }
      ]
    },
    'ch3': { 
      badge: 'บทที่ 3 · PScan', 
      title: 'Dedicated Scan Modes & PScan',
      items: [
        { id: 'ch3-scan-modes-sim', label: 'Dedicated Scan Modes จำลอง' },
        { id: 'ch3-modes-compare', label: '01 เจาะลึก PScan vs FScan vs MScan' },
        { id: 'ch3-decision-tree', label: '02 Master Decision Tree' },
        { id: 'ch3-five-cases', label: '03 5 สถานการณ์จริงภาคสนาม' },
        { id: 'ch3-scan-rules', label: '04 Scan Resolution vs Bandwidth' },
        { id: 'ch3-scan-calc', label: 'เครื่องคำนวณ Scan Resolution' },
        { id: 'ch3-gated-spectrum', label: '05 Gated Spectrum (TDD 5G/LTE)' },
        { id: 'ch3-hunt-workflow', label: '06 10 ขั้นตอนการค้นหา Interference' },
        { id: 'ch3-polychrome', label: '07 Polychrome Spectrum & 100% Time' },
        { id: 'ch3-mscan-iview', label: '08 MScan & R&S®InstrumentView' }
      ]
    },
    'ch4': { 
      badge: 'บทที่ 4 · HE400 Homing', 
      title: 'HE400 Manual DF / Homing เจาะลึก',
      items: [
        { id: 'ch4-simulator', label: 'เรดาร์จำลองเสา HE400 360°' },
        { id: 'ch4-principles', label: 'หลักการ Manual Homing & Module' },
        { id: 'ch4-handle-anatomy', label: 'กายวิภาคด้ามเสา HE400 & LED 5 สี' },
        { id: 'ch4-body-rf', label: 'ผลของร่างกาย Operator & ท่าทาง' },
        { id: 'ch4-polarization', label: 'Polarization Test (V vs H)' },
        { id: 'ch4-sweep-tech', label: 'Sweep-Peak-Reverse-Confirm' },
        { id: 'ch4-triangulation', label: 'Triangulation 6 ขั้นตอน กสทช.' },
        { id: 'ch4-homing-stages', label: '3 ขั้นตอน Homing Strategy' },
        { id: 'ch4-indoor-hunt', label: 'Indoor Search Hierarchy' },
        { id: 'ch4-errors-table', label: '10 ข้อผิดพลาดที่พบบ่อย' },
        { id: 'ch4-workflow16', label: '16 ขั้นตอน Professional Workflow' },
        { id: 'ch4-test-matrix', label: 'ตาราง Matrix 138 MHz vs 530 MHz' }
      ]
    },
    'ch5': { 
      badge: 'บทที่ 5 · Analysis', 
      title: 'Advanced Signal Analysis',
      items: [
        { id: 'ch5-zero-span-sim', label: 'Zero Span Time Domain จำลอง' },
        { id: 'ch5-polychrome-sim', label: 'Polychrome Spectrum จำลอง' },
        { id: 'ch5-two-worlds', label: '01 2 โลก: Frequency vs Time' },
        { id: 'ch5-polychrome-guide', label: '02 Polychrome vs Max Hold' },
        { id: 'ch5-shapes-catalog', label: '03 รูปร่างสัญญาณ 8 ประเภท' },
        { id: 'ch5-obw-power', label: '04 OBW β% 99%, x-dB & Channel Power' },
        { id: 'ch5-intermod-harm', label: '05 สูตร Harmonic & Intermod (IMD)' },
        { id: 'ch5-master-matrix', label: '06 13 โหมด/แอป & สูตรจำ PR200' },
        { id: 'ch5-quick-diag', label: '07 15-Step Workflow' },
        { id: 'ch5-field-practice', label: 'แบบฝึกหัด 5 รอบบทที่ 5' }
      ]
    },
    'ch6': { 
      badge: 'บทที่ 6 · Auto DF', 
      title: 'Automatic DF ด้วย PR200 + CS-DF',
      items: [
        { id: 'ch6-auto-df-sim', label: 'หน้าจอจำลอง Polar CS-DF' },
        { id: 'ch6-interferometer', label: 'Correlative Interferometer ADDx07' },
        { id: 'ch6-level-vs-bearing', label: 'ทำไม Monitoring รับได้แต่ DF ไม่ออก' },
        { id: 'ch6-quality-stability', label: 'DF Quality & Bearing Stability' },
        { id: 'ch6-multipath-heading', label: 'Multipath & Heading Offset' },
        { id: 'ch6-troubleshoot-tree', label: 'Troubleshooting Tree 10 ขั้นตอน' },
        { id: 'ch6-case-lab', label: 'เคส 138 MHz vs 530 MHz Lab' },
        { id: 'ch6-wideband-df', label: 'Wideband DF 40 MHz & Mobile DF' },
        { id: 'ch6-acceptance-test', label: 'ตัวอย่าง Verification Worksheet' }
      ]
    },
    'exam': { 
      badge: 'ประเมินผล', 
      title: 'แบบทดสอบประมวลผลความรู้ (Exam)',
      items: [
        { id: 'exam-section-card', label: 'ข้อสอบภาคสนาม 20 ข้อ' }
      ]
    }
  };

  const curData = chapterData[chapterKey];
  if (curData) {
    sidebarBadges.forEach(b => b.innerText = curData.badge);
    sidebarTitles.forEach(t => t.innerText = curData.title);

    if (sidebarItemsList && curData.items) {
      sidebarItemsList.innerHTML = '';
      curData.items.forEach((it, idx) => {
        const li = document.createElement('li');
        const numStr = (idx + 1).toString().padStart(2, '0');
        li.innerHTML = `
          <button type="button" class="sidebar-item-btn ${idx === 0 ? 'active' : ''}" data-target="${it.id}">
            <span class="item-idx">${numStr}</span>
            <span>${it.label}</span>
          </button>
        `;
        sidebarItemsList.appendChild(li);
      });

      // Bind click events to newly created buttons
      sidebarItemsList.querySelectorAll('.sidebar-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          sidebarItemsList.querySelectorAll('.sidebar-item-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const targetId = btn.getAttribute('data-target');
          if (targetId) {
            const el = document.getElementById(targetId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });
    }
  }
}

window.applyPR200Preset = applyPR200Preset;
function applyPR200Preset(presetKey) {
  const PRESET_CONFIGS = {
    '01_FAST_SURVEY': {
      badge: 'PSCAN · สูงสุด 60 GHz/s (@ 1 MHz res) · AUTO ATT',
      badgeColor: '#FACC15',
      badgeBg: 'rgba(250,204,21,0.1)',
      badgeBorder: 'rgba(250,204,21,0.3)',
      pulseColor: '#FACC15',
      title: 'PSCAN SPECTRUM & WATERFALL (FAST SURVEY)',
      toast: '⚡ พรีเซ็ต 01_FAST_SURVEY: โหมด Panorama Scan (100–1000 MHz) ความเร็วกวาดสูงสุด 60 GHz/s (@ 1 MHz resolution), Auto Attenuation ค้นหายอดคลื่นรอบย่านความถี่',
      stats: [
        { label: 'ช่วงความถี่ / Span', val: '100–1000 MHz (Span 900 MHz)', color: 'var(--text-primary)' },
        { label: 'ระดับสัญญาณ Peak', val: '-45.0 dBm (138 MHz)', color: 'var(--accent-amber)' },
        { label: 'Noise Floor พื้นฐาน', val: '-105.0 dBm (Avg)', color: 'var(--text-secondary)' },
        { label: 'พารามิเตอร์เฉพาะ Preset', val: 'Sweep แปรผันตาม Res (สูงสุด 60 GHz/s @ 1 MHz)', color: '#38BDF8' }
      ]
    },
    '02_NARROW_SIGNAL': {
      badge: 'RECEIVER · SPAN 50 kHz · RBW 1 kHz',
      badgeColor: '#38BDF8',
      badgeBg: 'rgba(56,189,248,0.1)',
      badgeBorder: 'rgba(56,189,248,0.3)',
      pulseColor: '#38BDF8',
      title: 'RECEIVER VFO A MONITOR (NARROW SIGNAL)',
      toast: '🎯 พรีเซ็ต 02_NARROW_SIGNAL: โหมด Receiver ซูม Span 50 kHz, RBW 1 kHz (Ultra-low Noise Floor -118 dBm), FM Demodulation + Squelch ON',
      stats: [
        { label: 'ความถี่เป้าหมาย (Carrier)', val: '138.125 MHz (VFO A)', color: 'var(--text-primary)' },
        { label: 'ระดับสัญญาณ Peak', val: '-58.0 dBm (SNR +60 dB)', color: '#38BDF8' },
        { label: 'Noise Floor พื้นฐาน', val: '-118.0 dBm (Ultra-low)', color: 'var(--text-secondary)' },
        { label: 'พารามิเตอร์เฉพาะ Preset', val: 'FM (12.5 kHz) · SQL -100 dBm', color: '#10B981' }
      ]
    },
    '03_INTERFERENCE': {
      badge: 'MAX HOLD + POLYCHROME · BURST HUNT',
      badgeColor: '#F43F5E',
      badgeBg: 'rgba(244,63,94,0.12)',
      badgeBorder: 'rgba(244,63,94,0.35)',
      pulseColor: '#F43F5E',
      title: 'INTERFERENCE MONITOR (BURST & TRANSIENT)',
      toast: '🔥 พรีเซ็ต 03_INTERFERENCE: ตรวจจับสัญญาณกวนเป็นช่วงๆ (Burst/Hopping) ด้วย Max Hold Envelope สีแดง และ Polychrome Waterfall Persistence 2.5s',
      stats: [
        { label: 'โหมดตรวจจับพิเศษ', val: 'Polychrome & Max Hold On', color: '#F43F5E' },
        { label: 'ระดับสัญญาณ Peak', val: '-48.0 dBm (Burst Peak)', color: '#F43F5E' },
        { label: 'ความหนาแน่นสถิติ', val: 'Occurrence Color Map (100% Time 50ms)', color: 'var(--accent-amber)' },
        { label: 'พารามิเตอร์เฉพาะ Preset', val: 'Peak Det · Trace MaxHold · Persistence ON', color: 'var(--text-primary)' }
      ]
    },
    '04_DF': {
      badge: 'DF MODE · ADDx07 5-ELEM · CORRELATIVE INTERFEROMETER',
      badgeColor: '#10B981',
      badgeBg: 'rgba(16,185,129,0.1)',
      badgeBorder: 'rgba(16,185,129,0.3)',
      pulseColor: '#10B981',
      title: 'AUTOMATIC DF MONITOR (CORRELATIVE INTERFEROMETER)',
      toast: '🧭 พรีเซ็ต 04_DF: โหมดหาทิศทางอัตโนมัติ (CS-DF) ตัวอย่างการจำลองร่วมกับสายอากาศ ADDx07 Array (e.g. ADD107/ADD207), DF Squelch 20 dBµV/m, แสดงเข็มชี้ทิศและคุณภาพจำลอง',
      stats: [
        { label: 'ทิศทางวัดได้ (Azimuth)', val: '086.5° [SIMULATED]', color: '#10B981' },
        { label: 'คุณภาพทิศทาง (DF Quality)', val: '92% [SIMULATED]', color: '#10B981' },
        { label: 'ชนิดสายอากาศ DF', val: 'ADDx07 Compact Multi-element Array', color: 'var(--text-primary)' },
        { label: 'พารามิเตอร์เฉพาะ Preset', val: 'DF Squelch 20 dBµV/m · BW 12.5 kHz', color: '#38BDF8' }
      ]
    },
    '05_TDD_HUNT': {
      badge: 'GATED SPECTRUM · TDD 5G/LTE · TIME SELECTIVE',
      badgeColor: '#A855F7',
      badgeBg: 'rgba(168,85,247,0.12)',
      badgeBorder: 'rgba(168,85,247,0.35)',
      pulseColor: '#A855F7',
      title: 'LIVE GATED SPECTRUM MONITOR (5G TDD GUARD SLOT HUNT)',
      toast: '🛡️ พรีเซ็ต 05_TDD_HUNT: โหมด CS-ZS Gated Spectrum ตัดสัญญาณ Downlink กำลังสูง (+25 dBm) ส่องทะลวงช่อง Guard Period (400–450 µs) จับคลื่นกวนแอบแฝง',
      stats: [
        { label: 'ความถี่และแบนด์', val: '2600.000 MHz (Band n41)', color: 'var(--text-primary)' },
        { label: 'ระดับสัญญาณ Peak', val: '-68.0 dBm (Guard Intf)', color: '#A855F7' },
        { label: 'Downlink Masked', val: '+25 dBm (BLOCKED)', color: '#F43F5E' },
        { label: 'พารามิเตอร์เฉพาะ Preset', val: 'Gate: 400–450 µs (GP Only)', color: '#10B981' }
      ]
    },
    '06_RECORD': {
      badge: 'I/Q STREAM & RECORD · TECHNICAL AUDIT',
      badgeColor: '#EF4444',
      badgeBg: 'rgba(239,68,68,0.12)',
      badgeBorder: 'rgba(239,68,68,0.35)',
      pulseColor: '#EF4444',
      title: 'CS-IQ RECORDING & TECHNICAL AUDIT STREAM',
      toast: '🔴 พรีเซ็ต 06_RECORD (06_TECHNICAL_RECORD): บันทึก I/Q กว้างสูงสุด 40 MHz RTBW Snapshot ประทับเวลา GNSS UTC สำหรับเป็นหลักฐานประกอบการวิเคราะห์และรายงานภาคสนาม (Audit Trail)',
      stats: [
        { label: 'Bandwidth บันทึก I/Q', val: '40 MHz RTBW (138 MHz Ctr)', color: 'var(--text-primary)' },
        { label: 'ระดับสัญญาณ Peak', val: '-65.0 dBm (Digital Flat)', color: '#38BDF8' },
        { label: 'สถานะการบันทึก', val: '● REC ON (40 MHz Snapshot)', color: '#EF4444' },
        { label: 'พิกัด GNSS / Time', val: '13.7563°N, 100.5018°E (UTC)', color: 'var(--accent-amber)' }
      ]
    }
  };

  const cfg = PRESET_CONFIGS[presetKey] || PRESET_CONFIGS['01_FAST_SURVEY'];

  // 1. Update Hero Live Simulator Waveform & Waterfall
  if (window.heroSim && typeof window.heroSim.setPreset === 'function') {
    window.heroSim.setPreset(presetKey);
  }

  // 2. Update Header Badge, Dot, and Monitor Title
  const badgeEl = document.getElementById('heroHeaderBadge');
  if (badgeEl) {
    badgeEl.innerText = cfg.badge;
    badgeEl.style.color = cfg.badgeColor;
    badgeEl.style.background = cfg.badgeBg;
    badgeEl.style.borderColor = cfg.badgeBorder;
  }

  const dotEl = document.getElementById('heroPulseDot');
  if (dotEl) {
    dotEl.style.background = cfg.pulseColor;
    dotEl.style.boxShadow = `0 0 10px ${cfg.pulseColor}`;
  }

  const titleEl = document.getElementById('heroMonitorTitle');
  if (titleEl) {
    titleEl.innerText = cfg.title;
  }

  // 3. Update 4 Parameter Stat Boxes under Monitor
  for (let i = 1; i <= 4; i++) {
    const lbl = document.getElementById(`heroStatLabel${i}`);
    const val = document.getElementById(`heroStatVal${i}`);
    if (cfg.stats[i - 1]) {
      if (lbl) lbl.innerText = cfg.stats[i - 1].label;
      if (val) {
        val.innerText = cfg.stats[i - 1].val;
        val.style.color = cfg.stats[i - 1].color;
      }
    }
  }

  // 4. Synchronize Top Nav Preset Dropdown
  const presetSel = document.getElementById('pr200PresetSelect');
  if (presetSel && presetSel.value !== presetKey) {
    presetSel.value = presetKey;
  }

  // 5. Trigger Glow Card Animation
  const heroCard = document.getElementById('heroVisualCard');
  if (heroCard) {
    heroCard.classList.remove('preset-changed');
    void heroCard.offsetWidth; // trigger reflow
    heroCard.classList.add('preset-changed');
    setTimeout(() => {
      heroCard.classList.remove('preset-changed');
    }, 1200);

    // If operator clicked from chapter 1 down the page, smoothly scroll to view the live monitor
    if (window.scrollY > 350) {
      heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // 6. Display Engineering Toast
  const infoToast = document.getElementById('presetToastInfo');
  if (infoToast) {
    infoToast.innerHTML = cfg.toast;
    infoToast.style.borderColor = cfg.badgeColor;
    infoToast.style.display = 'block';
    if (window._presetToastTimer) clearTimeout(window._presetToastTimer);
    window._presetToastTimer = setTimeout(() => {
      infoToast.style.display = 'none';
    }, 6000);
  }
}

/* =========================================================================
   2. INTERACTIVE DIAGNOSTIC LAB: 138 MHz vs 530 MHz CASE STUDY
   ========================================================================= */
function initDiagnosticLab() {
  const labForm = document.getElementById('diagnosticLabForm');
  const btnRunDiag = document.getElementById('btnRunDiagnostic');
  const diagResultBox = document.getElementById('diagResultBox');

  if (btnRunDiag) {
    btnRunDiag.addEventListener('click', () => {
      const attVal = document.querySelector('input[name="lab_att"]:checked')?.value || '0';
      const dfBw = document.querySelector('input[name="lab_dfbw"]:checked')?.value || 'auto';
      const antennaBand = document.querySelector('input[name="lab_ant"]:checked')?.value || 'correct';
      const multipathLoc = document.querySelector('input[name="lab_loc"]:checked')?.value || 'near_metal';

      let diagnosis = [];
      let isSuccess = false;

      if (antennaBand === 'wrong') {
        diagnosis.push('❌ <strong>Antenna Module ผิดย่าน</strong>: HE400 หรือ DF Antenna ที่เชื่อมต่อไม่รองรับความถี่ 138 MHz (VHF) ทำให้ Phase relationship หรือ RF Sensitivity แย่มากจนไม่สามารถคำนวณทิศทางได้');
      } else if (dfBw === 'too_narrow') {
        diagnosis.push('❌ <strong>DF Bandwidth แคบเกินไป</strong>: สัญญาณเป้าหมาย 12.5 kHz แต่ตั้ง DF BW แค่ 3 kHz ทำให้ตัดทอนพลังงานส่วนใหญ่ SNR ไม่พอคำนวณ AoA');
      } else if (multipathLoc === 'near_metal') {
        diagnosis.push('⚠️ <strong>จุดวัดมี Multipath รุนแรง</strong>: ยืนติดเสาเหล็ก / ตัวถังรถ / กำแพงคอนกรีต คลื่น VHF (λ ≈ 2.17 m) เกิด Reflection รุนแรง ทำให้ระบบ Interferometer สับสน Bearing แกว่ง');
      } else if (attVal === '0') {
        diagnosis.push('⚠️ <strong>เสี่ยง Receiver Overload</strong>: ย่าน VHF มีสถานีวิทยุกระจายเสียง FM ใกล้เคียงส่งกำลังสูง Front-end ของ PR200 อาจถูกบล็อก แนะนำเพิ่ม ATT +10 หรือ +20 dB');
      } else {
        diagnosis.push('✅ <strong>เงื่อนไขตรวจวัดสมบูรณ์ (Success!)</strong>: ตรวจสอบย่านเสาอากาศถูกต้อง, DF Bandwidth สอดคล้องกับสัญญาณ, ย้ายจุดวัดห่างโลหะ > 20 เมตร และปรับ ATT เหมาะสม ทำให้คำนวณ Bearing 087° ได้อย่างแม่นยำและเสถียร (Quality > 90%)');
        isSuccess = true;
      }

      if (diagResultBox) {
        diagResultBox.className = isSuccess ? 'quiz-feedback-box show success' : 'quiz-feedback-box show error';
        diagResultBox.innerHTML = diagnosis.join('<br>');
      }
    });
  }
}

/* =========================================================================
   3. COMPREHENSIVE POST-COURSE EXAM (10 SCENARIO QUESTIONS)
   ========================================================================= */
const examQuestions = [
  {
    "id": 1,
    "chapter": "บทที่ 1 · พื้นฐาน & การกวาดหาสัญญาณ",
    "question": "คุณได้รับแจ้งว่าระบบที่ 138 MHz ถูกรบกวนเป็นบางช่วง และยังไม่ทราบต้นเหตุ ควรเริ่มทำอะไร?",
    "options": [
      {
        "text": "เพิ่ม Gain สูงสุด",
        "correct": false
      },
      {
        "text": "ปิด Waterfall",
        "correct": false
      },
      {
        "text": "ใช้ PScan กวาดช่วงความถี่รอบย่านเป้าหมาย",
        "correct": true
      },
      {
        "text": "เปิด DF ทันที",
        "correct": false
      }
    ],
    "rationale": "ตามหลักการ Wide → Narrow ของ PR200 หากยังไม่ทราบความถี่และต้นเหตุที่แน่นอน ควรใช้ Panorama Scan (PScan) กวาดดูภาพรวมเพื่อหา Peak และสิ่งผิดปกติรอบย่านก่อน"
  },
  {
    "id": 2,
    "chapter": "บทที่ 2 · Receiver & Waterfall",
    "question": "ระหว่าง PScan พบ peak ที่ 138.125 MHz แต่ peak นี้ปรากฏเฉพาะบางครั้ง ฟังก์ชันใดเหมาะที่สุดในการช่วยจับสัญญาณนี้?",
    "options": [
      {
        "text": "Max Hold + Waterfall",
        "correct": true
      },
      {
        "text": "Squelch สูงสุด",
        "correct": false
      },
      {
        "text": "Average only",
        "correct": false
      },
      {
        "text": "ลด Volume",
        "correct": false
      }
    ],
    "rationale": "Max Hold จะตรึงค่ายอดสูงสุดที่เคยเกิดขึ้นไว้ ส่วน Waterfall จะบันทึกประวัติสัญญาณตามแกนเวลา ทำให้เห็นการปรากฏตัวของสัญญาณที่แวบมาได้อย่างชัดเจน"
  },
  {
    "id": 3,
    "chapter": "บทที่ 2 · Receiver & Span",
    "question": "ใน Receiver mode คุณพบสัญญาณที่ 138.125 MHz และต้องการดูรูปร่างสัญญาณให้ละเอียดขึ้น ควรทำอะไร?",
    "options": [
      {
        "text": "ปิด Marker",
        "correct": false
      },
      {
        "text": "เพิ่ม ATT สูงสุดทันที",
        "correct": false
      },
      {
        "text": "เพิ่ม Span จาก 100 kHz เป็น 10 MHz",
        "correct": false
      },
      {
        "text": "ลด Span ให้แคบลง",
        "correct": true
      }
    ],
    "rationale": "การลด Span ให้แคบลง (Zoom in) ทำให้การกระจายตัวของจุดสุ่มตัวอย่าง FFT โฟกัสเฉพาะตัวสัญญาณ จึงมองเห็นโครงสร้างแบนด์วิดท์และยอด Sidebands ได้ละเอียดขึ้น"
  },
  {
    "id": 4,
    "chapter": "บทที่ 2 · Overload & Intermodulation",
    "question": "คุณพบ peak หลายตัวผิดปกติขณะอยู่ใกล้ transmitter กำลังสูง สิ่งแรกที่ควรสงสัยคืออะไร?",
    "options": [
      {
        "text": "Battery PR200 เสื่อม",
        "correct": false
      },
      {
        "text": "Receiver overload หรือ intermodulation",
        "correct": true
      },
      {
        "text": "ทุก peak เป็น transmitter จริง",
        "correct": false
      },
      {
        "text": "GPS ผิด",
        "correct": false
      }
    ],
    "rationale": "การอยู่ใกล้เครื่องส่งกำลังสูงจะทำให้ Front-end ของเครื่องรับอิ่มตัว (Saturation) เกิดพฤติกรรม Nonlinear สร้าง Intermodulation Products และ Spurious ขึ้นมาเองในเครื่อง"
  },
  {
    "id": 5,
    "chapter": "บทที่ 2 · Attenuator Test",
    "question": "วิธีตรวจสอบเบื้องต้นว่า peak แปลก ๆ อาจเกิดจาก overload คือข้อใด?",
    "options": [
      {
        "text": "ปิด Antenna แล้วเปิดใหม่",
        "correct": false
      },
      {
        "text": "เพิ่ม Volume",
        "correct": false
      },
      {
        "text": "เพิ่ม RF Attenuation แล้วดูว่าหลาย peak หายหรือเปลี่ยนผิดปกติหรือไม่",
        "correct": true
      },
      {
        "text": "เปลี่ยนจาก dBm เป็น Volt",
        "correct": false
      }
    ],
    "rationale": "Attenuator Test: หากเพิ่ม ATT 10 dB แล้วยอดสัญญาณลดลงผิดสัดส่วน (เช่น ผลคูณ IMD3 ลดฮวบมากกว่า 20–30 dB) หรือยอดหายไป ถือเป็นข้อบ่งชี้สนับสนุนว่าอาจเกิดจาก Overload/Intermodulation ภายในเครื่องรับเอง (ไม่ใช่ข้อพิสูจน์เด็ดขาด ต้องตรวจสอบซ้ำด้วย Preselector หรือเทียบกับเครื่องรับภายนอก)"
  },
  {
    "id": 6,
    "chapter": "บทที่ 2 · Demodulation Bandwidth",
    "question": "Signal มี bandwidth ประมาณ 12.5 kHz แต่ตั้ง Demodulation BW ไว้ 100 kHz ผลที่อาจเกิดขึ้นคืออะไร?",
    "options": [
      {
        "text": "Antenna gain จะเพิ่ม",
        "correct": false
      },
      {
        "text": "ความถี่จะเลื่อน",
        "correct": false
      },
      {
        "text": "Signal จะหายเสมอ",
        "correct": false
      },
      {
        "text": "รับ noise และสัญญาณข้างเคียงมากเกินไป",
        "correct": true
      }
    ],
    "rationale": "การตั้ง Demod BW กว้างเกินไปจะเปิดให้ Thermal noise และสัญญาณจากช่องข้างเคียง (Adjacent channels) หลุดเข้ามาในลำโพง ทำให้เสียงรบกวนดังและ SNR ลดลง"
  },
  {
    "id": 7,
    "chapter": "บทที่ 2 · Demodulation Distortion",
    "question": "ถ้าตั้ง Demodulation BW แคบกว่าสัญญาณจริงมากเกินไป ผลที่เป็นไปได้คืออะไร?",
    "options": [
      {
        "text": "ความถี่เพิ่มขึ้น",
        "correct": false
      },
      {
        "text": "เสียงหรือข้อมูลผิดเพี้ยน เพราะรับสัญญาณไม่ครบ",
        "correct": true
      },
      {
        "text": "Signal แรงขึ้น",
        "correct": false
      },
      {
        "text": "Noise floor ลดลงเป็นศูนย์",
        "correct": false
      }
    ],
    "rationale": "ฟิลเตอร์ที่แคบเกินไปจะตัดทอน Sideband และข้อมูลการมอดูเลตออกไป ทำให้เสียงอู้อี้ ข้อมูลดิจิทัลถอดรหัสไม่ได้ (Bit Error สูง)"
  },
  {
    "id": 8,
    "chapter": "บทที่ 2 · Resolution Bandwidth (RBW)",
    "question": "ต้องการแยก signal สองตัวที่อยู่ใกล้กันมาก ควรปรับอะไร?",
    "options": [
      {
        "text": "เพิ่ม Squelch",
        "correct": false
      },
      {
        "text": "เพิ่ม Span อย่างเดียว",
        "correct": false
      },
      {
        "text": "ลด RBW",
        "correct": true
      },
      {
        "text": "เพิ่ม Volume",
        "correct": false
      }
    ],
    "rationale": "Resolution Bandwidth (RBW) คือความกว้างของฟิลเตอร์แยกสเปกตรัม การลด RBW จะช่วยแยกยอดคลื่นสองตัวที่อยู่ชิดกันไม่ให้รวมกันเป็นยอดเดียว"
  },
  {
    "id": 9,
    "chapter": "บทที่ 2 · SNR Calculation",
    "question": "คุณพบ signal ที่ระดับ -45 dBm และ noise floor -95 dBm ค่า SNR โดยประมาณเท่าไร?",
    "options": [
      {
        "text": "95 dB",
        "correct": false
      },
      {
        "text": "-50 dB",
        "correct": false
      },
      {
        "text": "40 dB",
        "correct": false
      },
      {
        "text": "50 dB",
        "correct": true
      }
    ],
    "rationale": "SNR = Signal Level - Noise Floor = -45 dBm - (-95 dBm) = 50 dB"
  },
  {
    "id": 10,
    "chapter": "บทที่ 2 · Waterfall Behavior",
    "question": "ใน Waterfall เห็นเส้นสัญญาณโผล่ทุก ๆ 2 วินาที ลักษณะนี้บอกอะไรได้ดีที่สุด?",
    "options": [
      {
        "text": "Bearing ถูกต้องแน่นอน",
        "correct": false
      },
      {
        "text": "Signal มีพฤติกรรมเป็นช่วงหรือ burst",
        "correct": true
      },
      {
        "text": "Signal เป็น FM แน่นอน",
        "correct": false
      },
      {
        "text": "PR200 เสีย",
        "correct": false
      }
    ],
    "rationale": "เส้นประที่เว้นช่วงสม่ำเสมอบน Waterfall บ่งชี้ว่าสัญญาณเป็นประเภท Burst / Periodic Transmission (เช่น Telemetry, Polling, Beacon)"
  },
  {
    "id": 11,
    "chapter": "บทที่ 5 · Zero Span Time Domain",
    "question": "ถ้าต้องการวัดว่า burst เปิดอยู่นานกี่มิลลิวินาที ฟังก์ชันใดเหมาะที่สุด?",
    "options": [
      {
        "text": "Map",
        "correct": false
      },
      {
        "text": "PScan",
        "correct": false
      },
      {
        "text": "Zero Span / Time Domain",
        "correct": true
      },
      {
        "text": "Max Hold อย่างเดียว",
        "correct": false
      }
    ],
    "rationale": "Zero Span (CS-ZS) เปลี่ยนแกนนอนเป็นแกนเวลา ทำให้สามารถใช้ Marker วัดระยะเวลา Pulse Width (T_ON) ในหน่วยมิลลิวินาทีได้อย่างแม่นยำ"
  },
  {
    "id": 12,
    "chapter": "บทที่ 5 · Duty Cycle Formula",
    "question": "คุณวัดได้ signal ON = 100 ms และ period = 1 s ค่า Duty Cycle ประมาณเท่าไร?",
    "options": [
      {
        "text": "10%",
        "correct": true
      },
      {
        "text": "1%",
        "correct": false
      },
      {
        "text": "100%",
        "correct": false
      },
      {
        "text": "50%",
        "correct": false
      }
    ],
    "rationale": "Duty Cycle = (T_ON / T_Period) * 100% = (100 ms / 1000 ms) * 100% = 10%"
  },
  {
    "id": 13,
    "chapter": "บทที่ 4 · HE400 Homing",
    "question": "ในการใช้ HE400 ทำ Manual Homing หลักสำคัญคืออะไร?",
    "options": [
      {
        "text": "หาทิศที่ noise ต่ำที่สุดเพียงครั้งเดียว",
        "correct": false
      },
      {
        "text": "ใช้ Gain สูงสุดตลอดเวลา",
        "correct": false
      },
      {
        "text": "ถือเสาแบบไหนก็ได้",
        "correct": false
      },
      {
        "text": "หาทิศที่ระดับสัญญาณสูงที่สุดและยืนยันหลายครั้ง",
        "correct": true
      }
    ],
    "rationale": "การทำ Manual Homing ต้องใช้เทคนิค Sweep → Peak → Reverse → Confirm เพื่อยืนยันทิศทางระดับสัญญาณสูงสุด และป้องกันการหลง Side lobe"
  },
  {
    "id": 14,
    "chapter": "บทที่ 4 · Near Source Sensitivity",
    "question": "ขณะเข้าใกล้ source ระดับสัญญาณแรงมากจนทุกทิศอ่านใกล้เคียงกัน ควรทำอย่างไร?",
    "options": [
      {
        "text": "เพิ่ม Span",
        "correct": false
      },
      {
        "text": "เพิ่ม Attenuation เพื่อลด sensitivity",
        "correct": true
      },
      {
        "text": "เพิ่ม Gain",
        "correct": false
      },
      {
        "text": "เพิ่ม Demod BW",
        "correct": false
      }
    ],
    "rationale": "เมื่อเข้าใกล้แหล่งกำเนิด สัญญาณที่แรงเกินไปจะทำให้ Pattern สายอากาศอิ่มตัว (Pattern Blurring) การเพิ่ม Attenuation จะช่วยคืนความคมชัดของทิศทาง"
  },
  {
    "id": 15,
    "chapter": "บทที่ 4 · Multipath / Reflection",
    "question": "ในการ Manual Homing ถ้า Point A ได้ bearing 80° แต่ย้ายไป Point B แล้วได้ 230° ทั้งที่ source อยู่กับที่ สิ่งที่ควรสงสัยมากที่สุดคืออะไร?",
    "options": [
      {
        "text": "Battery เต็มเกินไป",
        "correct": false
      },
      {
        "text": "Source เคลื่อนที่แน่นอน",
        "correct": false
      },
      {
        "text": "Multipath / Reflection",
        "correct": true
      },
      {
        "text": "Frequency ต่ำเกินไป",
        "correct": false
      }
    ],
    "rationale": "การที่มุม Bearing กลับทิศทางผิดธรรมชาติ มักเกิดจากคลื่นสะท้อนกับอาคาร โครงสร้างเหล็ก หรือสิ่งปลูกสร้าง (Multipath) ทำให้ชี้เข้าหาเงาสะท้อนแทนที่จะเป็นแหล่งจริง"
  },
  {
    "id": 16,
    "chapter": "บทที่ 6 · Automatic DF vs Monitoring",
    "question": "Monitoring รับสัญญาณได้ชัด แต่ Automatic DF ไม่ขึ้น Bearing ข้อใดเป็นสาเหตุที่เป็นไปได้?",
    "options": [
      {
        "text": "แปลว่า PR200 เสียแน่นอน",
        "correct": false
      },
      {
        "text": "DF bandwidth ไม่เหมาะ, SNR ไม่พอ, signal สั้นเกิน หรือ multipath",
        "correct": true
      },
      {
        "text": "Monitoring รับได้ แปลว่า DF ต้องได้เสมอ",
        "correct": false
      },
      {
        "text": "แปลว่า Antenna ขาด",
        "correct": false
      }
    ],
    "rationale": "Monitoring ต้องการแค่ระดับพลังงาน แต่ Automatic DF (Correlative Interferometer) ต้องการ Phase Coherence ระหว่าง Element หลายตัว หากแบนด์วิดท์ไม่ตรง หรือมีคลื่นสะท้อนซ้อนทับ ระบบจะไม่สามารถคำนวณ AoA ได้"
  },
  {
    "id": 17,
    "chapter": "บทที่ 6 · VHF vs UHF Bearing",
    "question": "ถ้า 530 MHz ให้ Bearing เสถียร แต่ 138 MHz ให้ Bearing แกว่งมาก ควรสรุปอย่างไร?",
    "options": [
      {
        "text": "530 MHz เป็นความถี่มาตรฐานกว่า",
        "correct": false
      },
      {
        "text": "ระบบ DF เสียทั้งชุดแน่นอน",
        "correct": false
      },
      {
        "text": "138 MHz ใช้ DF ไม่ได้เสมอ",
        "correct": false
      },
      {
        "text": "ต้องตรวจ band-specific antenna path, environment และ multipath เพิ่ม",
        "correct": true
      }
    ],
    "rationale": "การที่ 530 MHz ผ่านยืนยันว่าระบบประมวลผล CS-DF ทำงานได้ ปัญหาที่ 138 MHz จึงเป็น Low-band specific เช่น โมดูลสายอากาศย่านต่ำ คลื่นสะท้อน VHF หรือ FM Overload"
  },
  {
    "id": 18,
    "chapter": "บทที่ 5 · Harmonics",
    "question": "Signal ที่ 100 MHz มี peak เพิ่มที่ 200 MHz และ 300 MHz พร้อม timing สัมพันธ์กัน ควรสงสัยอะไร?",
    "options": [
      {
        "text": "Thermal noise",
        "correct": false
      },
      {
        "text": "Harmonic",
        "correct": true
      },
      {
        "text": "GPS error",
        "correct": false
      },
      {
        "text": "Audio distortion",
        "correct": false
      }
    ],
    "rationale": "ยอดสัญญาณที่เกิดขึ้นที่ความถี่ทวีคูณจำนวนเต็ม (2f_0 = 200 MHz, 3f_0 = 300 MHz) คือ Harmonic distortion จากเครื่องส่งหรือภาคขยาย"
  },
  {
    "id": 19,
    "chapter": "บทที่ 5 · Intermodulation",
    "question": "หากมี transmitter แรงที่ 150 MHz และ 160 MHz แล้วพบ signal ที่ 140 MHz ซึ่งหายไปอย่างมากเมื่อเพิ่ม ATT ควรสงสัยอะไร?",
    "options": [
      {
        "text": "GPS drift",
        "correct": false
      },
      {
        "text": "True transmitter ที่ 140 MHz แน่นอน",
        "correct": false
      },
      {
        "text": "Receiver-generated intermodulation",
        "correct": true
      },
      {
        "text": "Cable loss",
        "correct": false
      }
    ],
    "rationale": "สูตร Third-order IMD: 2f_1 - f_2 = 2(150) - 160 = 140 MHz และการที่สัญญาณลดฮวบผิดสัดส่วนเมื่อเพิ่ม ATT เป็นข้อบ่งชี้สนับสนุนว่ามีโอกาสสูงที่จะเป็น Receiver-generated Intermodulation ภายในเครื่องรับเอง"
  },
  {
    "id": 20,
    "chapter": "บทที่ 6 · Controlled Isolation",
    "question": "หลังจากหา source ได้ว่าอยู่ใกล้ Rack C วิธีพิสูจน์ต้นเหตุที่น่าเชื่อถือที่สุดคืออะไร?",
    "options": [
      {
        "text": "ดูเฉพาะ peak สูงสุดครั้งเดียว",
        "correct": false
      },
      {
        "text": "ใช้การทดสอบควบคุม เช่น isolate/ปิดอุปกรณ์ตาม procedure ที่ได้รับอนุญาต แล้วดูว่า interference หายและกลับมาเมื่อเปิดใหม่หรือไม่",
        "correct": true
      },
      {
        "text": "เลือกอุปกรณ์ที่ร้อนที่สุด",
        "correct": false
      },
      {
        "text": "ดูว่าอุปกรณ์นั้นเก่าที่สุด",
        "correct": false
      }
    ],
    "rationale": "การพิสูจน์ทางวิศวกรรมที่น่าเชื่อถือที่สุดคือ 'Controlled Isolation' โดยประสานงานกับผู้ดูแลระบบเพื่อขออนุญาตปลดหรือดับอุปกรณ์ทีละตัวตามระเบียบความปลอดภัย แล้วสังเกตว่าคลื่นรบกวนดับและติดสอดคล้องกันหรือไม่ (ห้ามสั่งปิดหรือตัดระบบจริงโดยไม่ได้รับอนุญาตเด็ดขาด)"
  }
];

function initComprehensiveExam() {

  // Mode switch tabs (Google Form vs Practice Exam)
  const tabBtnGoogleForm = document.getElementById('tabBtnGoogleForm');
  const tabBtnPracticeExam = document.getElementById('tabBtnPracticeExam');
  const panelGoogleForm = document.getElementById('panelGoogleForm');
  const panelPracticeExam = document.getElementById('panelPracticeExam');

  if (tabBtnGoogleForm && tabBtnPracticeExam && panelGoogleForm && panelPracticeExam) {
    tabBtnGoogleForm.addEventListener('click', () => {
      tabBtnGoogleForm.classList.add('active');
      tabBtnPracticeExam.classList.remove('active');
      panelGoogleForm.style.display = 'block';
      panelPracticeExam.style.display = 'none';
    });

    tabBtnPracticeExam.addEventListener('click', () => {
      tabBtnPracticeExam.classList.add('active');
      tabBtnGoogleForm.classList.remove('active');
      panelGoogleForm.style.display = 'none';
      panelPracticeExam.style.display = 'block';
    });
  }

  // Google Forms Privacy Consent Gate Handler
  const btnLoadGoogleForm = document.getElementById('btnLoadGoogleForm');
  const googleFormConsentGate = document.getElementById('googleFormConsentGate');
  const googleFormEmbedWrapper = document.getElementById('googleFormEmbedWrapper');
  const googleFormIframe = document.getElementById('googleFormIframe');

  if (btnLoadGoogleForm && googleFormConsentGate && googleFormEmbedWrapper && googleFormIframe) {
    btnLoadGoogleForm.addEventListener('click', () => {
      googleFormConsentGate.style.display = 'none';
      googleFormEmbedWrapper.style.display = 'block';
      if (!googleFormIframe.src && googleFormIframe.dataset.src) {
        googleFormIframe.src = googleFormIframe.dataset.src;
      }
    });
  }

  const container = document.getElementById('comprehensiveExamContainer');
  const btnSubmit = document.getElementById('btnSubmitExam');
  const btnReset = document.getElementById('btnResetExam');
  const resultCard = document.getElementById('examResultCard');

  if (!container) return;

  // Render question cards with ARIA Radiogroup & Radio pattern
  container.innerHTML = '';
  examQuestions.forEach((q, qIndex) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'question-block';
    qDiv.id = `exam-q-${q.id}`;

    let optionsHtml = '';
    q.options.forEach((opt, optIdx) => {
      optionsHtml += `
        <button type="button" class="option-btn" role="radio" aria-checked="false" data-qid="${q.id}" data-optidx="${optIdx}">
          <span class="option-radio"></span>
          <span>${opt.text}</span>
        </button>
      `;
    });

    qDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="section-eyebrow" style="font-size: 11px;">ข้อที่ ${qIndex + 1} / ${examQuestions.length} · ${q.chapter}</span>
      </div>
      <div class="question-text" id="exam-q-${q.id}-label">${q.question}</div>
      <div class="options-grid" role="radiogroup" aria-labelledby="exam-q-${q.id}-label">
        ${optionsHtml}
      </div>
      <div class="quiz-feedback-box" id="feedback-q-${q.id}"></div>
    `;

    container.appendChild(qDiv);
  });

  // Track answers
  const userAnswers = {};

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.option-btn');
    if (!btn) return;

    const qid = parseInt(btn.getAttribute('data-qid'));
    const optIdx = parseInt(btn.getAttribute('data-optidx'));

    // Deselect siblings and update aria-checked
    const parentGrid = btn.parentElement;
    parentGrid.querySelectorAll('.option-btn').forEach(b => {
      b.classList.remove('selected');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-checked', 'true');

    userAnswers[qid] = optIdx;
  });

  // Submit button
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      // P0-05 Check: Ensure all questions are answered before scoring
      const answeredKeys = Object.keys(userAnswers);
      const liveAnnouncer = document.getElementById('examLiveAnnouncer');

      if (answeredKeys.length < examQuestions.length) {
        let firstUnanswered = null;
        examQuestions.forEach(q => {
          const userChoice = userAnswers[q.id];
          const feedbackEl = document.getElementById(`feedback-q-${q.id}`);
          if (userChoice === undefined) {
            if (!firstUnanswered) firstUnanswered = q;
            if (feedbackEl) {
              feedbackEl.className = 'quiz-feedback-box show error';
              feedbackEl.innerText = '⚠️ ยังไม่ได้เลือกคำตอบ กรุณาตอบข้อนี้ก่อนส่งตรวจคะแนน';
            }
          }
        });

        const alertMsg = `⚠️ กรุณาตอบคำถามให้ครบทั้ง 20 ข้อก่อนส่งตรวจคะแนน\n(ขณะนี้ตอบแล้ว ${answeredKeys.length} / ${examQuestions.length} ข้อ — เหลืออีก ${examQuestions.length - answeredKeys.length} ข้อ)`;
        if (liveAnnouncer) {
          liveAnnouncer.textContent = alertMsg;
        }
        alert(alertMsg);
        
        if (firstUnanswered) {
          const qBlock = document.getElementById(`exam-q-${firstUnanswered.id}`);
          if (qBlock) {
            qBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
            qBlock.style.outline = '2px solid var(--accent-rose)';
            qBlock.style.borderRadius = '8px';
            setTimeout(() => { qBlock.style.outline = 'none'; }, 2500);
          }
        }
        return;
      }

      let score = 0;
      examQuestions.forEach(q => {
        const userChoice = userAnswers[q.id];
        const feedbackEl = document.getElementById(`feedback-q-${q.id}`);
        const qBlock = document.getElementById(`exam-q-${q.id}`);
        const optionButtons = qBlock.querySelectorAll('.option-btn');

        if (userChoice !== undefined) {
          const isCorrect = q.options[userChoice].correct;
          if (isCorrect) score++;

          // Mark buttons
          optionButtons.forEach((b, idx) => {
            if (q.options[idx].correct) b.classList.add('correct');
            else if (idx === userChoice && !isCorrect) b.classList.add('incorrect');
          });

          // Show feedback
          if (feedbackEl) {
            feedbackEl.className = isCorrect ? 'quiz-feedback-box show success' : 'quiz-feedback-box show error';
            feedbackEl.innerHTML = `
              <strong>${isCorrect ? '✓ ถูกต้องสมบูรณ์' : '❌ ยังไม่ถูกต้อง'}</strong><br>
              ${q.rationale}
            `;
          }
        }
      });

      // Display Final Summary Score Card
      if (resultCard) {
        resultCard.style.display = 'block';
        const percent = Math.round((score / examQuestions.length) * 100);
        let statusBadge = percent >= 80 
          ? '🌟 ผ่านเกณฑ์การประเมินภาคสนาม (Passed ≥ 80%)' 
          : (percent >= 60 ? '✓ ผ่านเกณฑ์พื้นฐาน (Passed ≥ 60%)' : '⚠️ ควรทบทวนเนื้อหาเพิ่มเติม (Score < 60%)');
        
        resultCard.innerHTML = `
          <div style="text-align: center; display: flex; flex-direction: column; gap: 12px; padding: 24px; background: rgba(20,20,27,0.9); border: 1px solid var(--border-glass); border-radius: var(--radius-md);">
            <div style="font-size: 15px; font-family: var(--font-mono); color: var(--accent-amber); font-weight: 700;">${statusBadge}</div>
            <div style="font-size: 48px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono);">${score} / ${examQuestions.length}</div>
            <div style="font-size: 15px; color: var(--text-secondary); line-height: 1.6;">
              คิดเป็นคะแนนความถูกต้อง ${percent}% ตามเกณฑ์การประเมินประจำหลักสูตรภาคสนาม R&S PR200
              <br><small style="color: var(--text-muted); font-size: 12.5px;">(เกณฑ์ผ่านการประเมินภาคสนามคือ 80% ขึ้นไป หรือตอบถูกอย่างน้อย 16 จาก 20 ข้อ)</small>
            </div>
          </div>
        `;
        if (liveAnnouncer) {
          liveAnnouncer.textContent = `ประเมินผลเสร็จสิ้น ได้คะแนน ${score} จาก 20 ข้อ (${percent}%) ${statusBadge}`;
        }
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Reset button
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      container.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('selected', 'correct', 'incorrect');
        b.setAttribute('aria-checked', 'false');
      });
      container.querySelectorAll('.quiz-feedback-box').forEach(fb => {
        fb.className = 'quiz-feedback-box';
        fb.innerHTML = '';
      });
      if (resultCard) resultCard.style.display = 'none';
      for (const k in userAnswers) delete userAnswers[k];
    });
  }
}
