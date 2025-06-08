'use client';

import { useUserContext } from '@/app/context/usercontext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SavedJobs = () => {
    const { email, account } = useUserContext();
    const [candidate, setCandidate] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);
    const [unsavedJobs, setUnsavedJobs] = useState([]);
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
            fetch(`/api/job/get-saved-jobs/${candidate.id}`)
                .then(res => res.json())
                .then(data => {
                    setSavedJobs(data);
                })
                .catch(err => {
                    console.error('Error fetching saved jobs:', err);
                })
                .finally(() => setIsLoading(false));
        }
    }, [candidate]);

    const handleUnsave = (id) => {
        fetch(`/api/job-candidate/unsave-job?jobId=${id}&candidateId=${candidate.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(res => {
                if (res.ok) {
                    setSavedJobs(savedJobs.filter(job => job.id !== id));
                    const jobToUnsaved = savedJobs.find(job => job.id === id);
                    if (jobToUnsaved) {
                        setUnsavedJobs([...unsavedJobs, jobToUnsaved]);
                    }
                } else {
                    console.error('Error unsaving job:', res.statusText);
                }
            })
            .catch(err => {
                console.error('Error:', err);
            });
    };

    const handleSave = (job) => {
        fetch(`/api/job-candidate/save-job?jobId=${job.id}&candidateId=${candidate.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => {
                if (res.ok) {
                    setSavedJobs([...savedJobs, job]);
                    setUnsavedJobs(unsavedJobs.filter(unsavedJob => unsavedJob.id !== job.id));
                } else {
                    console.error('Error saving job:', res.statusText);
                }
            })
            .catch(err => {
                console.error('Error:', err);
            });
    };

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Your Saved Jobs</h2>
                    <p className="text-gray-600 mb-6">Log in to view and manage your saved job opportunities</p>
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
                    <p className="text-gray-600">Loading your saved jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                        Your <span className="text-blue-600">Saved Jobs</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        {savedJobs.length > 0 
                            ? "Your personalized collection of opportunities"
                            : "Start building your future by saving interesting positions"}
                    </p>
                </div>

                <AnimatePresence>
                    {savedJobs.length === 0 && unsavedJobs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-xl shadow-sm p-8 text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No saved jobs yet</h3>
                            <p className="text-gray-500 mb-6">When you find jobs you're interested in, save them here to review later</p>
                            <Link href="/jobs">
                                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200">
                                    Browse Jobs
                                </button>
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {savedJobs.map(job => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                                >
                                    <div className="p-6 sm:flex sm:items-center sm:justify-between">
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
                                        <div className="mt-4 sm:mt-0 sm:ml-4">
                                            <button
                                                onClick={() => handleUnsave(job.id)}
                                                className="px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200 flex items-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                                Saved
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {unsavedJobs.length > 0 && (
                                <div className="mt-12">
                                    <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                        Previously Saved
                                    </h3>
                                    <div className="space-y-4">
                                        {unsavedJobs.map(job => (
                                            <motion.div
                                                key={job.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: 50 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border-l-4 border-gray-200"
                                            >
                                                <div className="p-6 sm:flex sm:items-center sm:justify-between">
                                                    <div className="flex items-start space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src={job.companyLogo || '/default-logo.png'}
                                                                alt={`${job.companyName} logo`}
                                                                className="h-12 w-12 rounded-full object-cover border border-gray-200"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <Link href={`/job/detail?id=${job.id}`}>
                                                                <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200 mb-1">
                                                                    {job.name}
                                                                </h2>
                                                            </Link>
                                                            <p className="text-gray-500 text-sm">{job.companyName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 sm:mt-0 sm:ml-4">
                                                        <button
                                                            onClick={() => handleSave(job)}
                                                            className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 flex items-center"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SavedJobs;