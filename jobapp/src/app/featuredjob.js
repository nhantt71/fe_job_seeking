'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const FeaturedJobs = ({ categoryId, icon, name, jobCount }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/job?cateId=${categoryId}`);
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className="relative group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:border-blue-100"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
            
            <div className="relative z-10 p-6 flex flex-col items-center text-center">
                <div className="mb-4 p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                    <img 
                        src={icon || '/default-category.svg'} 
                        alt={name} 
                        className="h-12 w-12 object-contain"
                        onError={(e) => {
                            e.target.src = '/default-category.svg';
                        }}
                    />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                    {name}
                </h3>
                
                <div className="flex items-center justify-center mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group-hover:bg-blue-200 group-hover:text-blue-900 transition-colors duration-300">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
                    </span>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-300 flex items-center">
                    Explore opportunities
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
};

export default FeaturedJobs;