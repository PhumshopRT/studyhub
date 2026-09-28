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
  Sparkles,
  Layers,
  Microscope,
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
import styles from './RealisticPathology3DSim.module.css';

interface PathologyLandmark {
  id: string;
  pinNumber: string;
  nameTh: string;
  nameEn: string;
  position: THREE.Vector3;
  category: 'benign' | 'emergency' | 'infection' | 'dysplasia';
  grossDesc: string;
  microDesc: string;
  clinicalNote: string;
}

const PATHOLOGY_PINS: PathologyLandmark[] = [
  {
    id: 'leiomyoma',
    pinNumber: '1',
    nameTh: 'เนื้องอกกล้ามเนื้อมดลูก (Leiomyoma / Fibroid)',
    nameEn: 'Uterine Leiomyoma (Intramural / Submucosal)',
    position: new THREE.Vector3(0.55, 0.45, 0.65),
    category: 'benign',
    grossDesc: 'ก้อนกลมแน่น ผิวเรียบ ขอบเขตชัดเจน หน้าตัดสีขาวอมชมพู ลายเส้นใยกล้ามเนื้อวนคล้ายก้นหอย (Whorled appearance)',
    microDesc: 'เซลล์กล้ามเนื้อเรียบรูปกระสวย (Spindle-shaped cells) เรียงตัวเป็นมัดขนาน (Fascicular growth) นิวเคลียสปลายมนคล้ายซิการ์ ไร้ cellular atypia',
    clinicalNote: 'พบได้บ่อยมากในหญิงวัยเจริญพันธุ์ ทำให้ประจำเดือนมามาก (Menorrhagia), ซีด, และกดเบียดกระเพาะปัสสาวะ',
  },
  {
    id: 'endometriosis',
    pinNumber: '2',
    nameTh: 'ช็อกโกแลตซีสต์ที่รังไข่ (Endometrioma)',
    nameEn: 'Ovarian Endometriosis (Chocolate Cyst)',
    position: new THREE.Vector3(-2.1, 0.2, 0.15),
    category: 'benign',
    grossDesc: 'ถุงน้ำรังไข่สีน้ำตาลไหม้ ผนังหนา มีพังผืดดึงรั้ง ภายในบรรจุเลือดเก่าตกค้างสีข้นคล้ายช็อกโกแลตเหลว',
    microDesc: 'พบ Endometrial glands + Endometrial stroma พร้อม Hemosiderin-laden macrophages (Siderophages) แทรกในผนังถุงน้ำ',
    clinicalNote: 'ผู้ป่วยมีอาการปวดประจำเดือนรุนแรง (Severe dysmenorrhea), ปวดลึกขณะมีเพศสัมพันธ์ (Dyspareunia) และมีบุตรยาก',
  },
  {
    id: 'ectopic',
    pinNumber: '3',
    nameTh: 'การตั้งครรภ์นอกมดลูกที่ท่อนำไข่ (Ectopic Pregnancy)',
    nameEn: 'Tubal Ectopic Pregnancy (Ampullary Segment)',
    position: new THREE.Vector3(1.95, 0.95, 0.1),
    category: 'emergency',
    grossDesc: 'ท่อนำไข่บริเวณ Ampulla บวมพองคล้ายไส้กรอก มีสีม่วงคล้ำจากเลือดคั่ง และเสี่ยงต่อการแตกฉีกขาด (Rupture)',
    microDesc: 'พบ Chorionic villi, Trophoblastic tissue และ Decidual cells ฝังตัวในผนังท่อนำไข่ซึ่งไม่มีเยื่อบุรองรับการฝังตัว',
    clinicalNote: '🚨 ภาวะฉุกเฉินทางนรีเวชวิกฤต! หากท่อแตกจะเกิด Hemoperitoneum เสียเลือดจนช็อก ต้องผ่าตัดทันที',
  },
  {
    id: 'dermoid',
    pinNumber: '4',
    nameTh: 'เดอร์มอยด์ซีสต์รังไข่ (Mature Teratoma)',
    nameEn: 'Mature Cystic Teratoma (Dermoid Cyst)',
    position: new THREE.Vector3(2.2, 0.1, -0.1),
    category: 'benign',
    grossDesc: 'ถุงซีสต์ผนังหนา ผิวมัน ภายในบรรจุไขมันเหลวข้น ก้อนเส้นผม ฟัน หรือเศษกระดูกอ่อน',
    microDesc: 'เนื้อเยื่อเจริญเต็มที่จาก Germ layers ทั้ง 3 ชั้น: Ectoderm (ผิวหนัง ขน ฟัน), Mesoderm (ไขมัน กระดูก), Endoderm (เยื่อเมือกหลอดลม)',
    clinicalNote: 'มักไม่แสดงอาการ คลำพบโดยบังเอิญ มีความเสี่ยงต่อการเกิด Ovarian torsion (การบิดขั้วรังไข่) สูง',
  },
  {
    id: 'cervical-cin',
    pinNumber: '5',
    nameTh: 'รอยโรคเยื่อบุปากมดลูก (Cervical Dysplasia / CIN)',
    nameEn: 'Cervical Transformation Zone Dysplasia',
    position: new THREE.Vector3(0, -1.2, 0.35),
    category: 'dysplasia',
    grossDesc: 'บริเวณ Squamocolumnar Junction (Transformation Zone) ผิวเยื่อบุเป็นฝ้าขาวเมื่อป้ายด้วยกรดอะซิติก (Acetowhite)',
    microDesc: 'เซลล์เยื่อบุผิดปกติ นิวเคลียสขยายโต อัตราส่วน N/C สูง พบ Koilocytes (เซลล์ที่มี Halo ล้อมรอบนิวเคลียส) จากการติดเชื้อ HPV 16/18',
    clinicalNote: 'ตรวจคัดกรองได้ด้วย Pap smear / Liquid-based cytology ป้องกันการลุกลามเป็น Cervical Squamous Cell Carcinoma',
  },
];

export const RealisticPathology3DSim: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation states
  const [activeFilter, setActiveFilter] = useState<'all' | 'leiomyoma' | 'endometriosis' | 'ectopic' | 'normal'>('all');
  const [isCrossSection, setIsCrossSection] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [selectedPin, setSelectedPin] = useState<PathologyLandmark | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync isAutoRotate with ref so render loop doesn't re-mount WebGL scene
  const isAutoRotateRef = useRef<boolean>(isAutoRotate);
  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  // Advanced Visual Depth & Workstation States (JEV System One)
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>('clinical');
  const [activeView, setActiveView] = useState<AnatomicalView>('isometric');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const lightingRigRef = useRef<StudioLightingRig | null>(null);
  const anatomyRootRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Meshes references for interactive toggling
  const leiomyomaGroupRef = useRef<THREE.Group | null>(null);
  const endometriomaGroupRef = useRef<THREE.Group | null>(null);
  const ectopicGroupRef = useRef<THREE.Group | null>(null);
  const dermoidGroupRef = useRef<THREE.Group | null>(null);
  const cinMarkerRef = useRef<THREE.Mesh | null>(null);
  const normalMeshesRef = useRef<THREE.Mesh[]>([]);
  const pinSpritesRef = useRef<THREE.Sprite[]>([]);

  // Create text pin texture for 3D sprite
  const createPinTexture = (text: string, color: string): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Glow circle
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.fill();

      // Border
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 66);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null; // transparent to allow radial CSS gradient

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 6.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 12;
    controls.minDistance = 2.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.15; // prevent going below floor
    controlsRef.current = controls;

    // 5. Studio Lighting Rig (JEV System One Standard)
    const lightingRig = setupStudioLighting(scene);
    lightingRigRef.current = lightingRig;
    setStudioLightingMode(lightingRig, 'clinical');

    // 6. Contact Shadow Plane & Spatial Perspective Grid Floor
    const shadowPlane = createContactShadowPlane(4.4, -2.18, 0.85);
    scene.add(shadowPlane);

    const grid = createPerspectiveGrid(9.5, 24, -2.19, 0xe11d48, 0x2f152b);
    scene.add(grid);

    // -------------------------------------------------------------
    // 7. Procedural Anatomy Construction (img2threejs methodology)
    // -------------------------------------------------------------
    const anatomyRoot = new THREE.Group();
    anatomyRootRef.current = anatomyRoot;
    scene.add(anatomyRoot);

    // Common organic uterine materials
    const myometriumMaterial = new THREE.MeshStandardMaterial({
      color: 0xd95368,
      roughness: 0.35,
      metalness: 0.1,
      bumpScale: 0.05,
    });

    const endometriumMaterial = new THREE.MeshStandardMaterial({
      color: 0x9f1239,
      roughness: 0.6,
      metalness: 0.05,
    });

    const cervixMaterial = new THREE.MeshStandardMaterial({
      color: 0xdb2777,
      roughness: 0.4,
      metalness: 0.05,
    });

    const ovaryMaterial = new THREE.MeshStandardMaterial({
      color: 0xfecdd3,
      roughness: 0.5,
      metalness: 0.05,
    });

    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.3,
      metalness: 0.1,
    });

    // 7.1 Uterine Body (Corpus & Fundus)
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0.28, -1.2)); // internal os
    points.push(new THREE.Vector2(0.42, -0.6)); // lower isthmus
    points.push(new THREE.Vector2(0.85, 0.1));  // mid corpus
    points.push(new THREE.Vector2(1.15, 0.75)); // upper corpus / cornua
    points.push(new THREE.Vector2(0.9, 1.25));  // fundus curve
    points.push(new THREE.Vector2(0.0, 1.35));  // fundus dome top

    const uterusGeometry = new THREE.LatheGeometry(points, 48);
    uterusGeometry.scale(1.0, 1.0, 0.75); // anteroposterior flattening
    const uterusMesh = new THREE.Mesh(uterusGeometry, myometriumMaterial);
    anatomyRoot.add(uterusMesh);
    normalMeshesRef.current.push(uterusMesh);

    // Inner endometrial cavity lining
    const innerCavityGeo = new THREE.ConeGeometry(0.5, 1.3, 24);
    innerCavityGeo.scale(1.0, 1.0, 0.35);
    const innerCavityMesh = new THREE.Mesh(innerCavityGeo, endometriumMaterial);
    innerCavityMesh.position.set(0, 0.35, 0);
    innerCavityMesh.rotation.z = Math.PI;
    uterusMesh.add(innerCavityMesh);

    // 7.2 Cervix
    const cervixGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.7, 32);
    const cervixMesh = new THREE.Mesh(cervixGeo, cervixMaterial);
    cervixMesh.position.y = -1.55;
    anatomyRoot.add(cervixMesh);

    // Cervical transformation zone ring
    const cinRingGeo = new THREE.TorusGeometry(0.34, 0.04, 16, 32);
    const cinRingMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0x9f1239,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const cinRing = new THREE.Mesh(cinRingGeo, cinRingMat);
    cinRing.position.set(0, -1.55, 0);
    cinRing.rotation.x = Math.PI / 2;
    anatomyRoot.add(cinRing);
    cinMarkerRef.current = cinRing;

    // 7.3 Fallopian Tubes (Left & Right curves using CatmullRomCurve3)
    // Right tube
    const rightTubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.95, 0.85, 0),
      new THREE.Vector3(1.5, 1.15, 0.1),
      new THREE.Vector3(2.1, 0.95, 0.05),
      new THREE.Vector3(2.35, 0.45, -0.05),
    ]);
    const rightTubeGeo = new THREE.TubeGeometry(rightTubeCurve, 40, 0.09, 16, false);
    const rightTubeMesh = new THREE.Mesh(rightTubeGeo, tubeMaterial);
    anatomyRoot.add(rightTubeMesh);

    // Left tube
    const leftTubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.95, 0.85, 0),
      new THREE.Vector3(-1.5, 1.15, 0.1),
      new THREE.Vector3(-2.1, 0.95, 0.05),
      new THREE.Vector3(-2.35, 0.45, -0.05),
    ]);
    const leftTubeGeo = new THREE.TubeGeometry(leftTubeCurve, 40, 0.09, 16, false);
    const leftTubeMesh = new THREE.Mesh(leftTubeGeo, tubeMaterial);
    anatomyRoot.add(leftTubeMesh);

    // 7.4 Fimbriae Petals (Infundibulum ends)
    const createFimbriae = (pos: THREE.Vector3, isLeft: boolean) => {
      const fimbriaGroup = new THREE.Group();
      fimbriaGroup.position.copy(pos);
      const petalGeo = new THREE.ConeGeometry(0.06, 0.25, 8);
      petalGeo.rotateX(Math.PI / 2);
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeo, tubeMaterial);
        petal.position.set(Math.cos(angle) * 0.12, Math.sin(angle) * 0.12, 0);
        petal.rotation.z = angle + (isLeft ? Math.PI : 0);
        fimbriaGroup.add(petal);
      }
      return fimbriaGroup;
    };
    anatomyRoot.add(createFimbriae(new THREE.Vector3(2.35, 0.45, -0.05), false));
    anatomyRoot.add(createFimbriae(new THREE.Vector3(-2.35, 0.45, -0.05), true));

    // 7.5 Bilateral Ovaries (Almond shape)
    const ovaryGeo = new THREE.SphereGeometry(0.38, 24, 24);
    ovaryGeo.scale(1.2, 0.8, 0.7);

    // Right Ovary
    const rightOvary = new THREE.Mesh(ovaryGeo, ovaryMaterial);
    rightOvary.position.set(2.0, 0.1, -0.1);
    rightOvary.rotation.z = -0.3;
    anatomyRoot.add(rightOvary);

    // Left Ovary (Base for Endometrioma)
    const leftOvary = new THREE.Mesh(ovaryGeo.clone(), ovaryMaterial);
    leftOvary.position.set(-2.0, 0.1, -0.1);
    leftOvary.rotation.z = 0.3;
    anatomyRoot.add(leftOvary);

    // Broad Ligament (Translucent sheets)
    const ligamentMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      roughness: 0.6,
    });
    const rightLigamentGeo = new THREE.PlaneGeometry(1.4, 1.2);
    const rightLigament = new THREE.Mesh(rightLigamentGeo, ligamentMat);
    rightLigament.position.set(1.4, 0.1, -0.05);
    rightLigament.rotation.y = 0.15;
    anatomyRoot.add(rightLigament);

    const leftLigamentGeo = new THREE.PlaneGeometry(1.4, 1.2);
    const leftLigament = new THREE.Mesh(leftLigamentGeo, ligamentMat);
    leftLigament.position.set(-1.4, 0.1, -0.05);
    leftLigament.rotation.y = -0.15;
    anatomyRoot.add(leftLigament);

    // -------------------------------------------------------------
    // 8. Pathological Lesions Construction (Toggleable Groups)
    // -------------------------------------------------------------

    // 8.1 Leiomyoma (Uterine Fibroid) Group
    const leiomyomaGroup = new THREE.Group();
    const fibroidGeo = new THREE.SphereGeometry(0.48, 32, 32);
    fibroidGeo.scale(1.1, 0.9, 0.9);
    const fibroidMat = new THREE.MeshStandardMaterial({
      color: 0xfce7f3, // pearly pink-white whorled look
      roughness: 0.45,
      metalness: 0.1,
      bumpScale: 0.08,
    });
    const fibroidMesh = new THREE.Mesh(fibroidGeo, fibroidMat);
    fibroidMesh.position.set(0.55, 0.45, 0.45);
    leiomyomaGroup.add(fibroidMesh);

    // Surface whorled capsular rings
    for (let r = 0; r < 4; r++) {
      const ringGeo = new THREE.TorusGeometry(0.35 - r * 0.07, 0.02, 12, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, wireframe: true });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0.55, 0.45, 0.58 + r * 0.01);
      leiomyomaGroup.add(ring);
    }
    anatomyRoot.add(leiomyomaGroup);
    leiomyomaGroupRef.current = leiomyomaGroup;

    // 8.2 Endometrioma (Chocolate Cyst of Left Ovary)
    const endometriomaGroup = new THREE.Group();
    const cystGeo = new THREE.SphereGeometry(0.52, 32, 32);
    const cystMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // chocolate dark-brown
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x78350f,
      emissiveIntensity: 0.3,
    });
    const cystMesh = new THREE.Mesh(cystGeo, cystMat);
    cystMesh.position.set(-2.1, 0.18, 0.12);
    endometriomaGroup.add(cystMesh);

    // Punctate hemosiderin hemorrhage spots
    for (let p = 0; p < 12; p++) {
      const spotGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const spotMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
      const spot = new THREE.Mesh(spotGeo, spotMat);
      const angle = (p / 12) * Math.PI * 2;
      spot.position.set(
        -2.1 + Math.cos(angle) * 0.48,
        0.18 + Math.sin(angle) * 0.45,
        0.12 + (p % 2 === 0 ? 0.2 : -0.2)
      );
      endometriomaGroup.add(spot);
    }
    anatomyRoot.add(endometriomaGroup);
    endometriomaGroupRef.current = endometriomaGroup;

    // 8.3 Ectopic Tubal Pregnancy (Right Ampulla)
    const ectopicGroup = new THREE.Group();
    const ectopicBulgeGeo = new THREE.SphereGeometry(0.38, 24, 24);
    ectopicBulgeGeo.scale(1.4, 0.9, 0.9);
    const ectopicMat = new THREE.MeshStandardMaterial({
      color: 0x9f1239, // violaceous hematoma
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0xbe123c,
      emissiveIntensity: 0.4,
    });
    const ectopicMesh = new THREE.Mesh(ectopicBulgeGeo, ectopicMat);
    ectopicMesh.position.set(1.95, 0.95, 0.08);
    ectopicMesh.rotation.z = -0.3;
    ectopicGroup.add(ectopicMesh);

    // Warning rupture halo
    const haloGeo = new THREE.RingGeometry(0.42, 0.48, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(1.95, 0.95, 0.2);
    ectopicGroup.add(halo);
    anatomyRoot.add(ectopicGroup);
    ectopicGroupRef.current = ectopicGroup;

    // 8.4 Dermoid Cyst (Teratoma) on Right Ovary
    const dermoidGroup = new THREE.Group();
    const dermoidGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const dermoidMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // pale sebaceous/fatty yellow
      roughness: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const dermoidMesh = new THREE.Mesh(dermoidGeo, dermoidMat);
    dermoidMesh.position.set(2.2, 0.1, -0.05);
    dermoidGroup.add(dermoidMesh);
    anatomyRoot.add(dermoidGroup);
    dermoidGroupRef.current = dermoidGroup;

    // -------------------------------------------------------------
    // 9. Interactive 3D Landmark Pins
    // -------------------------------------------------------------
    PATHOLOGY_PINS.forEach((p) => {
      const pinColor = p.category === 'emergency' ? '#ef4444' : p.category === 'dysplasia' ? '#f59e0b' : '#059669';
      const texture = createPinTexture(p.pinNumber, pinColor);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(p.position);
      sprite.scale.set(0.38, 0.38, 1);
      (sprite as any).userData = { pinId: p.id };
      scene.add(sprite);
      pinSpritesRef.current.push(sprite);
    });

    // -------------------------------------------------------------
    // 10. Raycasting for Pin Clicking
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
        const matched = PATHOLOGY_PINS.find((pin) => pin.id === pinId);
        if (matched) {
          setSelectedPin(matched);
        }
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);

    // -------------------------------------------------------------
    // 11. Render Animation Loop
    // -------------------------------------------------------------
    let clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Auto rotation when enabled
      if (isAutoRotateRef.current) {
        anatomyRoot.rotation.y += 0.004;
      }

      // Gentle floating animation for ectopic warning halo
      if (ectopicGroupRef.current) {
        const pulse = 1 + Math.sin(elapsed * 4) * 0.08;
        ectopicGroupRef.current.scale.set(pulse, pulse, pulse);
      }

      // Smooth camera transition when a pin is selected
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

    // Cleanup
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Handle Pathology Filter Changes
  useEffect(() => {
    if (!leiomyomaGroupRef.current || !endometriomaGroupRef.current || !ectopicGroupRef.current || !dermoidGroupRef.current)
      return;

    switch (activeFilter) {
      case 'leiomyoma':
        leiomyomaGroupRef.current.visible = true;
        endometriomaGroupRef.current.visible = false;
        ectopicGroupRef.current.visible = false;
        dermoidGroupRef.current.visible = false;
        break;
      case 'endometriosis':
        leiomyomaGroupRef.current.visible = false;
        endometriomaGroupRef.current.visible = true;
        ectopicGroupRef.current.visible = false;
        dermoidGroupRef.current.visible = false;
        break;
      case 'ectopic':
        leiomyomaGroupRef.current.visible = false;
        endometriomaGroupRef.current.visible = false;
        ectopicGroupRef.current.visible = true;
        dermoidGroupRef.current.visible = false;
        break;
      case 'normal':
        leiomyomaGroupRef.current.visible = false;
        endometriomaGroupRef.current.visible = false;
        ectopicGroupRef.current.visible = false;
        dermoidGroupRef.current.visible = false;
        break;
      case 'all':
      default:
        leiomyomaGroupRef.current.visible = true;
        endometriomaGroupRef.current.visible = true;
        ectopicGroupRef.current.visible = true;
        dermoidGroupRef.current.visible = true;
        break;
    }
  }, [activeFilter]);

  // View and Camera Transitions
  const handleViewChange = (view: AnatomicalView) => {
    setActiveView(view);
    if (cameraRef.current && controlsRef.current) {
      const targetPos = getAnatomicalCoordinates(view, 6.2, 0.4);
      smoothTransitionCamera(cameraRef.current, controlsRef.current, targetPos, new THREE.Vector3(0, 0, 0));
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
      if (anatomyRootRef.current) {
        toggleSceneWireframe(anatomyRootRef.current, next);
      }
      return next;
    });
  };

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    setActiveView('isometric');
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 0.8, 6.2);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    setSelectedPin(null);
  }, []);

  // Fullscreen Toggle (Supports iPad Safari, Android, and Desktop)
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
      className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''} ${isTheater ? styles.theater : ''}`}
    >
      <canvas ref={canvasRef} className={styles.canvasWrapper} />
      <div className={styles.reticle} />

      {/* Top Bar Header */}
      <div className={styles.topBar}>
        <div className={styles.badgeGroup}>
          <div className={styles.titleBadge}>
            <span className={styles.liveLed} />
            <Microscope size={16} />
            <span>3D Female Reproductive Pathology Studio</span>
          </div>
          <div className={styles.engineTag}>img2threejs Procedural</div>
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

        <div className={styles.topRightActions}>
          <button
            type="button"
            className={`${styles.iconBtn} ${lightingMode === 'cinematic' ? styles.active : ''}`}
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
            {lightingMode === 'clinical' && <Sun size={16} />}
            {lightingMode === 'cinematic' && <Sparkles size={16} />}
            {lightingMode === 'radiology' && <Moon size={16} />}
          </button>

          <button
            type="button"
            className={`${styles.iconBtn} ${isWireframe ? styles.active : ''}`}
            onClick={handleToggleWireframe}
            title="ตรวจดูโครงสร้างตาข่ายเรขาคณิต (Polygon Mesh Wireframe)"
          >
            <Grid size={16} />
          </button>

          <button
            type="button"
            className={`${styles.iconBtn} ${isAutoRotate ? styles.active : ''}`}
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            title={isAutoRotate ? 'หยุดหมุนอัตโนมัติ' : 'หมุนอัตโนมัติ'}
          >
            {isAutoRotate ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleResetCamera}
            title="รีเซ็ตมุมกล้อง"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            className={`${styles.iconBtn} ${isTheater ? styles.active : ''}`}
            onClick={() => setIsTheater((prev) => !prev)}
            title={isTheater ? 'ย่อเป็นมุมมองมาตรฐาน' : 'ขยายโหมดโรงภาพยนตร์กว้างพิเศษ (Theater Mode)'}
          >
            <Maximize2 size={16} />
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'ออกจากเต็มจอ' : 'แสดงเต็มจอ'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Pathology Telemetry HUD Panel */}
      <div className={styles.hudPanel}>
        <div className={styles.hudHeader}>
          <span>Pathology Telemetry</span>
          <span style={{ color: '#10b981' }}>● LIVE</span>
        </div>
        <div className={styles.hudRow}>
          <span className={styles.hudLabel}>ตัวอย่างชิ้นเนื้อ:</span>
          <span className={styles.hudVal}>Uterus & Adnexa</span>
        </div>
        <div className={styles.hudRow}>
          <span className={styles.hudLabel}>มุมมองรอยโรค:</span>
          <span className={styles.hudVal}>{activeFilter.toUpperCase()}</span>
        </div>
        <div className={styles.hudRow}>
          <span className={styles.hudLabel}>สถานะความเสี่ยง:</span>
          {activeFilter === 'ectopic' ? (
            <span className={`${styles.hudTag} ${styles.tagEmergency}`}>🚨 HIGH RISK</span>
          ) : (
            <span className={`${styles.hudTag} ${styles.tagBenign}`}>✓ BENIGN / STABLE</span>
          )}
        </div>
        <div className={styles.hudRow}>
          <span className={styles.hudLabel}>หมุดพยาธิสภาพ:</span>
          <span className={styles.hudVal}>5 Interactive Pins</span>
        </div>
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.725rem', color: '#fda4af' }}>
          💡 คลิกที่หมุดตัวเลข 1–5 ในโมเดลเพื่อตรวจดู Gross & Microscopic Findings
        </div>
      </div>

      {/* Selected Landmark Detail Card */}
      {selectedPin && (
        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#f43f5e', fontWeight: 700, textTransform: 'uppercase' }}>
                PIN #{selectedPin.pinNumber} • {selectedPin.category.toUpperCase()}
              </span>
              <h4 className={styles.detailTitle}>{selectedPin.nameTh}</h4>
              <div className={styles.detailSubtitle}>{selectedPin.nameEn}</div>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setSelectedPin(null)}
              aria-label="ปิดการ์ด"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.detailDesc}>
            <strong>🔍 มหภาค (Gross):</strong> {selectedPin.grossDesc}
          </div>
          <div className={styles.detailDesc}>
            <strong>🔬 จุลพยาธิวิทยา (Microscopic):</strong> {selectedPin.microDesc}
          </div>

          <div className={styles.clinicalCallout}>
            <strong>ความสำคัญทางคลินิก:</strong> {selectedPin.clinicalNote}
          </div>
        </div>
      )}

      {/* Bottom Filter Controls */}
      <div className={styles.bottomControls}>
        <div className={styles.filterGroup}>
          <button
            type="button"
            className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            รอยโรคทั้งหมด (All)
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${activeFilter === 'leiomyoma' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter('leiomyoma')}
          >
            เนื้องอกมดลูก (Leiomyoma)
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${activeFilter === 'endometriosis' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter('endometriosis')}
          >
            ช็อกโกแลตซีสต์ (Endometrioma)
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${activeFilter === 'ectopic' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter('ectopic')}
          >
            ท้องนอกมดลูก (Ectopic)
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${activeFilter === 'normal' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter('normal')}
          >
            กายวิภาคปกติ (Normal)
          </button>
        </div>

        <div className={styles.toolsGroup}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${isCrossSection ? styles.toggleBtnActive : ''}`}
            onClick={() => setIsCrossSection(!isCrossSection)}
          >
            <Layers size={14} />
            <span>{isCrossSection ? 'มุมมองภายนอก' : 'ผ่าตัดตรวจหน้าตัด (Cutaway)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealisticPathology3DSim;
