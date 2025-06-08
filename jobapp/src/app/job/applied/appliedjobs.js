'use client';

import { useUserContext } from '@/app/context/usercontext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AppliedJobs = () => {
    const { email, account, setUserData } = useUserContext();
    const [candidate, setCandidate] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (email) {
            setIsLoading(true);
            fetch(`/api/candidate/get-candidate-by-email?email=${email}`)
                .then(res => res.json())
                .then(data => {
                    setCandidate(data);
                })
                .catch(error => {
                    console.error('Error fetching candidate:', error);
                })
                .finally(() => setIsLoading(false));
        }
    }, [email]);

    useEffect(() => {
        if (candidate) {
            setIsLoading(true);
            fetch(`/api/job/get-applied-jobs/${candidate.id}`)
                .then(res => res.json())
                .then(data => {
                    setAppliedJobs(data);
                })
                .catch(err => {
                    console.error('Error fetching applied jobs:', err);
                })
                .finally(() => setIsLoading(false));
        }
    }, [candidate]);

    if (!account) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Your Job Applications</h2>
                    <p className="text-gray-600 mb-6">Log in to view and track your job applications</p>
                    <Link href="/candidate/login">
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                            Log in to Your Account
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">Loading your applications...</p>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
            'reviewed': { color: 'bg-blue-100 text-blue-800', icon: '👀' },
            'interview': { color: 'bg-purple-100 text-purple-800', icon: '💼' },
            'rejected': { color: 'bg-red-100 text-red-800', icon: '❌' },
            'accepted': { color: 'bg-green-100 text-green-800', icon: '✅' },
            'default': { color: 'bg-gray-100 text-gray-800', icon: 'ℹ️' }
        };

        const config = statusConfig[status?.toLowerCase()] || statusConfig['default'];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.icon} <span className="ml-1 capitalize">{status || 'Applied'}</span>
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                        Your <span className="text-blue-600">Applications</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        {appliedJobs.length > 0 
                            ? "Track all your job applications in one place"
                            : "Your future opportunities start with that first application"}
                    </p>
                </div>

                <AnimatePresence>
                    {appliedJobs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-xl shadow-sm p-8 text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No applications yet</h3>
                            <p className="text-gray-500 mb-6">When you apply to jobs, they'll appear here with status updates</p>
                            <Link href="/jobs">
                                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200">
                                    Browse Jobs
                                </button>
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {appliedJobs.map((job) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="sm:flex sm:items-center sm:justify-between">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={job.companyLogo || '/default-logo.png'}
                                                        alt={`${job.companyName} logo`}
                                                        className="h-14 w-14 rounded-full object-cover border border-gray-200"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/job/detail?id=${job.id}`}>
                                                        <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-1">
                                                            {job.name}
                                                        </h2>
                                                    </Link>
                                                    <p className="text-gray-600 mb-2">{job.companyName}</p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {job.skills && job.skills.slice(0, 3).map((skill, index) => (
                                                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 sm:mt-0 sm:ml-4 sm:text-right">
                                                {getStatusBadge(job.applicationStatus)}
                                                {job.salary && (
                                                    <p className="text-green-600 font-semibold mt-2">${job.salary.toLocaleString()}/year</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {job.address || 'Remote'}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Applied on {new Date(job.applicationDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AppliedJobs;