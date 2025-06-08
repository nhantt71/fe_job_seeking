'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getNotifications, requestNotificationPermission, onMessageListener, markNotificationAsRead, markAllNotificationsAsRead } from '../firebase';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastTokenCheck, setLastTokenCheck] = useState('');

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const isAuth = !!token;
      
      // Only update state if token has changed
      if (token !== lastTokenCheck) {
        console.log('NotificationContext - Auth check:', isAuth, 'Token exists:', !!token);
        setLastTokenCheck(token || '');
        setIsAuthenticated(isAuth);
        setIsInitialized(true);
        
        // If authentication state changed to true, reset notifications to trigger a fresh fetch
        if (isAuth) {
          console.log('NotificationContext - Auth state changed to authenticated, resetting notifications');
          setNotifications([]);
          setUnreadCount(0);
          // Force a small delay before re-initializing to ensure clean state
          setTimeout(() => {
            setIsInitialized(false);
            setTimeout(() => setIsInitialized(true), 100);
          }, 100);
        }
      }
      
      return isAuth;
    };
    
    // Check on mount
    const isAuth = checkAuth();
    console.log('NotificationContext - Initial auth check result:', isAuth);
    
    // Set up event listener for storage changes (e.g., logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [lastTokenCheck]);

  // Log when authentication state changes
  useEffect(() => {
    console.log('NotificationContext - Auth state changed:', isAuthenticated);
  }, [isAuthenticated]);

  // Request notification permission on mount if authenticated
  useEffect(() => {
    if (!isAuthenticated && !isInitialized) {
      console.log('NotificationContext - Not ready for permission request');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('NotificationContext - Not authenticated, skipping permission request');
      return;
    }
    
    console.log('NotificationContext - Requesting notification permission');
    const requestPermission = async () => {
      await requestNotificationPermission();
    };
    
    requestPermission();
  }, [isAuthenticated, isInitialized]);

  // Listen for realtime notifications from Firestore when authenticated
  useEffect(() => {
    // Always check token directly in addition to state
    const token = localStorage.getItem('token');
    const hasToken = !!token;
    
    if (!isAuthenticated && !hasToken) {
      console.log('NotificationContext - Not authenticated, skipping notification fetch');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    if (!isInitialized && !hasToken) {
      console.log('NotificationContext - Not initialized, skipping notification fetch');
      return;
    }
    
    console.log('NotificationContext - Setting up notification listener');
    
    // Add a small delay to ensure Firebase is fully initialized
    const timeoutId = setTimeout(() => {
      const unsubscribe = getNotifications((notificationData) => {
        console.log('NotificationContext - Received notifications:', notificationData);
        
        if (notificationData && Array.isArray(notificationData)) {
          setNotifications(notificationData);
          
          // Calculate unread count
          const unread = notificationData.filter(n => !n.read).length;
          setUnreadCount(unread);
          
          // Reset retry count on successful fetch
          setRetryCount(0);
        } else {
          console.warn('NotificationContext - Received invalid notification data:', notificationData);
          
          // If we get invalid data and haven't retried too many times, try again
          if (retryCount < 3) {
            console.log(`NotificationContext - Retrying notification fetch (attempt ${retryCount + 1})`);
            setRetryCount(prev => prev + 1);
            // Force re-run of this effect
            setIsInitialized(false);
            setTimeout(() => setIsInitialized(true), 1000);
          }
        }
      });
      
      return () => {
        console.log('NotificationContext - Cleaning up notification listener');
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }, 500); // Small delay to ensure Firebase is ready
    
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, isInitialized, retryCount]);

  // Listen for foreground messages when authenticated
  useEffect(() => {
    // Always check token directly in addition to state
    const token = localStorage.getItem('token');
    const hasToken = !!token;
    
    if (!isAuthenticated && !hasToken) {
      console.log('NotificationContext - Not authenticated, skipping message listener');
      return;
    }
    
    if (!isInitialized && !hasToken) {
      console.log('NotificationContext - Not initialized, skipping message listener');
      return;
    }
    
    console.log('NotificationContext - Setting up foreground message listener');
    const messageListener = onMessageListener()
      .then((payload) => {
        console.log('NotificationContext - Received foreground message:', payload);
        const { notification } = payload;
        
        // Show notification toast
        setCurrentNotification({
          title: notification.title,
          body: notification.body,
          type: notification.data?.type || 'info',
        });
        setShowNotification(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      })
      .catch((err) => console.error('Failed to listen to messages:', err));
      
    return () => {
      console.log('NotificationContext - Cleaning up foreground message listener');
      // Note: This might not actually clean up the listener properly
      // as onMessageListener doesn't return a proper unsubscribe function
    };
  }, [isAuthenticated, isInitialized]);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated) return;
    
    console.log('NotificationContext - Marking notification as read:', notificationId);
    try {
      // Update in Firestore
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return;
    
    console.log('NotificationContext - Marking all notifications as read');
    try {
      // Update in Firestore
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Force refresh notifications
  const refreshNotifications = () => {
    console.log('NotificationContext - Manually refreshing notifications');
    // Reset initialization to trigger a refresh
    setIsInitialized(false);
    setTimeout(() => setIsInitialized(true), 100);
  };

  // Close the current notification
  const closeNotification = () => {
    setShowNotification(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showNotification,
        currentNotification,
        isAuthenticated,
        isInitialized,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        closeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext); 