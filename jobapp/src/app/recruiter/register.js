'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [account, setAccount] = useState();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        if (avatar) {
            const avatarFile = await fetch(avatar).then(res => res.blob());
            formData.append('file', avatarFile, 'avatar.jpg');
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();
            setAccount(data);
            
            router.push('/company-register');

        } catch (err) {
            console.error(err.message || 'An error occurred during registration');
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(URL.createObjectURL(file));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-md shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Avatar</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="w-full border rounded-md"
                        />
                        {avatar && (
                            <img
                                src={avatar}
                                alt="Avatar Preview"
                                className="mt-2 h-20 w-20 object-cover rounded-full"
                            />
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
