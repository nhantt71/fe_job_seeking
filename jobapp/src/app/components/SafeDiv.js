import React from 'react';

/**
 * SafeDiv component that suppresses hydration warnings caused by browser extensions
 * like Bitdefender that add attributes such as bis_skin_checked to div elements
 */
export default function SafeDiv({ children, className, ...props }) {
  return (
    <div className={className} suppressHydrationWarning {...props}>
      {children}
    </div>
  );
} 