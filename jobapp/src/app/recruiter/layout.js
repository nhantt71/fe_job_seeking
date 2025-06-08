'use client';

import { RecruiterProvider } from "../context/recruitercontext";

export default function RecruiterLayout({ children }) {
  return (
    <RecruiterProvider>
      {children}
    </RecruiterProvider>
  );
} 