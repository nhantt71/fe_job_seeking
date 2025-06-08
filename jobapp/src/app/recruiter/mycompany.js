'use client';

import { useEffect, useState } from 'react';
import { useRecruiterContext } from '../context/recruitercontext';
import { useUserContext } from '../context/usercontext';

export default function MyCompany() {
    const { account } = useUserContext();
    const [company, setCompany] = useState(null);
    const { companyId } = useRecruiterContext();
    const [jobs, setJobs] = useState([]);
    const [editable, setEditable] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 5;
    const [createdRecruiter, setCreatedRecruiter] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [recruiterId, setRecruiterId] = useState(null);

    useEffect(() => {
        if (companyId) {
            fetchCompanyData(companyId);
            fetchPublishedJobs(companyId);
        }
    }, [companyId]);

    useEffect(() => {
        if (company?.createdRecruiterId) {
            setRecruiterId(company?.createdRecruiterId);
        }
    }, [company?.createdRecruiterId]);

    useEffect(() => {
        if (account?.role === 'RECRUITER') {
            setEditable(false);
        }
    }, [account]);

    useEffect(() => {
        if (recruiterId) {
            fetchCreatedRecruiter(recruiterId);
        }
    }, [recruiterId]);

    const fetchCreatedRecruiter = async (createdRecruiterId) => {
        try {
            const res = await fetch(`/api/recruiter/get-recruiter/${createdRecruiterId}`);
            if (!res.ok) throw new Error('Failed to fetch recruiter');
            const data = await res.json();
            setCreatedRecruiter(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCompanyData = async (companyId) => {
        try {
            const res = await fetch(`/api/company/get-company-by-id/${companyId}`);
            if (!res.ok) throw new Error('Failed to fetch company data');
            const data = await res.json();
            setCompany(data);
        } catch (error) {
            console.error('Error fetching company data:', error);
        }
    };

    const fetchPublishedJobs = async (companyId) => {
        try {
            const res = await fetch(`/api/job/get-published-jobs-by-company-id/${companyId}`);
            if (!res.ok) throw new Error('Failed to fetch jobs');
            const data = await res.json();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/company/edit/${companyId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    name: company.name,
                    email: company.email,
                    taxCode: company.taxCode,
                    phoneNumber: company.phoneNumber,
                    website: company.website,
                    information: company.information,
                    detail: company.addressDetail,
                    city: company.city,
                    province: company.province,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update company');
            }

            await fetchCompanyData(company.id);
            setEditable(false);

        } catch (error) {
            console.error('Error updating company:', error);
        }
    };

    const handleChange = (e) => {
        setCompany({
            ...company,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogoChange = (e) => {
        setLogoFile(e.target.files[0]);
    };

    const handleLogoUpload = async () => {
        if (!logoFile) return;

        const formData = new FormData();
        formData.append('file', logoFile);
        formData.append('id', company.id);

        try {
            const res = await fetch('/api/company/change-logo', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to upload logo');

            const updatedCompany = await res.json();
            setCompany(updatedCompany);
        } catch (err) {
            console.error('Error uploading logo:', err);
        }
    };

    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

    const nextPage = () => {
        if (indexOfLastJob < jobs.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (!company) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const getStatusBadge = () => {
        switch (company.reviewStatus) {
            case "APPROVED":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Approved
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Rejected
                    </span>
                );
            case "PENDING":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Pending Review
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Company Profile</h1>
                                <p className="text-blue-100">Manage your company information and published jobs</p>
                            </div>
                            {getStatusBadge()}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 sm:p-8">
                        {/* Company Info Section */}
                        <div className="mb-10">
                            <div className="flex flex-col md:flex-row gap-8 mb-8">
                                {/* Logo Section */}
                                <div className="flex-shrink-0">
                                    <div className="relative group">
                                        <img
                                            src={company.logo || "/default-company-logo.png"}
                                            alt="Company Logo"
                                            className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-md"
                                        />
                                        {editable && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <label className="cursor-pointer text-white text-center p-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Change Logo
                                                    <input type="file" onChange={handleLogoChange} className="hidden" />
                                                </label>
                                                {logoFile && (
                                                    <button
                                                        onClick={handleLogoUpload}
                                                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                                                    >
                                                        Upload
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Basic Info */}
                                <div className="flex-grow">
                                    <div className="mb-6">
                                        {editable ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={company.name}
                                                onChange={handleChange}
                                                className="text-2xl font-bold bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        ) : (
                                            <h2 className="text-2xl font-bold text-gray-800">{company.name}</h2>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Website</label>
                                            {editable ? (
                                                <input
                                                    type="text"
                                                    name="website"
                                                    value={company.website}
                                                    onChange={handleChange}
                                                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            ) : (
                                                <p className="text-blue-600 hover:underline">
                                                    <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer">
                                                        {company.website}
                                                    </a>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                                            <p className="text-gray-800">{createdRecruiter?.fullname}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Contact Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                            {editable ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={company.email}
                                                    onChange={handleChange}
                                                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-800">{company.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                                            {editable ? (
                                                <input
                                                    type="text"
                                                    name="phoneNumber"
                                                    value={company.phoneNumber}
                                                    onChange={handleChange}
                                                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-800">{company.phoneNumber}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Tax Code</label>
                                            {editable ? (
                                                <input
                                                    type="text"
                                                    name="taxCode"
                                                    value={company.taxCode}
                                                    onChange={handleChange}
                                                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-800">{company.taxCode}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Location</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                                            {editable ? (
                                                <input
                                                    type="text"
                                                    name="addressDetail"
                                                    value={company.addressDetail}
                                                    onChange={handleChange}
                                                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-800">{company.addressDetail}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
                                                {editable ? (
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={company.city}
                                                        onChange={handleChange}
                                                        className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800">{company.city}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">Province</label>
                                                {editable ? (
                                                    <input
                                                        type="text"
                                                        name="province"
                                                        value={company.province}
                                                        onChange={handleChange}
                                                        className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800">{company.province}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 bg-gray-50 p-5 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">About Company</h3>
                                    {editable ? (
                                        <textarea
                                            name="information"
                                            value={company.information}
                                            onChange={handleChange}
                                            rows="5"
                                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="text-gray-800 whitespace-pre-line">{company.information}</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex justify-end space-x-3">
                                {editable ? (
                                    <>
                                        <button
                                            onClick={() => setEditable(false)}
                                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setEditable(true)}
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Published Jobs Section */}
                        <div className="border-t pt-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Published Jobs</h2>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
                                </span>
                            </div>

                            {jobs.length === 0 ? (
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-lg font-medium text-gray-700">No published jobs yet</h3>
                                    <p className="mt-1 text-gray-500">Get started by creating your first job posting</p>
                                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Create Job
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {currentJobs.map((job) => (
                                            <div
                                                key={job.id}
                                                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => window.location.href = `/recruiter/jobs-management?id=${job.id}`}
                                            >
                                                <div className="flex justify-between">
                                                    <h3 className="text-lg font-semibold text-gray-800">{job.name}</h3>
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                        Published
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex items-center text-gray-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>{job.address}</span>
                                                </div>
                                                <div className="mt-2 flex items-center text-gray-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{job.salary}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {jobs.length > jobsPerPage && (
                                        <div className="mt-6 flex justify-between items-center">
                                            <button
                                                onClick={prevPage}
                                                disabled={currentPage === 1}
                                                className={`px-4 py-2 rounded-lg flex items-center ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Previous
                                            </button>
                                            <span className="text-gray-700">
                                                Page {currentPage} of {Math.ceil(jobs.length / jobsPerPage)}
                                            </span>
                                            <button
                                                onClick={nextPage}
                                                disabled={indexOfLastJob >= jobs.length}
                                                className={`px-4 py-2 rounded-lg flex items-center ${indexOfLastJob >= jobs.length ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                Next
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}