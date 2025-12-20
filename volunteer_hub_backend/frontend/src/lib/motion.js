// Optional: Wrapper for optimized motion components
// Use this instead of importing framer-motion directly

import dynamic from 'next/dynamic';

// Lazy load motion components
export const Motion = {
  div: dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: true }),
  section: dynamic(() => import('framer-motion').then(mod => mod.motion.section), { ssr: true }),
  button: dynamic(() => import('framer-motion').then(mod => mod.motion.button), { ssr: true }),
  span: dynamic(() => import('framer-motion').then(mod => mod.motion.span), { ssr: true }),
};

export const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => mod.AnimatePresence),
  { ssr: false }
);

// Usage example:
// import { Motion, AnimatePresence } from '@/lib/motion';
// <Motion.div animate={{ opacity: 1 }}>Content</Motion.div>
