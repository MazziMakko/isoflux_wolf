'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import Scene from './Scene';
import Loader from '../shared/Loader';

export default function Canvas3D() {
  return (
    <div className="w-full h-screen fixed top-0 left-0 -z-10">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        shadows
      >
        {/* Camera setup */}
        <PerspectiveCamera
          makeDefault
          position={[0, 2, 10]}
          fov={50}
        />

        {/* Suspense for lazy loading */}
        <Suspense fallback={null}>
          {/* Physics world */}
          <Physics gravity={[0, -2, 0]}>
            <Scene />
          </Physics>

          {/* Stars background */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0.5}
            fade
            speed={1}
          />

          {/* Camera controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            enableZoom={true}
            enablePan={false}
            minDistance={5}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* 3D Loader */}
      <Loader />
    </div>
  );
}
