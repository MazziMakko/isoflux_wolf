'use client';

import { motion, type Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: number;
  enableTilt?: boolean;
  enableGlow?: boolean;
}

/**
 * AnimatedCard Component
 * 
 * A card component with smooth entrance animations and interactive hover effects.
 * Perfect for dashboards, galleries, and content grids.
 * 
 * Features:
 * - Smooth fade-in and slide-up entrance
 * - Hover scale effect
 * - Optional 3D tilt on mouse move
 * - Optional glow effect
 * - Glass morphism styling
 * 
 * @example
 * ```tsx
 * <AnimatedCard delay={0.2} enableTilt enableGlow>
 *   <h3>Card Title</h3>
 *   <p>Card content...</p>
 * </AnimatedCard>
 * ```
 */
export default function AnimatedCard({
  children,
  className = '',
  delay = 0,
  hoverScale = 1.02,
  enableTilt = false,
  enableGlow = false,
}: AnimatedCardProps) {
  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    hover: {
      scale: hoverScale,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const glowClass = enableGlow ? 'glow' : '';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`glass-card p-6 ${glowClass} ${className}`}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
      {...(enableTilt && {
        onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;

          const tiltX = (y - 0.5) * 10;
          const tiltY = (x - 0.5) * -10;

          e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${hoverScale})`;
        },
        onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        },
      })}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCardGrid Component
 * 
 * Grid layout for animated cards with staggered animations.
 * 
 * @example
 * ```tsx
 * <AnimatedCardGrid>
 *   <AnimatedCard>Card 1</AnimatedCard>
 *   <AnimatedCard>Card 2</AnimatedCard>
 *   <AnimatedCard>Card 3</AnimatedCard>
 * </AnimatedCardGrid>
 * ```
 */
interface AnimatedCardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  staggerDelay?: number;
  className?: string;
}

export function AnimatedCardGrid({
  children,
  columns = 3,
  staggerDelay = 0.1,
  className = '',
}: AnimatedCardGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <motion.div
      className={`grid ${gridClasses[columns]} gap-6 ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
