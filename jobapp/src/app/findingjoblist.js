import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiX, FiExternalLink, FiChevronRight } from 'react-icons/fi';

const FindingJobList = ({ jobs }) => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [boxPosition, setBoxPosition] = useState({ top: 0 });
    const jobRefs = useRef({});
    const containerRef = useRef(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchMode, setSearchMode] = useState(false);
    const searchParams = useSearchParams();
    const cateId = searchParams.get('cateId');
    const router = useRouter();

    const handleQuickView = (job, id) => {
        setSelectedJob(job);
        const jobRect = jobRefs.current[id].getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setBoxPosition({    
            top: jobRect.top - containerRect.top
        });
    };

    const handleSearch = (searchQuery) => {
        const { keyword, province, categoryId } = searchQuery;
        const params = new URLSearchParams();

        if (keyword) params.append('keyword', keyword);
        if (province) params.append('province', province);
        if (categoryId) params.append('categoryId', categoryId);

        const queryString = params.toString();
        const queryParams = queryString ? `?${queryString}` : '';

        fetch(`/api/job/search${queryParams}`)
            .then(res => res.json())
            .then(data => {
                setSearchResults(data);
                setSearchMode(true);
            })
            .catch(error => {
                alert('An error occurred while fetching search results.');
                setSearchMode(false);
            });
    };

    useEffect(() => {
        if (cateId) {
            handleSearch({ categoryId: cateId });
        }
    }, [cateId]);

    useEffect(() => {
        const handleResize = () => setSelectedJob(null);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="flex justify-center relative px-4">
            <div
                className={`w-full max-w-4xl relative transition-all duration-500 ease-in-out ${selectedJob ? 'mr-[620px]' : ''}`}
                ref={containerRef}
            >
                {(searchMode ? searchResults : jobs).map((job) => (
                    <div
                        key={job.id}
                        className="flex border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mt-4 bg-white relative cursor-pointer group hover:border-blue-100"
                        ref={el => jobRefs.current[job.id] = el}
                        onClick={() => router.push(`/job/detail?id=${job.id}`)}
                    >
                        <div className="mr-4 flex-shrink-0">
                            <img
                                src={job.companyLogo || '/default-company.png'}
                                alt={`${job.companyName} logo`}
                                className="w-16 h-16 rounded-lg object-cover border border-gray-100 group-hover:border-blue-200 transition-colors"
                                onError={(e) => {
                                    e.target.src = '/default-company.png';
                                }}
                            />
                        </div>
                        <div className="flex-grow flex flex-col md:flex-row">
                            <div className="flex-grow">
                                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors pr-2">
                                    {job.name}
                                    <span className="ml-2 text-xs font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                                        {job.jobType || 'Full-time'}
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-600 mb-2 flex items-center">
                                    <FiBriefcase className="mr-1" /> {job.companyName}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <FiMapPin className="mr-1" /> {job.address}
                                    </span>
                                    <span className="flex items-center">
                                        <FiClock className="mr-1" /> Updated {job.createdDate}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end mt-4 md:mt-0 md:ml-4">
                                <span className="text-lg font-semibold text-green-600 mb-2 flex items-center">
                                    <FiDollarSign className="mr-1" /> {job.salary}
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickView(job, job.id);
                                        }}
                                        className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 font-medium py-1.5 px-4 rounded-lg text-sm transition-colors flex items-center"
                                    >
                                        Quick View
                                    </button>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-lg text-sm transition-colors flex items-center"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedJob && (
                <div
                    className="ml-8 p-6 rounded-xl shadow-lg bg-white border border-gray-100"
                    style={{
                        position: 'absolute',
                        top: boxPosition.top,
                        left: 'calc(50% + 250px)',
                        width: '580px',
                        maxHeight: 'calc(100vh - 100px)',
                        overflowY: 'auto',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease-out',
                        zIndex: 10,
                    }}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{selectedJob.name}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-sm font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                                    {selectedJob.jobType || 'Full-time'}
                                </span>
                                <span className="flex items-center text-sm text-gray-600">
                                    <FiMapPin className="mr-1" /> {selectedJob.address}
                                </span>
                                <span className="flex items-center text-sm text-gray-600">
                                    <FiClock className="mr-1" /> Posted {selectedJob.createdDate}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedJob(null)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Salary</h3>
                                <p className="text-lg font-semibold text-green-600 flex items-center">
                                    <FiDollarSign className="mr-1" /> {selectedJob.salary}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Experience</h3>
                                <p className="text-lg font-medium text-gray-700">{selectedJob.experience}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h3>
                        <div className="prose max-w-none text-gray-700">
                            {selectedJob.detail.split('\n').map((paragraph, i) => (
                                <p key={i} className="mb-3">{paragraph}</p>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Company</h3>
                        <div className="flex items-center">
                            <img
                                src={selectedJob.companyLogo || '/default-company.png'}
                                alt={`${selectedJob.companyName} logo`}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 mr-3"
                                onError={(e) => {
                                    e.target.src = '/default-company.png';
                                }}
                            />
                            <div>
                                <p className="font-medium text-gray-800">{selectedJob.companyName}</p>
                                <Link 
                                    href={`/company/${selectedJob.companyId}`} 
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors"
                                >
                                    View company profile <FiChevronRight className="ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/job/detail?id=${selectedJob.id}`);
                            }}
                            className="flex-1 bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                            View Full Details <FiExternalLink className="ml-2" />
                        </button>
                        <button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Apply Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindingJobList;