'use client';

import { motion, type Variants } from 'framer-motion';
import { CSSProperties, ReactNode } from 'react';

interface FloatingTextProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  duration?: number;
  delay?: number;
  amplitude?: number;
  rotateAmount?: number;
  enableRotate?: boolean;
}

/**
 * FloatingText Component
 * 
 * A text component that gently floats up and down with optional rotation.
 * Uses Framer Motion for smooth, performant animations.
 * 
 * @param children - Text or elements to animate
 * @param className - Additional CSS classes
 * @param style - Inline styles
 * @param duration - Animation duration in seconds (default: 3)
 * @param delay - Animation delay in seconds (default: 0)
 * @param amplitude - Float distance in pixels (default: 20)
 * @param rotateAmount - Rotation angle in degrees (default: 3)
 * @param enableRotate - Enable rotation animation (default: true)
 * 
 * @example
 * ```tsx
 * <FloatingText className="text-4xl font-bold">
 *   Hello World
 * </FloatingText>
 * ```
 */
export default function FloatingText({
  children,
  className = '',
  style = {},
  duration = 3,
  delay = 0,
  amplitude = 20,
  rotateAmount = 3,
  enableRotate = true,
}: FloatingTextProps) {
  const floatVariants: Variants = {
    initial: {
      y: 0,
      rotate: 0,
    },
    animate: {
      y: [-amplitude, amplitude, -amplitude],
      rotate: enableRotate ? [-rotateAmount, rotateAmount, -rotateAmount] : 0,
      transition: {
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      variants={floatVariants}
      initial="initial"
      animate="animate"
      className={className}
      style={{
        display: 'inline-block',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * FloatingTextStagger Component
 * 
 * Renders multiple floating text elements with staggered animations.
 * Perfect for creating cascading effects.
 * 
 * @example
 * ```tsx
 * <FloatingTextStagger words={['Iso', 'Flux']} />
 * ```
 */
interface FloatingTextStaggerProps {
  words: string[];
  className?: string;
  staggerDelay?: number;
  duration?: number;
  amplitude?: number;
}

export function FloatingTextStagger({
  words,
  className = '',
  staggerDelay = 0.2,
  duration = 3,
  amplitude = 20,
}: FloatingTextStaggerProps) {
  return (
    <div className={`flex gap-4 ${className}`}>
      {words.map((word, index) => (
        <FloatingText
          key={word}
          delay={index * staggerDelay}
          duration={duration}
          amplitude={amplitude}
        >
          {word}
        </FloatingText>
      ))}
    </div>
  );
}

/**
 * FloatingTextOnHover Component
 * 
 * Text that floats only when hovered.
 * Useful for interactive elements.
 * 
 * @example
 * ```tsx
 * <FloatingTextOnHover>
 *   Hover me!
 * </FloatingTextOnHover>
 * ```
 */
interface FloatingTextOnHoverProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
}

export function FloatingTextOnHover({
  children,
  className = '',
  amplitude = 10,
}: FloatingTextOnHoverProps) {
  return (
    <motion.div
      className={className}
      style={{ display: 'inline-block', willChange: 'transform' }}
      whileHover={{
        y: -amplitude,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      }}
    >
      {children}
    </motion.div>
  );
}
