'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
}

export default function ParticleField({ count = 1000 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  // Generate particle positions
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create particles in a sphere around the scene
      const radius = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, [count]);

  // Generate particle colors
  const particlesColor = useMemo(() => {
    const colors = new Float32Array(count * 3);
    const color1 = new THREE.Color('#4FC3F7'); // Cyan
    const color2 = new THREE.Color('#7C4DFF'); // Purple
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const mixedColor = color1.clone().lerp(color2, Math.random());
      
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    
    return colors;
  }, [count]);

  // Animate particles
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      // Gentle floating motion
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const time = state.clock.elapsedTime;
        
        // Add wave motion
        positions[i3 + 1] += Math.sin(time + i) * 0.001;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesColor.length / 3}
          array={particlesColor}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
