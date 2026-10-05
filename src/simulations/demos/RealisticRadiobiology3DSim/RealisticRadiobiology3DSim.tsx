import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Sun,
  Sparkles,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sliders,
  Scissors,
  Activity,
  Dna,
  Zap,
  Shield,
  Layers,
  Baby,
  Eye,
  X,
} from 'lucide-react';
import {
  createContactShadowPlane,
  setupStudioLighting,
  setStudioLightingMode,
  getAnatomicalCoordinates,
  smoothTransitionCamera,
  type StudioLightingRig,
  type LightingMode,
  type AnatomicalView,
} from '../../shared/threeDepthHelpers';
import styles from './RealisticRadiobiology3DSim.module.css';

interface AnatomyPin {
  id: string;
  nameTh: string;
  nameEn: string;
  category: 'Hematopoietic' | 'Gastrointestinal' | 'Cerebrovascular' | 'Ocular' | 'Serial' | 'Parallel' | 'Teratogenic' | 'Hereditary';
  position: [number, number, number];
  td5: string;
  acuteReaction: string;
  chronicReaction: string;
  clinicalNote: string;
}

const RADIOBIOLOGY_PINS: AnatomyPin[] = [
  {
    id: 'pin-bone-marrow',
    nameTh: 'ไขกระดูก (Bone Marrow & Stem Cells)',
    nameEn: 'Hematopoietic Stem Cells (HSC)',
    category: 'Hematopoietic',
    position: [0, -0.6, 0.15],
    td5: 'TD 5/5: 2.5–3.0 Gy (Whole Marrow)',
    acuteReaction: 'Pancytopenia (Lymphopenia ใน 24 ชม., Granulocytopenia, Thrombocytopenia, Anemia)',
    chronicReaction: 'Aplastic anemia, Hypoplasia, Secondary Leukemia risk',
    clinicalNote: 'หัวใจของ Hematopoietic Syndrome (1–10 Gy). LD50/60 ของมนุษย์ ~3.5–4 Gy (ไม่รักษา) และ ~6–7 Gy (ถ้าให้ Stem cell & G-CSF)',
  },
  {
    id: 'pin-small-intestine',
    nameTh: 'ลำไส้เล็กและคริปต์สเต็มเซลล์ (GI Crypt Cells)',
    nameEn: 'Small Intestine Crypts of Lieberkühn',
    category: 'Gastrointestinal',
    position: [0, -0.2, 0.12],
    td5: 'TD 5/5: 40 Gy (Partial), 10 Gy (Whole Abdomen)',
    acuteReaction: 'Villus denudation, เสียน้ำและเกลือแร่รุนแรง, ท้องร่วงเป็นเลือด, แบคทีเรียบุกรุกกระแสเลือด',
    chronicReaction: 'Intestinal stenosis, Stricture, Malabsorption, Mucosal atrophy',
    clinicalNote: 'Gastrointestinal Syndrome (10–50 Gy). สเต็มเซลล์ใน crypt ตายหมด ทำให้เยื่อบุหลุดลอกใน 3–5 วัน เสียชีวิตใน 3–10 วัน',
  },
  {
    id: 'pin-brain-cns',
    nameTh: 'สมองและหลอดเลือดประสาท (Brain & Neurovasculature)',
    nameEn: 'Cerebrovascular / CNS System',
    category: 'Cerebrovascular',
    position: [0, 1.35, 0.05],
    td5: 'TD 5/5: 45–50 Gy (Whole Brain)',
    acuteReaction: 'Cerebral edema, Microvascular breakdown, ความดันในกะโหลกพุ่งสูง, ชัก หมดสติ',
    chronicReaction: 'Radiation Necrosis, Leukoencephalopathy, Cognitive decline',
    clinicalNote: 'Cerebrovascular Syndrome (>50 Gy). อาการเริ่มทันทีภายในชั่วโมง หมดสติและเสียชีวิตอย่างรวดเร็วภายใน 24–48 ชม.',
  },
  {
    id: 'pin-eye-lens',
    nameTh: 'เลนส์ตา (Crystalline Lens)',
    nameEn: 'Lens Epithelium & Cataractogenesis',
    category: 'Ocular',
    position: [0.18, 1.38, 0.35],
    td5: 'Threshold: 0.5–2.0 Gy (Single dose), 4–5 Gy (Fractionated)',
    acuteReaction: 'ไม่มีอาการเฉียบพลันที่มองเห็นได้ทันที (Subclinical)',
    chronicReaction: 'Posterior Subcapsular Cataract (ต้อกระจกด้านหลังเลนส์) เกิดใน 1–5 ปีหลังรับรังสี',
    clinicalNote: 'ตามมาตรฐาน ICRP 103/118 ขีดจำกัดโดสเลนส์ตาของบุคลากรทางการแพทย์ถูกปรับลดลงเหลือ 20 mSv/ปี (จากเดิม 150 mSv)',
  },
  {
    id: 'pin-spinal-cord',
    nameTh: 'ไขสันหลัง (Spinal Cord — Serial Organ)',
    nameEn: 'Spinal Cord (Serial Architecture)',
    category: 'Serial',
    position: [0, 0.2, -0.2],
    td5: 'TD 5/5: 45–50 Gy (at 1.8–2.0 Gy/fx)',
    acuteReaction: "Lhermitte's sign (ความรู้สึกเหมือนไฟช็อตแล่นลงแขนขาเมื่อก้มคอ เกิด 2–4 เดือน)",
    chronicReaction: 'Radiation Myelopathy (อัมพาตท่อนล่างหรือทั้งตัวแบบถาวรเนื่องจาก Demyelination)',
    clinicalNote: 'ตัวอย่างคลาสสิกของ "Serial Organ" — หากจุดใดจุดหนึ่งของสายได้รับรังสีเกินขีดจำกัด การทำงานของระบบทั้งหมดจะดับทันที',
  },
  {
    id: 'pin-lungs',
    nameTh: 'ปอด (Lungs — Parallel Organ)',
    nameEn: 'Lungs & Alveoli (Parallel Architecture)',
    category: 'Parallel',
    position: [0.35, 0.45, 0.05],
    td5: 'TD 5/5: 17.5 Gy (Whole Lung), Mean Lung Dose < 20 Gy',
    acuteReaction: 'Radiation Pneumonitis (ไอแห้ง หายใจเหนื่อย มีไข้ต่ำ เกิด 1–6 เดือนหลังฉาย)',
    chronicReaction: 'Radiation Fibrosis (เนื้อปอดเป็นพังผืดแข็ง แลกเปลี่ยนก๊าซไม่ได้ถาวร)',
    clinicalNote: 'ตัวอย่าง "Parallel Organ" — อวัยวะสามารถทนต่อรังสีปริมาณสูงเฉพาะจุดได้ดี หากควบคุมปริมาณรังสีเฉลี่ยทั้งก้อน (Mean Dose)',
  },
  {
    id: 'pin-fetus-conceptus',
    nameTh: 'ทารกในครรภ์และตัวอ่อน (Developing Conceptus & Fetus)',
    nameEn: 'Conceptus & Organogenesis Vulnerability',
    category: 'Teratogenic',
    position: [0, -0.15, 0.22],
    td5: 'NCRP: ตลอดครรภ์ <= 500 mRem (5 mSv), รายเดือน <= 50 mRem | Cutoff ยุติครรภ์ 100 mSv',
    acuteReaction: 'Preimplantation (0-7d): All or None (0.1 Sv), Organogenesis (2-8w): Malformations (0.25 Sv)',
    chronicReaction: 'Fetal 8-15wk: Mental retardation (0.12-0.2 Gy, Neurons) & Microcephaly (<8wk, Glia)',
    clinicalNote: 'ช่วง 8-15 สัปดาห์ การย้ายที่ของนิวรอนไปสร้าง Cerebral Cortex ไวต่อรังสีสูงสุด หลังสัปดาห์ที่ 25 ความเสี่ยงลดลง 4 เท่า',
  },
  {
    id: 'pin-gonads-repro',
    nameTh: 'อวัยวะสืบพันธุ์ (Gonads: Testes & Ovaries)',
    nameEn: 'Spermatogonia & Follicles (Genetic Risk)',
    category: 'Hereditary',
    position: [0, -0.65, 0.15],
    td5: 'หมันชั่วคราวชาย 0.15 Sv, หมันถาวรชาย 3.5-6 Sv, หมันถาวรหญิง 2.5-6 Sv',
    acuteReaction: 'Oligospermia / Aspermia ใน 6-8 สัปดาห์ (เพศชายไวมากเนื่องจาก Spermatogonia แบ่งตัวต่อเนื่อง)',
    chronicReaction: 'Permanent Sterility, Doubling Dose ~1 Sv (Spontaneous mutation rate x 2)',
    clinicalNote: 'รังสีไม่สร้างมิวเทชันชนิดใหม่ แต่เพิ่มอัตรา Spontaneous mutation ส่วนใหญ่เป็นยีนด้อย (Recessive)',
  },
];

export const RealisticRadiobiology3DSim: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const lightingRigRef = useRef<StudioLightingRig | null>(null);

  // Group references
  const humanBodyGroupRef = useRef<THREE.Group>(new THREE.Group());
  const dnaModelGroupRef = useRef<THREE.Group>(new THREE.Group());
  const fetalModelGroupRef = useRef<THREE.Group>(new THREE.Group());
  const cataractModelGroupRef = useRef<THREE.Group>(new THREE.Group());
  const pscMeshRef = useRef<THREE.Mesh | null>(null);
  const organsMeshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const pinsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const clippingPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 0, -1), 10));

  // Simulation State
  const [activeMode, setActiveMode] = useState<'anatomy' | 'dna' | 'serial_parallel' | 'fetal' | 'cataract'>('anatomy');
  const [doseGy, setDoseGy] = useState<number>(3.5);
  const [gestationalWeek, setGestationalWeek] = useState<number>(10);
  const [lensDoseGy, setLensDoseGy] = useState<number>(1.2);
  const [selectedPin, setSelectedPin] = useState<AnatomyPin | null>(null);
  const [isAmifostineOn, setIsAmifostineOn] = useState<boolean>(false);
  const [isCutawayOn, setIsCutawayOn] = useState<boolean>(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>('cinematic');
  const [activeView, setActiveView] = useState<AnatomicalView>('anterior');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTheater, setIsTheater] = useState<boolean>(false);

  // ARS Stage Calculation derived from Dose
  const arsStatus = useMemo(() => {
    if (doseGy < 1.0) {
      return {
        stage: 'Subclinical / Mild Dose',
        syndrome: 'ไม่มีกลุ่มอาการรุนแรง (Subclinical)',
        color: '#10b981',
        survival: '100%',
        symptoms: 'อาจมี Lymphopenia เล็กน้อย อ่อนเพลียชั่วคราว ไม่ต้องนอนโรงพยาบาล',
        intervention: 'เฝ้าระวังทางโลหิตวิทยา (CBC differential)',
      };
    } else if (doseGy <= 10.0) {
      return {
        stage: 'Hematopoietic (Bone Marrow) Syndrome',
        syndrome: 'กลุ่มอาการระบบโลหิตและไขกระดูก (1–10 Gy)',
        color: '#f59e0b',
        survival: doseGy <= 3.5 ? '70–90%' : doseGy <= 6.0 ? '30–50%' : '< 10%',
        symptoms: 'ระยะ Prodromal: คลื่นไส้ อาเจียน; Latent: 1–3 สัปดาห์; Manifest: Pancytopenia, เลือดออกง่าย, ติดเชื้อรุนแรง',
        intervention: 'Stem cell support, Growth factors (G-CSF/GM-CSF), ยาปฏิชีวนะ broad-spectrum, เลือดและเกล็ดเลือด',
      };
    } else if (doseGy <= 50.0) {
      return {
        stage: 'Gastrointestinal (GI) Syndrome',
        syndrome: 'กลุ่มอาการทางเดินอาหาร (10–50 Gy)',
        color: '#ef4444',
        survival: '0% (เสียชีวิต 100% ใน 3–10 วัน)',
        symptoms: 'Crypt cells ถูกทำลายหมด, ลำไส้หลุดลอก, ท้องร่วงรุนแรง, ขาดน้ำรุนแรง, ลำไส้ติดเชื้อเข้ากระแสเลือด (Sepsis)',
        intervention: 'การรักษาประคับประคองขั้นสูงสุด (ICU, สารน้ำทางเส้นเลือด, Total Parenteral Nutrition)',
      };
    } else {
      return {
        stage: 'Cerebrovascular (CNS) Syndrome',
        syndrome: 'กลุ่มอาการระบบประสาทส่วนกลางและหลอดเลือด (> 50 Gy)',
        color: '#a855f7',
        survival: '0% (เสียชีวิต 100% ใน 24–48 ชม.)',
        symptoms: 'Cerebral edema, หลอดเลือดสมองแตก, ความดันในกะโหลกสูง, สับสน กระวนกระวาย, ชัก, โคม่า',
        intervention: 'การดูแลแบบประคับประคองบรรเทาปวดระยะท้าย (Palliative Care / Sedation)',
      };
    }
  }, [doseGy]);

  // Vite Preload Error Guard
  useEffect(() => {
    const handlePreloadError = () => {
      window.location.reload();
    };
    window.addEventListener('vite:preloadError', handlePreloadError);
    return () => window.removeEventListener('vite:preloadError', handlePreloadError);
  }, []);

  // Fullscreen Toggle for iPad/Mobile & Desktop
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        try {
          if (mountRef.current && typeof mountRef.current.requestFullscreen === 'function') {
            mountRef.current.requestFullscreen().catch(() => {});
          }
        } catch {
          // ignore on iPad Safari
        }
      } else {
        try {
          if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  // Handle ESC and Lock Body Scroll
  useEffect(() => {
    if (isFullscreen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') toggleFullscreen();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isFullscreen, toggleFullscreen]);

  // Helper: Pin Canvas Texture
  const createPinTexture = (text: string, color: string): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(64, 64, 56, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = color;
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 44px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Helper: Cortical Sulci & Gyri Canvas Texture for Brain
  const createCorticalGyriTexture = (): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#6b21a8';
      ctx.fillRect(0, 0, 512, 512);

      // Sulcal convolutions
      ctx.strokeStyle = '#3b0764';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        let x = Math.random() * 512;
        let y = Math.random() * 512;
        ctx.moveTo(x, y);
        for (let j = 0; j < 5; j++) {
          x += (Math.random() - 0.5) * 80;
          y += (Math.random() - 0.5) * 80;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Fine vascular network
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      for (let k = 0; k < 25; k++) {
        ctx.beginPath();
        let vx = Math.random() * 512;
        let vy = Math.random() * 512;
        ctx.moveTo(vx, vy);
        for (let s = 0; s < 4; s++) {
          vx += (Math.random() - 0.4) * 60;
          vy += (Math.random() - 0.4) * 60;
          ctx.lineTo(vx, vy);
        }
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.needsUpdate = true;
    return texture;
  };

  // Helper: Spongy Bone Marrow Trabeculae Texture
  const createBoneTrabeculaeTexture = (): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, 256, 256);

      // Spongy sinusoids and trabecular arches
      ctx.fillStyle = '#b45309';
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const r = Math.random() * 4 + 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Active hematopoietic islands (red marrow clusters)
      ctx.fillStyle = '#ef4444';
      for (let j = 0; j < 120; j++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const r = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    texture.needsUpdate = true;
    return texture;
  };

  // Helper: Iris Radial Stroma Canvas Texture
  const createIrisTexture = (): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const cx = 256;
      const cy = 256;
      const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 250);
      grad.addColorStop(0, '#082f49');
      grad.addColorStop(0.25, '#0369a1');
      grad.addColorStop(0.65, '#0284c7');
      grad.addColorStop(0.9, '#0369a1');
      grad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Radial stromal fibrils
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
      ctx.lineWidth = 1.6;
      for (let a = 0; a < Math.PI * 2; a += 0.03) {
        ctx.beginPath();
        const r1 = 65 + Math.sin(a * 22) * 12;
        const r2 = 245 + Math.cos(a * 30) * 8;
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
      }

      // Crypts of Fuchs & contraction furrows
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.04) {
        const r = 145 + Math.sin(a * 14) * 10;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Pupillary sphincter muscle ring
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(7, 89, 133, 0.95)';
      ctx.lineWidth = 10;
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Helper: Cataract Posterior Subcapsular Opacity Texture (Wedl Bladder Cells)
  const createCataractGranularTexture = (): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const cx = 256;
      const cy = 256;
      ctx.clearRect(0, 0, 512, 512);

      // Swollen vacuolated Wedl cells (aberrant ballooning lens fibers)
      for (let i = 0; i < 750; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 0.72) * 200;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        const radius = Math.random() * 6 + 2.5;
        const opacity = (1 - dist / 220) * (Math.random() * 0.75 + 0.25);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 240, 138, ${opacity})`;
        ctx.fill();

        // Nuclear remnant inside Wedl cell
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234, 179, 8, ${opacity * 0.9})`;
        ctx.fill();
      }

      // Radial feathery spokes of posterior subcapsular plaque
      for (let j = 0; j < 32; j++) {
        const a = (j / 32) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * 180, cy + Math.sin(a) * 180);
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
        ctx.lineWidth = 5;
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Three.js Scene Setup (Mounts once)
  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 620;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x080d1a);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const initialPos = getAnatomicalCoordinates('anterior', 4.8, 0.2);
    camera.position.copy(initialPos);
    cameraRef.current = camera;

    // 3. Renderer with local clipping planes
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 12;
    controls.minDistance = 1.2;
    controls.target.set(0, 0.2, 0);
    controlsRef.current = controls;

    // 5. Lighting Rig
    const lightingRig = setupStudioLighting(scene);
    lightingRigRef.current = lightingRig;
    setStudioLightingMode(lightingRig, 'cinematic');

    // 6. Contact Shadow Plane & Grid
    const shadowPlane = createContactShadowPlane(4.2, -1.85, 0.85);
    scene.add(shadowPlane);

    const gridHelper = new THREE.GridHelper(8, 20, 0x10b981, 0x1e293b);
    gridHelper.position.y = -1.84;
    scene.add(gridHelper);

    // ==========================================
    // BUILD 1: PROCEDURAL HOLOGRAPHIC HUMAN BODY
    // ==========================================
    const humanBodyGroup = humanBodyGroupRef.current;
    humanBodyGroup.clear();
    scene.add(humanBodyGroup);

    // Glass Translucent Torso Silhouette with Anatomical Contours
    const torsoMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      roughness: 0.16,
      transmission: 0.88,
      thickness: 1.35,
      transparent: true,
      opacity: 0.45,
      ior: 1.45,
      clearcoat: 0.35,
      clearcoatRoughness: 0.1,
      clippingPlanes: [clippingPlaneRef.current],
      clipShadows: true,
    });

    // Contoured Chest & Abdomen Torso Shell
    const torsoUpperGeo = new THREE.CylinderGeometry(0.56, 0.46, 0.75, 32);
    const torsoUpper = new THREE.Mesh(torsoUpperGeo, torsoMat);
    torsoUpper.position.y = 0.55;
    const torsoLowerGeo = new THREE.CylinderGeometry(0.46, 0.52, 0.7, 32);
    const torsoLower = new THREE.Mesh(torsoLowerGeo, torsoMat);
    torsoLower.position.y = -0.15;
    humanBodyGroup.add(torsoUpper, torsoLower);

    // Anatomical Rib Cage Hoops (Costal Cartilages)
    const ribMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.4,
      transparent: true,
      opacity: 0.35,
      clippingPlanes: [clippingPlaneRef.current],
    });
    for (let r = 0; r < 7; r++) {
      const ribGeo = new THREE.TorusGeometry(0.44 - r * 0.015, 0.014, 8, 32, Math.PI * 1.5);
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.rotation.x = Math.PI / 2;
      rib.rotation.z = Math.PI * 0.75;
      rib.position.set(0, 0.75 - r * 0.08, 0);
      humanBodyGroup.add(rib);
    }

    // Clavicles (Collar bones)
    const clavicleCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.88, 0.12),
      new THREE.Vector3(-0.25, 0.9, 0.1),
      new THREE.Vector3(-0.55, 0.86, 0.02),
    ]);
    const clavicleGeoL = new THREE.TubeGeometry(clavicleCurveL, 16, 0.022, 8, false);
    const clavicleCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.88, 0.12),
      new THREE.Vector3(0.25, 0.9, 0.1),
      new THREE.Vector3(0.55, 0.86, 0.02),
    ]);
    const clavicleGeoR = new THREE.TubeGeometry(clavicleCurveR, 16, 0.022, 8, false);
    humanBodyGroup.add(new THREE.Mesh(clavicleGeoL, ribMat), new THREE.Mesh(clavicleGeoR, ribMat));

    // Cranial Silhouette
    const headGeo = new THREE.SphereGeometry(0.38, 32, 32);
    headGeo.scale(0.95, 1.15, 1.05);
    const headMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      transmission: 0.85,
      thickness: 1.1,
      roughness: 0.18,
      ior: 1.4,
      transparent: true,
      opacity: 0.5,
      clippingPlanes: [clippingPlaneRef.current],
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.35;
    humanBodyGroup.add(head);

    // Limbs Contoured
    const armGeo = new THREE.CylinderGeometry(0.12, 0.09, 1.25, 16);
    const leftArm = new THREE.Mesh(armGeo, torsoMat);
    leftArm.position.set(-0.78, 0.3, 0);
    leftArm.rotation.z = 0.14;
    const rightArm = new THREE.Mesh(armGeo, torsoMat);
    rightArm.position.set(0.78, 0.3, 0);
    rightArm.rotation.z = -0.14;
    humanBodyGroup.add(leftArm, rightArm);

    const legGeo = new THREE.CylinderGeometry(0.18, 0.11, 1.55, 16);
    const leftLeg = new THREE.Mesh(legGeo, torsoMat);
    leftLeg.position.set(-0.28, -1.15, 0);
    const rightLeg = new THREE.Mesh(legGeo, torsoMat);
    rightLeg.position.set(0.28, -1.15, 0);
    humanBodyGroup.add(leftLeg, rightLeg);

    // ==========================================
    // INTERNAL MAJOR ORGANS (PBR & Clinical Photorealism)
    // ==========================================
    const organsMap = organsMeshMapRef.current;
    organsMap.clear();

    // 1. Brain: Cerebrum with Sulci/Gyri Bump Map, Cerebellum & Brainstem
    const brainGroup = new THREE.Group();
    const brainMat = new THREE.MeshPhysicalMaterial({
      color: 0xa855f7,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.25,
      bumpMap: createCorticalGyriTexture(),
      bumpScale: 0.035,
      emissive: 0x581c87,
      emissiveIntensity: 0.32,
      clippingPlanes: [clippingPlaneRef.current],
    });
    // Left & Right Cerebral Hemispheres
    const hemiGeoL = new THREE.SphereGeometry(0.22, 24, 24);
    hemiGeoL.scale(0.85, 0.95, 1.25);
    const hemiL = new THREE.Mesh(hemiGeoL, brainMat);
    hemiL.position.set(-0.1, 1.36, 0.03);
    const hemiGeoR = new THREE.SphereGeometry(0.22, 24, 24);
    hemiGeoR.scale(0.85, 0.95, 1.25);
    const hemiR = new THREE.Mesh(hemiGeoR, brainMat);
    hemiR.position.set(0.1, 1.36, 0.03);

    // Cerebellum (Posterior-Inferior)
    const cerebellumGeo = new THREE.SphereGeometry(0.13, 20, 16);
    cerebellumGeo.scale(1.2, 0.75, 0.85);
    const cerebellum = new THREE.Mesh(cerebellumGeo, brainMat);
    cerebellum.position.set(0, 1.18, -0.12);

    // Brainstem (Pons & Medulla)
    const stemGeo = new THREE.CylinderGeometry(0.045, 0.038, 0.22, 16);
    const brainstem = new THREE.Mesh(stemGeo, brainMat);
    brainstem.position.set(0, 1.1, -0.04);

    brainGroup.add(hemiL, hemiR, cerebellum, brainstem);
    humanBodyGroup.add(brainGroup);
    organsMap.set('brain', hemiL);

    // 2. Eye Lenses
    const eyeGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      roughness: 0.2,
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.16, 1.38, 0.32);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.16, 1.38, 0.32);
    humanBodyGroup.add(leftEye, rightEye);

    // 3. Spinal Cord: Serial Organ Architecture with Nerve Rootlets
    const spinalGroup = new THREE.Group();
    const spinalMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.3,
      emissive: 0xca8a04,
      emissiveIntensity: 0.45,
      clippingPlanes: [clippingPlaneRef.current],
    });
    const spinalPoints = [
      new THREE.Vector3(0, 1.05, -0.08),
      new THREE.Vector3(0, 0.7, -0.13),
      new THREE.Vector3(0, 0.3, -0.15),
      new THREE.Vector3(0, -0.1, -0.12),
      new THREE.Vector3(0, -0.5, -0.08),
    ];
    const spinalCurve = new THREE.CatmullRomCurve3(spinalPoints);
    const spinalGeo = new THREE.TubeGeometry(spinalCurve, 32, 0.032, 12, false);
    const spinalCord = new THREE.Mesh(spinalGeo, spinalMat);
    spinalGroup.add(spinalCord);

    // Segmental Vertebral Nerve Rings (Visualizing Serial Units)
    const nerveRingMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xeab308,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.7,
      clippingPlanes: [clippingPlaneRef.current],
    });
    for (let s = 1; s <= 12; s++) {
      const u = s / 13;
      const pt = spinalCurve.getPoint(u);
      const ringGeo = new THREE.TorusGeometry(0.048, 0.009, 8, 16);
      const ring = new THREE.Mesh(ringGeo, nerveRingMat);
      ring.position.copy(pt);
      ring.rotation.x = Math.PI / 2;
      spinalGroup.add(ring);
    }
    humanBodyGroup.add(spinalGroup);
    organsMap.set('spinal_cord', spinalCord);

    // 4. Lungs: Parallel Architecture with 3 Right Lobes & 2 Left Lobes + Bronchial Tree
    const lungMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      roughness: 0.45,
      emissive: 0x0891b2,
      emissiveIntensity: 0.25,
      clearcoat: 0.2,
      clippingPlanes: [clippingPlaneRef.current],
    });
    // Right Lung (3 lobes: Superior, Middle, Inferior)
    const rLungUpper = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16).scale(1.1, 1.4, 0.9), lungMat);
    rLungUpper.position.set(0.27, 0.65, 0.04);
    const rLungMid = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16).scale(1.2, 1.1, 0.95), lungMat);
    rLungMid.position.set(0.29, 0.48, 0.05);
    const rLungLower = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16).scale(1.3, 1.2, 1.0), lungMat);
    rLungLower.position.set(0.28, 0.32, 0.03);

    // Left Lung (2 lobes: Superior with Cardiac Notch, Inferior)
    const lLungUpper = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16).scale(1.0, 1.5, 0.88), lungMat);
    lLungUpper.position.set(-0.27, 0.62, 0.04);
    const lLungLower = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16).scale(1.25, 1.2, 0.95), lungMat);
    lLungLower.position.set(-0.28, 0.35, 0.03);

    // Bronchial Tree (Trachea & Primary/Secondary Bronchi)
    const airwayMat = new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x06b6d4, emissiveIntensity: 0.4 });
    const tracheaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.95, -0.02),
      new THREE.Vector3(0, 0.72, -0.04),
    ]);
    const trachea = new THREE.Mesh(new THREE.TubeGeometry(tracheaCurve, 12, 0.024, 8, false), airwayMat);
    const bronchusRCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.72, -0.04),
      new THREE.Vector3(0.15, 0.6, 0.01),
      new THREE.Vector3(0.24, 0.52, 0.03),
    ]);
    const bronchusR = new THREE.Mesh(new THREE.TubeGeometry(bronchusRCurve, 10, 0.016, 8, false), airwayMat);
    const bronchusLCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.72, -0.04),
      new THREE.Vector3(-0.16, 0.58, 0.01),
      new THREE.Vector3(-0.24, 0.5, 0.03),
    ]);
    const bronchusL = new THREE.Mesh(new THREE.TubeGeometry(bronchusLCurve, 10, 0.016, 8, false), airwayMat);

    humanBodyGroup.add(rLungUpper, rLungMid, rLungLower, lLungUpper, lLungLower, trachea, bronchusR, bronchusL);
    organsMap.set('lungs', rLungUpper);

    // 5. Anatomical Heart: Ventricles, Aorta Arch & Great Vessels
    const heartGroup = new THREE.Group();
    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      roughness: 0.28,
      emissive: 0x9f1239,
      emissiveIntensity: 0.45,
      clearcoat: 0.3,
      clippingPlanes: [clippingPlaneRef.current],
    });
    const heartVent = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20).scale(1.0, 1.25, 0.95), heartMat);
    heartVent.position.set(-0.06, 0.48, 0.09);
    heartVent.rotation.z = 0.25;

    // Aortic Arch & Branching Vessels
    const vesselMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.5 });
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.55, 0.08),
      new THREE.Vector3(-0.02, 0.68, 0.06),
      new THREE.Vector3(0.04, 0.66, 0.02),
      new THREE.Vector3(0.03, 0.48, -0.04),
    ]);
    const aorta = new THREE.Mesh(new THREE.TubeGeometry(aortaCurve, 20, 0.026, 8, false), vesselMat);
    // 3 Arch Branches (Brachiocephalic, Carotid, Subclavian)
    for (let b = 0; b < 3; b++) {
      const archBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.08, 8), vesselMat);
      archBranch.position.set(-0.03 + b * 0.025, 0.72, 0.05);
      heartGroup.add(archBranch);
    }
    heartGroup.add(heartVent, aorta);
    humanBodyGroup.add(heartGroup);
    organsMap.set('heart', heartVent);

    // 6. Liver & Gallbladder
    const liverGroup = new THREE.Group();
    const liverMat = new THREE.MeshPhysicalMaterial({
      color: 0xb45309,
      roughness: 0.38,
      emissive: 0x78350f,
      emissiveIntensity: 0.25,
      clearcoat: 0.25,
      clippingPlanes: [clippingPlaneRef.current],
    });
    // Right large lobe
    const rLobe = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 18).scale(1.3, 0.8, 1.05), liverMat);
    rLobe.position.set(0.22, 0.16, 0.07);
    // Left thinner lobe
    const lLobe = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16).scale(1.2, 0.65, 0.85), liverMat);
    lLobe.position.set(0.04, 0.18, 0.09);
    // Gallbladder (Green fundus)
    const gbMat = new THREE.MeshStandardMaterial({ color: 0x15803d, emissive: 0x166534, emissiveIntensity: 0.3 });
    const gallbladder = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12).scale(0.8, 1.3, 0.8), gbMat);
    gallbladder.position.set(0.18, 0.08, 0.12);
    liverGroup.add(rLobe, lLobe, gallbladder);
    humanBodyGroup.add(liverGroup);
    organsMap.set('liver', rLobe);

    // 7. Small & Large Intestines (GI Crypt Cells, 10–50 Gy)
    const giGroup = new THREE.Group();
    const giMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.45,
      emissive: 0xc2410c,
      emissiveIntensity: 0.35,
      clippingPlanes: [clippingPlaneRef.current],
    });
    // Duodenum C-loop
    const duodCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.05, 0.08),
      new THREE.Vector3(0.14, -0.02, 0.1),
      new THREE.Vector3(0.12, -0.12, 0.11),
      new THREE.Vector3(-0.02, -0.14, 0.12),
    ]);
    const duodenum = new THREE.Mesh(new THREE.TubeGeometry(duodCurve, 16, 0.038, 8, false), giMat);
    // Coiled Jejunum & Ileum loops
    const intestineTorus1 = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.048, 12, 24), giMat);
    intestineTorus1.position.set(0.02, -0.18, 0.11);
    const intestineTorus2 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.044, 12, 24), giMat);
    intestineTorus2.position.set(-0.08, -0.28, 0.13);
    const intestineTorus3 = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.04, 12, 24), giMat);
    intestineTorus3.position.set(0.08, -0.32, 0.12);
    giGroup.add(duodenum, intestineTorus1, intestineTorus2, intestineTorus3);
    humanBodyGroup.add(giGroup);
    organsMap.set('intestines', intestineTorus1);

    // 8. Bone Marrow / Pelvis & Trabecular Architecture (Hematopoietic, 1–10 Gy)
    const pelvisGroup = new THREE.Group();
    const marrowMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      roughness: 0.35,
      metalness: 0.05,
      bumpMap: createBoneTrabeculaeTexture(),
      bumpScale: 0.04,
      emissive: 0xb45309,
      emissiveIntensity: 0.45,
      clippingPlanes: [clippingPlaneRef.current],
    });
    // Iliac Crest Wings (Left & Right)
    const iliumGeoL = new THREE.TorusGeometry(0.24, 0.065, 12, 24, Math.PI);
    const iliumL = new THREE.Mesh(iliumGeoL, marrowMat);
    iliumL.rotation.y = Math.PI / 4;
    iliumL.position.set(-0.18, -0.42, 0.04);
    const iliumGeoR = new THREE.TorusGeometry(0.24, 0.065, 12, 24, Math.PI);
    const iliumR = new THREE.Mesh(iliumGeoR, marrowMat);
    iliumR.rotation.y = -Math.PI / 4;
    iliumR.position.set(0.18, -0.42, 0.04);
    // Sacrum / Pubic Arch
    const sacrum = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.03, 0.28, 12), marrowMat);
    sacrum.position.set(0, -0.46, -0.06);
    pelvisGroup.add(iliumL, iliumR, sacrum);
    humanBodyGroup.add(pelvisGroup);
    organsMap.set('marrow', iliumL);

    // ==========================================
    // BUILD 2: CELLULAR DNA RADIOLYSIS & DSB MODEL (img2threejs v2.0)
    // Asymmetric Major/Minor Grooves, Purine/Pyrimidine Plates, Histone Octamer & γ-H2AX Foci
    // ==========================================
    const dnaGroup = dnaModelGroupRef.current;
    dnaGroup.clear();
    scene.add(dnaGroup);
    dnaGroup.position.set(0, 0.2, 0);
    dnaGroup.visible = false; // toggled on 'dna' mode

    const helixRadius = 0.65;
    const helixHeight = 3.4;
    const turns = 3;
    const basePairsCount = 38;
    const strand1Points: THREE.Vector3[] = [];
    const strand2Points: THREE.Vector3[] = [];

    // Asymmetric angle offset: Major Groove (2.2nm) vs Minor Groove (1.2nm)
    const minorGrooveAngle = Math.PI * 0.72; // ~130 deg vs 230 deg

    for (let i = 0; i <= basePairsCount; i++) {
      const t = i / basePairsCount;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * helixHeight;

      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;
      strand1Points.push(new THREE.Vector3(x1, y, z1));

      const x2 = Math.cos(angle + minorGrooveAngle) * helixRadius;
      const z2 = Math.sin(angle + minorGrooveAngle) * helixRadius;
      strand2Points.push(new THREE.Vector3(x2, y, z2));

      // Skip rungs near center to simulate Double Strand Break (DSB) lesion from radiation!
      const isDsbBreakZone = i >= 17 && i <= 20;

      if (!isDsbBreakZone) {
        // Purine (Double-ring: wider) & Pyrimidine (Single-ring: narrower) Base Pairs
        const isAT = i % 2 === 0;
        const p1 = new THREE.Vector3(x1, y, z1);
        const p2 = new THREE.Vector3(x2, y, z2);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        // Half 1: Purine
        const purineCurve = new THREE.LineCurve3(p1, mid);
        const purineGeo = new THREE.TubeGeometry(purineCurve, 4, 0.042, 6, false);
        const purineMat = new THREE.MeshStandardMaterial({
          color: isAT ? 0x06b6d4 : 0x10b981,
          emissive: isAT ? 0x0284c7 : 0x059669,
          emissiveIntensity: 0.4,
          roughness: 0.3,
        });
        dnaGroup.add(new THREE.Mesh(purineGeo, purineMat));

        // Half 2: Pyrimidine
        const pyrimCurve = new THREE.LineCurve3(mid, p2);
        const pyrimGeo = new THREE.TubeGeometry(pyrimCurve, 4, 0.034, 6, false);
        const pyrimMat = new THREE.MeshStandardMaterial({
          color: isAT ? 0x38bdf8 : 0x34d399,
          emissive: isAT ? 0x0369a1 : 0x10b981,
          emissiveIntensity: 0.35,
          roughness: 0.3,
        });
        dnaGroup.add(new THREE.Mesh(pyrimGeo, pyrimMat));

        // Hydrogen Bond Connector Bridges (2 for A-T, 3 for G-C)
        const bondCount = isAT ? 2 : 3;
        for (let b = 0; b < bondCount; b++) {
          const bOffset = (b - (bondCount - 1) / 2) * 0.022;
          const bondGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.06, 6);
          const bondMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const bond = new THREE.Mesh(bondGeo, bondMat);
          bond.position.set(mid.x, mid.y + bOffset, mid.z);
          dnaGroup.add(bond);
        }
      }
    }

    // Sugar-Phosphate Backbones with PBR Clearcoat Shading
    const curve1 = new THREE.CatmullRomCurve3(strand1Points);
    const strandGeo1 = new THREE.TubeGeometry(curve1, 72, 0.055, 12, false);
    const strandMat1 = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.22,
      metalness: 0.25,
      clearcoat: 0.4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
    });
    const strand1Mesh = new THREE.Mesh(strandGeo1, strandMat1);

    const curve2 = new THREE.CatmullRomCurve3(strand2Points);
    const strandGeo2 = new THREE.TubeGeometry(curve2, 72, 0.055, 12, false);
    const strandMat2 = new THREE.MeshPhysicalMaterial({
      color: 0x818cf8,
      roughness: 0.22,
      metalness: 0.25,
      clearcoat: 0.4,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.35,
    });
    const strand2Mesh = new THREE.Mesh(strandGeo2, strandMat2);
    dnaGroup.add(strand1Mesh, strand2Mesh);

    // Histone Octamer Core Complex (Nucleosome Bead Packaging)
    const nucleosomeGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.38, 24);
    const nucleosomeMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      roughness: 0.35,
      clearcoat: 0.3,
      emissive: 0x4338ca,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.78,
    });
    const nucleosome = new THREE.Mesh(nucleosomeGeo, nucleosomeMat);
    nucleosome.position.set(0.85, 0.15, -0.2);
    nucleosome.rotation.z = Math.PI / 4;
    dnaGroup.add(nucleosome);

    // Radiation-Induced Double-Strand Break (DSB) Lesion & γ-H2AX Repair Foci
    const dsbFociGroup = new THREE.Group();
    dsbFociGroup.position.set(0, 0.05, 0);

    // Pulsating γ-H2AX / ATM Kinase Repair Complex Foci
    const dsbFociGeo = new THREE.SphereGeometry(0.18, 20, 20);
    const dsbFociMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      wireframe: true,
    });
    const dsbFoci = new THREE.Mesh(dsbFociGeo, dsbFociMat);

    // Fragmented glowing DNA Ends at Break Site
    const brokenEndGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const brokenEndMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const broken1 = new THREE.Mesh(brokenEndGeo, brokenEndMat);
    broken1.position.set(0.45, 0.15, 0.35);
    const broken2 = new THREE.Mesh(brokenEndGeo, brokenEndMat);
    broken2.position.set(-0.45, -0.08, -0.3);
    dsbFociGroup.add(dsbFoci, broken1, broken2);
    dnaGroup.add(dsbFociGroup);

    // Ionizing Radiation Photon / High-LET Track
    const radiationTrackCurve = new THREE.LineCurve3(
      new THREE.Vector3(-2.2, 0.8, -1.5),
      new THREE.Vector3(2.2, -0.7, 1.5)
    );
    const radiationTrackGeo = new THREE.TubeGeometry(radiationTrackCurve, 16, 0.015, 6, false);
    const radiationTrackMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const radiationTrack = new THREE.Mesh(radiationTrackGeo, radiationTrackMat);
    dnaGroup.add(radiationTrack);

    // Free Radicals Particles (.OH hydroxyl radical & e- aq)
    const radicalParticlesGeo = new THREE.BufferGeometry();
    const radicalCount = 110;
    const radicalPos = new Float32Array(radicalCount * 3);
    for (let i = 0; i < radicalCount * 3; i += 3) {
      radicalPos[i] = (Math.random() - 0.5) * 2.4;
      radicalPos[i + 1] = (Math.random() - 0.5) * 3.6;
      radicalPos[i + 2] = (Math.random() - 0.5) * 2.4;
    }
    radicalParticlesGeo.setAttribute('position', new THREE.BufferAttribute(radicalPos, 3));
    const radicalMat = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 0.085,
      transparent: true,
      opacity: 0.88,
    });
    const radicalParticles = new THREE.Points(radicalParticlesGeo, radicalMat);
    dnaGroup.add(radicalParticles);

    // ==========================================
    // BUILD 3: INTERACTIVE 3D ANATOMICAL PINS
    // ==========================================
    const pinsGroup = pinsGroupRef.current;
    pinsGroup.clear();
    scene.add(pinsGroup);

    RADIOBIOLOGY_PINS.forEach((pin, index) => {
      const color =
        pin.category === 'Hematopoietic'
          ? '#f59e0b'
          : pin.category === 'Gastrointestinal'
          ? '#ef4444'
          : pin.category === 'Cerebrovascular'
          ? '#a855f7'
          : pin.category === 'Serial'
          ? '#eab308'
          : pin.category === 'Teratogenic'
          ? '#ec4899'
          : pin.category === 'Hereditary'
          ? '#8b5cf6'
          : '#06b6d4';

      const spriteMat = new THREE.SpriteMaterial({
        map: createPinTexture(String(index + 1), color),
        depthTest: false,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.3, 0.3, 1);
      sprite.position.set(...pin.position);
      sprite.userData = { pinData: pin };
      pinsGroup.add(sprite);
    });

    // ==========================================
    // BUILD 4: PROCEDURAL FETAL TERATOGENESIS 3D MODEL (img2threejs v2.0)
    // Carnegie Stages 13-16 Anatomy: 3 Brain Vesicles, Branchial Arches, Digital Rays, Wharton's Jelly Triple-Braid Cord & Placenta
    // ==========================================
    const fetalGroup = fetalModelGroupRef.current;
    fetalGroup.clear();
    scene.add(fetalGroup);
    fetalGroup.position.set(0, 0.2, 0);
    fetalGroup.visible = false;

    // 1. Amniotic Sac with PBR Fluid Scattering & Discoid Placenta Plate
    const uterusGeo = new THREE.SphereGeometry(1.45, 36, 28);
    const uterusMat = new THREE.MeshPhysicalMaterial({
      color: 0x9d174d,
      roughness: 0.15,
      transmission: 0.88,
      thickness: 1.8,
      transparent: true,
      opacity: 0.35,
      ior: 1.34,
      clippingPlanes: [clippingPlaneRef.current],
    });
    const uterus = new THREE.Mesh(uterusGeo, uterusMat);
    uterus.scale.set(0.92, 1.22, 0.88);
    fetalGroup.add(uterus);

    // Discoid Placenta (Maternal surface with Cotyledons)
    const placentaGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.12, 32);
    const placentaMat = new THREE.MeshPhysicalMaterial({
      color: 0x881337,
      roughness: 0.38,
      bumpMap: createBoneTrabeculaeTexture(),
      bumpScale: 0.035,
      emissive: 0x4c0519,
      emissiveIntensity: 0.3,
      clippingPlanes: [clippingPlaneRef.current],
    });
    const placenta = new THREE.Mesh(placentaGeo, placentaMat);
    placenta.position.set(0.65, -0.65, 0.25);
    placenta.rotation.x = Math.PI / 4;
    placenta.rotation.z = Math.PI / 6;
    fetalGroup.add(placenta);

    // 2. Developing Embryo / Fetus Body Group
    const embryoGroup = new THREE.Group();
    fetalGroup.add(embryoGroup);

    // Embryo Subcutaneous PBR Skin Material
    const embryoSkinMat = new THREE.MeshPhysicalMaterial({
      color: 0xfce7f3,
      roughness: 0.28,
      transmission: 0.22,
      thickness: 0.65,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.16,
      clearcoat: 0.25,
      clippingPlanes: [clippingPlaneRef.current],
    });

    // Anatomical Embryo Cranium
    const embryoHeadGeo = new THREE.SphereGeometry(0.46, 32, 32);
    embryoHeadGeo.scale(0.95, 1.05, 1.15);
    const embryoHead = new THREE.Mesh(embryoHeadGeo, embryoSkinMat);
    embryoHead.position.set(0, 0.44, 0.12);
    embryoGroup.add(embryoHead);

    // 3 Primary Brain Vesicles: Forebrain (Telencephalon), Midbrain (Mesencephalon), Hindbrain (Rhombencephalon)
    const forebrainGeo = new THREE.SphereGeometry(0.33, 24, 24);
    const midbrainGeo = new THREE.SphereGeometry(0.28, 20, 20);
    const hindbrainGeo = new THREE.SphereGeometry(0.24, 20, 20);
    const fetalBrainMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const forebrain = new THREE.Mesh(forebrainGeo, fetalBrainMat);
    forebrain.position.set(0, 0.5, 0.15);
    const midbrain = new THREE.Mesh(midbrainGeo, fetalBrainMat);
    midbrain.position.set(0, 0.36, -0.06);
    const hindbrain = new THREE.Mesh(hindbrainGeo, fetalBrainMat);
    hindbrain.position.set(0, 0.18, -0.08);
    embryoGroup.add(forebrain, midbrain, hindbrain);

    // Carnegie Pharyngeal / Branchial Arches (1st Mandibular arch, 2nd Hyoid arch)
    const archMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.35, emissive: 0xdb2777, emissiveIntensity: 0.2 });
    const arch1 = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.024, 8, 16, Math.PI), archMat);
    arch1.position.set(0, 0.26, 0.22);
    arch1.rotation.x = Math.PI / 3;
    const arch2 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 8, 16, Math.PI), archMat);
    arch2.position.set(0, 0.2, 0.2);
    arch2.rotation.x = Math.PI / 3;
    embryoGroup.add(arch1, arch2);

    // Optic Cups & Lens Placodes (Bilateral)
    const eyeCupGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const eyeCupMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const eyeLensPlacodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const eyeLensPlacodeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.95 });
    const eyeL = new THREE.Mesh(eyeCupGeo, eyeCupMat);
    eyeL.position.set(0.26, 0.46, 0.36);
    const placodeL = new THREE.Mesh(eyeLensPlacodeGeo, eyeLensPlacodeMat);
    placodeL.position.set(0.28, 0.47, 0.39);
    const eyeR = new THREE.Mesh(eyeCupGeo, eyeCupMat);
    eyeR.position.set(-0.26, 0.46, 0.36);
    const placodeR = new THREE.Mesh(eyeLensPlacodeGeo, eyeLensPlacodeMat);
    placodeR.position.set(-0.28, 0.47, 0.39);
    embryoGroup.add(eyeL, placodeL, eyeR, placodeR);

    // Natural C-shaped Embryonic Body Curve
    const spinePoints = [
      new THREE.Vector3(0, 0.4, 0.05),
      new THREE.Vector3(-0.16, 0.22, 0.02),
      new THREE.Vector3(-0.28, 0.02, -0.02),
      new THREE.Vector3(-0.26, -0.22, 0.01),
      new THREE.Vector3(-0.12, -0.42, 0.08),
      new THREE.Vector3(0.14, -0.48, 0.2),
    ];
    const spineCurve = new THREE.CatmullRomCurve3(spinePoints);
    const spineGeo = new THREE.TubeGeometry(spineCurve, 48, 0.19, 18, false);
    const spineMesh = new THREE.Mesh(spineGeo, embryoSkinMat);
    embryoGroup.add(spineMesh);

    // 14 Segmented Paired Mesodermal Somites along Spine
    const somiteMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.38,
      emissive: 0xdb2777,
      emissiveIntensity: 0.3,
    });
    for (let s = 1; s <= 14; s++) {
      const u = s / 15;
      const pt = spineCurve.getPoint(u);
      const somiteGeo = new THREE.BoxGeometry(0.055, 0.045, 0.045);
      const somiteL = new THREE.Mesh(somiteGeo, somiteMat);
      somiteL.position.set(pt.x + 0.12, pt.y, pt.z);
      const somiteR = new THREE.Mesh(somiteGeo, somiteMat);
      somiteR.position.set(pt.x - 0.12, pt.y, pt.z);
      embryoGroup.add(somiteL, somiteR);
    }

    // Beating Embryonic Tubular Heart (Pericardial Prominence)
    const heartTubeGeo = new THREE.SphereGeometry(0.14, 20, 20);
    const heartTubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.8,
      roughness: 0.22,
      clearcoat: 0.35,
    });
    const fetalHeart = new THREE.Mesh(heartTubeGeo, heartTubeMat);
    fetalHeart.position.set(0.02, 0.14, 0.24);
    embryoGroup.add(fetalHeart);

    // Paddle-Shaped Limb Buds with Digital Rays (Fingers / Toes formation)
    const limbMat = embryoSkinMat.clone();
    // Arm Bud (Upper paddle plate)
    const armBudGeo = new THREE.CapsuleGeometry(0.075, 0.25, 8, 16);
    const armBud = new THREE.Mesh(armBudGeo, limbMat);
    armBud.rotation.z = Math.PI / 3.8;
    armBud.position.set(0.2, 0.08, 0.24);
    // Digital ray ridges on hand paddle
    for (let d = 0; d < 5; d++) {
      const rayGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.07, 6);
      const ray = new THREE.Mesh(rayGeo, limbMat);
      ray.position.set(0.27 + (d - 2) * 0.015, 0.16, 0.26);
      embryoGroup.add(ray);
    }
    // Leg Bud (Lower paddle plate)
    const legBud = new THREE.Mesh(armBudGeo, limbMat);
    legBud.rotation.z = -Math.PI / 4.5;
    legBud.position.set(0.14, -0.34, 0.27);
    embryoGroup.add(armBud, legBud);

    // Helical 3-Vessel Umbilical Cord encased in Wharton's Jelly Sheath
    const cordLength = 40;
    const arteryPoints1: THREE.Vector3[] = [];
    const arteryPoints2: THREE.Vector3[] = [];
    const veinPoints: THREE.Vector3[] = [];
    for (let c = 0; c <= cordLength; c++) {
      const t = c / cordLength;
      const angle = t * Math.PI * 5.2;
      const baseX = t * 0.65;
      const baseY = -0.1 - t * 0.55;
      const baseZ = 0.15 + t * 0.1;
      const r = 0.042;
      arteryPoints1.push(new THREE.Vector3(baseX + Math.cos(angle) * r, baseY + Math.sin(angle) * r, baseZ));
      arteryPoints2.push(new THREE.Vector3(baseX + Math.cos(angle + Math.PI) * r, baseY + Math.sin(angle + Math.PI) * r, baseZ));
      veinPoints.push(new THREE.Vector3(baseX, baseY, baseZ));
    }
    const cordVeinGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(veinPoints), 36, 0.038, 8, false);
    const cordArteryGeo1 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arteryPoints1), 36, 0.022, 6, false);
    const cordArteryGeo2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arteryPoints2), 36, 0.022, 6, false);
    const veinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.35 });
    const arteryMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.35 });

    // Translucent Wharton's Jelly Sheath Tube wrapping the vessels
    const whartonJellyGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(veinPoints), 36, 0.075, 12, false);
    const whartonJellyMat = new THREE.MeshPhysicalMaterial({
      color: 0xf1f5f9,
      transmission: 0.88,
      thickness: 0.8,
      roughness: 0.1,
      transparent: true,
      opacity: 0.45,
    });
    embryoGroup.add(new THREE.Mesh(whartonJellyGeo, whartonJellyMat));
    embryoGroup.add(new THREE.Mesh(cordVeinGeo, veinMat));
    embryoGroup.add(new THREE.Mesh(cordArteryGeo1, arteryMat));
    embryoGroup.add(new THREE.Mesh(cordArteryGeo2, arteryMat));

    // Neuroblast Migration Particles (Showing cortex migration wave disrupted 8-15wk)
    const neuroParticlesGeo = new THREE.BufferGeometry();
    const neuroCount = 90;
    const neuroPositions = new Float32Array(neuroCount * 3);
    for (let i = 0; i < neuroCount * 3; i += 3) {
      neuroPositions[i] = (Math.random() - 0.5) * 0.75;
      neuroPositions[i + 1] = 0.46 + (Math.random() - 0.5) * 0.65;
      neuroPositions[i + 2] = 0.12 + (Math.random() - 0.5) * 0.75;
    }
    neuroParticlesGeo.setAttribute('position', new THREE.BufferAttribute(neuroPositions, 3));
    const neuroMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.065,
      transparent: true,
      opacity: 0.92,
    });
    const neuroParticles = new THREE.Points(neuroParticlesGeo, neuroMat);
    fetalGroup.add(neuroParticles);

    // ==========================================
    // BUILD 5: PROCEDURAL OCULAR LENS & CATARACT MODEL (img2threejs v2.0)
    // Ciliary Processes, Zonules of Zinn, Biconvex Lens with Y-sutures, Wedl Bladder Cells & Slit-lamp beam
    // ==========================================
    const cataractGroup = cataractModelGroupRef.current;
    cataractGroup.clear();
    scene.add(cataractGroup);
    cataractGroup.position.set(0, 0.2, 0);
    cataractGroup.visible = false;

    // 1. Eyeball Globe (Sclera) with Coronal Cutaway
    const eyeGlobeGeo = new THREE.SphereGeometry(1.4, 36, 28);
    const scleraMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.22,
      clearcoat: 0.3,
      metalness: 0.05,
      clippingPlanes: [clippingPlaneRef.current],
    });
    const sclera = new THREE.Mesh(eyeGlobeGeo, scleraMat);
    cataractGroup.add(sclera);

    // 2. Cornea Anterior Transparent Dome with Optical Refraction (IOR 1.376)
    const corneaGeo = new THREE.SphereGeometry(0.88, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2.1);
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0f9ff,
      roughness: 0.03,
      transmission: 0.98,
      thickness: 0.95,
      ior: 1.376,
      clearcoat: 0.6,
      transparent: true,
      opacity: 0.62,
    });
    const cornea = new THREE.Mesh(corneaGeo, corneaMat);
    cornea.rotation.x = Math.PI / 2;
    cornea.position.set(0, 0, 0.78);
    cataractGroup.add(cornea);

    // 3. Iris with Radial Stromal Fibrils Texture & Pupillary Aperture
    const irisGeo = new THREE.RingGeometry(0.24, 0.68, 40);
    const irisMat = new THREE.MeshStandardMaterial({
      map: createIrisTexture(),
      roughness: 0.32,
      side: THREE.DoubleSide,
    });
    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.set(0, 0, 0.66);
    cataractGroup.add(iris);

    // Ciliary Body Ring & Radial Ciliary Processes
    const ciliaryBodyGeo = new THREE.TorusGeometry(0.72, 0.06, 12, 36);
    const ciliaryMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    const ciliaryBody = new THREE.Mesh(ciliaryBodyGeo, ciliaryMat);
    ciliaryBody.position.set(0, 0, 0.46);
    cataractGroup.add(ciliaryBody);

    // 4. Zonules of Zinn (32 delicate radial suspensory ligament fibers)
    const zonuleMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.65 });
    for (let z = 0; z < 32; z++) {
      const angle = (z / 32) * Math.PI * 2;
      const pInner = new THREE.Vector3(Math.cos(angle) * 0.55, Math.sin(angle) * 0.55, 0.4);
      const pOuter = new THREE.Vector3(Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, 0.46);
      const zonuleCurve = new THREE.LineCurve3(pInner, pOuter);
      const zonuleMesh = new THREE.Mesh(new THREE.TubeGeometry(zonuleCurve, 4, 0.007, 4, false), zonuleMat);
      cataractGroup.add(zonuleMesh);
    }

    // 5. Biconvex Crystalline Lens (Anterior + Posterior Curvature, IOR 1.406)
    const lensGeo = new THREE.SphereGeometry(0.56, 36, 36);
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.06,
      transmission: 0.94,
      thickness: 1.35,
      ior: 1.406,
      clearcoat: 0.5,
      transparent: true,
      opacity: 0.82,
      clippingPlanes: [clippingPlaneRef.current],
    });
    const crystallineLens = new THREE.Mesh(lensGeo, lensMat);
    crystallineLens.scale.set(1.0, 1.0, 0.44);
    crystallineLens.position.set(0, 0, 0.4);
    cataractGroup.add(crystallineLens);

    // Anatomical Y-Sutures (Upright Y Anteriorly & Inverted Y Posteriorly)
    const sutureMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.55 });
    for (let arm = 0; arm < 3; arm++) {
      const aAngle = (arm * Math.PI * 2) / 3 + Math.PI / 2;
      const sCurve = new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0.48),
        new THREE.Vector3(Math.cos(aAngle) * 0.28, Math.sin(aAngle) * 0.28, 0.46)
      );
      cataractGroup.add(new THREE.Mesh(new THREE.TubeGeometry(sCurve, 6, 0.008, 4, false), sutureMat));
    }

    // Central Embryonic Lens Nucleus
    const nucleusGeo = new THREE.SphereGeometry(0.28, 24, 24);
    const nucleusMat = new THREE.MeshPhysicalMaterial({
      color: 0xfef9c3,
      roughness: 0.12,
      transmission: 0.86,
      transparent: true,
      opacity: 0.52,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleus.scale.set(1.0, 1.0, 0.4);
    nucleus.position.set(0, 0, 0.4);
    cataractGroup.add(nucleus);

    // 6. Equatorial Germinative Epithelial Ring & Proliferating Mitotic Cells
    const equatorialRingGeo = new THREE.TorusGeometry(0.55, 0.038, 16, 36);
    const equatorialMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.2,
    });
    const equatorialRing = new THREE.Mesh(equatorialRingGeo, equatorialMat);
    equatorialRing.position.set(0, 0, 0.4);
    cataractGroup.add(equatorialRing);

    // 16 Mitotic Green Cells on Equator
    const mitoticCellGeo = new THREE.SphereGeometry(0.034, 12, 12);
    const mitoticCellMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 1.45,
    });
    for (let m = 0; m < 16; m++) {
      const angle = (m / 16) * Math.PI * 2;
      const cell = new THREE.Mesh(mitoticCellGeo, mitoticCellMat);
      cell.position.set(Math.cos(angle) * 0.55, Math.sin(angle) * 0.55, 0.4);
      cataractGroup.add(cell);
    }

    // Aberrant Wedl Bladder Cell Migration Stream (Crawling posteriorly under capsule)
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7,
    });
    for (let c = 0; c < 12; c++) {
      const a = (c / 12) * Math.PI * 2;
      const streamCell = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), streamMat);
      streamCell.position.set(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0.33);
      cataractGroup.add(streamCell);
    }

    // 7. Posterior Subcapsular Cataract (PSC) Plaque with Granular Wedl Bladder Cells Texture
    const pscGeo = new THREE.SphereGeometry(0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.9);
    const pscMat = new THREE.MeshStandardMaterial({
      map: createCataractGranularTexture(),
      color: 0xfef08a,
      roughness: 0.85,
      emissive: 0xeab308,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const pscMesh = new THREE.Mesh(pscGeo, pscMat);
    pscMesh.rotation.x = -Math.PI / 2;
    pscMesh.position.set(0, 0, 0.25);
    cataractGroup.add(pscMesh);
    pscMeshRef.current = pscMesh;

    // 8. Clinical Slit-Lamp Biomicroscopy Optical Section Beam (Tyndall optical flare)
    const slitBeamGeo = new THREE.PlaneGeometry(0.14, 2.7);
    const slitBeamMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const slitBeam = new THREE.Mesh(slitBeamGeo, slitBeamMat);
    slitBeam.rotation.y = Math.PI / 4;
    slitBeam.rotation.z = Math.PI / 6;
    slitBeam.position.set(0.1, 0, 0.45);
    cataractGroup.add(slitBeam);

    // 7. Raycasting for Pin selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pinsGroup.children, true);
      if (intersects.length > 0) {
        const hitPin = intersects[0].object.userData.pinData as AnatomyPin;
        if (hitPin) {
          setSelectedPin(hitPin);
        }
      }
    };
    canvasRef.current.addEventListener('pointerdown', handlePointerDown);

    // 8. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow idle rotation of body or DNA
      if (activeMode === 'dna') {
        dnaGroup.rotation.y = elapsed * 0.4;
      } else if (activeMode === 'fetal') {
        fetalGroup.position.y = 0.2 + Math.sin(elapsed * 1.6) * 0.035;
        fetalGroup.rotation.y = Math.sin(elapsed * 0.6) * 0.18;
      } else if (activeMode === 'cataract') {
        cataractGroup.rotation.y = Math.sin(elapsed * 0.4) * 0.12;
      }

      // Heartbeat pulse
      const heartMesh = organsMap.get('heart');
      if (heartMesh) {
        const scale = 1 + Math.sin(elapsed * 4.5) * 0.05;
        heartMesh.scale.set(scale, scale * 1.2, scale * 0.9);
      }

      // Pin floating bob
      pinsGroup.children.forEach((p, idx) => {
        p.position.y = RADIOBIOLOGY_PINS[idx].position[1] + Math.sin(elapsed * 3 + idx) * 0.02;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvasRef.current?.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
    };
  }, []); // Run once!

  // Update Display Mode (Anatomy / DNA / Serial vs Parallel / Fetal / Cataract)
  useEffect(() => {
    if (
      humanBodyGroupRef.current &&
      dnaModelGroupRef.current &&
      fetalModelGroupRef.current &&
      cataractModelGroupRef.current &&
      pinsGroupRef.current
    ) {
      humanBodyGroupRef.current.visible = activeMode === 'anatomy' || activeMode === 'serial_parallel';
      dnaModelGroupRef.current.visible = activeMode === 'dna';
      fetalModelGroupRef.current.visible = activeMode === 'fetal';
      cataractModelGroupRef.current.visible = activeMode === 'cataract';
      pinsGroupRef.current.visible = activeMode === 'anatomy';
    }
  }, [activeMode]);

  // Update Cataract Opacity based on lensDoseGy
  useEffect(() => {
    if (pscMeshRef.current) {
      const mat = pscMeshRef.current.material as THREE.MeshStandardMaterial;
      const op = Math.min(0.95, Math.max(0.08, lensDoseGy / 2.2));
      mat.opacity = op;
      mat.emissiveIntensity = lensDoseGy >= 1.0 ? 0.45 : 0.15;
    }
  }, [lensDoseGy]);

  // Update Clipping Plane Cutaway
  useEffect(() => {
    if (clippingPlaneRef.current) {
      clippingPlaneRef.current.constant = isCutawayOn ? 0.05 : 10;
    }
  }, [isCutawayOn]);

  // Update Organ Emission & Color Based on Dose
  useEffect(() => {
    const marrow = organsMeshMapRef.current.get('marrow');
    const intestines = organsMeshMapRef.current.get('intestines');
    const brain = organsMeshMapRef.current.get('brain');

    if (marrow && (marrow.material as THREE.MeshStandardMaterial)) {
      const mat = marrow.material as THREE.MeshStandardMaterial;
      if (doseGy >= 1.0 && doseGy <= 10.0) {
        mat.emissive.setHex(0xf59e0b);
        mat.emissiveIntensity = 0.85;
      } else if (doseGy > 10.0) {
        mat.emissive.setHex(0xb91c1c);
        mat.emissiveIntensity = 0.95;
      } else {
        mat.emissive.setHex(0x059669);
        mat.emissiveIntensity = 0.25;
      }
    }

    if (intestines && (intestines.material as THREE.MeshStandardMaterial)) {
      const mat = intestines.material as THREE.MeshStandardMaterial;
      if (doseGy >= 10.0 && doseGy <= 50.0) {
        mat.emissive.setHex(0xef4444);
        mat.emissiveIntensity = 0.95;
      } else if (doseGy > 50.0) {
        mat.emissive.setHex(0x7f1d1d);
        mat.emissiveIntensity = 1.1;
      } else {
        mat.emissive.setHex(0x059669);
        mat.emissiveIntensity = 0.2;
      }
    }

    if (brain && (brain.material as THREE.MeshStandardMaterial)) {
      const mat = brain.material as THREE.MeshStandardMaterial;
      if (doseGy > 50.0) {
        mat.emissive.setHex(0xd946ef);
        mat.emissiveIntensity = 1.3;
      } else {
        mat.emissive.setHex(0x4c1d95);
        mat.emissiveIntensity = 0.25;
      }
    }
  }, [doseGy]);

  // Camera preset selection
  const handleViewSelect = (v: AnatomicalView) => {
    setActiveView(v);
    if (cameraRef.current && controlsRef.current) {
      const pos = getAnatomicalCoordinates(v, 4.8, 0.2);
      smoothTransitionCamera(cameraRef.current, controlsRef.current, pos, new THREE.Vector3(0, 0.2, 0), 650);
    }
  };

  const handleLightingChange = (mode: LightingMode) => {
    setLightingMode(mode);
    if (lightingRigRef.current) {
      setStudioLightingMode(lightingRigRef.current, mode);
    }
  };

  const resetCamera = useCallback(() => {
    handleViewSelect('anterior');
  }, []);

  return (
    <div
      ref={mountRef}
      className={`${styles.workstationContainer} ${isFullscreen ? styles.fullscreen : ''} ${
        isTheater ? styles.theater : ''
      }`}
      style={{
        minHeight: isFullscreen ? '100dvh' : '640px',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100dvh' : 'auto',
        zIndex: isFullscreen ? 99999 : undefined,
      }}
    >
      {/* Top Header Bar */}
      <div className={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={styles.bioBadge}>
            <Dna size={16} />
            <span>3D Radiobiology Studio</span>
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
            แบบจำลองผลของรังสีต่อร่างกายและอวัยวะ (Radiobiology & ARS Simulator)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Lighting Mode */}
          <button
            onClick={() =>
              handleLightingChange(
                lightingMode === 'clinical' ? 'cinematic' : lightingMode === 'cinematic' ? 'radiology' : 'clinical'
              )
            }
            className={styles.iconButton}
            title={`โหมดแสง: ${lightingMode}`}
          >
            {lightingMode === 'clinical' ? <Sun size={16} /> : <Sparkles size={16} />}
          </button>

          {/* Cutaway Cross Section */}
          <button
            onClick={() => setIsCutawayOn((prev) => !prev)}
            className={`${styles.iconButton} ${isCutawayOn ? styles.active : ''}`}
            title={isCutawayOn ? 'ปิดการผ่าตัดขวาง (Cutaway OFF)' : 'เปิดการผ่าตัดขวาง (Coronal Cutaway ON)'}
          >
            <Scissors size={16} />
          </button>

          {/* Theater Mode */}
          <button
            onClick={() => setIsTheater((prev) => !prev)}
            className={`${styles.iconButton} ${isTheater ? styles.active : ''}`}
            title="โรงภาพยนตร์ (Theater Mode)"
          >
            <Layers size={16} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className={styles.iconButton}
            title={isFullscreen ? 'ออกจากเต็มจอ (Esc)' : 'ขยายเต็มจอ (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Mode Tabs (Anatomy / DNA / Serial vs Parallel) */}
      <div className={styles.modeTabs}>
        <button
          className={`${styles.modeTabBtn} ${activeMode === 'anatomy' ? styles.active : ''}`}
          onClick={() => setActiveMode('anatomy')}
        >
          <Activity size={14} />
          <span>Whole-Body ARS</span>
        </button>
        <button
          className={`${styles.modeTabBtn} ${activeMode === 'dna' ? styles.active : ''}`}
          onClick={() => setActiveMode('dna')}
        >
          <Dna size={14} />
          <span>DNA Radiolysis</span>
        </button>
        <button
          className={`${styles.modeTabBtn} ${activeMode === 'serial_parallel' ? styles.active : ''}`}
          onClick={() => setActiveMode('serial_parallel')}
        >
          <Sliders size={14} />
          <span>Serial vs Parallel</span>
        </button>
        <button
          className={`${styles.modeTabBtn} ${activeMode === 'fetal' ? styles.active : ''}`}
          onClick={() => setActiveMode('fetal')}
        >
          <Baby size={14} />
          <span>Fetal Teratogenesis</span>
        </button>
        <button
          className={`${styles.modeTabBtn} ${activeMode === 'cataract' ? styles.active : ''}`}
          onClick={() => setActiveMode('cataract')}
        >
          <Eye size={14} />
          <span>Lens Cataract</span>
        </button>
      </div>

      {/* Anatomical Camera View Presets */}
      <div className={styles.viewPresets}>
        {(['anterior', 'right', 'superior', 'isometric'] as AnatomicalView[]).map((v) => (
          <button
            key={v}
            onClick={() => handleViewSelect(v)}
            className={`${styles.viewBtn} ${activeView === v ? styles.active : ''}`}
          >
            {v === 'anterior' ? 'หน้าตรง (XY)' : v === 'right' ? 'ด้านข้าง (ZY)' : v === 'superior' ? 'มุมบน (XZ)' : '3D ไอโซ'}
          </button>
        ))}
        <button onClick={resetCamera} className={styles.viewBtn} title="รีเซ็ตมุมมองกล้อง">
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className={styles.canvasWrapper} />

      {/* ARS Dose Controller HUD (Bottom Left for anatomy, serial_parallel, dna) */}
      {(activeMode === 'anatomy' || activeMode === 'serial_parallel' || activeMode === 'dna') && (
        <div className={styles.arsControlPanel}>
          <div className={styles.arsHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color={arsStatus.color} />
              <span className={styles.arsStageTitle} style={{ color: arsStatus.color }}>
                {arsStatus.stage}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Dose: {doseGy.toFixed(1)} Gy (Sv)</span>
          </div>

          {/* Dose Slider */}
          <div className={styles.doseSliderWrapper}>
            <input
              type="range"
              min="0"
              max="60"
              step="0.5"
              value={doseGy}
              onChange={(e) => setDoseGy(parseFloat(e.target.value))}
              className={styles.doseSlider}
            />
            <div className={styles.doseMarkers}>
              <span>0 Gy</span>
              <span>1 Gy (BM)</span>
              <span>4 Gy (LD50)</span>
              <span>10 Gy (GI)</span>
              <span>50 Gy (CNS)</span>
              <span>60 Gy</span>
            </div>
          </div>

          {/* ARS Live Telemetry Stats */}
          <div className={styles.arsGrid}>
            <div className={styles.arsStat}>
              <div className={styles.statLabel}>อัตราการรอดชีวิต (Survival)</div>
              <div className={styles.statValue} style={{ color: arsStatus.color }}>
                {arsStatus.survival}
              </div>
            </div>
            <div className={styles.arsStat}>
              <div className={styles.statLabel}>กลุ่มอาการหลัก (Syndrome)</div>
              <div className={styles.statValue} style={{ fontSize: '0.78rem', color: '#f8fafc' }}>
                {doseGy < 1 ? 'Subclinical' : doseGy <= 10 ? 'Hematopoietic' : doseGy <= 50 ? 'Gastrointestinal' : 'CNS / Vascular'}
              </div>
            </div>
          </div>

          {/* Clinical Symptoms & Intervention */}
          <div style={{ marginTop: '0.65rem', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            <strong style={{ color: '#f8fafc' }}>อาการแสดง:</strong> {arsStatus.symptoms}
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: '#94a3b8' }}>
            <strong style={{ color: '#34d399' }}>แนวทางรักษา:</strong> {arsStatus.intervention}
          </div>

          {/* Radioprotector Toggle in DNA Mode */}
          {activeMode === 'dna' && (
            <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(148, 163, 184, 0.2)', paddingTop: '0.6rem' }}>
              <button
                onClick={() => setIsAmifostineOn((prev) => !prev)}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: isAmifostineOn ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                  border: isAmifostineOn ? '1px solid #10b981' : '1px solid rgba(148, 163, 184, 0.3)',
                  color: isAmifostineOn ? '#34d399' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Shield size={14} />
                <span>สารต้านรังสี Amifostine (WR-2721): {isAmifostineOn ? 'ON (ดักจับอนุมูลอิสระ)' : 'OFF'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fetal Gestational Radiation HUD */}
      {activeMode === 'fetal' && (
        <div className={styles.arsControlPanel} style={{ maxWidth: '420px', borderColor: 'rgba(236, 72, 153, 0.4)' }}>
          <div className={styles.arsHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Baby size={16} color="#ec4899" />
              <span className={styles.arsStageTitle} style={{ color: '#ec4899' }}>
                {gestationalWeek <= 1
                  ? 'Pre-implantation (0–7 วัน)'
                  : gestationalWeek <= 2
                  ? 'Implantation (8–14 วัน)'
                  : gestationalWeek <= 8
                  ? 'Major Organogenesis (สัปดาห์ที่ 2–8)'
                  : gestationalWeek <= 15
                  ? 'Early Fetal: Neural Migration (สัปดาห์ที่ 8–15)'
                  : gestationalWeek <= 25
                  ? 'Mid Fetal: Cortex Maturation (สัปดาห์ที่ 16–25)'
                  : 'Late Fetal (สัปดาห์ที่ 26+)'}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#f472b6', fontWeight: 700 }}>GA: {gestationalWeek} สัปดาห์</span>
          </div>

          <div className={styles.doseSliderWrapper}>
            <input
              type="range"
              min="0"
              max="38"
              step="1"
              value={gestationalWeek}
              onChange={(e) => setGestationalWeek(parseInt(e.target.value, 10))}
              className={styles.doseSlider}
              style={{ accentColor: '#ec4899' }}
            />
            <div className={styles.doseMarkers}>
              <span>0w (All/None)</span>
              <span>4w (Organs)</span>
              <span>10w (Neurons)</span>
              <span>20w</span>
              <span>38w (Term)</span>
            </div>
          </div>

          <div className={styles.arsGrid}>
            <div className={styles.arsStat} style={{ borderColor: 'rgba(236, 72, 153, 0.25)' }}>
              <div className={styles.statLabel}>ผลกระทบหลัก (Major Effect)</div>
              <div className={styles.statValue} style={{ fontSize: '0.74rem', color: '#fbcfe8' }}>
                {gestationalWeek <= 1
                  ? 'All or None (ตาย/รอด 0.1 Sv)'
                  : gestationalWeek <= 8
                  ? 'ความพิการเชิงโครงสร้าง (Malformation 0.25 Sv)'
                  : gestationalWeek <= 15
                  ? 'ปัญญาอ่อน (Neurons 0.12–0.2 Gy)'
                  : 'ความเสี่ยงลดลง (Threshold ~0.6–0.7 Sv)'}
              </div>
            </div>
            <div className={styles.arsStat} style={{ borderColor: 'rgba(236, 72, 153, 0.25)' }}>
              <div className={styles.statLabel}>เกณฑ์ปลอดภัยสากล</div>
              <div className={styles.statValue} style={{ fontSize: '0.74rem', color: '#34d399' }}>
                NCRP &le; 500 mRem | Cutoff 100 mSv
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.65rem', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            <strong style={{ color: '#fbcfe8' }}>กลไกพยาธิสรีรวิทยา:</strong>{' '}
            {gestationalWeek <= 1
              ? 'Omnipotent cells — หากเสียหายมากจะแท้งก่อนฝังตัว (Prenatal death) หากรอดเซลล์จะซ่อมแซมได้สมบูรณ์'
              : gestationalWeek <= 8
              ? 'อวัยวะสำคัญกำลังสร้างรูปร่าง รังสีทำให้เซลล์ตัวอ่อนตาย นำไปสู่ Microphthalmia, Cleft palate, Skeletal deformities'
              : gestationalWeek <= 15
              ? 'การแบ่งตัวและการเคลื่อนย้ายของ Neurons ไปยัง Cerebral cortex ถูกขัดขวาง เกิด Mental Retardation รุนแรง'
              : 'โครงสร้างสมองสร้างเสร็จส่วนใหญ่แล้ว ความเสี่ยงปัญญาอ่อนลดลง 4 เท่าตัว'}
          </div>
        </div>
      )}

      {/* Cataract Lens Radiation HUD */}
      {activeMode === 'cataract' && (
        <div className={styles.arsControlPanel} style={{ maxWidth: '400px', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
          <div className={styles.arsHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} color="#38bdf8" />
              <span className={styles.arsStageTitle} style={{ color: '#38bdf8' }}>
                {lensDoseGy < 0.5
                  ? 'Sub-threshold (ยังไม่เกิดต้อ)'
                  : lensDoseGy <= 2.0
                  ? 'Early PSC Cataract (0.5–2.0 Gy)'
                  : 'Dense Posterior Subcapsular (>2.0 Gy)'}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>Dose: {lensDoseGy.toFixed(1)} Gy</span>
          </div>

          <div className={styles.doseSliderWrapper}>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={lensDoseGy}
              onChange={(e) => setLensDoseGy(parseFloat(e.target.value))}
              className={styles.doseSlider}
              style={{ accentColor: '#38bdf8' }}
            />
            <div className={styles.doseMarkers}>
              <span>0 Gy</span>
              <span>0.5 Gy (Thresh)</span>
              <span>2.0 Gy (Severe)</span>
              <span>3.5 Gy</span>
              <span>5.0 Gy</span>
            </div>
          </div>

          <div className={styles.arsGrid}>
            <div className={styles.arsStat} style={{ borderColor: 'rgba(56, 189, 248, 0.25)' }}>
              <div className={styles.statLabel}>ตำแหน่งรอยโรค (Pathology)</div>
              <div className={styles.statValue} style={{ fontSize: '0.74rem', color: '#e0f2fe' }}>
                Posterior Subcapsular (PSC)
              </div>
            </div>
            <div className={styles.arsStat} style={{ borderColor: 'rgba(56, 189, 248, 0.25)' }}>
              <div className={styles.statLabel}>ขีดจำกัดบุคลากร ICRP</div>
              <div className={styles.statValue} style={{ fontSize: '0.74rem', color: '#34d399' }}>
                20 mSv/ปี (ปรับลดจาก 150)
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.65rem', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            <strong style={{ color: '#38bdf8' }}>กลไก:</strong> เซลล์เยื่อบุผิวบริเวณ Equatorial Ring เสียหาย → เคลื่อนย้ายไปที่ Posterior Pole → ก่อตัวเป็นเส้นใยขุ่นขาวทึบแสง (PSC) ที่ลุกลามเร็วกว่าต้อผู้สูงอายุ
          </div>
        </div>
      )}

      {/* Pin Drawer (Bottom Right / Side) */}
      {selectedPin && (
        <div className={styles.pinDrawer}>
          <div className={styles.pinDrawerHeader}>
            <div>
              <span className={styles.pinCategoryBadge}>{selectedPin.category}</span>
              <h3 className={styles.pinDrawerTitle}>{selectedPin.nameTh}</h3>
              <div className={styles.pinDrawerSubtitle}>{selectedPin.nameEn}</div>
            </div>
            <button onClick={() => setSelectedPin(null)} className={styles.closeDrawerBtn} title="ปิด">
              <X size={16} />
            </button>
          </div>

          <div className={styles.pinDrawerBody}>
            <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>{selectedPin.td5}</div>
            <p>
              <strong>ปฏิกิริยาเฉียบพลัน (Acute):</strong> {selectedPin.acuteReaction}
            </p>
            <p style={{ marginTop: '4px' }}>
              <strong>ผลระยะยาว (Chronic):</strong> {selectedPin.chronicReaction}
            </p>
            <div className={styles.pinClinicalBox}>
              <strong>ข้อสังเกตทางรังสีวิทยา:</strong> {selectedPin.clinicalNote}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealisticRadiobiology3DSim;
