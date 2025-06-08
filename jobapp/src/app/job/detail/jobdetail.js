'use client';

import { useUserContext } from '@/app/context/usercontext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { db } from '@/app/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FiBookmark, FiShare2, FiClock, FiMapPin, FiDollarSign, FiBriefcase, FiExternalLink, FiChevronRight } from 'react-icons/fi';

export default function JobDetail() {
    const [job, setJob] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [candidate, setCandidate] = useState(null);
    const [company, setCompany] = useState(null);
    const [notification, setNotification] = useState(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const { email } = useUserContext();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const res = await fetch(`/api/candidate/get-candidate-by-email?email=${email}`);
                if (!res.ok) throw new Error('Failed to fetch candidate');
                const data = await res.json();
                setCandidate(data);
            } catch (err) {
                console.error('Error fetching candidate:', err);
            }
        };

        if (email) fetchCandidate();
    }, [email]);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/job/detail/${id}`);
                if (!res.ok) throw new Error('Failed to fetch job detail');
                const data = await res.json();
                setJob(data);
                
                if (data.companyId) {
                    const companyRes = await fetch(`/api/company/get-company-by-id/${data.companyId}`);
                    if (!companyRes.ok) throw new Error('Failed to fetch company details');
                    const companyData = await companyRes.json();
                    setCompany(companyData);
                }
            } catch (err) {
                console.error('Error fetching job detail:', err);
                setError('Failed to load job detail.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchJob();
    }, [id]);

    useEffect(() => {
        const checkSavedStatus = async () => {
            try {
                const res = await fetch(`/api/job-candidate/check-saved-job?candidateId=${candidate.id}&jobId=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setIsSaved(data);
                } else {
                    setIsSaved(false);
                }
            } catch (err) {
                console.error('Error checking saved job:', err);
            }
        };

        if (candidate && id) checkSavedStatus();
    }, [candidate, id]);

    const handleSaveClick = useCallback(async () => {
        if (!email) {
            alert("You must be logged in to save this job!");
            return;
        }
        if (!candidate) return;

        const url = isSaved
            ? `/api/job-candidate/unsave-job?jobId=${id}&candidateId=${candidate.id}`
            : `/api/job-candidate/save-job?jobId=${id}&candidateId=${candidate.id}`;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setIsSaved(!isSaved);
                setNotification(isSaved ? 'Job unsaved successfully' : 'Job saved successfully');
                setTimeout(() => setNotification(null), 3000);

                try {
                    await addDoc(collection(db, 'notifications', email, 'items'), {
                        email,
                        action: isSaved ? 'Unsave' : 'Save',
                        jobName: job.name,
                        companyName: company?.name || '',
                        jobId: id,
                        read: false,
                        timestamp: serverTimestamp(),
                    });
                } catch (firebaseError) {
                    console.error('Failed to write notification to Firebase:', firebaseError);
                }
            }
        } catch (err) {
            alert('An error occurred while saving/unsaving the job.');
        }
    }, [email, candidate, id, isSaved, job, company]);

    const handleApplyClick = useCallback(() => {
        if (!email) {
            alert("You must be logged in to apply!");
            return;
        }
        router.push(`apply?id=${id}`);
    }, [email, id, router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                {error}
            </div>
        </div>
    );
    
    if (!job) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded max-w-md">
                Job not found
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up">
                        {notification}
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1">
                    {/* Job Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.name}</h1>
                                <div className="flex items-center text-lg text-gray-600 mb-4">
                                    {company && (
                                        <span className="flex items-center">
                                            <FiBriefcase className="mr-1.5" /> {company.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={handleSaveClick}
                                className={`flex items-center justify-center p-2 rounded-full ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                aria-label={isSaved ? 'Unsave job' : 'Save job'}
                            >
                                <FiBookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center text-gray-600 mb-1">
                                    <FiDollarSign className="mr-2" />
                                    <span className="text-sm">Salary</span>
                                </div>
                                <div className="text-lg font-semibold text-green-600">{job.salary}</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 text-gray-600">
                                <div className="flex items-center text-gray-600 mb-1">
                                    <FiMapPin className="mr-2" />
                                    <span className="text-sm">Location</span>
                                </div>
                                <div className="text-lg font-semibold">{job.address}</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 text-gray-600">
                                <div className="flex items-center text-gray-600 mb-1">
                                    <FiClock className="mr-2" />
                                    <span className="text-sm">Experience</span>
                                </div>
                                <div className="text-lg font-semibold">{job.experience}</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleApplyClick}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-sm flex items-center justify-center"
                            >
                                Apply Now
                                <FiChevronRight className="ml-1" />
                            </button>
                            <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center">
                                <FiShare2 className="mr-2" />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Job Description</h2>
                        <div className="prose max-w-none text-gray-700">
                            {Array.isArray(job.detail) ? (
                                <ul className="space-y-3">
                                    {job.detail.map((item, index) => (
                                        <li key={index} className="flex">
                                            <span className="text-green-500 mr-2">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{job.detail}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:w-80 space-y-6">
                    {/* Company Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">About the Company</h3>
                        {company ? (
                            <>
                                <div className="flex items-center mb-4 text-black">
                                    <img
                                        src={company.logo || '/default-company.png'}
                                        alt={`${company.name} logo`}
                                        className="w-16 h-16 rounded-lg object-cover border border-gray-200 mr-4"
                                        onError={(e) => {
                                            e.target.src = '/default-company.png';
                                        }}
                                    />
                                    <div>
                                        <h4 className="font-semibold text-lg">{company.name}</h4>
                                        <button
                                            onClick={() => router.push(`/company/detail?id=${company.id}`)}
                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors mt-1"
                                        >
                                            View profile <FiExternalLink className="ml-1" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm text-gray-600">
                                    {company.email && (
                                        <div className="flex items-start">
                                            <span className="font-medium w-20">Email:</span>
                                            <span>{company.email}</span>
                                        </div>
                                    )}
                                    {company.phoneNumber && (
                                        <div className="flex items-start">
                                            <span className="font-medium w-20">Phone:</span>
                                            <span>{company.phoneNumber}</span>
                                        </div>
                                    )}
                                    {company.website && (
                                        <div className="flex items-start">
                                            <span className="font-medium w-20">Website:</span>
                                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {company.website}
                                            </a>
                                        </div>
                                    )}
                                    {company.addressDetail && (
                                        <div className="flex items-start">
                                            <span className="font-medium w-20">Address:</span>
                                            <span>{company.addressDetail}, {company.city}, {company.province}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-500">Loading company information...</div>
                        )}
                    </div>

                    {/* Job Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Job Summary</h3>
                        <div className="space-y-4 text-black">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Posted on</h4>
                                <p>{job.createdDate}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Deadline</h4>
                                <p>{job.endDate}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Job Type</h4>
                                <p>{job.jobType || 'Full-time'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Category</h4>
                                <p>{job.categoryName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Apply */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Ready to apply?</h3>
                        <p className="text-gray-600 mb-4">Submit your application with just one click.</p>
                        <button
                            onClick={handleApplyClick}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                            Apply Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}