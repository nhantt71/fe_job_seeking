'use client';

import { useUserContext } from '@/app/context/usercontext';
import Link from 'next/link';
import { useState } from "react";

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { email, account, setUserData } = useUserContext();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        fetch(`/api/auth/change-password?accountId=${account.id}&newPassword=${newPassword}&oldPassword=${oldPassword}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(data => {
            setUserData(data.email, data);
            alert('Password changed successfully!');
            router.push('/profile');
        })
        .catch(error => {
            console.error('Error changing password:', error);
            alert('Failed to change password. Please check your input and try again.');
        });
    };

    return (
        <div className="container mx-auto p-4 text-black">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Old Password
                        </label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div className="flex justify-between">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                            Change Password
                        </button>
                        <Link href="/profile">
                            <button type="button" className="bg-gray-300 text-black px-4 py-2 rounded-md">
                                Cancel
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
