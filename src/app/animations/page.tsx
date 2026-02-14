'use client';

import { useState } from 'react';
import FloatingText, { FloatingTextStagger, FloatingTextOnHover } from '@/components/ui/FloatingText';
import BouncyButton, { BouncyIconButton, BouncyButtonGroup } from '@/components/ui/BouncyButton';
import AnimatedCard, { AnimatedCardGrid } from '@/components/ui/AnimatedCard';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import 3D scene (client-side only)
const DraggableScene = dynamic(() => import('./DraggableScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-black/20 rounded-lg flex items-center justify-center">
      <div className="text-white">Loading 3D Scene...</div>
    </div>
  ),
});

export default function AnimationsShowcase() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1e] to-[#1a1a2e] text-white">
      {/* Header */}
      <header className="p-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/branding/isoflux-logo.png"
              alt="IsoFlux"
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold">IsoFlux</span>
          </Link>

          <nav className="flex gap-6">
            <Link href="/" className="hover:text-[#4FC3F7] transition-colors">
              Home
            </Link>
            <Link href="/experience" className="hover:text-[#4FC3F7] transition-colors">
              3D Experience
            </Link>
            <Link href="/dashboard" className="hover:text-[#4FC3F7] transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-16">
        {/* Hero */}
        <section className="text-center py-12">
          <FloatingText
            className="text-6xl font-bold gradient-text mb-4"
            amplitude={25}
            duration={3.5}
          >
            The Animator
          </FloatingText>

          <p className="text-xl text-gray-400 mb-8">
            Reusable Animation & Graphics Components
          </p>

          <BouncyButtonGroup staggerDelay={0.15}>
            <BouncyButton
              variant="primary"
              size="lg"
              enableGlow
              onClick={() => setClickCount(c => c + 1)}
            >
              Click Me ({clickCount})
            </BouncyButton>
            <BouncyButton variant="secondary" size="lg">
              Secondary
            </BouncyButton>
            <BouncyButton variant="outline" size="lg">
              Outline
            </BouncyButton>
            <BouncyButton variant="ghost" size="lg">
              Ghost
            </BouncyButton>
          </BouncyButtonGroup>
        </section>

        {/* FloatingText Showcase */}
        <section>
          <h2 className="text-4xl font-bold mb-8">1. FloatingText Component</h2>

          <AnimatedCardGrid columns={2} staggerDelay={0.15}>
            <AnimatedCard>
              <h3 className="text-2xl font-bold mb-4">Basic Float</h3>
              <div className="bg-black/30 p-8 rounded-lg text-center">
                <FloatingText className="text-3xl font-bold text-[#4FC3F7]">
                  Gently Floating
                </FloatingText>
              </div>
              <p className="text-gray-400 mt-4 text-sm">
                Smooth up-and-down motion with subtle rotation
              </p>
            </AnimatedCard>

            <AnimatedCard>
              <h3 className="text-2xl font-bold mb-4">Staggered Float</h3>
              <div className="bg-black/30 p-8 rounded-lg text-center">
                <FloatingTextStagger
                  words={['Iso', 'Flux']}
                  className="text-3xl font-bold text-[#7C4DFF]"
                  staggerDelay={0.3}
                />
              </div>
              <p className="text-gray-400 mt-4 text-sm">
                Multiple elements with cascading animations
              </p>
            </AnimatedCard>

            <AnimatedCard>
              <h3 className="text-2xl font-bold mb-4">Float on Hover</h3>
              <div className="bg-black/30 p-8 rounded-lg text-center">
                <FloatingTextOnHover className="text-3xl font-bold text-[#FF4081] cursor-pointer">
                  Hover Me!
                </FloatingTextOnHover>
              </div>
              <p className="text-gray-400 mt-4 text-sm">
                Floats up when you hover over it
              </p>
            </AnimatedCard>

            <AnimatedCard>
              <h3 className="text-2xl font-bold mb-4">Custom Amplitude</h3>
              <div className="bg-black/30 p-8 rounded-lg text-center">
                <FloatingText
                  className="text-3xl font-bold text-[#00BCD4]"
                  amplitude={40}
                  duration={2}
                >
                  Big Float
                </FloatingText>
              </div>
              <p className="text-gray-400 mt-4 text-sm">
                Larger movement with faster animation
              </p>
            </AnimatedCard>
          </AnimatedCardGrid>
        </section>

        {/* BouncyButton Showcase */}
        <section>
          <h2 className="text-4xl font-bold mb-8">2. BouncyButton Component</h2>

          <AnimatedCardGrid columns={3} staggerDelay={0.1}>
            <AnimatedCard>
              <h3 className="text-xl font-bold mb-4">Button Variants</h3>
              <div className="space-y-3">
                <BouncyButton variant="primary" className="w-full">
                  Primary
                </BouncyButton>
                <BouncyButton variant="secondary" className="w-full">
                  Secondary
                </BouncyButton>
                <BouncyButton variant="outline" className="w-full">
                  Outline
                </BouncyButton>
                <BouncyButton variant="ghost" className="w-full">
                  Ghost
                </BouncyButton>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <h3 className="text-xl font-bold mb-4">Button Sizes</h3>
              <div className="space-y-3 flex flex-col items-center">
                <BouncyButton variant="primary" size="sm">
                  Small
                </BouncyButton>
                <BouncyButton variant="primary" size="md">
                  Medium
                </BouncyButton>
                <BouncyButton variant="primary" size="lg">
                  Large
                </BouncyButton>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <h3 className="text-xl font-bold mb-4">Icon Buttons</h3>
              <div className="flex gap-3 justify-center">
                <BouncyIconButton size="sm" variant="primary">
                  ✨
                </BouncyIconButton>
                <BouncyIconButton size="md" variant="secondary">
                  🚀
                </BouncyIconButton>
                <BouncyIconButton size="lg" variant="ghost">
                  ⚡
                </BouncyIconButton>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <h3 className="text-xl font-bold mb-4">With Glow Effect</h3>
              <div className="space-y-3">
                <BouncyButton variant="primary" enableGlow className="w-full">
                  Glowing Button
                </BouncyButton>
                <BouncyButton variant="secondary" enableGlow className="w-full">
                  Glowing Secondary
                </BouncyButton>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <h3 className="text-xl font-bold mb-4">Button States</h3>
              <div className="space-y-3">
                <BouncyButton variant="primary" className="w-full">
                  Normal
                </BouncyButton>
                <BouncyButton variant="primary" disabled className="w-full">
                  Disabled
                </BouncyButton>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <h3 className="text-xl font-bold mb-4">Custom Scale</h3>
              <div className="space-y-3">
                <BouncyButton
                  variant="primary"
                  scaleOnHover={1.15}
                  scaleOnTap={0.85}
                  className="w-full"
                >
                  Big Bounce
                </BouncyButton>
              </div>
            </AnimatedCard>
          </AnimatedCardGrid>
        </section>

        {/* AnimatedCard Showcase */}
        <section>
          <h2 className="text-4xl font-bold mb-8">3. AnimatedCard Component</h2>

          <AnimatedCardGrid columns={3} staggerDelay={0.2}>
            <AnimatedCard enableTilt>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF] rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                  ⚡
                </div>
                <h3 className="text-xl font-bold mb-2">With Tilt</h3>
                <p className="text-gray-400 text-sm">
                  Move your mouse over this card to see 3D tilt effect
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard enableGlow>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#7C4DFF] to-[#9C27B0] rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                  ✨
                </div>
                <h3 className="text-xl font-bold mb-2">With Glow</h3>
                <p className="text-gray-400 text-sm">
                  This card has a subtle glow effect on hover
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard enableTilt enableGlow hoverScale={1.05}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF4081] to-[#F50057] rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                  🚀
                </div>
                <h3 className="text-xl font-bold mb-2">All Effects</h3>
                <p className="text-gray-400 text-sm">
                  Tilt + Glow + Scale for maximum impact
                </p>
              </div>
            </AnimatedCard>
          </AnimatedCardGrid>
        </section>

        {/* Draggable3D Showcase */}
        <section>
          <h2 className="text-4xl font-bold mb-8">4. Draggable3DObject Component</h2>

          <AnimatedCard>
            <h3 className="text-2xl font-bold mb-4">Interactive 3D Objects</h3>
            <p className="text-gray-400 mb-6">
              Click and drag the 3D objects below. They have realistic physics!
            </p>

            <DraggableScene />

            <div className="mt-6 space-y-2 text-sm text-gray-400">
              <p>• <strong>Click</strong> an object to grab it</p>
              <p>• <strong>Drag</strong> your mouse to move it</p>
              <p>• <strong>Release</strong> to drop (gravity applies)</p>
              <p>• Objects collide and bounce realistically</p>
            </div>
          </AnimatedCard>
        </section>

        {/* Combined Example */}
        <section>
          <h2 className="text-4xl font-bold mb-8">5. Combined Example</h2>

          <AnimatedCard enableTilt enableGlow className="text-center">
            <FloatingText className="text-5xl font-bold gradient-text mb-6">
              Everything Together
            </FloatingText>

            <p className="text-xl text-gray-400 mb-8">
              All Animator components working in harmony
            </p>

            <BouncyButtonGroup staggerDelay={0.1}>
              <BouncyButton variant="primary" size="lg" enableGlow>
                Get Started
              </BouncyButton>
              <BouncyButton variant="secondary" size="lg">
                Learn More
              </BouncyButton>
            </BouncyButtonGroup>

            <div className="mt-12 grid grid-cols-3 gap-6">
              {['Performant', 'Reusable', 'Beautiful'].map((word, i) => (
                <div key={word} className="glass-card p-4 rounded-lg">
                  <FloatingText
                    className="text-2xl font-bold text-[#4FC3F7]"
                    delay={i * 0.2}
                    amplitude={15}
                  >
                    {word}
                  </FloatingText>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </section>

        {/* Performance Stats */}
        <section>
          <AnimatedCard className="text-center">
            <h2 className="text-3xl font-bold mb-6">⚡ Performance Optimized</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <FloatingText className="text-4xl font-bold text-[#4FC3F7]" amplitude={15}>
                  60
                </FloatingText>
                <p className="text-gray-400 mt-2">FPS Target</p>
              </div>

              <div>
                <FloatingText className="text-4xl font-bold text-[#7C4DFF]" amplitude={15} delay={0.2}>
                  0
                </FloatingText>
                <p className="text-gray-400 mt-2">Layout Thrashing</p>
              </div>

              <div>
                <FloatingText className="text-4xl font-bold text-[#FF4081]" amplitude={15} delay={0.4}>
                  GPU
                </FloatingText>
                <p className="text-gray-400 mt-2">Accelerated</p>
              </div>

              <div>
                <FloatingText className="text-4xl font-bold text-[#00BCD4]" amplitude={15} delay={0.6}>
                  100%
                </FloatingText>
                <p className="text-gray-400 mt-2">Reusable</p>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Documentation Link */}
        <section className="text-center py-12">
          <FloatingText className="text-3xl font-bold mb-6">
            Ready to Use These Components?
          </FloatingText>

          <BouncyButton
            variant="primary"
            size="lg"
            enableGlow
            onClick={() => window.open('/docs/ANIMATOR_COMPONENTS.md', '_blank')}
          >
            View Documentation
          </BouncyButton>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 p-8 mt-16">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>Built with The Animator • IsoFlux Animation Components</p>
          <p className="mt-2 text-sm">
            Powered by Framer Motion & React Three Fiber
          </p>
        </div>
      </footer>
    </div>
  );
}
