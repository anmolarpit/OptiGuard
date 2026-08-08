import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SystemState } from '../../types';
import { audioFx } from '../../services/telemetryEngine';
import { Eye, RotateCcw, Zap, AlertOctagon, Layers, Maximize2, Crosshair, Cpu } from 'lucide-react';

interface Props {
  state: SystemState;
  setState: React.Dispatch<React.SetStateAction<SystemState>>;
  onSimulateBeamBreak: () => void;
  onSimulateCyberAttack: () => void;
}

export const PerimeterTwinPanel: React.FC<Props> = ({
  state,
  setState,
  onSimulateBeamBreak,
  onSimulateCyberAttack,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Mesh refs for animated updates
  const servoArmGroupRef = useRef<THREE.Group | null>(null);
  const knifeSwitchRef = useRef<THREE.Mesh | null>(null);
  const laserBeamsGroupRef = useRef<THREE.Group | null>(null);
  const lensesGroupRef = useRef<THREE.Group | null>(null);
  const esp32TxLedRef = useRef<THREE.Mesh | null>(null);
  const esp32RxLedRef = useRef<THREE.Mesh | null>(null);

  // Controls state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [camAngles, setCamAngles] = useState({ alpha: 0.6, beta: 0.45, distance: 18 });

  // Refs for animation loop to avoid stale closure
  const stateRef = useRef(state);
  stateRef.current = state;

  const camAnglesRef = useRef(camAngles);
  camAnglesRef.current = camAngles;

  // Pinned 2D DOM Callout overlay coordinates
  const [calloutCoords, setCalloutCoords] = useState<{
    emitter: { x: number; y: number; visible: boolean };
    receiver: { x: number; y: number; visible: boolean };
    servo: { x: number; y: number; visible: boolean };
    esp32: { x: number; y: number; visible: boolean };
  }>({
    emitter: { x: -1000, y: -1000, visible: false },
    receiver: { x: -1000, y: -1000, visible: false },
    servo: { x: -1000, y: -1000, visible: false },
    esp32: { x: -1000, y: -1000, visible: false },
  });

  // 1. Initialize Three.js Scene (Mount Once)
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();
    const isLight = stateRef.current.themeMode === 'light';
    scene.background = new THREE.Color(isLight ? 0xffffff : 0x080c14);
    scene.fog = new THREE.FogExp2(isLight ? 0xffffff : 0x080c14, isLight ? 0.01 : 0.025);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const { alpha, beta, distance } = camAnglesRef.current;
    camera.position.set(
      distance * Math.cos(alpha) * Math.cos(beta),
      distance * Math.sin(beta),
      distance * Math.sin(alpha) * Math.cos(beta)
    );
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x384d6b, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x73a0d7, 2.0);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const redGlowPoint = new THREE.PointLight(0xff3333, 1.5, 12);
    redGlowPoint.position.set(-3, 2, 0);
    scene.add(redGlowPoint);

    const blueTechPoint = new THREE.PointLight(0x3088ff, 1.0, 10);
    blueTechPoint.position.set(4, 1.5, 2);
    scene.add(blueTechPoint);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(24, 24, 0x1e2d42, 0x121b28);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // --- 3D BENCH MODEL CONSTRUCTION ---
    const benchGroup = new THREE.Group();

    // 1. Base Plate (Test Bench Chassis)
    const baseGeo = new THREE.BoxGeometry(14, 0.4, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x101724,
      roughness: 0.6,
      metalness: 0.8,
      wireframe: stateRef.current.isWireframe3d,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.2;
    baseMesh.receiveShadow = true;
    benchGroup.add(baseMesh);

    // Outer Trim Rail
    const railGeo = new THREE.BoxGeometry(14.2, 0.1, 8.2);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x1d2d44, metalness: 0.9 });
    const railMesh = new THREE.Mesh(railGeo, railMat);
    railMesh.position.y = -0.4;
    benchGroup.add(railMesh);

    // 2. DUAL IR TOWER MASTS (Left & Right)
    const towerGeo = new THREE.BoxGeometry(0.8, 4.5, 0.8);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x1a2436,
      roughness: 0.4,
      metalness: 0.8,
      wireframe: stateRef.current.isWireframe3d,
    });

    // Left Tower (IR Emitters)
    const leftTower = new THREE.Mesh(towerGeo, towerMat);
    leftTower.position.set(-5, 2.25, 0);
    leftTower.castShadow = true;
    benchGroup.add(leftTower);

    // Right Tower (IR Receivers)
    const rightTower = new THREE.Mesh(towerGeo, towerMat);
    rightTower.position.set(5, 2.25, 0);
    rightTower.castShadow = true;
    benchGroup.add(rightTower);

    // Tower Caps & Optics Housing
    const capGeo = new THREE.BoxGeometry(1.0, 0.3, 1.0);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x30d158, emissive: 0x0f401c });
    const capLeft = new THREE.Mesh(capGeo, capMat);
    capLeft.position.set(-5, 4.6, 0);
    benchGroup.add(capLeft);

    const capRight = new THREE.Mesh(capGeo, capMat);
    capRight.position.set(5, 4.6, 0);
    benchGroup.add(capRight);

    // 3. IR BEAM LASER MESH & LENSES (8 Parallel Channels)
    const laserGroup = new THREE.Group();
    laserBeamsGroupRef.current = laserGroup;

    const lensesGroup = new THREE.Group();
    lensesGroupRef.current = lensesGroup;

    for (let i = 0; i < 8; i++) {
      const zOffset = -2.4 + i * 0.68;
      const beamHeight = 0.8 + (i % 2) * 0.4;

      // Laser Cylinder Line
      const laserGeo = new THREE.CylinderGeometry(0.025, 0.025, 10, 8);
      laserGeo.rotateZ(Math.PI / 2);

      const laserMat = new THREE.MeshBasicMaterial({
        color: 0xff2222,
        transparent: true,
        opacity: 0.85,
      });

      const laserMesh = new THREE.Mesh(laserGeo, laserMat);
      laserMesh.position.set(0, beamHeight, zOffset);
      laserGroup.add(laserMesh);

      // Optics Lens Dot on Left & Right Tower
      const lensGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const lensMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });

      const lensLeft = new THREE.Mesh(lensGeo, lensMat);
      lensLeft.position.set(-4.58, beamHeight, zOffset);
      lensesGroup.add(lensLeft);

      const lensRight = new THREE.Mesh(lensGeo, lensMat);
      lensRight.position.set(4.58, beamHeight, zOffset);
      lensesGroup.add(lensRight);
    }
    benchGroup.add(laserGroup);
    benchGroup.add(lensesGroup);

    // 4. MECHANICAL SERVO ACTUATOR & AIR-GAP KNIFE DISCONNECT
    const servoBaseGroup = new THREE.Group();
    servoBaseGroup.position.set(0, 0.4, -2.5);

    // Servo Motor Body
    const servoBodyGeo = new THREE.BoxGeometry(1.6, 1.4, 1.2);
    const servoBodyMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.9,
    });
    const servoMesh = new THREE.Mesh(servoBodyGeo, servoBodyMat);
    servoMesh.castShadow = true;
    servoBaseGroup.add(servoMesh);

    // Servo Horn Gear
    const gearGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const gearMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });
    const gearMesh = new THREE.Mesh(gearGeo, gearMat);
    gearMesh.position.set(0, 0.8, 0);
    servoBaseGroup.add(gearMesh);

    // SERVO ARM & AIR-GAP KNIFE SWITCH (Rotates on trigger)
    const armGroup = new THREE.Group();
    armGroup.position.set(0, 0.9, 0);
    servoArmGroupRef.current = armGroup;

    // Aluminum Lever Arm
    const leverGeo = new THREE.BoxGeometry(3.2, 0.15, 0.3);
    leverGeo.translate(1.5, 0, 0); // Pivot at origin
    const leverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const leverMesh = new THREE.Mesh(leverGeo, leverMat);
    armGroup.add(leverMesh);

    // Copper Knife Switch Blade Contact
    const knifeGeo = new THREE.BoxGeometry(1.2, 0.4, 0.08);
    knifeGeo.translate(2.4, -0.2, 0);
    const knifeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.95,
      wireframe: stateRef.current.isWireframe3d,
    });
    const knifeMesh = new THREE.Mesh(knifeGeo, knifeMat);
    knifeSwitchRef.current = knifeMesh;
    armGroup.add(knifeMesh);

    servoBaseGroup.add(armGroup);

    // Stationary Copper Receptacle Block (Physical Air-Gap Terminal)
    const terminalGeo = new THREE.BoxGeometry(0.6, 0.8, 0.5);
    const terminalMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9 });
    const terminalMesh = new THREE.Mesh(terminalGeo, terminalMat);
    terminalMesh.position.set(2.4, 0.4, 0);
    servoBaseGroup.add(terminalMesh);

    benchGroup.add(servoBaseGroup);

    // 5. ESP32 MICROCONTROLLER MOUNTING PLATE
    const esp32Group = new THREE.Group();
    esp32Group.position.set(-2.5, 0.2, 2.2);

    // PCB Board (Green Epoxy / Black Metal PCB)
    const pcbGeo = new THREE.BoxGeometry(2.4, 0.1, 1.6);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.5 });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    esp32Group.add(pcbMesh);

    // ESP32 Metal RF Shield Can
    const shieldGeo = new THREE.BoxGeometry(1.0, 0.2, 0.8);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.set(-0.4, 0.15, 0);
    esp32Group.add(shieldMesh);

    // Status LEDs on ESP32 PCB
    const ledGeo = new THREE.BoxGeometry(0.12, 0.1, 0.12);
    const ledPwrMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const ledPwr = new THREE.Mesh(ledGeo, ledPwrMat);
    ledPwr.position.set(0.8, 0.12, 0.5);
    esp32Group.add(ledPwr);

    const ledTxMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const ledTx = new THREE.Mesh(ledGeo, ledTxMat);
    ledTx.position.set(0.8, 0.12, 0.2);
    esp32TxLedRef.current = ledTx;
    esp32Group.add(ledTx);

    const ledRxMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const ledRx = new THREE.Mesh(ledGeo, ledRxMat);
    ledRx.position.set(0.8, 0.12, -0.1);
    esp32RxLedRef.current = ledRx;
    esp32Group.add(ledRx);

    benchGroup.add(esp32Group);

    scene.add(benchGroup);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentCam = camAnglesRef.current;

      // Update camera position based on orbit controls
      if (cameraRef.current) {
        cameraRef.current.position.x = currentCam.distance * Math.cos(currentCam.alpha) * Math.cos(currentCam.beta);
        cameraRef.current.position.y = currentCam.distance * Math.sin(currentCam.beta);
        cameraRef.current.position.z = currentCam.distance * Math.sin(currentCam.alpha) * Math.cos(currentCam.beta);
        cameraRef.current.lookAt(0, 1, 0);
      }

      // Smooth Servo Arm Rotation based on state.servoAngle (0° closed, 45° open)
      if (servoArmGroupRef.current) {
        const targetRad = (currentState.servoAngle * Math.PI) / 180;
        servoArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          servoArmGroupRef.current.rotation.z,
          targetRad,
          0.15
        );
      }

      // Laser Mesh visibility & pulsating high-frequency laser vibration
      if (laserBeamsGroupRef.current) {
        laserBeamsGroupRef.current.visible = currentState.showLaserMesh;
        laserBeamsGroupRef.current.children.forEach((child, idx) => {
          const isBroken = currentState.isSimulatingBeamBreak && idx === 4;
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshBasicMaterial;
            if (isBroken) {
              mat.color.setHex(0xff453a);
              mat.opacity = 0.2;
            } else {
              mat.color.setHex(0xff2222);
              mat.opacity = 0.65 + Math.sin(elapsedTime * 12 + idx * 0.8) * 0.25;
            }
          }
        });
      }

      // Update lens dots color
      if (lensesGroupRef.current) {
        lensesGroupRef.current.children.forEach((lens, idx) => {
          const beamIdx = Math.floor(idx / 2);
          const isBroken = currentState.isSimulatingBeamBreak && beamIdx === 4;
          if (lens instanceof THREE.Mesh) {
            const mat = lens.material as THREE.MeshBasicMaterial;
            mat.color.setHex(isBroken ? 0xff453a : 0x00ff66);
          }
        });
      }

      // Project 3D World coordinates to 2D screen positions for floating DOM callouts
      if (cameraRef.current && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const projectPoint = (x: number, y: number, z: number) => {
          const p = new THREE.Vector3(x, y, z);
          p.project(cameraRef.current!);
          const screenX = (p.x * 0.5 + 0.5) * w;
          const screenY = (-p.y * 0.5 + 0.5) * h;
          return { x: screenX, y: screenY, visible: p.z < 1 };
        };

        setCalloutCoords({
          emitter: projectPoint(-5, 3.8, 0),
          receiver: projectPoint(5, 3.8, 0),
          servo: projectPoint(1.2, 1.8, -2.5),
          esp32: projectPoint(-2.5, 0.8, 2.2),
        });
      }

      // Pulse ESP32 LEDs
      if (esp32TxLedRef.current) {
        (esp32TxLedRef.current.material as THREE.MeshBasicMaterial).opacity =
          Math.sin(elapsedTime * 12) > 0 ? 1 : 0.2;
      }

      renderer.render(scene, cameraRef.current!);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
      renderer.dispose();
    };
  }, []);

  // Dynamically update wireframe material toggle across all scene meshes without re-creating WebGL
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            if ('wireframe' in m) (m as THREE.MeshStandardMaterial).wireframe = state.isWireframe3d;
          });
        } else if ('wireframe' in obj.material) {
          (obj.material as THREE.MeshStandardMaterial).wireframe = state.isWireframe3d;
        }
      }
    });
  }, [state.isWireframe3d]);

  // Dynamically update Three.js canvas background color based on themeMode
  useEffect(() => {
    if (!sceneRef.current) return;
    if (state.themeMode === 'light') {
      sceneRef.current.background = new THREE.Color(0xffffff);
      sceneRef.current.fog = new THREE.FogExp2(0xffffff, 0.01);
    } else {
      sceneRef.current.background = new THREE.Color(0x080c14);
      sceneRef.current.fog = new THREE.FogExp2(0x080c14, 0.025);
    }
  }, [state.themeMode]);

  // Orbit Drag Interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    const dx = e.clientX - mousePos.x;
    const dy = e.clientY - mousePos.y;
    setMousePos({ x: e.clientX, y: e.clientY });

    setCamAngles((prev) => ({
      alpha: prev.alpha - dx * 0.008,
      beta: Math.max(0.1, Math.min(Math.PI / 2 - 0.1, prev.beta + dy * 0.008)),
      distance: prev.distance,
    }));
  };

  const handleMouseUp = () => setIsMouseDown(false);

  const handleWheel = (e: React.WheelEvent) => {
    setCamAngles((prev) => ({
      ...prev,
      distance: Math.max(8, Math.min(30, prev.distance + e.deltaY * 0.01)),
    }));
  };

  const handleResetCamera = () => {
    audioFx.playClick('toggle');
    setCamAngles({ alpha: 0.6, beta: 0.45, distance: 18 });
  };

  const handleCameraPreset = (preset: 'bench' | 'ir' | 'servo') => {
    audioFx.playClick('toggle');
    if (preset === 'bench') {
      setCamAngles({ alpha: 0.6, beta: 0.45, distance: 18 });
    } else if (preset === 'ir') {
      setCamAngles({ alpha: 0.0, beta: 0.25, distance: 12 });
    } else if (preset === 'servo') {
      setCamAngles({ alpha: 1.55, beta: 0.5, distance: 10 });
    }
  };

  return (
    <section className="scada-panel relative flex flex-col h-full min-h-[460px] overflow-hidden border border-[#1d2636] corner-brackets">
      {/* PANEL HEADER BAR */}
      <div className="flex items-center justify-between px-3.5 h-10 bg-[#0a0f19] border-b border-[#1d2636] font-mono text-xs select-none">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#30d158]" />
          <span className="font-bold text-white tracking-wider">PANEL A: PERIMETER SENSOR ARRAY [3D TWIN]</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* CAMERA PRESET PREVIEW BUTTONS */}
          <div className="hidden md:flex items-center gap-1 mr-2 text-[9px] font-mono">
            <span className="text-slate-500 uppercase mr-1">CAM:</span>
            <button
              onClick={() => handleCameraPreset('bench')}
              className="px-1.5 py-0.5 bg-[#121c2d] hover:bg-[#1c2c45] border border-[#23354f] text-slate-300 rounded-sm cursor-pointer"
            >
              BENCH
            </button>
            <button
              onClick={() => handleCameraPreset('ir')}
              className="px-1.5 py-0.5 bg-[#121c2d] hover:bg-[#1c2c45] border border-[#23354f] text-sky-300 rounded-sm cursor-pointer"
            >
              IR PATH
            </button>
            <button
              onClick={() => handleCameraPreset('servo')}
              className="px-1.5 py-0.5 bg-[#121c2d] hover:bg-[#1c2c45] border border-[#23354f] text-amber-300 rounded-sm cursor-pointer"
            >
              SERVO
            </button>
          </div>

          <button
            onClick={() => {
              audioFx.playClick('toggle');
              setState((p) => ({ ...p, isWireframe3d: !p.isWireframe3d }));
            }}
            className={`px-2 py-0.5 text-[10px] rounded-sm border transition-colors cursor-pointer ${
              state.isWireframe3d
                ? 'bg-sky-950 border-sky-500 text-sky-300 font-bold'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            WIREFRAME
          </button>
          <button
            onClick={() => {
              audioFx.playClick('toggle');
              setState((p) => ({ ...p, showLaserMesh: !p.showLaserMesh }));
            }}
            className={`px-2 py-0.5 text-[10px] rounded-sm border transition-colors cursor-pointer ${
              state.showLaserMesh
                ? 'bg-[#30d158]/20 border-[#30d158] text-[#30d158] font-bold'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            LASER MESH
          </button>
          <button
            onClick={handleResetCamera}
            className="p-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-sm transition-colors cursor-pointer"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D CANVAS VIEWPORT CONTAINER */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="relative flex-1 w-full h-full min-h-[380px] cursor-grab active:cursor-grabbing scada-grid-bg overflow-hidden"
      >
        {/* FLOATING 3D DOM CALLOUT OVERLAYS PINNED TO 3D WORLD COORDINATES */}
        {calloutCoords.emitter.visible && (
          <div
            className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-full transition-transform duration-75 font-mono text-[9px]"
            style={{ left: `${calloutCoords.emitter.x}px`, top: `${calloutCoords.emitter.y}px` }}
          >
            <div className="bg-[#080e18]/90 border border-[#30d158] text-[#30d158] px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(48,209,88,0.3)] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse"></span>
              [OPTICAL IR EMITTER MAST]
            </div>
            <div className="w-0.5 h-3 bg-[#30d158] mx-auto"></div>
          </div>
        )}

        {calloutCoords.receiver.visible && (
          <div
            className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-full transition-transform duration-75 font-mono text-[9px]"
            style={{ left: `${calloutCoords.receiver.x}px`, top: `${calloutCoords.receiver.y}px` }}
          >
            <div className="bg-[#080e18]/90 border border-sky-400 text-sky-300 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(56,189,248,0.3)] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              [38kHz SENSOR ARRAY]
            </div>
            <div className="w-0.5 h-3 bg-sky-400 mx-auto"></div>
          </div>
        )}

        {calloutCoords.servo.visible && (
          <div
            className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-full transition-transform duration-75 font-mono text-[9px]"
            style={{ left: `${calloutCoords.servo.x}px`, top: `${calloutCoords.servo.y}px` }}
          >
            <div className="bg-[#080e18]/90 border border-amber-400 text-amber-300 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(251,191,36,0.3)] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              [SERVO LOCKOUT ARM]
            </div>
            <div className="w-0.5 h-3 bg-amber-400 mx-auto"></div>
          </div>
        )}

        {calloutCoords.esp32.visible && (
          <div
            className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-full transition-transform duration-75 font-mono text-[9px]"
            style={{ left: `${calloutCoords.esp32.x}px`, top: `${calloutCoords.esp32.y}px` }}
          >
            <div className="bg-[#080e18]/90 border border-emerald-400 text-emerald-300 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(52,211,153,0.3)] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              [ZERO-TRUST ESP32 MCU]
            </div>
            <div className="w-0.5 h-3 bg-emerald-400 mx-auto"></div>
          </div>
        )}

        {/* OVERLAY ANCHORED CALLOUT READOUT STRIP */}
        <div className="absolute top-3 left-3 right-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pointer-events-none z-10 font-mono">
          {/* Card 1: Optical Matrix */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm backdrop-blur-md flex flex-col justify-between h-[76px] shadow-md transition-colors">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-[#30d158] shrink-0" />
              <span className="truncate">Beam Matrix</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-white font-mono tracking-tight leading-none">
                {state.opticalPathIntactnessPct.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">%</span>
            </div>
            <div className="text-[10px] font-extrabold font-mono tracking-wide">
              <span className={state.isSimulatingBeamBreak ? 'text-[#ff453a]' : 'text-[#30d158]'}>
                {state.isSimulatingBeamBreak ? 'ZONE_A5 BROKEN' : '8/8 SECURE'}
              </span>
            </div>
          </div>

          {/* Card 2: Actuation Servo Angle */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm backdrop-blur-md flex flex-col justify-between h-[76px] shadow-md transition-colors">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#ff9f0a] shrink-0" />
              <span className="truncate">Servo Position</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-white font-mono tracking-tight leading-none">
                {state.servoAngle.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">°</span>
            </div>
            <div className="text-[10px] font-extrabold font-mono tracking-wide">
              <span className={state.servoAngle > 10 ? 'text-[#ff9f0a]' : 'text-slate-400'}>
                {state.servoAngle > 10 ? 'ACTUATED AIR-GAP' : 'LOCKED CLOSED'}
              </span>
            </div>
          </div>

          {/* Card 3: Disconnect Feed */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm backdrop-blur-md flex flex-col justify-between h-[76px] shadow-md transition-colors">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-[#ff453a] shrink-0" />
              <span className="truncate">Isolation Terminal</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-white font-mono tracking-tight leading-none">
                GRID_A1
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">FEED</span>
            </div>
            <div className="text-[10px] font-extrabold font-mono tracking-wide text-slate-400">
              PHYSICAL RELAY
            </div>
          </div>

          {/* Card 4: ESP32 Hardware Latency */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm backdrop-blur-md flex flex-col justify-between h-[76px] shadow-md transition-colors">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">Node Latency</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-white font-mono tracking-tight leading-none">
                {state.pingLatencyMs}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">ms</span>
            </div>
            <div className="text-[10px] font-extrabold font-mono tracking-wide text-sky-400">
              GPIO 14 / 18
            </div>
          </div>
        </div>

        {/* OVERLAY ACTION SIMULATION BUTTONS */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10 font-mono text-xs">
          <button
            onClick={onSimulateCyberAttack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/90 hover:bg-red-900 border border-red-600 text-red-300 rounded font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-red-400" />
            SIMULATE CYBER ATTACK (MODBUS)
          </button>

          <button
            onClick={onSimulateBeamBreak}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold shadow-lg transition-transform active:scale-95 cursor-pointer border ${
              state.isSimulatingBeamBreak
                ? 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-600 text-emerald-300'
                : 'bg-amber-950/90 hover:bg-amber-900 border-amber-600 text-amber-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {state.isSimulatingBeamBreak ? 'RESTORE IR BEAM' : 'TRIP IR BEAM (BREAK)'}
          </button>
        </div>

        {/* MOUSE DRAG ROTATE HINT */}
        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-500 pointer-events-none select-none">
          ⚡ Hold Mouse Drag to Orbit • Scroll to Zoom
        </div>
      </div>
    </section>
  );
};
