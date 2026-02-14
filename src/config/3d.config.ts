/**
 * 3D Scene Configuration
 */

export const SCENE_CONFIG = {
  camera: {
    fov: 50,
    position: [0, 2, 10] as [number, number, number],
    near: 0.1,
    far: 1000,
  },
  renderer: {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' as const,
    dpr: [1, 2] as [number, number],
  },
  controls: {
    enableDamping: true,
    dampingFactor: 0.05,
    rotateSpeed: 0.5,
    enableZoom: true,
    enablePan: false,
    minDistance: 5,
    maxDistance: 20,
    maxPolarAngle: Math.PI / 2,
  },
  lighting: {
    ambient: {
      intensity: 0.3,
      color: '#ffffff',
    },
    directional: {
      intensity: 1.5,
      position: [10, 10, 5] as [number, number, number],
      castShadow: true,
    },
    point1: {
      intensity: 0.5,
      position: [-10, -10, -5] as [number, number, number],
      color: '#4FC3F7',
    },
    point2: {
      intensity: 0.5,
      position: [10, 10, 10] as [number, number, number],
      color: '#7C4DFF',
    },
  },
  shadows: {
    enabled: true,
    type: 'PCFSoftShadowMap' as const,
    mapSize: [2048, 2048] as [number, number],
  },
  performance: {
    maxDeltaTime: 0.1,
    targetFPS: 60,
    adaptiveRendering: true,
  },
} as const;

export const PHYSICS_CONFIG = {
  gravity: [0, -2, 0] as [number, number, number],
  timeStep: 1 / 60,
  debug: false,
  colliders: {
    ground: {
      restitution: 0.7,
      friction: 0.3,
    },
    default: {
      mass: 1,
      restitution: 0.5,
      friction: 0.5,
      linearDamping: 0.5,
      angularDamping: 0.5,
    },
  },
} as const;

export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
  },
  easing: {
    default: 'power2.out',
    elastic: 'elastic.out(1, 0.3)',
    bounce: 'bounce.out',
    smooth: 'power2.inOut',
  },
} as const;

export const COLORS = {
  primary: '#4FC3F7',
  secondary: '#7C4DFF',
  accent: '#FF4081',
  background: '#0a0a1e',
  text: '#ffffff',
  textSecondary: '#aaaaaa',
} as const;
