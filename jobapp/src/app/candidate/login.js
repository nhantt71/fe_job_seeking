'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiUser, FiLock, FiLoader, FiAlertCircle, FiMail } from 'react-icons/fi';
import { FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa';
import { signIn } from "next-auth/react";
import ClientOnly from '@/components/ClientOnly';
import { useUserContext } from '../context/usercontext';

// SafeDiv component to handle hydration warnings
const SafeDiv = ({ children, className, ...props }) => {
    return (
        <div className={className} suppressHydrationWarning {...props}>
            {children}
        </div>
    );
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { setUserData, setRecommendationCvId, setMainCVIdForJobs } = useUserContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        localStorage.removeItem('token');

        try {
            const verifyRes = await fetch(`/api/auth/check-verified?email=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!verifyRes.ok) throw new Error('Failed to check verification');

            const isVerified = await verifyRes.json();
            if (!isVerified) throw new Error('Account not verified. Please check your email.');

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Login failed');
            }

            const data = await res.json();

            if (!data.accessToken) throw new Error('No access token received');
            localStorage.setItem('token', data.accessToken);
            
            // Set user data in context
            setUserData(email, data);
            
            // Fetch candidate data to get ID
            const candidateRes = await fetch(`/api/candidate/get-candidate-by-email?email=${encodeURIComponent(email)}`, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (candidateRes.ok) {
                const candidateData = await candidateRes.json();
                
                // If candidate exists, fetch their CVs to find the main one
                if (candidateData && candidateData.id) {
                    const cvsRes = await fetch(`/api/cv/get-cvs-by-candidate-id/${candidateData.id}`, {
                        headers: {
                            'Authorization': `Bearer ${data.accessToken}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (cvsRes.ok) {
                        const cvsList = await cvsRes.json();
                        // Find the main CV
                        const mainCv = cvsList.find(cv => cv.mainCV);
                        
                        if (mainCv) {
                            // Set the main CV ID as the recommendation CV ID
                            setRecommendationCvId(mainCv.id);
                            setMainCVIdForJobs(mainCv.id);
                            
                            // Store the CV ID and fetch time in localStorage
                            localStorage.setItem('mainCvId', mainCv.id);
                            localStorage.setItem('mainCvIdFetchTime', new Date().getTime().toString());
                            
                            console.log("Main CV set as recommendation CV:", mainCv.id);
                        }
                    }
                }
            }

            router.push(data.role === 'ROLE_CANDIDATE' ? '/' : '/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial loading state
    const [isPageLoading, setIsPageLoading] = useState(true);
    
    useEffect(() => {
        // Set a short timeout to ensure the page is fully loaded
        const timer = setTimeout(() => {
            setIsPageLoading(false);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);
    
    // Show a minimal loading state while waiting for client-side hydration
    if (isPageLoading) {
        return (
            <SafeDiv className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
                <SafeDiv className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></SafeDiv>
            </SafeDiv>
        );
    }

    return (
        <ClientOnly>
            <SafeDiv className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
                <SafeDiv className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20 backdrop-blur-sm">
                    <SafeDiv className="relative">
                        <SafeDiv className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></SafeDiv>
                        <SafeDiv className="relative z-10 py-8 px-8 text-center">
                            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                            <p className="text-indigo-100 mt-2">Sign in to continue your journey</p>
                        </SafeDiv>
                        <SafeDiv className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-400"></SafeDiv>
                    </SafeDiv>

                    <SafeDiv className="p-8">
                        {error && (
                            <SafeDiv className="mb-6 flex items-center gap-3 bg-red-50/80 text-red-600 p-3 rounded-lg border border-red-100 animate-fade-in">
                                <FiAlertCircle className="flex-shrink-0 text-lg" />
                                <span className="text-sm">{error}</span>
                            </SafeDiv>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <SafeDiv className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <SafeDiv className="relative group">
                                    <SafeDiv className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                        <FiMail />
                                    </SafeDiv>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="your@email.com"
                                        className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-200 group-hover:border-indigo-300"
                                    />
                                </SafeDiv>
                            </SafeDiv>

                            <SafeDiv className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <SafeDiv className="relative group">
                                    <SafeDiv className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                        <FiLock />
                                    </SafeDiv>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-200 group-hover:border-indigo-300"
                                    />
                                </SafeDiv>
                            </SafeDiv>

                            <SafeDiv className="flex items-center justify-between">
                                <SafeDiv className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                                        Remember me
                                    </label>
                                </SafeDiv>
                                <SafeDiv className="text-sm">
                                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                        Forgot password?
                                    </a>
                                </SafeDiv>
                            </SafeDiv>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-md'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2" />
                                        Signing in...
                                    </>
                                ) : 'Sign in'}
                            </button>
                        </form>

                        <SafeDiv className="my-6 relative">
                            <SafeDiv className="absolute inset-0 flex items-center">
                                <SafeDiv className="w-full border-t border-gray-300/50"></SafeDiv>
                            </SafeDiv>
                            <SafeDiv className="relative flex justify-center">
                                <span className="px-3 bg-white text-sm text-gray-500">or continue with</span>
                            </SafeDiv>
                        </SafeDiv>

                        <SafeDiv className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => signIn("google")}
                                className="flex items-center justify-center p-3 border border-gray-300 rounded-xl hover:bg-gray-50/50 transition-all hover:border-indigo-300 hover:shadow-sm"
                            >
                                <FaGoogle className="text-red-500 text-lg" />
                            </button>
                            <button
                                onClick={() => signIn("github")}
                                className="flex items-center justify-center p-3 border border-gray-300 rounded-xl hover:bg-gray-50/50 transition-all hover:border-indigo-300 hover:shadow-sm"
                            >
                                <FaGithub className="text-gray-800 text-lg" />
                            </button>
                            <button
                                onClick={() => signIn("linkedin")}
                                className="flex items-center justify-center p-3 border border-gray-300 rounded-xl hover:bg-gray-50/50 transition-all hover:border-indigo-300 hover:shadow-sm"
                            >
                                <FaLinkedin className="text-blue-600 text-lg" />
                            </button>
                        </SafeDiv>

                        <SafeDiv className="mt-8 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <a
                                href="/candidate/register"
                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                Sign up
                            </a>
                        </SafeDiv>
                    </SafeDiv>
                </SafeDiv>
            </SafeDiv>
        </ClientOnly>
    );
}