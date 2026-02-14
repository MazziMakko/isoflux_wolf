# IsoFlux 3D System - Quick Start

## 🚀 5-Minute Setup

### 1. Dependencies (Already Installed ✅)

All required packages are installed:
- Three.js
- @react-three/fiber
- @react-three/drei
- @react-three/rapier
- GSAP
- Framer Motion

### 2. View the 3D Experience

```bash
# Start development server
npm run dev

# Navigate to
http://localhost:3000/experience
```

### 3. Project Structure

```
src/components/3d/        # All 3D components
src/hooks/3d/             # Custom 3D hooks
src/utils/3d/             # Physics and math utilities
src/config/3d.config.ts   # Configuration
public/branding/          # IsoFlux logo
```

---

## 🎯 Key Files

### Main Entry Points

1. **Experience Page**: `src/app/experience/page.tsx`
   - Immersive 3D landing page
   - IsoFlux branding showcase

2. **3D Canvas**: `src/components/3d/Canvas3D.tsx`
   - Main canvas wrapper
   - Camera and controls setup

3. **Scene**: `src/components/3d/Scene.tsx`
   - Core 3D scene
   - All objects and lighting

### Core Components

- **FloatingLogo** - IsoFlux logo with effects
- **GeometricGrid** - Animated floor grid
- **ParticleField** - Atmospheric particles
- **Loader** - 3D loading component

---

## 🎨 Quick Examples

### Add a New 3D Object

```tsx
// src/components/3d/objects/MyShape.tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function MyShape() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4FC3F7" />
    </mesh>
  );
}
```

Then add to `Scene.tsx`:

```tsx
import MyShape from './objects/MyShape';

<MyShape />
```

---

### Add Physics

```tsx
import { RigidBody } from '@react-three/rapier';

<RigidBody position={[0, 5, 0]} restitution={0.9}>
  <mesh>
    <sphereGeometry args={[0.5]} />
    <meshStandardMaterial color="#7C4DFF" />
  </mesh>
</RigidBody>
```

---

### Animate with GSAP

```tsx
import { useGSAPAnimation } from '@/hooks/3d/useGSAPAnimation';

const { animatePosition } = useGSAPAnimation();

// In a useEffect or event handler
animatePosition(objectRef.current, new THREE.Vector3(5, 0, 0), {
  duration: 1,
  ease: 'power2.out',
});
```

---

## 🎮 Controls

- **Drag** - Rotate camera
- **Scroll** - Zoom in/out
- **Click** - Interact with objects

---

## 📊 Performance

### Check FPS

In development mode, performance stats are visible in the top-right corner.

### Optimize

1. Reduce particle count in `ParticleField`
2. Lower renderer DPR in `Canvas3D`
3. Disable shadows if needed
4. Use simpler geometries

---

## 🎨 Customize

### Colors

Edit `src/config/3d.config.ts`:

```typescript
export const COLORS = {
  primary: '#4FC3F7',    // Cyan
  secondary: '#7C4DFF',  // Purple
  accent: '#FF4081',     // Pink
};
```

### Camera

Edit `src/components/3d/Canvas3D.tsx`:

```tsx
<PerspectiveCamera
  makeDefault
  position={[0, 2, 10]}  // Change position
  fov={50}               // Change field of view
/>
```

---

## 🔍 Debugging

### Enable Dev Tools

```tsx
// In Canvas3D.tsx
import { Perf } from 'r3f-perf';

<Perf position="top-left" />
```

### Check Console

Look for Three.js warnings:
- Texture size not power of 2
- Missing materials
- Geometry issues

---

## 📚 Learn More

- **Full Documentation**: `docs/3D_SYSTEM.md`
- **IsoFlux Docs**: `docs/ISOFLUX.md`
- **Three.js**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/

---

## ✨ What's Included

✅ IsoFlux logo with 3D effects  
✅ Animated geometric grid  
✅ 1000+ particle system  
✅ Physics engine ready  
✅ GSAP animations  
✅ Custom hooks  
✅ Performance optimizations  
✅ Responsive controls  
✅ Loading states  
✅ Glass morphism UI  

---

## 🎉 You're Ready!

Visit **http://localhost:3000/experience** to see your 3D IsoFlux experience!

**Need help?** Check `docs/3D_SYSTEM.md` for detailed documentation.
