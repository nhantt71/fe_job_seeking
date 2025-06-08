'use client';

import { NotificationProvider } from '../context/notificationContext';
import { UserProvider } from "../context/usercontext";
import AuthInitializer from '../common/authInitializer';
import CandidateAvailabilityChecker from '../common/candidateAvailabilityChecker';

export default function ClientProviders({ children }) {
  return (
    <NotificationProvider>
      <UserProvider>
        <AuthInitializer />
        <CandidateAvailabilityChecker />
        {children}
      </UserProvider>
    </NotificationProvider>
  );
} 