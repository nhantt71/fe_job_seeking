'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useUserContext } from '../context/usercontext';
import { useRouter } from 'next/navigation';
import { database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { encodeEmail } from '../utils/emailEncoder';

const CustomTopBar = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [avatar, setAvatar] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const dropdownRef = useRef(null);
    const dropdownRef1 = useRef(null);
    const dropdownRef2 = useRef(null);

    const { email, account, role, setUserData } = useUserContext();

    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            setIsLoading(true);
            if (!token) {
                setIsAuthenticated(false);
                setUserData(null, null);
                setAvatar(null);
                setIsLoading(false);
                return;
            }
            try {
                // Fetch current user
                const res = await fetch('/api/auth/current-user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    setUserData(null, null);
                    setAvatar(null);
                    setIsLoading(false);
                    return;
                }
                const data = await res.json();
                if (data.username) {
                    // Fetch account details
                    const accountRes = await fetch(`/api/auth/get-account-by-email?email=${data.username}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (!accountRes.ok) {
                        setIsAuthenticated(false);
                        setUserData(null, null);
                        setAvatar(null);
                        setIsLoading(false);
                        return;
                    }
                    const accountData = await accountRes.json();
                    setUserData(data.username, accountData, accountData.role);

                    // Use accountData.role directly, not the possibly stale "role" from context
                    if (accountData.role === 'CANDIDATE') {
                        setIsAuthenticated(true);
                        setAvatar(accountData.avatar);
                    } else {
                        setIsAuthenticated(false);
                        setAvatar(null);
                    }
                } else {
                    setIsAuthenticated(false);
                    setUserData(null, null);
                    setAvatar(null);
                }
            } catch (error) {
                setIsAuthenticated(false);
                setUserData(null, null);
                setAvatar(null);
            }
            setIsLoading(false);
        };

        checkToken();
        const interval = setInterval(checkToken, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isAuthenticated && email) {
            // Encode email for Firebase path
            const encodedEmail = encodeEmail(email);
            // Subscribe to notifications
            const notificationsRef = ref(database, `notifications/${encodedEmail}`);

            const unsubscribe = onValue(notificationsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const newNotifications = Object.entries(data).map(([id, notification]) => ({
                        id,
                        ...notification
                    }));
                    const unread = newNotifications.filter(n => !n.read).length;
                    setNotifications(newNotifications);
                    setUnreadCount(unread);
                } else {
                    setNotifications([]);
                    setUnreadCount(0);
                }
            });

            return () => unsubscribe();
        }
    }, [isAuthenticated, email]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        window.location.href = '/';
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            const encodedEmail = encodeEmail(email);
            const notificationRef = ref(database, `notifications/${encodedEmail}/${notificationId}`);
            await update(notificationRef, {
                read: true
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            router.push(notification.link);
        }
        setShowNotifications(false);
    };

    if (!isMounted) {
        return null;
    }

    return (
        <header className="bg-white shadow-md py-3 fixed top-0 left-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-0 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="hover:text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Seeking & Hiring Job</span>
                    </Link>
                </div>

                <nav className="flex items-center space-x-8 text-gray-800">
                    <Link href="/job" className="hover:text-green-600 text-sm">
                        <p>Jobs</p>
                    </Link>
                    <Link href="/job-recommendation" className="hover:text-green-600 text-sm">
                        <p>Recommendation Jobs</p>
                    </Link>
                    <div className="relative inline-block text-center group" ref={dropdownRef}>
                        <button className="hover:text-green-600 text-sm flex items-center">
                            Profile & CV
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                            <ul>
                                <li className="px-4 py-2 hover:bg-gray-100">
                                    <Link href="/profile" className="text-gray-700">Profile</Link>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100">
                                    <Link href="/cv" className="text-gray-700">CV</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="relative inline-block text-center group" ref={dropdownRef1}>
                        <button className="hover:text-green-600 text-sm flex items-center">
                            Your Jobs
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                            <ul>
                                <li className="px-4 py-2 hover:bg-gray-100">
                                    <Link href="/job/saved" className="text-gray-700">Saved Jobs</Link>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100">
                                    <Link href="/job/applied" className="text-gray-700">Applied Jobs</Link>
                                </li>
                            </ul>
                        </div>
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
                        {isAuthenticated && avatar ? (
                            <div className="relative" ref={dropdownRef2}>
                                <button 
                                    onClick={() => setIsUserMenuOpen((prev) => !prev)} 
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <img className="h-8 w-8 rounded-full" src={avatar} alt="User Profile" />
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

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
                                <div className="py-1">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-2 text-sm text-gray-700">
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`px-4 py-2 text-sm cursor-pointer ${notification.read
                                                    ? 'text-gray-700 hover:bg-gray-100'
                                                    : 'text-gray-900 bg-blue-50 hover:bg-blue-100'
                                                    }`}
                                            >
                                                <div className="font-medium">{notification.title}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(notification.timestamp?.toDate()).toLocaleString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CustomTopBar;
