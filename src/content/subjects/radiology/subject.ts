import type { Subject } from '../../../types/content';

export const radiologySubject: Subject = {
  id: 'radiology',
  title: 'เทคโนโลยีรังสีและระบบสารสนเทศทางการแพทย์ (Radiological Technology & Medical Imaging Systems)',
  shortTitle: 'เทคโนโลยีรังสี',
  description:
    'คลังสรุปหลักสูตรเทคโนโลยีรังสีวิทยาฉบับสมบูรณ์ (RadLearn): ระบบสารสนเทศรังสีวิทยา (RIS), มาตรฐานสากลภาพการแพทย์ (DICOM), การบริหารความเสี่ยงทางรังสีวิทยา (RIS Risk Scoring & 5x5 Matrix), สถาปัตยกรรมระบบ PACS, คลังข้อมูลภาพกลาง (VNA) และสถานีจำลอง 3D CT Gantry Scanner Workstation',
  icon: 'Radio',
  color: '#06b6d4',
  bgGradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
  order: 3,
  chapterIds: [
    'radiology-ris-dicom',
    'radiology-risk-scoring',
    'radiology-pacs-architecture',
    'radiology-imaging-suite',
  ],
};

export default radiologySubject;
