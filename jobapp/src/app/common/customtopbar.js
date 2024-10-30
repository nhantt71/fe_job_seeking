'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useUserContext } from '../context/usercontext';

const CustomTopBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen1, setIsOpen1] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const dropdownRef = useRef(null);
    const dropdownRef1 = useRef(null);
    const dropdownRef2 = useRef(null);

    const { email, account, setUserData } = useUserContext();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCurrentUser(token);
        }
    }, []);

    const fetchCurrentUser = async (token) => {
        try {
            const res = await fetch('http://localhost:8080/api/auth/current-user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch current user');
            }

            const data = await res.json();
            setUserData(data.username, data);
            setIsAuthenticated(true);

            if (data.username) {
                fetchAccountByEmail(data.username);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            // Token might be expired or invalid; remove it
            localStorage.removeItem('token');
            setIsAuthenticated(false);
        }
    };

    const fetchAccountByEmail = async (email) => {
        try {
            const res = await fetch(`http://localhost:8080/api/auth/get-account-by-email?email=${email}`);
            if (!res.ok) throw new Error('Failed to fetch account');
            const data = await res.json();
            setUserData(email, data);
        } catch (error) {
            console.error("Error fetching account:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        window.location.href = '/';
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                (dropdownRef.current && !dropdownRef.current.contains(event.target)) &&
                (dropdownRef1.current && !dropdownRef1.current.contains(event.target)) &&
                (dropdownRef2.current && !dropdownRef2.current.contains(event.target))
            ) {
                setIsOpen(false);
                setIsOpen1(false);
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow-md py-3 fixed top-0 left-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-0 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="hover:text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Seeking & Hiring Job</span>
                    </Link>
                </div>

                <nav className="flex space-x-8 text-gray-800">
                    <Link href="/job" className="hover:text-green-600 text-sm">
                        <p>Jobs</p>
                    </Link>
                    <Link href="/job-recommendation" className="hover:text-green-600 text-sm">
                        <p>Recommendation Jobs</p>
                    </Link>
                    <div className="relative inline-block text-center" ref={dropdownRef}>
                        <button onClick={() => setIsOpen((prev) => !prev)} className="hover:text-green-600 text-sm">
                            Profile & CV
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                <ul>
                                    <li className="px-4 py-2 hover:bg-gray-100">
                                        <Link href="/profile" className="text-gray-700">Profile</Link>
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-100">
                                        <Link href="/cv" className="text-gray-700">CV</Link>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="relative inline-block text-center" ref={dropdownRef1}>
                        <button onClick={() => setIsOpen1((prev) => !prev)} className="hover:text-green-600 text-sm">
                            Your Jobs
                        </button>
                        {isOpen1 && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                <ul>
                                    <li className="px-4 py-2 hover:bg-gray-100">
                                        <Link href="/job/saved" className="text-gray-700">Saved Jobs</Link>
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-100">
                                        <Link href="/job/applied" className="text-gray-700">Applied Jobs</Link>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <Link href="/company" className="hover:text-green-600 text-sm">
                        <p>Company</p>
                    </Link>
                </nav>

                <div className="flex items-center space-x-6">
                    <Link href="/recruiter/register" className="text-black hover:text-green-600 text-sm">
                        Bạn là nhà tuyển dụng? <span className="font-semibold">Đăng tuyển ngay</span>
                    </Link>
                    <div className="flex space-x-4">
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef2}>
                                <button onClick={() => setIsUserMenuOpen((prev) => !prev)} className="flex items-center space-x-2 focus:outline-none">
                                    <img className="h-8 w-8 rounded-full" src={account?.avatar} alt="User Profile" />
                                </button>
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                        <ul>
                                            <li className="px-4 py-2 hover:bg-gray-100">
                                                <Link href="/profile" className="text-gray-700">Your Profile</Link>
                                            </li>
                                            <li className="px-4 py-2 hover:bg-gray-100">
                                                <button className="text-gray-700" onClick={handleLogout}>Logout</button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/candidate/login" className="hover:text-green-600 text-sm text-black">
                                Login Here
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CustomTopBar;
