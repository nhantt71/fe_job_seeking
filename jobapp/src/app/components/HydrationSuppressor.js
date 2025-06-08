'use client';

/**
 * A utility component that wraps its children with suppressHydrationWarning
 * to prevent hydration mismatches caused by browser extensions like BitDefender.
 * 
 * Use this component to wrap any content that might have hydration mismatches.
 */
export default function HydrationSuppressor({ children, as = 'div', className = '', ...props }) {
  const Component = as;
  
  return (
    <Component suppressHydrationWarning className={className} {...props}>
      {children}
    </Component>
  );
} 