# IsoFlux 3D Graphics System

## 🎨 Overview

IsoFlux features a stunning 3D frontend built with cutting-edge web graphics technologies, providing an immersive experience for financial compliance visualization.

---

## 🏗️ Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with Suspense and concurrent features
- **TypeScript** - Full type safety

### 3D Graphics
- **Three.js** - WebGL rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers (OrbitControls, Environment, Float, etc.)

### Physics Engine
- **@react-three/rapier** - High-performance WASM-based physics
- **cannon-es** - JavaScript physics engine (fallback)

### Animation
- **GSAP** - Professional-grade animation library
- **Framer Motion** - React animation library for UI

### Performance Tools
- **Leva** - GUI controls for real-time tweaking
- **Stats.js** - FPS monitoring
- **r3f-perf** - React Three Fiber performance monitoring

---

## 📁 Project Structure

```
src/
├── components/
│   ├── 3d/
│   │   ├── Scene.tsx                 # Main 3D scene
│   │   ├── Canvas3D.tsx              # Canvas wrapper with config
│   │   ├── objects/
│   │   │   ├── FloatingLogo.tsx      # IsoFlux logo with animation
│   │   │   └── GeometricGrid.tsx     # Animated grid floor
│   │   └── effects/
│   │       └── ParticleField.tsx     # Particle system
│   ├── ui/
│   │   └── (2D UI components)
│   └── shared/
│       └── Loader.tsx                # 3D loading component
├── hooks/
│   └── 3d/
│       ├── use3DInteraction.ts       # Raycasting and interaction
│       ├── usePhysics.ts             # Physics helpers
│       └── useGSAPAnimation.ts       # GSAP animation hooks
├── utils/
│   └── 3d/
│       ├── physics.ts                # Physics calculations
│       └── math.ts                   # Math utilities
├── config/
│   └── 3d.config.ts                  # 3D scene configuration
├── assets/
│   ├── models/                       # 3D models (.glb, .gltf)
│   ├── textures/                     # Textures and images
│   └── fonts/                        # 3D fonts
└── app/
    └── experience/
        └── page.tsx                  # 3D experience page
```

---

## 🚀 Getting Started

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install --legacy-peer-deps
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

### Accessing the 3D Experience

Navigate to: **http://localhost:3000/experience**

---

## 🎯 Key Components

### Canvas3D

Main canvas wrapper that sets up the 3D environment.

```tsx
import Canvas3D from '@/components/3d/Canvas3D';

export default function Page() {
  return <Canvas3D />;
}
```

**Features:**
- Automatic camera setup
- OrbitControls for navigation
- Physics world integration
- Performance optimization
- Suspense fallback

---

### Scene

Core 3D scene with all objects and lighting.

**Key Features:**
- Responsive to mouse movement
- Dynamic lighting setup
- Environment mapping
- Contact shadows

---

### FloatingLogo

IsoFlux logo with interactive 3D effects.

**Features:**
- Textured plane with logo
- Geometric frame
- Glow rings
- 3D text labels
- Hover effects
- Smooth rotation

**Usage:**
```tsx
<FloatingLogo position={[0, 1, 0]} />
```

---

### GeometricGrid

Animated geometric grid floor with custom shaders.

**Features:**
- Custom shader material
- Animated gradient pattern
- Grid lines
- Geometric accent shapes
- Time-based animation

**Usage:**
```tsx
<GeometricGrid position={[0, -2, 0]} />
```

---

### ParticleField

Particle system for atmospheric effects.

**Features:**
- 1000+ particles
- Color interpolation
- Animated floating motion
- Additive blending
- Sphere distribution

**Usage:**
```tsx
<ParticleField count={1000} />
```

---

## 🎨 Custom Hooks

### use3DInteraction

Handle raycasting and object interaction.

```typescript
import { use3DInteraction } from '@/hooks/3d/use3DInteraction';

const { hoveredObject, selectedObject, handlePointerMove, handleClick } = use3DInteraction();
```

**Returns:**
- `hoveredObject` - UUID of hovered object
- `selectedObject` - UUID of selected object
- `handlePointerMove` - Pointer move handler
- `handleClick` - Click handler

---

### usePhysics

Physics-based interactions.

```typescript
import { usePhysics } from '@/hooks/3d/usePhysics';

const { rigidBodyRef, applyImpulse, applyForce, setVelocity, reset } = usePhysics({
  mass: 1,
  restitution: 0.7,
  friction: 0.3,
});
```

**Options:**
- `mass` - Object mass
- `restitution` - Bounciness (0-1)
- `friction` - Surface friction
- `linearDamping` - Linear velocity damping
- `angularDamping` - Angular velocity damping

---

### useGSAPAnimation

GSAP-powered animations.

```typescript
import { useGSAPAnimation } from '@/hooks/3d/useGSAPAnimation';

const { animatePosition, animateRotation, animateScale, createTimeline } = useGSAPAnimation();

// Animate position
animatePosition(object, new THREE.Vector3(0, 5, 0), {
  duration: 1,
  ease: 'power2.out',
});
```

---

## 🛠️ Utilities

### Physics Utils

```typescript
import { calculateBounceVelocity, applyGravity, checkSphereCollision } from '@/utils/3d/physics';

// Calculate bounce
const newVelocity = calculateBounceVelocity(velocity, normal, 0.7);

// Apply gravity
const gravityVelocity = applyGravity(velocity, deltaTime);

// Check collision
if (checkSphereCollision(pos1, radius1, pos2, radius2)) {
  // Handle collision
}
```

### Math Utils

```typescript
import { lerp, smoothstep, mapRange, randomRange, Easing } from '@/utils/3d/math';

// Smooth interpolation
const value = smoothstep(0, 1, t);

// Map range
const mapped = mapRange(value, 0, 100, 0, 1);

// Random in range
const random = randomRange(0, 10);

// Easing functions
const eased = Easing.easeOutBounce(t);
```

---

## ⚙️ Configuration

All 3D configuration is centralized in `src/config/3d.config.ts`:

```typescript
import { SCENE_CONFIG, PHYSICS_CONFIG, ANIMATION_CONFIG, COLORS } from '@/config/3d.config';

// Camera settings
const { fov, position, near, far } = SCENE_CONFIG.camera;

// Physics settings
const { gravity, colliders } = PHYSICS_CONFIG;

// Animation durations
const { fast, normal, slow } = ANIMATION_CONFIG.duration;

// Brand colors
const { primary, secondary } = COLORS;
```

---

## 🎨 Styling

### Glass Morphism

Use the `.glass-card` class for glassmorphic UI:

```tsx
<div className="glass-card p-6">
  Content with glass effect
</div>
```

### Gradient Text

```tsx
<h1 className="gradient-text">
  Gradient Text
</h1>
```

### Custom Animations

```css
/* Float animation */
.animate-float

/* Pulse glow */
.animate-pulse-glow

/* Gradient shift */
.animate-gradient
```

---

## 📈 Performance Optimization

### Best Practices

1. **Use Instanced Rendering** for repeated objects
2. **Implement LOD** (Level of Detail) for complex models
3. **Enable Frustum Culling** (automatic in Three.js)
4. **Optimize Textures** (compress, use power-of-2 sizes)
5. **Lazy Load Models** with React Suspense
6. **Use useFrame Sparingly** (only when needed)
7. **Memoize Geometries** with useMemo
8. **Enable Shadows Selectively** (only on key objects)

### Performance Monitoring

```tsx
import { Perf } from 'r3f-perf';
import Stats from 'stats.js';

// In development
{process.env.NODE_ENV === 'development' && (
  <>
    <Perf position="top-left" />
    <Stats />
  </>
)}
```

---

## 🎮 Controls

### Default Navigation

- **Left Click + Drag** - Rotate camera
- **Right Click + Drag** - Pan camera (disabled by default)
- **Scroll Wheel** - Zoom in/out
- **Touch** - Pinch to zoom, drag to rotate

### Customization

Modify in `src/components/3d/Canvas3D.tsx`:

```tsx
<OrbitControls
  enableDamping={true}
  dampingFactor={0.05}
  rotateSpeed={0.5}
  enableZoom={true}
  enablePan={false}
  minDistance={5}
  maxDistance={20}
/>
```

---

## 🔧 Adding New 3D Objects

### Step 1: Create Component

```tsx
// src/components/3d/objects/MyObject.tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function MyObject({ position = [0, 0, 0] }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4FC3F7" />
    </mesh>
  );
}
```

### Step 2: Add to Scene

```tsx
// src/components/3d/Scene.tsx
import MyObject from './objects/MyObject';

<MyObject position={[2, 0, 0]} />
```

---

## 🎨 Custom Shaders

Example of custom shader material:

```tsx
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
    vec3 color = vec3(vUv.x, vUv.y, sin(uTime));
    gl_FragColor = vec4(color, 1.0);
  }
`;

<shaderMaterial
  vertexShader={vertexShader}
  fragmentShader={fragmentShader}
  uniforms={{
    uTime: { value: 0 },
  }}
/>
```

---

## 🏆 Examples

### Bouncing Object with Physics

```tsx
import { RigidBody } from '@react-three/rapier';

<RigidBody
  position={[0, 5, 0]}
  restitution={0.9}
  friction={0.1}
>
  <mesh>
    <sphereGeometry args={[0.5]} />
    <meshStandardMaterial color="#4FC3F7" />
  </mesh>
</RigidBody>
```

### Animated Camera Movement

```tsx
import { useGSAPAnimation } from '@/hooks/3d/useGSAPAnimation';
import { useThree } from '@react-three/fiber';

const { camera } = useThree();
const { animatePosition } = useGSAPAnimation();

// Move camera
animatePosition(camera, new THREE.Vector3(10, 5, 10), {
  duration: 2,
  ease: 'power2.inOut',
});
```

### Interactive Hover Effect

```tsx
const [hovered, setHovered] = useState(false);

<mesh
  onPointerOver={() => setHovered(true)}
  onPointerOut={() => setHovered(false)}
>
  <boxGeometry />
  <meshStandardMaterial
    color={hovered ? '#7C4DFF' : '#4FC3F7'}
    emissive={hovered ? '#7C4DFF' : '#000000'}
    emissiveIntensity={hovered ? 0.5 : 0}
  />
</mesh>
```

---

## 🐛 Troubleshooting

### Canvas not rendering

- Check WebGL support: https://get.webgl.org/
- Verify browser compatibility
- Check console for errors
- Ensure components are client-side (`'use client'`)

### Poor performance

- Enable Stats.js to monitor FPS
- Reduce particle count
- Disable shadows
- Lower renderer DPR
- Use simpler geometries

### Build errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm install --legacy-peer-deps`
- Check TypeScript errors: `npm run type-check`

---

## 📚 Resources

### Documentation
- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [React Three Drei](https://github.com/pmndrs/drei)
- [Rapier Physics](https://rapier.rs/)
- [GSAP Docs](https://greensock.com/docs/)

### Learning
- [Three.js Journey](https://threejs-journey.com/)
- [R3F Examples](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)
- [GSAP Showcase](https://greensock.com/showcase/)

### Tools
- [glTF Viewer](https://gltf-viewer.donmccurdy.com/)
- [Texture Packer](https://www.codeandweb.com/texturepacker)
- [Sketchfab](https://sketchfab.com/) - Free 3D models

---

## ✨ Features Implemented

- ✅ 3D IsoFlux logo with hover effects
- ✅ Animated geometric grid
- ✅ Particle system (1000+ particles)
- ✅ Physics engine integration
- ✅ GSAP animations
- ✅ Custom hooks for interaction
- ✅ Performance optimizations
- ✅ Responsive camera controls
- ✅ Glass morphism UI
- ✅ Loading states
- ✅ Brand color integration

---

## 🚧 Future Enhancements

- [ ] 3D data visualizations for transactions
- [ ] Interactive compliance flow diagram
- [ ] Real-time transaction particles
- [ ] VR/AR support
- [ ] Custom 3D models for financial entities
- [ ] Advanced post-processing effects
- [ ] Sound effects and spatial audio
- [ ] Mobile optimization

---

**Built with**: The Architect (Project Scaffolding Agent)  
**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Experience URL**: https://www.isoflux.app/experience
