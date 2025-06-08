'use client';

import { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../context/notificationContext';
import { getNotifications } from '../firebase';

export default function NotificationDropdown() {
  const notificationsContext = useNotifications();
  console.log('NotificationDropdown - Full context:', notificationsContext);
  
  // Add direct state for token
  const [hasDirectToken, setHasDirectToken] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  const { 
    notifications = [], 
    unreadCount = 0, 
    markAsRead = () => {}, 
    markAllAsRead = () => {},
    isAuthenticated = false,
    isInitialized = false
  } = notificationsContext || {};
  
  // Check token directly
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      console.log('NotificationDropdown - Direct token check:', !!token);
      setHasDirectToken(!!token);
    };
    
    checkToken();
    
    // Set up interval to check token periodically
    const interval = setInterval(checkToken, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Add debug logging
  useEffect(() => {
    console.log('NotificationDropdown - Context auth status:', isAuthenticated);
    console.log('NotificationDropdown - Direct token status:', hasDirectToken);
    console.log('NotificationDropdown - Initialized:', isInitialized);
    console.log('NotificationDropdown - Notifications:', notifications);
    console.log('NotificationDropdown - Unread count:', unreadCount);
    
    // Check token directly
    const token = localStorage.getItem('token');
    console.log('NotificationDropdown - Token exists:', !!token);
  }, [isAuthenticated, hasDirectToken, isInitialized, notifications, unreadCount]);
  
  // Format timestamp to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      const now = new Date();
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Unknown time';
    }
  };

  // Get appropriate color based on notification type
  const getTypeClasses = (type) => {
    switch (type) {
      case 'success': return 'text-emerald-500';
      case 'warning': return 'text-amber-500';
      case 'error': return 'text-rose-500';
      default: return 'text-blue-500';
    }
  };
  
  // Force refresh notifications
  const forceRefreshNotifications = () => {
    const token = localStorage.getItem('token');
    console.log('Forcing notification refresh, token exists:', !!token);
    
    if (token) {
      getNotifications((notificationData) => {
        console.log('Forced refresh - Received notifications:', notificationData);
      });
    }
  };

  // Check token directly for rendering decisions
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
  
  // Use either context auth or direct token check
  const isUserAuthenticated = isAuthenticated || hasDirectToken || hasToken;

  return (
    <Menu as="div" className="relative">
      <div className="flex items-center">
        <Menu.Button className="relative flex items-center justify-center rounded-full p-1 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <BellIcon className="h-6 w-6" />
          {isUserAuthenticated && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Menu.Button>
        
      </div>
      
      {/* Debug panel */}
      {showDebug && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <h4 className="font-bold text-sm mb-2">Debug Info</h4>
          <div className="text-xs space-y-1">
            <p>Context Auth: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Direct Token: {hasDirectToken ? 'Yes' : 'No'}</p>
            <p>Token Check: {hasToken ? 'Yes' : 'No'}</p>
            <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
            <p>Notifications: {notifications?.length || 0}</p>
            <p>Unread: {unreadCount}</p>
            <button 
              onClick={forceRefreshNotifications}
              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Force Refresh
            </button>
          </div>
        </div>
      )}

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
              {isUserAuthenticated && unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            {!isUserAuthenticated ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Please log in to see notifications
              </div>
            ) : !isInitialized ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <div
                      className={`relative flex gap-3 px-4 py-3 ${
                        active ? 'bg-gray-50' : ''
                      } ${!notification.read ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className={`mt-0.5 ${getTypeClasses(notification.type)}`}>
                        <CheckCircleIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{notification.body}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-indigo-500"></span>
                      )}
                    </div>
                  )}
                </Menu.Item>
              ))
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 