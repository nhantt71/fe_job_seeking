'use client';

import { FaFacebookF, FaGithub, FaLinkedinIn, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-16 pb-8" suppressHydrationWarning={true}>
            <div className="container mx-auto px-6 lg:px-8" suppressHydrationWarning={true}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12" suppressHydrationWarning={true}>
                    {/* Company Info */}
                    <div className="space-y-6" suppressHydrationWarning={true}>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                            TalentHire
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                            Connecting top talent with leading companies worldwide through innovative recruitment solutions.
                        </p>
                        <div className="flex space-x-4" suppressHydrationWarning={true}>
                            <a 
                                href="https://www.facebook.com/profile.php?id=100035672183201" 
                                className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-green-500 transition-all duration-300 group"
                                aria-label="Facebook"
                            >
                                <FaFacebookF className="text-white group-hover:text-gray-900 transition-colors duration-300" />
                            </a>
                            <a 
                                href="https://github.com/nhantt71" 
                                className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-green-500 transition-all duration-300 group"
                                aria-label="GitHub"
                            >
                                <FaGithub className="text-white group-hover:text-gray-900 transition-colors duration-300" />
                            </a>
                            <a 
                                href="https://www.linkedin.com/in/nh%C3%A2n-t%C3%B4-41873b298/" 
                                className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-green-500 transition-all duration-300 group"
                                aria-label="LinkedIn"
                            >
                                <FaLinkedinIn className="text-white group-hover:text-gray-900 transition-colors duration-300" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div suppressHydrationWarning={true}>
                        <h3 className="text-lg font-semibold mb-6 relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-gradient-to-r after:from-green-400 after:to-blue-500">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'About Us', href: '#' },
                                { label: 'Services', href: '#' },
                                { label: 'Pricing', href: '#' },
                                { label: 'Privacy Policy', href: '#' },
                                { label: 'Terms of Service', href: '#' },
                            ].map((item, index) => (
                                <li key={index}>
                                    <a 
                                        href={item.href} 
                                        className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center group"
                                    >
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div suppressHydrationWarning={true}>
                        <h3 className="text-lg font-semibold mb-6 relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-gradient-to-r after:from-green-400 after:to-blue-500">
                            Services
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Recruitment', href: '#' },
                                { label: 'Talent Sourcing', href: '#' },
                                { label: 'HR Consulting', href: '#' },
                                { label: 'Career Coaching', href: '#' },
                                { label: 'Interview Training', href: '#' },
                            ].map((item, index) => (
                                <li key={index}>
                                    <a 
                                        href={item.href} 
                                        className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center group"
                                    >
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div suppressHydrationWarning={true}>
                        <h3 className="text-lg font-semibold mb-6 relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-gradient-to-r after:from-green-400 after:to-blue-500">
                            Contact Us
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <FaMapMarkerAlt className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                                <span className="text-gray-300">Go Vap, Ho Chi Minh, Vietnam</span>
                            </li>
                            <li className="flex items-center">
                                <FaEnvelope className="text-green-400 mr-3 flex-shrink-0" />
                                <a 
                                    href="mailto:tonhanlk7103@gmail.com" 
                                    className="text-gray-300 hover:text-green-400 transition-colors duration-200"
                                >
                                    tonhanlk7103@gmail.com
                                </a>
                            </li>
                            <li className="flex items-center">
                                <FaPhoneAlt className="text-green-400 mr-3 flex-shrink-0" />
                                <a 
                                    href="tel:+84916072042" 
                                    className="text-gray-300 hover:text-green-400 transition-colors duration-200"
                                >
                                    +84 916 072 042
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-16 pt-8 border-t border-gray-700" suppressHydrationWarning={true}>
                    <div className="flex flex-col md:flex-row justify-between items-center" suppressHydrationWarning={true}>
                        <p className="text-gray-400 text-sm mb-4 md:mb-0">
                            &copy; {new Date().getFullYear()} Trong Nhan's Company. All rights reserved.
                        </p>
                        <div className="flex space-x-6" suppressHydrationWarning={true}>
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm">Terms of Service</a>
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm">Sitemap</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;