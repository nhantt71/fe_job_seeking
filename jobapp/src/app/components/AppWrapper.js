'use client';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function AppWrapper({ children }) {
  return (
    <div className={`${inter.className} antialiased`}>
      {children}
    </div>
  );
} 