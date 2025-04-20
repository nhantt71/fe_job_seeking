import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiUser, FiLock, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { signIn } from "next-auth/react";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log('Attempting login with:', { email });
            
            // First check if account is verified
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

            // If verified, proceed with login
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

            // If verified and login successful, store token and redirect
            console.log('Storing token in localStorage:', responseData.accessToken);
            localStorage.setItem('token', responseData.accessToken);
            
            // Verify token was stored
            const storedToken = localStorage.getItem('token');
            console.log('Token retrieved from localStorage:', storedToken);
            
            if (!storedToken) {
                throw new Error('Failed to store token');
            }

            router.push(responseData.role === 'ROLE_CANDIDATE' ? '/' : '/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-indigo-600 py-6 px-8 text-center">
                    <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                    <p className="text-indigo-100 mt-1">Sign in to access your account</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg">
                            <FiAlertCircle className="flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="flex gap-4 mb-6 justify-center">
                        <button
                            onClick={() => signIn("google")}
                            className="w-16 h-16 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaGoogle className="text-red-500 text-2xl" />
                        </button>
                        <button
                            onClick={() => signIn("github")}
                            className="w-16 h-16 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaGithub className="text-gray-800 text-2xl" />
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-white text-sm text-gray-500">
                                OR
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiUser className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your@email.com"
                                    className="text-black w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="text-black w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <FiLoader className="animate-spin mr-2" />
                                    Signing in...
                                </>
                            ) : 'Sign in'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Don't have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <a
                                href="/candidate/register"
                                className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
                            >
                                Create a new account
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}