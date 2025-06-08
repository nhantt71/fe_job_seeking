'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '../context/notificationContext';

/**
 * This component ensures notifications are properly initialized after login
 * It runs silently in the background with no UI
 */
export default function NotificationInitializer() {
  const { isAuthenticated, refreshNotifications } = useNotifications();
  const [lastAuthState, setLastAuthState] = useState(false);
  
  // Track authentication state changes to trigger notification refresh
  useEffect(() => {
    // If user just logged in (auth state changed from false to true)
    if (isAuthenticated && !lastAuthState) {
      console.log('NotificationInitializer: User just logged in, initializing notifications');
      
      // Wait a moment for auth to fully initialize, then refresh once
      setTimeout(() => {
        console.log('NotificationInitializer: Refreshing notifications after login');
        refreshNotifications();
      }, 1000);
    }
    
    setLastAuthState(isAuthenticated);
  }, [isAuthenticated, lastAuthState, refreshNotifications]);
  
  // No UI - this is just a background process
  return null;
} 