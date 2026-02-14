'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingLogoProps {
  position?: [number, number, number];
}

export default function FloatingLogo({ position = [0, 0, 0] }: FloatingLogoProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // Load logo as texture
  const logoTexture = useTexture('/branding/isoflux-logo.png');

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += delta * 0.2;
      
      // Pulse effect on hover
      const scale = hovered ? 1.1 : 1.0;
      meshRef.current.scale.lerp(
        new THREE.Vector3(scale, scale, scale),
        0.1
      );
    }
  });

  return (
    <group position={position}>
      {/* Logo plane with texture */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial
          map={logoTexture}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          emissive="#4FC3F7"
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Geometric frame around logo */}
      <mesh position={[0, 0, -0.1]}>
        <ringGeometry args={[2.2, 2.4, 64]} />
        <meshStandardMaterial
          color="#7C4DFF"
          emissive="#7C4DFF"
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh position={[0, 0, -0.15]}>
        <ringGeometry args={[2.5, 2.55, 64]} />
        <meshBasicMaterial
          color="#4FC3F7"
          transparent
          opacity={hovered ? 0.6 : 0.3}
        />
      </mesh>

      {/* IsoFlux text below logo */}
      <Center position={[0, -2.5, 0]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.4}
          height={0.1}
          curveSegments={12}
        >
          ISOFLUX
          <meshStandardMaterial
            color="#ffffff"
            emissive="#4FC3F7"
            emissiveIntensity={0.2}
            metalness={0.9}
            roughness={0.1}
          />
        </Text3D>
      </Center>

      {/* Subtitle */}
      <Center position={[0, -3.2, 0]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.15}
          height={0.05}
          curveSegments={8}
        >
          THE GEOMETRY OF VALUE
          <meshStandardMaterial
            color="#aaaaaa"
            emissive="#7C4DFF"
            emissiveIntensity={0.1}
          />
        </Text3D>
      </Center>
    </group>
  );
}
