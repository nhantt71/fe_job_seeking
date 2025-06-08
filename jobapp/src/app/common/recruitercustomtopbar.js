'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRecruiterContext } from '../context/recruitercontext';
import { useUserContext } from '../context/usercontext';
import NotificationDropdown from '../components/NotificationDropdown';
import { createJobNotification } from '../firebase';
import { debugToken } from '../utils/tokenDebugger';
import { useNotifications } from '../context/notificationContext';
const RecruiterCustomTopBar = () => {
    const dropdownRef2 = useRef(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { email, account, setUserData } = useUserContext();
    
    const { isAuthenticated: notificationIsAuth } = useNotifications();
    const recruiterContext = useRecruiterContext();
    
    const { 
        recruiter = null, 
        company = null, 
        companyId = 0,
        setRecruiterData = () => {}, 
        setCompanyData = () => {},
        setCompanyId = () => {}
    } = recruiterContext || {};

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            debugToken();
            setIsAuthenticated(true);
            fetchCurrentUser(token);
        } else {
            setIsAuthenticated(false);
        }
    }, [notificationIsAuth]);

    const fetchCurrentUser = async (token) => {
        try {
            const res = await fetch('/api/auth/current-user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (res.status === 401) throw new Error('Token expired or invalid');
            if (!res.ok) throw new Error('Failed to fetch current user');

            const data = await res.json();
            setUserData(data.username, data);

            if (data.username) {
                fetchAccountByEmail(data.username);
                fetchRecruiterByEmail(data.username);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
        }
    };

    const fetchAccountByEmail = async (email) => {
        try {
            const res = await fetch(`/api/auth/get-account-by-email?email=${email}`);
            if (!res.ok) throw new Error('Failed to fetch account');
            const data = await res.json();
            setUserData(email, data);
        } catch (error) {
            console.error("Error fetching account:", error);
        }
    };

    const fetchRecruiterByEmail = async (email) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/recruiter/get-recruiter-by-email?email=${email}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch recruiter');
            const data = await res.json();
            if (typeof setRecruiterData === 'function') {
                setRecruiterData(data);
            }
            setCompanyId(data.companyId);
        } catch (error) {
            console.error("Error fetching recruiter:", error);
        }
    };

    const fetchCompanyById = async (companyId) => {
        try {
            if (!companyId) return;
            
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/company/get-company-by-id/${companyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch company');
            const data = await res.json();
            if (typeof setCompanyData === 'function') {
                setCompanyData(data);
            }
        } catch (error) {
            console.error("Error fetching company:", error);
        }
    };

    useEffect(() => {
        if (companyId) {
            fetchCompanyById(companyId);
        }
    }, [companyId]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        window.location.href = '/recruiter';
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg py-2' : 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm py-3'}`} suppressHydrationWarning={true}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center" suppressHydrationWarning={true}>
                <div className="flex items-center space-x-4" suppressHydrationWarning={true}>
                    <Link href="/recruiter" className="flex items-center group">
                        <span className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl'}`}>
                            TalentHire
                        </span>
                        {company?.name && (
                            <span className="ml-3 text-sm font-medium text-gray-500 hidden md:inline">
                                for {company.name}
                            </span>
                        )}
                    </Link>
                </div>

                <nav className="hidden md:flex space-x-1" suppressHydrationWarning={true}>
                    {[
                        { href: "/recruiter/my-company", label: "My Company" },
                        { href: "/recruiter/jobs-management", label: "Jobs" },
                        { href: "/recruiter/candidate-recommendation", label: "Recommendations" },
                        { href: "/recruiter/candidates", label: "Candidates" },
                        { href: "/recruiter/saved-candidates", label: "Saved" }
                    ].map((item) => (
                        <Link 
                            key={item.href}
                            href={item.href}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200 relative group"
                        >
                            {item.label}
                            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-3/4 group-hover:left-1/4"></span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-4" suppressHydrationWarning={true}>
                    {!isAuthenticated ? (
                        <div className="flex space-x-3" suppressHydrationWarning={true}>
                            <Link 
                                href="/recruiter/login" 
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                            <Link 
                                href="/recruiter/register" 
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                            >
                                Get Started
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-5" suppressHydrationWarning={true}>
                            <div className="notification-wrapper" suppressHydrationWarning={true}>
                                <NotificationDropdown />
                            </div>
                            
                            <div className="relative" ref={dropdownRef2} suppressHydrationWarning={true}>
                                <button 
                                    onClick={() => setIsUserMenuOpen((prev) => !prev)} 
                                    className="flex items-center space-x-2 focus:outline-none group"
                                >
                                    {account?.avatar ? (
                                        <div className="relative" suppressHydrationWarning={true}>
                                            <img 
                                                className="h-9 w-9 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-300 transition-all duration-200" 
                                                src={account.avatar} 
                                                alt="User Profile" 
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" suppressHydrationWarning={true}></div>
                                        </div>
                                    ) : (
                                        <div className="h-9 w-9 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium border-2 border-transparent group-hover:border-indigo-300 transition-all duration-200" suppressHydrationWarning={true}>
                                            {email?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 transform origin-top-right transition-all duration-200 z-50" suppressHydrationWarning={true}>
                                        <div className="px-4 py-3 border-b border-gray-100" suppressHydrationWarning={true}>
                                            <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
                                            <p className="text-xs text-gray-500 truncate">Recruiter Account</p>
                                        </div>
                                        <ul className="py-1">
                                            <li>
                                                <Link 
                                                    href="/recruiter/profile" 
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                                                >
                                                    Your Profile
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/recruiter/settings" 
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                                                >
                                                    Account Settings
                                                </Link>
                                            </li>
                                            <li className="border-t border-gray-100">
                                                <button 
                                                    onClick={handleLogout}
                                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                                                >
                                                    Sign Out
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default RecruiterCustomTopBar;