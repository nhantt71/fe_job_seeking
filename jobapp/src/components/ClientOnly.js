"use client";

import { useState, useEffect } from 'react';

export default function ClientOnly({ children, fallback = null }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return fallback || (
      <div className="flex justify-center items-center p-4" suppressHydrationWarning={true}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" suppressHydrationWarning={true}></div>
      </div>
    );
  }

  return children;
} 