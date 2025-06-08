'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiUser, FiLock, FiLoader, FiAlertCircle, FiEye, FiEyeOff, FiMail } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const existingToken = localStorage.getItem('token');
        if (existingToken) {
            localStorage.removeItem('token');
        }

        try {
            console.log('Attempting login with:', { email });
            
            const verifyRes = await fetch(`/api/auth/check-verified?email=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!verifyRes.ok) {
                throw new Error('Failed to check account verification status');
            }

            const isVerified = await verifyRes.json();
            console.log('Account verification status:', isVerified);

            if (!isVerified) {
                throw new Error('Account not verified. Please check your email');
            }

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const responseData = await res.json();
            console.log('Login response data:', responseData);

            if (!responseData.accessToken) {
                console.error('No access token in response:', responseData);
                throw new Error('No access token received');
            }

            localStorage.setItem('token', responseData.accessToken);
            
            const storedToken = localStorage.getItem('token');
            console.log('Token retrieved from localStorage:', storedToken);
            
            if (!storedToken) {
                throw new Error('Failed to store token');
            }

            router.push(responseData.role === 'ROLE_RECRUITER' ? '/recruiter' : '/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20 backdrop-blur-sm">
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-8 px-8 text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-400/20"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-indigo-400/20"></div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl font-bold text-white relative z-10"
                        >
                            Welcome Back
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-indigo-100 mt-2 relative z-10"
                        >
                            Sign in to continue your journey
                        </motion.p>
                    </div>

                    <div className="p-8">
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 flex items-start gap-3 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100"
                                >
                                    <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiMail />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="your@email.com"
                                        className="text-gray-800 w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 outline-none bg-gray-50"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiLock />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="text-gray-800 w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 outline-none bg-gray-50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="flex items-center justify-between"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-md'}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <FiLoader className="animate-spin mr-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <span className="relative">
                                            <span className="absolute -inset-1 rounded-lg bg-indigo-400/30 opacity-0 group-hover:opacity-100 blur transition-all duration-200"></span>
                                            Sign In
                                        </span>
                                    )}
                                </button>
                            </motion.div>
                        </form>

                        <motion.div 
                            className="mt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-3 bg-white text-sm text-gray-500">
                                        New to our platform?
                                    </span>
                                </div>
                            </div>

                            <motion.div 
                                className="mt-5 text-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <a
                                    href="/recruiter/register"
                                    className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-200 bg-white hover:shadow-sm"
                                >
                                    Create a new account
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                <motion.div 
                    className="mt-6 text-center text-xs text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    © {new Date().getFullYear()} Your Company. All rights reserved.
                </motion.div>
            </motion.div>
        </div>
    );
}