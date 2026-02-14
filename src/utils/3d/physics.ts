import * as THREE from 'three';

/**
 * Physics utilities for 3D interactions
 */

export const PHYSICS_CONFIG = {
  gravity: -9.81,
  timeStep: 1 / 60,
  defaultMass: 1,
  defaultRestitution: 0.7, // Bounciness
  defaultFriction: 0.3,
} as const;

/**
 * Calculate bounce velocity after collision
 */
export function calculateBounceVelocity(
  velocity: THREE.Vector3,
  normal: THREE.Vector3,
  restitution: number = PHYSICS_CONFIG.defaultRestitution
): THREE.Vector3 {
  const dot = velocity.dot(normal);
  const reflectedVelocity = velocity.clone().sub(
    normal.clone().multiplyScalar(2 * dot)
  );
  return reflectedVelocity.multiplyScalar(restitution);
}

/**
 * Apply gravity to velocity
 */
export function applyGravity(
  velocity: THREE.Vector3,
  deltaTime: number,
  gravity: number = PHYSICS_CONFIG.gravity
): THREE.Vector3 {
  return velocity.clone().add(new THREE.Vector3(0, gravity * deltaTime, 0));
}

/**
 * Calculate drag force
 */
export function calculateDrag(
  velocity: THREE.Vector3,
  dragCoefficient: number = 0.1
): THREE.Vector3 {
  return velocity.clone().multiplyScalar(-dragCoefficient);
}

/**
 * Check sphere collision
 */
export function checkSphereCollision(
  pos1: THREE.Vector3,
  radius1: number,
  pos2: THREE.Vector3,
  radius2: number
): boolean {
  const distance = pos1.distanceTo(pos2);
  return distance < radius1 + radius2;
}

/**
 * Calculate collision normal between two spheres
 */
export function getCollisionNormal(
  pos1: THREE.Vector3,
  pos2: THREE.Vector3
): THREE.Vector3 {
  return pos1.clone().sub(pos2).normalize();
}

/**
 * Constrain position within bounds
 */
export function constrainToBounds(
  position: THREE.Vector3,
  bounds: { min: THREE.Vector3; max: THREE.Vector3 }
): THREE.Vector3 {
  return new THREE.Vector3(
    THREE.MathUtils.clamp(position.x, bounds.min.x, bounds.max.x),
    THREE.MathUtils.clamp(position.y, bounds.min.y, bounds.max.y),
    THREE.MathUtils.clamp(position.z, bounds.min.z, bounds.max.z)
  );
}

/**
 * Calculate impulse for collision response
 */
export function calculateImpulse(
  velocity1: THREE.Vector3,
  velocity2: THREE.Vector3,
  mass1: number,
  mass2: number,
  restitution: number
): { impulse1: THREE.Vector3; impulse2: THREE.Vector3 } {
  const relativeVelocity = velocity1.clone().sub(velocity2);
  
  const impulse = relativeVelocity
    .multiplyScalar(-(1 + restitution))
    .divideScalar(1 / mass1 + 1 / mass2);

  return {
    impulse1: impulse.clone().divideScalar(mass1),
    impulse2: impulse.clone().divideScalar(-mass2),
  };
}
