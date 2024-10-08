import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const CustomTopBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen1, setIsOpen1] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownRef1 = useRef(null);
    const dropdownRef2 = useRef(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                (dropdownRef.current && !dropdownRef.current.contains(event.target)) &&
                (dropdownRef1.current && !dropdownRef1.current.contains(event.target)) &&
                (dropdownRef2.current && !dropdownRef2.current.contains(event.target))
            ) {
                setIsOpen(false);
                setIsOpen1(false);
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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
                        <button
                            onClick={() => setIsOpen((prev) => !prev)}
                            className="hover:text-green-600 text-sm"
                        >
                            Profile & CV
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                <ul>
                                    <li className="px-4 py-2 hover:bg-gray-100">
                                        <Link href="/profile" className="text-gray-700">
                                            Profile
                                        </Link>
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-100">
                                        <Link href="/cv" className="text-gray-700">
                                            CV
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="relative inline-block text-center" ref={dropdownRef1}>
                        <button
                            onClick={() => setIsOpen1((prev) => !prev)}
                            className="hover:text-green-600 text-sm"
                        >
                            Your Jobs
                        </button>

                        {isOpen1 && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                <ul>
                                    <li className="px-4 py-2 hover:bg-gray-100">
                                        <Link href="/job/applied" className="text-gray-700">
                                            Saved Jobs
                                        </Link>
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-100">
                                        <Link href="/job/saved" className="text-gray-700">
                                            Applied Jobs
                                        </Link>
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
                        <a href="#" className="text-gray-600 hover:text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a7.002 7.002 0 00-6-6.917V3a2 2 0 10-4 0v1.083A7.002 7.002 0 002 11v3.158c0 .538-.214 1.055-.595 1.437L0 17h5m4 0v2a2 2 0 104 0v-2m-4 0h4"></path>
                            </svg>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 13v-2a7 7 0 00-14 0v2m14 0a5 5 0 01-10 0m10 0v5a2 2 0 11-4 0v-5m4 0H5"></path>
                            </svg>
                        </a>
                        <div className="relative" ref={dropdownRef2}>
                            <button onClick={() => setIsUserMenuOpen((prev) => !prev)} className="flex items-center space-x-2 focus:outline-none">
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src="https://res.cloudinary.com/dsp3ymism/image/upload/v1727003509/wmxpdyr6oftjnzcyrusr.jpg"
                                    alt="User Profile"
                                />
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                    <ul>
                                        <li className="px-4 py-2 hover:bg-gray-100">
                                            <Link href="/profile" className="text-gray-700">
                                                Your Profile
                                            </Link>
                                        </li>
                                        <li className="px-4 py-2 hover:bg-gray-100">
                                            <button className="text-gray-700" onClick={() => alert('Logout functionality goes here!')}>
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
};

export default CustomTopBar;
