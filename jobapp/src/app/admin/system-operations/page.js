'use client';

import { useState, useEffect } from 'react';
import { useCVAnalysisScheduler } from '../../services/cvAnalysisScheduler';

export default function SystemOperationsPage() {
  const { isRunning, lastRun, error, runCVAnalysis } = useCVAnalysisScheduler();
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
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
      }
    };
    
    checkAdminStatus();
  }, []);
  
  const handleRunCVAnalysis = async () => {
    try {
      setMessage('Starting CV analysis process...');
      setMessageType('info');
      
      await runCVAnalysis();
      
      setMessage('CV analysis completed successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error running CV analysis:', error);
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    }
  };
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">
            You do not have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Operations</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">CV Analysis System</h2>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Status:</span>{' '}
              {isRunning ? (
                <span className="text-amber-600 font-medium">Running</span>
              ) : (
                <span className="text-green-600 font-medium">Idle</span>
              )}
            </p>
            
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Last Run:</span>{' '}
              {lastRun ? new Date(lastRun).toLocaleString() : 'Never'}
            </p>
            
            {error && (
              <p className="text-red-600 mb-2">
                <span className="font-medium">Error:</span> {error}
              </p>
            )}
          </div>
          
          <div>
            <button
              onClick={handleRunCVAnalysis}
              disabled={isRunning}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRunning ? 'Processing...' : 'Run CV Analysis Now'}
            </button>
            
            <p className="mt-2 text-sm text-gray-600">
              This will analyze all available candidate CVs and update job matching data.
            </p>
          </div>
          
          {message && (
            <div 
              className={`mt-4 p-3 rounded-md ${
                messageType === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : messageType === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {message}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About the Scheduler</h2>
          
          <p className="text-gray-700 mb-4">
            The CV Analysis Scheduler runs automatically every hour to ensure recruiters 
            always have access to the most up-to-date candidate recommendations.
          </p>
          
          <p className="text-gray-700 mb-4">
            The process:
          </p>
          
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Fetches all available candidates</li>
            <li>For each candidate, clears old CV analysis data</li>
            <li>Analyzes each CV against all jobs</li>
            <li>Updates matching scores and recommendations</li>
          </ol>
          
          <p className="text-gray-700">
            This ensures recruiters always see the most current CV data when searching 
            for candidates, without requiring candidates to manually trigger updates.
          </p>
        </div>
      </div>
    </div>
  );
} 