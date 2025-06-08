'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useUserContext } from '../context/usercontext';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import LogoutHandler from './logoutHandler';

const CustomTopBar = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [avatar, setAvatar] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [isHoveringProfile, setIsHoveringProfile] = useState(false);
    const [isHoveringJobs, setIsHoveringJobs] = useState(false);

    const dropdownRef = useRef(null);
    const dropdownRef1 = useRef(null);
    const dropdownRef2 = useRef(null);

    const { email, account, role, setUserData } = useUserContext();
    const { handleLogout: logoutWithCleanup } = LogoutHandler();

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
            const q = query(
                collection(db, 'notifications', email, 'items'),
                orderBy('timestamp', 'desc')
            );
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newNotifications = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNotifications(newNotifications);
                setUnreadCount(newNotifications.filter(n => !n.read).length);
            });

            return () => unsubscribe();
        }
    }, [isAuthenticated, email]);

    const handleLogout = () => {
        logoutWithCleanup().catch(error => {
            console.error('Error during logout:', error);
            localStorage.removeItem('token');
            window.location.href = '/';
        });
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
            const notificationRef = doc(db, 'notifications', email, 'items', notificationId);
            await updateDoc(notificationRef, {
                read: true
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.jobId) {
            router.push(`/job/detail?id=${notification.jobId}`);
        }

        if(notification.action === 'Recommendation'){
            router.push('/job-recommendation');
        }
        setShowNotifications(false);
    };

    const markAllRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.read);
        await Promise.all(
            unreadNotifications.map(n => {
                const notificationRef = doc(db, 'notifications', email, 'items', n.id);
                return updateDoc(notificationRef, { read: true });
            })
        );
    };

    if (!isMounted) {
        return null;
    }

    return (
        <header className="bg-white shadow-sm py-4 fixed top-0 left-0 w-full z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo Section */}
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-2"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">CareerConnect</span>
                        </motion.div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center space-x-8">
                    <Link href="/job">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="text-gray-700 hover:text-emerald-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                        >
                            Jobs
                        </motion.div>
                    </Link>
                    <Link href="/job-recommendation">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="text-gray-700 hover:text-emerald-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                        >
                            Recommendations
                        </motion.div>
                    </Link>
                    
                    {/* Profile & CV Dropdown */}
                    <div 
                        className="relative"
                        onMouseEnter={() => setIsHoveringProfile(true)}
                        onMouseLeave={() => setIsHoveringProfile(false)}
                        ref={dropdownRef}
                    >
                        <button className="text-gray-700 hover:text-emerald-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center">
                            Profile & CV
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${isHoveringProfile ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <AnimatePresence>
                            {isHoveringProfile && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                >
                                    <Link href="/profile">
                                        <div className="px-4 py-3 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer">
                                            Profile
                                        </div>
                                    </Link>
                                    <Link href="/cv">
                                        <div className="px-4 py-3 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer">
                                            CV
                                        </div>
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    {/* Your Jobs Dropdown */}
                    <div 
                        className="relative"
                        onMouseEnter={() => setIsHoveringJobs(true)}
                        onMouseLeave={() => setIsHoveringJobs(false)}
                        ref={dropdownRef1}
                    >
                        <button className="text-gray-700 hover:text-emerald-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center">
                            Your Jobs
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${isHoveringJobs ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <AnimatePresence>
                            {isHoveringJobs && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                >
                                    <Link href="/job/saved">
                                        <div className="px-4 py-3 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer">
                                            Saved Jobs
                                        </div>
                                    </Link>
                                    <Link href="/job/applied">
                                        <div className="px-4 py-3 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer">
                                            Applied Jobs
                                        </div>
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <Link href="/company">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="text-gray-700 hover:text-emerald-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                        >
                            Companies
                        </motion.div>
                    </Link>
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4">
                    {!isAuthenticated ? (
                        <>
                            <Link href="/recruiter/register">
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    className="hidden md:block text-sm text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg transition-colors"
                                >
                                    For Employers <span className="font-semibold text-emerald-600">Post a job</span>
                                </motion.div>
                            </Link>
                            
                            <div className="flex items-center space-x-2">
                                <Link href="candidate/login">
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                                    >
                                        Login
                                    </motion.button>
                                </Link>
                                <Link href="candidate/register">
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                                    >
                                        Register
                                    </motion.button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-4">
                            {/* Notification Bell */}
                            <div className="relative">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-500 hover:text-emerald-600 focus:outline-none transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <motion.span 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"
                                        >
                                            {unreadCount}
                                        </motion.span>
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100"
                                        >
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllRead}
                                                        className="text-sm text-emerald-600 hover:text-emerald-700 focus:outline-none"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="px-4 py-6 text-center text-gray-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                        </svg>
                                                        <p className="mt-2">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((n) => (
                                                        <motion.div
                                                            key={n.id}
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 10 }}
                                                            onClick={() => handleNotificationClick(n)}
                                                            className={`flex flex-col px-4 py-3 space-y-1 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                                                                n.read
                                                                    ? 'text-gray-600 hover:bg-gray-50'
                                                                    : 'bg-emerald-50 text-gray-900 hover:bg-emerald-100'
                                                            }`}
                                                        >
                                                            <div className="flex items-start">
                                                                <div className={`flex-shrink-0 mt-1 h-2 w-2 rounded-full ${
                                                                    n.read ? 'bg-gray-300' : 'bg-emerald-500'
                                                                }`}></div>
                                                                <div className="ml-2">
                                                                    <span className="font-medium">{n.title}</span>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {n.action === 'Enable' || n.action === 'Disable' 
                                                                            ? `${n.action} job search status successfully!`
                                                                            : n.action === 'Recommendation'
                                                                                ? `You got ${n.numb_recommendation} jobs recommendations`
                                                                                : `${n.action} ${n.jobName} at ${n.companyName}`
                                                                        }
                                                                    </p>
                                                                    <div className="text-xs text-gray-400 mt-1">
                                                                        {new Date(n.timestamp?.toDate()).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* User Avatar Dropdown */}
                            <div className="relative" ref={dropdownRef2}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    {avatar ? (
                                        <img 
                                            className="h-9 w-9 rounded-full object-cover border-2 border-emerald-100 hover:border-emerald-200 transition-colors" 
                                            src={avatar} 
                                            alt="User Profile" 
                                        />
                                    ) : (
                                        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{email}</p>
                                                <p className="text-xs text-gray-500 truncate">Candidate Account</p>
                                            </div>
                                            <Link href="/profile">
                                                <div className="px-4 py-3 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                    Your Profile
                                                </div>
                                            </Link>
                                            <div 
                                                onClick={handleLogout}
                                                className="px-4 py-3 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer flex items-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                                </svg>
                                                Logout
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default CustomTopBar;