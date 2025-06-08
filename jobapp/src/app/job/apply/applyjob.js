'use client';

import { useUserContext } from '@/app/context/usercontext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ApplyJob() {
    const router = useRouter();
    const { email } = useUserContext();

    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [candidate, setCandidate] = useState(null);
    const [cvList, setCvList] = useState([]);
    const [selectedCV, setSelectedCV] = useState('');
    const [uploadCV, setUploadCV] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [job, setJob] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (email) {
            fetch(`/api/candidate/get-candidate-by-email?email=${email}`)
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
            fetch(`/api/cv/get-cvs-by-candidate-id/${candidate.id}`)
                .then(res => res.json())
                .then(data => {
                    setCvList(data);
                }).catch(err => {
                    console.error(err);
                });
        }
    }, [candidate]);

    useEffect(() => {
        if (id) {
            fetch(`/api/job/detail/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    setJob(data);
                    if (data) {
                        setCompanyName(data.companyName || '')
                        setName(data.name || '')
                        setAddress(data.address || '')
                    }
                })
                .catch((error) => {
                    console.error('Error fetching job detail:', error);
                });
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const wordCount = coverLetter.trim().split(/\s+/).length;
        if (wordCount > 1000) {
            alert("Cover letter cannot exceed 1000 words.");
            setIsSubmitting(false);
            return;
        }

        if (uploadCV) {
            const formData = new FormData();
            formData.append('jobId', job.id);
            formData.append('candidateId', candidate.id);
            formData.append('applicantName', candidate.fullname);
            formData.append('applicantEmail', email);
            formData.append('selfMail', coverLetter);
            formData.append('cvFile', uploadCV);

            try {
                const response = await fetch(`/api/job/apply-with-file`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    alert('Application submitted successfully!');
                    router.push('/');
                } else {
                    const errorMessage = await response.text();
                    alert(`Failed to apply: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error applying with file:', error);
                alert('An error occurred during the application process. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        } else if (selectedCV) {
            try {
                const fetchFileCV = await fetch(`/api/cv/get-fileCV-by-CV-id/${selectedCV}`);
                
                if (!fetchFileCV.ok) {
                    alert('Unable to retrieve the CV file for the selected CV.');
                    setIsSubmitting(false);
                    return;
                }
        
                const fileCV = await fetchFileCV.text();
        
                const response = await fetch(`/api/job/apply?jobId=${job.id}&candidateId=${candidate.id}&applicantName=${candidate.fullname}&applicantEmail=${email}&selfMail=${coverLetter}&cvFile=${fileCV}`, {
                    method: 'POST',
                });
        
                if (response.ok) {
                    alert('Application submitted successfully!');
                    router.push('/');
                } else {
                    const errorMessage = await response.text();
                    alert(`Failed to apply: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error applying with CV:', error);
                alert('An error occurred during the application process. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            alert("Please select a CV to apply!");
            setIsSubmitting(false);
        }
    };

    const handleCVChange = (e) => {
        setSelectedCV(e.target.value);
        setUploadCV(null);
    };

    const handleUploadChange = (e) => {
        setUploadCV(e.target.files[0]);
        setSelectedCV('');
    };

    const handleRemoveUpload = () => {
        setUploadCV(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                        <h2 className="text-2xl font-bold">Apply for Job</h2>
                        <div className="mt-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">{name}</span>
                        </div>
                    </div>

                    {/* Job Info */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-start mb-4">
                            <div className="bg-blue-100 p-3 rounded-full mr-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{companyName}</h3>
                                <p className="text-gray-600 flex items-center mt-1">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {address}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Application Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* CV Selection */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">Select CV</label>
                            <div className="space-y-4">
                                {/* Existing CVs */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Saved CVs
                                    </h4>
                                    <select
                                        value={selectedCV}
                                        onChange={handleCVChange}
                                        className={`text-black w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${uploadCV ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                        disabled={!!uploadCV}
                                    >
                                        <option value="">Select a CV from your profile</option>
                                        {cvList.map((cv) => (
                                            <option key={cv.id} value={cv.id}>{cv.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Or Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="px-2 bg-white text-sm text-gray-500">or</span>
                                    </div>
                                </div>

                                {/* Upload New CV */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Upload New CV
                                    </h4>
                                    <div className="flex items-center">
                                        <label className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer ${selectedCV ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-blue-300 hover:bg-blue-50'}`}>
                                            <input
                                                type="file"
                                                onChange={handleUploadChange}
                                                className="hidden"
                                                disabled={!!selectedCV}
                                            />
                                            <div className="text-center">
                                                {uploadCV ? (
                                                    <div className="flex items-center">
                                                        <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-sm font-medium text-gray-700">{uploadCV.name}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium text-blue-600">Upload a file</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                        {uploadCV && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveUpload}
                                                className="ml-3 p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div className="mb-8">
                            <label className="block text-gray-700 font-medium mb-2">Cover Letter</label>
                            <div className="relative">
                                <textarea
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    className="text-black w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition h-40"
                                    placeholder="Write a brief cover letter about yourself and why you're suitable for this position (maximum 1000 words)..."
                                ></textarea>
                                <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                    {coverLetter.trim().split(/\s+/).filter(word => word.length > 0).length}/1000 words
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={(!selectedCV && !uploadCV) || isSubmitting}
                                className={`px-6 py-2.5 rounded-lg text-white font-medium transition duration-300 flex items-center ${(!selectedCV && !uploadCV) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Submit Application
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}