/**
 * PR200 Field Guide — Central Technical Data & Claims Registry (P1-01)
 * 
 * ทุกค่าทางเทคนิคที่ปรากฏบนเว็บไซต์ได้รับการบันทึกแหล่งอ้างอิง สถานะ และเงื่อนไขการวัด
 * เพื่อป้องกันข้อมูลขัดแย้งและยึดถือมาตรฐานเอกสารทางการของ Rohde & Schwarz
 */

const PR200_TECHNICAL_REGISTRY = {
  // 1. Frequency & Tuning Specs
  frequencyRange: {
    id: 'pr200.freq.range',
    standardMin: '8 kHz',
    standardMax: '8 GHz',
    extendedMax: '33 GHz (with directional antenna HE800-DC30)',
    source: 'R&S PR200 Product Brochure (5216.4540.12 v11.00)',
    status: 'VERIFIED — MANUFACTURER'
  },

  // 2. Real-Time Bandwidth (RTBW)
  rtbw: {
    id: 'pr200.rtbw.max',
    maxRtbw: '40 MHz',
    note: 'Real-time analysis without blind spots within the selected window',
    source: 'R&S PR200 Fact Sheet (3609.4232.32 v01.20)',
    status: 'VERIFIED — MANUFACTURER'
  },

  // 3. Panorama Scan Speed
  pscanSpeed: {
    id: 'pr200.pscan.max_speed',
    speedValue: 60,
    unit: 'GHz/s',
    condition: '@ 1 MHz scan resolution',
    displayString: 'สูงสุด 60 GHz/s (@ 1 MHz resolution)',
    source: 'R&S PR200 Product Brochure, p. 4',
    status: 'VERIFIED — MANUFACTURER'
  },

  // 4. Battery Specification
  battery: {
    id: 'pr200.battery.spec',
    capacity: '6.4 Ah',
    operatingTimeTyp: 'typ. 3.5 h',
    chemistry: 'Lithium-Ion',
    displayString: 'Li-Ion 6.4 Ah (ใช้งานต่อเนื่อง typ. 3.5 ชม.)',
    conditionNote: 'เวลาใช้งานจริงขึ้นอยู่กับ configuration, options ที่เปิดใช้งาน, อุณหภูมิ, ความสว่างหน้าจอ และสภาพแบตเตอรี่',
    source: 'R&S PR200 Fact Sheet (3609.4232.32 v01.20)',
    status: 'VERIFIED — MANUFACTURER'
  },

  // 5. Weight & Dimensions
  dimensions: {
    id: 'pr200.physical.dimensions',
    weight: '3.5 kg (including battery)',
    dimensionsMm: '192 mm × 320 mm × 62 mm',
    screenSize: '6.5" color VGA LCD',
    source: 'R&S PR200 Fact Sheet',
    status: 'VERIFIED — MANUFACTURER'
  },

  // 6. Direction Finding Options
  options: {
    csDf: {
      code: 'R&S®CS-DF',
      name: 'Direction Finding Option',
      capability: 'Wideband DF up to 40 MHz RTBW with supported DF antennas (e.g. ADD107/ADD207)',
      source: 'R&S PR200 Product Brochure, p. 9',
      status: 'VERIFIED — MANUFACTURER'
    },
    csMap: {
      code: 'R&S®CS-MAP',
      name: 'Mapping and Geolocation Option',
      capability: 'Offline OpenStreetMap display, triangulated AoA cuts, and field heatmap overlay',
      source: 'R&S PR200 Product Brochure, p. 11',
      status: 'VERIFIED — MANUFACTURER'
    },
    csPc: {
      code: 'R&S®CS-PC',
      name: 'Polychrome Spectrum Option',
      capability: 'Color-coded occurrence distribution for burst and intermittent signals',
      source: 'R&S PR200 Fact Sheet',
      status: 'VERIFIED — MANUFACTURER'
    },
    csZs: {
      code: 'R&S®CS-ZS',
      name: 'Gated Spectrum Option',
      capability: 'Time-domain analysis, pulse duration (Ton), duty cycle, and TDD synchronization',
      source: 'R&S PR200 Fact Sheet',
      status: 'VERIFIED — MANUFACTURER'
    }
  },

  // 7. HE400 Handle Trigger Protocol
  he400Trigger: {
    id: 'he400.handle.trigger_protocol',
    singleClick: 'Run / Pause การกวาดวัดในโหมด HSCAN / Homing',
    doubleClick: 'บันทึกตำแหน่งพิกัด (Position), ไดอะแกรมทิศทาง (Polar diagram) และค่าระดับการวัด (Measurements)',
    source: 'PR200 & HE400 Training Manual (NBTC Field Course), p. 48',
    status: 'TRAINING SOURCE'
  },

  // 8. Factory Reset Safety Protocol
  factoryReset: {
    id: 'pr200.safety.factory_reset',
    triggerAction: 'กดปุ่ม Power ค้าง 4 วินาทีขณะเปิดเครื่อง (Power-on)',
    deletedData: [
      'Memory List (ตารางความถี่ที่บันทึกไว้ทั้งหมด)',
      'Positions List (รายการพิกัดแบริ่งและ GPS ที่บันทึกภาคสนาม)',
      'Suppress List (รายการความถี่ที่สั่งข้ามในการสแกน)'
    ],
    defaultSoftkeys: 'F1: Edit, F2: Receiver (แอปอื่นๆ บน F3–F6 จะถูกลบออกจนกว่าจะคอนฟิกใหม่)',
    prerequisiteSteps: '1. Export lists ไปยัง External Storage ผ่านเมนู Manage -> 2. ตรวจสอบไฟล์สำรอง -> 3. ได้รับอนุมัติก่อนทำ',
    source: 'PR200 Hardware Introduction & Operating Reference',
    status: 'TRAINING SOURCE'
  },

  // 9. MobileLocator LOB Processing
  mobileLocator: {
    id: 'pr200.mobile_locator.algorithm',
    description: 'รวบรวม Line of Bearing (LOB) หลายร้อยผลต่อนาที และใช้การวิเคราะห์เชิงสถิติ (Statistical Analysis) คัดกรองผลที่ไม่เกี่ยวข้องและลดผลสะท้อน Multipath',
    source: 'R&S PR200 MobileLocator Product Overview',
    status: 'VERIFIED — MANUFACTURER'
  }
};

if (typeof window !== 'undefined') {
  window.PR200_TECHNICAL_REGISTRY = PR200_TECHNICAL_REGISTRY;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PR200_TECHNICAL_REGISTRY;
}
