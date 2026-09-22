# PR200 Field Guide — แผนตรวจสอบและปรับปรุง รอบที่ 2

วันที่ตรวจ: 22 กันยายน 2026  
สถานะ: ตรวจซ้ำหลังมีการแก้ไขจากรอบแรก  
ขอบเขต: Source code, เนื้อหาเชิงเทคนิค, Simulator, Desktop 1920 × 911, Mobile 390 × 844, Keyboard/Accessibility, แบบทดสอบ และการโหลด Google Forms  
ข้อจำกัด: เอกสารนี้เป็นแผนก่อนแก้ไข ยังไม่ได้แก้ไฟล์เว็บไซต์

## 1. ข้อสรุปสำหรับตัดสินใจ

เว็บไซต์ดีขึ้นชัดเจนและแก้ปัญหาเร่งด่วนจากรอบแรกได้หลายรายการ โดยเฉพาะ Zero Span, เงื่อนไข 60 GHz/s, การป้องกันส่งข้อสอบไม่ครบ, ข้อความ ATT/Intermod บางส่วน, การแก้ข้อมูลพอร์ต และคำอธิบาย Canvas

ยังไม่ควรเผยแพร่ในฐานะคู่มือหน้างานที่ผ่านการตรวจรับ เพราะมีข้อความเก่าที่ยังขัดกับข้อความใหม่, ตัวเลขจำลองบางชุดดูเหมือนค่าที่พิสูจน์แล้ว, เนื้อหา Automatic DF ขยายเกินเงื่อนไขของระบบจริง, Google Form ถูกโหลดทันทีพร้อมบริบทบัญชีผู้ใช้ และ Mobile ยังมีส่วนกราฟ/Navigation ถูกตัด

ลำดับที่ควรทำต่อ:

1. ปิดงานความถูกต้องที่ยังค้างและรวมข้อความเทคนิคไว้ในแหล่งเดียว
2. ทำป้ายและสัญญาสำหรับข้อมูลจำลองทุกกราฟ
3. แก้ Mobile, Accessibility และการโหลด Google Form
4. ลดภาระหน้าเดียวและหยุด Animation ของบทที่ซ่อน
5. เพิ่มภาพอุปกรณ์จริงหรือภาพเวกเตอร์เชิงอธิบายที่มีแหล่งที่มา

## 2. สิ่งที่ทดสอบจริงในรอบนี้

- เปิดเว็บไซต์จริงที่ `http://localhost:8080/` ด้วย Chrome
- ทดสอบเปลี่ยนครบ 6 บทและหน้าแบบทดสอบ
- ทดสอบ Desktop 1920 × 911 และ Mobile 390 × 844
- ตรวจ Zero Span หลังเปิดบทที่ 5: Desktop `696 × 240`, Mobile `299 × 240` แสดงผลได้แล้ว
- ตรวจ Automatic DF บน Mobile: backing canvas `398 × 398` แต่พื้นที่เนื้อหาแคบกว่า ทำให้ขอบขวาของกราฟและข้อความบางส่วนถูกตัด
- ทดสอบส่งข้อสอบภายในโดยยังไม่ตอบ: ระบบไม่แสดงผลคะแนน, แสดงข้อความผิดพลาดสำหรับข้อที่ยังไม่ตอบ และพาไปข้อแรก
- ตรวจ DOM จริง: 2,803 elements, 134 buttons, 22 tables, 10 canvases, 662 elements ที่ใช้ inline style และไม่มี `<img>`
- ตรวจ Console: ไม่พบ error จากหน้าเว็บ; warning ที่พบมาจาก browser extension ไม่ใช่โค้ด PR200
- ตรวจโค้ดและเอกสารฝึกอบรม PDF ที่อยู่ในโครงการ
- ตรวจข้อมูลผลิตภัณฑ์กับหน้า R&S และวิธีวัด OBW กับ ITU-R SM.443-4

## 3. สถานะเทียบแผนรอบแรก

| รายการรอบแรก | สถานะรอบสอง | หลักฐานปัจจุบัน | งานที่เหลือ |
|---|---|---|---|
| Zero Span เป็นกล่องดำ | แก้แล้ว | `ResizeObserver` และ resize เมื่อแสดงบท; Canvas มีขนาดจริงทั้ง Desktop/Mobile | เพิ่ม reduced-motion และ fallback summary |
| 60 GHz/s ไม่มีเงื่อนไข | แก้เกือบครบ | Hero, Preset และบทเรียนระบุ `@ 1 MHz resolution` | รวมข้อความไว้ใน claim dictionary ป้องกันข้อความใหม่หลุดเงื่อนไข |
| POI/Scalloping เป็นเปอร์เซ็นต์แต่ง | แก้บางส่วน | ถอดเปอร์เซ็นต์ POI เดิมและเพิ่มคำเตือน qualitative | ยังมีช่วง `0.5–1.5 dB`, `3–6 dB`, `>6 dB` และคำอธิบาย FFT/Sampling ที่ไม่มีแบบจำลองหรือแหล่งอ้างอิง |
| ATT test ฟันธง Intermod | แก้บางส่วน | บทละเอียดและเฉลยข้อสอบใช้คำว่า “ข้อบ่งชี้สนับสนุน” | ตาราง “กฎข้อที่ 6” ยังระบุ `ลด 10 dB = สัญญาณจริง; หาย = Intermod` |
| ส่งข้อสอบว่างแล้วได้ 0/20 | แก้แล้ว | ไม่สร้าง score card จนตอบครบ; แสดงข้อที่ขาด | เปลี่ยน alert เป็นข้อความในหน้าและประกาศผ่าน live region |
| Sidebar ระบุ 10 แต่จริง 20 ข้อ | แก้แล้ว | Sidebar และปุ่มระบุ 20 ข้อ | ดึงจำนวนจาก `examQuestions.length` เพื่อกันข้อมูลไม่ตรงในอนาคต |
| Google Form มีลิงก์ `/edit` และ iframe ไม่มี title | แก้ส่วนสำคัญแล้ว | ไม่มี `/edit`; iframe มี `title`; มี offline/privacy notice | ยังใช้คำว่า “Google Forms ทางการ” และ iframe โหลดทันทีแม้ผู้ใช้ไม่เปิดหน้าแบบทดสอบ |
| Connector/พอร์ตคลุมเครือ | แก้แล้วบางส่วน | RF IN เป็น N-type compatible with Snap-N; Test Out ไม่ฟันธง 10.7 MHz; USB เป็น USB 2.0 | ทำ footnote อ้างหน้าเอกสารและแยกค่าที่เป็น training-source จาก product specification |
| “หลักฐานทางกฎหมาย” | แก้ข้อความหลักแล้ว | เปลี่ยนเป็นหลักฐานประกอบการวิเคราะห์/Technical Audit Trail | ชื่อ preset `06_LEGAL_RECORD` และบาง workflow ยังสื่อความหมายเชิงกฎหมายเกินหลักฐาน |
| Guardrail ระบบจริง | แก้แล้ว | มี Read-only banner และระบุว่าการ Test/Restart/Disconnect/Write ต้องได้รับอนุญาต | แสดง guardrail ซ้ำก่อน Scenario ที่เกี่ยวกับ isolation ไม่พึ่งข้อความบทแรกเพียงจุดเดียว |
| Contrast muted ต่ำ | แก้แล้ว | `--text-muted` เปลี่ยนเป็น `#94A3B8` | ตัวอักษร 10–11 px ยังเล็กเกินไปหลายจุด |
| Canvas ไม่มีชื่อ | แก้บางส่วน | Canvas ทั้ง 10 มี `role="img"` และ `aria-label` | ไม่มี fallback text, caption, data summary หรือคำอธิบายค่าที่เปลี่ยนตามการโต้ตอบ |
| Canvas HE400/Auto DF เบลอ | แก้แล้วบน Desktop | ใช้ `devicePixelRatio` และ ResizeObserver กับกราฟหลัก | ตรวจ DPR 2 และแก้ Auto DF บน Mobile ที่กว้างเกิน container |
| Mobile header/sidebar สูงเกินไป | ดีขึ้น | Header แบ่งแถว; Sidebar จำกัดสูงสุด 220 px | Preset ยังถูกตัด, roadmap เป็นแนวนอนยาว 1,473 px และ canvas บางตัวถูก crop |

## 4. ปัญหา P0 ที่ยังต้องแก้ก่อนใช้สอนจริง

### P0-01 — ข้อความ ATT/Intermod ขัดกันภายในเว็บ

ข้อความละเอียดและข้อสอบแก้เป็น “ข้อบ่งชี้สนับสนุน” แล้ว แต่ `index.html` ในตารางกฎข้อที่ 6 ยังสรุปว่า:

> ยอดลด 10 dB = สัญญาณจริง; ยอดหาย = Intermod ในเครื่อง

ข้อสรุปนี้ฟันธงเกินข้อมูล เพราะผลขึ้นกับ order ของ intermodulation, gain compression, ATT placement, preselector, detector, noise floor และระดับสัญญาณขาเข้า

วิธีแก้:

- ใช้ข้อความกลางเดียวกันทุกบท: “การตอบสนองผิดสัดส่วนหลังเพิ่ม ATT เป็นหลักฐานสนับสนุน Receiver overload/IMD แต่ยังไม่ใช่ข้อพิสูจน์”
- เพิ่มขั้นทวนสอบ: ทำซ้ำ, ตรวจ input level, เปิด preselector/filter, เปลี่ยน antenna/termination อย่างปลอดภัย, เทียบเครื่องรับอีกตัว และ controlled isolation ที่ได้รับอนุญาต
- สร้าง `content/claims.js` หรือ JSON กลางสำหรับข้อความนี้ เพื่อไม่ให้ตารางและข้อสอบแยกเวอร์ชันกันอีก

### P0-02 — Scan Resolution Calculator ยังแสดงตัวเลขที่ไม่มีฐาน

`js/simulators.js:2455-2471` ยังแสดง Scalloping/Amplitude dip `0.5–1.5 dB`, `3–6 dB`, `>6 dB` จากอัตราส่วน Scan Resolution ต่อ Signal Bandwidth และอ้าง “หลัก Sampling/FFT bin”

ปัญหา:

- PScan resolution ของเครื่องไม่ควรถูกอธิบายเป็น FFT bin แบบทั่วไปโดยไม่มีสถาปัตยกรรม/หน้าต่าง/ฟิลเตอร์จากผู้ผลิต
- ค่า amplitude error ไม่ได้ตามมาจาก ratio เพียงตัวเดียว
- Pulse detection ต้องใช้ duration, revisit/sweep cycle, detector และ timing เพิ่มเติม

วิธีแก้ที่แนะนำ:

- รอบนี้ให้ตัดตัวเลข dB ทั้งหมดออก
- เปลี่ยนผลเป็น `ละเอียดกว่า / ใกล้เคียง / หยาบกว่า bandwidth เป้าหมาย`
- แสดง Trade-off เฉพาะเชิงคุณภาพ: resolution, scan time และโอกาสมองข้ามสัญญาณสั้น
- หากต้องการตัวเลข ให้สร้างแบบจำลองที่ระบุสมมติฐานและมีเอกสารอ้างอิงเฉพาะ PR200

### P0-03 — “100% POI” ใช้คนละความหมายกับ “100% Time”

ยังพบชื่อเมนูและหัวข้อ `Polychrome Spectrum & 100% POI` แต่เอกสารฝึกอบรมอธิบายพารามิเตอร์ `100% Time` สำหรับ Color Occurrence Display ไม่ใช่การรับประกัน Probability of Intercept 100%

วิธีแก้:

- เปลี่ยนหัวข้อเป็น `Polychrome Spectrum & 100% Time`
- ใช้คำว่า “Occurrence density / ความถี่การปรากฏของระดับสัญญาณ”
- ห้ามใช้ `100% POI` จนกว่าจะมีสเปกที่ระบุ signal duration และ probability conditions
- แยกคำศัพท์ใน Glossary: `100% Time`, `Occurrence`, `POI`

### P0-04 — Automatic DF ใช้ค่าจำลองเหมือนเกณฑ์รับรอง

หน้าเว็บแสดง `DF Quality 92%`, `Stable ±1°`, `1°–3° RMS` และ Acceptance `|True-Meas| ≤ 3° RMS` โดยบางจุดไม่ได้ระบุว่าเป็น scenario สมมติ

ข้อเท็จจริงจาก brochure คือความแม่นยำระบบแบบ typical 1°–3° RMS ขึ้นกับรุ่นสายอากาศและย่านความถี่ ไม่ใช่เกณฑ์ Acceptance สากลสำหรับทุกการติดตั้ง

วิธีแก้:

- เปลี่ยน `Acceptance Test` เป็น `ตัวอย่าง Verification Worksheet`
- ให้ผู้ใช้กรอก tolerance ตาม TOR/คู่มือ/รุ่น antenna ที่ควบคุมงานจริง
- ใส่รุ่นและช่วงความถี่ให้ครบ เช่น ADD107/ADD207/ADD307 แทนการเหมารวม `ADDx07 5-element`
- ป้ายค่าจำลองทุกตัวเป็น `SIMULATED EXAMPLE`
- Hero ต้องเขียนว่า Automatic DF ใช้ร่วมกับ CS-DF และ compact DF antenna ที่รองรับ

### P0-05 — คำว่า “ทางการ/มาตรฐาน/กฎหมาย” ยังหลงเหลือ

จุดสำคัญ:

- `Google Forms ทางการ`
- preset `06_LEGAL_RECORD`
- `เกณฑ์การประเมินประจำหลักสูตรภาคสนาม R&S PR200`
- ข้อความที่ทำให้เข้าใจว่า 80% เป็นมาตรฐานจากผู้ผลิต

วิธีแก้:

- ใช้ `แบบทดสอบของสื่อการสอนชุดนี้`
- ใช้ `06_TECHNICAL_RECORD`
- ใช้ `เกณฑ์ที่ผู้จัดทำหลักสูตรกำหนด` พร้อมชื่อเวอร์ชันและวันที่
- แยก “บันทึกประกอบรายงาน” ออกจากหลักฐานที่มี chain of custody

### P0-06 — Google Form โหลดข้อมูลบุคคลที่สามก่อนผู้ใช้เลือก

iframe มี `src` ตั้งแต่โหลดหน้า จึงเชื่อมต่อ Google แม้ผู้ใช้กำลังอ่านบทอื่น และอาจแสดงบริบทบัญชี Google ที่ล็อกอินอยู่บนอุปกรณ์นั้น

วิธีแก้:

- เริ่ม iframe ด้วย `src="about:blank"` หรือไม่มี `src`
- แสดง Privacy/Network gate ก่อนโหลด
- ตั้ง `src` หลังผู้ใช้เลือก “โหลด Google Form” เท่านั้น
- ใช้ Local Practice เป็นแท็บเริ่มต้นสำหรับเครื่องหน้างาน/เครื่องอบรมร่วมกัน
- เพิ่ม `loading="lazy"` และพิจารณา `referrerpolicy`

### P0-07 — เนื้อหาตัวเลขใหม่ต้องผ่าน Source Matrix

ตัวเลขที่ควรผูกแหล่งอ้างอิงรายข้อความ:

- เวลาใช้งานแบตเตอรี่ 3.5–4 ชั่วโมงและเงื่อนไข
- SDHC/SDXC และ filesystem
- Cross-polarization loss ~18 dB
- FScan 2,000 channels/s
- DF squelch/quality percentage
- Bearing stability ±1°
- DF accuracy 1°–3° RMS ตาม antenna/frequency/configuration
- Raw I/Q 40 MHz แบบ internal record เทียบกับ LAN streaming 1 MHz

ใช้สถานะ `manufacturer verified`, `training material`, `simulation assumption`, `needs manual` และแสดง footnote เฉพาะจุด

## 5. ปัญหา P1 ด้าน UX, Mobile และ Accessibility

### P1-01 — Mobile navigation ยังต้องเลื่อนและตัดข้อความ

ผลตรวจ 390 px:

- Header สูงประมาณ 126 px
- Preset select ถูกตัดข้อความ
- Roadmap viewport 347 px แต่เนื้อหากว้าง 1,473 px
- ปุ่ม roadmap สูง 32 px ต่ำกว่าเป้าหมาย touch 44 px
- ปุ่ม Exam และบทข้างเคียงถูกตัดครึ่งเมื่อ active item อยู่ท้ายแถว

วิธีแก้:

- Mobile ใช้ `<select>` หรือ Chapter Drawer เป็นตัวเลือกหลัก
- เพิ่ม Previous/Next chapter แบบ 44 px
- หากคง horizontal roadmap ให้ auto-scroll active item เข้ากึ่งกลางและมี fade/arrow บอกว่ายังเลื่อนได้
- Preset ใช้ label สั้นใน header และเปิดรายละเอียดใน bottom sheet

### P1-02 — Sidebar Mobile ยังเป็นกล่อง scroll ซ้อน

Sidebar ลดเหลือ 220 px แล้ว แต่เป็น nested scroll ก่อนเข้าบท ทำให้ gesture สับสนและกินพื้นที่

วิธีแก้:

- แสดงหัวข้อปัจจุบันหนึ่งบรรทัดพร้อมปุ่ม “หัวข้อทั้งหมด”
- เปิดเป็น accordion/drawer
- Sticky lesson Previous/Next ด้านล่าง
- ใช้ scroll-margin-top กับ anchor เพื่อไม่ให้หัวข้อถูก roadmap บัง

### P1-03 — Automatic DF และกราฟบางตัวถูก crop บน Mobile

Auto DF canvas มี CSS/backing width 398 px ใน viewport content ประมาณ 351 px ขอบขวาและ label ถูกตัด

วิธีแก้:

- คำนวณขนาดจาก `min(container.clientWidth, maxSize)` โดยไม่บังคับ minimum 300/398 ที่ใหญ่กว่า container
- ย้าย legend และ instruction ออกจาก canvas เป็น HTML
- ลด label รอบ polar plot บนจอแคบ หรือใช้ responsive label layer
- ทดสอบ 320, 360, 390, 768 px

### P1-04 — ตัวอักษรและ Touch target ยังเล็ก

ยังมีข้อความ 10–11 px ใน simulator controls, metrics และ legends รวมถึงปุ่มหลายจุดต่ำกว่า 44 px

วิธีแก้:

- เนื้อหาปกติขั้นต่ำ 14 px บน Mobile
- Legend/metadata ขั้นต่ำ 12 px เมื่อไม่ใช่ interaction
- Controls และ links ขั้นต่ำ 44 × 44 px
- ใช้ CSS class แทน inline font-size เพื่อควบคุม breakpoint ได้จริง

### P1-05 — ARIA ยังไม่สื่อสถานะ

สิ่งที่ดีขึ้น: Canvas มีชื่อและ iframe มี title

สิ่งที่ยังขาด:

- Roadmap active ไม่มี `aria-current` หรือ `aria-pressed`
- Google/Practice selector ไม่มี `role="tablist"`, `role="tab"`, `aria-selected`
- Exam option ไม่มี `aria-pressed`
- Canvas ไม่มีข้อความ fallback หรือ summary ของค่าปัจจุบัน
- ไม่มี skip link
- พบ select/range อย่างน้อย 8 ตัวที่ไม่มี label ผูกด้วย `for`

วิธีแก้:

- ใช้ semantic tabs พร้อม ArrowLeft/ArrowRight
- option button ใช้ `aria-pressed` หรือ native radio fieldset/legend
- เพิ่ม `<figure><figcaption>` และ `<dl>` สรุปค่าที่อัปเดต
- เพิ่ม `aria-live="polite"` สำหรับผล simulator และข้อความข้อสอบไม่ครบ
- เพิ่ม skip-to-content และ focus management หลังเปลี่ยนบท

### P1-06 — ไม่มี Reduced Motion และ Animation ยังทำงานหลาย loop

พบ `requestAnimationFrame` อย่างน้อย 6 loop และยังใช้ `Math.random()` หลายจุด ไม่มี `prefers-reduced-motion`, `visibilitychange` หรือ cancel lifecycle ที่ครบถ้วน

วิธีแก้:

- มี Scheduler กลางหนึ่งชุดแทนแต่ละ class เปิด loop ของตัวเอง
- pause เมื่อ chapter ถูกซ่อน, tab ไม่ visible หรือ canvas นอก viewport
- reduced-motion วาด static frame และอัปเดตเมื่อผู้ใช้เปลี่ยน control เท่านั้น
- ใช้ seeded PRNG ต่อ scenario เพื่อให้ผู้สอนและผู้เรียนเห็นผลที่ทำซ้ำได้

### P1-07 — หน้าเดียวใหญ่ขึ้นและดูแลยากขึ้น

เทียบรอบแรก:

- `index.html` จากประมาณ 213 KB เป็น 298 KB
- DOM จาก 2,183 เป็น 2,803 nodes
- buttons จาก 114 เป็น 134
- tables จาก 19 เป็น 22
- inline-style elements จาก 443 เป็น 662
- `simulators.js` จากประมาณ 76 KB เป็น 125 KB

วิธีแก้:

- แยก content data ออกจาก markup
- render เฉพาะบทที่เปิดหรือ lazy mount simulator
- สร้าง component classes/tokens สำหรับ control bar, metric card, alert และ chart frame
- แยก simulator เป็น modules เพื่อหยุด/ทำลาย instance ได้

### P1-08 — URL และสถานะบทเรียนยัง share ไม่ได้

การเปลี่ยนบทใช้ `display:none/block` และ smooth scroll แต่ไม่เปลี่ยน URL

วิธีแก้:

- ใช้ `?chapter=5&lesson=zero-span&scenario=radar`
- รองรับ Back/Forward
- validate query ก่อนใช้และ fallback ไปบท 1
- เก็บ progress/last lesson ใน localStorage โดยมีปุ่ม Reset

## 6. แผนภาพและสื่อประกอบ

เว็บไซต์ยังไม่มี `<img>` แม้โครงการมีภาพ concept ในโฟลเดอร์ `design/` และโจทย์ต้องการภาพบรรยายที่ชัดเจน

แนวทางภาพแบบมืออาชีพที่ไม่ดูเป็นรูปตัดแปะ:

### Hardware anatomy

- ใช้ภาพ PR200/HE400 ที่ได้รับอนุญาตเพียงภาพหลักต่อ section
- วาง SVG hotspot และ leader lines บนภาพเดียว
- ใช้ gradient fade ให้ภาพกลืนกับพื้น Obsidian
- Mobile เปลี่ยน hotspot เป็นรายการหมายเลขใต้ภาพ
- ห้ามสร้างตำแหน่งพอร์ตหรือปุ่มด้วย AI เพราะอาจคลาดเคลื่อนจากฮาร์ดแวร์จริง

### Spectrum และ Time Domain

- SVG รับผิดชอบแกน, marker, unit, annotation และ focus target
- Canvas ใช้เฉพาะ waterfall/polychrome pixels
- แสดง Insight title ก่อนกราฟ เช่น “Burst เกิดทุก 100 ms”
- แสดง “สิ่งที่ภาพนี้บอกได้” และ “สิ่งที่ยังสรุปไม่ได้”

### Polar และ Triangulation

- ย้าย legend ออกจาก Canvas
- ใช้ SVG bearing lines เพื่ออ่านด้วย keyboard/screen reader
- แสดง uncertainty sector แทนเส้นแม่นยำจุดเดียว
- แยก Multipath outlier ออกจาก bearing ที่ใช้คำนวณ

### Simulation contract

ทุก simulator ต้องมี:

1. Badge `SIMULATED — NOT LIVE RF DATA`
2. Scenario assumptions
3. Seed/Reset
4. Observation
5. Interpretation พร้อมระดับ `Likely / Inconclusive`
6. สิ่งที่ต้องตรวจเพิ่มในเครื่องจริง
7. Source/Reference

## 7. แผนดำเนินงานที่แนะนำ

### Phase A — Content consistency patch

ไฟล์: `index.html`, `js/app.js`, `js/simulators.js`

- แก้ ATT rule ที่ยังฟันธง
- เปลี่ยน 100% POI เป็น 100% Time
- เอาตัวเลข dB ที่แต่งออกจาก Scan calculator
- เปลี่ยน Official/Legal/มาตรฐานเป็นถ้อยคำของหลักสูตร
- แก้ DF typical accuracy ไม่ให้เป็น universal acceptance
- เพิ่ม Source Matrix และ simulation badge
- รวมข้อความซ้ำไว้ใน data source เดียว

เกณฑ์ผ่าน:

- ค้นไม่พบ `100% POI`, `LEGAL_RECORD`, `Google Forms ทางการ`
- ไม่มีข้อความ `ยอดลด 10 dB = สัญญาณจริง` หรือ `ยอดหาย = Intermod`
- ทุกตัวเลขสำคัญมี source status

### Phase B — Privacy, Exam และ Accessibility

- Local Practice เป็นค่าเริ่มต้น
- Lazy-load Google Form หลังผู้ใช้ยืนยันการเปิด
- ทำ semantic tabs/radios และสถานะ ARIA
- ใช้ inline validation แทน alert
- เพิ่ม skip link, live region, figure caption และ data summary
- ผูก label กับทุก select/range

เกณฑ์ผ่าน:

- เปิดบทอื่นแล้วไม่มี request ไป Google Forms
- Keyboard ทำข้อสอบและเปลี่ยน tab ได้ครบ
- Screen reader รับรู้ selected state และผลการเปลี่ยน control

### Phase C — Responsive navigation และ chart layout

- Chapter selector + Previous/Next บน Mobile
- Lesson drawer แทน nested sidebar scroll
- Auto-center active chapter
- แก้ Auto DF/polar/legend ไม่ให้ถูก crop
- ปรับ type scale และ touch targets

เกณฑ์ผ่าน:

- 320, 360, 390, 768, 1024, 1440 px ไม่มี content สำคัญถูกตัด
- ไม่มี interactive target ต่ำกว่า 44 × 44 px บน Mobile
- ไม่มี horizontal scroll ที่ผู้ใช้ไม่เห็น affordance

### Phase D — Visualization lifecycle และ performance

- Scheduler กลางและ pause hidden canvases
- reduced-motion static mode
- seeded random
- lazy mount simulator ตาม chapter
- ย้าย inline styles ไป reusable classes
- self-host fonts หากต้องใช้งาน offline

เกณฑ์ผ่าน:

- บทที่ซ่อนไม่เรียก animation frame ต่อเนื่อง
- เปลี่ยนบทซ้ำ 20 รอบแล้วไม่มี listener/observer เพิ่มสะสม
- Simulator ให้ผลซ้ำได้หลัง Reset
- หน้าเนื้อหาหลักทำงานได้เมื่อออฟไลน์ ยกเว้น Google Form ที่ผู้ใช้เลือกเปิด

### Phase E — Visual production

- สร้าง Hardware anatomy 2 ชุด: PR200 และ HE400
- สร้าง SVG Spectrum/Zero Span/Polar ที่ใช้ design tokens เดียวกัน
- เพิ่ม direct labels และ source footnotes
- ใช้ภาพจริงที่มีสิทธิ์หรือ vector schematic ที่ตรวจตำแหน่งกับคู่มือแล้ว

เกณฑ์ผ่าน:

- ภาพไม่ดูเป็น collage
- ผู้เรียนระบุพอร์ต/ปุ่มสำคัญได้จากภาพเดียว
- ภาพทุกชิ้นมี alt/caption/source และ Mobile fallback

### Phase F — Release verification

- ทดสอบ Chrome และ Edge บน Desktop/Mobile viewport
- ทดสอบทุก chapter, preset, simulator control และ exam state
- ทดสอบ keyboard-only และ reduced motion
- ตรวจลิงก์ภายนอกและ offline fallback
- ตรวจ Source Matrix โดยผู้รู้ PR200 ก่อนเผยแพร่
- บันทึก version/date/source revision ที่ footer

## 8. ลำดับอนุมัติที่เหมาะสม

1. อนุมัติ Phase A ก่อน เพราะกระทบความถูกต้องของการสอน
2. ทำ Phase B และ C ในชุดเดียว เพราะเกี่ยวกับโครงสร้าง Interaction
3. ทำ Phase D ก่อนเพิ่มภาพหรือ simulator ใหม่ เพื่อไม่เพิ่มภาระหน้าเดียว
4. อนุมัติรูปอุปกรณ์และสิทธิ์การใช้งานก่อน Phase E
5. ผ่าน Phase F แล้วจึงเรียกเวอร์ชันนี้ว่า release candidate

## 9. แหล่งอ้างอิงหลัก

- Rohde & Schwarz — R&S PR200 Portable Monitoring Receiver product page
- Rohde & Schwarz — Receivers and direction finders comparison: 60 GHz/s @ 1 MHz resolution
- Rohde & Schwarz — PR200 product brochure: CS-DF + ADDx07, typical system DF accuracy 1°–3° RMS ตามระบบ/ย่านความถี่
- ITU-R SM.443-4 — Bandwidth measurement at monitoring stations
- `1. PR200 Hardware Introduction_HE400LP.pdf`
- `2. PR200 Apps_NBTC.pdf`

## 10. คำตัดสินรอบสอง

สถานะโดยรวม: **ผ่านระดับ Prototype/Training Draft แต่ยังไม่ผ่าน Content-controlled Field Guide**

จุดที่แก้แล้วควรรักษาไว้: Zero Span, 60 GHz/s condition, exam completeness guard, port wording, Read-only guardrail, iframe title, contrast และ high-DPI resize ของกราฟหลัก

จุดหยุดก่อนเพิ่มลูกเล่นใหม่: ปิด P0-01 ถึง P0-07 ให้ครบก่อน เพราะการเพิ่ม Scenario หรือ Animation ตอนนี้จะเพิ่มข้อความซ้ำและค่าจำลองที่ตรวจยากขึ้น
