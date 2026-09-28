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
  Atom,
  Zap,
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
  toggleSceneWireframe,
  getAnatomicalCoordinates,
  smoothTransitionCamera,
  type LightingMode,
  type AnatomicalView,
  type StudioLightingRig,
} from '../../shared/threeDepthHelpers';
import styles from './RealisticRadiationPhysics3DSim.module.css';

interface RadiationPin {
  id: string;
  pinNumber: string;
  nameTh: string;
  nameEn: string;
  position: THREE.Vector3;
  category: 'nucleus' | 'decay' | 'detector' | 'physics';
  descriptionTh: string;
  descriptionEn: string;
  clinicalNote: string;
}

const RADIATION_PINS: RadiationPin[] = [
  {
    id: 'pin-nucleus',
    pinNumber: '1',
    nameTh: 'นิวเคลียสใจกลางและแรงยึดเหนี่ยว (Nuclear Core & Binding Energy)',
    nameEn: 'Atomic Nucleus & Strong Nuclear Force',
    position: new THREE.Vector3(0, 0, 0),
    category: 'nucleus',
    descriptionTh:
      'กลุ่มก้อนโปรตอนและนิวตรอนที่ยึดเหนี่ยวกันด้วยแรงนิวเคลียร์อย่างเข้ม (Strong Nuclear Force) มีขนาดเส้นผ่านศูนย์กลางประมาณ 10⁻¹⁴ ถึง 10⁻¹⁵ เมตร โดยมวลรวมของนิวเคลียสน้อยกว่ามวลอนุภาคเดี่ยวรวมกัน เรียกว่า Mass Defect (Δm) ซึ่งแปลงเป็นพลังงานยึดเหนี่ยวตามสมการ E = Δmc²',
    descriptionEn:
      'The dense core containing nucleons bound by the strong nuclear force, where mass defect Δm converts into nuclear binding energy.',
    clinicalNote:
      'อัตราส่วน N/Z เป็นตัวกำหนดความเสถียรของนิวเคลียส (Belt of Stability) ถ้านิวเคลียสอยู่นอกแถบความเสถียร จะเกิดการสลายตัวทางรังสีเพื่อกลับเข้าสู่สถานะเสถียร',
  },
  {
    id: 'pin-orbitals',
    pinNumber: '2',
    nameTh: 'ชั้นวงโคจรอิเล็กตรอน (K, L, M Shells & Binding Energy)',
    nameEn: 'Electron Shell Orbitals',
    position: new THREE.Vector3(1.8, 0.4, 0),
    category: 'nucleus',
    descriptionTh:
      'อิเล็กตรอนโคจรรอบนิวเคลียสในระดับชั้นพลังงานไม่ต่อเนื่อง (Quantized Energy Levels) เช่น K-shell (n=1), L-shell (n=2) อิเล็กตรอนชั้นในสุดมีพลังงานยึดเหนี่ยวสูงที่สุด หากถูกกระตุ้นหลุดออก (เช่น ในปรากฏการณ์ Internal Conversion) จะเกิด Characteristic X-ray หรือ Auger Electron',
    descriptionEn:
      'Quantized electron shells with distinct binding energies; vacancies in inner shells lead to characteristic X-rays or Auger electron cascade.',
    clinicalNote:
      'ในเวชศาสตร์นิวเคลียร์และรังสีวินิจฉัย การเกิด Characteristic X-ray และ Auger electron มีบทบาทสำคัญต่อทั้งคุณภาพภาพและปริมาณรังสีเฉพาะที่ (Local Dosimetry)',
  },
  {
    id: 'pin-annihilation',
    pinNumber: '3',
    nameTh: 'สถานีตรวจวัดสัญญาณเพ็ทคู่ขนาน (PET Coincidence Detectors)',
    nameEn: 'Collinear 511 keV PET Detectors',
    position: new THREE.Vector3(3.8, 0, 0),
    category: 'detector',
    descriptionTh:
      'ผลึกรับรังสีแบบเรืองแสง (Scintillation Crystals เช่น BGO, LSO, LYSO) จัดวางตรงข้ามกัน 180 องศาเพื่อดักจับโฟตอนพลังงาน 511 keV สองตัวที่เกิดจากการประลัย (Annihilation) พร้อมกันภายในกรอบเวลา Coincidence Timing Window (ประมาณ 4–10 นาโนวินาที)',
    descriptionEn:
      'Dual opposing scintillation crystal rings designed to register back-to-back 511 keV annihilation photons within a narrow coincidence timing window.',
    clinicalNote:
      'เทคโนโลยีเครื่องตรวจ PET-CT ใช้การตรวจจับคู่โฟตอนนี้เพื่อสร้างภาพ Line of Response (LOR) และคำนวณตำแหน่งเมแทบอลิซึมของน้ำตาลกลูโคส (F-18 FDG) ในมะเร็งได้อย่างแม่นยำสูง',
  },
  {
    id: 'pin-lorentz',
    pinNumber: '4',
    nameTh: 'ขั้วแม่เหล็กแยกลำรังสี (Lorentz Magnetic Deflection Field)',
    nameEn: 'Magnetic Field Deflector (F = q(v × B))',
    position: new THREE.Vector3(0, 2.2, 0),
    category: 'physics',
    descriptionTh:
      'การทดลองประวัติศาสตร์ของรัทเธอร์ฟอร์ดในการจำแนกรังสี 3 ชนิด: รังสีแอลฟา (+2e) เบี่ยงเบนไปทางหนึ่งด้วยรัศมีโค้งกว้าง, รังสีเบตา (-e) เบี่ยงเบนไปทิศตรงข้ามด้วยรัศมีโค้งแคบ (เพราะมวลเบากว่ามาก), และรังสีแกมมา (q=0) เคลื่อนที่ตรงไปข้างหน้าโดยไม่เบี่ยงเบน',
    descriptionEn:
      'Demonstration of Lorentz force separating α, β⁻, and γ rays based on their intrinsic charges and charge-to-mass ratios.',
    clinicalNote:
      'หลักการเบี่ยงเบนประจุในสนามแม่เหล็กถูกใช้ในเครื่องเร่งอนุภาคทางการแพทย์ (Medical Linear Accelerator - LINAC) และ Bending Magnet สำหรับปรับทิศทางลำอิเล็กตรอนบำบัด',
  },
];

type DecayMode = 'alpha' | 'beta' | 'gamma' | 'annihilation' | 'lorentz';

interface NuclideConfig {
  name: string;
  formula: string;
  halfLife: string;
  halfLifeSec: number;
  decayType: DecayMode;
  energyMev: number;
  daughter: string;
}

const NUCLIDE_PRESETS: Record<string, NuclideConfig> = {
  ra226: {
    name: 'Radium-226',
    formula: '²²⁶₈₈Ra → ²²²₈₆Rn + ⁴₂α',
    halfLife: '1,600 ปี',
    halfLifeSec: 5.04e10,
    decayType: 'alpha',
    energyMev: 4.78,
    daughter: 'Radon-222',
  },
  u238: {
    name: 'Uranium-238',
    formula: '²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂α',
    halfLife: '4.47 พันล้านปี',
    halfLifeSec: 1.41e17,
    decayType: 'alpha',
    energyMev: 4.27,
    daughter: 'Thorium-234',
  },
  c14: {
    name: 'Carbon-14',
    formula: '¹⁴₆C → ¹⁴₇N + e⁻ + ν̄ₑ',
    halfLife: '5,730 ปี',
    halfLifeSec: 1.81e11,
    decayType: 'beta',
    energyMev: 0.156,
    daughter: 'Nitrogen-14',
  },
  co60: {
    name: 'Cobalt-60',
    formula: '⁶⁰₂₇Co → ⁶⁰₂₈Ni + β⁻ + 2γ',
    halfLife: '5.27 ปี',
    halfLifeSec: 1.66e8,
    decayType: 'beta',
    energyMev: 1.48,
    daughter: 'Nickel-60',
  },
  tc99m: {
    name: 'Technetium-99m',
    formula: '⁹⁹ᵐ₄₃Tc → ⁹⁹₄₃Tc + γ (140 keV)',
    halfLife: '6.01 ชั่วโมง',
    halfLifeSec: 21636,
    decayType: 'gamma',
    energyMev: 0.1405,
    daughter: 'Technetium-99g',
  },
  f18: {
    name: 'Fluorine-18 (FDG)',
    formula: '¹⁸₉F → ¹⁸₈O + e⁺ → 2γ (511 keV)',
    halfLife: '109.8 นาที',
    halfLifeSec: 6588,
    decayType: 'annihilation',
    energyMev: 0.633,
    daughter: 'Oxygen-18 + 2×0.511 MeV',
  },
};

export const RealisticRadiationPhysics3DSim: FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Simulation parameters
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeMode, setActiveMode] = useState<DecayMode>('alpha');
  const [selectedNuclideKey, setSelectedNuclideKey] = useState<string>('ra226');
  const [decaySpeed, setDecaySpeed] = useState<number>(1.0);
  const [magneticFieldB, setMagneticFieldB] = useState<number>(1.5); // Tesla
  const [showOrbitals, setShowOrbitals] = useState<boolean>(true);
  const [coincidenceCount, setCoincidenceCount] = useState<number>(0);

  // Studio Lighting & View states
  const [lightingMode, setLightingMode] = useState<LightingMode>('clinical');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [activePin, setActivePin] = useState<RadiationPin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const lightingRigRef = useRef<StudioLightingRig | null>(null);

  // Interactive 3D Objects
  const nucleusGroupRef = useRef<THREE.Group | null>(null);
  const orbitalGroupRef = useRef<THREE.Group | null>(null);
  const detectorRingRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const pinMarkersRef = useRef<{ mesh: THREE.Mesh; pin: RadiationPin }[]>([]);

  // Particle pool for animation
  const emittedParticlesRef = useRef<
    {
      mesh: THREE.Object3D;
      velocity: THREE.Vector3;
      type: 'alpha' | 'beta' | 'gamma' | 'positron' | 'neutrino' | 'photon511';
      life: number;
      maxLife: number;
    }[]
  >([]);

  // Vite Preload Error Resilience
  useEffect(() => {
    const handlePreloadError = () => {
      console.warn('[RealisticRadiationPhysics3DSim] Vite chunk preload error detected; gracefully recovering.');
      window.location.reload();
    };
    window.addEventListener('vite:preloadError', handlePreloadError);
    return () => window.removeEventListener('vite:preloadError', handlePreloadError);
  }, []);

  // Handle Fullscreen Toggle (Supports iPad Safari, Android, and Desktop)
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        try {
          if (mountRef.current && typeof mountRef.current.requestFullscreen === 'function') {
            mountRef.current.requestFullscreen().catch(() => {});
          }
        } catch {
          // ignore on iPad / iOS Safari
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

  // Sync with native fullscreen changes and lock body scroll on iPad/mobile
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
        if (e.key === 'Escape') toggleFullscreen();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isFullscreen, toggleFullscreen]);

  // Reset Camera
  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    smoothTransitionCamera(
      cameraRef.current,
      controlsRef.current,
      new THREE.Vector3(0, 2.5, 7.5),
      new THREE.Vector3(0, 0, 0),
      800
    );
  }, []);

  // Switch Anatomical View
  const handleViewSelect = (view: AnatomicalView) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const pos = getAnatomicalCoordinates(view, 7.5);
    smoothTransitionCamera(cameraRef.current, controlsRef.current, pos, new THREE.Vector3(0, 0, 0), 800);
  };

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    sceneRef.current = scene;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 7.5);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 18.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.15; // Allow slight under-angle
    controlsRef.current = controls;

    // 4. Lighting Rig
    const lightingRig = setupStudioLighting(scene);
    lightingRigRef.current = lightingRig;
    setStudioLightingMode(lightingRig, lightingMode);

    // 5. Environmental Helpers
    const shadowDisc = createContactShadowPlane(5.5, -2.4, 0.65);
    scene.add(shadowDisc);

    const floorGrid = createPerspectiveGrid(18, 18, -2.4);
    scene.add(floorGrid);

    // 6. BUILD PROCEDURAL 3D NUCLEAR CORE
    const nucleusGroup = new THREE.Group();
    nucleusGroupRef.current = nucleusGroup;
    scene.add(nucleusGroup);

    // 6.1 Procedural Nucleons (Protons & Neutrons)
    const nucleonGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const protonMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red Proton
      roughness: 0.35,
      metalness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
    });
    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Blue Neutron
      roughness: 0.45,
      metalness: 0.05,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.15,
    });

    const totalNucleons = 42;
    for (let i = 0; i < totalNucleons; i++) {
      const isProton = i % 2 === 0;
      const mesh = new THREE.Mesh(nucleonGeo, isProton ? protonMat : neutronMat);
      mesh.castShadow = true;

      // Pack nucleons organically in a sphere of radius ~0.65
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.68;

      mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      mesh.userData = { initialPos: mesh.position.clone(), speed: 1.0 + Math.random() * 0.5 };
      nucleusGroup.add(mesh);
    }

    // Central Nucleus Quantum Halo
    const haloGeo = new THREE.SphereGeometry(0.95, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    nucleusGroup.add(halo);

    // 6.2 Electron Orbitals & Orbiting Electrons
    const orbitalGroup = new THREE.Group();
    orbitalGroupRef.current = orbitalGroup;
    scene.add(orbitalGroup);

    const shellRadii = [1.7, 2.5, 3.3];
    const shellColors = [0x06b6d4, 0x8b5cf6, 0xec4899];
    const orbitingElectrons: { mesh: THREE.Mesh; radius: number; speed: number; angle: number }[] = [];

    shellRadii.forEach((radius, idx) => {
      // Orbital Ring
      const ringGeo = new THREE.TorusGeometry(radius, 0.015, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: shellColors[idx],
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + (idx * 0.35);
      ring.rotation.y = idx * 0.4;
      orbitalGroup.add(ring);

      // 2 Electrons per shell representation
      for (let eIdx = 0; eIdx < 2; eIdx++) {
        const eGeo = new THREE.SphereGeometry(0.065, 16, 16);
        const eMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.8,
        });
        const electron = new THREE.Mesh(eGeo, eMat);
        orbitalGroup.add(electron);
        orbitingElectrons.push({
          mesh: electron,
          radius,
          speed: (3.0 - idx * 0.6) * (eIdx === 0 ? 1 : -1),
          angle: (eIdx * Math.PI),
        });
      }
    });

    // 6.3 PET Coincidence Detector Ring
    const detectorRing = new THREE.Group();
    detectorRingRef.current = detectorRing;
    scene.add(detectorRing);

    const detGeo = new THREE.BoxGeometry(0.35, 1.2, 0.8);
    const detMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.2,
    });

    // Detector A at (-3.8, 0, 0)
    const detA = new THREE.Mesh(detGeo, detMat);
    detA.position.set(-3.8, 0, 0);
    detA.castShadow = true;
    detectorRing.add(detA);

    // Detector B at (+3.8, 0, 0)
    const detB = new THREE.Mesh(detGeo, detMat);
    detB.position.set(3.8, 0, 0);
    detB.castShadow = true;
    detectorRing.add(detB);

    // 6.4 Emitted Particles Container
    const particlesGroup = new THREE.Group();
    particlesGroupRef.current = particlesGroup;
    scene.add(particlesGroup);

    // 7. Interactive 3D Pins
    const pinGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0xa78bfa,
      emissiveIntensity: 0.9,
    });

    RADIATION_PINS.forEach((pin) => {
      const pinMesh = new THREE.Mesh(pinGeo, pinMat.clone());
      pinMesh.position.copy(pin.position);
      scene.add(pinMesh);
      pinMarkersRef.current.push({ mesh: pinMesh, pin });
    });

    // Raycaster for Pin Clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const meshes = pinMarkersRef.current.map((item) => item.mesh);
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = pinMarkersRef.current.find((item) => item.mesh === intersects[0].object);
        if (hit) {
          setActivePin(hit.pin);
          smoothTransitionCamera(camera, controls, hit.pin.position.clone().add(new THREE.Vector3(0, 1.0, 3.5)), hit.pin.position, 600);
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let lastEmissionTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      if (isPlaying) {
        // Subtle Breathing of Nucleon Core
        if (nucleusGroupRef.current) {
          const breath = 1.0 + Math.sin(elapsed * 4.0) * 0.02;
          nucleusGroupRef.current.scale.set(breath, breath, breath);
          nucleusGroupRef.current.rotation.y += 0.005;
        }

        // Orbiting electrons
        orbitingElectrons.forEach((el) => {
          el.angle += el.speed * dt * decaySpeed;
          el.mesh.position.x = Math.cos(el.angle) * el.radius;
          el.mesh.position.z = Math.sin(el.angle) * el.radius;
        });

        // Periodic Particle Emission Trigger
        if (elapsed - lastEmissionTime > (1.8 / Math.max(0.2, decaySpeed))) {
          lastEmissionTime = elapsed;
          spawnDecayEvent(activeMode);
        }

        // Update Emitted Particles
        updateParticles(dt);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Studio Lighting Mode
  useEffect(() => {
    if (lightingRigRef.current) {
      setStudioLightingMode(lightingRigRef.current, lightingMode);
    }
  }, [lightingMode]);

  // Update Wireframe
  useEffect(() => {
    if (sceneRef.current) {
      toggleSceneWireframe(sceneRef.current, isWireframe);
    }
  }, [isWireframe]);

  // Toggle Orbitals Visibility
  useEffect(() => {
    if (orbitalGroupRef.current) {
      orbitalGroupRef.current.visible = showOrbitals;
    }
  }, [showOrbitals]);

  // Particle Spawner
  const spawnDecayEvent = (mode: DecayMode) => {
    if (!particlesGroupRef.current) return;
    const group = particlesGroupRef.current;

    if (mode === 'alpha') {
      // Spawn He-4 Cluster (2 Protons + 2 Neutrons)
      const alphaGroup = new THREE.Group();
      const nGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const pMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xd97706, emissiveIntensity: 0.5 });
      const nMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });

      const offsets = [
        new THREE.Vector3(0.05, 0.05, 0),
        new THREE.Vector3(-0.05, 0.05, 0),
        new THREE.Vector3(0.05, -0.05, 0),
        new THREE.Vector3(-0.05, -0.05, 0),
      ];
      offsets.forEach((off, idx) => {
        const sphere = new THREE.Mesh(nGeo, idx % 2 === 0 ? pMat : nMat);
        sphere.position.copy(off);
        alphaGroup.add(sphere);
      });

      // Direction vector
      const angle = Math.random() * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(angle), (Math.random() - 0.5) * 0.4, Math.sin(angle)).normalize();

      alphaGroup.position.set(0, 0, 0);
      group.add(alphaGroup);
      emittedParticlesRef.current.push({
        mesh: alphaGroup,
        velocity: dir.multiplyScalar(2.8 * decaySpeed),
        type: 'alpha',
        life: 0,
        maxLife: 2.2,
      });
    } else if (mode === 'beta') {
      // Spawn Beta Electron + Antineutrino
      const betaGeo = new THREE.SphereGeometry(0.06, 12, 12);
      const betaMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const betaMesh = new THREE.Mesh(betaGeo, betaMat);

      const angle = Math.random() * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(angle), (Math.random() - 0.5) * 0.3, Math.sin(angle)).normalize();

      group.add(betaMesh);
      emittedParticlesRef.current.push({
        mesh: betaMesh,
        velocity: dir.multiplyScalar(4.5 * decaySpeed),
        type: 'beta',
        life: 0,
        maxLife: 1.8,
      });
    } else if (mode === 'gamma') {
      // Spawn Gamma Wave Packet
      const gammaGeo = new THREE.ConeGeometry(0.08, 0.35, 8);
      const gammaMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true });
      const gammaMesh = new THREE.Mesh(gammaGeo, gammaMat);

      const angle = Math.random() * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(angle), 0.1, Math.sin(angle)).normalize();
      gammaMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

      group.add(gammaMesh);
      emittedParticlesRef.current.push({
        mesh: gammaMesh,
        velocity: dir.multiplyScalar(5.5 * decaySpeed),
        type: 'gamma',
        life: 0,
        maxLife: 1.5,
      });
    } else if (mode === 'annihilation') {
      // Spawn Two Collinear 511 keV Photons at 180 Degrees
      const photonGeo = new THREE.SphereGeometry(0.09, 16, 16);
      const photonMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });

      const photonA = new THREE.Mesh(photonGeo, photonMat);
      const photonB = new THREE.Mesh(photonGeo, photonMat);

      photonA.position.set(0, 0, 0);
      photonB.position.set(0, 0, 0);

      group.add(photonA);
      group.add(photonB);

      // Exactly opposite directions along X-axis toward detectors
      emittedParticlesRef.current.push({
        mesh: photonA,
        velocity: new THREE.Vector3(-3.8 * decaySpeed, 0, 0),
        type: 'photon511',
        life: 0,
        maxLife: 1.1,
      });
      emittedParticlesRef.current.push({
        mesh: photonB,
        velocity: new THREE.Vector3(3.8 * decaySpeed, 0, 0),
        type: 'photon511',
        life: 0,
        maxLife: 1.1,
      });

      setCoincidenceCount((prev) => prev + 1);
    } else if (mode === 'lorentz') {
      // Spawn All 3: Alpha, Beta, Gamma with B-field deflection
      spawnDecayEvent('alpha');
      spawnDecayEvent('beta');
      spawnDecayEvent('gamma');
    }
  };

  // Particle Physics Update
  const updateParticles = (dt: number) => {
    const alive: typeof emittedParticlesRef.current = [];

    emittedParticlesRef.current.forEach((p) => {
      p.life += dt;

      // Apply Lorentz Magnetic Force if in Lorentz mode (B pointing along +Y)
      if (activeMode === 'lorentz') {
        if (p.type === 'alpha') {
          // Positive charge: Curves towards left
          const v = p.velocity;
          const ax = -v.z * magneticFieldB * 0.4;
          const az = v.x * magneticFieldB * 0.4;
          p.velocity.x += ax * dt;
          p.velocity.z += az * dt;
        } else if (p.type === 'beta') {
          // Negative charge: Curves towards right with tighter radius
          const v = p.velocity;
          const ax = v.z * magneticFieldB * 1.8;
          const az = -v.x * magneticFieldB * 1.8;
          p.velocity.x += ax * dt;
          p.velocity.z += az * dt;
        }
      }

      p.mesh.position.addScaledVector(p.velocity, dt);

      if (p.life < p.maxLife) {
        alive.push(p);
      } else {
        if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
      }
    });

    emittedParticlesRef.current = alive;
  };

  const currentNuclide = NUCLIDE_PRESETS[selectedNuclideKey] || NUCLIDE_PRESETS.ra226;

  return (
    <div
      ref={mountRef}
      className={`${styles.workstationContainer} ${isFullscreen ? styles.fullscreen : ''}`}
      style={{
        minHeight: isFullscreen ? '100dvh' : '620px',
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
          <span className={styles.physicsBadge}>
            <Atom size={16} />
            <span>3D Nuclear Physics Studio</span>
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
            แบบจำลองฟิสิกส์รังสีและการแปลงสภาพนิวเคลียส
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Lighting Mode Selector */}
          <div className={styles.segmentedControl}>
            <button
              onClick={() => setLightingMode('clinical')}
              className={`${styles.segmentBtn} ${lightingMode === 'clinical' ? styles.segmentBtnActive : ''}`}
              title="โหมดแสงสว่างคลินิก (Clinical Light)"
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setLightingMode('cinematic')}
              className={`${styles.segmentBtn} ${lightingMode === 'cinematic' ? styles.segmentBtnActive : ''}`}
              title="โหมดแสงซีนีมาติกเรืองแสง (Cinematic Quantum Glow)"
            >
              <Moon size={14} />
            </button>
          </div>

          {/* Orbitals Toggle */}
          <button
            onClick={() => setShowOrbitals(!showOrbitals)}
            className={`${styles.iconButton} ${showOrbitals ? styles.iconButtonActive : ''}`}
            title="เปิด/ปิด ชั้นวงโคจรอิเล็กตรอน (Toggle Orbitals)"
          >
            <Atom size={16} />
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className={`${styles.iconButton} ${isWireframe ? styles.iconButtonActive : ''}`}
            title="โครงร่างสามมิติ (Wireframe)"
          >
            <Grid size={16} />
          </button>

          {/* Fullscreen Toggle */}
          <button onClick={toggleFullscreen} className={styles.iconButton} title="ขยายเต็มจอ">
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Floating Control & Telemetry HUD */}
      <div className={styles.nuclidePanel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>
            ☢️ ปฏิกิริยานิวเคลียร์ & กัมมันตภาพรังสี
          </span>
          <span className={styles.physicsBadge}>{currentNuclide.name}</span>
        </div>

        {/* Nuclear Equation */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.82rem',
            color: '#a78bfa',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '6px 10px',
            borderRadius: '6px',
            marginTop: '8px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          {currentNuclide.formula}
        </div>

        {/* Telemetry Stats Grid */}
        <div className={styles.physicsGrid}>
          <div className={styles.physicsStat}>
            <div className={styles.statLabel}>ครึ่งชีวิต (T½)</div>
            <div className={styles.statValue}>{currentNuclide.halfLife}</div>
          </div>
          <div className={styles.physicsStat}>
            <div className={styles.statLabel}>พลังงาน (E)</div>
            <div className={styles.statValue}>{currentNuclide.energyMev} MeV</div>
          </div>
          <div className={styles.physicsStat}>
            <div className={styles.statLabel}>สถานะจำลอง</div>
            <div className={styles.statValue} style={{ color: isPlaying ? '#4ade80' : '#f87171' }}>
              {isPlaying ? 'ACTIVE' : 'PAUSED'}
            </div>
          </div>
          <div className={styles.physicsStat}>
            <div className={styles.statLabel}>PET Coincidence</div>
            <div className={styles.statValue} style={{ color: '#4ade80' }}>
              {coincidenceCount} คู่
            </div>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            เลือกรูปแบบการสลายตัว (Decay Modes)
          </div>
          <div className={styles.modeButtonGroup}>
            <button
              onClick={() => {
                setActiveMode('alpha');
                setSelectedNuclideKey('ra226');
              }}
              className={`${styles.modeBtn} ${activeMode === 'alpha' ? styles.modeBtnActive : ''}`}
            >
              α Decay
            </button>
            <button
              onClick={() => {
                setActiveMode('beta');
                setSelectedNuclideKey('co60');
              }}
              className={`${styles.modeBtn} ${activeMode === 'beta' ? styles.modeBtnActive : ''}`}
            >
              β⁻ / e⁻ Decay
            </button>
            <button
              onClick={() => {
                setActiveMode('gamma');
                setSelectedNuclideKey('tc99m');
              }}
              className={`${styles.modeBtn} ${activeMode === 'gamma' ? styles.modeBtnActive : ''}`}
            >
              γ Isomerism
            </button>
            <button
              onClick={() => {
                setActiveMode('annihilation');
                setSelectedNuclideKey('f18');
              }}
              className={`${styles.modeBtn} ${activeMode === 'annihilation' ? styles.modeBtnActive : ''}`}
            >
              PET 511 keV
            </button>
            <button
              onClick={() => setActiveMode('lorentz')}
              className={`${styles.modeBtn} ${activeMode === 'lorentz' ? styles.modeBtnActive : ''}`}
            >
              Lorentz B-Field
            </button>
          </div>
        </div>

        {/* Sliders: Decay Speed & Magnetic Field */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderHeader}>
            <span>อัตราเร่งการจำลอง (Time Scale)</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#c4b5fd' }}>
              {decaySpeed.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={decaySpeed}
            onChange={(e) => setDecaySpeed(parseFloat(e.target.value))}
            className={styles.sliderInput}
          />
        </div>

        {activeMode === 'lorentz' && (
          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span>ความเข้มสนามแม่เหล็ก (B-Field)</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#38bdf8' }}>
                {magneticFieldB.toFixed(1)} Tesla
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.2"
              value={magneticFieldB}
              onChange={(e) => setMagneticFieldB(parseFloat(e.target.value))}
              className={styles.sliderInput}
            />
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={styles.actionBtn}
            style={{
              flex: 1,
              background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
              borderColor: isPlaying ? '#ef4444' : '#22c55e',
              color: isPlaying ? '#fca5a5' : '#86efac',
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'หยุดชั่วคราว' : 'เริ่มจำลอง'}</span>
          </button>
          <button onClick={() => spawnDecayEvent(activeMode)} className={styles.actionBtn} title="ปล่อยอนุภาคเดี่ยวทันที">
            <Zap size={14} />
            <span>ยิงอนุภาค</span>
          </button>
          <button onClick={resetCamera} className={styles.actionBtn} title="รีเซ็ตมุมมองกล้อง">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Anatomical Camera View Shortcuts */}
      <div className={styles.viewPresets}>
        {(['anterior', 'right', 'superior', 'isometric'] as AnatomicalView[]).map((v) => (
          <button key={v} onClick={() => handleViewSelect(v)} className={styles.viewBtn}>
            {v === 'anterior' ? 'หน้าตรง (XY)' : v === 'right' ? 'ด้านข้าง (ZY)' : v === 'superior' ? 'มุมบน (XZ)' : '3D ไอโซ'}
          </button>
        ))}
      </div>

      {/* Interactive Pin Details Drawer */}
      {activePin && (
        <div className={styles.pinDrawer}>
          <div className={styles.pinDrawerHeader}>
            <div>
              <span className={styles.pinCategoryBadge}>{activePin.category}</span>
              <h3 className={styles.pinDrawerTitle}>{activePin.nameTh}</h3>
              <span className={styles.pinDrawerSubtitle}>{activePin.nameEn}</span>
            </div>
            <button onClick={() => setActivePin(null)} className={styles.closeDrawerBtn} aria-label="ปิด">
              <X size={18} />
            </button>
          </div>

          <div className={styles.pinDrawerContent}>
            <div>
              <h4 className={styles.sectionHeader}>กลไกทางฟิสิกส์ (Physical Principle)</h4>
              <p className={styles.sectionBody}>{activePin.descriptionTh}</p>
            </div>

            <div style={{ marginTop: '12px' }}>
              <h4 className={styles.sectionHeader}>English Summary</h4>
              <p className={styles.sectionBodyEn}>{activePin.descriptionEn}</p>
            </div>

            <div className={styles.clinicalAlert}>
              <h4 className={styles.clinicalAlertHeader}>
                <Sparkles size={14} />
                <span>การประยุกต์ใช้ทางรังสีวิทยา (Clinical Application)</span>
              </h4>
              <p className={styles.clinicalAlertBody}>{activePin.clinicalNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealisticRadiationPhysics3DSim;
