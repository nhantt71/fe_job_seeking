'use client'

import { useEffect, useState } from 'react';

function JobList() {
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 12;

    useEffect(() => {
        fetch('http://localhost:8080/api/job')
            .then(res => res.json())
            .then(data => setJobs(data))
    }, []);

    const totalPages = Math.ceil(jobs.length / jobsPerPage);

    const currentJobs = jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

    return (
        
        <div className="mt-4 container mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-black">Việc làm đang tuyển dụng</h1>
            <div className="grid grid-cols-3 gap-4">
                {currentJobs.map(job => (
                    <div key={job.id} className="bg-white shadow-md rounded px-4 py-6">
                        <div className="flex">
                            <div>
                                <img src={job.company.logo} alt={job.company} className="w-16 h-16 mr-4" />
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

            <div className="flex justify-center mt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                        key={number}
                        className={currentPage === number ? 'bg-blue-500 text-white px-4 py-2 rounded-md' : 'bg-gray-200 text-gray-700 px-4 py-2 rounded-md'}
                        onClick={() => setCurrentPage(number)}
                    >
                        {number}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default JobList;