'use client';

import { useUserContext } from '@/app/context/usercontext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const SavedJobs = () => {
    const { email, account } = useUserContext();
    const [candidate, setCandidate] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);
    const [unsavedJobs, setUnsavedJobs] = useState([]);

    useEffect(() => {
        if (email) {
            fetch(`http://localhost:8080/api/candidate/get-candidate-by-email?email=${email}`)
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
            fetch(`http://localhost:8080/api/job/get-saved-jobs/${candidate.id}`)
                .then(res => res.json())
                .then(data => {
                    setSavedJobs(data);
                })
                .catch(err => {
                    console.error('Error fetching saved jobs:', err);
                });
        }
    }, [candidate]);

    const handleUnsave = (id) => {
        fetch(`http://localhost:8080/api/job-candidate/unsave-job?jobId=${id}&candidateId=${candidate.id}`, {
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
        fetch(`http://localhost:8080/api/job-candidate/save-job?jobId=${job.id}&candidateId=${candidate.id}`, {
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
            <div className="flex flex-col items-center justify-center h-screen text-black">
                <h2 className="text-xl font-semibold mb-4">Please log in to view your saved jobs</h2>
                <Link href="/candidate/login">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                        Log in
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-black">
            <h1 className="text-3xl font-bold mb-6">Your Saved Jobs</h1>
            {savedJobs.length > 0 || unsavedJobs.length > 0 ? (
                <ul className="space-y-4">
                    {savedJobs.map(job => (
                        <li key={job.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-md">
                            <div className="flex items-center space-x-4">
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
                            <button
                                onClick={() => handleUnsave(job.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Unsave
                            </button>
                        </li>
                    ))}
                    {unsavedJobs.map(job => (
                        <li key={job.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-md">
                            <div className="flex items-center space-x-4">
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
                            <button
                                onClick={() => handleSave(job)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Save
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex justify-center items-center h-48">
                    <p className="text-gray-500 text-lg">You haven't saved any jobs yet.</p>
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
