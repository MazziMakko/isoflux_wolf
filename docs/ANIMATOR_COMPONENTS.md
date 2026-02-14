# The Animator - Animation & Graphics Components

## 🎬 Overview

"The Animator" provides a collection of high-performance, reusable animation components for the IsoFlux platform. These components are built with Framer Motion and React Three Fiber, ensuring smooth, hardware-accelerated animations.

---

## 📦 Components

### 1. FloatingText

Gently floating text with optional rotation effects.

#### Basic Usage

```tsx
import FloatingText from '@/components/ui/FloatingText';

<FloatingText className="text-4xl font-bold text-white">
  Hello World
</FloatingText>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Text or elements to animate |
| `className` | string | '' | Additional CSS classes |
| `style` | CSSProperties | {} | Inline styles |
| `duration` | number | 3 | Animation duration in seconds |
| `delay` | number | 0 | Animation delay in seconds |
| `amplitude` | number | 20 | Float distance in pixels |
| `rotateAmount` | number | 3 | Rotation angle in degrees |
| `enableRotate` | boolean | true | Enable rotation animation |

#### Advanced Examples

**Staggered Floating Text**

```tsx
import { FloatingTextStagger } from '@/components/ui/FloatingText';

<FloatingTextStagger
  words={['Iso', 'Flux']}
  className="text-6xl font-bold"
  staggerDelay={0.3}
  amplitude={30}
/>
```

**Float on Hover**

```tsx
import { FloatingTextOnHover } from '@/components/ui/FloatingText';

<FloatingTextOnHover className="text-2xl cursor-pointer">
  Hover me!
</FloatingTextOnHover>
```

#### Performance Tips

- Uses `willChange: 'transform'` for GPU acceleration
- Minimal layout recalculations
- Optimized for 60 FPS

---

### 2. BouncyButton

Interactive button with scale and bounce effects.

#### Basic Usage

```tsx
import BouncyButton from '@/components/ui/BouncyButton';

<BouncyButton
  variant="primary"
  size="lg"
  enableGlow
  onClick={() => console.log('Clicked!')}
>
  Click Me!
</BouncyButton>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Button content |
| `variant` | 'primary' \| 'secondary' \| 'outline' \| 'ghost' | 'primary' | Visual style |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| `scaleOnHover` | number | 1.05 | Scale factor on hover |
| `scaleOnTap` | number | 0.95 | Scale factor on click |
| `bounceDuration` | number | 0.5 | Bounce duration in seconds |
| `enableGlow` | boolean | false | Enable glow effect |
| `disabled` | boolean | false | Disable button |

#### Variants

**Primary** (Cyan to Purple gradient)
```tsx
<BouncyButton variant="primary">Primary</BouncyButton>
```

**Secondary** (Purple to Deep Purple gradient)
```tsx
<BouncyButton variant="secondary">Secondary</BouncyButton>
```

**Outline** (Transparent with border)
```tsx
<BouncyButton variant="outline">Outline</BouncyButton>
```

**Ghost** (Glass morphism)
```tsx
<BouncyButton variant="ghost">Ghost</BouncyButton>
```

#### Icon Buttons

```tsx
import { BouncyIconButton } from '@/components/ui/BouncyButton';

<BouncyIconButton size="lg" variant="primary">
  <StarIcon />
</BouncyIconButton>
```

#### Button Groups

```tsx
import { BouncyButtonGroup } from '@/components/ui/BouncyButton';

<BouncyButtonGroup staggerDelay={0.1}>
  <BouncyButton>Button 1</BouncyButton>
  <BouncyButton>Button 2</BouncyButton>
  <BouncyButton>Button 3</BouncyButton>
</BouncyButtonGroup>
```

#### Performance

- Hardware-accelerated transforms
- No layout thrashing
- Spring physics for natural movement
- Touch-optimized with `touchAction: 'manipulation'`

---

### 3. Draggable3DObject

Interactive 3D object with click-and-drag physics.

#### Basic Usage

```tsx
import Draggable3DObject from '@/components/3d/objects/Draggable3DObject';

// Inside a Canvas component
<Draggable3DObject
  position={[0, 5, 0]}
  shape="sphere"
  size={1.5}
  color="#7C4DFF"
  onDragStart={() => console.log('Started dragging')}
  onDrag={(position) => console.log('Position:', position)}
  onDragEnd={() => console.log('Stopped dragging')}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | [number, number, number] | [0, 5, 0] | Initial position [x, y, z] |
| `shape` | 'box' \| 'sphere' \| 'cylinder' | 'box' | Object shape |
| `size` | number | 1 | Object size |
| `color` | string | '#4FC3F7' | Object color |
| `mass` | number | 1 | Physics mass |
| `restitution` | number | 0.7 | Bounciness (0-1) |
| `friction` | number | 0.3 | Surface friction |
| `enableGravity` | boolean | true | Enable gravity |
| `onDragStart` | () => void | - | Drag start callback |
| `onDrag` | (pos: Vector3) => void | - | Drag callback |
| `onDragEnd` | () => void | - | Drag end callback |

#### Complete Example

```tsx
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import Draggable3DObject from '@/components/3d/objects/Draggable3DObject';

export default function InteractiveScene() {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
      <Physics gravity={[0, -9.81, 0]}>
        {/* Ground plane */}
        <RigidBody type="fixed">
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </RigidBody>

        {/* Draggable objects */}
        <Draggable3DObject
          position={[-2, 5, 0]}
          shape="box"
          color="#4FC3F7"
        />
        
        <Draggable3DObject
          position={[0, 7, 0]}
          shape="sphere"
          size={1.2}
          color="#7C4DFF"
          restitution={0.9}
        />
        
        <Draggable3DObject
          position={[2, 6, 0]}
          shape="cylinder"
          color="#FF4081"
          mass={2}
        />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
      </Physics>
    </Canvas>
  );
}
```

#### Multiple Objects

```tsx
import { DraggableObjectGroup } from '@/components/3d/objects/Draggable3DObject';

<DraggableObjectGroup
  count={5}
  colors={['#4FC3F7', '#7C4DFF', '#FF4081', '#00BCD4', '#9C27B0']}
/>
```

#### How It Works

1. **Click Detection**: Uses raycasting to detect clicks on the object
2. **Drag Plane**: Creates an invisible plane perpendicular to camera
3. **Position Update**: Projects mouse position onto drag plane
4. **Physics Integration**: Updates Rapier rigid body position
5. **Gravity Control**: Disables gravity during drag for smooth movement

#### Performance Optimizations

- Minimal `useFrame` calculations
- Efficient raycasting
- Hardware-accelerated physics (WASM)
- Optimized rigid body updates
- No unnecessary re-renders

---

### 4. AnimatedCard

Card component with entrance animations and hover effects.

#### Basic Usage

```tsx
import AnimatedCard from '@/components/ui/AnimatedCard';

<AnimatedCard delay={0.2} enableTilt enableGlow>
  <h3 className="text-xl font-bold mb-2">Card Title</h3>
  <p className="text-gray-400">Card content goes here...</p>
</AnimatedCard>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Card content |
| `className` | string | '' | Additional CSS classes |
| `delay` | number | 0 | Entrance delay in seconds |
| `hoverScale` | number | 1.02 | Scale on hover |
| `enableTilt` | boolean | false | Enable 3D tilt on mouse move |
| `enableGlow` | boolean | false | Enable glow effect |

#### Card Grid

```tsx
import { AnimatedCardGrid } from '@/components/ui/AnimatedCard';

<AnimatedCardGrid columns={3} staggerDelay={0.15}>
  <AnimatedCard enableTilt>Card 1</AnimatedCard>
  <AnimatedCard enableTilt>Card 2</AnimatedCard>
  <AnimatedCard enableTilt>Card 3</AnimatedCard>
  <AnimatedCard enableTilt>Card 4</AnimatedCard>
  <AnimatedCard enableTilt>Card 5</AnimatedCard>
  <AnimatedCard enableTilt>Card 6</AnimatedCard>
</AnimatedCardGrid>
```

#### Advanced Example

```tsx
<AnimatedCard
  delay={0.3}
  hoverScale={1.05}
  enableTilt
  enableGlow
  className="max-w-sm"
>
  <div className="flex items-center gap-4 mb-4">
    <div className="w-12 h-12 bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF] rounded-lg" />
    <h3 className="text-xl font-bold">Feature Name</h3>
  </div>
  <p className="text-gray-400 mb-4">
    Description of the feature with some details...
  </p>
  <BouncyButton variant="outline" size="sm">
    Learn More
  </BouncyButton>
</AnimatedCard>
```

---

## 🚀 Usage in Pages

### Example: Animated Landing Page

```tsx
'use client';

import FloatingText from '@/components/ui/FloatingText';
import BouncyButton from '@/components/ui/BouncyButton';
import { AnimatedCardGrid } from '@/components/ui/AnimatedCard';
import AnimatedCard from '@/components/ui/AnimatedCard';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1e] to-[#1a1a2e] p-8">
      {/* Hero Section */}
      <div className="text-center py-20">
        <FloatingText
          className="text-6xl font-bold gradient-text mb-6"
          amplitude={30}
          duration={4}
        >
          Welcome to IsoFlux
        </FloatingText>

        <p className="text-xl text-gray-400 mb-8">
          The Geometry of Value
        </p>

        <div className="flex gap-4 justify-center">
          <BouncyButton variant="primary" size="lg" enableGlow>
            Get Started
          </BouncyButton>
          <BouncyButton variant="outline" size="lg">
            Learn More
          </BouncyButton>
        </div>
      </div>

      {/* Features Grid */}
      <AnimatedCardGrid columns={3} staggerDelay={0.2}>
        <AnimatedCard enableTilt enableGlow>
          <h3 className="text-2xl font-bold mb-4">Rulial Parser</h3>
          <p className="text-gray-400">
            0% error rate with deterministic validation
          </p>
        </AnimatedCard>

        <AnimatedCard enableTilt enableGlow>
          <h3 className="text-2xl font-bold mb-4">Geometric Legislator</h3>
          <p className="text-gray-400">
            Pre-cognitive compliance through geometry
          </p>
        </AnimatedCard>

        <AnimatedCard enableTilt enableGlow>
          <h3 className="text-2xl font-bold mb-4">Entangled Ledger</h3>
          <p className="text-gray-400">
            Real-time reserve verification
          </p>
        </AnimatedCard>
      </AnimatedCardGrid>
    </div>
  );
}
```

### Example: Interactive 3D Scene

```tsx
'use client';

import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 5, 10] }}>
      <Physics>
        <Draggable3DObject position={[-3, 5, 0]} shape="box" />
        <Draggable3DObject position={[0, 7, 0]} shape="sphere" size={1.5} />
        <Draggable3DObject position={[3, 6, 0]} shape="cylinder" />

        {/* Ground */}
        <RigidBody type="fixed">
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </RigidBody>

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
      </Physics>
    </Canvas>
  );
}

export default function InteractivePage() {
  return (
    <div className="h-screen">
      <Scene3D />
      
      <div className="absolute top-8 left-8">
        <FloatingText className="text-4xl font-bold text-white">
          Drag the objects!
        </FloatingText>
      </div>
    </div>
  );
}
```

---

## ⚡ Performance Guidelines

### General Best Practices

1. **Use `willChange`**: All animated properties use `willChange: 'transform'` for GPU acceleration
2. **Avoid Layout Thrashing**: Animations only affect transforms, not layout properties
3. **Hardware Acceleration**: Use `transform` and `opacity` instead of `top`/`left`
4. **Debounce Callbacks**: Debounce `onDrag` callbacks if doing expensive operations
5. **Memoize Children**: Use `React.memo` for static child components

### Component-Specific Tips

**FloatingText**
- Set `enableRotate={false}` if rotation isn't needed
- Reduce `amplitude` for subtler effects
- Use shorter `duration` for faster animations

**BouncyButton**
- Disable `enableGlow` if not needed
- Use `ghost` variant for lighter rendering
- Batch button renders with `BouncyButtonGroup`

**Draggable3DObject**
- Limit number of draggable objects (< 10 recommended)
- Use simpler geometries (`sphere` > `cylinder` > `box` in performance)
- Disable `enableGravity` if objects don't need to fall

**AnimatedCard**
- Disable `enableTilt` if 3D effect isn't needed
- Increase `staggerDelay` to reduce simultaneous animations
- Use `delay` to control when cards appear

---

## 🎨 Customization

### Custom Colors

All components respect IsoFlux brand colors by default:

```typescript
const COLORS = {
  primary: '#4FC3F7',    // Cyan
  secondary: '#7C4DFF',  // Purple
  accent: '#FF4081',     // Pink
};
```

Override with props:

```tsx
<Draggable3DObject color="#00FF00" />
<BouncyButton style={{ background: 'linear-gradient(to right, #FF0000, #0000FF)' }}>
  Custom
</BouncyButton>
```

### Custom Animations

Extend components with custom Framer Motion variants:

```tsx
import { motion } from 'framer-motion';

const customVariants = {
  initial: { opacity: 0, rotate: -180 },
  animate: { opacity: 1, rotate: 0 },
};

<motion.div variants={customVariants}>
  <FloatingText>Spinning Text!</FloatingText>
</motion.div>
```

---

## 🐛 Troubleshooting

### Animations Not Working

- Ensure Framer Motion is installed: `npm install framer-motion`
- Check that component is inside `'use client'` boundary
- Verify CSS isn't overriding `transform` properties

### 3D Objects Not Draggable

- Ensure component is inside `<Canvas>` and `<Physics>`
- Check that `@react-three/rapier` is installed
- Verify camera can raycast to object (not behind other objects)

### Poor Performance

- Reduce number of animated elements
- Disable `enableTilt` on cards
- Use simpler 3D geometries
- Lower `staggerDelay` to spread out animations

---

## 📚 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Rapier Physics](https://rapier.rs/)
- [IsoFlux 3D System](./3D_SYSTEM.md)

---

**Built by**: The Animator  
**Version**: 1.0.0  
**Status**: Production Ready ✅
