'use client';

import { useEffect, useState } from 'react';
import { useRecruiterContext } from '../context/recruitercontext';
import { useUserContext } from '../context/usercontext';

export default function MyCompany() {
    const { account } = useUserContext();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [editable, setEditable] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { recruiter } = useRecruiterContext();
    const jobsPerPage = 5;
    const [createdRecruiter, setCreatedRecruiter] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        if (recruiter?.companyId) {
            fetchCompanyData(recruiter?.companyId);
            fetchPublishedJobs(recruiter?.companyId);
        }
    }, [recruiter?.companyId]);

    useEffect(() => {
        if (company?.createdRecruiterId) {
            fetchCreatedRecruiter(company?.createdRecruiterId);
        }
    }, [company?.createdRecruiterId]);

    useEffect(() => {
        if (account?.role === 'super recruiter') {
            setEditable(false);
        }
    }, [account]);

    const fetchCreatedRecruiter = async (id) => {
        try {
            const res = await fetch(`http://localhost:8080/api/recruiter/get-recruiter/${id}`);
            if (!res.ok) throw new Error('Failed to fetch recruiter');
            const data = await res.json();
            setCreatedRecruiter(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCompanyData = async (id) => {
        try {
            const res = await fetch(`http://localhost:8080/api/company/get-company-by-id/${id}`);
            if (!res.ok) throw new Error('Failed to fetch company data');
            const data = await res.json();
            setCompany(data);
        } catch (error) {
            console.error('Error fetching company data:', error);
        }
    };

    const fetchPublishedJobs = async (id) => {
        try {
            const res = await fetch(`http://localhost:8080/api/job/get-published-jobs-by-company-id/${id}`);
            if (!res.ok) throw new Error('Failed to fetch jobs');
            const data = await res.json();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/company/edit/${company.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    name: company.name,
                    email: company.email,
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
        setLogoFile(e.target.files[0]); // Set the selected file to state
    };

    const handleLogoUpload = async () => {
        if (!logoFile) return;

        const formData = new FormData();
        formData.append('file', logoFile);
        formData.append('id', company.id);

        try {
            const res = await fetch('http://localhost:8080/api/company/change-logo', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to upload logo');

            const updatedCompany = await res.json();
            setCompany(updatedCompany); // Update company data with the new logo
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
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-6 text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">My Company</h1>

                    <div className="flex items-center mb-4">
                        <img
                            src={company.logo}
                            alt="Company Logo"
                            className="w-24 h-24 rounded-full mr-6 object-cover"
                        />
                        {editable && (
                            <div>
                                <input type="file" onChange={handleLogoChange} className="mt-2" />
                                <button
                                    onClick={handleLogoUpload}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-2"
                                >
                                    Upload New Logo
                                </button>
                            </div>
                        )}
                        <div>
                            {editable ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={company.name}
                                    onChange={handleChange}
                                    className="border p-2 rounded"
                                />
                            ) : (
                                <h2 className="text-xl font-semibold text-gray-700">{company.name}</h2>
                            )}
                            {editable ? (
                                <input
                                    type="text"
                                    name="website"
                                    value={company.website}
                                    onChange={handleChange}
                                    className="border p-2 rounded mt-2"
                                />
                            ) : (
                                <p className="text-sm text-gray-500">{company.website}</p>
                            )}
                        </div>
                    </div>

                    {/* Editable fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">Email</h3>
                            {editable ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={company.email}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.email}</p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">Phone Number</h3>
                            {editable ? (
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={company.phoneNumber}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.phoneNumber}</p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">Detail of Address</h3>
                            {editable ? (
                                <input
                                    type="text"
                                    name="addressDetail"
                                    value={company.addressDetail}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.addressDetail}</p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">City</h3>
                            {editable ? (
                                <input
                                    type="text"
                                    name="city"
                                    value={company.city}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.city}</p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">Province</h3>
                            {editable ? (
                                <input
                                    type="text"
                                    name="province"
                                    value={company.province}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.province}</p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">Created By</h3>
                            <p className="text-gray-800 mt-1">{createdRecruiter?.fullname}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-600">Company Information</h3>
                            {editable ? (
                                <textarea
                                    name="information"
                                    value={company.information}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.information}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        {editable ? (
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Update
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditable(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    <div className="mt-10">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Published Jobs</h2>
                        <ul>
                            {currentJobs.map((job) => (
                                <li
                                    key={job.id}
                                    className="bg-gray-50 p-4 mb-4 rounded-lg shadow-sm hover:bg-gray-200 cursor-pointer"
                                    onClick={() => window.location.href = `/recruiter/jobs-management?id=${job.id}`}
                                >
                                    <h3 className="text-lg font-semibold text-gray-700">{job.name}</h3>
                                    <p className="text-sm text-gray-500">{job.address}</p>
                                    <p className="text-sm text-gray-500">{job.salary}</p>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={nextPage}
                                disabled={indexOfLastJob >= jobs.length}
                                className={`px-4 py-2 rounded ${indexOfLastJob >= jobs.length ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
