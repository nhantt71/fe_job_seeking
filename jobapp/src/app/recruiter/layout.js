'use client';

import { RecruiterProvider } from "../context/recruitercontext";

export default function RecruiterLayout({ children }) {
  return (
    <RecruiterProvider suppressHydrationWarning={true}>
      <div suppressHydrationWarning={true}>
        {children}
      </div>
    </RecruiterProvider>
  );
} 