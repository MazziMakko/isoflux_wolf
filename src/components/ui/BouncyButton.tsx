'use client';

import { motion, type Variants } from 'framer-motion';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface BouncyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  scaleOnHover?: number;
  scaleOnTap?: number;
  bounceDuration?: number;
  enableGlow?: boolean;
}

/**
 * BouncyButton Component
 * 
 * An interactive button with smooth scale animations and bounce effects.
 * Highly performant with hardware-accelerated transforms.
 * 
 * Features:
 * - Scales up on hover
 * - Satisfying bounce on click
 * - Multiple style variants
 * - Optional glow effect
 * - Fully accessible
 * 
 * @param children - Button content
 * @param variant - Visual style variant
 * @param size - Button size
 * @param scaleOnHover - Scale factor on hover (default: 1.05)
 * @param scaleOnTap - Scale factor on click (default: 0.95)
 * @param bounceDuration - Bounce animation duration (default: 0.5)
 * @param enableGlow - Enable glow effect on hover (default: false)
 * 
 * @example
 * ```tsx
 * <BouncyButton variant="primary" size="lg" enableGlow onClick={() => alert('Clicked!')}>
 *   Click Me!
 * </BouncyButton>
 * ```
 */
export default function BouncyButton({
  children,
  variant = 'primary',
  size = 'md',
  scaleOnHover = 1.05,
  scaleOnTap = 0.95,
  bounceDuration = 0.5,
  enableGlow = false,
  className = '',
  disabled = false,
  ...props
}: BouncyButtonProps) {
  const variants: Variants = {
    initial: {
      scale: 1,
    },
    hover: {
      scale: scaleOnHover,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: scaleOnTap,
      transition: {
        type: 'spring',
        stiffness: 600,
        damping: 20,
        duration: bounceDuration,
      },
    },
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#4FC3F7] to-[#7C4DFF] text-white hover:shadow-lg hover:shadow-[#4FC3F7]/50',
    secondary:
      'bg-gradient-to-r from-[#7C4DFF] to-[#9C27B0] text-white hover:shadow-lg hover:shadow-[#7C4DFF]/50',
    outline:
      'bg-transparent border-2 border-[#4FC3F7] text-[#4FC3F7] hover:bg-[#4FC3F7]/10',
    ghost: 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const baseStyles =
    'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const glowStyles = enableGlow ? 'animate-pulse-glow' : '';

  return (
    <motion.button
      variants={variants}
      initial="initial"
      whileHover={!disabled ? 'hover' : undefined}
      whileTap={!disabled ? 'tap' : undefined}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${glowStyles} ${className}`}
      style={{
        willChange: 'transform',
        touchAction: 'manipulation',
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * BouncyIconButton Component
 * 
 * Circular button optimized for icons with bounce effect.
 * 
 * @example
 * ```tsx
 * <BouncyIconButton onClick={() => console.log('Clicked')}>
 *   <Icon />
 * </BouncyIconButton>
 * ```
 */
interface BouncyIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function BouncyIconButton({
  children,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}: BouncyIconButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#4FC3F7] to-[#7C4DFF] text-white',
    secondary: 'bg-gradient-to-r from-[#7C4DFF] to-[#9C27B0] text-white',
    ghost: 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9, rotate: -5 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
      className={`${sizeClasses[size]} ${variantStyles[variant]} ${className} rounded-full flex items-center justify-center transition-all duration-200`}
      style={{ willChange: 'transform' }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * BouncyButtonGroup Component
 * 
 * Group of bouncy buttons with staggered animations.
 * 
 * @example
 * ```tsx
 * <BouncyButtonGroup>
 *   <BouncyButton>Button 1</BouncyButton>
 *   <BouncyButton>Button 2</BouncyButton>
 * </BouncyButtonGroup>
 * ```
 */
interface BouncyButtonGroupProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function BouncyButtonGroup({
  children,
  className = '',
  staggerDelay = 0.1,
}: BouncyButtonGroupProps) {
  return (
    <motion.div
      className={`flex gap-4 ${className}`}
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
