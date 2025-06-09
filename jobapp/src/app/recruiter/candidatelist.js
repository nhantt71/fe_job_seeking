import { useEffect, useState } from 'react';
import SearchCandidateBar from '../common/searchcandidatebar';
import { useRecruiterContext } from '../context/recruitercontext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  StarIcon, 
  UserGroupIcon, 
  XMarkIcon, 
  DocumentIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import ClientOnly from '@/components/ClientOnly';

// Match Reason Modal component
const MatchReasonModal = ({ isOpen, onClose, candidate, onViewCV }) => {
    if (!isOpen) return null;
    
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 flex justify-between items-center border-b border-indigo-100">
                    <div className="flex items-center">
                        <InformationCircleIcon className="h-6 w-6 text-indigo-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Match Details</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        {candidate.avatar ? (
                            <img 
                                src={candidate.avatar} 
                                alt={candidate.fullname || 'Candidate'} 
                                className="w-12 h-12 rounded-full mr-3 object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-600 font-medium text-lg mr-3">
                                {candidate.fullname ? candidate.fullname.charAt(0) : '?'}
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-gray-900">{candidate.fullname || 'Unknown Candidate'}</h4>
                            <div className="text-sm text-gray-500">{candidate.email || 'No email available'}</div>
                        </div>
                        <div className="ml-auto">
                            <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-indigo-700 text-sm font-medium rounded-full">
                                {Math.round(candidate.match_score * 100)}% Match
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                        <h5 className="font-medium text-indigo-800 mb-2 flex items-center">
                            <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                            Why This Candidate Matches
                        </h5>
                        <p className="text-blue-700 whitespace-pre-line">{candidate.match_reason}</p>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => onViewCV(candidate.fileCV)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                            disabled={!candidate.fileCV}
                        >
                            <DocumentIcon className="h-4 w-4 mr-2" />
                            View CV
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
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
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
            suppressHydrationWarning={true}
        >
            <div className="animate-pulse flex flex-col items-center" suppressHydrationWarning={true}>
                <div className="h-8 w-8 bg-gray-200 rounded-full mb-2" suppressHydrationWarning={true}></div>
                <p className="text-gray-500 text-sm" suppressHydrationWarning={true}>Loading preview...</p>
            </div>
        </motion.div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center text-gray-400">
                <DocumentIcon className="h-8 w-8 mx-auto" />
                <p className="mt-2 text-sm">Preview unavailable</p>
            </div>
        </div>
    );

    return (
        <motion.div 
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white font-medium text-sm bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    View CV
                </span>
            </div>
        </motion.div>
    );
};

// Elegant CV Modal with smooth transitions
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

    const nextPage = () => {
        setCurrentPageIndex(prev => Math.min(prev + 1, pages.length - 1));
    };

    const prevPage = () => {
        setCurrentPageIndex(prev => Math.max(prev - 1, 0));
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-xl font-semibold text-gray-800">CV Preview</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-auto p-6 bg-gray-50 flex flex-col items-center justify-center">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
                            ></motion.div>
                        </div>
                    ) : error ? (
                        <div className="text-center max-w-md">
                            <DocumentIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h4 className="text-lg font-medium text-gray-700 mb-2">Error loading CV</h4>
                            <p className="text-gray-500 mb-6">{error}</p>
                            <div className="flex gap-3 justify-center">
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
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex flex-col items-center">
                            {pages.length > 0 && (
                                <>
                                    <div className="absolute top-0 left-0 right-0 flex justify-center py-4 z-10">
                                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-700">
                                            Page {currentPageIndex + 1} of {pages.length}
                                        </div>
                                    </div>
                                    
                                    <AnimatePresence mode="wait">
                                        <motion.img 
                                            key={currentPageIndex}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            src={pages[currentPageIndex]}
                                            alt={`CV Page ${currentPageIndex + 1}`}
                                            className="max-w-full max-h-[100vh] shadow-lg border border-gray-200 bg-white"
                                        />
                                    </AnimatePresence>
                                    
                                    {pages.length > 1 && (
                                        <div className="flex gap-4 mt-6">
                                            <button
                                                onClick={prevPage}
                                                disabled={currentPageIndex === 0}
                                                className={`p-3 rounded-full ${currentPageIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                <ArrowLeftIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={nextPage}
                                                disabled={currentPageIndex === pages.length - 1}
                                                className={`p-3 rounded-full ${currentPageIndex === pages.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                <ArrowRightIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {pages.length > 0 && (
                            <span>Viewing page {currentPageIndex + 1} of {pages.length}</span>
                        )}
                    </div>
                    <div className="flex gap-3">
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
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CandidatesList = () => {
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [matchScores, setMatchScores] = useState({});
    const [matchReasons, setMatchReasons] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [candidatesPerPage] = useState(5);
    const [selectedCvUrl, setSelectedCvUrl] = useState(null);
    const [selectedMatchCandidate, setSelectedMatchCandidate] = useState(null);
    const [lastSearchQuery, setLastSearchQuery] = useState(null);
    const { companyId, recruiter } = useRecruiterContext();
    
    useEffect(() => {
        if (companyId) {
            fetchCandidate(companyId);
        }
    }, [companyId]);

    const fetchCandidate = async (companyId) => {
        setIsLoading(true);
        setIsSearching(false);
        setLastSearchQuery(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/company-candidate/available/${companyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            const candidatesWithDetails = await Promise.all(
                data.map(async (candidate) => {
                    const candidateInfo = await fetchCandidateInfo(candidate.candidateId);
                    return {
                        ...candidateInfo,
                        id: candidate.candidateId,
                        fileCV: candidate.fileCv || candidateInfo.fileCV,
                        isSaved: candidate.saved
                    };
                })
            );

            setCandidates(candidatesWithDetails);
        } catch (error) {
            console.error('Error fetching candidates:', error);
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

    const handleSaveToggle = async (candidateId, isCurrentlySaved) => {
        const url = isCurrentlySaved
            ? `/api/company-candidate/unsave-candidate/${candidateId}?companyId=${companyId}`
            : `/api/company-candidate/save-candidate/${candidateId}?companyId=${companyId}`;

        try {
            await fetch(url, { method: 'POST' });
            
            if (isSearching) {
                setFilteredCandidates(prev => 
                    prev.map(candidate => 
                        candidate.id === candidateId 
                            ? { ...candidate, isSaved: !isCurrentlySaved } 
                            : candidate
                    )
                );
            } else {
                setCandidates(prev => 
                    prev.map(candidate => 
                        candidate.id === candidateId 
                            ? { ...candidate, isSaved: !isCurrentlySaved } 
                            : candidate
                    )
                );
            }
        } catch (error) {
            console.error('Error toggling save status:', error);
        }
    };

    const handleSearch = async (filters) => {
        if (!filters || Object.keys(filters).length === 0) {
            fetchCandidate(companyId);
            return;
        }

        const searchQueryString = JSON.stringify(filters);
        if (searchQueryString === lastSearchQuery) {
            return;
        }
        
        setIsSearching(true);
        setIsLoading(true);
        setLastSearchQuery(searchQueryString);
        setCurrentPage(1);

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/filter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filters: filters
                }),
            });

            const data = await response.json();

            if (!data.matched_candidates || data.matched_candidates.length === 0) {
                setFilteredCandidates([]);
                setIsLoading(false);
                return;
            }

            const scoresMap = {};
            const reasonsMap = {};

            data.matched_candidates.forEach(match => {
                scoresMap[match.cv_id] = match.match_score;
                reasonsMap[match.cv_id] = match.reason;
            });

            setMatchScores(scoresMap);
            setMatchReasons(reasonsMap);

            const candidatesData = await Promise.all(
                data.matched_candidates.map(async (match) => {
                    try {
                        const candidateResponse = await fetch(`/api/cv/get-cv-candidate-by-cv-id/${match.cv_id}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        
                        if (!candidateResponse.ok) {
                            throw new Error(`Failed to fetch candidate data: ${candidateResponse.status}`);
                        }
                        
                        const candidate = await candidateResponse.json();
                        console.log("Candidate data from API:", candidate);
                        
                        if (!candidate || !candidate.candidateId) {
                            console.warn(`Missing candidateId for cv_id ${match.cv_id}`);
                            return {
                                id: `temp-${match.cv_id}`,
                                fullname: "Unknown Candidate",
                                email: "Not available",
                                phoneNumber: "Not available",
                                fileCV: candidate?.fileCV || null,
                                isSaved: false,
                                match_score: match.match_score,
                                match_reason: match.reason
                            };
                        }
                        
                        // Get complete candidate information
                        const candidateInfo = await fetchCandidateInfo(candidate.candidateId);
                        const isSaved = await fetchSavedStatus(candidate.candidateId);
                        
                        return {
                            ...candidateInfo,
                            id: candidate.candidateId,
                            fileCV: candidate.fileCV || candidateInfo.fileCV,
                            isSaved,
                            match_score: match.match_score,
                            match_reason: match.reason
                        };
                    } catch (error) {
                        console.error(`Error fetching candidate for cv_id ${match.cv_id}:`, error);
                        // Return a placeholder object instead of null
                        return {
                            id: `error-${match.cv_id}`,
                            fullname: "Unknown Candidate",
                            email: "Error loading data",
                            phoneNumber: "Error loading data",
                            fileCV: null,
                            isSaved: false,
                            match_score: match.match_score,
                            match_reason: match.reason
                        };
                    }
                })
            );

            const validCandidates = candidatesData.filter(candidate => candidate !== null);
            validCandidates.sort((a, b) => b.match_score - a.match_score);

            setFilteredCandidates(validCandidates);
            console.log("Filtered candidates:", validCandidates);
        } catch (error) {
            console.error('Error during candidate search:', error);
            setFilteredCandidates([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSavedStatus = async (candidateId) => {
        try {
            const response = await fetch(
                `/api/company-candidate/check-saved-status?candidateId=${candidateId}&companyId=${companyId}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching saved status:', error);
            return false;
        }
    };

    const handleViewCV = (fileUrl) => {
        setSelectedCvUrl(fileUrl);
    };

    const closeModal = () => {
        setSelectedCvUrl(null);
    };

    const handleConnect = async (candidateId, candidateEmail) => {
        if (!recruiter || !recruiter.email) {
            alert('Please log in to connect with candidates');
            return;
        }

        try {
            const chatRoomId = getChatRoomId(recruiter.email, candidateEmail);

            const chatRoomsRef = collection(db, "chatRooms");
            const q = query(chatRoomsRef, where("roomId", "==", chatRoomId));
            const querySnapshot = await getDocs(q);

            let roomId = chatRoomId;
            let roomDocId = null;

            if (querySnapshot.empty) {
                const docRef = await addDoc(chatRoomsRef, {
                    roomId: chatRoomId,
                    participants: [recruiter.email, candidateEmail],
                    createdAt: serverTimestamp()
                });
                roomDocId = docRef.id;
            } else {
                roomDocId = querySnapshot.docs[0].id;
            }

            localStorage.setItem('activeChatRoom', JSON.stringify({
                roomId: chatRoomId,
                id: roomDocId,
                participants: [recruiter.email, candidateEmail]
            }));

            const chatEvent = new CustomEvent('openChatWithCandidate', {
                detail: {
                    roomId: chatRoomId,
                    id: roomDocId,
                    participants: [recruiter.email, candidateEmail]
                }
            });
            window.dispatchEvent(chatEvent);

            const chatButton = document.querySelector('.fixed.bottom-4.right-4 button');
            if (chatButton) {
                chatButton.click();
            }
        } catch (error) {
            console.error("Error connecting with candidate:", error);
            alert("Failed to connect with candidate. Please try again.");
        }
    };

    const getChatRoomId = (recruiterId, candidateId) => {
        const ids = [recruiterId, candidateId].sort();
        return `${ids[0]}_${ids[1]}`;
    };

    const openMatchDetails = (candidate) => {
        setSelectedMatchCandidate(candidate);
    };
    
    const closeMatchDetails = () => {
        setSelectedMatchCandidate(null);
    };

    const indexOfLastCandidate = currentPage * candidatesPerPage;
    const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
    const displayCandidates = isSearching 
        ? filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate) 
        : candidates.slice(indexOfFirstCandidate, indexOfLastCandidate);
    
    const totalPages = Math.ceil(
        (isSearching ? filteredCandidates.length : candidates.length) / candidatesPerPage
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    const getSearchTermsDisplay = () => {
        if (!lastSearchQuery) return "";
        
        try {
            const filters = JSON.parse(lastSearchQuery);
            return Object.entries(filters)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
        } catch (e) {
            return "";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {selectedCvUrl && (
                <CVModal 
                    fileUrl={selectedCvUrl}
                    onClose={closeModal}
                />
            )}
            
            <AnimatePresence>
                {selectedMatchCandidate && (
                    <MatchReasonModal 
                        isOpen={!!selectedMatchCandidate}
                        onClose={closeMatchDetails}
                        candidate={selectedMatchCandidate}
                        onViewCV={handleViewCV}
                    />
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl mix-blend-overlay"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl mix-blend-overlay"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Discover <span className="text-blue-200">Top Talent</span> Effortlessly
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-blue-100 max-w-3xl mx-auto mb-10"
                        >
                            Find the perfect candidates who match your exact requirements with our intelligent matching system
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-4xl mx-auto"
                    >
                        <SearchCandidateBar
                            onSearch={handleSearch}
                            className="shadow-2xl transform hover:scale-[1.01] transition-transform duration-300"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-12 flex flex-wrap justify-center items-center gap-6 text-blue-100 text-sm sm:text-base"
                    >
                        <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <StarIcon className="h-5 w-5 text-yellow-300 mr-2" />
                            <span>4.9/5 from 2,500+ companies</span>
                        </div>
                        <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <UserGroupIcon className="h-5 w-5 text-blue-200 mr-2" />
                            <span>50,000+ active candidates</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20" suppressHydrationWarning={true}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
                            suppressHydrationWarning={true}
                        ></motion.div>
                    </div>
                ) : displayCandidates.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                            <MagnifyingGlassIcon />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No candidates found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {isSearching 
                                ? "Try adjusting your search filters to find more candidates." 
                                : "There are currently no candidates available."}
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {isSearching && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-l-4 border-indigo-500 shadow-sm"
                            >
                                <div className="flex items-start">
                                    <MagnifyingGlassIcon className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-indigo-800 mb-1">Search Results</h2>
                                        <p className="text-indigo-600">
                                            Found {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} matching your search criteria
                                        </p>
                                        {getSearchTermsDisplay() && (
                                            <p className="text-sm text-indigo-500 mt-1">{getSearchTermsDisplay()}</p>
                                        )}
                                        <div className="flex mt-3 gap-2 flex-wrap">
                                            <button 
                                                onClick={() => fetchCandidate(companyId)}
                                                className="px-3 py-1 text-sm bg-white text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 transition-colors flex items-center"
                                            >
                                                <XMarkIcon className="h-4 w-4 mr-1" />
                                                Clear search
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid gap-6">
                            <AnimatePresence>
                                {displayCandidates.map((candidate) => (
                                    <motion.div
                                        key={candidate.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border ${
                                            isSearching 
                                                ? 'border-indigo-100 hover:border-indigo-200'
                                                : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        {isSearching && candidate.match_score && (
                                            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 h-1.5" 
                                                 style={{ width: `${candidate.match_score * 100}%` }}>
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                                {/* Candidate Info */}
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    {candidate.avatar ? (
                                                        <motion.img 
                                                            src={candidate.avatar} 
                                                            alt={candidate.fullname || 'Candidate'} 
                                                            className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
                                                            whileHover={{ scale: 1.05 }}
                                                        />
                                                    ) : (
                                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-xl font-medium ${
                                                            isSearching
                                                                ? 'bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600'
                                                                : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600'
                                                        }`}>
                                                            {candidate.fullname ? candidate.fullname.charAt(0) : '?'}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="min-w-0">
                                                        <div className="flex items-center">
                                                            <h2 className="text-xl font-semibold text-gray-800 truncate">
                                                                {candidate.fullname || 'Unknown Candidate'}
                                                            </h2>
                                                            {isSearching && candidate.match_score && (
                                                                <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-green-50 to-blue-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100">
                                                                    {Math.round(candidate.match_score * 100)}% Match
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-500 text-sm mt-1">
                                                            {candidate.email || 'No email available'}
                                                        </p>
                                                        <p className="text-gray-500 text-sm">
                                                            {candidate.phoneNumber || 'No phone available'}
                                                        </p>
                                                        
                                                        {isSearching && candidate.match_reason && (
                                                            <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                                <p className="text-xs text-blue-700 line-clamp-2">
                                                                    <span className="font-medium">Match reason:</span> {candidate.match_reason}
                                                                </p>
                                                                <button 
                                                                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
                                                                    onClick={() => openMatchDetails(candidate)}
                                                                >
                                                                    Read more
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* CV Preview and Actions */}
                                                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end gap-4">
                                                    {candidate.fileCV && (
                                                        <div className="w-40 h-56 flex-shrink-0">
                                                            <CVPreview 
                                                                fileUrl={candidate.fileCV} 
                                                                onClick={() => handleViewCV(candidate.fileCV)}
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex flex-row gap-2">
                                                        <button
                                                            onClick={() => handleConnect(candidate.id, candidate.email)}
                                                            className="px-4 py-2.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all flex items-center justify-center gap-2 w-32"
                                                        >
                                                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                                            Connect
                                                        </button>
                                                       
                                                        <button
                                                            onClick={() => handleSaveToggle(candidate.id, candidate.isSaved)}
                                                            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 w-32 ${
                                                                candidate.isSaved
                                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300'
                                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                            }`}
                                                        >
                                                            {candidate.isSaved ? (
                                                                <>
                                                                    <BookmarkSlashIcon className="h-4 w-4" />
                                                                    Unsave
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <BookmarkIcon className="h-4 w-4" />
                                                                    Save
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-between mt-10 px-2"
                            >
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstCandidate + 1} to {Math.min(
                                        isSearching ? filteredCandidates.length : candidates.length,
                                        indexOfLastCandidate
                                    )} of {isSearching ? filteredCandidates.length : candidates.length} candidates
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={goToFirstPage}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <ChevronDoubleLeftIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={goToPrevPage}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <ArrowLeftIcon className="h-5 w-5" />
                                    </button>
                                    
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => paginate(pageNum)}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <ArrowRightIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={goToLastPage}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <ChevronDoubleRightIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CandidatesList;