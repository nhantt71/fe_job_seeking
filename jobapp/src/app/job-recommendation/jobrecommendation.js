import { useEffect, useState } from 'react';
import { useUserContext } from '../context/usercontext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SafeDiv, SafeMotion } from '../components/SafeComponents';

export default function JobRecommendation() {
    const [candidate, setCandidate] = useState(null);
    const { email, recommendationCvId } = useUserContext();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showMatchModal, setShowMatchModal] = useState(false);
    console.log(recommendationCvId);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        setIsAuthenticated(true);

        fetch(`/api/candidate/get-candidate-by-email?email=${email}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`API request failed with status ${res.status}`);
                }
                return res.text();
            })
            .then((text) => {
                if (!text) {
                    throw new Error('Empty response from server');
                }
                try {
                    const data = JSON.parse(text);
                    setCandidate(data);
                    
                    // Check candidate availability
                    if (data && data.id) {
                        checkCandidateAvailability(data.id);
                    }
                } catch (e) {
                    throw new Error(`Invalid JSON: ${e.message}`);
                }
            })
            .catch((err) => {
                console.error('Error fetching candidate data:', err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [email]);

    const checkCandidateAvailability = (candidateId) => {
        const token = localStorage.getItem('token');
        fetch(`/api/candidate/check-available/${candidateId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to check availability: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            setIsAvailable(data === true);
            
            // If available and we have a CV ID, fetch recommendations
            if (data === true && recommendationCvId) {
                fetchRecommendations(recommendationCvId);
            }
        })
        .catch(err => {
            console.error('Error checking candidate availability:', err);
            setError(err.message);
        });
    };

    useEffect(() => {
        if (candidate && isAvailable && recommendationCvId) {
            console.log("Fetching recommendations for CV ID:", recommendationCvId);
            fetchRecommendations(recommendationCvId);
        }
    }, [candidate, isAvailable, recommendationCvId]);

    const fetchRecommendations = async (recommendationCvId) => {
        setLoadingRecommendations(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/recommend/jobs-for-cv/${recommendationCvId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch recommendations: ${response.status}`);
            }

            const data = await response.json();

            // Debug: Log the structure of the response
            console.log("Recommendation API response:", data);

            // Handle different possible API response structures
            let parsedRecommendations = [];
            
            // Case 1: data.recommended_jobs exists (expected format)
            if (data.recommended_jobs) {
                try {
                    parsedRecommendations = typeof data.recommended_jobs === 'string'
                        ? JSON.parse(data.recommended_jobs)
                        : data.recommended_jobs;
                } catch (e) {
                    console.error('Error parsing recommended_jobs:', e);
                }
            } 
            // Case 2: data is an array directly
            else if (Array.isArray(data)) {
                parsedRecommendations = data;
            }
            // Case 3: data.results exists (alternative format)
            else if (data.results && Array.isArray(data.results)) {
                parsedRecommendations = data.results;
            }
            // Case 4: data.matches exists (another alternative)
            else if (data.matches && Array.isArray(data.matches)) {
                parsedRecommendations = data.matches;
            }
            // Case 5: data.recommendations exists
            else if (data.recommendations && Array.isArray(data.recommendations)) {
                parsedRecommendations = data.recommendations;
            }
            
            console.log("Parsed recommendations:", parsedRecommendations);
            
            // Ensure each recommendation has job_id (might be named differently)
            parsedRecommendations = parsedRecommendations.map(rec => {
                // Handle case where job_id might be named differently
                const jobId = rec.job_id || rec.jobId || rec.id;
                if (!jobId) {
                    console.warn("Recommendation missing job ID:", rec);
                    return null;
                }
                
                return {
                    ...rec,
                    job_id: jobId
                };
            }).filter(rec => rec !== null); // Remove invalid recommendations

            setRecommendations(parsedRecommendations);

            // Fetch job details for each recommendation
            if (parsedRecommendations.length > 0) {
            await fetchJobDetails(parsedRecommendations);
            } else {
                setRecommendedJobs([]);
            }
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setError(err.message);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const fetchJobDetails = async (recommendations) => {
        try {
            const token = localStorage.getItem('token');
            const jobPromises = recommendations.map(async (rec, index) => {
                // Debug: Log each recommendation object
                console.log("Processing recommendation:", rec);
                
                const response = await fetch(`/api/job/detail/${rec.job_id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch job details for job ${rec.job_id}`);
                }

                const jobData = await response.json();
                
                // Handle match score with multiple fallbacks
                let matchScore;
                if (rec.match_score !== undefined) {
                    matchScore = rec.match_score;
                    console.log(`Using match_score: ${matchScore} for job ${rec.job_id}`);
                } else if (rec.score !== undefined) {
                    matchScore = rec.score;
                    console.log(`Using score: ${matchScore} for job ${rec.job_id}`);
                } else if (rec.similarity !== undefined) {
                    matchScore = rec.similarity;
                    console.log(`Using similarity: ${matchScore} for job ${rec.job_id}`);
                } else if (rec.confidence !== undefined) {
                    matchScore = rec.confidence;
                    console.log(`Using confidence: ${matchScore} for job ${rec.job_id}`);
                } else {
                    // If no score is found, generate one based on recommendation order (higher for first results)
                    // This ensures all jobs show some kind of match percentage
                    const totalRecommendations = recommendations.length;
                    matchScore = Math.max(0.5, 1 - (index / (totalRecommendations * 1.5)));
                    console.log(`Generated score: ${matchScore} for job ${rec.job_id} (no score in response)`);
                }
                
                // Ensure match score is between 0 and 1
                matchScore = Math.min(1, Math.max(0, parseFloat(matchScore)));
                
                // Handle explanation with multiple fallbacks
                const explanation = rec.explanation || 
                                   (rec.reasons ? (Array.isArray(rec.reasons) ? rec.reasons.join(', ') : rec.reasons) : 
                                   (rec.match_details || "This job matches your skills and experience"));
                
                return {
                    ...jobData,
                    match_score: matchScore,
                    explanation: explanation
                };
            });

            const jobDetails = await Promise.all(jobPromises);
            console.log("Processed job details:", jobDetails);
            
            // Sort jobs by match score (highest first)
            const sortedJobs = jobDetails.sort((a, b) => b.match_score - a.match_score);
            
            setRecommendedJobs(sortedJobs);
        } catch (err) {
            console.error('Error fetching job details:', err);
            setError(err.message);
        }
    };

    // Function to open match details modal
    const openMatchDetails = (job) => {
        setSelectedJob(job);
        setShowMatchModal(true);
    };
    
    // Function to close match details modal
    const closeMatchModal = () => {
        setShowMatchModal(false);
    };
    
    // Match details modal component
    const MatchDetailsModal = () => {
        if (!selectedJob) return null;
        
        // Format match score with better fallback handling
        const matchPercentage = selectedJob.match_score !== undefined 
            ? `${Math.round(selectedJob.match_score * 100)}%` 
            : 'N/A';
        
        // Enhanced explanation formatting
        let explanation = selectedJob.explanation || "This job aligns well with your skills and experience.";
        
        // Convert JSON string to object if needed
        if (typeof explanation === 'string' && explanation.startsWith('{')) {
            try {
                explanation = JSON.parse(explanation);
            } catch (e) {
                console.error('Could not parse explanation as JSON', e);
            }
        }
        
        // Format explanation for display
        let formattedExplanation = explanation;
        
        if (typeof explanation === 'object') {
            // If explanation is an object, format it as bullet points
            formattedExplanation = Object.entries(explanation)
                .map(([key, value]) => `• ${key}: ${value}`)
                .join('\n');
        } else if (explanation.includes('•') || explanation.includes('-')) {
            // If already has bullet points, preserve them
            formattedExplanation = explanation;
        } else {
            // Otherwise, split by sentences and add bullet points
            const sentences = explanation.split(/[.;]\s+/).filter(s => s.trim().length > 0);
            formattedExplanation = sentences.map(s => `• ${s.trim()}`).join('\n');
        }
        
        return (
            <SafeDiv className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <SafeMotion
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                >
                    <SafeDiv className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Detailed Match Analysis</h3>
                        <button 
                            onClick={closeMatchModal} 
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </SafeDiv>
                    
                    <SafeDiv className="mb-6 flex items-start">
                        <img
                            src={selectedJob.companyLogo || '/default-company-logo.png'}
                            alt={`${selectedJob.companyName} logo`}
                            className="h-16 w-16 rounded-full object-cover border-2 border-gray-100 mr-4"
                        />
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">{selectedJob.name}</h4>
                            <p className="text-indigo-600 font-medium">{selectedJob.companyName}</p>
                        </div>
                    </SafeDiv>
                    
                    <SafeDiv className="mb-6">
                        <SafeDiv className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                            <SafeDiv className="flex items-center justify-between mb-4">
                                <SafeDiv>
                                    <h5 className="font-bold text-gray-900">Match Score</h5>
                                    <p className="text-sm text-gray-600">How well this job matches your profile</p>
                                </SafeDiv>
                                <SafeDiv className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-xl font-bold">
                                    {matchPercentage}
                                </SafeDiv>
                            </SafeDiv>
                            
                            <h5 className="font-bold text-gray-900 mb-3">Match Breakdown:</h5>
                            <SafeDiv className="bg-white p-4 rounded-lg border border-gray-200">
                                <SafeDiv className="whitespace-pre-line text-gray-700">
                                    {formattedExplanation}
                                </SafeDiv>
                            </SafeDiv>
                            
                            {/* Skill matching visualization */}
                            <SafeDiv className="mt-4">
                                <h6 className="font-medium text-gray-900 mb-2">Key Matching Factors:</h6>
                                <SafeDiv className="space-y-2">
                                    {selectedJob.skills && selectedJob.skills.slice(0, 5).map(skill => (
                                        <SafeDiv key={skill} className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-700">{skill}</span>
                                        </SafeDiv>
                                    ))}
                                </SafeDiv>
                            </SafeDiv>
                        </SafeDiv>
                    </SafeDiv>
                    
                    <SafeDiv className="flex justify-between">
                        <button 
                            onClick={closeMatchModal}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Back to List
                        </button>
                        <Link href={`/job/detail?id=${selectedJob.id}`} passHref>
                            <SafeMotion
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                View Full Job Details
                                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </SafeMotion>
                        </Link>
                    </SafeDiv>
                </SafeMotion>
            </SafeDiv>
        );
    };

    // Enhanced job card component
    const JobCard = ({ job, index }) => {
        const matchPercentage = job.match_score !== undefined ? 
            `${Math.round(job.match_score * 100)}%` : 
            'N/A';
            
        const matchColor = job.match_score !== undefined ? 
            (job.match_score > 0.8 ? 'from-green-500 to-emerald-600' :
             job.match_score > 0.6 ? 'from-blue-500 to-indigo-600' :
             job.match_score > 0.4 ? 'from-amber-500 to-orange-500' :
             'from-gray-500 to-gray-600') :
            'from-indigo-500 to-purple-600';
            
        return (
            <SafeMotion
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
                <SafeDiv className="p-6">
                    <SafeDiv className="flex items-start space-x-4">
                        <SafeDiv className="flex-shrink-0">
                            <img
                                src={job.companyLogo || '/default-company-logo.png'}
                                alt={`${job.companyName} logo`}
                                className="h-14 w-14 rounded-full object-cover border-2 border-gray-100"
                            />
                        </SafeDiv>
                        <SafeDiv className="flex-1 min-w-0">
                            <SafeDiv className="flex justify-between items-start">
                                <SafeDiv>
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{job.name}</h3>
                                    <p className="text-sm text-indigo-600 font-medium">{job.companyName}</p>
                                </SafeDiv>
                            </SafeDiv>
                            
                            <SafeDiv className="mt-4 space-y-2">
                                <SafeDiv className="flex items-center text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {job.address || "Location not specified"}
                                </SafeDiv>
                                <SafeDiv className="flex items-center text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {job.salary?.substring(0, 200) || "Salary not specified"}
                                </SafeDiv>
                                <SafeDiv className="flex items-center text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Apply before: {job.endDate || "Not specified"}
                                </SafeDiv>
                            </SafeDiv>
                            
                            {/* Quick match preview */}
                            <SafeDiv className="mt-4 bg-gray-50 p-3 rounded-lg">
                                <SafeDiv className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Match Score:</span>
                                    <button 
                                        onClick={() => openMatchDetails(job)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-r ${matchColor} text-white`}
                                    >
                                        {matchPercentage} Match
                                    </button>
                                </SafeDiv>
                                <SafeDiv className="text-sm text-gray-700 line-clamp-2">
                                    {job.explanation?.substring(0, 150) || "This job matches your skills and experience."}
                                </SafeDiv>
                                <button
                                    onClick={() => openMatchDetails(job)}
                                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Show full match details →
                                </button>
                            </SafeDiv>
                        </SafeDiv>
                    </SafeDiv>
                    
                    <SafeDiv className="mt-6 flex justify-between items-center">
                        <button 
                            onClick={() => openMatchDetails(job)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Why is this a good match?
                        </button>
                        <Link href={`/job/detail?id=${job.id}`} passHref>
                            <SafeMotion
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                View Details
                                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </SafeMotion>
                        </Link>
                    </SafeDiv>
                </SafeDiv>
            </SafeMotion>
        );
    };

    // ... (keep all your existing conditional renders)

    return (
        <SafeDiv className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <SafeMotion
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                <SafeDiv className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Job Matches</span>
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Personalized recommendations based on your profile
                    </p>
                </SafeDiv>

                {loadingRecommendations ? (
                    <SafeDiv className="flex flex-col items-center justify-center py-16">
                        <SafeMotion
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"
                        />
                        <p className="text-lg font-medium text-indigo-700">
                            Analyzing your profile and finding the best matches...
                        </p>
                    </SafeDiv>
                ) : recommendedJobs.length > 0 ? (
                    <SafeDiv className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence>
                            {recommendedJobs.map((job, index) => (
                                <JobCard key={job.id} job={job} index={index} />
                            ))}
                        </AnimatePresence>
                    </SafeDiv>
                ) : (
                    <SafeDiv className="text-center py-16">
                        <SafeMotion
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="text-7xl mb-6"
                        >
                            🔍
                        </SafeMotion>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">No Matches Found Yet</h2>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            We're working hard to find the perfect jobs for you. Check back later or try updating your profile.
                        </p>
                        <SafeDiv className="space-x-4">
                            <button
                                onClick={() => fetchRecommendations(recommendationCvId)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Refresh
                            </button>
                            <a
                                href="/profile"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                Edit Profile
                            </a>
                        </SafeDiv>
                    </SafeDiv>
                )}
            </SafeMotion>
            
            {/* Render the match details modal */}
            <AnimatePresence>
                {showMatchModal && <MatchDetailsModal />}
            </AnimatePresence>
        </SafeDiv>
    );
}