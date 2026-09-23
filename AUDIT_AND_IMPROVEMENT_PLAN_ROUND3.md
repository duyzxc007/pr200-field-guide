# PR200 Field Guide — Audit & Improvement Plan รอบที่ 3

วันที่ตรวจ: 23 กันยายน 2026  
สถานะ: **ตรวจและจัดทำแผนเท่านั้น — ยังไม่ได้แก้เว็บไซต์ในรอบนี้**  
ขอบเขต: ความถูกต้องทางเทคนิค, เนื้อหาการสอน, ภาพประกอบ, UX/UI, Responsive, Accessibility, Simulator/Data Visualization, Performance และแบบทดสอบ

## 1. บทสรุปผลตรวจ

เว็บไซต์ดีขึ้นจากรอบที่ 2 อย่างชัดเจน โดยเฉพาะการใส่เงื่อนไข `60 GHz/s @ 1 MHz resolution`, การเปลี่ยน `100% POI` เป็น `100% Time`, การติดป้าย `[SIMULATED]`, การเพิ่ม Skip Link/ARIA tabs, การทำ Google Forms แบบกดโหลดภายหลัง และการเพิ่ม Interactive Front Panel ที่ใช้ภาพเครื่องจริง

อย่างไรก็ตาม **ยังไม่ควรถือว่าเนื้อหาพร้อมใช้สอนภาคสนามเต็มรูปแบบ** เพราะพบข้อผิดพลาดหรือข้อความที่อาจทำให้ผู้เรียนปฏิบัติผิด 9 กลุ่มที่จัดเป็น P0:

1. ขั้นตอน Trigger ของ HE400 สลับความหมายระหว่าง single-click และ double-click
2. Factory Reset ถูกนำเสนอเหมือนวิธีแก้เครื่องค้าง แต่ไม่เตือนว่าลบ Memory List, Positions List และ Suppress List
3. Dual VFO ถูกอธิบายเป็นตัวรับสองชุดที่เฝ้าฟังคู่ขนาน ทั้งที่เอกสารฝึกอบรมที่มีรองรับเพียง VFO A/B สำหรับตั้งและสลับความถี่
4. สเปกแบตเตอรี่ขัดกันเองระหว่าง 6.4 Ah / 3–3.5 ชั่วโมง กับ 6.7 Ah / 3.5–4 ชั่วโมง
5. ชื่อออปชัน `CS-WDF` ไม่ตรงเอกสารผู้ผลิต ซึ่งระบุ `CS-DF` สำหรับ Wideband DF สูงสุด 40 MHz RTBW
6. ภาพอธิบายฮาร์ดแวร์, HE400 และ ADDx07 จำนวน 3 ภาพเป็นภาพหน้าจอเว็บเดิม ไม่ใช่ภาพของอุปกรณ์ตาม Caption/Alt text

คะแนนประเมินรอบนี้:

| ด้าน | คะแนนรอบ 3 | เหตุผล |
|---|---:|---|
| ความถูกต้องทางเทคนิค | 6.0/10 | เนื้อหาใหม่บท 1 มีขั้นตอนผิดและค่าขัดกัน |
| ความชัดเจนเชิงการสอน | 8.0/10 | โครงสร้างและ Interactive Console ช่วยให้เรียนง่ายขึ้น |
| Visual / Professional UI | 8.2/10 | ภาพรวมดี แต่ภาพประกอบ 3 ภาพไม่ตรงเนื้อหา |
| Responsive | 7.7/10 | ไม่มี body overflow ที่ 390 px แต่ navigation และตารางยังต้องเลื่อนแนวนอน |
| Accessibility | 7.3/10 | Skip link, labels และ tab semantics ดีขึ้น แต่ roving tabindex/touch target ยังไม่ครบ |
| Simulator / Data Visualization | 7.4/10 | ป้าย Simulation ดีขึ้น แต่ยังสุ่มผลและมีค่าที่ดูเหมือนการวัดจริง |
| Performance / Maintainability | 5.6/10 | DOM และ JavaScript โตขึ้นมาก; animation loops ยัง schedule ตลอด |
| ความพร้อมเผยแพร่เพื่อสอนจริง | 6.4/10 | ต้องปิด P0 ก่อน |

> คะแนนเป็นการประเมินเพื่อจัดลำดับงาน ไม่ใช่มาตรฐานรับรองผลิตภัณฑ์

## 2. หลักฐานที่ตรวจจริง

### 2.1 โค้ดและโครงสร้างปัจจุบัน

- Git working tree สะอาดก่อนสร้างไฟล์รายงานรอบนี้
- `index.html`: 3,413 บรรทัด, ประมาณ 349 KB
- `css/styles.css`: 1,850 บรรทัด, ประมาณ 42 KB
- `js/app.js`: 1,106 บรรทัด, ประมาณ 58 KB
- `js/simulators.js`: 3,569 บรรทัด, ประมาณ 173 KB
- DOM เมื่อเปิดบทที่ 1: 3,164 elements, 171 buttons, 23 tables, 11 canvases, 724 elements ที่ใช้ inline style
- ไม่พบ ID ซ้ำ และไม่พบ form control ที่ไม่มี label จากการตรวจ DOM รอบนี้

เมื่อเทียบรอบ 2 เว็บไซต์เพิ่มประมาณ 361 DOM nodes, 37 buttons, 1 table, 1 canvas, 62 inline-style elements และ `simulators.js` โตขึ้นประมาณ 48 KB ส่วนใหญ่เกิดจาก Interactive Front Panel ใหม่

### 2.2 เบราว์เซอร์จริง

ตรวจที่ `http://localhost:8080/` บน Chrome:

- Desktop 1920 × 855: ไม่เกิด horizontal overflow ระดับ body
- Mobile 390 × 844: ไม่เกิด horizontal overflow ระดับ body
- Roadmap ใช้ horizontal scroll; บนมือถือเห็นเพียงบางแท็บและไม่มีตัวบอกชัดว่ามีรายการต่อทางขวา
- พบ interactive target เล็กกว่า 44 × 44 px จำนวน 40 จุดใน Desktop state และ 9 จุดใน Mobile Exam state
- Google Forms iframe ไม่มี `src` ตอนเริ่มต้น มีเฉพาะ `data-src` จึงยังไม่เชื่อมต่อ Google ก่อนผู้ใช้เลือก
- ไม่พบ JavaScript error จากตัวเว็บไซต์ในการทดสอบรอบนี้; warning ที่เห็นมาจาก browser extension ภายนอก
- การสลับบทและ Canvas ทำงาน แต่การคลิกอัตโนมัติขณะหน้าเลื่อนแบบ smooth อาจพลาด target ได้ ควรลด motion/ล็อกตำแหน่ง navigation ให้เสถียร

### 2.3 เอกสารที่ใช้เทียบ

เอกสารภายในโครงการ:

- `1. PR200 Hardware Introduction_HE400LP.pdf`
- `2. PR200 Apps_NBTC.pdf`

เอกสารผู้ผลิต/มาตรฐาน:

- R&S PR200 Fact Sheet
- R&S PR200 Product Brochure
- R&S Receivers and Direction Finders comparison
- R&S ADD107 product page และ Direction Finding Antennas overview
- ITU-R SM.443-4

## 3. สิ่งที่แก้ดีแล้วและยืนยันได้

| รายการ | สถานะรอบ 3 | หลักฐาน |
|---|---|---|
| เงื่อนไขความเร็ว PScan | ดีขึ้น | จุดสำคัญส่วนใหญ่เปลี่ยนเป็น `สูงสุด 60 GHz/s @ 1 MHz resolution` |
| `100% POI` | แก้แล้ว | เปลี่ยนเป็น `100% Time` และเพิ่มคำอธิบายว่าไม่ใช่ Probability of Intercept |
| ค่าจำลอง DF | แก้แล้ว | Azimuth/DF Quality ในหน้าจำลองมี `[SIMULATED]` |
| ชื่อ preset บันทึก | แก้แล้ว | `06_LEGAL_RECORD` เปลี่ยนเป็น `06_TECHNICAL_RECORD` |
| ATT/Intermod หลัก | ดีขึ้นบางส่วน | กฎหลักระบุว่าเป็นเพียงข้อบ่งชี้และต้องทวนสอบ |
| Scan Resolution calculator | ดีขึ้นมาก | JavaScript ใช้คำเชิงคุณภาพและมีหมายเหตุว่าไม่ใช่ POI model |
| Google Forms privacy | แก้แล้ว | iframe ถูก gate ด้วย `data-src` และมีคำอธิบายเรื่องข้อมูลออกภายนอก |
| Chapter tabs | ดีขึ้น | มี `role=tab`, `aria-selected`, `aria-controls`, `role=tabpanel` และ keyboard arrows |
| Reduced motion / hidden canvas | ดีขึ้นบางส่วน | หลาย simulator หยุด render เมื่อบทถูกซ่อนหรือ tab อยู่ background |
| ภาพเครื่องหน้า Interactive Front Panel | ดี | ใช้ `pr200_front_panel.jpg` ที่เป็นภาพ PR200 จริงและวาง hotspot แบบผสานกับ UI |

## 4. ประเด็น P0 — แก้ก่อนใช้สอนหรือเผยแพร่

### P0-01 HE400 Trigger ระบุการกดผิด

**พบใน:** `index.html` Workflow 06 บทที่ 1  
**ข้อความปัจจุบัน:** เหนี่ยว Trigger 1 ครั้งเพื่อบันทึก Azimuth/GPS ลงแผนที่  
**ข้อเท็จจริงจากคู่มือฝึกอบรม:** ใน HSCAN การกด 1 ครั้งใช้ Run/Pause; การกด 2 ครั้งจึงบันทึกตำแหน่ง, polar diagram และค่าการวัด

**การแก้ไข:**

- เปลี่ยนเป็น `กด 1 ครั้ง = Run/Pause` และ `กด 2 ครั้ง = Save position + polar diagram + measurements`
- แยกการใช้งาน Trigger ตามแอป/โหมด เพราะหน้าที่อาจเปลี่ยนตาม context
- เพิ่ม Badge `อ้างอิงคู่มือฝึกอบรม หน้า 48`

**เกณฑ์รับ:** ค้นทั้งโครงการแล้วไม่พบข้อความที่สอนว่า single-click บันทึก bearing/GPS โดยไม่มีเงื่อนไข

### P0-02 Factory Reset ไม่แจ้งผลกระทบด้านข้อมูล

**พบใน:** Workflow 07 และ Inspector Power  
**ความเสี่ยง:** ผู้เรียนอาจใช้ Factory Reset เพื่อแก้อาการค้างและสูญเสียรายการที่บันทึก

**ข้อเท็จจริง:** กด Power ค้าง 4 วินาทีขณะเปิดเครื่องจะคืนค่า default, ลบแอปออกจาก softkeys เหลือ Receiver ที่ F2 และลบข้อมูลใน Memory List, Positions List, Suppress List; คู่มือระบุว่าสามารถ Export รายการผ่าน Manage ก่อนทำ

**การแก้ไข:**

- เปลี่ยนหัวข้อจาก “ฉุกเฉิน” เป็น “Factory Reset — ทำเมื่อได้รับอนุญาตและสำรองข้อมูลแล้ว”
- ใส่ Warning card สีแดงพร้อมรายการข้อมูลที่ถูกลบ
- ใส่ลำดับ `Export lists → ตรวจไฟล์สำรอง → ขออนุญาต → Factory Reset → Restore/ตรวจค่า`
- ห้ามวาง Factory Reset ใน quick workflow เดียวกับ Stealth Mode โดยไม่มี warning

**เกณฑ์รับ:** ทุกจุดที่กล่าวถึง Power 4s ต้องแสดงผลกระทบและขั้นตอนสำรองก่อนเสมอ

### P0-03 Dual VFO ถูกอธิบายเกินหลักฐาน

**พบใน:** บทที่ 1 Workflow 05 และบทที่ 2 Dual VFO  
**ปัญหา:** คำว่า “ตัวรับสัญญาณจำลอง 2 ชุด”, “เฝ้าฟัง 2 คลื่นคู่ขนาน” และ “ทำงานเป็นอิสระต่อกัน” สื่อถึง simultaneous dual-receiver monitoring

**หลักฐานที่มี:** เอกสารฝึกอบรมแสดงการตั้ง Current Frequency VFO A และ VFO B และการสลับใช้งาน ยังไม่รองรับข้อสรุปว่ารับสองความถี่พร้อมกัน

**การแก้ไข:**

- ใช้คำว่า `frequency register A/B สำหรับตั้งและสลับความถี่` จนกว่าจะมี Operating Manual ยืนยันพฤติกรรมพร้อมกัน
- หากเครื่องจริงรองรับ parallel watch ให้เพิ่มชื่อ firmware/version, option และหน้าคู่มือที่ยืนยัน

**เกณฑ์รับ:** ไม่มีคำว่า “คู่ขนาน”, “สองตัวรับ” หรือ “พร้อมกัน” หากไม่มีเอกสารอ้างอิงเฉพาะรุ่น

### P0-04 สเปกแบตเตอรี่ขัดกัน

**พบใน:** Workflow 01 ใช้ 6.4 Ah / 3–3.5 h แต่ตาราง Hardware ใช้ 6.7 Ah / 3.5–4 h  
**แหล่งผู้ผลิต:** Fact Sheet ระบุ 6.4 Ah และ battery life 3.5 h

**การแก้ไข:**

- ใช้ `6.4 Ah; battery life typ. 3.5 h` เป็นค่าหลัก
- หากต้องการช่วงเวลา ให้ระบุว่าเวลาจริงขึ้นกับ configuration, options, temperature, display และ battery condition
- ตรวจหลักฐาน Hot-swap และแรงดัน/Wh แยกต่างหากก่อนเผยแพร่

**เกณฑ์รับ:** ค่าแบตเตอรี่มีแหล่งเดียวใน data object และ render ซ้ำทุกตำแหน่งจากค่าเดียวกัน

### P0-05 Option code และ Wideband DF ผิด

**พบใน:** `CS-WDF 40 MHz RTBW` ในบทที่ 6  
**แหล่งผู้ผลิต:** Product brochure ระบุ `R&S®CS-DF` ช่วยให้ Wideband DF สูงสุด 40 MHz RTBW

**การแก้ไข:**

- เปลี่ยน `CS-WDF` เป็น `CS-DF — Wideband DF up to 40 MHz RTBW`
- แยก `Monitoring RTBW` ออกจาก `DF RTBW` ให้ชัด
- เพิ่มหมายเหตุว่าความสามารถขึ้นกับ option และ antenna/system configuration

**เกณฑ์รับ:** ไม่พบ `CS-WDF` ในโค้ดและเนื้อหา เว้นแต่มีเอกสารผลิตภัณฑ์เฉพาะยืนยัน

### P0-06 ภาพประกอบ 3 ภาพไม่ตรงคำบรรยาย

**พบใน:**

- `design/pr200_ch1_hardware.png` ถูกเรียกว่า Hardware Ports diagram แต่เป็น screenshot หน้าเว็บบทที่ 1
- `design/pr200_ch4_he400.png` ถูกเรียกว่า HE400 handle anatomy แต่เป็น screenshot หน้าเว็บบทที่ 4
- `design/pr200_ch6_autodf.png` ถูกเรียกว่า ADDx07 array/vehicle mount แต่เป็น screenshot หน้าเว็บบทที่ 6

นี่เป็นปัญหาทั้งความถูกต้องและ Accessibility เพราะ Alt text บอกสิ่งที่ไม่มีในภาพ

**การแก้ไข:**

- สร้างภาพอธิบายใหม่แบบ integrated vector/technical illustration จากภาพและคู่มือที่ตรวจสิทธิ์ใช้งานแล้ว
- หากยังไม่มีภาพ ให้ลบ `<img>` ชั่วคราวและใช้ HTML/SVG diagram ที่ระบุ `[TRAINING DIAGRAM]`
- ห้ามวาดจำนวน element, พอร์ต, ปุ่ม หรือ topology จากการเดา
- Alt text ต้องบอกสิ่งที่เห็นจริง ไม่เขียนชื่อภาพที่ตั้งใจจะสร้าง

**เกณฑ์รับ:** ตรวจภาพด้วยสายตาแล้ว Caption, Alt และเนื้อหาภาพตรงกันทุกภาพ

### P0-07 ข้อความสเปกที่ไม่มีแหล่งหรือมีเงื่อนไขตกหล่น

แก้รายการต่อไปนี้พร้อมกัน:

| ข้อความปัจจุบัน | การแก้ |
|---|---|
| `กวาดสัญญาณเร็ว 60 GHz/s` ในย่อหน้า Interactive Console | เติม `สูงสุด ... @ 1 MHz resolution` |
| `50 MSa/s` ใน preset/Canvas I/Q | ลบจนกว่าจะมี PR200 source ระบุ sample rate นี้; เก็บเพียง snapshot BW สูงสุด 40 MHz |
| `IP54` | ลบหรือระบุ “ต้องตรวจ Operating Manual/รุ่นย่อย” เพราะเอกสารที่ตรวจรอบนี้ยังไม่ยืนยัน |
| boot `~35 วินาที` | ลบหรือทำเป็นค่าจากการวัดเครื่องจริงพร้อมรุ่น firmware/เงื่อนไข |
| Softkey F3–F6 ตายตัว | ระบุว่าเป็นตัวอย่าง configuration; หลัง Factory Reset ยืนยันได้เฉพาะ F1 Edit และ F2 Receiver |
| `ADDx07 5-element` | เปลี่ยนเป็น multi-element หรือระบุรุ่นและจำนวน element จาก datasheet เฉพาะรุ่น |
| Compass/GPS อยู่ในฐานเสมอ | ระบุว่าขึ้นกับรุ่น/version ของ ADD107/ADD207 |

**เกณฑ์รับ:** ทุก numeric claim มี Source ID และ qualification แสดงใกล้ค่าหรือ tooltip

### P0-08 MobileLocator ใช้ชื่ออัลกอริทึมที่แต่งขึ้น

**พบใน:** “Statistical Heatmap Intersection” และ “นับพันจุด”  
**แหล่งผู้ผลิต:** ระบุว่ารวบรวม bearing ได้หลายร้อยผลต่อนาทีและใช้ statistical analysis เพื่อคัดผลที่ไม่เกี่ยวข้อง ไม่ได้เรียกอัลกอริทึมตามชื่อที่เว็บไซต์ใช้

**การแก้ไข:** ใช้ถ้อยคำตามผู้ผลิต: `เก็บ bearing หลายร้อยผลต่อนาที และใช้ statistical analysis เพื่อคัดผลที่ไม่เกี่ยวข้อง/ลดผล multipath` พร้อมลิงก์แหล่งอ้างอิง

### P0-09 แบบทดสอบเรียก Google Forms ว่า “ทางการ”

**พบใน:** Subtitle บท Exam  
**ปัญหา:** ไม่มีหลักฐานว่าเป็นฟอร์มทางการของ Rohde & Schwarz หรือหน่วยงานใด

**การแก้ไข:** เปลี่ยนเป็น `แบบทดสอบประกอบหลักสูตรฉบับผู้จัดทำ` และระบุเจ้าของ/ผู้ดูแลฟอร์มจริง หากมี

## 5. ประเด็น P1 — แก้เพื่อความน่าเชื่อถือและใช้งานจริง

### P1-01 รวม Technical Claims เป็น Source Registry

ปัจจุบันค่าซ้ำกระจายอยู่ใน HTML และ JavaScript ทำให้เกิดความขัดแย้งง่าย ควรสร้าง `js/technical-data.js` หรือ JSON ที่มีโครงสร้าง:

```js
{
  id: 'pr200.pscan.max_speed',
  value: 60,
  unit: 'GHz/s',
  condition: '@ 1 MHz scan resolution',
  source: 'RS-PR200-BROCHURE',
  status: 'VERIFIED',
  reviewedAt: '2026-09-23'
}
```

สถานะที่ใช้ทั้งเว็บ:

- `VERIFIED — MANUFACTURER`
- `TRAINING SOURCE`
- `SIMULATED`
- `FIELD HEURISTIC`
- `NEEDS MANUAL`

### P1-02 ATT/Intermod ยังมี threshold ที่ดูเป็นกฎตายตัว

แม้กฎหลักแก้ดีแล้ว แต่บทที่ 2 และบทที่ 5 ยังใช้ “มากกว่า 20–30 dB หรือหายวับ” เป็นตัวแยก Internal IMD ข้อความนี้ควรเป็นตัวอย่างพฤติกรรม ไม่ใช่เกณฑ์ยอมรับสากล

**แก้:** ทำ decision table ที่พิจารณา proportionality, preselector/filter, second receiver, antenna/cable isolation และ controlled isolation ที่ได้รับอนุญาต โดยไม่ใช้ค่า 20–30 dB เป็น pass/fail

### P1-03 Scan calculator มี initial HTML เก่าค้าง

JavaScript ปัจจุบันเปลี่ยนผลเป็นเชิงคุณภาพแล้ว แต่ HTML เริ่มต้นยังเขียน `สูงมาก (> 6 dB)` ก่อน script ทำงาน

**แก้:** ให้ markup เริ่มต้นตรงกับผล qualitative และรองรับกรณี JavaScript โหลดช้า/ปิดใช้งาน

### P1-04 RBW calculator แสดงค่าจำลองเหมือนค่าของเครื่องจริง

สูตร `noiseFloor = -105 dBm + 10 log10(RBW/100 kHz)` ใช้ baseline สมมติ และ signal level -115 dBm คงที่ ผู้เรียนอาจเข้าใจว่าเป็น DANL ของ PR200

**แก้:**

- แสดง `[SIMULATION ASSUMPTION]` บนการ์ด
- เปิดเผย baseline, signal level และสูตร
- เปลี่ยนหัวข้อจาก “Noise Floor ของ PR200” เป็น “ตัวอย่างผลของ RBW ต่อ noise bandwidth”

### P1-05 Level Mapping threshold ถูกนำเสนอเหมือนมาตรฐานทั่วไป

ช่วง `>-50`, `-70 ถึง -50`, `-90 ถึง -70`, `<-90 dBm` ขึ้นกับ band, antenna factor, path loss, mission และ receiver configuration

**แก้:** เปลี่ยนเป็น `ตัวอย่าง training profile` และให้ผู้สอนกำหนด threshold ต่อภารกิจ ห้ามใช้คำว่า Near-field/Line-of-sight จากระดับ dBm เพียงอย่างเดียว

### P1-06 Navigation บนมือถือยังค้นพบบทยาก

- Roadmap เลื่อนแนวนอนและมีรายการหลุดกรอบ
- ควรมี edge fade + “เลื่อนดูบทอื่น →” หรือเปลี่ยนเป็น select/accordion บนจอแคบ
- รักษา selected tab ให้อยู่กลาง viewport เมื่อสลับบท
- Smooth scroll ทำให้ target เคลื่อนระหว่าง automation/keyboard interaction ได้ ควรเคารพ reduced motion

### P1-07 Accessibility tabs ยังไม่เป็น APG pattern ครบ

ทุก tab เป็น `<button>` และยังไม่มี roving `tabindex` จึงกด Tab ผ่านครบทั้ง 7 แท็บ

**แก้:**

- selected tab: `tabindex="0"`
- unselected tabs: `tabindex="-1"`
- ใช้ `hidden` กับ panel ที่ไม่ active ควบคู่กับ `aria-selected`
- เพิ่ม visible focus ring ที่ contrast ผ่าน

### P1-08 Touch target และข้อความขนาดเล็ก

พบ target ต่ำกว่า 44 px หลายจุด โดยเฉพาะ preset controls, tabs, badges-as-buttons, option toggles และ utility actions

**แก้:** min-height/min-width 44 px สำหรับ control หลัก; utility control ขั้นต่ำ 40 px พร้อม spacing ไม่ต่ำกว่า 8 px

### P1-09 Animation loop ยังทำงานตลอดอายุหน้า

หลาย loop ตรวจว่า canvas ถูกซ่อนแล้วไม่ render แต่ยังเรียก `requestAnimationFrame` ต่อทุก frame; Virtual Screen loop ยังไม่ตรวจ `prefers-reduced-motion` และ canvas visibility ครบ

**แก้:**

- สร้าง animation scheduler กลาง
- ใช้ IntersectionObserver + `visibilitychange`
- ยกเลิก frame ด้วย `cancelAnimationFrame` เมื่อ panel ถูกซ่อน
- reduced motion ให้ render static frame ครั้งเดียว

### P1-10 Simulator ทำซ้ำผลไม่ได้

ยังใช้ `Math.random()` หลายจุด ทำให้ภาพ/ค่าที่ผู้เรียนเห็นต่างกันและยากต่อการตรวจข้อสอบหรือบันทึกหลักฐาน

**แก้:** ใช้ seeded PRNG, แสดง Seed, เพิ่ม `Reset scenario` และ Export scenario state

## 6. ประเด็น P2 — ปรับคุณภาพและดูแลระยะยาว

1. แยก `index.html` เป็น chapter partials/components เพื่อลดไฟล์ 349 KB ที่แก้ยาก
2. ลด inline styles 724 จุดและรวมเป็น design tokens/classes
3. ทำ lazy initialization ของ simulator ตามบท แทนการสร้างทั้งหมดตั้งแต่โหลดหน้า
4. เพิ่ม changelog “เนื้อหานี้ตรวจจากเอกสารใด เมื่อไร” ในแต่ละบท
5. เพิ่ม print/export mode สำหรับ Field Checklist แบบไม่มี animation
6. เพิ่ม search ภายในบทและ glossary สำหรับ RTBW, RBW, VFO, POI, AoA, IMD
7. บีบอัดภาพจริงและทำ responsive `srcset`; ภาพหน้าเครื่อง 560 × 900 เหมาะกับจอทั่วไปแต่ยังไม่คมสำหรับ zoom/Retina
8. เพิ่ม loading/error state ให้ภาพ lazy-loaded และ Google Form gate

## 7. แผนดำเนินงานละเอียด

### Phase 0 — Freeze claims และทำ content inventory (ครึ่งวัน)

1. ปิดการเพิ่ม numeric claims ใหม่ชั่วคราว
2. ดึงทุกข้อความที่มีหน่วย MHz/GHz/kHz/dB/dBm/°/Ah/Wh/ms/s เป็นรายการ
3. ผูกแต่ละ claim กับ Source ID, หน้าเอกสาร, เงื่อนไข และสถานะ
4. ทำรายการ claims ที่ไม่มีแหล่งเป็น `NEEDS MANUAL`

**ผลส่งมอบ:** `TECHNICAL_CLAIMS_MATRIX.md` และ registry กลาง  
**ผ่านเมื่อ:** ไม่มี numeric claim สำคัญอยู่นอก matrix

### Phase 1 — Content safety hotfix (1 วัน)

แก้ P0-01 ถึง P0-09 โดยเน้น Trigger, Factory Reset, Dual VFO, battery, CS-DF, รูปภาพผิด, 50 MSa/s/IP54/boot time, MobileLocator และคำว่า Google Forms ทางการ

**ผ่านเมื่อ:**

- ตรวจค้นคำเสี่ยงแล้วไม่เหลือข้อความผิด
- ผู้ตรวจเนื้อหาอ่าน Workflow 01–07 แล้วทำตามได้โดยไม่เสี่ยงลบข้อมูลโดยไม่รู้ตัว
- Caption/Alt ของภาพตรงสิ่งที่เห็นจริง

### Phase 2 — Rebuild ภาพประกอบ (1–2 วัน)

สร้างภาพใหม่ 3 ชุด:

1. PR200 Hardware Ports: ภาพจริงหรือ vector outline พร้อมหมายเลขพอร์ตที่ยืนยันแล้ว
2. HE400 Handle & Modules: ด้าม, Trigger, LED, LNA, polarization, HE400DC โดยไม่แต่งพอร์ต/ปุ่ม
3. ADD107/ADD207 system: แยกความถี่, accuracy และ GPS/compass ตามรุ่น ไม่ใช้ภาพ generic 5-element

**แนวภาพ:** Dark technical illustration, เส้น vector บาง, amber callouts, integrated into card, ไม่มีภาพตัดแปะหรือ screenshot ซ้อนเว็บ

**ผ่านเมื่อ:** reviewer เทียบภาพกับ source แล้วไม่มีส่วนประกอบที่เดา

### Phase 3 — Simulator truth model (1–1.5 วัน)

1. แยกค่าจำลองออกจากค่าจริงด้วย data status
2. Seed random scenarios
3. แก้ initial state ของ Scan calculator
4. ระบุ assumptions ของ RBW calculator
5. เปลี่ยน Level Mapping thresholds เป็น editable training profile
6. แก้ ATT test ให้เป็น diagnostic evidence ไม่ใช่ acceptance threshold

**ผ่านเมื่อ:** ทุกค่าบน canvas/card บอกได้ว่าเป็น measured, manufacturer, training-source หรือ simulated

### Phase 4 — Mobile/Accessibility (1 วัน)

1. ทำ mobile chapter navigator
2. เพิ่ม roving tabindex/hidden/focus management
3. ขยาย touch targets
4. ตรวจ contrast, zoom 200%, keyboard-only และ screen-reader names
5. ลด smooth motion เมื่อ `prefers-reduced-motion`

**ผ่านเมื่อ:**

- 390 × 844, 768 × 1024, 1366 × 768 และ 1920 × 1080 ไม่มี body overflow
- ใช้ keyboard เข้าได้ทุกบทและ focus ไม่หลุด
- target สำคัญ ≥ 44 × 44 px
- selected chapter มองเห็นเสมอ

### Phase 5 — Performance (0.5–1 วัน)

1. Lazy-init canvas เฉพาะบท active
2. หยุด/cancel animation ที่ซ่อน
3. ลด inline style และ event listeners ที่สร้างซ้ำ
4. วัด load/CPU/memory ทั้ง desktop และมือถือจำลอง

**เป้าหมาย:**

- ไม่ schedule animation ของบทที่ซ่อน
- ลด DOM initial อย่างน้อย 25%
- ลด `simulators.js` initial execution ด้วย chapter-based modules
- interaction หลักตอบสนองภายใน 100 ms บนอุปกรณ์ระดับกลาง

### Phase 6 — Regression & content sign-off (1 วัน)

Test matrix ขั้นต่ำ:

| กลุ่ม | กรณีทดสอบ |
|---|---|
| Navigation | ทุก tab, Prev/Next, sidebar, deep links, keyboard arrows/Home/End |
| Simulator | Presets 6 แบบ, reduced motion, hidden tabs, seeded reset, resize |
| Calculators | RBW ทุกค่า, Scan ratio boundary 0.5/1/2, no-JS initial state |
| Exam | 0/20, 15/20, 16/20, 20/20, reset, incomplete submission, mobile |
| Privacy | Google iframe ไม่มี request ก่อนกดโหลด, external form label ถูกต้อง |
| Content | Trigger, reset deletion, battery, CS-DF, 60 GHz/s condition, ADD107/207 |
| Responsive | 390, 430, 768, 1024, 1366, 1920 px |
| Accessibility | keyboard-only, focus order, screen-reader names, contrast, 200% zoom |

**ผ่านเมื่อ:** P0 = 0, P1 ที่กระทบเนื้อหา/การเข้าถึง = 0 และมี reviewer sign-off แยก Technical/UX

## 8. ลำดับลงมือที่แนะนำ

1. แก้ Trigger + Factory Reset + Dual VFO ทันที
2. รวมและแก้สเปกแบตเตอรี่/CS-DF/60 GHz/s/50 MSa/s/IP54/boot time
3. เอาภาพ screenshot ที่ alt ผิดออก แล้วสร้างภาพใหม่
4. แก้ MobileLocator/ADDx07/Google Forms wording
5. ทำ Source Registry และ Simulation labels
6. ปิดงาน mobile accessibility
7. ปรับ animation/performance
8. รัน regression และให้ผู้เชี่ยวชาญเครื่องจริงตรวจ workflow ก่อนเผยแพร่

## 9. Definition of Done

เว็บไซต์จะถือว่าพร้อมใช้สอนเมื่อครบทั้งหมด:

- ไม่มีขั้นตอนที่ทำให้ผู้เรียนกดคำสั่งผิดหรือลบข้อมูลโดยไม่มีคำเตือน
- Numeric claims ทุกค่ามี source/condition/status
- ภาพ Caption และ Alt ตรงกับสิ่งที่แสดง
- Simulation ไม่ถูกนำเสนอเป็นผลวัดจริงหรือเกณฑ์รับสากล
- Mobile และ keyboard ใช้งานทุกบทได้
- Google Forms ยังไม่โหลดก่อนผู้ใช้เลือก และไม่เรียกว่า “ทางการ” โดยไม่มีหลักฐาน
- ไม่มี animation ของบทที่ซ่อนกินทรัพยากรต่อเนื่อง
- Technical reviewer และ instructor reviewer ลงนามรับรองเนื้อหาคนละบทบาท

## 10. แหล่งอ้างอิงออนไลน์หลัก

- R&S PR200 Fact Sheet: <https://scdn.rohde-schwarz.com/ur/pws/dl_downloads/pdm/cl_brochures_and_datasheets/fact_sheet/3609_4232_32/PR200_Fact_sheet_3609-4232-32_v01.20.pdf>
- R&S PR200 Product Brochure: <https://scdn.rohde-schwarz.com/ur/pws/dl_downloads/pdm/cl_brochures_and_datasheets/product_brochure/5216_4540_12/PR200_bro_en_5216-4540-12_v1100.pdf>
- R&S Receivers and Direction Finders comparison: <https://www.rohde-schwarz.com/us/products/aerospace-defense-security/receivers-and-direction-finders_63723.html>
- R&S PR200 product page: <https://www.rohde-schwarz.com/us/products/aerospace-defense-security/handheld/rs-pr200-portable-monitoring-receiver_63493-594881.html>
- R&S ADD107 product page: <https://www.rohde-schwarz.com/us/products/aerospace-defense-security/compact-single-channel/rs-add107-compact-vhf-uhf-df-antenna_63493-11902.html>
- R&S Direction Finding Antennas overview: <https://www.rohde-schwarz.com/uk/products/aerospace-defense-security/direction-finding-antennas_334198.html>
- ITU-R SM.443-4: <https://www.itu.int/dms_pubrec/itu-r/rec/sm/R-REC-SM.443-4-200702-I%21%21PDF-E.pdf>
