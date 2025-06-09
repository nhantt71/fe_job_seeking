'use client';

import { NotificationProvider } from '../context/notificationContext';
import { UserProvider } from "../context/usercontext";
import AuthInitializer from '../common/authInitializer';
import CandidateAvailabilityChecker from '../common/candidateAvailabilityChecker';
import CVAnalysisSchedulerInitializer from '../common/cvAnalysisSchedulerInitializer';

export default function ClientProviders({ children }) {
  return (
    <NotificationProvider>
      <UserProvider>
        <AuthInitializer />
        <CandidateAvailabilityChecker />
        <CVAnalysisSchedulerInitializer />
        {children}
      </UserProvider>
    </NotificationProvider>
  );
} 