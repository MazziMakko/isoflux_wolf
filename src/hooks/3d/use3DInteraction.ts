'use client';

import { useState, useCallback, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function use3DInteraction() {
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const { raycaster, camera, scene } = useThree();
  const mouse = useRef(new THREE.Vector2());

  const handlePointerMove = useCallback((event: PointerEvent) => {
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }, []);

  const handleClick = useCallback(() => {
    raycaster.setFromCamera(mouse.current, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      setSelectedObject(object.uuid);
    } else {
      setSelectedObject(null);
    }
  }, [raycaster, camera, scene]);

  useFrame(() => {
    raycaster.setFromCamera(mouse.current, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.uuid !== hoveredObject) {
        setHoveredObject(object.uuid);
      }
    } else if (hoveredObject) {
      setHoveredObject(null);
    }
  });

  return {
    hoveredObject,
    selectedObject,
    handlePointerMove,
    handleClick,
  };
}
