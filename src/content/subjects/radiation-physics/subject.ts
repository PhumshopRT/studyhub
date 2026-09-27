import type { Subject } from '../../../types/content';

export const radiationPhysicsSubject: Subject = {
  id: 'radiation-physics',
  title: 'ฟิสิกส์รังสีและการสลายตัวของนิวเคลียส (Radiation Physics & Radioactivity)',
  shortTitle: 'ฟิสิกส์รังสี',
  description:
    'คลังสรุปหลักสูตรฟิสิกส์รังสีวิทยาฉบับสมบูรณ์ (RadLibrary): ปริมาณและหน่วยทางรังสี (Radiation Quantities & Units - Exposure, Kerma, Absorbed Dose, Equivalent Dose, Effective Dose), สัมประสิทธิ์การลดทอนรังสี, กฎการสลายตัวของสารกัมมันตรังสี, จลนพลศาสตร์สมดุลกัมมันตภาพรังสี (Secular/Transient Equilibrium), รังสีแอนนิฮิเลชัน (PET 511 keV), แผนภาพการสลายตัว และห้องจำลอง 3D Nuclear Decay & Annihilation Studio',
  icon: 'Atom',
  color: '#8b5cf6',
  bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  order: 4,
  chapterIds: [
    'radiation-quantities-units',
    'radioactivity-nuclear-decay',
  ],
};

export default radiationPhysicsSubject;
