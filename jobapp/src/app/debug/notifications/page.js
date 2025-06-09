'use client';

import { useState, useEffect } from 'react';
import { createJobNotification, addNotification, getNotifications } from '../../firebase';
import { useNotifications } from '../../context/notificationContext';
import { debugToken } from '../../utils/tokenDebugger';
import RecruiterCustomTopBar from '../../common/recruitercustomtopbar';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function NotificationDebugPage() {
  const [debugInfo, setDebugInfo] = useState({});
  const [localNotifications, setLocalNotifications] = useState([]);
  const { notifications, unreadCount, isAuthenticated, isInitialized } = useNotifications();
  const [userId, setUserId] = useState(null);
  
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

      // Extract user ID
      let extractedUserId = null;
      if (tokenInfo) {
        extractedUserId = 
          tokenInfo.sub || 
          tokenInfo.email || 
          tokenInfo.username || 
          tokenInfo.user_id || 
          tokenInfo.id || 
          tokenInfo.uid ||
          tokenInfo.preferred_username;
      }
      
      if (!extractedUserId) {
        extractedUserId = localStorage.getItem('email') || localStorage.getItem('username');
      }
      
      setUserId(extractedUserId);
      
      setDebugInfo({
        tokenInfo,
        localStorageItems,
        isAuthenticated,
        isInitialized,
        unreadCount,
        notificationsCount: notifications.length,
        extractedUserId
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

  // New function specifically for fixing recruiter notifications
  const fixRecruiterNotifications = async () => {
    try {
      // First check the token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found. Please log in first.');
        return;
      }

      // Extract user email from token or localStorage
      let userEmail = null;
      
      // Try to get from token if it's a JWT
      if (token.split('.').length === 3) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          userEmail = payload.sub || payload.email || payload.username;
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
      
      // If not found in token, try localStorage
      if (!userEmail) {
        userEmail = localStorage.getItem('email');
      }
      
      if (!userEmail) {
        alert('Could not determine user email. Please try logging out and back in.');
        return;
      }
      
      // Create notification directly in Firestore for the current user
      const notificationData = {
        title: 'Recruiter Notification Test',
        body: 'This is a test notification for the recruiter at ' + new Date().toLocaleTimeString(),
        userId: userEmail,
        read: false,
        timestamp: serverTimestamp(),
        type: 'success'
      };
      
      const docRef = await addDoc(collection(db, "notifications"), notificationData);
      
      alert(`Direct notification created with ID: ${docRef.id} for user ${userEmail}`);
      
      // Check if it appears in the local list
      setTimeout(() => {
        // Refresh the list
        getNotifications(notifs => {
          setLocalNotifications(notifs);
          alert(`Notifications refreshed. Count: ${notifs.length}`);
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error fixing recruiter notifications:', error);
      alert('Error: ' + error.message);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <RecruiterCustomTopBar />
      
      <div className="container mx-auto pt-20 px-4">
        <h1 className="text-2xl font-bold mb-4">Notification Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <div className="flex flex-wrap gap-4">
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
            <button 
              onClick={fixRecruiterNotifications}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Fix Recruiter Notifications
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