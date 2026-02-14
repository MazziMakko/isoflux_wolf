'use client';

import { ReactNode, HTMLAttributes } from 'react';

interface SemanticTextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

/**
 * H1 Component
 * 
 * Semantic H1 heading optimized for SEO.
 * Should be used only once per page for the main title.
 * 
 * @example
 * ```tsx
 * <H1>IsoFlux: The Geometry of Value</H1>
 * ```
 */
export function H1({ children, className = '', ...props }: Omit<SemanticTextProps, 'as'>) {
  return (
    <h1
      className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
}

/**
 * H2 Component
 * 
 * Semantic H2 heading for major sections.
 * 
 * @example
 * ```tsx
 * <H2>Revolutionary Compliance Platform</H2>
 * ```
 */
export function H2({ children, className = '', ...props }: Omit<SemanticTextProps, 'as'>) {
  return (
    <h2
      className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

/**
 * H3 Component
 * 
 * Semantic H3 heading for subsections.
 * 
 * @example
 * ```tsx
 * <H3>The Rulial Parser</H3>
 * ```
 */
export function H3({ children, className = '', ...props }: Omit<SemanticTextProps, 'as'>) {
  return (
    <h3
      className={`text-2xl md:text-3xl font-bold mb-3 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

/**
 * H4 Component
 * 
 * Semantic H4 heading for sub-subsections.
 * 
 * @example
 * ```tsx
 * <H4>Key Features</H4>
 * ```
 */
export function H4({ children, className = '', ...props }: Omit<SemanticTextProps, 'as'>) {
  return (
    <h4
      className={`text-xl md:text-2xl font-semibold mb-2 ${className}`}
      {...props}
    >
      {children}
    </h4>
  );
}

/**
 * H5 Component
 * 
 * Semantic H5 heading for minor sections.
 */
export function H5({ children, className = '', ...props }: Omit<SemanticTextProps, 'as'>) {
  return (
    <h5
      className={`text-lg md:text-xl font-semibold mb-2 ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
}

/**
 * H6 Component
 * 
 * Semantic H6 heading for the smallest sections.
 */
export function H6({ children, className = '', ...props }: Omit<SemanticTextProps, 'as'>) {
  return (
    <h6
      className={`text-base md:text-lg font-semibold mb-1 ${className}`}
      {...props}
    >
      {children}
    </h6>
  );
}

/**
 * Paragraph Component
 * 
 * Semantic paragraph with optimal line height and spacing for readability.
 * 
 * @example
 * ```tsx
 * <Paragraph>
 *   IsoFlux treats ISO 20022 compliance as deterministic geometry...
 * </Paragraph>
 * ```
 */
export function Paragraph({ children, className = '', ...props }: Omit<SemanticTextProps, 'as'>) {
  return (
    <p
      className={`text-base md:text-lg leading-relaxed mb-4 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * Lead Paragraph Component
 * 
 * Larger introductory paragraph for page introductions.
 * 
 * @example
 * ```tsx
 * <Lead>
 *   We render compliance violations mathematically impossible.
 * </Lead>
 * ```
 */
export function Lead({ children, className = '', ...props }: Omit<SemanticTextProps, 'as'>) {
  return (
    <p
      className={`text-lg md:text-xl lg:text-2xl leading-relaxed mb-6 text-gray-300 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * Small Text Component
 * 
 * Smaller text for disclaimers, footnotes, etc.
 * 
 * @example
 * ```tsx
 * <Small>Terms and conditions apply</Small>
 * ```
 */
export function Small({ children, className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <small
      className={`text-sm text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </small>
  );
}

/**
 * Strong Text Component
 * 
 * Bold text for emphasis (semantic, not just styling).
 * 
 * @example
 * ```tsx
 * <Strong>Important:</Strong> Non-compliant transactions cannot exist.
 * ```
 */
export function Strong({ children, className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <strong
      className={`font-bold ${className}`}
      {...props}
    >
      {children}
    </strong>
  );
}

/**
 * Emphasis Component
 * 
 * Italic text for emphasis (semantic).
 * 
 * @example
 * ```tsx
 * <Em>The Geometry of Value</Em>
 * ```
 */
export function Em({ children, className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <em
      className={`italic ${className}`}
      {...props}
    >
      {children}
    </em>
  );
}

/**
 * Blockquote Component
 * 
 * Semantic blockquote for quotes.
 * 
 * @example
 * ```tsx
 * <Blockquote>
 *   "A non-compliant transaction cannot exist any more than a square circle."
 * </Blockquote>
 * ```
 */
export function Blockquote({ children, className = '', ...props }: HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={`border-l-4 border-[#4FC3F7] pl-6 italic text-lg text-gray-300 my-6 ${className}`}
      {...props}
    >
      {children}
    </blockquote>
  );
}

/**
 * List Component
 * 
 * Semantic unordered list.
 * 
 * @example
 * ```tsx
 * <List>
 *   <li>Rulial Parser</li>
 *   <li>Geometric Legislator</li>
 * </List>
 * ```
 */
export function List({ children, className = '', ...props }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={`list-disc list-inside space-y-2 mb-4 ${className}`}
      {...props}
    >
      {children}
    </ul>
  );
}

/**
 * Ordered List Component
 * 
 * Semantic ordered list.
 */
export function OrderedList({ children, className = '', ...props }: HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={`list-decimal list-inside space-y-2 mb-4 ${className}`}
      {...props}
    >
      {children}
    </ol>
  );
}
