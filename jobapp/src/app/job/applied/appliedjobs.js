'use client';

import { useUserContext } from '@/app/context/usercontext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const AppliedJobs = () => {
    const { email, account, setUserData } = useUserContext();
    const [candidate, setCandidate] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);

    useEffect(() => {
        if (email) {
            fetch(`/api/candidate/get-candidate-by-email?email=${email}`)
                .then(res => res.json())
                .then(data => {
                    setCandidate(data);
                })
                .catch(error => {
                    console.error('Error fetching candidate:', error);
                });
        }
    }, [email]);

    useEffect(() => {
        if (candidate) {
            fetch(`/api/job/get-applied-jobs/${candidate.id}`)
                .then(res => res.json())
                .then(data => {
                    setAppliedJobs(data);
                })
                .catch(err => {
                    console.error('Error fetching applied jobs:', err);
                });
        }
    }, [candidate]);

    // Nếu người dùng chưa đăng nhập, hiển thị yêu cầu đăng nhập
    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-black">
                <h2 className="text-xl font-semibold mb-4">Please log in to view your applied jobs</h2>
                <Link href="/candidate/login">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                        Log in
                    </button>
                </Link>
            </div>
        );
    }

    // Hiển thị danh sách công việc đã ứng tuyển
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-black">
            <h1 className="text-3xl font-bold mb-6">Your Applied Jobs</h1>
            {appliedJobs.length > 0 ? (
                <ul className="space-y-4">
                    {appliedJobs.map(job => (
                        <li key={job.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-md">
                            <div className="flex items-center space-x-4">
                                {/* Hiển thị logo công ty */}
                                <img
                                    src={job.companyLogo || '/default-logo.png'}
                                    alt={`${job.companyName} logo`}
                                    className="w-12 h-12 object-cover rounded-full"
                                />
                                <div>
                                    <Link href={`/job/detail?id=${job.id}`}>
                                        <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                                            {job.name}
                                        </h2>
                                    </Link>
                                    <p className="text-gray-500">{job.companyName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {/* Hiển thị mức lương nếu có */}
                                {job.salary && <p className="text-green-600 font-semibold">Salary: {job.salary}</p>}
                                <p className="text-gray-500 text-sm">Location: {job.address}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex justify-center items-center h-48">
                    <p className="text-gray-500 text-lg">You haven't applied for any jobs yet.</p>
                </div>
            )}
        </div>
    );
};

export default AppliedJobs;
