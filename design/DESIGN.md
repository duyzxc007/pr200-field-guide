# PR200 FIELD GUIDE — Initial design

วันที่: 22 กันยายน 2026
สถานะ: ภาพแนวทางเพื่อพิจารณาดีไซน์ ยังไม่ใช่เว็บไซต์หรือ simulator ที่ทำงานได้

## แนวคิด
เว็บสื่อการเรียนรู้ภาษาไทยสำหรับผู้ใช้ PR200: เข้าใจภาพ → ลองปรับค่าในสถานการณ์จำลอง → ตรวจความเข้าใจ ใช้กราฟและคำอธิบายที่เป็นส่วนเดียวกับ UI ไม่ใช้ภาพตัดแปะ

## ภาพส่งมอบ
- 01-homepage.png: หน้าแรกและเส้นทางเรียน 3 บท
- 02-lesson-desktop.png: หน้าบทเรียนพร้อมกราฟ คำอธิบาย และคำถาม
- 03-lesson-mobile.png: การจัดเนื้อหาเป็นแนวตั้งสำหรับมือถือ
สร้างด้วย built-in Imagegen; prompts ฉบับเต็มอยู่ใน prompts.md

## โครงสร้างเนื้อหา
1. Receiver: ความถี่, Spectrum, Waterfall, Span, RBW เทียบกับ Demod BW และการอ่านระดับ
2. Panorama Scan: กวาดช่วงกว้าง, candidate, Max Hold, ส่งต่อ Receiver
3. Interference Hunting: ยืนยันและอธิบายสัญญาณก่อนหาทิศ, HE400/manual homing, overload, multipath และบันทึกหลักฐาน
บทเพิ่มเติมในต้นทางเป็นข้อเสนอ ยังไม่ถือว่าเนื้อหาครบหรือผ่านการตรวจแล้ว

## Design tokens
Background #0B0B0E; surface #14141B; text #F8F9FA; secondary #94A3B8; accent #FACC15.
Prompt (Thai) + Inter (Latin), headline 48–64 px desktop / 32–40 px mobile, body 16–18 px.
Glass rgba(20,20,27,.65), blur 16px, border rgba(255,255,255,.08). Glow เหลืองจางอยู่หลังภาพและไม่ลดความชัดตัวอักษร.
Desktop: sidebar + visual + annotation rail. Mobile: lesson selector + visual + explanation rows + exercise.

## การทำงานที่จะสร้างในขั้นพัฒนา
- เลือกบทและหัวข้อ; หมายเลขบนภาพเชื่อมกับคำอธิบาย
- สลับ continuous/burst เพื่อดูความสัมพันธ์ Spectrum กับ Waterfall
- ปรับ Span ในแบบจำลอง พร้อมปรับแกนตามจริง
- เลือกคำตอบและรับคำอธิบาย; ตัวอย่าง -65 - (-100) = 35 dB เป็นผลต่างระดับตามภาพ ไม่ใช่การยืนยัน SNR ที่ผ่านวิธีวัดมาตรฐาน
- Semantic HTML, keyboard/focus, responsive, prefers-reduced-motion
- Hover/glow ใช้ CSS; กราฟและแบบฝึกหัดใช้ state ที่ทำงานจริง
- ไม่มี testimonial จนกว่าจะมีรีวิวจริงที่ได้รับอนุญาต

## Visual review และข้อที่ต้องแก้ก่อนเผยแพร่
ภาพร่างได้ตรวจการจัดวาง สี ลำดับตัวอักษร การผสานกราฟ คำอธิบาย และโครงสร้างมือถือแล้ว แต่ยังไม่ใช่ภาพอ้างอิงความแม่นยำทางวิศวกรรม:
- หน้าแรกมีข้อความตกแต่ง SIGNALS LEAD TO CLARITY ที่ไม่ได้กำหนดไว้ ให้ตัดออกในเวอร์ชันพัฒนา
- หน้าแรกหน่วย Amplitude (dB) ต้องใช้ Level (dBm) หากแสดงระดับสัมบูรณ์
- กราฟ Spectrum/Waterfall ต้องสร้างจากข้อมูลชุดเดียวกัน: ตำแหน่งแกน, peak, color scale ต้องสอดคล้อง ไม่ถอดภาพ AI มาใช้สอนโดยตรง
- Mobile มี RBW/VBW และข้อความตกแต่งที่โมเดลเพิ่มเอง ให้ตัดออก; ไม่ยืนยันว่าเครื่องมี control ตามภาพ
- Search ในภาพ desktop เป็นข้อเสนอจากโมเดล ยังไม่อยู่ในขอบเขตที่ตกลง
- รูปตัวเครื่อง พอร์ต และตำแหน่งปุ่ม ต้องใช้ภาพจริง/คู่มือที่ตรวจสอบแล้ว พร้อมหมายเลขเชื่อมคำอธิบาย ห้ามใช้ภาพ AI เป็นหลักฐานตำแหน่ง
- ตรวจ firmware, options และคู่มือของเครื่องก่อนเผยแพร่ขั้นตอนกดจริง โดยเฉพาะ ATT/level compensation และแยก manual homing ออกจาก automatic DF
- ยังไม่มีการพัฒนา/ทดสอบ browser, interactions หรือ responsive code จริง

## แหล่งข้อมูล
บทสนทนา: chatgpt-conversation://6ab1e6e9-1718-83ec-8f24-d5166c4c4fa5 (อ่าน 5 turns ครบตาม API; มีเนื้อหา Receiver/PScan/Hunting)
เอกสารผลิตภัณฑ์ทางการตรวจวันที่ 22 กันยายน 2026: https://www.rohde-schwarz.com/ca/products/aerospace-defense-security/handheld/rs-pr200-portable-monitoring-receiver_63493-594881.html
ใช้ยืนยันบริบทผลิตภัณฑ์ ไม่ถือว่าได้ตรวจสอบทุกขั้นตอนจากบทสนทนาเดิมแล้ว

