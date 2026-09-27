import React from 'react';
import { Link } from 'react-router-dom';
import {
  Atom,
  Calculator,
  Dna,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Clock,
  Activity,
  HeartPulse,
  Stethoscope,
  Box,
  Layers,
  Radio,
} from 'lucide-react';
import { getAllSubjects, getChapterById } from '../../content/registry';
import { useProgress } from '../../hooks/useProgress';
import { JevAssistantHero } from '../../components/home/JevAssistantHero/JevAssistantHero';
import styles from './HomePage.module.css';

const FEATURED_SIMULATIONS = [
  {
    id: 'sim-radiology-suite',
    title: 'แบบจำลอง 3D CT Gantry Scanner และ RadLearn Imaging Suite',
    subtitle: 'Sandboxed Medical Imaging Suite',
    desc: 'ระบบสารสนเทศรังสีวิทยา (RIS), มาตรฐาน DICOM 3.0, ตารางวิเคราะห์ความเสี่ยง 5x5 Matrix, สถาปัตยกรรม PACS/VNA และ 3D CT Gantry Scanner',
    path: '/chapter/radiology/radiology-imaging-suite',
    tag: 'Radiology Suite',
    tagColor: '#0891b2',
    icon: '🩻',
  },
  {
    id: 'sim-3d-pathology',
    title: 'แบบจำลอง 3D พยาธิวิทยาระบบสืบพันธุ์สตรีและรอยโรค',
    subtitle: 'Three.js 3D Procedural Studio',
    desc: 'หมุนสำรวจ 360° รอยโรค Leiomyoma, ช็อกโกแลตซีสต์ Endometriosis, ท้องนอกมดลูก, เดอร์มอยด์ซีสต์ และหน้าตัด Cross-section',
    path: '/chapter/pathology/pathology-reproductive-female-breast',
    tag: '3D Pathology',
    tagColor: '#be123c',
    icon: '🔬',
  },
  {
    id: 'sim-3d-lungs',
    title: 'แบบจำลอง 3D สรีรวิทยาปอดและระบบหายใจ',
    subtitle: 'Three.js 3D Procedural Studio',
    desc: 'หมุนสำรวจ 360° ละอองอากาศหายใจเข้า-ออก, แขนงหลอดเลือดแดง/ดำ, กะบังลม, และระบบตรวจคำตอบ JEV AI',
    path: '/chapter/physiology/respiratory-physiology',
    tag: '3D WebGL',
    tagColor: '#0284c7',
    icon: '🫁',
  },
  {
    id: 'sim-patho-atlas',
    title: 'คลังบทเรียนพยาธิวิทยาระบบสืบพันธุ์ 32 หัวข้อฉบับสมบูรณ์',
    subtitle: 'Qwen Interactive Suite',
    desc: '32 Sections, 121 Slides, Slide Navigator และระบบตรวจวิเคราะห์เคสทางคลินิกขับเคลื่อนด้วย JEV AI 80%',
    path: '/chapter/pathology/pathology-reproductive-atlas',
    tag: 'Pathology Suite',
    tagColor: '#9f1239',
    icon: '📚',
  },
  {
    id: 'sim-physio-rs',
    title: 'Physio-RS คลังแบบจำลองทางเดินหายใจ 12 โมเดล',
    subtitle: 'Qwen Interactive Suite',
    desc: 'กลศาสตร์ลูกสูบปอดตามกฎบอยล์, การทำงานของ Surfactant, กราฟ Spirometry สด และกราฟ Oxyhemoglobin',
    path: '/chapter/physiology/respiratory-physiology',
    tag: 'Qwen Suite',
    tagColor: '#7c3aed',
    icon: '🧪',
  },
  {
    id: 'sim-projectile',
    title: 'ห้องทดลองฟิสิกส์: การเคลื่อนที่แบบโพรเจกไทล์',
    subtitle: 'Canvas Interactive Simulator',
    desc: 'ปรับมุมยิง ความเร็วต้น และแรงโน้มถ่วง พร้อมวิเคราะห์ระยะตกไกลสุดและจุดสูงสุดแบบเรียลไทม์',
    path: '/chapter/physics/projectile-motion',
    tag: 'Physics Lab',
    tagColor: '#059669',
    icon: '🎯',
  },
  {
    id: 'sim-quadratic',
    title: 'เครื่องมือพลอตกราฟฟังก์ชันกำลังสองและพาราโบลา',
    subtitle: 'Math Function Studio',
    desc: 'ปรับสัมประสิทธิ์ a, b, c แบบเรียลไทม์ ค้นหาจุดยอด จุดตัดแกน X และแกนสมมาตรทันที',
    path: '/chapter/mathematics/quadratic-functions',
    tag: 'Math Studio',
    tagColor: '#d97706',
    icon: '📈',
  },
];

export const HomePage: React.FC = () => {
  const subjects = getAllSubjects();
  const { getSubjectProgress, getTotalCompletedChapters, getRecentChapterIds } = useProgress();

  const totalChapters = subjects.reduce((sum, s) => sum + s.chapterIds.length, 0);
  const completedTotal = getTotalCompletedChapters();
  const recentIds = getRecentChapterIds();

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity size={24} />;
      case 'HeartPulse':
        return <HeartPulse size={24} />;
      case 'Stethoscope':
        return <Stethoscope size={24} />;
      case 'Atom':
        return <Atom size={24} />;
      case 'Calculator':
        return <Calculator size={24} />;
      case 'Dna':
        return <Dna size={24} />;
      case 'Radio':
        return <Radio size={24} />;
      default:
        return <BookOpen size={24} />;
    }
  };

  return (
    <div>
      {/* Hero Banner with JEV AI Assistant */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badgeHero}>
            <Sparkles size={16} />
            <span>AI-Driven Interactive Learning Hub • TypeSafe JEV Powered</span>
          </div>

          <h1 className={styles.heroTitle}>
            ศูนย์รวม<span className="gradient-text">สรุปบทเรียน</span>และแบบจำลอง
          </h1>

          <p className={styles.heroSubtitle}>
            สรุปเนื้อหาเชิงลึก พร้อมแบบจำลอง 3D สมจริง และผู้ช่วยอัจฉริยะ <strong>TypeSafe JEV AI</strong> ช่วยตรวจความเข้าใจและแนะนำบทเรียน
          </p>

          {/* JEV AI Smart Search & Inquiry Box */}
          <JevAssistantHero />

          {/* Learning Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <BookOpen size={18} color="var(--primary)" />
              <span>{subjects.length} หมวดวิชาหลัก</span>
            </div>
            <div className={styles.statItem}>
              <Clock size={18} color="var(--info)" />
              <span>{totalChapters} บทเรียนคุณภาพ</span>
            </div>
            <div className={styles.statItem}>
              <Box size={18} color="#7c3aed" />
              <span>4+ แบบจำลอง 3D &amp; Interactive</span>
            </div>
            <div className={styles.statItem}>
              <CheckCircle2 size={18} color="var(--success)" />
              <span>
                อ่านจบแล้ว <span className={styles.statNumber}>{completedTotal}</span>/{totalChapters} บท
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured 3D & Interactive Labs Section */}
      <section className={styles.section} style={{ paddingBottom: '12px' }}>
        <div className={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={22} color="var(--primary)" />
            <div>
              <h2 className={styles.sectionTitle}>ห้องทดลองจำลองและโมเดล 3D (Interactive Labs)</h2>
              <p className={styles.sectionDesc}>
                ทดลองปรับเปลี่ยนพารามิเตอร์ สังเกตผลลัพธ์แบบเรียลไทม์ และหมุนดูมิติกายวิภาคแบบ 360°
              </p>
            </div>
          </div>
        </div>

        <div className={styles.simGrid}>
          {FEATURED_SIMULATIONS.map((sim) => (
            <Link
              key={sim.id}
              to={sim.path}
              className={styles.simCard}
              style={{ '--tag-color': sim.tagColor } as React.CSSProperties}
            >
              <div>
                <div className={styles.simCardTop}>
                  <span className={styles.simIcon}>{sim.icon}</span>
                  <span className={styles.simTag}>{sim.tag}</span>
                </div>
                <h4 className={styles.simTitle}>{sim.title}</h4>
                <p className={styles.simDesc}>{sim.desc}</p>
              </div>

              <div className={styles.simFooter}>
                <span className={styles.simSubtitle}>{sim.subtitle}</span>
                <span className={styles.simCta}>
                  <span>เปิดทดลอง</span>
                  <ChevronRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Chapters if any */}
      {recentIds.length > 0 && (
        <section className={styles.section} style={{ marginBottom: '12px' }}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle} style={{ fontSize: '1.25rem' }}>
                บทเรียนที่เปิดอ่านล่าสุด
              </h3>
              <p className={styles.sectionDesc}>เรียนต่อจากจุดที่คุณอ่านค้างไว้</p>
            </div>
          </div>

          <div className={styles.recentGrid}>
            {recentIds.map((cId) => {
              const chap = getChapterById(cId);
              if (!chap) return null;
              return (
                <Link
                  key={cId}
                  to={`/chapter/${chap.subjectId}/${chap.id}`}
                  className={styles.recentCard}
                >
                  <div>
                    <div className={styles.recentLabel}>อ่านค้างไว้</div>
                    <div className={styles.recentTitle}>{chap.title}</div>
                  </div>
                  <ChevronRight size={18} color="var(--primary)" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All Subjects Grid */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>เลือกวิชาที่ต้องการเรียนรู้</h2>
            <p className={styles.sectionDesc}>คลิกที่วิชาเพื่อดูสารบัญบทเรียนและแบบจำลองทั้งหมด</p>
          </div>
        </div>

        <div className={styles.subjectsGrid}>
          {subjects.map((subject) => {
            const { completed, total, percent } = getSubjectProgress(subject.id, subject.chapterIds);

            return (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className={styles.subjectCard}
                style={{ '--card-accent': subject.bgGradient } as React.CSSProperties}
              >
                <div className={styles.cardTop}>
                  <div className={styles.iconWrapper} style={{ background: subject.bgGradient }}>
                    {getSubjectIcon(subject.icon)}
                  </div>
                  <h3 className={styles.cardTitle}>{subject.title}</h3>
                  <p className={styles.cardDesc}>{subject.description}</p>

                  <div>
                    <div className={styles.progressMeta}>
                      <span>ความคืบหน้า</span>
                      <span>{completed}/{total} บท ({percent}%)</span>
                    </div>
                    <div className={styles.progressBarContainer}>
                      <div
                        className={styles.progressBarFill}
                        style={{
                          width: `${percent}%`,
                          backgroundColor: subject.color,
                          color: subject.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span>{subject.chapterIds.length} บทเรียน</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                    <span>เข้าสู่วิชา</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
