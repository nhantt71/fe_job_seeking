'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRecruiterContext } from '../context/recruitercontext';

export default function JobsManagement() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const { recruiter } = useRecruiterContext();
    const [newJob, setNewJob] = useState({
        name: '',
        detail: '',
        experience: '',
        salary: '',
        category: '',
        endDate: '',
        enable: true
    });

    useEffect(() => {
        if (recruiter?.companyId) {
            fetchAllJobs(recruiter?.companyId);
        }
    }, [recruiter?.companyId]);

    const [isEditing, setIsEditing] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [categoryNames, setCategoryNames] = useState({});
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState('');
    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/category');
            const data = await response.json();
            const names = {};
            data.forEach((category) => {
                names[category.id] = category.name;
            });
            setCategoryNames(names);
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchAllJobs = async (id) => {
        try {
            const res = await fetch(`/api/job/get-job-by-company-id/${id}`);
            if (!res.ok) throw new Error('Failed to fetch jobs');
            const data = await res.json();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const fetchJobById = async (jobId) => {
        try {
            const res = await fetch(`/api/job/get-job-by-id/${jobId}`);
            if (!res.ok) throw new Error('Failed to fetch job');
            const data = await res.json();
            setEditingJob({ ...data, category: data.category.id });
            setIsEditing(true);
        } catch (error) {
            console.error('Error fetching job:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchJobById(id);
        } else {
            setIsEditing(false);
            setEditingJob(null);
            setNewJob({ name: '', detail: '', experience: '', salary: '', category: '', endDate: '', enable: true });
        }
    }, [id]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewJob((prev) => ({ ...prev, [name]: value }));
    };

    const handlePost = async () => {
        try {
            const recruiterId = recruiter?.id;
            const companyId = recruiter?.companyId;

            const response = await fetch(`/api/job/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    name: newJob.name,
                    detail: newJob.detail,
                    experience: newJob.experience,
                    salary: newJob.salary,
                    categoryId: newJob.category,
                    recruiterId: recruiterId,
                    companyId: companyId,
                    endDate: newJob.endDate,
                }),
            });

            if (!response.ok) {
                throw new Error("Error creating job");
            }

            const successMessage = await response.text();
            const createdJob = { ...newJob, id: Date.now(), category: newJob.category };
            setJobs((prev) => [...prev, createdJob]);
            setSuccessMessage(successMessage);
            setNewJob({ name: '', detail: '', experience: '', salary: '', category: '', endDate: '', enable: true });
        } catch (error) {
            console.error("Error creating job:", error);
        }
    };

    const handleEdit = (job) => {
        router.push(`/recruiter/jobs-management?id=${job.id}`);
    };

    const handleView = (id) => {
        router.push(`/recruiter/jobs-management?id=${id}`);
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/job/edit/${editingJob.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    name: editingJob.name,
                    detail: editingJob.detail,
                    experience: editingJob.experience,
                    salary: editingJob.salary,
                    categoryId: editingJob.category,
                    endDate: editingJob.endDate
                }),
            });

            if (!response.ok) {
                throw new Error("Error updating job");
            }

            const updatedJob = await response.json();
            setJobs((prev) =>
                prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
            );
            setIsEditing(false);
            setEditingJob(null);
            setSuccessMessage('Job updated successfully!');
            router.push('/recruiter/jobs-management');
        } catch (error) {
            console.error("Error updating job:", error);
        }
    };

    const handleDelete = async (jobId) => {
        try {
            const response = await fetch(`/api/job/delete/${jobId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Error deleting job");
            }

            setJobs((prev) => prev.filter((job) => job.id !== jobId));
            setDeleteSuccessMessage('Job deleted successfully!');
        } catch (error) {
            console.error("Error deleting job:", error);
        }
    };

    const handlePublish = async (jobId) => {
        try {
            const response = await fetch(`/api/job/publish/${jobId}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Error publishing job");
            }

            const message = await response.text();
            setSuccessMessage(message);
            setJobs((prev) =>
                prev.map((job) =>
                    job.id === jobId ? { ...job, enable: true } : job
                )
            );
        } catch (error) {
            console.error("Error publishing job:", error);
        }
    };

    const handleUnpublish = async (jobId) => {
        try {
            const response = await fetch(`/api/job/unpublish/${jobId}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Error unpublishing job");
            }

            const message = await response.text();
            setSuccessMessage(message);
            setJobs((prev) =>
                prev.map((job) =>
                    job.id === jobId ? { ...job, enable: false } : job
                )
            );
        } catch (error) {
            console.error("Error unpublishing job:", error);
        }
    };

    return (
        <div className="container mx-auto p-6 text-black">
            <h1 className="text-2xl font-bold mb-6">Jobs Management</h1>

            {successMessage && (
                <div className="bg-green-500 text-white p-4 rounded mb-4">
                    {successMessage}
                </div>
            )}

            {deleteSuccessMessage && (
                <div className="bg-red-500 text-white p-4 rounded mb-4">
                    {deleteSuccessMessage}
                </div>
            )}

            <div className="bg-white shadow-md rounded p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Job" : "Create Job"}</h2>

                <form>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input
                            type="text"
                            name="name"
                            value={isEditing ? editingJob?.name : newJob.name}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, name: e.target.value })
                                    : handleChange(e)
                            }
                            placeholder="Job Name"
                            className="border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="experience"
                            value={isEditing ? editingJob?.experience : newJob.experience}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, experience: e.target.value })
                                    : handleChange(e)
                            }
                            placeholder="Experience"
                            className="border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="salary"
                            value={isEditing ? editingJob?.salary : newJob.salary}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, salary: e.target.value })
                                    : handleChange(e)
                            }
                            placeholder="Salary"
                            className="border p-2 rounded"
                        />
                        <select
                            name="category"
                            value={isEditing ? editingJob?.category : newJob.category}
                            onChange={(e) => {
                                const selectedCategoryId = e.target.value;
                                if (isEditing) {
                                    setEditingJob({ ...editingJob, category: selectedCategoryId });
                                } else {
                                    setNewJob((prev) => ({ ...prev, category: selectedCategoryId }));
                                }
                            }}
                            className="border p-2 rounded"
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            name="endDate"
                            value={isEditing ? editingJob?.endDate : newJob.endDate}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, endDate: e.target.value })
                                    : handleChange(e)
                            }
                            className="border p-2 rounded"
                        />
                        <textarea
                            name="detail"
                            value={isEditing ? editingJob?.detail : newJob.detail}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, detail: e.target.value })
                                    : handleChange(e)
                            }
                            placeholder="Job Detail"
                            className="border p-2 rounded"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={isEditing ? handleUpdate : handlePost}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {isEditing ? "Update" : "Post Job"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing(false);
                            setEditingJob(null);
                            setNewJob({ name: '', detail: '', experience: '', salary: '', category: '', endDate: '', enable: true });
                            router.push('/recruiter/jobs-management');
                        }}
                        className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </form>
            </div>

            <div className="bg-white shadow-md rounded p-6">
                <h2 className="text-xl font-bold mb-4">Job List</h2>
                <ul>
                    {jobs.map((job) => (
                        <li key={job.id} className="mb-4 p-4 border rounded bg-gray-50">
                            <h3 className="text-lg font-bold">{job.name}</h3>
                            <p>Experience: {job.experience}</p>
                            <p>Salary: {job.salary}</p>
                            <p>Category: {categoryNames[job.categoryId] || 'Unknown'}</p>
                            <p>End Date: {job.endDate}</p>

                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => job.enable ? handleUnpublish(job.id) : handlePublish(job.id)}
                                    className={`px-4 py-2 rounded ${job.enable ? "bg-green-500" : "bg-gray-500"} text-white`}
                                >
                                    {job.enable ? "Published" : "Publish"}
                                </button>
                                <button
                                    onClick={() => handleEdit(job)}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(job.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleView(job.id)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    View
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
