import React from 'react';
import { motion } from 'framer-motion';

/**
 * SafeMotion component that suppresses hydration warnings caused by browser extensions
 * like Bitdefender that add attributes such as bis_skin_checked to motion.div elements
 */
export default function SafeMotion({ children, className, ...props }) {
  return (
    <motion.div className={className} suppressHydrationWarning {...props}>
      {children}
    </motion.div>
  );
} 