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
  Flame,
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
import styles from './RealisticHepatobiliary3DSim.module.css';

interface HepatoPin {
  id: string;
  pinNumber: string;
  nameTh: string;
  nameEn: string;
  position: THREE.Vector3;
  category: 'anatomy' | 'malignancy' | 'stone' | 'inflammation';
  grossDesc: string;
  microDesc: string;
  clinicalNote: string;
}

const HEPATO_PINS: HepatoPin[] = [
  {
    id: 'liver-lobules',
    pinNumber: '1',
    nameTh: 'กลีบตับขวาและโครงสร้าง Classical Lobule',
    nameEn: 'Right Hepatic Lobe & Classical Lobule Architecture',
    position: new THREE.Vector3(1.2, 0.4, 0.35),
    category: 'anatomy',
    grossDesc:
      'กลีบขวาของตับมีขนาดใหญ่กว่ากลีบซ้ายประมาณ 6 เท่า ผิวนอกเรียบ มันวาว มีสีน้ำตาลแดง (Reddish-brown) ปกคลุมด้วย Glisson’s capsule',
    microDesc:
      'Classical Lobule เป็นรูปหกเหลี่ยม (Hexagonal) ตรงกลางมี Central vein ที่มุมทั้ง 6 มี Portal triads ประกอบด้วย Portal venule, Hepatic arteriole และ Bile ductule เซลล์ตับจัดเรียงตัวเป็นแผ่นแผ่รัศมี (Cords) ขนาบข้างด้วย Sinusoids',
    clinicalNote:
      'เลือดจากหลอดเลือดดำพอร์ทัล (75%) และหลอดเลือดแดงตับ (25%) ไหลมารวมกันที่ Sinusoids ผ่านเซลล์ตับและ Kupffer cells ทำหน้าที่กรองสารพิษและสร้างโปรตีนสำคัญ เช่น Albumin และ Coagulation factors',
  },
  {
    id: 'cholelithiasis',
    pinNumber: '2',
    nameTh: 'นิ่วในถุงน้ำดีและถุงน้ำดีอักเสบ (Cholelithiasis & Cholecystitis)',
    nameEn: 'Gallstones & Acute Cholecystitis (Murphy’s Sign)',
    position: new THREE.Vector3(0.45, -0.65, 0.75),
    category: 'stone',
    grossDesc:
      'ถุงน้ำดีรูปหยดน้ำ (Pear-shaped) บวมตึง ผนังหนา มีก้อนนิ่วคอเลสเตอรอลสีเหลืองเหลี่ยมด้าน (Faceted cholesterol stones) อุดตันที่คอถุงน้ำดี (Hartmann’s pouch) หรือท่อ Cystic duct',
    microDesc:
      'ผนังถุงน้ำดีบวม มี Neutrophils และ Mononuclear cells แทรกซึม เยื่อบุเกิด Ulceration และในรายเรื้อรังจะพบ Rokitansky-Aschoff sinuses ลึกถึงชั้นกล้ามเนื้อ',
    clinicalNote:
      'กฎ 4Fs (Female, Fat, Forty, Fertile) มีอาการปวดจุกเสียดรุนแรงใต้ชายโครงขวาร้าวไปสะบัก ตรวจพบ Murphy’s Sign เป็นบวก หากนิ่วหลุดไปอุด Common Bile Duct จะเกิด Choledocholithiasis ดีซ่านตัวเหลืองตาเหลือง',
  },
  {
    id: 'cirrhosis',
    pinNumber: '3',
    nameTh: 'ตับแข็งและหลอดเลือดพอร์ทัลดันสูง (Micronodular Cirrhosis & Portal HTN)',
    nameEn: 'Cirrhosis, Regenerative Nodules & Portal Hypertension',
    position: new THREE.Vector3(-0.4, 0.2, 0.55),
    category: 'inflammation',
    grossDesc:
      'ตับหดตัวลง ผิวขรุขระเต็มไปด้วยปุ่มปมขนาดเล็กสม่ำเสมอ (< 3 มม. ใน Micronodular cirrhosis) หน้าตัดมีสีน้ำตาลเหลืองสลับกับแถบพังผืดสีเทาขาวหนาแน่น',
    microDesc:
      'การทำลายโครงสร้างตับอย่างถาวร เกิด Bridging fibrous septa ล้อมรอบ Regenerative nodules ของเซลล์ตับ โดย Stellated cells (Ito cells) เปลี่ยนรูปเป็น Myofibroblasts หลั่ง Collagen type I/III',
    clinicalNote:
      '🚨 ภาวะแทรกซ้อนวิกฤต: Portal Hypertension (>10-12 mmHg) ทำให้เกิด ท้องมาน (Ascites), หลอดเลือดขอดในหลอดอาหารแตกอาเจียนเป็นเลือดสด (Bleeding Esophageal Varices), ม้ามโต, และสมองเสื่อมจากตับวาย (Hepatic encephalopathy with Asterixis)',
  },
  {
    id: 'hcc',
    pinNumber: '4',
    nameTh: 'มะเร็งเซลล์ตับปฐมภูมิ (Hepatocellular Carcinoma - HCC)',
    nameEn: 'Hepatocellular Carcinoma (HCC & Elevated AFP)',
    position: new THREE.Vector3(0.95, 0.15, 0.65),
    category: 'malignancy',
    grossDesc:
      'ก้อนเนื้องอกขนาดใหญ่เดี่ยวๆ หรือกระจายหลายก้อน สีเหลืองอมเขียว (เนื่องจากเซลล์มะเร็งยังสามารถสร้างน้ำดีได้) มักพบเนื้อตายและเลือดออกภายในก้อน และมีแนวโน้มลุกลามเข้า Portal vein',
    microDesc:
      'เซลล์มะเร็งคล้ายเซลล์ตับแต่มีความผิดปกติรุนแรง เรียงตัวเป็นแผ่นหนา (Trabecular / Pseudoglandular pattern) ไร้ Kupffer cells และตรวจพบ Mallory-like hyaline inclusion bodies',
    clinicalNote:
      'สัมพันธ์อย่างยิ่งกับการติดเชื้อไวรัสตับอักเสบ B และ C, ภาวะตับแข็ง และสารก่อมะเร็ง Aflatoxin B1 ค่า Serum Alpha-fetoprotein (AFP) จะพุ่งสูงขึ้นอย่างมีนัยสำคัญ (>400–500 ng/mL)',
  },
  {
    id: 'pancreatitis',
    pinNumber: '5',
    nameTh: 'ตับอ่อนอักเสบเฉียบพลันและเนื้อเยื่อไขมันตาย (Acute Pancreatitis & Fat Necrosis)',
    nameEn: 'Acute Pancreatitis & Enzymatic Fat Necrosis',
    position: new THREE.Vector3(-0.7, -0.65, 0.2),
    category: 'inflammation',
    grossDesc:
      'ตับอ่อนบวม แดง ช้ำเลือด (Hemorrhagic pancreatitis) พบคราบสีขาวขุ่นคล้ายคราบสบู่ (Chalky white fat necrosis) กระจายตามเนื้อเยื่อไขมันรอบตับอ่อนและช่องท้อง',
    microDesc:
      'การกระตุ้นเอนไซม์ย่อยสลายตับอ่อนก่อนกำหนด (Autodigestion โดย Trypsin, Elastase) เกิดการตายของ Acinar cells หลอดเลือดฉีกขาด และเอนไซม์ Lipase ย่อยสลายไขมันไปจับกับ Calcium กลายเป็นเกลือสบู่ (Saponification)',
    clinicalNote:
      'ปวดท้องรุนแรงที่ลิ้นปี่ปวดทะลุไปข้างหลัง คลื่นไส้อาเจียน ระดับ Serum Amylase และ Lipase ในเลือดพุ่งสูงเกิน 3 เท่า อาการรุนแรงพบ Cullen’s sign (รอยเขียวคล้ำรอบสะดือ) และ Grey Turner’s sign (รอยช้ำที่สีข้าง)',
  },
  {
    id: 'pancreatic-head-ca',
    pinNumber: '6',
    nameTh: 'มะเร็งหัวตับอ่อนและดีซ่านอุดกั้น (Pancreatic Adenocarcinoma & Courvoisier Sign)',
    nameEn: 'Pancreatic Head Adenocarcinoma & Courvoisier’s Law',
    position: new THREE.Vector3(-0.15, -0.75, 0.45),
    category: 'malignancy',
    grossDesc:
      'ก้อนเนื้อแข็งแน่น สีเทาขาว ขอบเขตไม่ชัดเจน อยู่ที่บริเวณหัวตับอ่อน (Head of pancreas ~60-70%) กดเบียดท่อน้ำดี Common bile duct และท่อตับอ่อนหลัก',
    microDesc:
      'Adenocarcinoma สร้างโครงสร้างท่อผิดรูป (Infiltrating irregular glands) ล้อมรอบด้วย Desmoplastic stroma (พังผืดหนาแน่นมาก) และรุกรานตามเส้นประสาท (Perineural invasion)',
    clinicalNote:
      'ผู้ป่วยมาด้วยดีซ่านอุดกั้นแบบไม่ปวด (Painless progressive jaundice), ปัสสาวะสีชาเข้ม, อุจจาระสีซีด, คลำพบถุงน้ำดีโตแต่ไม่เจ็บ เรียกว่า Courvoisier’s Sign / Courvoisier’s Law',
  },
];

// Helper: Pin Canvas Texture Generator
function createHepatoPinTexture(number: string, color: string): THREE.Texture {
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

// Procedural Cirrhosis Nodular Bump Texture
function createCirrhosisTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 4 + Math.random() * 12;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.5 ? '#b8b8b8' : '#484848';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}

export const RealisticHepatobiliary3DSim: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [activeFilter, setActiveFilter] = useState<'all' | 'cirrhosis' | 'stones' | 'hcc' | 'pancreatitis' | 'normal'>('all');
  const [isCrossSection, setIsCrossSection] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [selectedPin, setSelectedPin] = useState<HepatoPin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Interactive Jaundice Simulator Slider
  const [obstructionLevel, setObstructionLevel] = useState<number>(0); // 0 to 100%

  const isAutoRotateRef = useRef<boolean>(isAutoRotate);
  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  const obstructionLevelRef = useRef<number>(obstructionLevel);
  useEffect(() => {
    obstructionLevelRef.current = obstructionLevel;
  }, [obstructionLevel]);

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
  const cirrhosisGroupRef = useRef<THREE.Group | null>(null);
  const gallstoneGroupRef = useRef<THREE.Group | null>(null);
  const hccGroupRef = useRef<THREE.Group | null>(null);
  const pancreatitisGroupRef = useRef<THREE.Group | null>(null);
  const normalLiverRef = useRef<THREE.Mesh | null>(null);
  const gallbladderRef = useRef<THREE.Mesh | null>(null);

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

  // Compute live Bilirubin & Jaundice indicators
  const baselineTotalBilirubin = 0.8; // mg/dL
  const currentTotalBili = (baselineTotalBilirubin + (obstructionLevel / 100) * 16.5).toFixed(1);
  const currentDirectBili = ((obstructionLevel / 100) * 14.8).toFixed(1);
  const currentAlp = Math.round(75 + (obstructionLevel / 100) * 450);

  let jaundiceStatus = 'NORMAL';
  let statusBadgeClass = styles.statusNormal;
  if (obstructionLevel > 15 && obstructionLevel <= 50) {
    jaundiceStatus = 'MILD CHOLESTASIS';
    statusBadgeClass = styles.statusWarning;
  } else if (obstructionLevel > 50) {
    jaundiceStatus = '🚨 SEVERE OBSTRUCTIVE JAUNDICE';
    statusBadgeClass = styles.statusCritical;
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
    controls.maxDistance = 8.0;

    // 5. Studio 3-Point Depth Lighting with Dual Rim Lights
    const rig = setupStudioLighting(scene);
    lightingRigRef.current = rig;
    setStudioLightingMode(rig, 'cinematic');

    // 6. Ground Contact Shadow & Spatial Perspective Floor Grid
    const shadowDisc = createContactShadowPlane(4.4, -2.25, 0.85);
    scene.add(shadowDisc);

    const grid = createPerspectiveGrid(9.5, 24, -2.26, 0x10b981, 0x1e293b);
    scene.add(grid);

    // -------------------------------------------------------------
    // 7. Procedural Organ Anatomy Construction (img2threejs)
    // -------------------------------------------------------------
    const anatomyRoot = new THREE.Group();
    scene.add(anatomyRoot);
    anatomyGroupRef.current = anatomyRoot;

    // 7.1 Liver - Right Lobe (Large wedge with smooth anatomical contour)
    const liverMat = new THREE.MeshStandardMaterial({
      color: 0x8a2c22, // Rich reddish-brown hepatic parenchyma
      roughness: 0.35,
      metalness: 0.1,
      clippingPlanes: [],
      clipShadows: true,
    });

    const rightLobeGeo = new THREE.SphereGeometry(1.4, 48, 48);
    rightLobeGeo.scale(1.3, 0.95, 0.85);
    const rightLobe = new THREE.Mesh(rightLobeGeo, liverMat);
    rightLobe.position.set(0.65, 0.25, 0);
    rightLobe.rotation.z = -0.15;
    anatomyRoot.add(rightLobe);
    normalLiverRef.current = rightLobe;

    // 7.2 Liver - Left Lobe (Smaller, tapered triangular lobe)
    const leftLobeGeo = new THREE.SphereGeometry(1.05, 36, 36);
    leftLobeGeo.scale(1.1, 0.65, 0.7);
    const leftLobe = new THREE.Mesh(leftLobeGeo, liverMat);
    leftLobe.position.set(-0.95, 0.1, 0.05);
    leftLobe.rotation.z = 0.25;
    anatomyRoot.add(leftLobe);

    // Falciform Ligament boundary sheet
    const ligamentMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const ligamentGeo = new THREE.PlaneGeometry(0.3, 1.6);
    const falciformLigament = new THREE.Mesh(ligamentGeo, ligamentMat);
    falciformLigament.position.set(-0.15, 0.25, 0.55);
    falciformLigament.rotation.y = Math.PI * 0.45;
    anatomyRoot.add(falciformLigament);

    // 7.3 Gallbladder (Pear-shaped, emerald green)
    const gbMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Deep bile green
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x166534,
      emissiveIntensity: 0.3,
    });
    const gbGeo = new THREE.SphereGeometry(0.42, 24, 24);
    gbGeo.scale(0.8, 1.5, 0.8);
    const gallbladder = new THREE.Mesh(gbGeo, gbMat);
    gallbladder.position.set(0.45, -0.65, 0.55);
    gallbladder.rotation.x = 0.35;
    gallbladder.rotation.z = -0.2;
    anatomyRoot.add(gallbladder);
    gallbladderRef.current = gallbladder;

    // Biliary Tree (Cystic duct, Common hepatic duct, Common bile duct)
    const ductMat = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      roughness: 0.3,
    });
    const cysticDuctGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 16);
    const cysticDuct = new THREE.Mesh(cysticDuctGeo, ductMat);
    cysticDuct.position.set(0.25, -0.4, 0.45);
    cysticDuct.rotation.z = Math.PI * 0.35;
    anatomyRoot.add(cysticDuct);

    const cbdGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.1, 16);
    const cbd = new THREE.Mesh(cbdGeo, ductMat);
    cbd.position.set(0.0, -0.75, 0.35);
    anatomyRoot.add(cbd);

    // 7.4 Pancreas (Glandular head, body, tail)
    const pancreasMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // Lobulated yellowish-tan
      roughness: 0.6,
      metalness: 0.05,
    });

    // Head of pancreas
    const pHeadGeo = new THREE.SphereGeometry(0.48, 24, 24);
    pHeadGeo.scale(1.1, 1.25, 0.85);
    const pHead = new THREE.Mesh(pHeadGeo, pancreasMat);
    pHead.position.set(-0.15, -0.75, 0.25);
    anatomyRoot.add(pHead);

    // Body and Tail of pancreas extending to the left
    const pBodyGeo = new THREE.CylinderGeometry(0.24, 0.15, 1.5, 24);
    const pBody = new THREE.Mesh(pBodyGeo, pancreasMat);
    pBody.position.set(-0.9, -0.7, 0.15);
    pBody.rotation.z = Math.PI * 0.45;
    anatomyRoot.add(pBody);

    // 7.5 Portal Triad Vessels (Portal Vein & Hepatic Artery)
    const portalVeinMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 }); // Dark venous blue
    const pvGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.9, 16);
    const portalVein = new THREE.Mesh(pvGeo, portalVeinMat);
    portalVein.position.set(0.12, -0.45, 0.22);
    anatomyRoot.add(portalVein);

    const hepaticArteryMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }); // Arterial red
    const haGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.85, 16);
    const hepaticArtery = new THREE.Mesh(haGeo, hepaticArteryMat);
    hepaticArtery.position.set(-0.05, -0.42, 0.28);
    anatomyRoot.add(hepaticArtery);

    // -------------------------------------------------------------
    // 8. Toggleable Pathology Overlays
    // -------------------------------------------------------------

    // 8.1 Cirrhosis Group (Micronodular bumpy scarred liver)
    const cirrhosisGroup = new THREE.Group();
    const cirrhosisBump = createCirrhosisTexture();
    const cirrhosisMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412, // Shrunken yellowish-brown scarred liver
      roughness: 0.8,
      bumpMap: cirrhosisBump,
      bumpScale: 0.12,
    });
    const cirrhosisRightLobe = new THREE.Mesh(rightLobeGeo.clone(), cirrhosisMat);
    cirrhosisRightLobe.scale.set(1.15, 0.85, 0.8); // Shrunken micro size
    cirrhosisRightLobe.position.set(0.65, 0.25, 0);
    cirrhosisRightLobe.rotation.z = -0.15;
    cirrhosisGroup.add(cirrhosisRightLobe);

    const cirrhosisLeftLobe = new THREE.Mesh(leftLobeGeo.clone(), cirrhosisMat);
    cirrhosisLeftLobe.scale.set(0.95, 0.6, 0.65);
    cirrhosisLeftLobe.position.set(-0.95, 0.1, 0.05);
    cirrhosisLeftLobe.rotation.z = 0.25;
    cirrhosisGroup.add(cirrhosisLeftLobe);

    anatomyRoot.add(cirrhosisGroup);
    cirrhosisGroupRef.current = cirrhosisGroup;

    // 8.2 Gallstones (Cholelithiasis) Group
    const gallstoneGroup = new THREE.Group();
    for (let s = 0; s < 5; s++) {
      const stoneGeo = new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.04);
      const stoneMat = new THREE.MeshStandardMaterial({
        color: 0xfde047, // Yellow faceted cholesterol stones
        roughness: 0.4,
      });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(
        0.42 + (Math.random() - 0.5) * 0.2,
        -0.65 + (Math.random() - 0.5) * 0.3,
        0.65 + (Math.random() - 0.5) * 0.15
      );
      gallstoneGroup.add(stone);
    }
    anatomyRoot.add(gallstoneGroup);
    gallstoneGroupRef.current = gallstoneGroup;

    // 8.3 HCC (Hepatocellular Carcinoma) Group
    const hccGroup = new THREE.Group();
    const hccGeo = new THREE.SphereGeometry(0.55, 32, 32);
    hccGeo.scale(1.2, 1.0, 0.9);
    const hccMat = new THREE.MeshStandardMaterial({
      color: 0x65a30d, // Greenish bile-stained tumor mass
      roughness: 0.6,
      metalness: 0.1,
      emissive: 0x4d7c0f,
      emissiveIntensity: 0.35,
    });
    const hccMesh = new THREE.Mesh(hccGeo, hccMat);
    hccMesh.position.set(0.95, 0.2, 0.55);
    hccGroup.add(hccMesh);

    // Surrounding hypervascular halo
    const hccHaloGeo = new THREE.RingGeometry(0.62, 0.72, 32);
    const hccHaloMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const hccHalo = new THREE.Mesh(hccHaloGeo, hccHaloMat);
    hccHalo.position.set(0.95, 0.2, 0.72);
    hccGroup.add(hccHalo);

    anatomyRoot.add(hccGroup);
    hccGroupRef.current = hccGroup;

    // 8.4 Acute Pancreatitis Fat Necrosis Group
    const pancreatitisGroup = new THREE.Group();
    for (let n = 0; n < 12; n++) {
      const speckGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const speckMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc, // Chalky white saponification specks
        roughness: 0.9,
      });
      const speck = new THREE.Mesh(speckGeo, speckMat);
      speck.position.set(
        -0.2 + (Math.random() - 0.5) * 0.7,
        -0.75 + (Math.random() - 0.5) * 0.4,
        0.35 + (Math.random() - 0.5) * 0.15
      );
      pancreatitisGroup.add(speck);
    }
    anatomyRoot.add(pancreatitisGroup);
    pancreatitisGroupRef.current = pancreatitisGroup;

    // -------------------------------------------------------------
    // 9. Interactive 3D Landmark Pins
    // -------------------------------------------------------------
    pinSpritesRef.current = [];
    HEPATO_PINS.forEach((pin) => {
      const pinColor =
        pin.category === 'malignancy'
          ? '#ef4444'
          : pin.category === 'stone'
          ? '#f59e0b'
          : pin.category === 'inflammation'
          ? '#e11d48'
          : '#10b981';
      const texture = createHepatoPinTexture(pin.pinNumber, pinColor);
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
        const matched = HEPATO_PINS.find((p) => p.id === pinId);
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

      if (isAutoRotateRef.current) {
        anatomyRoot.rotation.y += 0.0035;
      }

      // Gallbladder dilation in high obstruction
      if (gallbladderRef.current) {
        const gbDilation = 1 + (obstructionLevelRef.current / 100) * 0.45;
        gallbladderRef.current.scale.set(0.8 * gbDilation, 1.5 * gbDilation, 0.8 * gbDilation);
      }

      // HCC glow pulse
      if (hccGroupRef.current) {
        const pulse = 1 + Math.sin(elapsed * 4) * 0.05;
        hccGroupRef.current.scale.set(pulse, pulse, pulse);
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

  // Dynamic Cross-Section toggle without remounting WebGL scene
  useEffect(() => {
    if (!anatomyGroupRef.current) return;
    anatomyGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material;
        if (mat instanceof THREE.Material) {
          mat.clippingPlanes = isCrossSection ? [clipPlaneRef.current] : [];
          mat.needsUpdate = true;
        } else if (Array.isArray(mat)) {
          mat.forEach((m) => {
            m.clippingPlanes = isCrossSection ? [clipPlaneRef.current] : [];
            m.needsUpdate = true;
          });
        }
      }
    });
  }, [isCrossSection]);

  // Handle Pathology Filter Visibility
  useEffect(() => {
    if (
      !cirrhosisGroupRef.current ||
      !gallstoneGroupRef.current ||
      !hccGroupRef.current ||
      !pancreatitisGroupRef.current ||
      !normalLiverRef.current
    )
      return;

    switch (activeFilter) {
      case 'cirrhosis':
        cirrhosisGroupRef.current.visible = true;
        normalLiverRef.current.visible = false;
        gallstoneGroupRef.current.visible = false;
        hccGroupRef.current.visible = false;
        pancreatitisGroupRef.current.visible = false;
        break;
      case 'stones':
        cirrhosisGroupRef.current.visible = false;
        normalLiverRef.current.visible = true;
        gallstoneGroupRef.current.visible = true;
        hccGroupRef.current.visible = false;
        pancreatitisGroupRef.current.visible = false;
        break;
      case 'hcc':
        cirrhosisGroupRef.current.visible = false;
        normalLiverRef.current.visible = true;
        gallstoneGroupRef.current.visible = false;
        hccGroupRef.current.visible = true;
        pancreatitisGroupRef.current.visible = false;
        break;
      case 'pancreatitis':
        cirrhosisGroupRef.current.visible = false;
        normalLiverRef.current.visible = true;
        gallstoneGroupRef.current.visible = false;
        hccGroupRef.current.visible = false;
        pancreatitisGroupRef.current.visible = true;
        break;
      case 'normal':
        cirrhosisGroupRef.current.visible = false;
        normalLiverRef.current.visible = true;
        gallstoneGroupRef.current.visible = false;
        hccGroupRef.current.visible = false;
        pancreatitisGroupRef.current.visible = false;
        break;
      case 'all':
      default:
        cirrhosisGroupRef.current.visible = false; // keep subtle
        normalLiverRef.current.visible = true;
        gallstoneGroupRef.current.visible = true;
        hccGroupRef.current.visible = true;
        pancreatitisGroupRef.current.visible = true;
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
          <Flame size={18} color="#10b981" />
          <div>
            <h3>3D Hepatobiliary Workstation</h3>
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
            title="ผ่าตัดขวางเพื่อตรวจดูท่อน้ำดีและเนื้อตับชั้นลึก (Coronal Cutaway)"
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
          className={`${styles.filterBtn} ${activeFilter === 'stones' ? styles.active : ''}`}
          onClick={() => setActiveFilter('stones')}
        >
          1. นิ่วถุงน้ำดี (Cholelithiasis)
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'cirrhosis' ? styles.active : ''}`}
          onClick={() => setActiveFilter('cirrhosis')}
        >
          2. ตับแข็ง (Cirrhosis)
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'hcc' ? styles.active : ''}`}
          onClick={() => setActiveFilter('hcc')}
        >
          3. มะเร็งตับ (HCC)
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'pancreatitis' ? styles.active : ''}`}
          onClick={() => setActiveFilter('pancreatitis')}
        >
          4. ตับอ่อนอักเสบ (Pancreatitis)
        </button>
      </div>

      {/* Jaundice & Bilirubin Telemetry HUD */}
      <div className={styles.hudPanel}>
        <div className={styles.hudHeader}>
          <h4>
            <Activity size={14} /> Biliary Obstruction & Jaundice HUD
          </h4>
          <span className={`${styles.hudStatusBadge} ${statusBadgeClass}`}>{jaundiceStatus}</span>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Total Bilirubin</span>
            <span className={styles.metricValue}>{currentTotalBili} mg/dL</span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Direct (Conjugated)</span>
            <span className={styles.metricValue} style={{ color: '#34d399' }}>
              {currentDirectBili} mg/dL
            </span>
          </div>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>ALP (Alkaline Phos)</span>
            <span className={styles.metricValue}>{currentAlp} U/L</span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Urine / Stool Color</span>
            <span
              className={styles.metricValue}
              style={{
                fontSize: '0.8rem',
                color: obstructionLevel > 40 ? '#f87171' : '#4ade80',
              }}
            >
              {obstructionLevel > 40 ? 'Dark Tea / Clay' : 'Normal / Brown'}
            </span>
          </div>
        </div>

        {/* Obstruction Slider */}
        <div className={styles.sliderRow}>
          <label>
            <Sliders size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Biliary Blockage:
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={obstructionLevel}
            onChange={(e) => setObstructionLevel(Number(e.target.value))}
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
              selectedPin.category === 'malignancy'
                ? styles.emergency
                : selectedPin.category === 'inflammation'
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

export default RealisticHepatobiliary3DSim;
