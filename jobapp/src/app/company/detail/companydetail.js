'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiGlobe, FiPhone, FiMail, FiMapPin, FiClock, FiDollarSign, FiShare2, FiPlus, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const CompanyDetail = () => {
    const searchParams = useSearchParams();
    const companyId = searchParams.get('id');
    const [company, setCompany] = useState(null);
    const [listJob, setListJob] = useState([]);
    const [jobAmount, setJobAmount] = useState(0);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (!companyId) return;
        
        const fetchCompany = async () => {
            try {
                const res = await fetch(`/api/company/get-company-by-id/${companyId}`);
                const data = await res.json();
                setCompany(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompany();
    }, [companyId]);

    useEffect(() => {
        if (!company) return;

        const fetchListJob = async () => {
            try {
                const res = await fetch(`/api/job/get-available-job-company/${companyId}`);
                const data = await res.json();
                setListJob(data);
                setJobAmount(data.length);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListJob();
    }, [company]);

    const copyToClipboard = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const toggleFollow = () => {
        setIsFollowing(!isFollowing);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <motion.div
                    animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                    className="rounded-full h-20 w-20 border-4 border-t-emerald-500 border-r-teal-400 border-b-teal-600 border-l-emerald-400"
                ></motion.div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-gray-100"
                >
                    <div className="text-6xl mb-4">😞</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || 'Company not found.'}</p>
                    <motion.a 
                        href="/"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-md"
                    >
                        Back to Home
                    </motion.a>
                </motion.div>
            </div>
        );
    }

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-800">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 py-16 shadow-lg overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
                </div>
                
                <div className="container mx-auto px-5 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-center gap-8"
                    >
                        {company.logo && (
                            <motion.div 
                                whileHover={{ rotate: 2, scale: 1.02 }}
                                className="w-36 h-36 rounded-2xl bg-white/20 backdrop-blur-sm p-3 shadow-xl flex items-center justify-center border-2 border-white/30"
                            >
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="w-full h-full object-contain rounded-lg"
                                />
                            </motion.div>
                        )}
                        <div className="flex-1 text-white">
                            <motion.h1 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md"
                            >
                                {company.name}
                            </motion.h1>
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap items-center gap-3 mb-4"
                            >
                                {company.website && (
                                    <a
                                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm transition-all border border-white/20"
                                    >
                                        <FiGlobe size={16} />
                                        {company.website.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">
                                    {jobAmount} job{jobAmount > 1 ? 's' : ''} available
                                </span>
                            </motion.div>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-white/90 max-w-3xl text-lg leading-relaxed"
                            >
                                {company.information?.substring(0, 180)}{company.information?.length > 180 ? '...' : ''}
                            </motion.p>
                        </div>
                        <motion.button 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={toggleFollow}
                            className={`hidden md:flex items-center gap-2 ${isFollowing ? 'bg-white text-emerald-600' : 'bg-white/90 text-emerald-600 hover:bg-white'} font-semibold py-3 px-6 rounded-full shadow-lg transition-all border border-white/30`}
                        >
                            <FiPlus size={18} />
                            {isFollowing ? 'Following' : 'Follow Company'}
                        </motion.button>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-5 py-12 -mt-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column */}
                    <div className="lg:w-2/3 flex flex-col gap-8">
                        {/* About Section */}
                        <motion.div 
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                        >
                            <motion.h2 
                                variants={item}
                                className="text-2xl font-bold mb-6 text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-3"
                            >
                                <span className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-full"></span>
                                About {company.name}
                            </motion.h2>
                            <motion.p 
                                variants={item}
                                className="text-gray-700 leading-relaxed text-lg"
                            >
                                {company.information || 'No company introduction available.'}
                            </motion.p>
                            
                            {/* Stats Section */}
                            {company.employeeCount && (
                                <motion.div 
                                    variants={item}
                                    className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
                                >
                                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                        <div className="text-2xl font-bold text-emerald-600">{company.employeeCount}+</div>
                                        <div className="text-gray-500 text-sm">Employees</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                        <div className="text-2xl font-bold text-emerald-600">{new Date().getFullYear() - new Date(company.foundedDate).getFullYear()}</div>
                                        <div className="text-gray-500 text-sm">Years Experience</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                        <div className="text-2xl font-bold text-emerald-600">{jobAmount}</div>
                                        <div className="text-gray-500 text-sm">Open Positions</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                        <div className="text-2xl font-bold text-emerald-600">{company.offices || '10+'}</div>
                                        <div className="text-gray-500 text-sm">Global Offices</div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Job Listings */}
                        <motion.div 
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                        >
                            <motion.h2 
                                variants={item}
                                className="text-2xl font-bold mb-6 text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-3"
                            >
                                <span className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-full"></span>
                                Open Positions ({jobAmount})
                            </motion.h2>
                            
                            {listJob.length > 0 ? (
                                <motion.div variants={container} className="space-y-5">
                                    {listJob.map((job) => (
                                        <motion.div 
                                            key={job.id} 
                                            variants={item}
                                            whileHover={{ 
                                                y: -3,
                                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                                            }}
                                            className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 transition-all relative overflow-hidden"
                                        >
                                            {/* Decorative element */}
                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-600"></div>
                                            
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-xl text-gray-800 mb-1">{job.name}</h3>
                                                    <div className="flex flex-wrap items-center gap-4 mt-3">
                                                        {job.salary && (
                                                            <span className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full text-sm">
                                                                <FiDollarSign size={14} />
                                                                {job.salary}
                                                            </span>
                                                        )}
                                                        {job.endDate && (
                                                            <span className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-sm">
                                                                <FiClock size={14} />
                                                                Apply before {new Date(job.endDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {job.type && (
                                                            <span className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                                                                {job.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <motion.a
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    href={`/job/detail?id=${job.id}`}
                                                    className="flex-shrink-0 whitespace-nowrap bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow hover:shadow-md flex items-center gap-2"
                                                >
                                                    View Details <FiChevronRight size={18} />
                                                </motion.a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    variants={item}
                                    className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200"
                                >
                                    <div className="text-5xl mb-4 text-gray-300">📭</div>
                                    <h3 className="text-xl font-medium text-gray-500 mb-2">No open positions at this time</h3>
                                    <p className="text-gray-400 max-w-md mx-auto">We don't have any available positions right now, but check back later for new opportunities.</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:w-1/3 relative">
                        <div className="sticky top-24 space-y-6">
                            {/* Contact Card */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
                            >
                                <h2 className="text-xl font-bold mb-5 text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-3">
                                    <span className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-full"></span>
                                    Contact Information
                                </h2>
                                
                                <div className="space-y-5">
                                    {company.addressDetail && (
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                                <FiMapPin size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-1">Address</h4>
                                                <p className="text-gray-600">
                                                    {company.addressDetail}
                                                    {company.city && `, ${company.city}`}
                                                    {company.province && `, ${company.province}`}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {company.phoneNumber && (
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                                <FiPhone size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-1">Phone</h4>
                                                <p className="text-gray-600">{company.phoneNumber}</p>
                                            </div>
                                        </div>
                                    )}

                                    {company.email && (
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                                <FiMail size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-1">Email</h4>
                                                <p className="text-gray-600">{company.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {company.hrEmail && (
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                                <FiMail size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-1">HR Email</h4>
                                                <p className="text-gray-600">{company.hrEmail}</p>
                                            </div>
                                        </div>
                                    )}

                                    {company.website && (
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                                <FiGlobe size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-1">Website</h4>
                                                <a
                                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-emerald-600 hover:underline"
                                                >
                                                    {company.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Map */}
                            {company.addressDetail && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                                >
                                    <div className="p-4 border-b border-gray-100">
                                        <h3 className="font-medium text-gray-800 flex items-center gap-2">
                                            <FiMapPin size={18} className="text-emerald-500" />
                                            Location
                                        </h3>
                                    </div>
                                    <iframe
                                        title="Company Location"
                                        width="100%"
                                        height="220"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                                            `${company.addressDetail}, ${company.city || ''}, ${company.province || ''}`
                                        )}&output=embed`}
                                    ></iframe>
                                </motion.div>
                            )}

                            {/* Share Card */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
                            >
                                <h2 className="text-xl font-bold mb-5 text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-3">
                                    <span className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-full"></span>
                                    Share this company
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={copyToClipboard}
                                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 border border-gray-200"
                                >
                                    <FiShare2 size={18} className="text-emerald-500" />
                                    {copied ? 'Link Copied!' : 'Copy Company Link'}
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetail;