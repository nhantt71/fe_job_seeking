'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiUpload, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

export function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            if (avatar) {
                const avatarFile = await fetch(avatar).then(res => res.blob());
                formData.append('file', avatarFile, 'avatar.jpg');
            }

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            router.push('/company-register');
        } catch (err) {
            setError(err.message || 'An error occurred during registration');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setAvatar(URL.createObjectURL(file));
        }
    };

    const removeAvatar = () => {
        setAvatar(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-8 px-8 text-center">
                        <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
                        <p className="text-blue-100 mt-2">Join our professional community</p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 flex items-start gap-3 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                                <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Email Address *</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none"
                                        placeholder="your@email.com"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiMail />
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Password *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none"
                                        placeholder="••••••••"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiLock />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password *</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none"
                                        placeholder="••••••••"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiLock />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Avatar Upload */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Profile Picture</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center">
                                            <FiUpload className="w-6 h-6 text-gray-400" />
                                            <p className="text-xs text-gray-500 mt-1">Upload</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleAvatarChange} 
                                            className="hidden" 
                                        />
                                    </label>
                                    {avatar && (
                                        <div className="relative">
                                            <img
                                                src={avatar}
                                                alt="Profile Preview"
                                                className="h-24 w-24 object-cover rounded-full border-2 border-white shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeAvatar}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        required
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-gray-700">
                                        I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full px-6 py-3 text-white font-medium rounded-xl shadow-md transition-all duration-200 ${
                                        isSubmitting 
                                            ? 'bg-blue-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <FiLoader className="animate-spin" />
                                            Creating Account...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </motion.button>
                            </div>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <a href="/recruiter/login" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign in
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}