'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAdmin(false);
          return;
        }
        
        const response = await fetch('/api/auth/check-role', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.role === 'ROLE_ADMIN');
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-4">
            You do not have permission to access the admin dashboard. Please contact an administrator if you believe this is an error.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* System Operations Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-blue-600 text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">System Operations</h2>
              <p className="text-gray-600 mb-4">
                Manage background tasks, CV analysis scheduling, and system maintenance operations.
              </p>
              <Link
                href="/admin/system-operations"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 w-full"
              >
                Access System Operations
              </Link>
            </div>
          </div>
          
          {/* Placeholder for other admin modules */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden opacity-50">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gray-400 text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-500 mb-2">User Management</h2>
              <p className="text-gray-500 mb-4">
                Manage users, roles, and permissions (Coming soon).
              </p>
              <button
                disabled
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-400 cursor-not-allowed w-full"
              >
                Coming Soon
              </button>
            </div>
          </div>
          
          {/* Placeholder for other admin modules */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden opacity-50">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gray-400 text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-500 mb-2">Analytics</h2>
              <p className="text-gray-500 mb-4">
                View system analytics and performance metrics (Coming soon).
              </p>
              <button
                disabled
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-400 cursor-not-allowed w-full"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 