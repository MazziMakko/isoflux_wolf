'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GeometricGridProps {
  position?: [number, number, number];
}

export default function GeometricGrid({ position = [0, 0, 0] }: GeometricGridProps) {
  const gridRef = useRef<THREE.GridHelper>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame((state) => {
    if (materialRef.current) {
      // Animated gradient effect
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Custom shader for animated grid
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;
    
    void main() {
      // Create geometric pattern
      vec2 pos = vUv * 20.0;
      float pattern = sin(pos.x + uTime * 0.5) * sin(pos.y + uTime * 0.3);
      
      // Color gradient
      vec3 color1 = vec3(0.31, 0.76, 0.97); // #4FC3F7
      vec3 color2 = vec3(0.49, 0.30, 1.0);  // #7C4DFF
      vec3 finalColor = mix(color1, color2, pattern * 0.5 + 0.5);
      
      // Add grid lines
      float grid = smoothstep(0.95, 1.0, max(
        abs(fract(pos.x) - 0.5) * 2.0,
        abs(fract(pos.y) - 0.5) * 2.0
      ));
      
      gl_FragColor = vec4(finalColor * grid, grid * 0.3);
    }
  `;

  return (
    <group position={position}>
      {/* Animated geometric plane */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[20, 20, 50, 50]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTime: { value: 0 },
          }}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Static grid helper for reference */}
      <gridHelper
        ref={gridRef}
        args={[20, 20, '#4FC3F7', '#7C4DFF']}
        position={[0, 0.01, 0]}
      />

      {/* Geometric accent shapes */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh key={i} position={[x, 0.1, z]} rotation-y={angle}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial
              color="#4FC3F7"
              emissive="#7C4DFF"
              emissiveIntensity={0.3}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}
