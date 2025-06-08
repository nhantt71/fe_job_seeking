'use client';

import { useState, useEffect } from 'react';
import { createJobNotification, addNotification, getNotifications } from '../../firebase';
import { useNotifications } from '../../context/notificationContext';
import { debugToken } from '../../utils/tokenDebugger';
import RecruiterCustomTopBar from '../../common/recruitercustomtopbar';
import Link from 'next/link';

export default function NotificationDebugPage() {
  const [debugInfo, setDebugInfo] = useState({});
  const [localNotifications, setLocalNotifications] = useState([]);
  const { notifications, unreadCount, isAuthenticated, isInitialized } = useNotifications();
  
  useEffect(() => {
    const fetchDebugInfo = async () => {
      // Get token info
      const tokenInfo = debugToken();
      
      // Get localStorage items
      const localStorageItems = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          localStorageItems[key] = localStorage.getItem(key);
        } catch (e) {
          localStorageItems[key] = 'Error reading value';
        }
      }
      
      setDebugInfo({
        tokenInfo,
        localStorageItems,
        isAuthenticated,
        isInitialized,
        unreadCount,
        notificationsCount: notifications.length
      });
    };
    
    fetchDebugInfo();
    
    // Set up a notification listener
    const unsubscribe = getNotifications(notifs => {
      setLocalNotifications(notifs);
    });
    
    return () => unsubscribe();
  }, [isAuthenticated, isInitialized, notifications.length, unreadCount]);
  
  const createTestNotification = async () => {
    try {
      const id = await createJobNotification('test', 'Test Job ' + new Date().toLocaleTimeString());
      alert(`Notification created with ID: ${id}`);
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Error creating notification: ' + error.message);
    }
  };
  
  const createCustomNotification = async () => {
    try {
      const id = await addNotification({
        title: 'Custom Notification',
        body: 'This is a custom notification created at ' + new Date().toLocaleTimeString(),
        type: 'info'
      });
      alert(`Custom notification created with ID: ${id}`);
    } catch (error) {
      console.error('Error creating custom notification:', error);
      alert('Error creating custom notification: ' + error.message);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <RecruiterCustomTopBar />
      
      <div className="container mx-auto pt-20 px-4">
        <h1 className="text-2xl font-bold mb-4">Notification Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <div className="flex space-x-4">
            <button 
              onClick={createTestNotification}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Test Job Notification
            </button>
            <button 
              onClick={createCustomNotification}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Create Custom Notification
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
          <div className="overflow-x-auto">
            <pre className="text-sm bg-gray-100 p-4 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Context Notifications ({notifications.length})</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications in context</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <li key={notification.id} className="py-2">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-600">{notification.body}</div>
                  <div className="text-xs text-gray-400">
                    Read: {notification.read ? 'Yes' : 'No'} | 
                    Type: {notification.type} | 
                    ID: {notification.id}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-2">Direct Firestore Notifications ({localNotifications.length})</h2>
          {localNotifications.length === 0 ? (
            <p className="text-gray-500">No notifications in Firestore</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {localNotifications.map(notification => (
                <li key={notification.id} className="py-2">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-600">{notification.body}</div>
                  <div className="text-xs text-gray-400">
                    Read: {notification.read ? 'Yes' : 'No'} | 
                    Type: {notification.type} | 
                    User ID: {notification.userId} | 
                    ID: {notification.id}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="mt-4">
          <Link href="/recruiter" className="text-blue-500 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 