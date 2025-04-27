'use client'

import dynamic from 'next/dynamic';

// Import Login component với dynamic để tắt SSR
const LoginComponent = dynamic(() => import('./login'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    </div>
  )
});

export default function LoginPage() {
  return <LoginComponent />;
}