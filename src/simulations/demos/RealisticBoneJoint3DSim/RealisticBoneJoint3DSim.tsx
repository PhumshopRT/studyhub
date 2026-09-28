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
  Bone,
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
import styles from './RealisticBoneJoint3DSim.module.css';

interface BonePin {
  id: string;
  pinNumber: string;
  nameTh: string;
  nameEn: string;
  position: THREE.Vector3;
  category: 'anatomy' | 'metabolic' | 'trauma' | 'joint';
  grossDesc: string;
  microDesc: string;
  clinicalNote: string;
}

const BONE_PINS: BonePin[] = [
  {
    id: 'cortical-bone',
    pinNumber: '1',
    nameTh: 'กระดูกเนื้อแน่นและระบบฮาเวอร์เชียน (Cortical Bone & Haversian System)',
    nameEn: 'Compact Cortical Bone & Osteon Architecture',
    position: new THREE.Vector3(0.35, 1.2, 0.45),
    category: 'anatomy',
    grossDesc:
      'ชั้นกระดูกทึบแน่นรอบนอก (Diaphysis) มีความแข็งแกร่งสูง ทนต่อแรงกดและแรงดึง ปกคลุมด้วยเยื่อหุ้มกระดูก Periosteum',
    microDesc:
      'ประกอบด้วย Osteons (Haversian systems) ทรงกระบอก เรียงตัวเป็นวงกลมซ้อนกัน (Concentric lamellae) ตรงกลางมี Haversian canal บรรจุเส้นเลือดและประสาท เซลล์ Osteocytes ฝังตัวใน Lacunae เชื่อมต่อกันด้วย Canaliculi',
    clinicalNote:
      'Osteoclasts สลายกระดูกเก่าและ Osteoblasts สร้าง Osteoid matrix ที่มี Type I Collagen 90% ก่อนตกผลึกแคลเซียม Hydroxyapatite ทำให้กระดูกแข็งแกร่งและยืดหยุ่น',
  },
  {
    id: 'osteoporosis',
    pinNumber: '2',
    nameTh: 'ภาวะกระดูกพรุนและกระดูกเนื้อโปร่งบาง (Osteoporosis & Trabecular Thinning)',
    nameEn: 'Osteoporotic Trabecular Resorption (T-score <= -2.5)',
    position: new THREE.Vector3(-0.15, 0.45, 0.45),
    category: 'metabolic',
    grossDesc:
      'เนื้อกระดูกโปร่ง (Cancellous / Trabecular bone) ในส่วนปลายกระดูก Epiphysis/Metaphysis มีโพรงพรุนกว้าง โครงค้ำยันบางลงอย่างรุนแรง เสี่ยงต่อการยุบตัว',
    microDesc:
      'Trabeculae มีจำนวนลดลง ขาดตอน (Microarchitectural deterioration) อัตราส่วนการสลายกระดูกโดย Osteoclasts สูงกว่าการสร้างของ Osteoblasts อย่างชัดเจน',
    clinicalNote:
      'เกณฑ์ WHO: T-score <= -2.5 จาก DXA scan การขาด Estrogen ในหญิงหมดประจำเดือนกระตุ้น RANKL ทำให้กระดูกสันหลังยุบ (Vertebral fracture) และคอกระดูกสะโพกหักง่าย (Femoral neck fracture)',
  },
  {
    id: 'fracture-callus',
    pinNumber: '3',
    nameTh: 'การสมานกระดูกหักและก้อนกระดูกอ่อนเชื่อม (Bone Fracture & Bony Callus)',
    nameEn: 'Fracture Healing & Woven-to-Lamellar Callus',
    position: new THREE.Vector3(0.0, 0.95, 0.5),
    category: 'trauma',
    grossDesc:
      'รอยหักผ่านกระดูก (Transverse fracture) มีกระดูกงอกเชื่อมพอกรอบรอยแตก (Callus formation) หนาตัวขึ้นเพื่อตรึงปลายกระดูกที่หักให้ติดกัน',
    microDesc:
      '4 ระยะการสมาน: (1) Hematoma & Neutrophils, (2) Soft callus (Granulation & Cartilage), (3) Hard callus (Woven bone สานกันแบบไม่เป็นระเบียบ), (4) Bone remodeling เป็น Lamellar bone',
    clinicalNote:
      'หากมีแรงขยับมากเกินไปหรือติดเชื้อ กระบวนการสมานอาจล้มเหลวกลายเป็น Non-union หรือรอยต่อข้อเทียม (Pseudoarthrosis)',
  },
  {
    id: 'osteoarthritis',
    pinNumber: '4',
    nameTh: 'ข้อเข่าเสื่อมและกระดูกงอก (Osteoarthritis: Eburnation & Osteophytes)',
    nameEn: 'Cartilage Degeneration, Subchondral Sclerosis & Osteophytes',
    position: new THREE.Vector3(0.65, -0.65, 0.65),
    category: 'joint',
    grossDesc:
      'กระดูกอ่อนผิวข้อ (Articular cartilage) สึกกร่อน แตกเป็นฝอย (Fibrillation) กระดูกใต้ข้อสัมผัสกันจนมันเงา (Eburnation) และมีกระดูกงอกยื่นออกมาที่ขอบข้อ (Osteophytes)',
    microDesc:
      'Chondrocytes แบ่งตัวรวมกลุ่ม (Clustering) ต่อมาตาย สาร Proteoglycan ลดลง กระดูกใต้ผิวข้อหนาตัวผิดปกติ (Subchondral bone sclerosis) ร่วมกับถุงน้ำในกระดูก (Subchondral cysts)',
    clinicalNote:
      'โรคข้อที่พบบ่อยที่สุด สัมพันธ์กับอายุและน้ำหนักตัว ปวดเวลาใช้งาน ดีขึ้นเมื่อพัก มีอาการตึงช่วงเช้าสั้นๆ (<30 นาที) แตกต่างจากรูมาตอยด์ และพบบวมที่ข้อนิ้ว DIP (Heberden nodes)',
  },
  {
    id: 'rheumatoid-pannus',
    pinNumber: '5',
    nameTh: 'ข้ออักเสบรูมาตอยด์และเยื่อพานนัสรุกราน (Rheumatoid Arthritis: Synovial Pannus)',
    nameEn: 'Autoimmune Synovitis, Pannus Formation & Cartilage Erosion',
    position: new THREE.Vector3(-0.65, -0.65, 0.55),
    category: 'joint',
    grossDesc:
      'เยื่อบุข้อ (Synovium) หนาตัว บวมแดง ยื่นเป็นติ่งเนื้ออักเสบคล้ายพรม (Pannus) แผ่คลุมและกัดกร่อนทำลายผิวข้อกระดูกอ่อนจนข้อผิดรูปและติดแข็ง (Ankylosis)',
    microDesc:
      'การอักเสบเรื้อรังรุนแรง: เยื่อบุ Synovial hyperplasia (ซ้อนกันหลายชั้น) เต็มไปด้วย Lymphocytes, Plasma cells และ Macrophages หลั่ง TNF-alpha, IL-1 และ RANKL สลายกระดูก',
    clinicalNote:
      'โรคแพ้ภูมิตัวเอง เป็นแบบสมมาตร 2 ข้าง ปวดตึงข้อช่วงเช้านาน >1 ชั่วโมง ตรวจพบ Rheumatoid Factor (RF) และ Anti-CCP สูงเด่น มักเป็นที่ข้อ MCP และ PIP',
  },
  {
    id: 'gout-tophus',
    pinNumber: '6',
    nameTh: 'ก้อนโทฟัสและผลึกกรดยูริกรูปเข็ม (Gouty Tophus & Urate Crystals)',
    nameEn: 'Monosodium Urate (MSU) Crystals & Tophaceous Gout',
    position: new THREE.Vector3(0.85, -1.15, 0.55),
    category: 'metabolic',
    grossDesc:
      'ก้อนทึกสีขาวขุ่นคล้ายชอล์ก (Chalky white tophus) ฝังตัวอยู่รอบแคปซูลข้อและเอ็น จากภาวะกรดยูริกในเลือดสูงเรื้อรัง (Hyperuricemia)',
    microDesc:
      'ผลึกรูปเข็ม Monosodium urate ล้อมรอบด้วย Foreign body multinucleated giant cells และ Macrophages ตรวจ Polarization microscopy พบ Negative birefringence เป็นสีเหลืองสดใส',
    clinicalNote:
      'มักปวดข้อเฉียบพลัน รุนแรง แดงร้อน มักเริ่มที่ข้อนิ้วหัวแม่เท้าข้อแรก (Podagra) ก้อน Tophi อาจแตกเป็นสารสีขาวคล้ายชอล์กไหลออกมา',
  },
];

// Helper: Pin Canvas Texture Generator
function createBonePinTexture(number: string, color: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.clearRect(0, 0, 128, 128);

  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(64, 64, 46, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number, 64, 66);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const RealisticBoneJoint3DSim: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [activeFilter, setActiveFilter] = useState<'all' | 'osteoporosis' | 'fracture' | 'oa' | 'ra' | 'normal'>('all');
  const [isCrossSection, setIsCrossSection] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [selectedPin, setSelectedPin] = useState<BonePin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Interactive DXA T-Score Slider (-4.0 to +1.0)
  const [tScore, setTScore] = useState<number>(-1.0);

  // Sync refs to decouple WebGL scene lifecycle
  const isAutoRotateRef = useRef<boolean>(isAutoRotate);
  const tScoreRef = useRef<number>(tScore);

  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  useEffect(() => {
    tScoreRef.current = tScore;
  }, [tScore]);

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

  // Pathology group references
  const osteoporosisGroupRef = useRef<THREE.Group | null>(null);
  const fractureGroupRef = useRef<THREE.Group | null>(null);
  const oaGroupRef = useRef<THREE.Group | null>(null);
  const raGroupRef = useRef<THREE.Group | null>(null);
  const normalCartilageRef = useRef<THREE.Mesh | null>(null);

  const clipPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 0, -1), 0));

  const handleViewChange = (view: AnatomicalView) => {
    setActiveView(view);
    if (cameraRef.current && controlsRef.current) {
      const targetPos = getAnatomicalCoordinates(view, 5.2, 0.3);
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

  // Compute Bone Mineral Density Status
  let bmdStatus = 'NORMAL BMD';
  let bmdBadgeClass = styles.statusNormal;
  if (tScore < -1.0 && tScore > -2.5) {
    bmdStatus = 'OSTEOPENIA';
    bmdBadgeClass = styles.statusWarning;
  } else if (tScore <= -2.5) {
    bmdStatus = tScore <= -3.2 ? '🚨 SEVERE OSTEOPOROSIS' : 'OSTEOPOROSIS';
    bmdBadgeClass = styles.statusCritical;
  }

  // Fracture risk probability estimation
  const fractureRisk = Math.min(85, Math.max(3, Math.round(5 + Math.pow(Math.abs(Math.min(0, tScore)), 2.3) * 6)));

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
    camera.position.set(3.6, 2.0, 3.6);
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
    controls.maxDistance = 8.5;

    // 5. Studio 3-Point Depth Lighting with Dual Rim Lights
    const rig = setupStudioLighting(scene);
    lightingRigRef.current = rig;
    setStudioLightingMode(rig, 'cinematic');

    // 6. Ground Contact Shadow & Spatial Perspective Floor Grid
    const shadowDisc = createContactShadowPlane(4.4, -2.25, 0.85);
    scene.add(shadowDisc);

    const grid = createPerspectiveGrid(9.5, 24, -2.26, 0xf59e0b, 0x1e293b);
    scene.add(grid);

    // -------------------------------------------------------------
    // 7. Procedural Bone & Joint Construction (img2threejs)
    // -------------------------------------------------------------
    const anatomyRoot = new THREE.Group();
    scene.add(anatomyRoot);
    anatomyGroupRef.current = anatomyRoot;

    // Cortical Bone Material (Dense ivory-white)
    const corticalMat = new THREE.MeshStandardMaterial({
      color: 0xfaf5ef,
      roughness: 0.28,
      metalness: 0.08,
      clippingPlanes: [],
      clipShadows: true,
    });

    // Articular Cartilage Material (Translucent pearly bluish-white)
    const cartilageMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.15,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
      clippingPlanes: [],
    });

    // Spongy Trabecular Interior (Visible in cutaway)
    const trabecularMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.75,
      metalness: 0.05,
      wireframe: true,
      clippingPlanes: [],
    });

    // 7.1 Femur Shaft (Diaphysis)
    const femurShaftGeo = new THREE.CylinderGeometry(0.32, 0.36, 1.8, 32);
    const femurShaft = new THREE.Mesh(femurShaftGeo, corticalMat);
    femurShaft.position.set(0, 1.1, 0);
    anatomyRoot.add(femurShaft);

    // Trabecular core inside femur
    const femurCoreGeo = new THREE.CylinderGeometry(0.24, 0.26, 1.76, 24);
    const femurCore = new THREE.Mesh(femurCoreGeo, trabecularMat);
    femurCore.position.set(0, 1.1, 0);
    anatomyRoot.add(femurCore);

    // 7.2 Femur Condyles (Distal epiphysis)
    const leftCondyleGeo = new THREE.SphereGeometry(0.48, 24, 24);
    leftCondyleGeo.scale(0.85, 1.1, 1.25);
    const leftCondyle = new THREE.Mesh(leftCondyleGeo, corticalMat);
    leftCondyle.position.set(-0.42, 0.1, 0);
    anatomyRoot.add(leftCondyle);

    const rightCondyleGeo = new THREE.SphereGeometry(0.48, 24, 24);
    rightCondyleGeo.scale(0.85, 1.1, 1.25);
    const rightCondyle = new THREE.Mesh(rightCondyleGeo, corticalMat);
    rightCondyle.position.set(0.42, 0.1, 0);
    anatomyRoot.add(rightCondyle);

    // Femoral Articular Cartilage Shell
    const femCartilageGeo = new THREE.SphereGeometry(0.5, 24, 24, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55);
    femCartilageGeo.scale(1.85, 0.9, 1.25);
    const femCartilage = new THREE.Mesh(femCartilageGeo, cartilageMat);
    femCartilage.position.set(0, 0.02, 0);
    anatomyRoot.add(femCartilage);
    normalCartilageRef.current = femCartilage;

    // 7.3 Tibia Plateau & Shaft (Proximal leg bone)
    const tibiaPlateauGeo = new THREE.CylinderGeometry(0.85, 0.65, 0.4, 32);
    tibiaPlateauGeo.scale(1.15, 1.0, 0.85);
    const tibiaPlateau = new THREE.Mesh(tibiaPlateauGeo, corticalMat);
    tibiaPlateau.position.set(0, -0.65, 0);
    anatomyRoot.add(tibiaPlateau);

    const tibiaShaftGeo = new THREE.CylinderGeometry(0.35, 0.28, 1.3, 32);
    const tibiaShaft = new THREE.Mesh(tibiaShaftGeo, corticalMat);
    tibiaShaft.position.set(0, -1.45, 0);
    anatomyRoot.add(tibiaShaft);

    // Meniscus Cartilage Pads (C-shaped shock absorbers)
    const meniscusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.2,
      transparent: true,
      opacity: 0.75,
    });
    const leftMeniscusGeo = new THREE.TorusGeometry(0.32, 0.08, 12, 24, Math.PI * 1.6);
    const leftMeniscus = new THREE.Mesh(leftMeniscusGeo, meniscusMat);
    leftMeniscus.position.set(-0.38, -0.42, 0);
    leftMeniscus.rotation.x = Math.PI / 2;
    anatomyRoot.add(leftMeniscus);

    const rightMeniscusGeo = new THREE.TorusGeometry(0.32, 0.08, 12, 24, Math.PI * 1.6);
    const rightMeniscus = new THREE.Mesh(rightMeniscusGeo, meniscusMat);
    rightMeniscus.position.set(0.38, -0.42, 0);
    rightMeniscus.rotation.x = Math.PI / 2;
    anatomyRoot.add(rightMeniscus);

    // Collateral & Cruciate Ligaments
    const ligamentMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.35,
    });
    const lclGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 12);
    const lcl = new THREE.Mesh(lclGeo, ligamentMat);
    lcl.position.set(-0.75, -0.28, 0);
    anatomyRoot.add(lcl);

    const mclGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 12);
    const mcl = new THREE.Mesh(mclGeo, ligamentMat);
    mcl.position.set(0.75, -0.28, 0);
    anatomyRoot.add(mcl);

    // -------------------------------------------------------------
    // 8. Toggleable Pathology Lesions
    // -------------------------------------------------------------

    // 8.1 Osteoporosis Micro-cavities Group (Porous trabeculae)
    const osteoporosisGroup = new THREE.Group();
    for (let p = 0; p < 28; p++) {
      const poreGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 8, 8);
      const poreMat = new THREE.MeshBasicMaterial({ color: 0x78350f });
      const pore = new THREE.Mesh(poreGeo, poreMat);
      pore.position.set(
        (Math.random() - 0.5) * 0.5,
        0.5 + Math.random() * 1.0,
        (Math.random() - 0.5) * 0.5
      );
      osteoporosisGroup.add(pore);
    }
    anatomyRoot.add(osteoporosisGroup);
    osteoporosisGroupRef.current = osteoporosisGroup;

    // 8.2 Fracture Line & Callus Formation Group
    const fractureGroup = new THREE.Group();
    // Fracture jagged cleft
    const fractureRingGeo = new THREE.TorusGeometry(0.36, 0.05, 12, 32);
    const fractureMat = new THREE.MeshBasicMaterial({ color: 0x991b1b }); // Blood hematoma line
    const fractureLine = new THREE.Mesh(fractureRingGeo, fractureMat);
    fractureLine.position.set(0, 0.95, 0);
    fractureLine.rotation.x = Math.PI / 2;
    fractureLine.rotation.y = 0.2;
    fractureGroup.add(fractureLine);

    // Bony Callus Collar
    const callusGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 24);
    const callusMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Woven bony callus
      roughness: 0.6,
      transparent: true,
      opacity: 0.8,
    });
    const callus = new THREE.Mesh(callusGeo, callusMat);
    callus.position.set(0, 0.95, 0);
    fractureGroup.add(callus);

    anatomyRoot.add(fractureGroup);
    fractureGroupRef.current = fractureGroup;

    // 8.3 Osteoarthritis (OA) Osteophytes & Cartilage Loss
    const oaGroup = new THREE.Group();
    // Marginal osteophytes (Bone spurs)
    for (let sp = 0; sp < 8; sp++) {
      const spurGeo = new THREE.ConeGeometry(0.08, 0.25, 8);
      const spurMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 });
      const spur = new THREE.Mesh(spurGeo, spurMat);
      const angle = (sp / 8) * Math.PI * 2;
      spur.position.set(Math.cos(angle) * 0.8, -0.48, Math.sin(angle) * 0.55);
      spur.rotation.z = Math.cos(angle) * -0.5;
      oaGroup.add(spur);
    }
    anatomyRoot.add(oaGroup);
    oaGroupRef.current = oaGroup;

    // 8.4 Rheumatoid Arthritis (RA) Synovial Pannus
    const raGroup = new THREE.Group();
    const pannusMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Inflamed hypervascular proliferative synovium
      roughness: 0.4,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.3,
    });
    const pannusGeo = new THREE.TorusGeometry(0.72, 0.12, 16, 32);
    const pannus = new THREE.Mesh(pannusGeo, pannusMat);
    pannus.position.set(0, -0.35, 0);
    pannus.rotation.x = Math.PI / 2;
    raGroup.add(pannus);

    // Erosion pits on articular margin
    for (let ep = 0; ep < 6; ep++) {
      const pitGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const pitMat = new THREE.MeshBasicMaterial({ color: 0x450a0a });
      const pit = new THREE.Mesh(pitGeo, pitMat);
      const a = (ep / 6) * Math.PI * 2;
      pit.position.set(Math.cos(a) * 0.65, -0.38, Math.sin(a) * 0.5);
      raGroup.add(pit);
    }
    anatomyRoot.add(raGroup);
    raGroupRef.current = raGroup;

    // -------------------------------------------------------------
    // 9. Interactive 3D Landmark Pins
    // -------------------------------------------------------------
    pinSpritesRef.current = [];
    BONE_PINS.forEach((pin) => {
      const pinColor =
        pin.category === 'metabolic'
          ? '#f59e0b'
          : pin.category === 'trauma'
          ? '#ef4444'
          : pin.category === 'joint'
          ? '#8b5cf6'
          : '#3b82f6';
      const texture = createBonePinTexture(pin.pinNumber, pinColor);
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
        const matched = BONE_PINS.find((p) => p.id === pinId);
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

      if (isAutoRotateRef.current && anatomyRoot) {
        anatomyRoot.rotation.y += 0.0035;
      }

      // Pannus inflammatory pulse
      if (raGroupRef.current) {
        const pulse = 1 + Math.sin(elapsed * 4) * 0.04;
        raGroupRef.current.scale.set(pulse, pulse, pulse);
      }

      // Dynamically scale osteoporosis pores according to T-score
      if (osteoporosisGroupRef.current) {
        const severityScale = Math.max(0.2, (Math.abs(tScoreRef.current) / 4.0) * 1.5);
        osteoporosisGroupRef.current.scale.set(severityScale, severityScale, severityScale);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 12. Resize Listener
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

  // Update Bone Cutaway Clipping Planes dynamically without remounting scene
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

  // Handle Pathology Filter Visibility
  useEffect(() => {
    if (
      !osteoporosisGroupRef.current ||
      !fractureGroupRef.current ||
      !oaGroupRef.current ||
      !raGroupRef.current ||
      !normalCartilageRef.current
    )
      return;

    switch (activeFilter) {
      case 'osteoporosis':
        osteoporosisGroupRef.current.visible = true;
        fractureGroupRef.current.visible = false;
        oaGroupRef.current.visible = false;
        raGroupRef.current.visible = false;
        normalCartilageRef.current.visible = true;
        break;
      case 'fracture':
        osteoporosisGroupRef.current.visible = false;
        fractureGroupRef.current.visible = true;
        oaGroupRef.current.visible = false;
        raGroupRef.current.visible = false;
        normalCartilageRef.current.visible = true;
        break;
      case 'oa':
        osteoporosisGroupRef.current.visible = false;
        fractureGroupRef.current.visible = false;
        oaGroupRef.current.visible = true;
        raGroupRef.current.visible = false;
        normalCartilageRef.current.visible = false; // worn out
        break;
      case 'ra':
        osteoporosisGroupRef.current.visible = false;
        fractureGroupRef.current.visible = false;
        oaGroupRef.current.visible = false;
        raGroupRef.current.visible = true;
        normalCartilageRef.current.visible = true;
        break;
      case 'normal':
        osteoporosisGroupRef.current.visible = false;
        fractureGroupRef.current.visible = false;
        oaGroupRef.current.visible = false;
        raGroupRef.current.visible = false;
        normalCartilageRef.current.visible = true;
        break;
      case 'all':
      default:
        osteoporosisGroupRef.current.visible = true;
        fractureGroupRef.current.visible = true;
        oaGroupRef.current.visible = true;
        raGroupRef.current.visible = true;
        normalCartilageRef.current.visible = true;
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
      const targetPos = getAnatomicalCoordinates('isometric', 5.2, 0.3);
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
          <Bone size={18} color="#fbbf24" />
          <div>
            <h3>3D Musculoskeletal Workstation</h3>
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
            title="ผ่าตัดขวางเพื่อตรวจดูเนื้อกระดูกพรุนและโพรงไขกระดูก (Sagittal Cutaway)"
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

      {/* Filter Selector Bar */}
      <div className={styles.filterBar}>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.active : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          ทั้งหมด (Overview)
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'osteoporosis' ? styles.active : ''}`}
          onClick={() => setActiveFilter('osteoporosis')}
        >
          1. กระดูกพรุน (Osteoporosis)
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'fracture' ? styles.active : ''}`}
          onClick={() => setActiveFilter('fracture')}
        >
          2. กระดูกหัก & Callus
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'oa' ? styles.active : ''}`}
          onClick={() => setActiveFilter('oa')}
        >
          3. ข้อเสื่อม (OA / Osteophytes)
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'ra' ? styles.active : ''}`}
          onClick={() => setActiveFilter('ra')}
        >
          4. รูมาตอยด์ (RA / Pannus)
        </button>
      </div>

      {/* DXA T-Score Telemetry HUD */}
      <div className={styles.hudPanel}>
        <div className={styles.hudHeader}>
          <h4>
            <Activity size={14} /> DXA Scan T-Score & BMD HUD
          </h4>
          <span className={`${styles.hudStatusBadge} ${bmdBadgeClass}`}>{bmdStatus}</span>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>DEXA T-Score</span>
            <span className={styles.metricValue}>{tScore.toFixed(1)} SD</span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>10-Year Fracture Risk</span>
            <span
              className={styles.metricValue}
              style={{ color: fractureRisk > 30 ? '#f87171' : '#4ade80' }}
            >
              {fractureRisk}%
            </span>
          </div>
        </div>

        {/* T-Score Slider */}
        <div className={styles.sliderRow}>
          <label>
            <Sliders size={12} style={{ display: 'inline', marginRight: '4px' }} />
            T-Score:
          </label>
          <input
            type="range"
            min="-40"
            max="10"
            value={Math.round(tScore * 10)}
            onChange={(e) => setTScore(Number(e.target.value) / 10)}
          />
        </div>
      </div>

      {/* Selected Pin Detail Card Modal */}
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
              selectedPin.category === 'trauma'
                ? styles.emergency
                : selectedPin.category === 'metabolic'
                ? styles.warning
                : ''
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

export default RealisticBoneJoint3DSim;
