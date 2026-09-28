import { useEffect, useRef, useState, useCallback, type FC } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Layers,
  Activity,
  AlertTriangle,
  Brain,
  Sliders,
  Sun,
  Sparkles,
  Moon,
  Grid,
  Maximize,
} from 'lucide-react';
import {
  createContactShadowPlane,
  createPerspectiveGrid,
  setupStudioLighting,
  setStudioLightingMode,
  toggleSceneWireframe,
  getAnatomicalCoordinates,
  smoothTransitionCamera,
  type LightingMode,
  type AnatomicalView,
  type StudioLightingRig,
} from '../../shared/threeDepthHelpers';
import styles from './RealisticNeuropathology3DSim.module.css';

interface NeuroPin {
  id: string;
  pinNumber: string;
  nameTh: string;
  nameEn: string;
  position: THREE.Vector3;
  category: 'emergency' | 'stroke' | 'anatomy';
  grossDesc: string;
  microDesc: string;
  clinicalNote: string;
}

const NEURO_PINS: NeuroPin[] = [
  {
    id: 'edh',
    pinNumber: '1',
    nameTh: 'เลือดออกเหนือเยื่อดูรา (Epidural Hematoma - EDH)',
    nameEn: 'Epidural Hematoma (Middle Meningeal Artery)',
    position: new THREE.Vector3(1.65, 0.45, 0.45),
    category: 'emergency',
    grossDesc:
      'ก้อนเลือดคั่งรูปกระสวยหรือเลนส์นูน 2 ด้าน (Biconvex / Lenticular) ระหว่างกะโหลกศีรษะกับเยื่อดูรา ไม่ข้ามรอยต่อกะโหลก (Sutures) เนื่องจากเยื่อดูรายึดติดแน่นกับรอยต่อ',
    microDesc:
      'พบก้อนลิ่มเลือดเฉียบพลัน (Acute blood clot) อัดแน่นด้วย Red blood cells และ Fibrin meshwork กดเบียดเนื้อสมองข้างใต้ให้แบนราบ',
    clinicalNote:
      '🚨 มักเกิดจากกระดูก Pterion แตก ฉีกขาดแขนง Middle Meningeal Artery! มีอาการสำคัญคือ Lucid Interval (หมดสติชั่วครู่ ฟื้นคืนสติปกติ แล้วทรุดลงอย่างรวดเร็ว Coma) ต้องผ่าตัดเจาะกะโหลกฉุกเฉิน (Burr hole / Craniotomy)',
  },
  {
    id: 'sdh',
    pinNumber: '2',
    nameTh: 'เลือดออกใต้เยื่อดูรา (Subdural Hematoma - SDH)',
    nameEn: 'Subdural Hematoma (Bridging Veins)',
    position: new THREE.Vector3(-1.6, 0.85, 0.35),
    category: 'emergency',
    grossDesc:
      'ก้อนเลือดคั่งรูปพระจันทร์เสี้ยว (Crescent-shaped) แผ่ตามความโค้งของผิวสมอง สามารถข้ามรอยต่อกระดูก (Sutures) ได้ แต่ไม่ข้าม Falx cerebri',
    microDesc:
      'การฉีกขาดของ Bridging Veins นำไปสู่เลือดคั่ง ในรายเรื้อรัง (Chronic SDH) จะพบ Fibroblastic granulation tissue และ Neomembrane หุ้มก้อนเลือด',
    clinicalNote:
      'พบบ่อยมากในผู้สูงอายุที่สมองฝ่อ (Brain atrophy) ทำให้เส้นเลือดดำตึงฉีกขาดง่ายจากการกระแทกเบาๆ รวมถึงเด็กทารกที่ถูกเขย่ารุนแรง (Shaken Baby Syndrome)',
  },
  {
    id: 'mca-stroke',
    pinNumber: '3',
    nameTh: 'สมองขาดเลือดตายจากหลอดเลือด MCA (Ischemic Stroke / Infarction)',
    nameEn: 'Middle Cerebral Artery (MCA) Territory Infarction',
    position: new THREE.Vector3(1.5, 0.1, 0.75),
    category: 'stroke',
    grossDesc:
      'รอยโรคขาดเลือดรูปสามเหลี่ยมรูปลิ่ม (Wedge-shaped) ครอบคลุม Cortex และ Subcortical white matter ใน 24-48 ชม.แรก สมองบวมนิ่ม รอยแยก Gyri หายไป (Loss of gray-white differentiation) ต่อมาเกิด Liquefactive necrosis',
    microDesc:
      'ชั่วโมงที่ 12-24: พบ Red neurons (Eosinophilic cytoplasm, Pyknotic nuclei), จากนั้น Neutrophils เข้ามาล้อมรอบ ตามด้วย Foamy Macrophages (Microglia) เข้าเก็บเศษเซลล์ตาย',
    clinicalNote:
      'อาการตามระบบ BEFAST: อัมพาตครึ่งซีกฝั่งตรงข้าม (Contralateral hemiparesis), หน้าเบี้ยว (Facial droop), พูดไม่ชัดหรือสูญเสียความเข้าใจภาษา (Aphasia) ประเมินเพื่อรับยาละลายลิ่มเลือด (rtPA) ภายใน 4.5 ชั่วโมง',
  },
  {
    id: 'uncal-herniation',
    pinNumber: '4',
    nameTh: 'สมองเคลื่อนกดทับขั้วสมอง (Uncal Transtentorial Herniation)',
    nameEn: 'Uncal Herniation (Tentorial Notch Compression)',
    position: new THREE.Vector3(0.65, -0.65, 0.45),
    category: 'emergency',
    grossDesc:
      'ส่วน Uncus ของ Medial Temporal lobe ถูกแรงดันในกะโหลก (ICP) ดันให้เคลื่อนผ่าน Tentorial notch ลงไปเบียดกดก้านสมองส่วน Midbrain',
    microDesc:
      'เนื้อสมองถูกกดขาดเลือด เกิด Duret hemorrhages (เลือดออกเป็นจุดๆ ใน Midbrain และ Pons) จากการฉีกขาดของ Paramedian basilar artery branches',
    clinicalNote:
      '🚨 สัญญาณวิกฤต: รูม่านตาข้างเดียวกันขยายกว้างและไม่ตอบสนองต่อแสง (Ipsilateral blown pupil จากการกดทับ CN III), อัมพาตครึ่งซีกตรงข้าม, และระดับความรู้สึกตัวลดลงอย่างรวดเร็ว',
  },
  {
    id: 'ventricles-csf',
    pinNumber: '5',
    nameTh: 'โพรงสมองและระบบน้ำไขสันหลัง (Ventricular System & Hydrocephalus)',
    nameEn: 'Ventricular System & CSF Flow Pathway',
    position: new THREE.Vector3(0.0, 0.25, 0.2),
    category: 'anatomy',
    grossDesc:
      'Lateral ventricles รูปตัว C เชื่อมต่อกับ Third ventricle ผ่าน Foramen of Monro และส่งผ่าน Cerebral Aqueduct of Sylvius ไปยัง Fourth ventricle',
    microDesc:
      'Ependymal cell lining และ Choroid plexus epithelium ทำหน้าที่สร้างน้ำไขสันหลัง (CSF) ประมาณ 500 mL/วัน ไหลเวียนและดูดซึมกลับที่ Arachnoid granulations',
    clinicalNote:
      'หากทางเดิน CSF อุดตัน เช่น ก้อนเนื้องอกกด Aqueduct จะเกิด Non-communicating hydrocephalus โพรงสมองขยายใหญ่ ดัน ICP พุ่งสูงอย่างรวดเร็ว',
  },
  {
    id: 'brainstem-medulla',
    pinNumber: '6',
    nameTh: 'ก้านสมองและสมองเคลื่อนทับรูฟอราเมน (Brainstem & Tonsillar Herniation)',
    nameEn: 'Brainstem Vital Centers & Cerebellar Tonsils',
    position: new THREE.Vector3(0.0, -1.35, -0.2),
    category: 'emergency',
    grossDesc:
      'Cerebellar tonsils ถูกแรงดันในโพรงกะโหลกกดเคลื่อนผ่าน Foramen magnum ลงไปบีบอัดส่วน Medulla oblongata',
    microDesc:
      'เนื้อเยื่อไขสันหลังส่วนบนและ Medulla เกิด Ischemia และ Microvascular compression ศูนย์ควบคุมการหายใจและระบบหัวใจล้มเหลว',
    clinicalNote:
      '🚨 อันตรายถึงชีวิตเฉียบพลัน! กดทับ Cardiac and Respiratory centers ทำให้หยุดหายใจและหัวใจหยุดเต้น (Respiratory and cardiovascular collapse) ห้ามทำ Lumbar puncture ในผู้ป่วยที่มี ICP สูงเด็ดขาด!',
  },
];

// Helper: Procedural Pin Sprite Texture
function createNeuroPinTexture(number: string, color: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.clearRect(0, 0, 128, 128);

  // Outer glow ring
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.fill();

  // Solid badge circle
  ctx.beginPath();
  ctx.arc(64, 64, 46, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.fill();

  // White border
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Number text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number, 64, 66);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Procedural Gyri/Sulci bump texture generator
function createBrainBumpTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  // Draw organic gyri curves
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  for (let i = 0; i < 48; i++) {
    ctx.strokeStyle = i % 2 === 0 ? '#404040' : '#b0b0b0';
    ctx.beginPath();
    let x = (i % 8) * 64 + 32;
    let y = Math.floor(i / 8) * 80 + 20;
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + 30, y + 25, x - 25, y + 50, x + 15, y + 70);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

export const RealisticNeuropathology3DSim: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [activeFilter, setActiveFilter] = useState<'all' | 'edh' | 'sdh' | 'stroke' | 'herniation' | 'meningitis'>('all');
  const [isCrossSection, setIsCrossSection] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [selectedPin, setSelectedPin] = useState<NeuroPin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Monro-Kellie Interactive Simulation State
  const [lesionVolume, setLesionVolume] = useState<number>(0); // 0 to 120 mL

  // Sync refs to prevent WebGL scene destruction on state changes
  const isAutoRotateRef = useRef<boolean>(isAutoRotate);
  const lesionVolumeRef = useRef<number>(lesionVolume);
  const cortexMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  useEffect(() => {
    lesionVolumeRef.current = lesionVolume;
  }, [lesionVolume]);

  // Advanced Visual Depth & Workstation States
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>('cinematic');
  const [activeView, setActiveView] = useState<AnatomicalView>('isometric');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const lightingRigRef = useRef<StudioLightingRig | null>(null);
  const anatomyGroupRef = useRef<THREE.Group | null>(null);
  const pinSpritesRef = useRef<THREE.Sprite[]>([]);
  const reqIdRef = useRef<number | null>(null);

  // Lesion mesh group references
  const edhGroupRef = useRef<THREE.Group | null>(null);
  const sdhGroupRef = useRef<THREE.Group | null>(null);
  const strokeGroupRef = useRef<THREE.Group | null>(null);
  const herniationGroupRef = useRef<THREE.Group | null>(null);
  const meningitisGroupRef = useRef<THREE.Group | null>(null);
  const ventriclesRef = useRef<THREE.Group | null>(null);

  // Clipping plane for coronal cutaway
  const clipPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 0, -1), 0));

  const handleViewChange = (view: AnatomicalView) => {
    setActiveView(view);
    if (cameraRef.current && controlsRef.current) {
      const targetPos = getAnatomicalCoordinates(view, 5.5, 0.4);
      smoothTransitionCamera(cameraRef.current, controlsRef.current, targetPos, new THREE.Vector3(0, 0, 0), 650);
    }
  };

  const handleLightingChange = (mode: LightingMode) => {
    setLightingMode(mode);
    if (lightingRigRef.current) {
      setStudioLightingMode(lightingRigRef.current, mode);
    }
  };

  const handleToggleWireframe = () => {
    const nextVal = !isWireframe;
    setIsWireframe(nextVal);
    if (anatomyGroupRef.current) {
      toggleSceneWireframe(anatomyGroupRef.current, nextVal);
    }
  };

  // Compute Monro-Kellie pressure values
  // Normal ICP = 10 mmHg. Up to 35 mL mass is compensated. Above 40 mL, ICP rises steeply.
  const calculateIcp = (volume: number) => {
    if (volume <= 30) {
      return 10 + (volume / 30) * 4; // 10 to 14 mmHg (compensated)
    }
    const excess = volume - 30;
    // Exponential rise past compensation
    return Math.min(85, Math.round(14 + Math.pow(excess / 8, 1.9)));
  };

  const currentIcp = calculateIcp(lesionVolume);
  const MAP = 95; // Mean Arterial Pressure (mmHg)
  const currentCpp = Math.max(10, MAP - currentIcp); // Cerebral Perfusion Pressure (CPP = MAP - ICP)

  let complianceStatus = 'COMPENSATED';
  let statusClass = styles.statusNormal;
  if (currentIcp > 20 && currentIcp <= 35) {
    complianceStatus = 'DECOMPENSATED';
    statusClass = styles.statusCritical;
  } else if (currentIcp > 35) {
    complianceStatus = '🚨 HERNIATION RISK';
    statusClass = styles.statusCritical;
  }

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(3.8, 2.2, 3.8);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, canvas);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 9.0;
    controls.maxPolarAngle = Math.PI * 0.85;

    // 5. Studio 3-Point Depth Lighting with Dual Rim Lights
    const rig = setupStudioLighting(scene);
    lightingRigRef.current = rig;
    setStudioLightingMode(rig, 'cinematic');

    // 6. Ground Contact Shadow & Spatial Perspective Floor Grid
    const shadowDisc = createContactShadowPlane(4.4, -2.25, 0.85);
    scene.add(shadowDisc);

    const grid = createPerspectiveGrid(9.5, 24, -2.26, 0x38bdf8, 0x1e293b);
    scene.add(grid);

    // -------------------------------------------------------------
    // 7. Procedural Organic Brain Geometry (img2threejs principles)
    // -------------------------------------------------------------
    const anatomyRoot = new THREE.Group();
    scene.add(anatomyRoot);
    anatomyGroupRef.current = anatomyRoot;

    const brainBump = createBrainBumpTexture();

    // Standard Brain Cortical Material
    const cortexMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfb0b0, // natural cerebral cortex pinkish tan
      roughness: 0.42,
      metalness: 0.06,
      bumpMap: brainBump,
      bumpScale: 0.05,
      clippingPlanes: [],
      clipShadows: true,
    });
    cortexMaterialRef.current = cortexMaterial;


    // 7.1 Left Cerebral Hemisphere
    const leftHemiGeo = new THREE.SphereGeometry(1.25, 48, 48);
    leftHemiGeo.scale(0.88, 1.0, 1.32);
    const leftHemisphere = new THREE.Mesh(leftHemiGeo, cortexMaterial);
    leftHemisphere.position.set(-0.78, 0.3, 0);
    anatomyRoot.add(leftHemisphere);

    // 7.2 Right Cerebral Hemisphere
    const rightHemiGeo = new THREE.SphereGeometry(1.25, 48, 48);
    rightHemiGeo.scale(0.88, 1.0, 1.32);
    const rightHemisphere = new THREE.Mesh(rightHemiGeo, cortexMaterial);
    rightHemisphere.position.set(0.78, 0.3, 0);
    anatomyRoot.add(rightHemisphere);

    // 7.3 Longitudinal Fissure shadow separator
    const fissureMat = new THREE.MeshBasicMaterial({
      color: 0x1e1518,
      side: THREE.DoubleSide,
    });
    const fissureGeo = new THREE.PlaneGeometry(0.1, 2.4);
    const fissure = new THREE.Mesh(fissureGeo, fissureMat);
    fissure.rotation.y = Math.PI / 2;
    fissure.position.set(0, 0.4, 0);
    anatomyRoot.add(fissure);

    // 7.4 Cerebellum (Posterior-Inferior Dual Lobes)
    const cerebellumMat = new THREE.MeshStandardMaterial({
      color: 0xb57878,
      roughness: 0.5,
      metalness: 0.05,
      bumpMap: brainBump,
      bumpScale: 0.08,
      clippingPlanes: [],
    });
    const leftCerebellumGeo = new THREE.SphereGeometry(0.55, 32, 32);
    leftCerebellumGeo.scale(1.0, 0.75, 0.85);
    const leftCerebellum = new THREE.Mesh(leftCerebellumGeo, cerebellumMat);
    leftCerebellum.position.set(-0.65, -0.65, -0.75);
    anatomyRoot.add(leftCerebellum);

    const rightCerebellumGeo = new THREE.SphereGeometry(0.55, 32, 32);
    rightCerebellumGeo.scale(1.0, 0.75, 0.85);
    const rightCerebellum = new THREE.Mesh(rightCerebellumGeo, cerebellumMat);
    rightCerebellum.position.set(0.65, -0.65, -0.75);
    anatomyRoot.add(rightCerebellum);

    // 7.5 Brainstem (Midbrain, Pons swelling, Medulla)
    const brainstemMat = new THREE.MeshStandardMaterial({
      color: 0xf1d0c5,
      roughness: 0.35,
      clippingPlanes: [],
    });

    // Pons (bulbous curve)
    const ponsGeo = new THREE.SphereGeometry(0.42, 24, 24);
    ponsGeo.scale(0.9, 1.1, 1.25);
    const pons = new THREE.Mesh(ponsGeo, brainstemMat);
    pons.position.set(0, -0.65, -0.15);
    anatomyRoot.add(pons);

    // Medulla descending
    const medullaGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.9, 24);
    const medulla = new THREE.Mesh(medullaGeo, brainstemMat);
    medulla.position.set(0, -1.25, -0.22);
    anatomyRoot.add(medulla);

    // 7.6 Ventricular System (Glowing cyan CSF cavity)
    const ventriclesGroup = new THREE.Group();
    const csfMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      side: THREE.DoubleSide,
    });

    // C-shaped lateral ventricles
    const leftVentricleGeo = new THREE.TorusGeometry(0.55, 0.1, 16, 32, Math.PI * 1.3);
    const leftVentricle = new THREE.Mesh(leftVentricleGeo, csfMaterial);
    leftVentricle.position.set(-0.35, 0.35, 0.05);
    leftVentricle.rotation.z = Math.PI * 0.4;
    ventriclesGroup.add(leftVentricle);

    const rightVentricleGeo = new THREE.TorusGeometry(0.55, 0.1, 16, 32, Math.PI * 1.3);
    const rightVentricle = new THREE.Mesh(rightVentricleGeo, csfMaterial);
    rightVentricle.position.set(0.35, 0.35, 0.05);
    rightVentricle.rotation.z = Math.PI * 0.4;
    ventriclesGroup.add(rightVentricle);

    // Third & Fourth ventricle connector
    const thirdVentricleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
    const thirdVentricle = new THREE.Mesh(thirdVentricleGeo, csfMaterial);
    thirdVentricle.position.set(0, 0.1, -0.05);
    ventriclesGroup.add(thirdVentricle);

    anatomyRoot.add(ventriclesGroup);
    ventriclesRef.current = ventriclesGroup;

    // -------------------------------------------------------------
    // 8. Toggleable Pathology Lesions (Accurate Gross Morphology)
    // -------------------------------------------------------------

    // 8.1 Epidural Hematoma (EDH) Group - Biconvex Lenticular Arterial Clot
    const edhGroup = new THREE.Group();
    const edhGeo = new THREE.SphereGeometry(0.48, 32, 32);
    edhGeo.scale(0.38, 1.15, 1.25); // Lenticular biconvex shape
    const edhMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // Bright fresh arterial red
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x991b1b,
      emissiveIntensity: 0.35,
    });
    const edhMesh = new THREE.Mesh(edhGeo, edhMat);
    edhMesh.position.set(1.65, 0.45, 0.42);
    edhMesh.rotation.y = 0.3;
    edhGroup.add(edhMesh);

    // Skull boundary hint ring
    const skullRingGeo = new THREE.RingGeometry(0.52, 0.58, 32);
    const skullRingMat = new THREE.MeshBasicMaterial({
      color: 0xf1f5f9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const skullRing = new THREE.Mesh(skullRingGeo, skullRingMat);
    skullRing.position.set(1.72, 0.45, 0.42);
    skullRing.rotation.y = Math.PI / 2;
    edhGroup.add(skullRing);

    anatomyRoot.add(edhGroup);
    edhGroupRef.current = edhGroup;

    // 8.2 Subdural Hematoma (SDH) Group - Crescent-shaped Venous Collection
    const sdhGroup = new THREE.Group();
    // Torus slice or curved shell simulating crescent collection over convexity
    const sdhGeo = new THREE.TorusGeometry(1.35, 0.12, 16, 48, Math.PI * 0.7);
    const sdhMat = new THREE.MeshStandardMaterial({
      color: 0x581c87, // Venous dark violaceous / subacute deoxygenated blood
      roughness: 0.3,
      metalness: 0.3,
      emissive: 0x3b0764,
      emissiveIntensity: 0.3,
    });
    const sdhMesh = new THREE.Mesh(sdhGeo, sdhMat);
    sdhMesh.position.set(-0.75, 0.35, 0.1);
    sdhMesh.rotation.z = Math.PI * 0.18;
    sdhMesh.rotation.y = -Math.PI * 0.25;
    sdhGroup.add(sdhMesh);

    anatomyRoot.add(sdhGroup);
    sdhGroupRef.current = sdhGroup;

    // 8.3 MCA Ischemic Stroke Group - Wedge-shaped Cortical Territory
    const strokeGroup = new THREE.Group();
    const strokeGeo = new THREE.ConeGeometry(0.85, 1.4, 24);
    strokeGeo.scale(1.0, 0.7, 0.85);
    const strokeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Ischemic pale yellow edema zone
      roughness: 0.45,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
      emissive: 0xd97706,
      emissiveIntensity: 0.3,
    });
    const strokeMesh = new THREE.Mesh(strokeGeo, strokeMat);
    strokeMesh.position.set(1.42, 0.15, 0.65);
    strokeMesh.rotation.z = -Math.PI * 0.42;
    strokeMesh.rotation.y = Math.PI * 0.15;
    strokeGroup.add(strokeMesh);

    // Pulsing penumbra halo ring
    const penumbraRingGeo = new THREE.RingGeometry(0.75, 0.82, 32);
    const penumbraRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const penumbraRing = new THREE.Mesh(penumbraRingGeo, penumbraRingMat);
    penumbraRing.position.set(1.5, 0.15, 0.7);
    penumbraRing.rotation.y = Math.PI / 2;
    strokeGroup.add(penumbraRing);

    anatomyRoot.add(strokeGroup);
    strokeGroupRef.current = strokeGroup;

    // 8.4 Brain Herniation Group (Uncal & Subfalcine)
    const herniationGroup = new THREE.Group();
    // Medial displacement wedge
    const uncalGeo = new THREE.SphereGeometry(0.38, 24, 24);
    uncalGeo.scale(0.8, 1.4, 0.8);
    const uncalMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.4,
    });
    const uncalMesh = new THREE.Mesh(uncalGeo, uncalMat);
    uncalMesh.position.set(0.65, -0.65, 0.35); // Protruding past tentorium
    herniationGroup.add(uncalMesh);

    // Vector arrow indicator
    const arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0).normalize(),
      new THREE.Vector3(0.65, -0.3, 0.35),
      0.65,
      0xef4444,
      0.2,
      0.15
    );
    herniationGroup.add(arrowHelper);

    anatomyRoot.add(herniationGroup);
    herniationGroupRef.current = herniationGroup;

    // 8.5 Meningitis Group - Leptomeningeal Exudate & Vascular Engorgement
    const meningitisGroup = new THREE.Group();
    const exudateMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04, // Yellow-green purulent exudate
      roughness: 0.5,
      transparent: true,
      opacity: 0.55,
      emissive: 0x854d0e,
      emissiveIntensity: 0.25,
    });

    // Outer exudate shell covering sulci
    const shellGeo = new THREE.SphereGeometry(1.36, 32, 32);
    shellGeo.scale(0.92, 1.05, 1.36);
    const shellMesh = new THREE.Mesh(shellGeo, exudateMat);
    shellMesh.position.set(0, 0.3, 0);
    meningitisGroup.add(shellMesh);

    anatomyRoot.add(meningitisGroup);
    meningitisGroupRef.current = meningitisGroup;

    // -------------------------------------------------------------
    // 9. Interactive 3D Landmark Pins
    // -------------------------------------------------------------
    pinSpritesRef.current = [];
    NEURO_PINS.forEach((pin) => {
      const pinColor =
        pin.category === 'emergency'
          ? '#ef4444'
          : pin.category === 'stroke'
          ? '#f59e0b'
          : '#38bdf8';
      const texture = createNeuroPinTexture(pin.pinNumber, pinColor);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(pin.position);
      sprite.scale.set(0.38, 0.38, 1);
      (sprite as any).userData = { pinId: pin.id };
      scene.add(sprite);
      pinSpritesRef.current.push(sprite);
    });

    // -------------------------------------------------------------
    // 10. Pointer Interaction / Raycasting
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pinSpritesRef.current);

      if (intersects.length > 0) {
        const hitSprite = intersects[0].object as THREE.Sprite;
        const pinId = hitSprite.userData?.pinId;
        const matched = NEURO_PINS.find((p) => p.id === pinId);
        if (matched) {
          setSelectedPin(matched);
        }
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);

    // -------------------------------------------------------------
    // 11. Animation Loop
    // -------------------------------------------------------------
    const clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Auto rotation
      if (isAutoRotateRef.current && anatomyRoot) {
        anatomyRoot.rotation.y += 0.0035;
      }

      // Stroke penumbra pulsating glow
      if (strokeGroupRef.current) {
        const pulse = 1 + Math.sin(elapsed * 4.5) * 0.06;
        strokeGroupRef.current.scale.set(pulse, pulse, pulse);
      }

      // Dynamic lesion deformation based on Monro-Kellie slider
      const vol = lesionVolumeRef.current;
      const scaleFactor = 1 + (vol / 120) * 0.6;
      if (edhGroupRef.current) {
        edhGroupRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
      }

      // CSF Ventricle compression in high ICP
      if (ventriclesRef.current) {
        const csfCompression = Math.max(0.4, 1 - (vol / 120) * 0.5);
        ventriclesRef.current.scale.set(csfCompression, csfCompression, csfCompression);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------
    // 12. Resize Observer
    // -------------------------------------------------------------
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Coronal Cutaway Clipping Planes dynamically without remounting scene
  useEffect(() => {
    if (anatomyGroupRef.current) {
      anatomyGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if ('clippingPlanes' in mat) {
            mat.clippingPlanes = isCrossSection ? [clipPlaneRef.current] : [];
            mat.needsUpdate = true;
          }
        }
      });
    }
  }, [isCrossSection]);

  // Handle Pathology Filter Visibility Changes
  useEffect(() => {
    if (
      !edhGroupRef.current ||
      !sdhGroupRef.current ||
      !strokeGroupRef.current ||
      !herniationGroupRef.current ||
      !meningitisGroupRef.current
    )
      return;

    switch (activeFilter) {
      case 'edh':
        edhGroupRef.current.visible = true;
        sdhGroupRef.current.visible = false;
        strokeGroupRef.current.visible = false;
        herniationGroupRef.current.visible = false;
        meningitisGroupRef.current.visible = false;
        break;
      case 'sdh':
        edhGroupRef.current.visible = false;
        sdhGroupRef.current.visible = true;
        strokeGroupRef.current.visible = false;
        herniationGroupRef.current.visible = false;
        meningitisGroupRef.current.visible = false;
        break;
      case 'stroke':
        edhGroupRef.current.visible = false;
        sdhGroupRef.current.visible = false;
        strokeGroupRef.current.visible = true;
        herniationGroupRef.current.visible = false;
        meningitisGroupRef.current.visible = false;
        break;
      case 'herniation':
        edhGroupRef.current.visible = false;
        sdhGroupRef.current.visible = false;
        strokeGroupRef.current.visible = false;
        herniationGroupRef.current.visible = true;
        meningitisGroupRef.current.visible = false;
        break;
      case 'meningitis':
        edhGroupRef.current.visible = false;
        sdhGroupRef.current.visible = false;
        strokeGroupRef.current.visible = false;
        herniationGroupRef.current.visible = false;
        meningitisGroupRef.current.visible = true;
        break;
      case 'all':
      default:
        edhGroupRef.current.visible = true;
        sdhGroupRef.current.visible = true;
        strokeGroupRef.current.visible = true;
        herniationGroupRef.current.visible = true;
        meningitisGroupRef.current.visible = true;
        break;
    }
  }, [activeFilter]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        try {
          if (containerRef.current && typeof containerRef.current.requestFullscreen === 'function') {
            containerRef.current.requestFullscreen().catch(() => {});
          }
        } catch {
          // ignore on iPad
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

  const resetCamera = useCallback(() => {
    setActiveView('isometric');
    if (cameraRef.current && controlsRef.current) {
      const targetPos = getAnatomicalCoordinates('isometric', 5.5, 0.4);
      smoothTransitionCamera(cameraRef.current, controlsRef.current, targetPos, new THREE.Vector3(0, 0, 0), 650);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.simContainer} ${isFullscreen ? styles.fullscreen : ''} ${isTheater ? styles.theater : ''}`}
    >
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} />
        <div className={styles.reticle} title="Anatomical Focus Center" />
      </div>

      {/* Top Header & Toolbar */}
      <div className={styles.topBar}>
        <div className={styles.titleBadge}>
          <div className={styles.liveLed} title="Renderer Active (60 FPS PBR)" />
          <Brain size={18} color="#38bdf8" />
          <div>
            <h3>3D Neuropathology Workstation</h3>
            <span className={styles.engineTag}>WebGL 2.0 PBR</span>
          </div>
        </div>

        {/* Anatomical Presets Dial Bar */}
        <div className={styles.presetsBar}>
          <button
            className={`${styles.presetBtn} ${activeView === 'anterior' ? styles.active : ''}`}
            onClick={() => handleViewChange('anterior')}
            title="มุมมองด้านหน้า (Anterior View)"
          >
            หน้า
          </button>
          <button
            className={`${styles.presetBtn} ${activeView === 'posterior' ? styles.active : ''}`}
            onClick={() => handleViewChange('posterior')}
            title="มุมมองด้านหลัง (Posterior View)"
          >
            หลัง
          </button>
          <button
            className={`${styles.presetBtn} ${activeView === 'left' ? styles.active : ''}`}
            onClick={() => handleViewChange('left')}
            title="มุมมองด้านข้าง (Lateral View)"
          >
            ข้าง
          </button>
          <button
            className={`${styles.presetBtn} ${activeView === 'superior' ? styles.active : ''}`}
            onClick={() => handleViewChange('superior')}
            title="มุมมองด้านบน (Superior View)"
          >
            บน
          </button>
          <button
            className={`${styles.presetBtn} ${activeView === 'isometric' ? styles.active : ''}`}
            onClick={() => handleViewChange('isometric')}
            title="มุมมอง 3 มิติ (3D Isometric)"
          >
            3D Iso
          </button>
          <button
            className={styles.presetBtn}
            onClick={resetCamera}
            title="รีเซ็ตมุมมองกล้อง (Reset Camera)"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        <div className={styles.toolActions}>
          <button
            className={`${styles.btnAction} ${lightingMode === 'cinematic' ? styles.active : ''}`}
            onClick={() =>
              handleLightingChange(
                lightingMode === 'clinical' ? 'cinematic' : lightingMode === 'cinematic' ? 'radiology' : 'clinical'
              )
            }
            title={`โหมดแสง: ${
              lightingMode === 'clinical'
                ? 'Clinical Bright (สว่างชัด)'
                : lightingMode === 'cinematic'
                ? 'Cinematic Depth (มิติลึกเงาเด่น)'
                : 'Radiology Dark (เอกซเรย์มืด)'
            }`}
          >
            {lightingMode === 'clinical' && <Sun size={14} />}
            {lightingMode === 'cinematic' && <Sparkles size={14} />}
            {lightingMode === 'radiology' && <Moon size={14} />}
          </button>

          <button
            className={`${styles.btnAction} ${isWireframe ? styles.active : ''}`}
            onClick={handleToggleWireframe}
            title="เปิด/ปิดการตรวจดูโครงสร้างตาข่ายรูปทรงเรขาคณิต (Polygon Mesh Wireframe)"
          >
            <Grid size={14} />
          </button>

          <button
            className={`${styles.btnAction} ${isCrossSection ? styles.active : ''}`}
            onClick={() => setIsCrossSection((prev) => !prev)}
            title="ผ่าตัดขวางเพื่อตรวจดูเนื้อสมองชั้นลึกและโพรงสมอง (Coronal Cutaway)"
          >
            <Layers size={14} />
            {isCrossSection ? 'Full' : 'Cutaway'}
          </button>

          <button
            className={`${styles.btnAction} ${isAutoRotate ? styles.active : ''}`}
            onClick={() => setIsAutoRotate((prev) => !prev)}
            title="เปิด/ปิดการหมุนแท่นวางจำลองอัตโนมัติ (Turntable Orbit)"
          >
            {isAutoRotate ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button
            className={`${styles.btnAction} ${isTheater ? styles.active : ''}`}
            onClick={() => setIsTheater((prev) => !prev)}
            title={isTheater ? 'ย่อเป็นมุมมองมาตรฐาน' : 'ขยายเป็นโหมดโรงภาพยนตร์กว้างพิเศษ (Theater Mode)'}
          >
            <Maximize size={14} />
          </button>

          <button
            className={styles.btnAction}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'ย่อหน้าจอ' : 'ขยายเต็มหน้าจอ (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Pathology Filter Selector Bar */}
      <div className={styles.filterBar}>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.active : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          ทั้งหมด (All Lesions)
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'edh' ? styles.active : ''}`}
          onClick={() => setActiveFilter('edh')}
        >
          1. EDH (เลนส์นูน / MMA)
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'sdh' ? styles.active : ''}`}
          onClick={() => setActiveFilter('sdh')}
        >
          2. SDH (พระจันทร์เสี้ยว)
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'stroke' ? styles.active : ''}`}
          onClick={() => setActiveFilter('stroke')}
        >
          3. MCA Stroke (สมองขาดเลือด)
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'herniation' ? styles.active : ''}`}
          onClick={() => setActiveFilter('herniation')}
        >
          4. Uncal Herniation
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'meningitis' ? styles.active : ''}`}
          onClick={() => setActiveFilter('meningitis')}
        >
          5. Meningitis (เยื่อหุ้มอักเสบ)
        </button>
      </div>

      {/* Monro-Kellie Hypothesis Live Telemetry HUD */}
      <div className={styles.icpHud}>
        <div className={styles.hudHeader}>
          <h4>
            <Activity size={14} /> Monro–Kellie ICP HUD
          </h4>
          <span className={`${styles.hudStatusBadge} ${statusClass}`}>{complianceStatus}</span>
        </div>

        <div className={styles.icpMetrics}>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>ICP (Intracranial)</span>
            <span className={styles.metricValue}>{currentIcp} mmHg</span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>CPP (Perfusion)</span>
            <span
              className={styles.metricValue}
              style={{ color: currentCpp < 60 ? '#f87171' : '#4ade80' }}
            >
              {currentCpp} mmHg
            </span>
          </div>
        </div>

        {/* Volume proportion bar */}
        <div className={styles.volumeBar}>
          <div className={styles.volumeBrain} style={{ width: '65%' }} title="Brain Tissue (80%)" />
          <div
            className={styles.volumeBlood}
            style={{ width: `${Math.max(5, 15 - lesionVolume * 0.08)}%` }}
            title="Blood Volume"
          />
          <div
            className={styles.volumeCsf}
            style={{ width: `${Math.max(4, 15 - lesionVolume * 0.1)}%` }}
            title="CSF Volume"
          />
          {lesionVolume > 0 && (
            <div
              className={styles.volumeLesion}
              style={{ width: `${(lesionVolume / 120) * 35}%` }}
              title="Mass Lesion Volume"
            />
          )}
        </div>

        <div className={styles.volumeLabels}>
          <span>Brain 80%</span>
          <span>Blood 10%</span>
          <span>CSF 10%</span>
          {lesionVolume > 0 && <span style={{ color: '#f59e0b' }}>Mass {lesionVolume}mL</span>}
        </div>

        {/* Interactive Lesion Volume Slider */}
        <div className={styles.sliderRow}>
          <label>
            <Sliders size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Mass / Clot Size:
          </label>
          <input
            type="range"
            min="0"
            max="120"
            value={lesionVolume}
            onChange={(e) => setLesionVolume(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Selected Landmark Detail Card Modal */}
      {selectedPin && (
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <h4>
                [{selectedPin.pinNumber}] {selectedPin.nameTh}
              </h4>
              <p>{selectedPin.nameEn}</p>
            </div>
            <button className={styles.btnClose} onClick={() => setSelectedPin(null)}>
              <X size={16} />
            </button>
          </div>

          <div className={styles.sectionBlock}>
            <h5>ลักษณะมหภาค (Gross Pathology)</h5>
            <p>{selectedPin.grossDesc}</p>
          </div>

          <div className={styles.sectionBlock}>
            <h5>ลักษณะจุลทรรศน์ (Microscopic Pathology)</h5>
            <p>{selectedPin.microDesc}</p>
          </div>

          <div
            className={`${styles.sectionBlock} ${
              selectedPin.category === 'emergency' ? styles.emergency : styles.warning
            }`}
          >
            <h5>
              <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
              จุดเน้นสำคัญทางคลินิก (High-Yield Pearl)
            </h5>
            <p>{selectedPin.clinicalNote}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealisticNeuropathology3DSim;
