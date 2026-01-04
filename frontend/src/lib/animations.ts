import type { Transition, Variants } from 'framer-motion';

/**
 * Smooth easing curves for animations
 * These create natural, polished motion that feels less abrupt
 */
export const easing = {
  // Smooth ease out - ideal for elements entering view
  smooth: [0.22, 1, 0.36, 1] as const,
  // Gentle ease out - slightly softer
  gentle: [0.25, 0.46, 0.45, 0.94] as const,
  // Spring-like ease - for bouncy effects
  spring: [0.175, 0.885, 0.32, 1.275] as const,
  // Standard ease out
  easeOut: [0, 0, 0.2, 1] as const,
};

/**
 * Default transition settings for scroll-triggered animations
 */
export const scrollTransition: Transition = {
  duration: 0.7,
  ease: easing.smooth,
};

/**
 * Default viewport settings for scroll animations
 * amount: 0.2 means 20% of element must be visible to trigger
 */
export const scrollViewport = {
  once: true,
  amount: 0.2 as const,
};

/**
 * Staggered animation for lists/grids
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Fade in and slide up animation
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: scrollTransition,
  },
};

/**
 * Fade in and slide from left
 */
export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: scrollTransition,
  },
};

/**
 * Fade in and slide from right
 */
export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: scrollTransition,
  },
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: scrollTransition,
  },
};

/**
 * Mobile menu animation variants
 */
export const mobileMenuVariants: Variants = {
  initial: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: easing.smooth,
    },
  },
  animate: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.4,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: easing.smooth,
    },
  },
};

/**
 * Mobile menu item variants for staggered animation
 */
export const mobileMenuItemVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.2,
      ease: easing.smooth,
    },
  },
};

/**
 * Helper to create scroll animation props
 */
export function createScrollAnimation(
  variants: Variants,
  delay: number = 0
) {
  return {
    variants,
    initial: 'initial',
    whileInView: 'animate',
    viewport: scrollViewport,
    transition: {
      ...scrollTransition,
      delay,
    },
  };
}

/**
 * Helper to create staggered delay based on index
 */
export function getStaggerDelay(index: number, baseDelay: number = 0, stagger: number = 0.1) {
  return baseDelay + index * stagger;
}
