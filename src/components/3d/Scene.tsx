'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import FloatingLogo from './objects/FloatingLogo';
import GeometricGrid from './objects/GeometricGrid';
import ParticleField from './effects/ParticleField';

export default function Scene() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    // Subtle camera movement following mouse
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        state.mouse.x * 0.1,
        0.02
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        state.mouse.y * 0.05,
        0.02
      );
    }
  });

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4FC3F7" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#7C4DFF" />

      {/* Environment and backdrop */}
      <Environment preset="city" />
      
      {/* Main scene group */}
      <group ref={groupRef}>
        {/* IsoFlux Logo (floating and rotating) */}
        <Float
          speed={1.5}
          rotationIntensity={0.3}
          floatIntensity={0.5}
        >
          <FloatingLogo position={[0, 1, 0]} />
        </Float>

        {/* Geometric grid floor */}
        <GeometricGrid position={[0, -2, 0]} />

        {/* Particle field for atmosphere */}
        <ParticleField count={1000} />
      </group>

      {/* Contact shadows for realism */}
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />
    </>
  );
}
