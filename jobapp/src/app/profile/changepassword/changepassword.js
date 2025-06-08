'use client';

import { useUserContext } from '@/app/context/usercontext';
import Link from 'next/link';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { email, account, setUserData } = useUserContext();
    const router = useRouter();

    useEffect(() => {
        // Calculate password strength
        if (newPassword.length === 0) {
            setPasswordStrength(0);
        } else {
            let strength = 0;
            if (newPassword.length >= 8) strength++;
            if (newPassword.match(/[A-Z]/)) strength++;
            if (newPassword.match(/[0-9]/)) strength++;
            if (newPassword.match(/[^A-Za-z0-9]/)) strength++;
            setPasswordStrength(strength);
        }
    }, [newPassword]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!oldPassword) newErrors.oldPassword = "Current password is required";
        if (!newPassword) newErrors.newPassword = "New password is required";
        else if (newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters";
        
        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await fetch(`/api/auth/change-password?accountId=${account.id}&newPassword=${newPassword}&oldPassword=${oldPassword}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }

            const data = await response.json();
            setUserData(data.email, data);
            
            // Show success state before redirect
            setTimeout(() => {
                router.push('/profile');
            }, 1500);
            
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 0: return 'bg-gray-200';
            case 1: return 'bg-red-500';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-blue-500';
            case 4: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Update Password</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Secure your account with a new password
                    </p>
                </div>
                
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="p-6 sm:p-8">
                        {errors.submit && (
                            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                                <p className="text-sm text-red-700">{errors.submit}</p>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="oldPassword"
                                        type={showOldPassword ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
                                    >
                                        {showOldPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.oldPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.oldPassword}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Create new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
                                    >
                                        {showNewPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                
                                <div className="mt-2">
                                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${getPasswordStrengthColor()}`} 
                                            style={{ width: `${passwordStrength * 25}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-4 gap-2">
                                        {['Weak', 'Fair', 'Good', 'Strong'].map((text, index) => (
                                            <div key={text} className="text-center">
                                                <p className={`text-xs ${passwordStrength > index ? 'font-medium' : 'text-gray-400'}`}>
                                                    {text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {errors.newPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                                )}
                                
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs text-gray-500 flex items-center">
                                        {newPassword.length >= 8 ? (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                                        ) : (
                                            <ExclamationCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
                                        )}
                                        Minimum 8 characters
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center">
                                        {/[A-Z]/.test(newPassword) ? (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                                        ) : (
                                            <ExclamationCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
                                        )}
                                        At least one uppercase letter
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center">
                                        {/[0-9]/.test(newPassword) ? (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                                        ) : (
                                            <ExclamationCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
                                        )}
                                        At least one number
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Re-enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-6 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </span>
                                    ) : 'Update Password'}
                                </button>
                                
                                <Link href="/profile">
                                    <button
                                        type="button"
                                        className="px-6 py-3 rounded-lg font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Having trouble? <Link href="/contact" className="font-medium text-indigo-600 hover:text-indigo-500">Contact support</Link></p>
                </div>
            </div>
        </div>
    );
}