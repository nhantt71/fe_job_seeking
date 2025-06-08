'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../context/usercontext';
import { FiUpload, FiTrash2, FiEye, FiStar, FiCheckCircle, FiPlus, FiMinus, FiEdit2, FiDownload, FiFileText } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Link from 'next/link';

const PdfBase64Image = ({ pdfUrl }) => {
    const { token } = useUserContext();
    const [imgSrc, setImgSrc] = useState(null);
    const [isMounted, setIsMounted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !pdfUrl) return;

        async function fetchImage() {
            try {
                const apiUrl = `/api/pdf/convert-from-url?pdfUrl=${encodeURIComponent(pdfUrl)}&format=png&dpi=300`;
                const response = await fetch(apiUrl, {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Check if response is ok and content type is JSON
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status}`);
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Server response was not JSON");
                }

                const data = await response.json();
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("Invalid response format");
                }

                setImgSrc(`data:image/png;base64,${data[0]}`);
                setError(null);
            } catch (err) {
                console.error("Failed to load PDF preview:", err);
                setError(err.message);
                setImgSrc(null);
            }
        }

        fetchImage();
    }, [pdfUrl, isMounted]);

    if (!isMounted) return null;
    if (error) return <div className="text-red-500">Failed to load preview: {error}</div>;
    if (!imgSrc) return <div className="text-gray-500">Loading preview...</div>;

    return <img src={imgSrc} alt="PDF preview" style={{ width: "100%", height: "auto" }} />;
};

const CVManager = () => {
    const [loading, setLoading] = useState(false);
    const [cvs, setCVs] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingCV, setEditingCV] = useState(null);
    const [cvName, setCvName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [candidate, setCandidate] = useState(null);
    const [mainCvId, setMainCvId] = useState(null);
    const { email } = useUserContext();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState(false);

    // CV form state
    const [formData, setFormData] = useState({
        title: '',
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            address: '',
            linkedin: '',
            github: ''
        },
        summary: '',
        workCareer: [{
            position: '',
            company: '',
            startDate: '',
            endDate: '',
            description: '',
            achievements: ['']
        }],
        education: [{
            school: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            description: ''
        }],
        experience: [{
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: ''
        }],
        skills: [],
        languages: [],
        certifications: []
    });

    // Token check
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            setAuthError(true);
            return;
        }
        // Optionally, decode and check token expiry here
        // If you use JWT and want to check expiry:
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                setAuthError(true);
                return;
            }
        } catch (e) {
            setAuthError(true);
            return;
        }
        setAuthError(false);
    }, []);

    useEffect(() => {
        const fetchCandidate = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            const maxRetries = 3;
            let retryCount = 0;

            const makeRequest = (url) => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.setRequestHeader('Accept', 'application/json');
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.withCredentials = true;

                    xhr.onload = function () {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const data = JSON.parse(xhr.responseText);
                                resolve(data);
                            } catch (e) {
                                reject(new Error('Invalid JSON response'));
                            }
                        } else {
                            reject(new Error(`HTTP error! status: ${xhr.status}`));
                        }
                    };

                    xhr.onerror = function () {
                        reject(new Error('Network error occurred'));
                    };

                    xhr.ontimeout = function () {
                        reject(new Error('Request timed out'));
                    };

                    xhr.timeout = 10000; // 10 second timeout
                    xhr.send();
                });
            };

            const tryFetch = async () => {
                try {
                    // Debug logging
                    console.log('Attempting to fetch candidate data...');
                    console.log('Email:', email);
                    console.log('Token exists:', !!token);

                    const url = `/api/candidate/get-candidate-by-email?email=${email}`;

                    console.log('Request URL:', url);

                    const data = await makeRequest(url);
                    console.log('Received data:', data);
                    setCandidate(data);
                } catch (error) {
                    console.error(`Attempt ${retryCount + 1} failed:`, error);
                    console.error('Error details:', {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    });

                    // Handle specific error types
                    if (error.message.includes('Network error')) {
                        if (!navigator.onLine) {
                            throw new Error('No internet connection. Please check your network.');
                        }
                        throw new Error('Network error: Please check if the server is running and accessible.');
                    }

                    if (error.message.includes('timed out')) {
                        throw new Error('Request timed out. Please try again.');
                    }

                    if (error.message.includes('Invalid JSON')) {
                        throw new Error('Server returned invalid response format.');
                    }

                    if (retryCount < maxRetries - 1) {
                        retryCount++;
                        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                        console.log(`Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return tryFetch();
                    }

                    if (error.message.includes('HTTP error! status: 401')) {
                        setIsAuthenticated(false);
                        alert('Session expired: Please login again');
                        // Optionally redirect to login page
                        // window.location.href = '/login';
                    } else {
                        alert(`Error: ${error.message}`);
                    }
                }
            };

            if (email) {
                console.log('Starting fetch process for email:', email);
                tryFetch();
            } else {
                console.log('No email provided, skipping fetch');
            }
        };

        fetchCandidate();
    }, [email]);


    useEffect(() => {
        const fetchCVs = async () => {
            if (candidate) {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsAuthenticated(false);
                    return;
                }

                setLoading(true);
                try {
                    const response = await fetch(`/api/cv/get-cvs-by-candidate-id/${candidate.id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                    });

                    if (!response.ok) {
                        if (response.status === 401) {
                            setAuthError(true);
                            throw new Error('Unauthorized: Please login again');
                        }
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const contentType = response.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                        throw new Error("Server response was not JSON");
                    }

                    const data = await response.json();
                    if (!Array.isArray(data)) {
                        throw new Error("Invalid response format: expected an array");
                    }

                    setCVs(data);
                    const mainCv = data.find(cv => cv.mainCV);
                    if (mainCv) setMainCvId(mainCv.id);
                } catch (error) {
                    console.error("Failed to fetch CVs:", error);
                    if (error.message.includes('Failed to fetch')) {
                        alert('Network error: Please check if the server is running and accessible');
                    } else {
                        alert(error.message);
                    }
                    setCVs([]);
                    setMainCvId(null);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCVs();
    }, [candidate]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (!cvName) setCvName(file.name.split('.')[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !cvName.trim() || !candidate) {
            alert("Please fill in all fields and select a file.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setAuthError(true);
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`/api/cv/upload-cv?candidateId=${candidate.id}&name=${cvName}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setCVs(prev => [...prev, data]);
            setCvName('');
            setSelectedFile(null);
        } catch (err) {
            console.error("Upload failed:", err);
            alert('Failed to upload CV: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const makeMainCV = async (cvId) => {
        if (!candidate) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setAuthError(true);
            return;
        }

        try {
            const res = await fetch(`/api/cv/make-main-cv?id=${cvId}&candidateId=${candidate.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            setMainCvId(cvId);
            setCVs(prev => prev.map(cv => ({ ...cv, mainCV: cv.id === cvId })));
        } catch (err) {
            console.error("Failed to set main CV:", err);
            alert('Failed to set main CV: ' + err.message);
        }
    };

    const handleDelete = async (cvId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAuthError(true);
            return;
        }

        try {
            const res = await fetch(`/api/cv/delete-cv/${cvId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            setCVs(prev => prev.filter(cv => cv.id !== cvId));
            if (mainCvId === cvId) setMainCvId(null);
        } catch (err) {
            console.error("Failed to delete CV:", err);
            alert('Failed to delete CV: ' + err.message);
        }
    };

    const handleInputChange = (e, section, index) => {
        const { name, value } = e.target;
        if (section && index !== undefined) {
            setFormData(prev => ({
                ...prev,
                [section]: prev[section].map((item, i) =>
                    i === index ? { ...item, [name]: value } : item
                )
            }));
        } else if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addItem = (section) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], {}]
        }));
    };

    const removeItem = (section, index) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const generateCVPreview = async () => {
        const cvPreview = document.getElementById('cv-preview');
        if (!cvPreview) return null;

        try {
            // Generate image from HTML
            const canvas = await html2canvas(cvPreview, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Convert to PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            return pdf.output('blob');
        } catch (error) {
            console.error('Error generating CV preview:', error);
            return null;
        }
    };

    const uploadCVToCloud = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'cv');
            formData.append('name', formData.title || 'CV');

            const response = await fetch('/api/cv/upload-cv', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error uploading CV:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!candidate) return;

        try {
            // Generate CV preview
            const cvBlob = await generateCVPreview();
            if (!cvBlob) throw new Error('Failed to generate CV');

            // Upload to cloud
            const fileUrl = await uploadCVToCloud(cvBlob);

            // Save CV data with file URL
            const response = await fetch(`/api/cv/create-custom-cv?candidateId=${candidate.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    fileUrl,
                    type: 'custom',
                    createdAt: new Date().toISOString()
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCVs(prev => [...prev, data]);
                setShowForm(false);
                setEditingCV(null);
                setFormData({
                    title: '',
                    personalInfo: {
                        fullName: '',
                        email: '',
                        phone: '',
                        address: '',
                        linkedin: '',
                        github: ''
                    },
                    summary: '',
                    workCareer: [{
                        position: '',
                        company: '',
                        startDate: '',
                        endDate: '',
                        description: '',
                        achievements: ['']
                    }],
                    education: [{
                        school: '',
                        degree: '',
                        field: '',
                        startDate: '',
                        endDate: '',
                        description: ''
                    }],
                    experience: [{
                        company: '',
                        position: '',
                        startDate: '',
                        endDate: '',
                        description: ''
                    }],
                    skills: [],
                    languages: [],
                    certifications: []
                });
            } else {
                throw new Error('Failed to create CV');
            }
        } catch (err) {
            alert('Failed to create CV: ' + err.message);
        }
    };

    const handleEdit = (cv) => {
        setEditingCV(cv);
        setFormData(cv);
        setShowForm(true);
    };

    if (authError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiEye className="text-red-500 text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-6">Please login to access your CV manager</p>
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700">Loading Your CVs</h2>
                    <p className="text-gray-500 mt-2">Please wait while we prepare your documents</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Your Professional CV Portfolio</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Manage, create, and customize your resumes in one place
                    </p>
                </div>
      
                {/* Action Bar */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                            >
                                <FiEdit2 size={18} /> Create Custom CV
                            </button>
                            
                            <div className="relative flex-1">
                                <label className="cursor-pointer flex items-center justify-center gap-2 w-full h-full px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 bg-gray-50 hover:bg-white transition-all">
                                    <FiUpload size={18} />
                                    <span className="font-medium">Upload CV</span>
                                    <input 
                                        type="file" 
                                        accept=".pdf,.doc,.docx,.jpg,.png" 
                                        onChange={handleFileSelect} 
                                        className="hidden" 
                                    />
                                </label>
                                {selectedFile && (
                                    <div className="absolute -bottom-5 left-0 right-0 text-center">
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            {selectedFile.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
            
                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                value={cvName}
                                onChange={(e) => setCvName(e.target.value)}
                                placeholder="Name your CV"
                                className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            />
                            <button
                                onClick={handleFileUpload}
                                disabled={uploading || !selectedFile}
                                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                                    uploading || !selectedFile 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <FiUpload size={18} /> Upload
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
      
                {/* CV Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cvs.map(cv => (
                        <div 
                            key={cv.id} 
                            className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                mainCvId === cv.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                        >
                            {/* Main CV Badge */}
                            {mainCvId === cv.id && (
                                <div className="absolute top-3 right-3 z-10">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <FiStar className="mr-1" /> Main CV
                                    </span>
                                </div>
                            )}
            
                            {/* CV Preview */}
                            <div className="h-48 bg-gradient-to-r from-blue-100 to-indigo-100 relative overflow-hidden">
                                {(() => {
                                    if (cv.fileCV && cv.fileCV.match(/\.(jpg|jpeg|png|gif)$/i)) {
                                        return (
                                            <img
                                                src={cv.fileCV}
                                                alt={`${cv.name || cv.title} preview`}
                                                className="w-full h-full object-cover"
                                            />
                                        );
                                    } else if (cv.fileCV && cv.fileCV.match(/\.pdf($|\?)/i)) {
                                        return <PdfBase64Image pdfUrl={cv.fileCV} />;
                                    } else {
                                        return (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-indigo-400">
                                                <FiFileText size={48} className="opacity-70" />
                                                <span className="mt-2 text-sm font-medium">Custom CV</span>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
            
                            {/* CV Details */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 truncate">
                                        {cv.name || cv.title || 'Untitled CV'}
                                    </h3>
                                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                        {cv.type === 'uploaded' ? 'Uploaded' : 'Custom'}
                                    </span>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {cv.summary || 'No description available'}
                                </p>
            
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => window.open(cv.fileCV, '_blank')}
                                        className="text-sm px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center gap-1 transition-colors"
                                    >
                                        <FiEye size={14} /> Preview
                                    </button>
                                    
                                    {mainCvId !== cv.id && (
                                        <button 
                                            onClick={() => makeMainCV(cv.id)}
                                            className="text-sm px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg flex items-center gap-1 transition-colors"
                                        >
                                            <FiStar size={14} /> Set as Main
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={() => handleDelete(cv.id)}
                                        className="text-sm px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center gap-1 transition-colors"
                                    >
                                        <FiTrash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            
                    {/* Empty State */}
                    {cvs.length === 0 && !loading && (
                        <div className="col-span-full">
                            <div className="bg-white rounded-xl shadow-md p-10 text-center">
                                <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                    <FiFileText className="text-blue-500 text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No CVs Found</h3>
                                <p className="text-gray-600 mb-6">Get started by uploading or creating a new CV</p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                                    >
                                        <FiEdit2 /> Create CV
                                    </button>
                                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                                        <FiUpload /> Upload CV
                                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileSelect} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
      
            {/* Custom CV Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">
                                    {editingCV ? 'Edit CV' : 'Create New CV'}
                                </h2>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            const cvPreview = document.getElementById('cv-preview');
                                            if (cvPreview) {
                                                cvPreview.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                        className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                                    >
                                        <FiEye /> Live Preview
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingCV(null);
                                        }}
                                        className="text-white hover:text-gray-200 p-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
            
                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
                                {/* Form Section */}
                                <div className="p-6 overflow-y-auto">
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* Basic Info */}
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CV Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Senior Developer Resume"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
            
                                        {/* Personal Info */}
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.entries(formData.personalInfo).map(([key, value]) => (
                                                    <div key={key}>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name={key}
                                                            value={value}
                                                            onChange={(e) => handleInputChange(e, 'personalInfo')}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
            
                                        {/* Sections with Add/Remove functionality */}
                                        {['summary', 'workCareer', 'education', 'experience', 'skills', 'languages', 'certifications'].map(section => (
                                            <div key={section} className="space-y-4">
                                                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                                                    {section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}
                                                </h3>
                                                
                                                {section === 'summary' ? (
                                                    <textarea
                                                        name="summary"
                                                        value={formData.summary}
                                                        onChange={handleInputChange}
                                                        placeholder="Write a compelling professional summary..."
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 transition-all"
                                                    />
                                                ) : Array.isArray(formData[section]) ? (
                                                    <>
                                                        <div className="space-y-4">
                                                            {formData[section].map((item, index) => (
                                                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <h4 className="font-medium text-gray-700">
                                                                            {section.slice(0, -1)} #{index + 1}
                                                                        </h4>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeItem(section, index)}
                                                                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                                                                        >
                                                                            <FiMinus size={14} /> Remove
                                                                        </button>
                                                                    </div>
                                                                    
                                                                    {/* Render fields based on section type */}
                                                                    {section === 'workCareer' && (
                                                                        <div className="space-y-3">
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                {['position', 'company', 'startDate', 'endDate'].map(field => (
                                                                                    <div key={field}>
                                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                                                                        </label>
                                                                                        <input
                                                                                            type="text"
                                                                                            name={field}
                                                                                            value={item[field] || ''}
                                                                                            onChange={(e) => handleInputChange(e, section, index)}
                                                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                                                                <textarea
                                                                                    name="description"
                                                                                    value={item.description || ''}
                                                                                    onChange={(e) => handleInputChange(e, section, index)}
                                                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm h-20"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <label className="block text-xs font-medium text-gray-500">Achievements</label>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const newAchievements = [...item.achievements, ''];
                                                                                            setFormData(prev => ({
                                                                                                ...prev,
                                                                                                [section]: prev[section].map((itm, i) =>
                                                                                                    i === index ? { ...itm, achievements: newAchievements } : itm
                                                                                                )
                                                                                            }));
                                                                                        }}
                                                                                        className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1"
                                                                                    >
                                                                                        <FiPlus size={12} /> Add
                                                                                    </button>
                                                                                </div>
                                                                                {item.achievements.map((achievement, aIndex) => (
                                                                                    <div key={aIndex} className="flex gap-2">
                                                                                        <input
                                                                                            type="text"
                                                                                            value={achievement}
                                                                                            onChange={(e) => {
                                                                                                const newAchievements = [...item.achievements];
                                                                                                newAchievements[aIndex] = e.target.value;
                                                                                                setFormData(prev => ({
                                                                                                    ...prev,
                                                                                                    [section]: prev[section].map((itm, i) =>
                                                                                                        i === index ? { ...itm, achievements: newAchievements } : itm
                                                                                                    )
                                                                                                }));
                                                                                            }}
                                                                                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                const newAchievements = item.achievements.filter((_, i) => i !== aIndex);
                                                                                                setFormData(prev => ({
                                                                                                    ...prev,
                                                                                                    [section]: prev[section].map((itm, i) =>
                                                                                                        i === index ? { ...itm, achievements: newAchievements } : itm
                                                                                                    )
                                                                                                }));
                                                                                            }}
                                                                                            className="text-red-500 hover:text-red-700 p-2"
                                                                                        >
                                                                                            <FiMinus size={12} />
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )  (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            {Object.keys(item).map(field => (
                                                                                <div key={field}>
                                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                                                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                                                                    </label>
                                                                                    <input
                                                                                        type="text"
                                                                                        name={field}
                                                                                        value={item[field] || ''}
                                                                                        onChange={(e) => handleInputChange(e, section, index)}
                                                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => addItem(section)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                                        >
                                                            <FiPlus size={14} /> Add {section.slice(0, -1)}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={formData[section].join(', ')}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            [section]: e.target.value.split(',').map(s => s.trim())
                                                        }))}
                                                        placeholder={`Enter ${section} separated by commas`}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    />
                                                )}
                                            </div>
                                        ))}
            
                                        {/* Form Actions */}
                                        <div className="flex justify-end gap-4 pt-4 border-t">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowForm(false);
                                                    setEditingCV(null);
                                                }}
                                                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                                            >
                                                {editingCV ? 'Update CV' : 'Save CV'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Preview Section */}
                                <div className="bg-gray-50 p-6 border-l border-gray-200 overflow-y-auto">
                                    <div className="sticky top-0 bg-gray-50 py-2 mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
                                        <p className="text-sm text-gray-500">See how your CV will look</p>
                                    </div>

                                    <div id="cv-preview" className="bg-white p-8 rounded-lg shadow-inner">
                                        <div className="text-center mb-6">
                                            <h1 className="text-2xl font-bold">{formData.personalInfo.fullName}</h1>
                                            <p className="text-gray-600">{formData.personalInfo.email} | {formData.personalInfo.phone}</p>
                                            <p className="text-gray-600">{formData.personalInfo.address}</p>
                                        </div>

                                        <div className="mb-6">
                                            <h2 className="text-xl font-semibold mb-2">Professional Summary</h2>
                                            <p className="text-gray-700">{formData.summary}</p>
                                        </div>

                                        <div className="mb-6">
                                            <h2 className="text-xl font-semibold mb-2">Work Career</h2>
                                            {formData.workCareer.map((career, index) => (
                                                <div key={index} className="mb-4">
                                                    <h3 className="font-semibold">{career.position} at {career.company}</h3>
                                                    <p className="text-gray-600">{career.startDate} - {career.endDate}</p>
                                                    <p className="text-gray-700 mt-2">{career.description}</p>
                                                    {career.achievements.length > 0 && (
                                                        <ul className="list-disc list-inside mt-2">
                                                            {career.achievements.map((achievement, aIndex) => (
                                                                <li key={aIndex} className="text-gray-700">{achievement}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mb-6">
                                            <h2 className="text-xl font-semibold mb-2">Education</h2>
                                            {formData.education.map((edu, index) => (
                                                <div key={index} className="mb-4">
                                                    <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
                                                    <p className="text-gray-600">{edu.school}</p>
                                                    <p className="text-gray-600">{edu.startDate} - {edu.endDate}</p>
                                                    <p className="text-gray-700 mt-2">{edu.description}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mb-6">
                                            <h2 className="text-xl font-semibold mb-2">Skills</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.skills.map((skill, index) => (
                                                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h2 className="text-xl font-semibold mb-2">Languages</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.languages.map((lang, index) => (
                                                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h2 className="text-xl font-semibold mb-2">Certifications</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.certifications.map((cert, index) => (
                                                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                                        {cert}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CVManager;
