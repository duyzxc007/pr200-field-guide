# PR200 Field Guide - Website Audit and Improvement Plan

วันที่ตรวจ: 22 กันยายน 2026  
ขอบเขต: ตรวจโค้ด, เนื้อหา, กราฟจำลอง, Desktop 1920 x 855, Mobile 390 x 844, keyboard, แบบทดสอบ และเอกสารอ้างอิง  
สถานะ: แผนเพื่ออนุมัติก่อนแก้เว็บไซต์ ยังไม่ได้แก้ไฟล์เว็บไซต์

## 1. ข้อสรุป

เว็บไซต์มี Visual identity ชัด โครงสร้าง 6 บท + แบบทดสอบครอบคลุม Receiver, PScan, HE400, Signal Analysis และ Automatic DF และมี simulator ที่ช่วยให้เข้าใจแนวคิดได้ดีกว่าคู่มือข้อความล้วน

ยังไม่พร้อมใช้เป็นคู่มือหน้างานหรือเผยแพร่ในฐานะเนื้อหาที่ผ่านการตรวจสอบ เนื่องจากพบข้อผิดพลาดที่มองเห็นได้จริง, คำอธิบายที่ฟันธงเกินหลักฐาน, ตัวเลขจำลองที่ไม่มีที่มา และคำว่า Official/มาตรฐาน/ยืนยัน/ทางกฎหมายที่ทำให้ผู้เรียนเข้าใจระดับความน่าเชื่อถือผิด

แนวทางหลักคือเปลี่ยนเว็บจาก "บทความยาวที่มี simulator" เป็น "ระบบเรียน 3 ชั้น":

1. Learn - อธิบายหลักการด้วยภาพที่อ่านง่าย
2. Simulate - ให้ลองเปลี่ยนค่า โดยติดป้ายชัดว่าเป็นข้อมูลจำลอง
3. Field Procedure - ขั้นตอนหน้างานที่แยกสิ่งที่ตรวจแล้ว, ข้อสันนิษฐาน และสิ่งที่ต้องได้รับอนุญาตก่อน Test/Restart/Write

## 2. สิ่งที่ยืนยันแล้ว

### ข้อมูลผลิตภัณฑ์

- PR200 ตรวจจับ/วิเคราะห์สัญญาณช่วง 8 kHz ถึง 8 GHz; ขยายช่วงได้ด้วยอุปกรณ์ downconverter ที่รองรับ
- Real-time bandwidth และ demodulation bandwidth สูงสุด 40 MHz
- Panorama Scan สูงสุด 60 GHz/s เป็นค่าสูงสุดที่มีเงื่อนไขด้าน resolution; หน้าเปรียบเทียบผลิตภัณฑ์ R&S ระบุ 60 GHz/s ที่ 1 MHz resolution
- CS-PS, CS-PC, CS-ZS, CS-DF, CS-MAP, CS-IR, CS-IQ, CS-MM และ CS-SPM เป็น software options ไม่ควรเขียนให้เหมือนมีอยู่ใน PR200 ทุกเครื่อง
- โบรชัวร์ PR200 รุ่นที่ตรวจระบุ Automatic AoA DF 20 MHz ถึง 6 GHz เมื่อใช้ compact ADDx07 DF antennas; ต้องแยกจากช่วง manual homing ของ HE400/HE400DC/HE800 และตรวจรุ่นสายอากาศจริงก่อนระบุช่วง

### ฮาร์ดแวร์จากเอกสารฝึกอบรมในโฟลเดอร์

- หน้า 6 ของ `1. PR200 Hardware Introduction_HE400LP.pdf` แสดง RF input, Aux 1 ODU MINI-SNAP, headphone 3.5 mm, function keys และ rotary controls
- เอกสารระบุ RF input ว่าเชื่อมต่อ Snap-N ได้ จึงไม่ควรเรียกตัวพอร์ตว่า "Snap-N female" โดยไม่มีคู่มือสเปกยืนยัน; ให้ใช้คำว่า N-type RF input compatible with Snap-N quick connector ตามภาพฝึกอบรม
- หน้า 7 แสดง Test Out (IF output), Ref in/out 10 MHz, GNSS, 1 Gbit Ethernet และ USB 2.0
- หน้า 7 ยืนยัน I/Q stream สูงสุด 1 MHz demodulation bandwidth ทาง Ethernet แต่ไม่ได้ยืนยันข้อความ "USB-A/C" หรือ Test Out = 10.7 MHz ที่เขียนอยู่บนเว็บ

### การวัด Occupied Bandwidth

- ITU-R SM.443-4 รองรับทั้ง beta-percent method และ x-dB method
- ค่า beta/2 ปกติเป็น 0.5% ต่อข้าง หรือรวมพลังงานภายใน 99% หากไม่มีข้อกำหนดอื่น
- ขั้นตอนวัดมีเงื่อนไขสำคัญที่เว็บยังขาด: span ประมาณ 1.5-2 เท่าของ bandwidth ที่คาด, RBW ต่ำกว่า 3% ของ span, VBW อย่างน้อย 3 เท่าของ RBW, S/N มากกว่า 30 dB และเลือก detector/trace ให้เหมาะกับชนิดสัญญาณ

## 3. ผลตรวจเว็บไซต์จริง

### P0 - ต้องแก้ก่อนนำไปสอนจริง

| ID | ปัญหาและหลักฐาน | ผลกระทบ | วิธีแก้ |
|---|---|---|---|
| P0-01 | Zero Span บทที่ 5 แสดงกล่องดำ บน Desktop และ Mobile; `zeroSpanCanvas.width = 0` ขณะที่ CSS width 696/291 px. จุดเกี่ยวข้อง `js/simulators.js:703-723`, `index.html:1664-1665` | บทหลักใช้งานไม่ได้ | ใช้ `ResizeObserver` ผูกกับ container ที่มองเห็น; resize หลังเปลี่ยนบทใน animation frame; ไม่วาดเมื่อ width/height เป็น 0; เพิ่ม empty/error state |
| P0-02 | หน้าเว็บจับคู่ "60 GHz/s" กับ preset `RBW 10 kHz` ที่ `js/app.js:216-228` และใช้ 60 GHz/s แบบไม่มีเงื่อนไขหลายจุด | ทำให้เข้าใจสมรรถนะผิด | แสดง "สูงสุด 60 GHz/s @ 1 MHz resolution" ทุกจุดที่อ้างค่าสูงสุด; preset 10 kHz ต้องใช้ข้อความ "ความเร็วขึ้นกับ resolution/ช่วงสแกน" จนกว่าจะมีตารางสเปกยืนยัน |
| P0-03 | เครื่องคำนวณ Scan Resolution สร้าง POI 100/92/55/15% และ scalloping loss แบบตายตัวที่ `js/simulators.js:2084-2103` โดยไม่มีแบบจำลองเวลาสัญญาณ, dwell, revisit หรือแหล่งอ้างอิง | ตัวเลขดูเป็นผลวัดจริงแต่เป็นค่าที่แต่งขึ้น | เอาเปอร์เซ็นต์ออกทันที หรือเปลี่ยนชื่อเป็น "ตัวอย่างเชิงคุณภาพ"; ถ้าต้องการ POI จริง ต้องกำหนด signal duration, scan cycle, dwell, detector และสมมติฐานพร้อมสูตร/แหล่งอ้างอิง |
| P0-04 | ATT test ถูกเขียนว่า peak ลด 10 dB = สัญญาณจริง และ peak หาย = intermod; มีคำว่า "ยืนยันได้" ที่ `index.html:540, 1928, 1984` และ rationale ข้อสอบ `js/app.js:525-544, 861-880` | เสี่ยง false positive/false negative และส่งคนไปผิดจุด | เปลี่ยนเป็น "หลักฐานสนับสนุน/ข้อบ่งชี้"; ต้องยืนยันร่วมกับ repeatability, input level, preselector, antenna disconnect/termination ที่ถูกวิธี, เครื่องรับอีกตัว และ controlled isolation ที่ได้รับอนุญาต |
| P0-05 | แบบทดสอบเมื่อยังไม่ตอบ แสดง 0/20 และข้อความ "ตามมาตรฐานการใช้งาน R&S"; ตรวจจริงพบ 20 error + ผล 0/20. จุดเกี่ยวข้อง `js/app.js:988-1038` | ประเมินผู้เรียนผิดและอ้างมาตรฐานเกินจริง | ห้าม submit จนตอบครบ; แจ้งจำนวนข้อที่ยังไม่ตอบและ focus ข้อแรก; ใช้ "เกณฑ์หลักสูตรนี้" แทน "มาตรฐาน R&S"; ไม่ใช้ Expert Proficiency หากไม่มีระบบรับรอง |
| P0-06 | หน้าเดียวกันเรียกข้อสอบ 10 ข้อใน sidebar แต่มีจริง 20 ข้อ; `js/app.js:167-172` เทียบกับ `index.html:2405-2474` | ความน่าเชื่อถือลดลง | ใช้ค่าจาก `examQuestions.length` ทุกตำแหน่ง |
| P0-07 | Google Form ถูกเรียกว่า Official และมีลิงก์ `/edit` ชื่อ "แก้ไขฟอร์ม (Admin)" ในเว็บผู้เรียน; iframe ไม่มี `title` | ทำให้เข้าใจว่าเป็นข้อสอบทางการของ R&S และเปิดเผยทางเข้าหน้าจัดการโดยไม่จำเป็น | เปลี่ยนเป็น "แบบทดสอบของหลักสูตร" พร้อมเจ้าของ/เวอร์ชัน; ลบ admin edit link จากหน้าเผยแพร่; เพิ่ม iframe title และ privacy/offline notice |
| P0-08 | ตารางฮาร์ดแวร์มีคำที่ยังยืนยันไม่ได้: `Snap-N female`, `USB-A/C`, Test Out `10.7 MHz` ที่ `index.html:250-276` | ผู้เรียนอาจต่ออุปกรณ์ผิดหรือจำสเปกผิด | แก้ตามเอกสารหน้า 6-7; ข้อมูลที่ยังไม่มีคู่มือสเปกให้ติดป้าย "ต้องตรวจรุ่น/คู่มือ" แทนการระบุค่าตายตัว |
| P0-09 | เนื้อหา Record/IQ เรียกว่า "หลักฐานทางกฎหมาย" ที่ `index.html:224` | ไฟล์บันทึกอย่างเดียวไม่พิสูจน์ chain of custody หรือการยอมรับทางกฎหมาย | เปลี่ยนเป็น "หลักฐานประกอบการวิเคราะห์/รายงาน" และเพิ่ม metadata, timestamp, calibration, operator, location และ file hash หากต้องการ audit trail |
| P0-10 | Controlled isolation/ปิดอุปกรณ์ปรากฏในข้อสอบ แม้โจทย์กล่าวว่าได้รับอนุญาต แต่หลาย workflow ไม่มี guardrail ชัด | เสี่ยงนำไปใช้กับระบบจริงโดยไม่ได้รับอนุญาต | เพิ่ม banner ถาวรใน Field Procedure: เริ่ม Read-only; Test/Restart/Disconnect/Write/Flash/Config ต้องได้รับอนุญาตและมี rollback; ค่าที่อ่านไม่ได้ต้องคง/ระบุว่าไม่ทราบ |

### P1 - ควรแก้เพื่อให้เป็นเว็บสอนที่ใช้งานได้ดี

| ID | ปัญหาและหลักฐาน | วิธีแก้ |
|---|---|---|
| P1-01 | บน Mobile 390 px header แสดง preset ถูกตัด, tone/status หายออกนอกพื้นที่ และ roadmap กว้าง 1620 px | ทำ mobile header 2 แถว; ซ่อน preset ไว้ในเมนู; เปลี่ยน roadmap เป็น chapter selector + Previous/Next; scrollbar ใช้เฉพาะเป็น fallback |
| P1-02 | Mobile แสดง sidebar ทุกหัวข้อสูงประมาณ 413 px ก่อนเข้าเนื้อหา | เปลี่ยนเป็น dropdown/accordion "หัวข้อในบท" และ sticky Previous/Next lesson bar |
| P1-03 | มีข้อความ 11 px จำนวนมาก และ `--text-muted #64748B` บน `#14141B` มี contrast ประมาณ 3.85:1 | Mobile body/control ขั้นต่ำ 14-16 px; ปรับ muted ให้ contrast อย่างน้อย 4.5:1; เป้าหมาย touch 44 x 44 px |
| P1-04 | Canvas ทั้ง 8 ตัวไม่มี role, aria-label, fallback text หรือ data table | ใช้ `<figure>` + `<figcaption>`; SVG สำหรับแกน/label/annotation; Canvas เฉพาะ dense waterfall; เพิ่ม summary/table ที่ screen reader อ่านได้ |
| P1-05 | HE400 และ Auto DF canvas backing 380 x 380 ถูกยืดเป็น 532 x 532 บน Desktop | ตั้ง backing store ตาม CSS size x devicePixelRatio และ redraw เมื่อ container เปลี่ยนขนาด เพื่อให้เส้น/ตัวอักษรไม่เบลอ |
| P1-06 | มี animation loop อย่างน้อย 5 ชุดและวาดต่อแม้ chapter ถูกซ่อน; ไม่มี `prefers-reduced-motion` | pause loop ด้วย IntersectionObserver/chapter state; resume เฉพาะกราฟที่เห็น; reduced-motion ใช้ static frame; ยกเลิก timer ตอน page hidden |
| P1-07 | หน้าโหลดทุก 6 บท, 19 ตาราง, 114 ปุ่ม, 2,183 DOM nodes และมี inline styles 443 จุด | แยก chapter data/components; lazy render เฉพาะบทที่เปิด; ย้าย inline styles ไป component classes/tokens |
| P1-08 | URL ไม่บันทึก chapter/lesson/control state; Back/Forward และ share link ใช้ไม่ได้ | ใช้ `?chapter=2&lesson=spectrum&mode=burst&span=400`; sync History API; state ที่ผิดให้ fallback ปลอดภัย |
| P1-09 | selected states ของ tabs/segmented controls ไม่มี `aria-selected`/`aria-pressed`; ไม่มี skip link | ใช้ tab semantics หรือ button `aria-pressed`; เพิ่ม skip-to-content; กำหนด focus-visible ให้สม่ำเสมอ |
| P1-10 | ฟอนต์มาจาก Google Fonts; Google Form ต้องออนไลน์ | self-host WOFF2 หรือใช้ local fallbacks; เพิ่ม Offline lesson/quiz; แจ้งชัดว่า Google Form ต้องต่ออินเทอร์เน็ตและอาจส่งข้อมูลไป Google |
| P1-11 | เว็บไม่มี `<img>` แม้โจทย์ต้องการภาพเครื่องและจุดควบคุมที่ชัดเจน; เนื้อหา hardware เป็นตารางล้วน | ใช้ภาพจริงจากคู่มือ/ภาพที่ได้รับสิทธิ์ ทำ hotspot overlay แบบ HTML/SVG; ห้ามใช้ AI วาดตำแหน่งพอร์ตหรือปุ่มเพื่อสอน |
| P1-12 | เนื้อหายาวและความสำคัญเท่ากันเกือบทุกย่อหน้า | ทำ progressive disclosure: Goal, What to look for, Try it, Interpretation, Caveat, Field checklist, Source |

## 4. แผน Visualization ที่ถูกต้องกว่า

งานวิเคราะห์หลักคือ explanatory visualization ของ Spectrum, Waterfall, Time Domain และ bearing ไม่ใช่ dashboard สด

### Renderer ownership

- Spectrum/Zero Span: SVG หรือ Observable Plot/D3-SVG เพื่อให้แกน หน่วย marker และ annotation คมและเข้าถึงได้
- Waterfall/Polychrome: Canvas2D เพราะมี dense pixels และ redraw บ่อย
- Polar/triangulation: SVG เพื่อให้ bearing lines, confidence, label และ keyboard selection อ่านได้
- Fallback: ภาพ static + ตารางค่าหลักเมื่อ Canvas/SVG ใช้ไม่ได้หรือ reduced motion เปิดอยู่

### Encoding contract

- แกน Y Spectrum: Level (dBm) เมื่อเป็นระดับอ้างอิง; ใช้ dB เฉพาะค่าผลต่าง
- แกน X: Frequency พร้อม unit และ span ที่ตรงกับค่าจริง
- Waterfall: Frequency แนวนอน, Time ไหลลงด้านล่าง, color scale มี label และ numeric anchors
- Amber = target/selected, cyan = comparison/history, rose = warning, green = verified/pass; อย่าใช้สีอย่างเดียว ต้องมี label/pattern
- ค่าจำลองทุกชุดต้องมี badge "SIMULATED" พร้อม scenario assumptions
- ใช้ deterministic seed เพื่อให้ภาพและข้อสอบ reproduce ได้; ไม่ใช้ `Math.random()` เป็นหลักฐานวัด

### Reading path

1. Insight title เช่น "สัญญาณอยู่ที่ 138.125 MHz และมาเป็นช่วง"
2. ภาพหลักพร้อม direct labels
3. ค่าที่อ่านได้: center, peak, noise floor, delta, bandwidth, timing
4. วิธีตีความ
5. สิ่งที่สรุปไม่ได้จากภาพนี้
6. แหล่งอ้างอิงและเงื่อนไขการวัด

## 5. ลูกเล่นที่ควรเพิ่ม

### P2-A: Scenario Lab

- Scenario: Continuous carrier, burst, overload suspect, adjacent channel, hopping, multipath
- มีปุ่ม "Reset scenario" และ seed คงที่
- หลังปรับค่า แสดง Observation ก่อน Interpretation
- แยกสถานะ Verified / Likely / Inconclusive

### P2-B: Hardware Hotspots

- ภาพจริง PR200 ด้านบน/ด้านข้าง และ HE400
- กด hotspot เพื่อเปิดชื่อพอร์ต, หน้าที่, connector, safety limit และแหล่งอ้างอิง
- Mobile ใช้รายการเรียงใต้ภาพ; ไม่บังคับ hover

### P2-C: Compare Mode

- Normal เทียบ Max Hold
- Wide Span เทียบ Narrow Span
- RBW ใหญ่เทียบ RBW เล็ก โดยล็อกสมมติฐาน noise reference
- External signal suspect เทียบ receiver-generated artifact โดยใช้คำว่า likelihood ไม่ใช่ proof

### P2-D: Field Sheet

- แบบฟอร์ม Local-only: frequency, span, RBW, detector, ATT, antenna, level, noise, timing, GPS optional, observation และ conclusion confidence
- Export JSON/CSV/PDF โดยไม่ส่งออกอินเทอร์เน็ต
- แยก "ค่าที่วัด", "การตีความ", "สิ่งที่ยังตรวจไม่ได้"

### P2-E: Progress and Review

- เก็บ progress ใน localStorage พร้อมปุ่ม Reset
- แสดง objective ก่อนบทและ competency หลังบท
- แบบทดสอบเฉลยหลังตอบครบหรือกดตรวจรายข้อ; ไม่มีข้อความรับรองระดับเชี่ยวชาญ
- เพิ่ม glossary ไทย/อังกฤษ: Span, RBW, Demod BW, ATT, detector, OBW, SNR, DF quality

### P2-F: Offline Field Pack

- ทำ PWA/cache สำหรับ 6 บท, simulator และแบบทดสอบภายใน
- Google Form เป็นทางเลือกออนไลน์ ไม่ใช่เส้นทางหลัก
- แสดง version/date ของเนื้อหาและเอกสารอ้างอิงที่ใช้ตรวจ

## 6. แผนดำเนินงาน

### Phase 0 - Content freeze และ Evidence Matrix

ผลลัพธ์:

- inventory ทุก claim ที่มีตัวเลข/option/range/standard
- สถานะ `verified`, `training-source only`, `hypothesis`, `needs manual`
- source ID และวันที่ตรวจในแต่ละ claim
- copy ที่ห้ามใช้จนกว่าจะมีหลักฐาน: official, certified, legal evidence, 100% POI, ยืนยันได้, ต้อง/เสมอ/แน่นอน

เกณฑ์ผ่าน: ไม่มีตัวเลขสำคัญที่ไม่มี source หรือ badge ว่าเป็น simulation

### Phase 1 - Correctness and Safety Patch

ไฟล์หลัก: `index.html`, `js/app.js`, `js/simulators.js`

- แก้ 60 GHz/s ให้มีเงื่อนไข 1 MHz resolution
- ลบ POI/scalloping percentage ที่ไม่มีฐาน
- ลดระดับภาษาสรุป ATT/intermod
- แก้ connector/port wording
- เพิ่ม option/license notice ต่อฟังก์ชัน
- เพิ่ม measurement-condition box ใน OBW
- แก้ exam 10/20, unanswered handling, official/standard/certification wording
- ลบ admin edit link และเพิ่ม Google Form privacy notice
- เพิ่ม field-system authorization guardrail

เกณฑ์ผ่าน: ผู้ตรวจเนื้อหาสามารถ trace ทุก claim ไปยัง R&S/ITU/เอกสารฝึกอบรม และไม่มีคำสั่งเปลี่ยนระบบจริงโดยไม่เตือนเรื่องอนุญาต

### Phase 2 - Functional Repair and Architecture

ไฟล์ที่เสนอ:

```text
src/
  content/chapters/*.js
  content/sources.js
  components/AppShell.js
  components/LessonNav.js
  components/SourceNote.js
  visualizations/SpectrumChart.js
  visualizations/WaterfallCanvas.js
  visualizations/PolarChart.js
  visualizations/TriangulationChart.js
  state/urlState.js
  styles/tokens.css
```

- แก้ Zero Span ด้วย ResizeObserver
- แก้ high-DPI canvas
- pause hidden animations
- แยก content/data/renderer ออกจาก HTML
- ทำ URL state และ predictable reset
- ใช้ shared component แทน inline style 443 จุด

เกณฑ์ผ่าน: ทุก simulator เปิดครั้งแรกได้, สลับบทซ้ำได้, resize ได้ และไม่มี canvas width 0

### Phase 3 - Responsive and Accessibility

- Mobile header/menu ใหม่
- chapter/lesson selector แทน sidebar ยาว
- typography และ contrast AA
- keyboard semantics, focus, skip link
- canvas figure captions และ table fallback
- reduced motion
- iframe title และ external-service notice

เกณฑ์ผ่าน: ใช้ครบด้วย keyboard, screen reader เข้าใจค่าหลักโดยไม่เห็นกราฟ และไม่มี horizontal page overflow ที่ 390 px

### Phase 4 - Learning Features

- Scenario Lab
- Hardware hotspots จากภาพจริงที่ได้รับสิทธิ์
- Compare Mode
- Field Sheet export
- progress/glossary/offline pack

เกณฑ์ผ่าน: ผู้เรียนทำ flow Detect -> Verify -> Characterize -> Direction -> Locate -> Record ได้ โดยทุกขั้นแยก observation กับ conclusion

### Phase 5 - Verification

Browser matrix:

- Desktop 1920 x 1080 และ 1366 x 768
- Tablet 768 x 1024
- Mobile 390 x 844 และ 360 x 800
- Chrome/Edge อย่างน้อย

Test paths:

1. เปิดเว็บใหม่ -> บท 1 -> บท 2 -> burst -> span/ATT/RBW
2. PScan -> gated spectrum -> candidate -> receiver
3. HE400 -> polarization -> multipath -> triangulation
4. Zero Span ทุก profile -> ATT -> metrics
5. Auto DF -> multipath -> diagnosis
6. Exam: ยังตอบไม่ครบ, ตอบครบ, reset, reload
7. Offline: content ภายในยังอ่านได้; Google Form แสดงข้อจำกัดชัด

Visual QA:

- เปรียบเทียบกับ `design/01-homepage.png`, `design/02-lesson-desktop.png`, `design/03-lesson-mobile.png`
- ตรวจ copy, hierarchy, palette, type scale, spacing, container model, graph labels และ mobile order
- ใช้ deterministic screenshot; ห้าม random noise ทำให้ visual regression เปลี่ยนทุกครั้ง

## 7. Acceptance Criteria

- ไม่มีข้อความ factual ที่ไม่มี source/status
- ไม่มี "live" บนข้อมูลจำลอง
- ไม่มีคำว่า official/certified/legal evidence ถ้าไม่มีสถานะรองรับ
- 60 GHz/s มีเงื่อนไข resolution ทุกครั้ง
- Manual homing, Automatic AoA DF และช่วงของ antenna แต่ละรุ่นถูกแยกชัด
- ทุก simulator แสดงผลหลังเปิดบทโดยไม่ต้อง resize browser
- ค่าบน graph, annotation, summary และ quiz ใช้ data object ชุดเดียวกัน
- Essential values ไม่ต้อง hover
- Mobile control แตะง่ายและเนื้อหาหลักมาก่อน navigation รายการยาว
- WCAG AA สำหรับข้อความและ focus; Canvas มี text alternative
- แบบทดสอบไม่ให้ผล 0/20 หากยังตอบไม่ครบ และไม่อ้างการรับรองที่ไม่มีจริง
- Hidden animation หยุดทำงาน; reduced motion มี static fallback
- ไม่มี admin edit link หรือข้อมูลจัดการระบบในหน้า learner
- Test/Restart/Disconnect/Write/Flash/Config มี authorization gate ชัดเจน

## 8. สิ่งที่ยังตรวจไม่ได้

- Firmware version และ option licenses ของ PR200 เครื่องจริง
- คู่มือผู้ใช้ฉบับเต็มที่ยืนยัน Test Out frequency, connector naming และ input limits ทุก operating mode
- สิทธิ์นำภาพ R&S จาก PDF ไปเผยแพร่สู่สาธารณะ
- Google Form เป็นแบบทดสอบที่หน่วยงานรับรองหรือเป็นแบบทดสอบภายในของผู้จัดทำ
- ค่า acceptance เช่น bearing error <= 3 degrees RMS และ DF Quality threshold ที่เหมาะกับ antenna/configuration จริง

ข้อมูลเหล่านี้ต้องระบุเป็น unknown จนกว่าจะมี controlling document หรือผลตรวจเครื่องจริง

## 9. แหล่งข้อมูลที่ใช้ตรวจ

- Local: `1. PR200 Hardware Introduction_HE400LP.pdf`, หน้า 3, 6, 7, 20
- Local: `2. PR200 Apps_NBTC.pdf`, หน้า 2-3 และหัวข้อ PScan/Polychrome/FScan ที่ค้นได้
- R&S PR200 product page: https://www.rohde-schwarz.com/ca/products/aerospace-defense-security/handheld/rs-pr200-portable-monitoring-receiver_63493-594881.html
- R&S PR200 fact sheet: https://scdn.rohde-schwarz.com/ur/pws/dl_downloads/pdm/cl_brochures_and_datasheets/fact_sheet/3609_4232_32/PR200_Fact_sheet_3609-4232-32_v01.20.pdf
- R&S receiver comparison, scan speed condition: https://www.rohde-schwarz.com/nl/products/aerospace-defense-security/receivers-and-direction-finders_63723.html
- ITU-R SM.443-4: https://www.itu.int/rec/R-REC-SM.443
- ITU-R SM.328: https://www.itu.int/rec/R-REC-SM.328

## 10. ลำดับอนุมัติที่แนะนำ

อนุมัติให้แก้ P0 ก่อนเป็นชุดเดียว แล้วตรวจเนื้อหาและ browser ซ้ำ จากนั้นจึงทำ P1 architecture/responsive/accessibility และเลือก P2 เฉพาะลูกเล่นที่ต้องการจริง การเพิ่มลูกเล่นก่อนแก้ความถูกต้องจะทำให้ข้อผิดพลาดกระจายไปหลาย component และแก้แพงขึ้น
