'use client';

import { XMarkIcon } from '@heroicons/react/24/solid';
import { useEffect } from 'react';

export default function NotificationToast({ 
  show, 
  title, 
  message, 
  type = 'info', 
  onClose 
}) {
  // Auto-hide after 5 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;
  
  // Get appropriate color based on notification type
  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg border-l-4 p-4 shadow-lg ${getColorClasses()}`}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm opacity-90">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full hover:bg-black/5"
        >
          <XMarkIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
} 