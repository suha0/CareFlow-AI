
import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function AnatomicalHeart() {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/heart.glb');

  const heart = useMemo(() => {
    const model = scene.clone(true);

    // Calculate the actual dimensions of the downloaded model.
    model.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());

    // Scale the heart to fit the 3D canvas.
    const scale = 2.8 / size.y;

    model.scale.setScalar(scale);
    model.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale
    );

    // Apply translucent holographic material.
    model.traverse((child) => {
      if (!child.isMesh) return;

      child.material = new THREE.MeshPhysicalMaterial({
  color: '#087da5',
emissive: '#004b70',
emissiveIntensity: 0.65,
metalness: 0.15,
roughness: 0.4,
transparent: true,
opacity: 0.20,
side: THREE.DoubleSide,
depthWrite: false,
});

      child.castShadow = false;
      child.receiveShadow = false;
    });

    return model;
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y += delta * 0.16;

    const beat =
      1 + Math.pow(
        Math.max(0, Math.sin(state.clock.elapsedTime * 2.5)),
        10
      ) * 0.018;

    groupRef.current.scale.setScalar(beat);
  });

  return (
    <group ref={groupRef}>
      <primitive object={heart} />
    </group>
  );
}

export default function Heart3D() {
  return (
    <div className="heart-3d-container">
  <div className="heart-3d-glow" />

  <svg
    className="heart-ecg"
    viewBox="0 0 600 100"
    preserveAspectRatio="none"
  >
    <defs>
      <filter id="ecgGlow">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <path
  className="ecg-line"
  pathLength="1000"
  d="M0 50 H155 L175 50 L190 42 L205 58 L225 5 L248 88 L270 50 H330 L350 50 L365 42 L380 58 L400 5 L423 88 L445 50 H600"
/>
  </svg>

      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.8} />

<pointLight
  position={[3, 3, 4]}
  color="#24dfff"
  intensity={8}
/>

<pointLight
  position={[-3, -2, 2]}
  color="#167bff"
  intensity={6}
/>

<pointLight
  position={[0, 2, -3]}
  color="#54eaff"
  intensity={4}
/>

        <Suspense fallback={null}>
          <AnatomicalHeart />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/heart.glb');
