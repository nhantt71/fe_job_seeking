'use client';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { useState } from 'react';

const PaginationButtons = () => {
    const [currentPage, setCurrentPage] = useState(1);
    
    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const handleNext = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    return (
        <div className="flex justify-center items-center space-x-4">
            <button 
                onClick={handlePrev} 
                disabled={currentPage === 1}
                className={`flex justify-center items-center w-10 h-10 rounded-full border ${currentPage === 1 ? 'border-gray-300 text-gray-300' : 'border-green-500 text-green-500'} hover:bg-gray-100`}
            >
                <ChevronLeftIcon className="w-6 h-6"/>
            </button>

            <button 
                onClick={handleNext} 
                className="flex justify-center items-center w-10 h-10 rounded-full border border-green-500 text-green-500 hover:bg-gray-100"
            >
                <ChevronRightIcon className="w-6 h-6"/>
            </button>
        </div>
    );
};

export default PaginationButtons;
