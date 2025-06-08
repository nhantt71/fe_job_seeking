'use client';

import { useState, useEffect } from 'react';
import { useRecruiterContext } from '../../context/recruitercontext';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentIcon, SparklesIcon, UserIcon, PhoneIcon, EnvelopeIcon, BriefcaseIcon, ChartBarIcon, AdjustmentsHorizontalIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// SafeDiv component to handle hydration warnings
const SafeDiv = ({ children, className, ...props }) => {
    return (
        <div className={className} suppressHydrationWarning {...props}>
            {children}
        </div>
    );
};

// SafeMotion component to handle hydration warnings for motion components
const SafeMotion = ({ children, as = motion.div, className, ...props }) => {
    const Component = as;
    return (
        <Component className={className} suppressHydrationWarning {...props}>
            {children}
        </Component>
    );
};

// CV Preview component with elegant design
const CVPreview = ({ fileUrl, onClick }) => {
    const [thumbnailSrc, setThumbnailSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!fileUrl) {
            setIsLoading(false);
            setError("No file URL provided");
            return;
        }

        generateThumbnail(fileUrl)
            .then(src => {
                setThumbnailSrc(src);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to generate thumbnail:", err);
                setError(err.message);
                setIsLoading(false);
            });
    }, [fileUrl]);

    const generateThumbnail = async (url) => {
        if (url.toLowerCase().endsWith('.pdf')) {
            const token = localStorage.getItem('token');
            const apiUrl = `/api/pdf/convert-from-url?pdfUrl=${encodeURIComponent(url)}&format=png&dpi=150&page=1`;

            const response = await fetch(apiUrl, { 
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`Failed to get PDF thumbnail: ${response.status}`);

            const data = await response.json();
            return `data:image/png;base64,${data[0]}`;
        }
        return url;
    };

    if (isLoading) return (
        <SafeMotion 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
        >
            <SafeDiv className="animate-pulse flex flex-col items-center">
                <SafeDiv className="h-8 w-8 bg-gray-200 rounded-full mb-2"></SafeDiv>
                <p className="text-gray-500 text-sm">Loading preview...</p>
            </SafeDiv>
        </SafeMotion>
    );

    if (error) return (
        <SafeDiv className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <SafeDiv className="text-center text-gray-400">
                <DocumentIcon className="h-8 w-8 mx-auto" />
                <p className="mt-2 text-sm">Preview unavailable</p>
            </SafeDiv>
        </SafeDiv>
    );

    return (
        <SafeMotion 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="relative cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200"
            onClick={onClick}
        >
            <img 
                src={thumbnailSrc} 
                alt="CV Preview" 
                className="w-full h-full object-cover"
            />
            <SafeDiv className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white font-medium text-sm bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    View CV
                </span>
            </SafeDiv>
        </SafeMotion>
    );
};

// CV Modal component
const CVModal = ({ fileUrl, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [pages, setPages] = useState([]);
    const [error, setError] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    useEffect(() => {
        if (!fileUrl) {
            setIsLoading(false);
            setError("No file URL provided");
            return;
        }

        if (fileUrl.toLowerCase().endsWith('.pdf')) {
            fetchPdfPages(fileUrl);
        } else {
            setPages([fileUrl]);
            setIsLoading(false);
        }
    }, [fileUrl]);

    const fetchPdfPages = async (url) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = `/api/pdf/convert-from-url?pdfUrl=${encodeURIComponent(url)}&format=png&dpi=150&maxPages=10`;

            const response = await fetch(apiUrl, { 
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`Failed to get PDF pages: ${response.status}`);

            const data = await response.json();
            const pagesData = data.map(base64 => `data:image/png;base64,${base64}`);
            setPages(pagesData);
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching PDF pages:", err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <SafeMotion 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4"
        >
            <SafeMotion 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
                <SafeDiv className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-xl font-semibold text-gray-800">CV Preview</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </SafeDiv>
                
                <SafeDiv className="flex-1 overflow-auto p-6 bg-gray-50 flex flex-col items-center justify-center">
                    {isLoading ? (
                        <SafeDiv className="flex items-center justify-center h-full">
                            <SafeDiv className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></SafeDiv>
                        </SafeDiv>
                    ) : error ? (
                        <SafeDiv className="text-center max-w-md">
                            <DocumentIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h4 className="text-lg font-medium text-gray-700 mb-2">Error loading CV</h4>
                            <p className="text-gray-500 mb-6">{error}</p>
                            <SafeDiv className="flex gap-3 justify-center">
                                <a 
                                    href={fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <span>Download File</span>
                                </a>
                                <button 
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </SafeDiv>
                        </SafeDiv>
                    ) : (
                        <SafeDiv className="relative w-full h-full flex flex-col items-center">
                            {pages.length > 0 && (
                                <>
                                    <SafeDiv className="absolute top-0 left-0 right-0 flex justify-center py-4 z-10">
                                        <SafeDiv className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-700">
                                            Page {currentPageIndex + 1} of {pages.length}
                                        </SafeDiv>
                                    </SafeDiv>
                                    
                                    <SafeMotion 
                                        as={motion.img}
                                        key={currentPageIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        src={pages[currentPageIndex]}
                                        alt={`CV Page ${currentPageIndex + 1}`}
                                        className="max-w-full max-h-[100vh] shadow-lg border border-gray-200 bg-white"
                                    />
                                </>
                            )}
                        </SafeDiv>
                    )}
                </SafeDiv>
                
                <SafeDiv className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
                    <SafeDiv className="text-sm text-gray-500">
                        {pages.length > 0 && (
                            <span>Viewing page {currentPageIndex + 1} of {pages.length}</span>
                        )}
                    </SafeDiv>
                    <SafeDiv className="flex gap-3">
                        <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md"
                            download
                        >
                            <span>Download CV</span>
                        </a>
                        <button 
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </SafeDiv>
                </SafeDiv>
            </SafeMotion>
        </SafeMotion>
    );
};

const FilterSearchBar = ({ onSearch }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState({
        skills: '',
        experience: '',
        education: '',
        jobTitle: '',
        location: '',
        languages: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Filter out empty fields
        const filledFilters = Object.entries(filters)
            .filter(([_, value]) => value.trim() !== '')
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
            
        onSearch(filledFilters);
    };

    return (
        <SafeDiv className="mb-6">
            <SafeDiv className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                    {isExpanded ? 'Hide Filter Options' : 'Show Filter Options'}
                </button>
                
                {isExpanded && (
                    <button
                        onClick={() => setFilters({
                            skills: '',
                            experience: '',
                            education: '',
                            jobTitle: '',
                            location: '',
                            languages: ''
                        })}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Clear all
                    </button>
                )}
            </SafeDiv>
            
            {isExpanded && (
                <SafeMotion
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <SafeDiv className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <SafeDiv>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={filters.skills}
                                    onChange={handleChange}
                                    placeholder="e.g. React, Node.js, Python"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </SafeDiv>
                            
                            <SafeDiv>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={filters.experience}
                                    onChange={handleChange}
                                    placeholder="e.g. 3+ years, Entry level"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </SafeDiv>
                            
                            <SafeDiv>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                                <input
                                    type="text"
                                    name="education"
                                    value={filters.education}
                                    onChange={handleChange}
                                    placeholder="e.g. Bachelor's, Master's"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </SafeDiv>
                            
                            <SafeDiv>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                <input
                                    type="text"
                                    name="jobTitle"
                                    value={filters.jobTitle}
                                    onChange={handleChange}
                                    placeholder="e.g. Software Engineer, Designer"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </SafeDiv>
                            
                            <SafeDiv>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={filters.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Remote, New York"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </SafeDiv>
                            
                            <SafeDiv>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                                <input
                                    type="text"
                                    name="languages"
                                    value={filters.languages}
                                    onChange={handleChange}
                                    placeholder="e.g. English, Spanish"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </SafeDiv>
                        </SafeDiv>
                        
                        <SafeDiv className="mt-5 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                            >
                                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                                Search Candidates
                            </button>
                        </SafeDiv>
                    </form>
                </SafeMotion>
            )}
        </SafeDiv>
    );
};

const CandidateRecommendation = () => {
    const [publishedJobs, setPublishedJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [recommendedCandidates, setRecommendedCandidates] = useState([]);
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
    const [selectedCvUrl, setSelectedCvUrl] = useState(null);
    const [isFilterSearch, setIsFilterSearch] = useState(false);
    const { companyId } = useRecruiterContext();

    useEffect(() => {
        if (companyId) {
            fetchPublishedJobs();
        }
    }, [companyId]);

    const fetchPublishedJobs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/job/get-published-jobs-by-company-id/${companyId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (!res.ok) throw new Error('Cannot fetch published jobs');
            
            const data = await res.json();
            setPublishedJobs(data);
        } catch (error) {
            console.error('Error fetching published jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCandidateInfo = async (candidateId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/candidate/get-candidate-info/${candidateId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`Failed to fetch candidate info: ${response.status}`);

            return await response.json();
        } catch (error) {
            console.error(`Error fetching candidate info for ID ${candidateId}:`, error);
            return {
                fullname: 'Unknown',
                phoneNumber: 'N/A',
                email: 'N/A',
                avatar: null
            };
        }
    };

    const handleJobSelect = async (jobId) => {
        setSelectedJobId(jobId);
        setIsLoadingCandidates(true);
        
        try {
            // Fetch recommended candidates for the selected job
            const res = await fetch(`http://127.0.0.1:8000/api/recommend/cvs-for-job/${jobId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (!res.ok) throw new Error('Cannot fetch candidate recommendations');
            
            const data = await res.json();

            const token = localStorage.getItem('token');
            
            if (data.recommended_cvs) {
                const recommendationsData = JSON.parse(data.recommended_cvs);
                
                const candidatesWithDetails = await Promise.all(
                    recommendationsData.map(async (recommendation) => {
                        try {
                            const cvRes = await fetch(`/api/cv/get-cv-candidate-by-cv-id/${recommendation.cv_id}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            if (!cvRes.ok) throw new Error(`Failed to fetch CV data for CV ID ${recommendation.cv_id}`);
                            
                            const cvData = await cvRes.json();
                            const candidateInfo = await fetchCandidateInfo(cvData.candidateId);
                            
                            return {
                                ...candidateInfo,
                                id: cvData.candidateId,
                                fileCV: cvData.fileCV,
                                match_score: recommendation.score,
                                match_reason: recommendation.explanation
                            };
                        } catch (error) {
                            console.error(`Error fetching data for CV ID ${recommendation.cv_id}:`, error);
                            return null;
                        }
                    })
                );
                
                const validCandidates = candidatesWithDetails.filter(c => c !== null);
                validCandidates.sort((a, b) => b.match_score - a.match_score);
                
                setRecommendedCandidates(validCandidates);
            } else {
                setRecommendedCandidates([]);
            }
        } catch (error) {
            console.error('Error fetching candidate recommendations:', error);
            setRecommendedCandidates([]);
        } finally {
            setIsLoadingCandidates(false);
        }
    };

    const handleViewCV = (fileUrl) => {
        setSelectedCvUrl(fileUrl);
    };

    const closeModal = () => {
        setSelectedCvUrl(null);
    };

    const handleFilterSearch = async (filters) => {
        if (Object.keys(filters).length === 0) {
            return;
        }
        
        setIsFilterSearch(true);
        setIsLoadingCandidates(true);
        
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/filter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filters })
            });
            
            if (!res.ok) throw new Error('Failed to filter candidates');
            
            const data = await res.json();
            
            if (!data.matched_candidates || data.matched_candidates.length === 0) {
                setRecommendedCandidates([]);
                setIsLoadingCandidates(false);
                return;
            }

            const token = localStorage.getItem('token');

            // Process the matched candidates
            const candidatesWithDetails = await Promise.all(
                data.matched_candidates.map(async (match) => {
                    try {
                        // Step 1: Get CV candidate data by CV ID
                        const cvRes = await fetch(`/api/cv/get-cv-candidate-by-cv-id/${match.cv_id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (!cvRes.ok) throw new Error(`Failed to fetch CV data for CV ID ${match.cv_id}`);
                        
                        const cvData = await cvRes.json();
                        const candidateInfo = await fetchCandidateInfo(cvData.candidateId);
                        
                        return {
                            ...candidateInfo,
                            id: cvData.candidateId,
                            fileCV: cvData.fileCV,
                            match_score: match.match_score,
                            match_reason: match.reason
                        };
                    } catch (error) {
                        console.error(`Error fetching data for CV ID ${match.cv_id}:`, error);
                        return null;
                    }
                })
            );
            
            const validCandidates = candidatesWithDetails.filter(c => c !== null);
            validCandidates.sort((a, b) => b.match_score - a.match_score);
            
            setRecommendedCandidates(validCandidates);
        } catch (error) {
            console.error('Error during filter search:', error);
            setRecommendedCandidates([]);
        } finally {
            setIsLoadingCandidates(false);
        }
    };

    return (
        <SafeDiv className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <AnimatePresence suppressHydrationWarning>
                {selectedCvUrl && (
                    <CVModal 
                        fileUrl={selectedCvUrl}
                        onClose={closeModal}
                    />
                )}
            </AnimatePresence>

            <SafeDiv className="max-w-7xl mx-auto">
                <SafeMotion 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <SafeDiv className="inline-flex items-center justify-center mb-4">
                        <SparklesIcon className="h-8 w-8 text-indigo-500 mr-2" />
                        <h1 className="text-3xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            AI-Powered Candidate Recommendations
                        </h1>
                    </SafeDiv>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover the best talent matched to your job requirements with our intelligent recommendation system
                    </p>
                </SafeMotion>

                {/* Filter Search Section */}
                <SafeMotion
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <FilterSearchBar onSearch={handleFilterSearch} />
                </SafeMotion>

                <SafeMotion 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
                >
                    <SafeDiv className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <BriefcaseIcon className="h-6 w-6 text-indigo-500 mr-2" />
                            Your Published Jobs
                        </h2>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                            {publishedJobs.length} jobs
                        </span>
                    </SafeDiv>
                    
                    <SafeDiv className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-4 rounded-lg">
                        <SafeDiv className="flex items-start">
                            <SafeDiv className="flex-shrink-0 mt-1">
                                <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </SafeDiv>
                            <SafeDiv className="ml-3">
                                <h3 className="text-sm font-medium text-indigo-800">How it works</h3>
                                <p className="text-sm text-indigo-700 mt-1">
                                    Select a job below to see candidates whose skills and experience best match your requirements.
                                    Our AI analyzes CVs and job descriptions to find the perfect matches.
                                </p>
                            </SafeDiv>
                        </SafeDiv>
                    </SafeDiv>
                    
                    {isLoading ? (
                        <SafeDiv className="flex justify-center py-12">
                            <SafeDiv className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></SafeDiv>
                        </SafeDiv>
                    ) : publishedJobs.length === 0 ? (
                        <SafeDiv className="text-center py-12 bg-gray-50 rounded-lg">
                            <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No published jobs</h3>
                            <p className="mt-1 text-gray-500">You haven't published any jobs yet.</p>
                        </SafeDiv>
                    ) : (
                        <SafeDiv className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {publishedJobs.map((job) => (
                                <motion.div 
                                    key={job.id}
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleJobSelect(job.id)}
                                    className={`p-5 rounded-xl cursor-pointer transition-all border ${
                                        selectedJobId === job.id 
                                            ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-300 shadow-md' 
                                            : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm'
                                    }`}
                                >
                                    <SafeDiv className="flex items-start justify-between">
                                        <SafeDiv>
                                            <h3 className="font-semibold text-gray-900 text-lg">{job.name}</h3>
                                            <SafeDiv className="mt-2 flex items-center text-sm text-gray-500">
                                                <span className="truncate">{job.experience}</span>
                                                <span className="mx-1">•</span>
                                                <span className="truncate">{job.salary}</span>
                                            </SafeDiv>
                                        </SafeDiv>
                                        {selectedJobId === job.id && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                Selected
                                            </span>
                                        )}
                                    </SafeDiv>
                                    <SafeDiv className="mt-4 flex justify-between items-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Published
                                        </span>
                                        <button 
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleJobSelect(job.id);
                                            }}
                                        >
                                            View matches →
                                        </button>
                                    </SafeDiv>
                                </motion.div>
                            ))}
                        </SafeDiv>
                    )}
                </SafeMotion>

                {(selectedJobId || isFilterSearch) && recommendedCandidates && (
                    <SafeMotion 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <SafeDiv className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <UserIcon className="h-6 w-6 text-indigo-500 mr-2" />
                                {isFilterSearch ? "Filtered Candidates" : "Recommended Candidates"}
                            </h2>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                                {recommendedCandidates.length} candidates
                            </span>
                        </SafeDiv>
                        
                        {isLoadingCandidates ? (
                            <SafeDiv className="flex justify-center py-12">
                                <SafeDiv className="text-center">
                                    <SafeDiv className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></SafeDiv>
                                    <p className="mt-4 text-gray-600">Analyzing candidates...</p>
                                    <p className="text-sm text-gray-500">Our AI is finding the best matches for your job</p>
                                </SafeDiv>
                            </SafeDiv>
                        ) : recommendedCandidates.length === 0 ? (
                            <SafeDiv className="text-center py-12 bg-gray-50 rounded-lg">
                                <UserIcon className="h-12 w-12 mx-auto text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No recommended candidates</h3>
                                <p className="mt-1 text-gray-500">We couldn't find any candidates that match this job's requirements.</p>
                            </SafeDiv>
                        ) : (
                            <SafeDiv className="space-y-6">
                                {recommendedCandidates.map((candidate) => (
                                    <SafeMotion 
                                        key={candidate.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5"
                                    >
                                        <SafeDiv className="flex flex-col md:flex-row gap-6">
                                            {/* Candidate info */}
                                            <SafeDiv className="flex items-start gap-4 flex-1">
                                                {candidate.avatar ? (
                                                    <img 
                                                        src={candidate.avatar} 
                                                        alt={candidate.fullname} 
                                                        className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-sm"
                                                    />
                                                ) : (
                                                    <SafeDiv className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-medium text-2xl">
                                                        {candidate.fullname ? candidate.fullname.charAt(0) : '?'}
                                                    </SafeDiv>
                                                )}
                                                
                                                <SafeDiv className="flex-1 min-w-0">
                                                    <SafeDiv className="flex items-start justify-between">
                                                        <h3 className="text-xl font-semibold text-gray-800 truncate">
                                                            {candidate.fullname || 'Unknown Candidate'}
                                                        </h3>
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800">
                                                            {Math.round(candidate.match_score * 100)}% Match
                                                        </span>
                                                    </SafeDiv>
                                                    
                                                    <SafeDiv className="mt-2 space-y-1">
                                                        <SafeDiv className="flex items-center text-gray-600">
                                                            <EnvelopeIcon className="h-4 w-4 mr-2 text-indigo-400" />
                                                            <span className="truncate">{candidate.email || 'No email available'}</span>
                                                        </SafeDiv>
                                                        <SafeDiv className="flex items-center text-gray-600">
                                                            <PhoneIcon className="h-4 w-4 mr-2 text-indigo-400" />
                                                            <span>{candidate.phoneNumber || 'No phone available'}</span>
                                                        </SafeDiv>
                                                    </SafeDiv>
                                                    
                                                    {/* Match score */}
                                                    <SafeDiv className="mt-4">
                                                        <SafeDiv className="flex items-center mb-1">
                                                            <span className="text-xs font-medium text-gray-600 mr-2">
                                                                Match Strength
                                                            </span>
                                                            <SafeDiv className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                                                                <SafeDiv
                                                                    className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                                                                    style={{ width: `${candidate.match_score * 100}%` }}
                                                                ></SafeDiv>
                                                            </SafeDiv>
                                                        </SafeDiv>
                                                        {candidate.match_reason && (
                                                            <SafeDiv className="mt-2 p-3 bg-blue-50 rounded-lg">
                                                                <h4 className="text-xs font-medium text-blue-800 mb-1 flex items-center">
                                                                    <ChartBarIcon className="h-3 w-3 mr-1" />
                                                                    Why this candidate matches:
                                                                </h4>
                                                                <p className="text-xs text-blue-700">
                                                                    {candidate.match_reason}
                                                                </p>
                                                            </SafeDiv>
                                                        )}
                                                    </SafeDiv>
                                                </SafeDiv>
                                            </SafeDiv>
                                            
                                            {/* CV Preview and Actions */}
                                            <SafeDiv className="flex flex-col items-end gap-4 w-full md:w-48 flex-shrink-0">
                                                {candidate.fileCV && (
                                                    <SafeDiv className="w-full h-40">
                                                        <CVPreview 
                                                            fileUrl={candidate.fileCV} 
                                                            onClick={() => handleViewCV(candidate.fileCV)}
                                                        />
                                                    </SafeDiv>
                                                )}
                                                <SafeDiv className="flex gap-2 w-full">
                                                    <button 
                                                        onClick={() => candidate.fileCV && handleViewCV(candidate.fileCV)}
                                                        className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                                    >
                                                        View CV
                                                    </button>
                                                    <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                                        Contact
                                                    </button>
                                                </SafeDiv>
                                            </SafeDiv>
                                        </SafeDiv>
                                    </SafeMotion>
                                ))}
                            </SafeDiv>
                        )}
                    </SafeMotion>
                )}
            </SafeDiv>
        </SafeDiv>
    );
}

export default CandidateRecommendation;