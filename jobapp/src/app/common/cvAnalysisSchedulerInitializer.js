'use client';

import { useCVAnalysisScheduler } from '../services/cvAnalysisScheduler';

/**
 * Component that initializes the CV analysis background service
 * This runs once when the application starts
 */
export default function CVAnalysisSchedulerInitializer() {
  // Initialize the scheduler service
  const { isRunning, lastRun, error } = useCVAnalysisScheduler();
  
  // This component doesn't render anything visible
  return null;
} 