'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, type RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

interface Draggable3DObjectProps {
  position?: [number, number, number];
  shape?: 'box' | 'sphere' | 'cylinder';
  size?: number;
  color?: string;
  mass?: number;
  restitution?: number;
  friction?: number;
  enableGravity?: boolean;
  onDragStart?: () => void;
  onDrag?: (position: THREE.Vector3) => void;
  onDragEnd?: () => void;
}

/**
 * Draggable3DObject Component
 * 
 * An interactive 3D object that can be clicked and dragged with realistic physics.
 * Uses Rapier physics engine for accurate collision and movement.
 * 
 * Features:
 * - Click to grab
 * - Drag to move
 * - Realistic physics interactions
 * - Multiple shape options
 * - Customizable material properties
 * - Performance optimized
 * 
 * @param position - Initial position [x, y, z]
 * @param shape - Object shape ('box' | 'sphere' | 'cylinder')
 * @param size - Object size (default: 1)
 * @param color - Object color (default: '#4FC3F7')
 * @param mass - Object mass for physics (default: 1)
 * @param restitution - Bounciness (0-1, default: 0.7)
 * @param friction - Surface friction (default: 0.3)
 * @param enableGravity - Enable gravity (default: true)
 * @param onDragStart - Callback when drag starts
 * @param onDrag - Callback during drag with current position
 * @param onDragEnd - Callback when drag ends
 * 
 * @example
 * ```tsx
 * <Draggable3DObject
 *   position={[0, 5, 0]}
 *   shape="sphere"
 *   size={1.5}
 *   color="#7C4DFF"
 *   onDragStart={() => console.log('Started dragging')}
 * />
 * ```
 */
export default function Draggable3DObject({
  position = [0, 5, 0],
  shape = 'box',
  size = 1,
  color = '#4FC3F7',
  mass = 1,
  restitution = 0.7,
  friction = 0.3,
  enableGravity = true,
  onDragStart,
  onDrag,
  onDragEnd,
}: Draggable3DObjectProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { camera, raycaster, mouse, gl } = useThree();

  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const dragPointRef = useRef(new THREE.Vector3());
  const dragOffsetRef = useRef(new THREE.Vector3());

  // Handle drag logic
  useFrame(() => {
    if (isDragging && rigidBodyRef.current) {
      // Update raycaster
      raycaster.setFromCamera(mouse, camera);

      // Get intersection with drag plane
      raycaster.ray.intersectPlane(dragPlaneRef.current, dragPointRef.current);

      // Calculate new position
      const newPosition = new THREE.Vector3().copy(dragPointRef.current).sub(dragOffsetRef.current);

      // Update rigid body position
      rigidBodyRef.current.setTranslation(newPosition, true);

      // Reset velocities for smooth dragging
      rigidBodyRef.current.setLinvel(new THREE.Vector3(0, 0, 0), true);
      rigidBodyRef.current.setAngvel(new THREE.Vector3(0, 0, 0), true);

      // Call drag callback
      if (onDrag) {
        onDrag(newPosition);
      }
    }
  });

  const handlePointerDown = (event: THREE.Event) => {
    event.stopPropagation();

    if (!rigidBodyRef.current) return;

    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';

    // Get current position
    const currentPosition = rigidBodyRef.current.translation();
    const worldPosition = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z);

    // Setup drag plane
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    dragPlaneRef.current.setFromNormalAndCoplanarPoint(cameraDirection, worldPosition);

    // Calculate drag offset
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(dragPlaneRef.current, dragPointRef.current);
    dragOffsetRef.current.copy(dragPointRef.current).sub(worldPosition);

    // Disable gravity while dragging
    if (rigidBodyRef.current && enableGravity) {
      rigidBodyRef.current.setGravityScale(0, true);
    }

    if (onDragStart) {
      onDragStart();
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      gl.domElement.style.cursor = hovered ? 'grab' : 'auto';

      // Re-enable gravity
      if (rigidBodyRef.current && enableGravity) {
        rigidBodyRef.current.setGravityScale(1, true);
      }

      if (onDragEnd) {
        onDragEnd();
      }
    }
  };

  const handlePointerOver = () => {
    if (!isDragging) {
      setHovered(true);
      gl.domElement.style.cursor = 'grab';
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (!isDragging) {
      gl.domElement.style.cursor = 'auto';
    }
  };

  // Render appropriate geometry
  const renderGeometry = () => {
    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[size, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[size, size, size * 2, 32]} />;
      case 'box':
      default:
        return <boxGeometry args={[size, size, size]} />;
    }
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      mass={mass}
      restitution={restitution}
      friction={friction}
      gravityScale={enableGravity ? 1 : 0}
      colliders="cuboid"
    >
      <mesh
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={color}
          emissive={hovered || isDragging ? color : '#000000'}
          emissiveIntensity={hovered || isDragging ? 0.3 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </RigidBody>
  );
}

/**
 * DraggableObjectGroup Component
 * 
 * Group of draggable objects with different shapes and colors.
 * 
 * @example
 * ```tsx
 * <DraggableObjectGroup count={5} />
 * ```
 */
interface DraggableObjectGroupProps {
  count?: number;
  colors?: string[];
}

export function DraggableObjectGroup({
  count = 3,
  colors = ['#4FC3F7', '#7C4DFF', '#FF4081'],
}: DraggableObjectGroupProps) {
  const shapes: Array<'box' | 'sphere' | 'cylinder'> = ['box', 'sphere', 'cylinder'];

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Draggable3DObject
            key={i}
            position={[x, 5 + i * 2, z]}
            shape={shapes[i % shapes.length]}
            size={0.8}
            color={colors[i % colors.length]}
            mass={1 + i * 0.5}
          />
        );
      })}
    </>
  );
}
