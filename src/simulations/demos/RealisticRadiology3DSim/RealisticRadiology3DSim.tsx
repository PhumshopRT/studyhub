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
  Radio,
  Zap,
  Sparkles,
  Sun,
  Moon,
  Grid,
  Maximize,
  ShieldAlert,
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
import styles from './RealisticRadiology3DSim.module.css';

interface RadiologyPin {
  id: string;
  pinNumber: string;
  nameTh: string;
  nameEn: string;
  position: THREE.Vector3;
  category: 'hardware' | 'radiation' | 'detector' | 'safety';
  descriptionTh: string;
  descriptionEn: string;
  clinicalNote: string;
}

const RADIOLOGY_PINS: RadiologyPin[] = [
  {
    id: 'xray-tube',
    pinNumber: '1',
    nameTh: 'หลอดกำเนิดรังสีเอ็กซ์และเป้าทังสเตน (X-ray Tube Assembly)',
    nameEn: 'X-ray Tube Housing & Rotating Anode',
    position: new THREE.Vector3(0, 1.45, 0),
    category: 'radiation',
    descriptionTh:
      'หลอดรังสีเอ็กซ์ความจุความร้อนสูง (7–8 MHU) หมุนพร้อมกับ Gantry ด้วยความเร็วสูงถึง 4 รอบ/วินาที (0.25 s/rot) สร้างลำรังสีพัดผ่านการชนของอิเล็กตรอนกับเป้าหมุน Tungsten-Rhenium Anode',
    descriptionEn:
      'High heat-capacity X-ray tube mounted on the slip-ring rotor, operating at 80–140 kVp with rapid liquid metal bearing cooling.',
    clinicalNote:
      'การปรับค่า kVp และ mA ส่งผลโดยตรงต่อ Contrast-to-Noise Ratio (CNR) และปริมาณรังสีที่ผู้ป่วยได้รับ (CTDIvol) ต้องปรับให้เหมาะสมตามหลัก ALARA',
  },
  {
    id: 'collimator-box',
    pinNumber: '2',
    nameTh: 'คอลลิเมเตอร์หน้าผู้ป่วยและแผ่นกรอง Bow-tie (Pre-patient Collimator)',
    nameEn: 'Pre-Patient Collimator & Bow-tie Filter',
    position: new THREE.Vector3(0, 1.05, 0),
    category: 'hardware',
    descriptionTh:
      'ชุดม่านตะกั่วปรับความกว้างของลำรังสีตามแนวแกน Z (Slice thickness) พร้อมแผ่นกรอง Bow-tie filter ช่วยลดความเข้มรังสีบริเวณขอบร่างกายผู้ป่วยเพื่อลด Radiation dose ส่วนเกิน',
    descriptionEn:
      'Motorized lead jaws adjusting beam width and bow-tie filter homogenizing beam attenuation across patient anatomy.',
    clinicalNote:
      'ป้องกัน Overbeaming และ Overranging ในการสแกนแบบ Helical/Spiral CT ลดปริมาณรังสีสะสมนอกบริเวณตรวจ',
  },
  {
    id: 'detector-arc',
    pinNumber: '3',
    nameTh: 'แผงรับภาพโซลิดสเตตหลายแถว (Multi-slice Detector Array)',
    nameEn: 'Curved Solid-State Scintillator Detector Arc',
    position: new THREE.Vector3(0, -1.45, 0),
    category: 'detector',
    descriptionTh:
      'แผงตัวรับรังสีจัดเรียงเป็นทรงโค้งตรงข้ามหลอดรังสี ประกอบด้วยผลึกเรืองแสง Scintillator (เช่น Ceramic Gadolinium Oxysulfide) เชื่อมต่อกับ Photodiode Array แปลงรังสีเป็นสัญญาณไฟฟ้าดิจิทัล',
    descriptionEn:
      'Multi-row solid-state scintillator array converting transmitted X-ray photons into electrical signals with high quantum efficiency (>98%).',
    clinicalNote:
      'เครื่อง CT สมัยใหม่รองรับ 64–320 slices ต่อรอบหมุน สแกนหัวใจและหลอดเลือดได้ครบในรอบการเต้นของหัวใจเพียงรอบเดียว (Single Heartbeat Cardiac CT)',
  },
  {
    id: 'slip-ring',
    pinNumber: '4',
    nameTh: 'วงแหวนส่งกำลังสลิปริงความเร็วสูง (Slip-Ring Technology)',
    nameEn: 'Continuous Slip-Ring Rotor Assembly',
    position: new THREE.Vector3(1.4, 0, 0),
    category: 'hardware',
    descriptionTh:
      'วงแหวนทองเหลือง/ทองแดงพร้อมแปรงสัมผัสไฟฟ้า (Brushes) ทำหน้าที่ส่งกระแสไฟฟ้าแรงสูงและถ่ายโอนข้อมูลดิจิทัลผ่าน Optical link โดยไม่ต้องใช้สายเคเบิล ทำให้หมุนต่อเนื่องได้ไม่มีที่สิ้นสุด',
    descriptionEn:
      'Electromechanical slip-ring eliminating winding cables, enabling continuous spiral volumetric scanning at sub-second rotation speeds.',
    clinicalNote:
      'นวัตกรรมที่ทำให้เกิดการปฏิวัติสู่ยุค Spiral/Helical CT และ 4D Dynamic Perfusion Imaging',
  },
  {
    id: 'couch-isocenter',
    pinNumber: '5',
    nameTh: 'เตียงตรวจคาร์บอนไฟเบอร์และจุดศูนย์กลางไอโซเซนเตอร์ (Couch & Isocenter)',
    nameEn: 'Carbon-Fiber Patient Couch & Laser Alignment',
    position: new THREE.Vector3(0, 0, 1.2),
    category: 'safety',
    descriptionTh:
      'เตียงตรวจทำจากวัสดุคาร์บอนไฟเบอร์ความหนาแน่นต่ำ มีการดูดกลืนรังสีน้อยที่สุด เลื่อนเข้าออกด้วยมอเตอร์ความละเอียดสูง พร้อมระบบเลเซอร์จัดตำแหน่งตัดกันที่ Isocenter',
    descriptionEn:
      'Low-attenuation motorized carbon-fiber table with laser triangulation positioning the region of interest precisely at scanner isocenter.',
    clinicalNote:
      'หากจัดผู้ป่วยอยู่นอกศูนย์กลาง (Off-center) จะทำให้ Bow-tie filter ทำงานผิดพลาด ปริมาณรังสีที่ผู้ป่วยได้รับจะเพิ่มขึ้น และเกิด Image Noise มากขึ้น',
  },
];

export const RealisticRadiology3DSim: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [isBeamActive, setIsBeamActive] = useState<boolean>(true);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [kVp, setKVp] = useState<number>(120);
  const [mAs, setMAs] = useState<number>(200);
  const [sliceThickness, setSliceThickness] = useState<number>(2.5);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.5); // s/rot
  const [selectedPin, setSelectedPin] = useState<RadiologyPin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Visual Depth & Workstation UI States
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>('cinematic');
  const [activeView, setActiveView] = useState<AnatomicalView>('isometric');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);

  // Refs for WebGL scene lifecycle decoupling
  const isAutoRotateRef = useRef<boolean>(isAutoRotate);
  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  const isBeamActiveRef = useRef<boolean>(isBeamActive);
  useEffect(() => {
    isBeamActiveRef.current = isBeamActive;
  }, [isBeamActive]);

  const kVpRef = useRef<number>(kVp);
  useEffect(() => {
    kVpRef.current = kVp;
  }, [kVp]);

  const mAsRef = useRef<number>(mAs);
  useEffect(() => {
    mAsRef.current = mAs;
  }, [mAs]);

  const rotationSpeedRef = useRef<number>(rotationSpeed);
  useEffect(() => {
    rotationSpeedRef.current = rotationSpeed;
  }, [rotationSpeed]);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const lightingRigRef = useRef<StudioLightingRig | null>(null);
  const gantryRotorRef = useRef<THREE.Group | null>(null);
  const beamMeshRef = useRef<THREE.Mesh | null>(null);
  const laserCrosshairRef = useRef<THREE.Group | null>(null);
  const anatomyGroupRef = useRef<THREE.Group | null>(null);
  const pinSpritesRef = useRef<THREE.Sprite[]>([]);
  const reqIdRef = useRef<number | null>(null);

  // Live Dosimetry Calculation (CTDIvol & DLP)
  const computedCTDI = ((kVp / 120) ** 2 * (mAs / 100) * 8.2).toFixed(1);
  const scanLengthCm = 35; // Standard Thorax/Abdomen
  const computedDLP = Math.round(Number(computedCTDI) * scanLengthCm);

  // View / Lighting handlers
  const handleViewChange = (view: AnatomicalView) => {
    setActiveView(view);
    if (cameraRef.current && controlsRef.current) {
      const targetPos = getAnatomicalCoordinates(view, 5.8, 0.4);
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

  const resetCamera = useCallback(() => {
    setActiveView('isometric');
    if (cameraRef.current && controlsRef.current) {
      const targetPos = getAnatomicalCoordinates('isometric', 5.8, 0.4);
      smoothTransitionCamera(cameraRef.current, controlsRef.current, targetPos, new THREE.Vector3(0, 0, 0), 650);
    }
  }, []);

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

  // Helper for pin texture
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
      ctx.font = 'bold 50px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // -------------------------------------------------------------
  // Mount Three.js Scene ONCE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(3.8, 2.2, 4.2);
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
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, canvas);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 10.0;

    // 5. Studio 3-Point Depth Lighting with Dual Rim Lights
    const rig = setupStudioLighting(scene);
    lightingRigRef.current = rig;
    setStudioLightingMode(rig, 'cinematic');

    // 6. Ground Shadow & Cybernetic Medical Floor Grid
    const shadowDisc = createContactShadowPlane(4.8, -2.4, 0.88);
    scene.add(shadowDisc);

    const grid = createPerspectiveGrid(10.5, 26, -2.41, 0x06b6d4, 0x1e293b);
    scene.add(grid);

    // -------------------------------------------------------------
    // 7. Procedural CT Scanner Gantry Construction (img2threejs)
    // -------------------------------------------------------------
    const anatomyRoot = new THREE.Group();
    scene.add(anatomyRoot);
    anatomyGroupRef.current = anatomyRoot;

    // 7.1 Gantry Outer Enclosure (Torus-like housing with chamfered profile)
    const gantryMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Premium slate carbon enclosure
      roughness: 0.35,
      metalness: 0.25,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Medical Cyan Ring Accent
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
    });

    const gantryOuterGeo = new THREE.CylinderGeometry(2.35, 2.35, 1.25, 48);
    const gantryOuter = new THREE.Mesh(gantryOuterGeo, gantryMat);
    gantryOuter.rotation.x = Math.PI / 2;
    anatomyRoot.add(gantryOuter);

    // Gantry Bore Cavity (Bore Tunnel)
    const boreGeo = new THREE.CylinderGeometry(1.15, 1.15, 1.3, 48);
    const boreMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.BackSide,
    });
    const bore = new THREE.Mesh(boreGeo, boreMat);
    bore.rotation.x = Math.PI / 2;
    anatomyRoot.add(bore);

    // Cyan Front Ring Bezel
    const frontBezelGeo = new THREE.TorusGeometry(1.22, 0.08, 24, 48);
    const frontBezel = new THREE.Mesh(frontBezelGeo, accentMat);
    frontBezel.position.z = 0.63;
    anatomyRoot.add(frontBezel);

    const rearBezel = new THREE.Mesh(frontBezelGeo, accentMat);
    rearBezel.position.z = -0.63;
    anatomyRoot.add(rearBezel);

    // 7.2 Internal Slip-Ring Rotor (Rotating annular assembly)
    const rotorGroup = new THREE.Group();
    anatomyRoot.add(rotorGroup);
    gantryRotorRef.current = rotorGroup;

    const rotorRingGeo = new THREE.TorusGeometry(1.55, 0.09, 16, 48);
    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Bronze/copper slip ring tracks
      roughness: 0.25,
      metalness: 0.85,
    });
    const rotorRing = new THREE.Mesh(rotorRingGeo, rotorMat);
    rotorGroup.add(rotorRing);

    // 7.3 X-ray Tube Assembly (Top mounted on rotor)
    const tubeGeo = new THREE.BoxGeometry(0.55, 0.35, 0.45);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Heavy shielded casing
      metalness: 0.8,
      roughness: 0.3,
    });
    const xrayTube = new THREE.Mesh(tubeGeo, tubeMat);
    xrayTube.position.set(0, 1.45, 0);
    rotorGroup.add(xrayTube);

    // Collimator box below tube
    const collGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.25, 24);
    const collMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
    });
    const collimator = new THREE.Mesh(collGeo, collMat);
    collimator.position.set(0, 1.15, 0);
    rotorGroup.add(collimator);

    // 7.4 Curved Multi-Slice Detector Array (Bottom, opposite to tube)
    const detectorGroup = new THREE.Group();
    const detectorArcGeo = new THREE.TorusGeometry(1.45, 0.18, 16, 32, Math.PI * 0.45);
    const detectorMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.75,
      roughness: 0.25,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4,
    });
    const detectorArc = new THREE.Mesh(detectorArcGeo, detectorMat);
    detectorArc.rotation.z = Math.PI * 1.28;
    detectorGroup.add(detectorArc);
    rotorGroup.add(detectorGroup);

    // 7.5 Volumetric X-ray Fan-Beam (Translucent cone pulsing from tube to detector)
    const beamGeo = new THREE.ConeGeometry(1.35, 2.7, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.set(0, 0.05, 0);
    beamMesh.rotation.x = Math.PI;
    rotorGroup.add(beamMesh);
    beamMeshRef.current = beamMesh;

    // 7.6 Patient Couch (Carbon-fiber tabletop extending through bore)
    const couchGroup = new THREE.Group();
    anatomyRoot.add(couchGroup);

    const couchGeo = new THREE.BoxGeometry(0.72, 0.06, 3.8);
    const couchMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Carbon fiber composite
      roughness: 0.2,
      metalness: 0.5,
    });
    const couch = new THREE.Mesh(couchGeo, couchMat);
    couch.position.set(0, -0.4, 0.6);
    couchGroup.add(couch);

    // Pedestal motor base
    const baseGeo = new THREE.BoxGeometry(0.85, 1.4, 1.8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.2,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -1.35, 2.0);
    couchGroup.add(baseMesh);

    // 7.7 Laser Alignment Crosshairs (Red/Cyan Orthogonal positioning planes)
    const laserGroup = new THREE.Group();
    anatomyRoot.add(laserGroup);
    laserCrosshairRef.current = laserGroup;

    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });

    const sagPlaneGeo = new THREE.PlaneGeometry(0.01, 2.0);
    const sagLaser = new THREE.Mesh(sagPlaneGeo, laserMat);
    sagLaser.position.set(0, 0, 0);
    laserGroup.add(sagLaser);

    const axialPlaneGeo = new THREE.PlaneGeometry(2.0, 0.01);
    const axialLaser = new THREE.Mesh(axialPlaneGeo, laserMat);
    axialLaser.position.set(0, 0, 0);
    laserGroup.add(axialLaser);

    // -------------------------------------------------------------
    // 8. 3D Landmark Interactive Pins
    // -------------------------------------------------------------
    pinSpritesRef.current = [];
    RADIOLOGY_PINS.forEach((pin) => {
      const pinColor =
        pin.category === 'radiation'
          ? '#ef4444'
          : pin.category === 'detector'
          ? '#22d3ee'
          : pin.category === 'safety'
          ? '#10b981'
          : '#f59e0b';
      const texture = createPinTexture(pin.pinNumber, pinColor);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(pin.position);
      sprite.scale.set(0.36, 0.36, 1);
      (sprite as any).userData = { pinId: pin.id };
      anatomyRoot.add(sprite);
      pinSpritesRef.current.push(sprite);
    });

    // -------------------------------------------------------------
    // 9. Pointer Raycasting
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
        const matched = RADIOLOGY_PINS.find((p) => p.id === pinId);
        if (matched) {
          setSelectedPin(matched);
        }
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);

    // -------------------------------------------------------------
    // 10. Animation Loop (60 FPS PBR Render)
    // -------------------------------------------------------------
    const clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slip-ring continuous rotation
      if (gantryRotorRef.current && isAutoRotateRef.current) {
        const speedMultiplier = 1 / Math.max(0.15, rotationSpeedRef.current);
        gantryRotorRef.current.rotation.z += delta * 3.14 * speedMultiplier;
      }

      // X-ray Beam intensity & pulse animation
      if (beamMeshRef.current) {
        if (isBeamActiveRef.current) {
          beamMeshRef.current.visible = true;
          const beamPulse = 0.28 + Math.sin(elapsed * 12) * 0.08;
          (beamMeshRef.current.material as THREE.MeshBasicMaterial).opacity = beamPulse * (kVpRef.current / 120);
        } else {
          beamMeshRef.current.visible = false;
        }
      }

      // Laser alignment breathing glow
      if (laserCrosshairRef.current) {
        const laserGlow = 0.5 + Math.sin(elapsed * 4) * 0.2;
        laserCrosshairRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
            child.material.opacity = laserGlow;
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 11. Window Resize Listener
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
  }, []); // Mounts once! Zero WebGL context recreations

  return (
    <div
      ref={containerRef}
      className={`${styles.workstationContainer} ${isFullscreen ? styles.fullscreen : ''} ${
        isTheater ? styles.theater : ''
      }`}
    >
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} />
        <div className={styles.reticle} title="CT Scanner Gantry Isocenter" />
      </div>

      {/* Top Header & Toolbar */}
      <div className={styles.topBar}>
        <div className={styles.titleBadge}>
          <div className={styles.liveLed} title="PBR Radiologic Workstation Active" />
          <Radio size={18} color="#22d3ee" />
          <div>
            <h3>3D CT Scanner Gantry & Radiation Simulator</h3>
            <span className={styles.engineTag}>img2threejs WebGL 2.0 PBR</span>
          </div>
        </div>

        {/* Anatomical & Scanner Presets Dial Bar */}
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
          <button className={styles.presetBtn} onClick={resetCamera} title="รีเซ็ตมุมมองกล้อง (Reset Camera)">
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
                ? 'Clinical Bright'
                : lightingMode === 'cinematic'
                ? 'Cinematic Depth'
                : 'Radiology Console Dark'
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
            className={`${styles.btnAction} ${isBeamActive ? styles.active : ''}`}
            onClick={() => setIsBeamActive((prev) => !prev)}
            title="เปิด/ปิดลำรังสีเอกซ์ (X-ray Fan Beam Emission)"
          >
            <Zap size={14} />
            {isBeamActive ? 'Beam ON' : 'Beam OFF'}
          </button>

          <button
            className={`${styles.btnAction} ${isAutoRotate ? styles.active : ''}`}
            onClick={() => setIsAutoRotate((prev) => !prev)}
            title="เปิด/ปิดการหมุน Slip-Ring Rotor ต่อเนื่อง"
          >
            {isAutoRotate ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button
            className={`${styles.btnAction} ${isTheater ? styles.active : ''}`}
            onClick={() => setIsTheater((prev) => !prev)}
            title={isTheater ? 'ย่อเป็นมุมมองมาตรฐาน' : 'ขยายเป็นโหมดโรงภาพยนตร์ (Theater Mode)'}
          >
            <Maximize size={14} />
          </button>

          <button
            className={styles.btnAction}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'ย่อหน้าจอ' : 'ขยายเต็มหน้าจอ (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Floating Live Dosimetry & Scanner Telemetry HUD */}
      <div className={styles.dosimetryPanel}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={styles.radBadge}>CT Dosimetry Console</span>
          <span className={isBeamActive ? styles.beamBadgeOn : styles.beamBadgeOff}>
            <Zap size={12} /> {isBeamActive ? 'RADIATION ACTIVE' : 'STANDBY'}
          </span>
        </div>

        <div className={styles.doseGrid}>
          <div className={styles.doseStat}>
            <div className={styles.doseLabel}>CTDIvol (mGy)</div>
            <div className={styles.doseValue}>{computedCTDI}</div>
          </div>
          <div className={styles.doseStat}>
            <div className={styles.doseLabel}>DLP (mGy·cm)</div>
            <div className={styles.doseValue}>{computedDLP}</div>
          </div>
        </div>

        {/* Sliders for Radiation Physics Parameters */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderHeader}>
            <span>Tube Potential (kVp)</span>
            <span style={{ color: '#22d3ee', fontWeight: 700 }}>{kVp} kV</span>
          </div>
          <input
            type="range"
            min="80"
            max="140"
            step="10"
            value={kVp}
            onChange={(e) => setKVp(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>

        <div className={styles.sliderRow}>
          <div className={styles.sliderHeader}>
            <span>Tube Current-Time (mAs)</span>
            <span style={{ color: '#22d3ee', fontWeight: 700 }}>{mAs} mAs</span>
          </div>
          <input
            type="range"
            min="50"
            max="400"
            step="25"
            value={mAs}
            onChange={(e) => setMAs(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>

        <div className={styles.sliderRow}>
          <div className={styles.sliderHeader}>
            <span>Slice Thickness</span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>{sliceThickness} mm</span>
          </div>
          <input
            type="range"
            min="0.625"
            max="10.0"
            step="0.625"
            value={sliceThickness}
            onChange={(e) => setSliceThickness(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>

        <div className={styles.sliderRow}>
          <div className={styles.sliderHeader}>
            <span>Rotor Speed</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{rotationSpeed} s/rot</span>
          </div>
          <input
            type="range"
            min="0.25"
            max="1.0"
            step="0.05"
            value={rotationSpeed}
            onChange={(e) => setRotationSpeed(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>
      </div>

      {/* Selected Landmark Detail Card Modal */}
      {selectedPin && (
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.pinNumberBadge}>{selectedPin.pinNumber}</span>
              <div>
                <h4>{selectedPin.nameTh}</h4>
                <span className={styles.enSub}>{selectedPin.nameEn}</span>
              </div>
            </div>
            <button className={styles.closeCardBtn} onClick={() => setSelectedPin(null)} title="ปิดหน้านี้">
              <X size={16} />
            </button>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.specSection}>
              <span className={styles.specLabel}>รายละเอียดโครงสร้างและการทำงาน:</span>
              <p>{selectedPin.descriptionTh}</p>
            </div>
            <div className={styles.specSection}>
              <span className={styles.specLabel}>Technical Architecture:</span>
              <p>{selectedPin.descriptionEn}</p>
            </div>
            <div className={styles.clinicalAlert}>
              <ShieldAlert size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
              <div>
                <b>Clinical & Physics Pearl:</b>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{selectedPin.clinicalNote}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealisticRadiology3DSim;
