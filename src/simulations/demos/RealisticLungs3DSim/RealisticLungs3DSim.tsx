import { useEffect, useRef, useState, useCallback, type FC } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Maximize2,
  Minimize2,
  Info,
  X,
  Activity,
  Layers,
  Wind,
  Heart,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Grid,
} from 'lucide-react';
import {
  createContactShadowPlane,
  createPerspectiveGrid,
  setupStudioLighting,
  setStudioLightingMode,
  getAnatomicalCoordinates,
  smoothTransitionCamera,
  toggleSceneWireframe,
  type AnatomicalView,
  type LightingMode,
  type StudioLightingRig,
} from '../../shared/threeDepthHelpers';
import { JevPhysioExaminer } from '../../../components/typesafe/JevPhysioExaminer';
import styles from './RealisticLungs3DSim.module.css';

interface LandmarkPin {
  id: string;
  label: string;
  nameTh: string;
  nameEn: string;
  position: THREE.Vector3;
  description: string;
  clinicalNote: string;
}

const LANDMARKS: LandmarkPin[] = [
  {
    id: 'trachea',
    label: '1',
    nameTh: 'หลอดลมคอ (Trachea)',
    nameEn: 'Trachea with Cartilaginous Rings',
    position: new THREE.Vector3(0, 2.7, 0.4),
    description:
      'ท่อทางเดินหายใจยาวประมาณ 10-12 ซม. ประกอบด้วยกระดูกอ่อนรูปตัว C (C-shaped cartilage rings) 16-20 วง ป้องกันไม่ให้ท่อลมตีบตันยุบตัวขณะหายใจเข้า',
    clinicalNote:
      'ด้านหลังของท่อลมเป็นกล้ามเนื้อเรียบ Trachealis ติดกับหลอดอาหาร ช่วยให้หลอดอาหารขยายตัวได้เมื่อกลืนก้อนอาหาร',
  },
  {
    id: 'carina',
    label: '2',
    nameTh: 'สันแยกหลอดลม (Carina)',
    nameEn: 'Tracheal Carina Bifurcation',
    position: new THREE.Vector3(0, 1.7, 0.4),
    description:
      'สันกระดูกอ่อนรูปตัว V ที่จุดแยกตัวระหว่างหลอดลมหลักขวาและซ้าย (ระดับ T4-T5 หรือ Sternal Angle) เป็นจุดที่มีปลายประสาทรับความรู้สึกไวที่สุดในทางเดินหายใจ',
    clinicalNote:
      'เป็นบริเวณกระตุ้น Cough Reflex (อาการไอ) ที่รุนแรงที่สุด หากมีสิ่งแปลกปลอมหรือเสมหะตกถึง Carina จะไอทันที',
  },
  {
    id: 'right-bronchus',
    label: '3',
    nameTh: 'หลอดลมหลักขวา (Right Main Bronchus)',
    nameEn: 'Right Primary Bronchus',
    position: new THREE.Vector3(0.9, 1.25, 0.35),
    description:
      'หลอดลมขวามีลักษณะ: สั้นกว่า (~2.5 ซม.), กว้างกว่า, และทำมุมชันในแนวดิ่งมากกว่า (~25° จากแนวดิ่ง) เทียบกับหลอดลมซ้าย',
    clinicalNote:
      'สิ่งแปลกปลอมที่สำลัก (Foreign Body Aspiration) จึงมักตกลงสู่หลอดลมข้างขวามากกว่าข้างซ้ายอย่างมีนัยสำคัญ',
  },
  {
    id: 'right-lung',
    label: '4',
    nameTh: 'ปอดขวา 3 กลีบ (Right Lung: 3 Lobes)',
    nameEn: 'Right Lung (Superior, Middle, Inferior)',
    position: new THREE.Vector3(2.1, 0.4, 0.65),
    description:
      'ปอดขวามี 3 กลีบ (Superior, Middle, Inferior) คั่นด้วย 2 ร่อง (Horizontal fissure และ Oblique fissure) มีขนาดใหญ่และสั้นกว่าปอดซ้ายเล็กน้อยเนื่องจากตับดันขึ้นมาจากด้านล่าง',
    clinicalNote:
      'ปริมาตรปอดขวาคิดเป็นประมาณ 55% ของการแลกเปลี่ยนก๊าซทั้งหมดในร่างกาย',
  },
  {
    id: 'left-lung',
    label: '5',
    nameTh: 'ปอดซ้ายและรอยเว้าหัวใจ (Left Lung & Cardiac Notch)',
    nameEn: 'Left Lung with Cardiac Notch (2 Lobes)',
    position: new THREE.Vector3(-2.1, 0.3, 0.65),
    description:
      'ปอดซ้ายมีเพียง 2 กลีบ (Superior และ Inferior) คั่นด้วย Oblique fissure โดยขอบด้านหน้าของกลีบบนมีรอยเว้าหัวใจ (Cardiac Notch) และติ่งลิ้นก้นหอย (Lingula)',
    clinicalNote:
      'รอยเว้าหัวใจรองรับยอดหัวใจ (Apex of Heart) ที่ชี้เอียงมาทางซ้าย',
  },
  {
    id: 'diaphragm',
    label: '6',
    nameTh: 'กะบังลม (Diaphragm)',
    nameEn: 'Muscular Diaphragm Dome',
    position: new THREE.Vector3(0, -2.15, 0.7),
    description:
      'กล้ามเนื้อรูปโดมคั่นระหว่างช่องอกและช่องท้อง เป็นกล้ามเนื้อหลักที่รับผิดชอบการหายใจเข้าถึง 75% ควบคุมโดย Phrenic Nerve (C3-C5)',
    clinicalNote:
      'ขณะหายใจเข้า กะบังลมหดตัวแบนราบลง 1.5 - 7 ซม. ทำให้ปริมาตรช่องอกเพิ่มขึ้นและความดันในถุงลม Palv ลดลงเป็นลบ อากาศจึงไหลเข้าสู่ปอด',
  },
];

interface AirParticle {
  side: 'right' | 'left';
  progress: number;
  speed: number;
  offsetAngle: number;
  radius: number;
}

export const RealisticLungs3DSim: FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animIdRef = useRef<number | null>(null);

  // 3D dynamic components references
  const rightLungGroupRef = useRef<THREE.Group | null>(null);
  const leftLungGroupRef = useRef<THREE.Group | null>(null);
  const diaphragmMeshRef = useRef<THREE.Mesh | null>(null);
  const lungMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);

  // Airflow particles references
  const airflowPointsRef = useRef<THREE.Points | null>(null);
  const particleMetaRef = useRef<AirParticle[]>([]);

  // Anatomical layer groups
  const vesselsGroupRef = useRef<THREE.Group | null>(null);
  const ribCageGroupRef = useRef<THREE.Group | null>(null);

  // Interactive UI states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [bpm, setBpm] = useState<number>(14);
  const [tissueOpacity, setTissueOpacity] = useState<number>(0.65);
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkPin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Visual Enhancement Toggles
  const [showAirflow, setShowAirflow] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showRibs, setShowRibs] = useState<boolean>(false);
  const [showJevExaminer, setShowJevExaminer] = useState<boolean>(false);

  // Advanced Visual Depth & Workstation States (JEV System One)
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>('clinical');
  const [activeView, setActiveView] = useState<AnatomicalView>('isometric');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const lightingRigRef = useRef<StudioLightingRig | null>(null);

  // Projected 2D pin screen coordinates
  const [screenPins, setScreenPins] = useState<{ id: string; x: number; y: number; label: string }[]>([]);

  // Real-time physiological telemetry state
  const [telemetry, setTelemetry] = useState({
    phase: 'Inspiration (หายใจเข้า)',
    phasePercent: 0,
    volumeMl: 2500,
    tidalVolumeMl: 0,
    alveolarPressure: 0,
    intrapleuralPressure: -4.0,
    transpulmonaryPressure: 4.0,
  });

  // Cycle animation reference time
  const cycleTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const bpmRef = useRef<number>(bpm);
  const lastTelemetryUpdateRef = useRef<number>(0);
  const lastPinsUpdateRef = useRef<number>(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    lastTimeRef.current = performance.now();

    // Dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 11.2);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4.5;
    controls.maxDistance = 20;
    controls.target.set(0, 0.2, 0);
    controls.maxPolarAngle = Math.PI * 0.85;
    controlsRef.current = controls;

    // Lighting setup: Medical Studio Lighting Rig (JEV System One Standard)
    const lightingRig = setupStudioLighting(scene);
    lightingRigRef.current = lightingRig;
    setStudioLightingMode(lightingRig, 'clinical');

    // Contact Shadow Plane & Spatial Perspective Grid Floor
    const shadowPlane = createContactShadowPlane(4.8, -3.1, 0.85);
    scene.add(shadowPlane);

    const grid = createPerspectiveGrid(10, 24, -3.12, 0x0284c7, 0x1e293b);
    scene.add(grid);

    // ==========================================
    // PROCEDURAL ANATOMICAL MODELING
    // ==========================================
    lungMaterialsRef.current = [];

    // Materials
    const cartilageMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.3,
      metalness: 0.1,
    });

    const tracheaTubeMat = new THREE.MeshStandardMaterial({
      color: 0xe07a6a,
      roughness: 0.5,
      metalness: 0.05,
    });

    const bronchusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.35,
      metalness: 0.1,
    });

    const lungTissueMat = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      roughness: 0.42,
      metalness: 0.05,
      transmission: 0.45,
      transparent: true,
      opacity: 0.65,
      clearcoat: 0.28,
      clearcoatRoughness: 0.3,
      ior: 1.35,
    });
    lungMaterialsRef.current.push(lungTissueMat);

    // 1. TRACHEA & CARTILAGE RINGS
    const tracheaGroup = new THREE.Group();
    const tracheaHeight = 1.8;
    const tracheaRadius = 0.35;
    const tracheaCenterY = 2.65;

    const tracheaGeom = new THREE.CylinderGeometry(
      tracheaRadius * 0.95,
      tracheaRadius * 0.95,
      tracheaHeight,
      32
    );
    const tracheaMesh = new THREE.Mesh(tracheaGeom, tracheaTubeMat);
    tracheaMesh.position.set(0, tracheaCenterY, 0);
    tracheaGroup.add(tracheaMesh);

    const ringCount = 10;
    for (let i = 0; i < ringCount; i++) {
      const ringY =
        tracheaCenterY - tracheaHeight / 2 + 0.1 + (i * (tracheaHeight - 0.2)) / (ringCount - 1);
      const ringGeom = new THREE.TorusGeometry(tracheaRadius, 0.065, 12, 32, Math.PI * 1.6);
      const ringMesh = new THREE.Mesh(ringGeom, cartilageMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.rotation.z = Math.PI * 0.2;
      ringMesh.position.set(0, ringY, 0);
      tracheaGroup.add(ringMesh);
    }
    scene.add(tracheaGroup);

    // 2. CARINA & BRONCHIAL TREE
    const bronchialGroup = new THREE.Group();

    // Carina
    const carinaGeom = new THREE.SphereGeometry(0.38, 24, 24);
    const carinaMesh = new THREE.Mesh(carinaGeom, cartilageMat);
    carinaMesh.position.set(0, 1.75, 0);
    carinaMesh.scale.set(1, 0.8, 1);
    bronchialGroup.add(carinaMesh);

    // Right Main Bronchus (Shorter, wider, ~24°)
    const rightBronchusGeom = new THREE.CylinderGeometry(0.26, 0.24, 1.3, 20);
    const rightBronchusMesh = new THREE.Mesh(rightBronchusGeom, bronchusMat);
    rightBronchusMesh.position.set(0.48, 1.3, 0);
    rightBronchusMesh.rotation.z = -0.42;
    bronchialGroup.add(rightBronchusMesh);

    // Right Lobar Bronchi
    const rLobarSup = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.9, 16), bronchusMat);
    rLobarSup.position.set(0.95, 1.3, 0.1);
    rLobarSup.rotation.z = -0.9;
    bronchialGroup.add(rLobarSup);

    const rLobarMid = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.85, 16), bronchusMat);
    rLobarMid.position.set(1.0, 0.8, 0.2);
    rLobarMid.rotation.z = -0.35;
    bronchialGroup.add(rLobarMid);

    const rLobarInf = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 1.1, 16), bronchusMat);
    rLobarInf.position.set(0.9, 0.4, -0.1);
    rLobarInf.rotation.z = -0.15;
    bronchialGroup.add(rLobarInf);

    // Left Main Bronchus (Longer, narrower, ~45°)
    const leftBronchusGeom = new THREE.CylinderGeometry(0.22, 0.2, 1.9, 20);
    const leftBronchusMesh = new THREE.Mesh(leftBronchusGeom, bronchusMat);
    leftBronchusMesh.position.set(-0.75, 1.25, 0);
    leftBronchusMesh.rotation.z = 0.78;
    bronchialGroup.add(leftBronchusMesh);

    // Left Lobar Bronchi
    const lLobarSup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 1.0, 16), bronchusMat);
    lLobarSup.position.set(-1.45, 1.3, 0.1);
    lLobarSup.rotation.z = 0.85;
    bronchialGroup.add(lLobarSup);

    const lLobarInf = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 1.1, 16), bronchusMat);
    lLobarInf.position.set(-1.3, 0.45, -0.1);
    lLobarInf.rotation.z = 0.25;
    bronchialGroup.add(lLobarInf);

    scene.add(bronchialGroup);

    // 3. RIGHT LUNG (3 distinct lobes)
    const rightLungGroup = new THREE.Group();
    rightLungGroupRef.current = rightLungGroup;
    rightLungGroup.position.set(0.6, 0.3, 0);

    const rSupGeom = new THREE.SphereGeometry(1.0, 32, 28);
    rSupGeom.scale(1.1, 1.25, 1.0);
    const rSupMesh = new THREE.Mesh(rSupGeom, lungTissueMat);
    rSupMesh.position.set(1.0, 1.0, 0);
    rSupMesh.rotation.z = -0.1;
    rightLungGroup.add(rSupMesh);

    const rMidGeom = new THREE.SphereGeometry(0.9, 32, 28);
    rMidGeom.scale(1.05, 0.85, 0.95);
    const rMidMesh = new THREE.Mesh(rMidGeom, lungTissueMat);
    rMidMesh.position.set(1.15, 0.15, 0.25);
    rightLungGroup.add(rMidMesh);

    const rInfGeom = new THREE.SphereGeometry(1.2, 32, 28);
    rInfGeom.scale(1.2, 1.1, 1.1);
    const rInfMesh = new THREE.Mesh(rInfGeom, lungTissueMat);
    rInfMesh.position.set(1.05, -0.9, -0.1);
    rightLungGroup.add(rInfMesh);

    scene.add(rightLungGroup);

    // 4. LEFT LUNG (2 lobes + Cardiac Notch)
    const leftLungGroup = new THREE.Group();
    leftLungGroupRef.current = leftLungGroup;
    leftLungGroup.position.set(-0.6, 0.3, 0);

    const lSupGeom = new THREE.SphereGeometry(1.05, 32, 28);
    const posAttr = lSupGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);

      if (vx > -0.1 && vy < 0.2 && vz > -0.1) {
        posAttr.setX(i, vx * 0.55);
        posAttr.setZ(i, vz * 0.7);
      }
    }
    lSupGeom.computeVertexNormals();
    lSupGeom.scale(1.05, 1.35, 0.95);

    const lSupMesh = new THREE.Mesh(lSupGeom, lungTissueMat);
    lSupMesh.position.set(-1.0, 0.95, 0);
    lSupMesh.rotation.z = 0.1;
    leftLungGroup.add(lSupMesh);

    const lInfGeom = new THREE.SphereGeometry(1.15, 32, 28);
    lInfGeom.scale(1.15, 1.2, 1.05);
    const lInfMesh = new THREE.Mesh(lInfGeom, lungTissueMat);
    lInfMesh.position.set(-1.0, -0.85, -0.1);
    leftLungGroup.add(lInfMesh);

    scene.add(leftLungGroup);

    // Cardiac Silhouette
    const heartGeom = new THREE.SphereGeometry(0.7, 24, 24);
    heartGeom.scale(0.9, 1.15, 0.85);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.5,
      metalness: 0.1,
      transparent: true,
      opacity: 0.5,
    });
    const heartMesh = new THREE.Mesh(heartGeom, heartMat);
    heartMesh.position.set(-0.25, -0.1, 0.3);
    heartMesh.rotation.z = 0.25;
    scene.add(heartMesh);

    // 5. PULMONARY VESSELS (Arteries & Veins)
    const vesselsGroup = new THREE.Group();
    vesselsGroupRef.current = vesselsGroup;

    // Pulmonary Artery (Blue)
    const paMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      metalness: 0.15,
    });
    // Main trunk
    const paTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 1.1, 16), paMat);
    paTrunk.position.set(-0.15, 1.05, 0.35);
    paTrunk.rotation.z = -0.2;
    vesselsGroup.add(paTrunk);

    // Right Pulmonary Artery branch
    const paRight = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 1.6, 16), paMat);
    paRight.position.set(0.65, 1.1, 0.25);
    paRight.rotation.z = -1.2;
    vesselsGroup.add(paRight);

    // Left Pulmonary Artery branch
    const paLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 1.4, 16), paMat);
    paLeft.position.set(-0.75, 1.15, 0.25);
    paLeft.rotation.z = 1.15;
    vesselsGroup.add(paLeft);

    // Pulmonary Veins (Oxygenated Red)
    const pvMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      metalness: 0.15,
    });

    const pvRightSup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 1.2, 16), pvMat);
    pvRightSup.position.set(0.7, 0.65, 0.35);
    pvRightSup.rotation.z = -1.0;
    vesselsGroup.add(pvRightSup);

    const pvRightInf = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 1.1, 16), pvMat);
    pvRightInf.position.set(0.65, 0.25, 0.3);
    pvRightInf.rotation.z = -0.7;
    vesselsGroup.add(pvRightInf);

    const pvLeftSup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 1.1, 16), pvMat);
    pvLeftSup.position.set(-0.8, 0.6, 0.35);
    pvLeftSup.rotation.z = 0.95;
    vesselsGroup.add(pvLeftSup);

    const pvLeftInf = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 1.0, 16), pvMat);
    pvLeftInf.position.set(-0.75, 0.2, 0.3);
    pvLeftInf.rotation.z = 0.65;
    vesselsGroup.add(pvLeftInf);

    scene.add(vesselsGroup);

    // 6. THORACIC RIB CAGE CONTOUR (Optional layer)
    const ribGroup = new THREE.Group();
    ribCageGroupRef.current = ribGroup;
    const ribMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    const ribLevels = [1.8, 1.1, 0.4, -0.3, -1.0];
    ribLevels.forEach((ry, idx) => {
      const ribRadius = 2.6 + idx * 0.2;
      const ribGeom = new THREE.TorusGeometry(ribRadius, 0.04, 6, 32, Math.PI * 1.55);
      const ribMesh = new THREE.Mesh(ribGeom, ribMat);
      ribMesh.rotation.x = Math.PI / 2 + 0.15;
      ribMesh.rotation.z = Math.PI * 0.22;
      ribMesh.position.set(0, ry, 0);
      ribMesh.scale.set(1.15, 0.85, 1.0);
      ribGroup.add(ribMesh);
    });
    ribGroup.visible = false;
    scene.add(ribGroup);

    // 7. DIAPHRAGM DOME
    const diaphragmRadius = 3.6;
    const diaphragmGeom = new THREE.SphereGeometry(
      diaphragmRadius,
      36,
      20,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.36
    );
    diaphragmGeom.scale(1.0, 0.45, 0.85);
    const diaphragmMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.6,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const diaphragmMesh = new THREE.Mesh(diaphragmGeom, diaphragmMat);
    diaphragmMesh.position.set(0, -2.1, 0);
    diaphragmMesh.rotation.x = Math.PI;
    diaphragmMeshRef.current = diaphragmMesh;
    scene.add(diaphragmMesh);

    const tendonGeom = new THREE.CircleGeometry(1.4, 24);
    const tendonMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const tendonMesh = new THREE.Mesh(tendonGeom, tendonMat);
    tendonMesh.rotation.x = Math.PI / 2;
    tendonMesh.position.set(0, -2.08, 0);
    tendonMesh.scale.set(1.2, 0.8, 1);
    scene.add(tendonMesh);

    // 8. DYNAMIC AIRFLOW PARTICLES SYSTEM
    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    const particlesMeta: AirParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const side: 'right' | 'left' = Math.random() > 0.48 ? 'right' : 'left';
      const progress = Math.random(); // 0 (trachea top) -> 1 (deep lung)
      particlesMeta.push({
        side,
        progress,
        speed: 0.35 + Math.random() * 0.3,
        offsetAngle: Math.random() * Math.PI * 2,
        radius: 0.08 + Math.random() * 0.12,
      });

      // Initial positions
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 3.5 - progress * 4.5;
      particlePositions[i * 3 + 2] = 0;
    }
    particleMetaRef.current = particlesMeta;

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.13,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const airflowPoints = new THREE.Points(particleGeom, particleMat);
    airflowPointsRef.current = airflowPoints;
    airflowPoints.visible = true;
    scene.add(airflowPoints);

    // ==========================================
    // RENDER & ANIMATION LOOP
    // ==========================================
    const render = () => {
      animIdRef.current = requestAnimationFrame(render);

      const now = performance.now();
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      let isInsp = true;
      let breathFactor = 0;
      let cycleProgress = 0;

      if (isPlayingRef.current) {
        const cycleDuration = 60 / bpmRef.current;
        cycleTimeRef.current = (cycleTimeRef.current + deltaSec) % cycleDuration;
        cycleProgress = cycleTimeRef.current / cycleDuration;

        let palv = 0;
        let pip = -4.0;

        if (cycleProgress <= 0.4) {
          isInsp = true;
          const phaseT = cycleProgress / 0.4;
          breathFactor = Math.sin((phaseT * Math.PI) / 2);
          palv = -1.0 * Math.sin(phaseT * Math.PI);
          pip = -4.0 - 3.0 * breathFactor;
        } else {
          isInsp = false;
          const phaseT = (cycleProgress - 0.4) / 0.6;
          breathFactor = Math.cos((phaseT * Math.PI) / 2);
          palv = 1.0 * Math.sin(phaseT * Math.PI);
          pip = -7.0 + 3.0 * (1 - breathFactor);
        }

        // Biological expansion
        const scaleX = 1.0 + breathFactor * 0.14;
        const scaleY = 1.0 + breathFactor * 0.08;
        const scaleZ = 1.0 + breathFactor * 0.12;

        if (rightLungGroupRef.current) rightLungGroupRef.current.scale.set(scaleX, scaleY, scaleZ);
        if (leftLungGroupRef.current) leftLungGroupRef.current.scale.set(scaleX, scaleY, scaleZ);

        if (diaphragmMeshRef.current) {
          diaphragmMeshRef.current.position.y = -2.1 - breathFactor * 0.38;
        }

        // Throttled telemetry update (10Hz / ~100ms) to eliminate 60fps React component thrashing
        if (now - lastTelemetryUpdateRef.current > 100) {
          lastTelemetryUpdateRef.current = now;
          setTelemetry({
            phase: isInsp ? 'Inspiration (หายใจเข้า)' : 'Expiration (หายใจออก)',
            phasePercent: Math.round(cycleProgress * 100),
            volumeMl: Math.round(2500 + breathFactor * 500),
            tidalVolumeMl: Math.round(breathFactor * 500),
            alveolarPressure: parseFloat(palv.toFixed(1)),
            intrapleuralPressure: parseFloat(pip.toFixed(1)),
            transpulmonaryPressure: parseFloat((palv - pip).toFixed(1)),
          });
        }
      }

      // Update Airflow Particles
      if (airflowPointsRef.current && airflowPointsRef.current.visible) {
        const positions = airflowPointsRef.current.geometry.attributes.position.array as Float32Array;
        const metas = particleMetaRef.current;

        for (let i = 0; i < metas.length; i++) {
          const meta = metas[i];
          const flowStep = deltaSec * meta.speed;

          if (isInsp) {
            meta.progress += flowStep;
            if (meta.progress > 1.0) meta.progress = 0.0;
          } else {
            meta.progress -= flowStep;
            if (meta.progress < 0.0) meta.progress = 1.0;
          }

          const prog = meta.progress;
          let px = 0;
          let py = 3.6 - prog * 4.6;
          let pz = Math.sin(meta.offsetAngle) * meta.radius;

          if (py > 1.7) {
            // In Trachea
            px = Math.cos(meta.offsetAngle) * meta.radius * 0.6;
          } else {
            // Below Carina: branch into Left or Right Lung
            const branchFactor = (1.7 - py) / 2.8;
            if (meta.side === 'right') {
              px = 0.2 + branchFactor * 1.6 + Math.cos(meta.offsetAngle) * meta.radius * 2;
            } else {
              px = -(0.2 + branchFactor * 1.6 + Math.cos(meta.offsetAngle) * meta.radius * 2);
            }
            pz = Math.sin(meta.offsetAngle) * (meta.radius + branchFactor * 0.6);
          }

          positions[i * 3] = px;
          positions[i * 3 + 1] = py;
          positions[i * 3 + 2] = pz;
        }

        airflowPointsRef.current.geometry.attributes.position.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);

      // Throttled 2D projection for landmark pins (~100ms)
      if (now - lastPinsUpdateRef.current > 100 && camera && canvas) {
        lastPinsUpdateRef.current = now;
        const rect = canvas.getBoundingClientRect();
        const pins = LANDMARKS.map((landmark) => {
          const v = landmark.position.clone();
          v.project(camera);
          if (v.z > 1) {
            return { id: landmark.id, x: -9999, y: -9999, label: landmark.label };
          }
          const screenX = ((v.x + 1) * rect.width) / 2;
          const screenY = ((-v.y + 1) * rect.height) / 2;
          return {
            id: landmark.id,
            x: screenX,
            y: screenY,
            label: landmark.label,
          };
        });
        setScreenPins(pins);
      }
    };

    render();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Sync tissue opacity
  useEffect(() => {
    lungMaterialsRef.current.forEach((mat) => {
      mat.opacity = tissueOpacity;
      mat.transmission = tissueOpacity < 0.4 ? 0.8 : 0.45;
      mat.needsUpdate = true;
    });
  }, [tissueOpacity]);

  // Sync Airflow visibility
  useEffect(() => {
    if (airflowPointsRef.current) {
      airflowPointsRef.current.visible = showAirflow;
    }
  }, [showAirflow]);

  // Sync Vessels visibility
  useEffect(() => {
    if (vesselsGroupRef.current) {
      vesselsGroupRef.current.visible = showVessels;
    }
  }, [showVessels]);

  // Sync Ribs visibility
  useEffect(() => {
    if (ribCageGroupRef.current) {
      ribCageGroupRef.current.visible = showRibs;
    }
  }, [showRibs]);

  const handleViewChange = (view: AnatomicalView) => {
    setActiveView(view);
    if (cameraRef.current && controlsRef.current) {
      const targetPos = getAnatomicalCoordinates(view, 10.5, 0.2);
      smoothTransitionCamera(cameraRef.current, controlsRef.current, targetPos, new THREE.Vector3(0, 0.2, 0));
    }
  };

  const handleLightingChange = (mode: LightingMode) => {
    setLightingMode(mode);
    if (lightingRigRef.current) {
      setStudioLightingMode(lightingRigRef.current, mode);
    }
  };

  const handleToggleWireframe = () => {
    setIsWireframe((prev) => {
      const next = !prev;
      if (sceneRef.current) {
        toggleSceneWireframe(sceneRef.current, next);
      }
      return next;
    });
  };

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    setActiveView('isometric');
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 0.3, 11.2);
    controlsRef.current.target.set(0, 0.2, 0);
    controlsRef.current.update();
  }, []);

  const handleToggleFullscreen = useCallback(() => {
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
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleToggleFullscreen();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isFullscreen, handleToggleFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`${styles.simWrapper} ${isFullscreen ? styles.fullscreen : ''} ${
        isTheater ? styles.theaterMode : ''
      }`}
    >
      {/* Simulation Header */}
      <div className={styles.simHeader}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.liveLed} />
          <span className={styles.badge3D}>3D Studio</span>
          <span className={styles.engineTag}>img2threejs</span>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            แบบจำลอง 3D สรีรวิทยาปอดและระบบหายใจมนุษย์
          </h3>
        </div>

        {/* Anatomical Orientation Preset Dials */}
        <div className={styles.presetsBar}>
          <button
            type="button"
            className={`${styles.presetBtn} ${activeView === 'anterior' ? styles.active : ''}`}
            onClick={() => handleViewChange('anterior')}
          >
            หน้า
          </button>
          <button
            type="button"
            className={`${styles.presetBtn} ${activeView === 'posterior' ? styles.active : ''}`}
            onClick={() => handleViewChange('posterior')}
          >
            หลัง
          </button>
          <button
            type="button"
            className={`${styles.presetBtn} ${activeView === 'left' ? styles.active : ''}`}
            onClick={() => handleViewChange('left')}
          >
            ข้าง
          </button>
          <button
            type="button"
            className={`${styles.presetBtn} ${activeView === 'superior' ? styles.active : ''}`}
            onClick={() => handleViewChange('superior')}
          >
            บน
          </button>
          <button
            type="button"
            className={`${styles.presetBtn} ${activeView === 'isometric' ? styles.active : ''}`}
            onClick={() => handleViewChange('isometric')}
          >
            3D Iso
          </button>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={`${styles.actionBtn} ${lightingMode === 'cinematic' ? styles.actionBtnActive : ''}`}
            onClick={() =>
              handleLightingChange(
                lightingMode === 'clinical' ? 'cinematic' : lightingMode === 'cinematic' ? 'radiology' : 'clinical'
              )
            }
            title={`โหมดแสง: ${
              lightingMode === 'clinical'
                ? 'Clinical Bright (สว่างชัด)'
                : lightingMode === 'cinematic'
                ? 'Cinematic Depth (มิติเงาลึก)'
                : 'Radiology Dark (เอกซเรย์มืด)'
            }`}
          >
            {lightingMode === 'clinical' && <Sun size={14} />}
            {lightingMode === 'cinematic' && <Sparkles size={14} />}
            {lightingMode === 'radiology' && <Moon size={14} />}
            <span>{lightingMode === 'clinical' ? 'Bright' : lightingMode === 'cinematic' ? 'Cinematic' : 'Dark'}</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${isWireframe ? styles.actionBtnActive : ''}`}
            onClick={handleToggleWireframe}
            title="ตรวจดูโครงสร้างเรขาคณิตตาข่าย (Polygon Mesh Wireframe)"
          >
            <Grid size={14} />
            <span>ตาข่าย</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${isPlaying ? styles.actionBtnActive : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'หยุดการเคลื่อนไหวชั่วคราว' : 'เริ่มเคลื่อนไหว'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'หยุด' : 'เล่น'}</span>
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleResetCamera}
            title="รีเซ็ตมุมมองกล้อง"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.jevToggleBtn}`}
            onClick={() => setShowJevExaminer(!showJevExaminer)}
            title="เปิดระบบ JEV AI วิเคราะห์และตรวจคำตอบสรีรวิทยา"
          >
            <Sparkles size={14} />
            <span>{showJevExaminer ? 'ซ่อน JEV' : '🤖 JEV AI'}</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${isTheater ? styles.actionBtnActive : ''}`}
            onClick={() => setIsTheater((prev) => !prev)}
            title={isTheater ? 'ย่อเป็นมุมมองมาตรฐาน' : 'ขยายโหมดโรงภาพยนตร์กว้างพิเศษ (Theater Mode)'}
          >
            <Maximize2 size={14} />
            <span>Theater</span>
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleToggleFullscreen}
            title="ขยายแบบจำลอง 3D เต็มจอ"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        className={styles.viewportContainer}
        style={{ height: isFullscreen ? '100vh' : undefined }}
      >
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.reticle} />

        {/* 3D Landmark Hotspot Pins */}
        {screenPins.map((pin) => {
          if (pin.x < 0 || pin.y < 0) return null;
          const isSelected = selectedLandmark?.id === pin.id;
          const landmarkData = LANDMARKS.find((l) => l.id === pin.id);
          return (
            <div
              key={pin.id}
              className={styles.hotspotPin}
              style={{ left: `${pin.x}px`, top: `${pin.y}px` }}
              onClick={() => setSelectedLandmark(landmarkData || null)}
              title={landmarkData?.nameTh}
            >
              <div className={`${styles.pinDot} ${isSelected ? styles.pinDotActive : ''}`}>
                {pin.label}
              </div>
            </div>
          );
        })}

        {/* Real-time Physiological Telemetry HUD */}
        <div className={styles.telemetryOverlay}>
          <div className={styles.telemetryTitle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} />
              <span>Telemetry สด</span>
            </div>
            <span
              className={`${styles.phaseBadge} ${
                telemetry.phase.startsWith('Insp')
                  ? styles.phaseInspiration
                  : styles.phaseExpiration
              }`}
            >
              {telemetry.phase.startsWith('Insp') ? 'Inspiration' : 'Expiration'}
            </span>
          </div>

          <div className={styles.telemetryGrid}>
            <span className={styles.telemetryLabel}>ความดันถุงลม (Palv):</span>
            <span
              className={styles.telemetryValue}
              style={{
                color:
                  telemetry.alveolarPressure < 0
                    ? '#38bdf8'
                    : telemetry.alveolarPressure > 0
                    ? '#f43f5e'
                    : '#34d399',
              }}
            >
              {telemetry.alveolarPressure > 0 ? `+${telemetry.alveolarPressure}` : telemetry.alveolarPressure} mmHg
            </span>

            <span className={styles.telemetryLabel}>เยื่อหุ้มปอด (Pip):</span>
            <span className={styles.telemetryValue} style={{ color: '#a78bfa' }}>
              {telemetry.intrapleuralPressure} mmHg
            </span>

            <span className={styles.telemetryLabel}>Transpulmonary (Ptp):</span>
            <span className={styles.telemetryValue} style={{ color: '#f59e0b' }}>
              +{telemetry.transpulmonaryPressure} mmHg
            </span>

            <span className={styles.telemetryLabel}>ปริมาตรหายใจ (VT):</span>
            <span className={styles.telemetryValue}>
              {telemetry.tidalVolumeMl} mL
            </span>

            <span className={styles.telemetryLabel}>ปริมาตรรวมในปอด:</span>
            <span className={styles.telemetryValue} style={{ color: '#93c5fd' }}>
              {telemetry.volumeMl} mL
            </span>
          </div>
        </div>

        {/* Hotspot Selected Detail Card */}
        {selectedLandmark && (
          <div className={styles.hotspotCard}>
            <div className={styles.hotspotCardHeader}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                  {selectedLandmark.nameEn}
                </span>
                <h4 className={styles.hotspotCardTitle}>{selectedLandmark.nameTh}</h4>
              </div>
              <button
                type="button"
                className={styles.closeCardBtn}
                onClick={() => setSelectedLandmark(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.hotspotCardBody}>
              <p style={{ margin: '0 0 8px' }}>{selectedLandmark.description}</p>
              <div className={styles.hotspotCardClinical}>
                <strong>💡 ความสำคัญทางคลินิก/สรีรวิทยา:</strong>
                <p style={{ margin: '4px 0 0' }}>{selectedLandmark.clinicalNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Touch & Interaction Hint */}
        <div className={styles.touchHint}>
          <Info size={14} />
          <span>
            หมุน 360° (คลิก/สัมผัสลาก) • ซูมเข้า-ออก (ล้อเมาส์ / กางสองนิ้ว) • คลิกจุดตัวเลข 1-6 เพื่อดูจุดกายวิภาค
          </span>
        </div>
      </div>

      {/* Control Toolbar below Canvas */}
      <div className={styles.controlToolbar}>
        {/* Breathing Rate Selector */}
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>อัตราการหายใจ (Rate):</span>
          <div className={styles.rateButtons}>
            <button
              type="button"
              className={`${styles.rateBtn} ${bpm === 6 ? styles.rateBtnActive : ''}`}
              onClick={() => setBpm(6)}
            >
              Bradypnea (6)
            </button>
            <button
              type="button"
              className={`${styles.rateBtn} ${bpm === 14 ? styles.rateBtnActive : ''}`}
              onClick={() => setBpm(14)}
            >
              ปกติ (14)
            </button>
            <button
              type="button"
              className={`${styles.rateBtn} ${bpm === 24 ? styles.rateBtnActive : ''}`}
              onClick={() => setBpm(24)}
            >
              Tachypnea (24)
            </button>
            <button
              type="button"
              className={`${styles.rateBtn} ${bpm === 36 ? styles.rateBtnActive : ''}`}
              onClick={() => setBpm(36)}
            >
              ออกกำลัง (36)
            </button>
          </div>
        </div>

        {/* 3D Visual Layers Toggles: Airflow, Vessels, Ribs */}
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>เลเยอร์กายวิภาค:</span>
          <button
            type="button"
            className={`${styles.actionBtn} ${showAirflow ? styles.actionBtnActive : ''}`}
            onClick={() => setShowAirflow(!showAirflow)}
            title="เปิด/ปิด ละอองการไหลเวียนของอากาศหายใจ"
          >
            <Wind size={14} />
            <span>ละอองอากาศ</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${showVessels ? styles.actionBtnActive : ''}`}
            onClick={() => setShowVessels(!showVessels)}
            title="เปิด/ปิด หลอดเลือดปอด (แดง/น้ำเงิน)"
          >
            <Heart size={14} />
            <span>หลอดเลือด</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${showRibs ? styles.actionBtnActive : ''}`}
            onClick={() => setShowRibs(!showRibs)}
            title="เปิด/ปิด ซี่โครงทรวงอกจำลอง"
          >
            <Shield size={14} />
            <span>ซี่โครง</span>
          </button>
        </div>

        {/* X-Ray / Tissue Opacity Slider */}
        <div className={styles.controlGroup}>
          <div className={styles.sliderGroup}>
            <Layers size={16} color="var(--primary)" />
            <span className={styles.controlLabel}>โหมด X-Ray:</span>
            <input
              type="range"
              min="0.15"
              max="0.95"
              step="0.05"
              value={tissueOpacity}
              onChange={(e) => setTissueOpacity(parseFloat(e.target.value))}
              className={styles.rangeInput}
              aria-label="ความโปร่งแสงเนื้อปอด"
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '36px' }}>
              {Math.round(tissueOpacity * 100)}%
            </span>
          </div>

          <button
            type="button"
            className={`${styles.actionBtn} ${tissueOpacity <= 0.25 ? styles.actionBtnActive : ''}`}
            onClick={() => setTissueOpacity(tissueOpacity <= 0.25 ? 0.7 : 0.2)}
            title="สลับโหมดโปร่งแสงเพื่อดูหลอดลมภายใน"
          >
            <Eye size={14} />
            <span>{tissueOpacity <= 0.25 ? 'เนื้อปอดทึบ' : 'X-Ray'}</span>
          </button>
        </div>
      </div>

      {/* Embedded JEV AI Socratic Examiner Panel */}
      {showJevExaminer && (
        <div className={styles.jevEmbedContainer}>
          <JevPhysioExaminer />
        </div>
      )}
    </div>
  );
};

export default RealisticLungs3DSim;
