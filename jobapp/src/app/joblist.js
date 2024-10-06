'use client'

import { useEffect, useState } from 'react';

function JobList() {
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 12;

    useEffect(() => {
        fetch('http://localhost:8080/api/job')
            .then(res => res.json())
            .then(data => setJobs(data));
    }, []);

    const totalPages = Math.ceil(jobs.length / jobsPerPage);
    const currentJobs = jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="mt-4 container mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-black">Việc làm đang tuyển dụng</h1>
            <div className="grid grid-cols-3 gap-4">
                {currentJobs.map(job => (
                    <div key={job.id} className="bg-white shadow-md rounded px-4 py-6">
                        <div className="flex">
                            <div>
                                <img src={job.company.logo} alt={job.company.name} className="w-16 h-16 mr-4" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-black">{job.name}</h3>
                                <p className="text-gray-700 text-black">{job.company.name}</p>
                                <p className="text-gray-500 text-black">{job.salary} VND</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center items-center mt-4">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    ⬅️
                </button>
                <span className="mx-4 text-gray-700">{currentPage} / {totalPages} trang</span>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    ➡️
                </button>
            </div>
        </div>
    );
}

export default JobList;
