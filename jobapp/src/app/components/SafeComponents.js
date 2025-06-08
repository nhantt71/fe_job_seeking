import React from 'react';
import { motion } from 'framer-motion';

/**
 * SafeDiv component that suppresses hydration warnings caused by browser extensions
 * like Bitdefender that add attributes such as bis_skin_checked to div elements
 */
export function SafeDiv({ children, className, ...props }) {
  return (
    <div className={className} suppressHydrationWarning {...props}>
      {children}
    </div>
  );
}

/**
 * SafeMotion component that suppresses hydration warnings caused by browser extensions
 * like Bitdefender that add attributes such as bis_skin_checked to motion.div elements
 */
export function SafeMotion({ children, className, ...props }) {
  return (
    <motion.div className={className} suppressHydrationWarning {...props}>
      {children}
    </motion.div>
  );
}

/**
 * SafeSpan component that suppresses hydration warnings for span elements
 */
export function SafeSpan({ children, className, ...props }) {
  return (
    <span className={className} suppressHydrationWarning {...props}>
      {children}
    </span>
  );
}

/**
 * SafeSection component that suppresses hydration warnings for section elements
 */
export function SafeSection({ children, className, ...props }) {
  return (
    <section className={className} suppressHydrationWarning {...props}>
      {children}
    </section>
  );
}

/**
 * SafeArticle component that suppresses hydration warnings for article elements
 */
export function SafeArticle({ children, className, ...props }) {
  return (
    <article className={className} suppressHydrationWarning {...props}>
      {children}
    </article>
  );
}

/**
 * SafeAside component that suppresses hydration warnings for aside elements
 */
export function SafeAside({ children, className, ...props }) {
  return (
    <aside className={className} suppressHydrationWarning {...props}>
      {children}
    </aside>
  );
}

/**
 * SafeHeader component that suppresses hydration warnings for header elements
 */
export function SafeHeader({ children, className, ...props }) {
  return (
    <header className={className} suppressHydrationWarning {...props}>
      {children}
    </header>
  );
}

/**
 * SafeFooter component that suppresses hydration warnings for footer elements
 */
export function SafeFooter({ children, className, ...props }) {
  return (
    <footer className={className} suppressHydrationWarning {...props}>
      {children}
    </footer>
  );
}

/**
 * SafeNav component that suppresses hydration warnings for nav elements
 */
export function SafeNav({ children, className, ...props }) {
  return (
    <nav className={className} suppressHydrationWarning {...props}>
      {children}
    </nav>
  );
}

/**
 * SafeMain component that suppresses hydration warnings for main elements
 */
export function SafeMain({ children, className, ...props }) {
  return (
    <main className={className} suppressHydrationWarning {...props}>
      {children}
    </main>
  );
} 