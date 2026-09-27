import { askJevDecision } from './jev-consult.mjs';

async function runRadiologyConsultation() {
  console.log('--- Consulting JEV System One (jev-latest) for Radiological Technology Module ---');

  const context = `
วิชาใหม่: เทคโนโลยีรังสี (Radiological Technology & Medical Imaging Systems)
แหล่งข้อมูล: C:\\Users\\phumshop\\Desktop\\เอาไว้รันบอท ไลน์.txt (2,075 บรรทัด ครอบคลุม RIS, DICOM, Risk Scoring, PACS Architecture)
ความต้องการของผู้ใช้:
1. แยกวิชาใหม่เป็น 'radiology' (เทคโนโลยีรังสี) แยกหมวดหมู่อิสระ ชัดเจนเหมือน physiology และ pathology
2. ออกแบบให้ "ชื่อเรื่องแต่ละหัวข้อเด่นชัดมาก" (Very Prominent / High-Contrast Section Headings) เพราะเดิมเวลากดดู หาหัวข้อเจอยากมาก
3. สร้างแบบจำลอง 3D คุณภาพสูงตามมาตรฐาน img2threejs สำหรับวิชารังสี (เครื่อง CT Gantry / X-ray Beam / Detector Simulator) พร้อม Visual Depth Helpers (Contact Shadow, Grid, Dual Rim, 5 View Dials, Reticle, Telemetry HUD)
4. คงสถาปัตยกรรม Three.js Lifecycle mount-once with refs + 10Hz throttling ป้องกันบัค WebGL
`;

  const questions = {
    subject_structure: {
      type: 'choice',
      instructions: 'โครงสร้างการจัดบทเรียนของวิชาเทคโนโลยีรังสีที่ดีที่สุดสำหรับผู้เรียน',
      criteria: {
        modular_4_chapters: 'แยกเป็น 4 บท: ch9 (RIS & DICOM), ch10 (Risk Scoring), ch11 (PACS Architecture), ch12 (3D Imaging Suite & Exam Bank)',
        single_giant_chapter: 'รวมเป็นบทเดียวยาวๆ',
        split_by_files_only: 'แยกตามชื่อไฟล์ PDF',
      },
    },
    heading_visual_prominence: {
      type: 'choice',
      instructions: 'รูปแบบการแสดงผลของหัวข้อ (Section Heading) ให้เด่นชัดที่สุด หาง่าย ไม่กลืนกับเนื้อหา',
      criteria: {
        high_contrast_banner_with_badge: 'แบนเนอร์การ์ดพื้นหลังไล่เฉดสี มีกรอบเรืองแสง ไอคอนหมวดหมู่ เลขกำกับหัวข้อ และตัวหนังสือขนาดใหญ่คมชัด (High-Contrast Banner Card with Category Badge)',
        simple_bold_text: 'ตัวหนังสือหนาปกติขนาด 1.5rem',
        colored_underline_only: 'ขีดเส้นใต้สีเฉยๆ',
      },
    },
    radiology_3d_model_type: {
      type: 'choice',
      instructions: 'ประเภทแบบจำลอง 3D สรีรวิทยาและเทคโนโลยีรังสีที่ตอบโจทย์หลักสูตรมากที่สุด',
      criteria: {
        ct_gantry_laser_ray_tracer: 'แบบจำลอง 3D เครื่อง CT Scanner Gantry จำลองวงแหวนสแกนเนอร์หมุนความเร็วสูง ลำรังสี X-ray Fan Beam โครงเตียงเลื่อน และแผ่นตรวจวัด Detector Array พร้อมจำลองการตัดระนาบภาพ Axial/Coronal/Sagittal',
        simple_flat_xray_plate: 'แผ่นฟิล์มเอกซเรย์ 2D ธรรมดา',
        wireframe_cube: 'กล่องสี่เหลี่ยมลูกบาศก์',
      },
    },
    threejs_lifecycle_pattern: {
      type: 'choice',
      instructions: 'การควบคุม Lifecycle ของ Three.js ในแบบจำลองรังสีวิทยา',
      criteria: {
        mount_once_with_refs: 'Mount scene ครั้งเดียว useEffect([]) ซิงก์พารามิเตอร์รังสี (kVp, mA, Slice Thickness, Rotation Speed) ผ่าน useRef ป้องกัน WebGL re-mount 100%',
        reactive_deps_remount: 'ใส่ตัวแปรทุกตัวใน useEffect deps',
      },
    },
  };

  const results = await askJevDecision(context, questions);
  console.log('\n=== JEV System One Decision Results ===');
  console.log(JSON.stringify(results, null, 2));
}

runRadiologyConsultation();
