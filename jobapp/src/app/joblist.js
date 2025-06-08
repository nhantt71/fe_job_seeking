'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function JobList({ jobs }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredJob, setHoveredJob] = useState(null);
    const jobsPerPage = 12;
    const router = useRouter();

    const totalPages = Math.ceil(jobs.length / jobsPerPage);
    const currentJobs = jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleJobClick = (id) => {
        router.push(`/job/detail?id=${id}`);
    };

    // Format salary with commas
    const formatSalary = (salary) => {
        return salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Your Next Opportunity</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Browse through our latest job openings from top companies
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentJobs.map((job, index) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ y: -5 }}
                        onMouseEnter={() => setHoveredJob(job.id)}
                        onMouseLeave={() => setHoveredJob(null)}
                        className="relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 cursor-pointer"
                        onClick={() => handleJobClick(job.id)}
                    >
                        <AnimatePresence>
                            {hoveredJob === job.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-0"
                                />
                            )}
                        </AnimatePresence>

                        <div className="relative z-10 p-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <img 
                                        src={job.company.logo || '/default-company.png'} 
                                        alt={job.company.name} 
                                        className="w-14 h-14 object-contain rounded-lg border border-gray-200 bg-white p-1"
                                        onError={(e) => {
                                            e.target.src = '/default-company.png';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{job.name}</h3>
                                    <p className="text-gray-700 font-medium">{job.company.name}</p>
                                    <div className="mt-2 flex items-center">
                                        <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm text-gray-500">Posted 2 days ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {job.type || 'Full-time'}
                                </span>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Salary</p>
                                    <p className="font-bold text-indigo-600">{formatSalary(job.salary)}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-center items-center mt-12">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center p-3 rounded-full shadow-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </motion.button>

                <div className="mx-4 flex space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 rounded-full ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                        <span className="flex items-end px-2">...</span>
                    )}
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center p-3 rounded-full shadow-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </motion.button>
            </div>
        </div>
    );
}

export default JobList;