import type { Subject } from '../../../types/content';

export const radiobiologySubject: Subject = {
  id: 'radiobiology',
  title: 'รังสีชีววิทยา (Radiobiology)',
  shortTitle: 'รังสีชีววิทยา',
  description:
    'คลังความรู้รังสีชีววิทยาทางการแพทย์ (KMPHT 0208307211): ผลของรังสีต่ออวัยวะสำคัญ (Radiation Effect on Major Organs), ขีดจำกัดความทนทานของเนื้อเยื่อปกติ (TD 5/5 & QUANTEC Tolerance Doses), สถาปัตยกรรมอวัยวะแบบ Serial vs Parallel, กลไกทำลายระดับดีเอ็นเอ (Direct vs Indirect Radiolysis), ผลของรังสีต่อร่างกายส่วนรวม (Whole Body Effects & ARS 4 ระยะ), กฎของ Bergonié–Tribondeau, Total Body Irradiation (TBI), ปริมาณรังสีถึงแก่ชีวิต LD50/60, เกณฑ์ความปลอดภัย ICRP 103, และห้องปฏิบัติการ 3D Whole-Body Radiobiology Studio',
  icon: 'Dna',
  color: '#059669',
  bgGradient: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #06b6d4 100%)',
  order: 5,
  chapterIds: [
    'radiation-effect-major-organs',
    'radiation-effect-whole-body',
  ],
};

export default radiobiologySubject;
