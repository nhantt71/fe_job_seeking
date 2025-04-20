"use client";

import { useState, useEffect } from 'react';
import { useUserContext } from '../context/usercontext';
import { FiUpload, FiTrash2, FiEye, FiStar, FiCheckCircle, FiPlus, FiMinus, FiEdit2, FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

    useEffect(() => {
        if (email) {
            fetch(`/api/candidate/get-candidate-by-email?email=${email}`)
                .then(res => res.json())
                .then(data => setCandidate(data))
                .catch(console.error);
        }
    }, [email]);

    useEffect(() => {
        if (candidate) {
            fetch(`/api/cv/get-cvs-by-candidate-id/${candidate.id}`)
                .then(res => res.json())
                .then(data => {
                    setCVs(data);
                    const mainCv = data.find(cv => cv.mainCV);
                    if (mainCv) setMainCvId(mainCv.id);
                })
                .catch(console.error);
        }
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

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`/api/cv/upload-cv?candidateId=${candidate.id}&name=${cvName}`, {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                setCVs(prev => [...prev, data]);
                setCvName('');
                setSelectedFile(null);
            } else {
                throw new Error('Failed to upload');
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };

    const makeMainCV = async (cvId) => {
        if (!candidate) return;

        try {
            const res = await fetch(`/api/cv/make-main-cv?id=${cvId}&candidateId=${candidate.id}`, {
                method: 'POST'
            });

            if (res.ok) {
                setMainCvId(cvId);
                setCVs(prev => prev.map(cv => ({ ...cv, mainCV: cv.id === cvId })));
            }
        } catch (err) {
            alert('Failed to set main CV');
        }
    };

    const handleDelete = async (cvId) => {
        try {
            const res = await fetch(`/api/cv/delete-cv/${cvId}`, { method: 'POST' });
            if (res.ok) {
                setCVs(prev => prev.filter(cv => cv.id !== cvId));
                if (mainCvId === cvId) setMainCvId(null);
            }
        } catch (err) {
            alert('Failed to delete CV');
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

            const response = await fetch('/api/upload-file', {
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-700">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
                <p>Loading your CVs...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 text-black">
            <h1 className="text-3xl font-bold mb-6 text-center">📄 Manage Your CVs</h1>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                    >
                        <FiEdit2 /> Create Custom CV
                    </button>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <label className="cursor-pointer px-4 py-2 border bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                            Select File
                            <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileSelect} className="hidden" />
                        </label>
                        {selectedFile && <span className="text-sm text-gray-700">{selectedFile.name}</span>}
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <input
                        type="text"
                        value={cvName}
                        onChange={(e) => setCvName(e.target.value)}
                        placeholder="CV Name"
                        className="flex-1 px-4 py-2 border rounded-md text-sm"
                    />
                    <button
                        onClick={handleFileUpload}
                        disabled={uploading || !selectedFile}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
                    >
                        <FiUpload />
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cvs.map(cv => (
                    <div key={cv.id} className={`border rounded-xl p-6 bg-white shadow hover:shadow-lg transition-all duration-300 relative`}>
                        {mainCvId === cv.id && (
                            <div className="absolute top-2 right-2 text-green-600 text-xs font-bold flex items-center gap-1">
                                <FiCheckCircle /> Main CV
                            </div>
                        )}
                        <h2 className="text-lg font-semibold mb-2">{cv.name || cv.title}</h2>
                        <p className="text-sm text-gray-600 truncate">
                            {cv.type === 'uploaded' ? `File: ${cv.fileCV}` : cv.summary}
                        </p>

                        <div className="mt-4 flex gap-3">
                            {cv.type === 'uploaded' ? (
                                <a href={cv.fileCV} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1">
                                    <FiEye /> View
                                </a>
                            ) : (
                                <button onClick={() => handleEdit(cv)} className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1">
                                    <FiEdit2 /> Edit
                                </button>
                            )}
                            {mainCvId !== cv.id && (
                                <button onClick={() => makeMainCV(cv.id)} className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1">
                                    <FiStar /> Make Main
                                </button>
                            )}
                            <button onClick={() => handleDelete(cv.id)} className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1">
                                <FiTrash2 /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom CV Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                {editingCV ? 'Edit Custom CV' : 'Create Custom CV'}
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const cvPreview = document.getElementById('cv-preview');
                                        if (cvPreview) {
                                            cvPreview.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                                >
                                    <FiEye /> Preview
                                </button>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingCV(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Form Section */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="CV Title"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Personal Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(formData.personalInfo).map(([key, value]) => (
                                            <input
                                                key={key}
                                                type="text"
                                                name={key}
                                                value={value}
                                                onChange={(e) => handleInputChange(e, 'personalInfo')}
                                                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Professional Summary</h3>
                                    <textarea
                                        name="summary"
                                        value={formData.summary}
                                        onChange={handleInputChange}
                                        placeholder="Write a brief summary about yourself"
                                        className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Work Career */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-800">Work Career</h3>
                                        <button
                                            type="button"
                                            onClick={() => addItem('workCareer')}
                                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                                        >
                                            <FiPlus /> Add Career
                                        </button>
                                    </div>
                                    {formData.workCareer.map((career, index) => (
                                        <div key={index} className="space-y-3 border p-4 rounded-lg bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-gray-700">Career #{index + 1}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('workCareer', index)}
                                                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                                >
                                                    <FiMinus /> Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    name="position"
                                                    value={career.position}
                                                    onChange={(e) => handleInputChange(e, 'workCareer', index)}
                                                    placeholder="Position"
                                                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    name="company"
                                                    value={career.company}
                                                    onChange={(e) => handleInputChange(e, 'workCareer', index)}
                                                    placeholder="Company"
                                                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    name="startDate"
                                                    value={career.startDate}
                                                    onChange={(e) => handleInputChange(e, 'workCareer', index)}
                                                    placeholder="Start Date"
                                                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    name="endDate"
                                                    value={career.endDate}
                                                    onChange={(e) => handleInputChange(e, 'workCareer', index)}
                                                    placeholder="End Date"
                                                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <textarea
                                                name="description"
                                                value={career.description}
                                                onChange={(e) => handleInputChange(e, 'workCareer', index)}
                                                placeholder="Job Description"
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                                            />
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <h5 className="font-medium text-gray-700">Achievements</h5>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newAchievements = [...career.achievements, ''];
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                workCareer: prev.workCareer.map((item, i) => 
                                                                    i === index ? { ...item, achievements: newAchievements } : item
                                                                )
                                                            }));
                                                        }}
                                                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
                                                    >
                                                        <FiPlus /> Add Achievement
                                                    </button>
                                                </div>
                                                {career.achievements.map((achievement, aIndex) => (
                                                    <div key={aIndex} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={achievement}
                                                            onChange={(e) => {
                                                                const newAchievements = [...career.achievements];
                                                                newAchievements[aIndex] = e.target.value;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    workCareer: prev.workCareer.map((item, i) => 
                                                                        i === index ? { ...item, achievements: newAchievements } : item
                                                                    )
                                                                }));
                                                            }}
                                                            placeholder={`Achievement ${aIndex + 1}`}
                                                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newAchievements = career.achievements.filter((_, i) => i !== aIndex);
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    workCareer: prev.workCareer.map((item, i) => 
                                                                        i === index ? { ...item, achievements: newAchievements } : item
                                                                    )
                                                                }));
                                                            }}
                                                            className="text-red-500 hover:text-red-700 p-2"
                                                        >
                                                            <FiMinus />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Education */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                                        <button
                                            type="button"
                                            onClick={() => addItem('education')}
                                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                                        >
                                            <FiPlus /> Add Education
                                        </button>
                                    </div>
                                    {formData.education.map((edu, index) => (
                                        <div key={index} className="space-y-3 border p-4 rounded-lg bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-gray-700">Education #{index + 1}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('education', index)}
                                                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                                >
                                                    <FiMinus /> Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.entries(edu).map(([key, value]) => (
                                                    <input
                                                        key={key}
                                                        type="text"
                                                        name={key}
                                                        value={value}
                                                        onChange={(e) => handleInputChange(e, 'education', index)}
                                                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Experience */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-800">Work Experience</h3>
                                        <button
                                            type="button"
                                            onClick={() => addItem('experience')}
                                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                                        >
                                            <FiPlus /> Add Experience
                                        </button>
                                    </div>
                                    {formData.experience.map((exp, index) => (
                                        <div key={index} className="space-y-3 border p-4 rounded-lg bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-gray-700">Experience #{index + 1}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('experience', index)}
                                                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                                >
                                                    <FiMinus /> Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.entries(exp).map(([key, value]) => (
                                                    <input
                                                        key={key}
                                                        type="text"
                                                        name={key}
                                                        value={value}
                                                        onChange={(e) => handleInputChange(e, 'experience', index)}
                                                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Skills */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Skills</h3>
                                    <input
                                        type="text"
                                        value={formData.skills.join(', ')}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            skills: e.target.value.split(',').map(s => s.trim())
                                        }))}
                                        placeholder="Enter skills separated by commas"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Languages */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Languages</h3>
                                    <input
                                        type="text"
                                        value={formData.languages.join(', ')}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            languages: e.target.value.split(',').map(l => l.trim())
                                        }))}
                                        placeholder="Enter languages separated by commas"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Certifications */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Certifications</h3>
                                    <input
                                        type="text"
                                        value={formData.certifications.join(', ')}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            certifications: e.target.value.split(',').map(c => c.trim())
                                        }))}
                                        placeholder="Enter certifications separated by commas"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingCV(null);
                                        }}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        {editingCV ? 'Update CV' : 'Create CV'}
                                    </button>
                                </div>
                            </form>

                            {/* Preview Section */}
                            <div className="sticky top-0">
                                <div id="cv-preview" className="bg-white p-6 rounded-lg shadow-lg">
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
            )}
        </div>
    );
};

export default CVManager;
