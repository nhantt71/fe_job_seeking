"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiBriefcase, FiDollarSign, FiMapPin, FiClock, FiX, FiArrowRight } from 'react-icons/fi';

const RelatedJob = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [selectedJob, setSelectedJob] = useState(null);
    const [relatedJobs, setRelatedJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [listJobId, setListJobId] = useState([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const fetchJobIds = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/related-jobs/${id}`);
                if (!res.ok) throw new Error('Failed to fetch jobIds');
                const data = await res.json();
                const jobIds = data.map(job => job.jobId);
                setListJobId(jobIds);
            } catch (err) {
                console.error('Error fetching related jobIds:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchJobIds();
    }, [id]);

    useEffect(() => {
        const fetchRelatedJobs = async () => {
            setRelatedJobs([]);
            try {
                for (const jobId of listJobId) {
                    const res = await fetch(`/api/job/detail/${jobId}`);
                    if (!res.ok) throw new Error('Failed to fetch related jobs');
                    const data = await res.json();
                    setRelatedJobs(prev => {
                        if (prev.find(job => job.id === data.id)) return prev;
                        return [...prev, data];
                    });
                }
            } catch (err) {
                console.error('Error fetching related jobs:', err);
            }
        };

        if (listJobId.length > 0) fetchRelatedJobs();
    }, [listJobId]);

    if (!isClient) {
        return (
            <div className="flex justify-center items-center p-4 w-full h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main content - same width as job description */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Related Job Opportunities</h2>
                            <p className="text-gray-600">Discover similar positions that match your interests</p>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : listJobId.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                                        <FiBriefcase className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">No related jobs found</h3>
                                    <p className="mt-1 text-gray-500">We couldn't find any jobs related to this position.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {relatedJobs.map(job => (
                                    <Link
                                        key={job.id}
                                        href={`/job/detail?id=${job.id}`}
                                        className="block transform transition-all hover:-translate-y-1 hover:shadow-lg"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:border-blue-200">
                                            <div className="p-6">
                                                <div className="flex flex-col sm:flex-row">
                                                    <div className="flex-grow">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center mr-4">
                                                                <FiBriefcase className="h-6 w-6 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <h2 className="text-lg font-bold text-gray-800">{job.name}</h2>
                                                                <p className="text-sm font-medium text-blue-600">{job.companyName}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 flex flex-wrap gap-3">
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <FiMapPin className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                                                {job.address}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <FiClock className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                                                Updated {job.createdDate}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col items-end">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                            <FiDollarSign className="mr-1" />
                                                            {job.salary}
                                                        </span>
                                                        <div className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-800">
                                                            <span className="text-sm font-medium">View Details</span>
                                                            <FiArrowRight className="ml-1 h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Empty sidebar to match JobDetail layout */}
                    <div className="lg:w-80"></div>
                </div>
            </div>
        </div>
    );
};

export default RelatedJob;