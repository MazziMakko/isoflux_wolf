'use client';

import { useRef } from 'react';
import { type RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

interface PhysicsOptions {
  mass?: number;
  restitution?: number;
  friction?: number;
  linearDamping?: number;
  angularDamping?: number;
}

export function usePhysics(_options: PhysicsOptions = {}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  const applyImpulse = (impulse: THREE.Vector3) => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.applyImpulse(impulse, true);
    }
  };

  const applyForce = (force: THREE.Vector3) => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.applyForce(force, true);
    }
  };

  const setVelocity = (velocity: THREE.Vector3) => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setLinvel(velocity, true);
    }
  };

  const reset = (position: THREE.Vector3) => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation(position, true);
      rigidBodyRef.current.setLinvel(new THREE.Vector3(0, 0, 0), true);
      rigidBodyRef.current.setAngvel(new THREE.Vector3(0, 0, 0), true);
    }
  };

  return {
    rigidBodyRef,
    applyImpulse,
    applyForce,
    setVelocity,
    reset,
  };
}
