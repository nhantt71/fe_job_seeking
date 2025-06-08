'use client';

import { useEffect, useState, useRef } from 'react';
import { useRecruiterContext } from '../context/recruitercontext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

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

        // Always generate a thumbnail for preview
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
        // For PDFs, get first page as thumbnail
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

        // For images, use the URL directly but resize for thumbnail
        return url;
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
                <p className="text-gray-500 text-sm">Loading preview...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="mt-2">Preview unavailable</p>
            </div>
        </div>
    );

    return (
        <div
            className="relative h-full bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => onClick(fileUrl)} // Pass original file URL to load full version
        >
            <img
                src={thumbnailSrc}
                alt="CV thumbnail preview"
                className="h-full w-full object-contain"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                    Click to enlarge
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

// Elegant modal component with smooth animations
const CVModal = ({ isOpen, onClose, fileUrl }) => {
    const modalRef = useRef(null);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [fullSrc, setFullSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Set visibility based on isOpen prop
    useEffect(() => {
        if (isOpen) {
            // Show the modal immediately
            setIsVisible(true);
            // Set document body to prevent scrolling
            document.body.style.overflow = 'hidden';
        } else {
            // Wait for animation to complete before hiding
            const timer = setTimeout(() => {
                setIsVisible(false);
                // Restore scrolling
                document.body.style.overflow = 'auto';
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !fileUrl) return;

        const loadFullCV = async () => {
            setIsLoading(true);
            setError(false);

            try {
                if (fileUrl.toLowerCase().endsWith('.pdf')) {
                    const token = localStorage.getItem('token');
                    const apiUrl = `/api/pdf/convert-from-url?pdfUrl=${encodeURIComponent(fileUrl)}&format=png&dpi=300`;

                    const response = await fetch(apiUrl, {
                        method: "GET",
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) throw new Error(`Failed to get PDF: ${response.status}`);

                    const data = await response.json();
                    setFullSrc(`data:image/png;base64,${data[0]}`);
                } else {
                    setFullSrc(fileUrl);
                }
            } catch (err) {
                console.error("Failed to load full CV:", err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadFullCV();
    }, [isOpen, fileUrl]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscKey);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);
    
    const handleImageLoad = () => {
        setIsImageLoading(false);
    };
    
    const handleImageError = () => {
        setIsImageLoading(false);
        setImageError(true);
    };
    
    if (!isVisible && !isOpen) return null;
    
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'bg-black bg-opacity-70 opacity-100' : 'bg-opacity-0 opacity-0'}`}>
            <div
                ref={modalRef}
                className={`bg-white rounded-xl shadow-2xl max-w-5xl w-[95%] overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                style={{ maxHeight: '95vh' }}
            >
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-xl font-semibold text-gray-800">CV Preview</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 flex justify-center items-center" style={{ height: 'calc(95vh - 130px)' }}>
                    {isLoading && (
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
                            <p className="text-gray-600">Loading full CV...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-3 text-red-500 font-medium">Failed to load CV</p>
                        </div>
                    )}
                    
                    {fullSrc && (
                        <img
                            src={fullSrc}
                            alt="CV Full Preview"
                            className="max-w-full max-h-full object-contain"
                            onLoad={() => setIsLoading(false)}
                            onError={() => setError(true)}
                        />
                    )}
                </div>
                
                <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-md hover:shadow-lg flex items-center"
                        download
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download CV
                    </a>
                </div>
            </div>
        </div>
    );
};

const ClientOnly = ({ children }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient ? children : null;
};

export default function SavedCandidates() {
    const { recruiter, companyId } = useRecruiterContext();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCV, setSelectedCV] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCandidates, setFilteredCandidates] = useState([]);

    useEffect(() => {
        if (companyId) {
            loadSavedCandidates(companyId);
        }
    }, [companyId]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            // If search term is empty, show all candidates
            setFilteredCandidates(candidates);
        } else {
            // Filter candidates based on search term
            const filtered = candidates.filter(candidate => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    candidate.fullname?.toLowerCase().includes(searchLower) ||
                    candidate.email?.toLowerCase().includes(searchLower) ||
                    candidate.phoneNumber?.toLowerCase().includes(searchLower)
                );
            });
            setFilteredCandidates(filtered);
        }
    }, [searchTerm, candidates]); // Add candidates to dependency array

    const loadSavedCandidates = async (companyId) => {
        setLoading(true);
        try {
            const savedCVs = await fetchSavedCandidateCV(companyId);

            if (!savedCVs || savedCVs.length === 0) {
                setCandidates([]);
                setLoading(false);
                return;
            }

            const candidatesWithDetails = await Promise.all(
                savedCVs.map(async (savedCV) => {
                    const candidateInfo = await fetchCandidateInfo(savedCV.candidateId);
                    return {
                        ...candidateInfo,
                        id: savedCV.candidateId,
                        fileCV: savedCV.fileCv,
                        isSaved: savedCV.saved
                    };
                })
            );

            setCandidates(candidatesWithDetails);
            setFilteredCandidates(candidatesWithDetails);
        } catch (error) {
            console.error('Error loading saved candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedCandidateCV = async (companyId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/company-candidate/${companyId}/saved-cvs`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`Failed to fetch saved CVs: ${response.status}`);

            return await response.json();
        } catch (error) {
            console.error('Error fetching saved candidate CVs:', error);
            return [];
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
            const token = localStorage.getItem('token');
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            loadSavedCandidates(companyId);
        } catch (error) {
            console.error(`Error ${isCurrentlySaved ? 'unsaving' : 'saving'} candidate:`, error);
        }
    };

    const openCVModal = (fileUrl) => {
        console.log("Opening CV modal with URL:", fileUrl);
        setSelectedCV(fileUrl);
    };

    const closeCVModal = () => {
        setSelectedCV(null);
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

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900" suppressHydrationWarning={true}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" suppressHydrationWarning={true}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8" suppressHydrationWarning={true}>
                    <div suppressHydrationWarning={true}>
                        <h1 className="text-3xl font-bold text-gray-900">Saved Candidates</h1>
                        <p className="mt-2 text-gray-600">Review and manage your saved candidates</p>
                    </div>

                    <div className="mt-4 md:mt-0 w-full md:w-auto" suppressHydrationWarning={true}>
                        <div className="relative" suppressHydrationWarning={true}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning={true}>
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden" suppressHydrationWarning={true}>
                    <ClientOnly>
                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center" suppressHydrationWarning={true}>
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" suppressHydrationWarning={true}></div>
                                <p className="text-gray-600">Loading your saved candidates...</p>
                                </div>
                        ) : filteredCandidates.length === 0 ? (
                            <div className="py-16 text-center" suppressHydrationWarning={true}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No saved candidates found</h3>
                                <p className="mt-1 text-gray-500">
                                    {searchTerm ? 'No matches for your search.' : 'You haven\'t saved any candidates yet.'}
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100" suppressHydrationWarning={true}>
                                {filteredCandidates.map((candidate) => (
                                    <div key={candidate.id} className="p-5 hover:bg-gray-50 transition-colors duration-150" suppressHydrationWarning={true}>
                                        <div className="flex flex-col lg:flex-row gap-6" suppressHydrationWarning={true}>
                                            {/* Candidate Info Section */}
                                            <div className="lg:w-1/4" suppressHydrationWarning={true}>
                                                <div className="flex items-start space-x-4" suppressHydrationWarning={true}>
                                                    <div className="relative" suppressHydrationWarning={true}>
                                                        <img
                                                            src={candidate.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(candidate.fullname || 'Unknown') + '&background=random'}
                                                            alt={candidate.fullname || 'Candidate'}
                                                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(candidate.fullname || 'Unknown') + '&background=random';
                                                            }}
                                                        />
                                                        <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-white bg-green-400"></span>
                                                    </div>
                                                    <div className="flex-1 min-w-0" suppressHydrationWarning={true}>
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">{candidate.fullname || 'Unknown'}</h3>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4 mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            {candidate.email || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate mt-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4 mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            {candidate.phoneNumber || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2" suppressHydrationWarning={true}>
                                                    <button
                                                        onClick={() => handleSaveToggle(candidate.id, candidate.isSaved)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${candidate.isSaved ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} transition-colors`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={candidate.isSaved ? "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" : "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"} />
                                                        </svg>
                                                        {candidate.isSaved ? 'Unsave' : 'Save'}
                                                    </button>

                                                    <button
                                                        onClick={() => handleConnect(candidate.id, candidate.email)}
                                                        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium flex items-center transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        Connect
                                                    </button>

                                <a
                                    href={candidate.fileCV}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                                        className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-sm font-medium flex items-center transition-colors"
                                                        download
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </a>
                                                </div>
                                            </div>

                                            {/* CV Preview Section */}
                                            <div className="lg:w-3/4" suppressHydrationWarning={true}>
                                                <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200" suppressHydrationWarning={true}>
                                                    <CVPreview
                                                        fileUrl={candidate.fileCV}
                                                        onClick={openCVModal}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ClientOnly>
                </div>
            </div>

            {/* CV Modal */}
            <CVModal
                isOpen={!!selectedCV}
                onClose={closeCVModal}
                fileUrl={selectedCV}
            />
        </div>
    );
}