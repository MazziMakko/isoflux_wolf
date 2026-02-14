'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import Draggable3DObject from '@/components/3d/objects/Draggable3DObject';

export default function DraggableScene() {
  return (
    <div className="w-full h-96 bg-black/30 rounded-lg overflow-hidden">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />

        <Physics gravity={[0, -9.81, 0]}>
          {/* Ground plane */}
          <RigidBody type="fixed" restitution={0.5} friction={0.8}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#1a1a2e" />
            </mesh>
          </RigidBody>

          {/* Walls */}
          <RigidBody type="fixed">
            <mesh position={[0, 2, -5]}>
              <boxGeometry args={[20, 4, 0.1]} />
              <meshStandardMaterial color="#2a2a3e" transparent opacity={0.3} />
            </mesh>
          </RigidBody>

          {/* Draggable objects */}
          <Draggable3DObject
            position={[-2, 5, 0]}
            shape="box"
            size={1}
            color="#4FC3F7"
            mass={1}
          />

          <Draggable3DObject
            position={[0, 7, 0]}
            shape="sphere"
            size={1.2}
            color="#7C4DFF"
            mass={1.5}
            restitution={0.9}
          />

          <Draggable3DObject
            position={[2, 6, 0]}
            shape="cylinder"
            size={0.8}
            color="#FF4081"
            mass={0.8}
          />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-5, 5, 5]} intensity={0.5} color="#4FC3F7" />
          <pointLight position={[5, 5, -5]} intensity={0.5} color="#7C4DFF" />
        </Physics>

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
