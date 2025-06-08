'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '../context/notificationContext';

export default function NotificationDebug({ showFull = false }) {
  const { 
    notifications, 
    unreadCount, 
    isAuthenticated, 
    isInitialized,
    refreshNotifications
  } = useNotifications();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development' && !showFull) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-800">Notification Debug</h3>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
          <div>Initialized: {isInitialized ? '✅' : '❌'}</div>
          <div>Notifications: {notifications.length} (Unread: {unreadCount})</div>
          
          <button 
            onClick={() => {
              refreshNotifications();
              setLastRefresh(new Date());
            }}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
          >
            Refresh Now
          </button>
          
          {isExpanded && notifications.length > 0 && (
            <div className="mt-3 border-t pt-2">
              <h4 className="font-medium mb-1">Recent Notifications:</h4>
              <ul className="max-h-40 overflow-y-auto">
                {notifications.slice(0, 5).map(notification => (
                  <li key={notification.id} className="border-b border-gray-100 pb-1 mb-1">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-xs">{notification.body}</div>
                    <div className="text-xs text-gray-400">
                      Read: {notification.read ? 'Yes' : 'No'} | 
                      Type: {notification.type || 'N/A'}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 