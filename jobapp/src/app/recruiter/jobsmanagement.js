'use client';

import {
    PencilSquareIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowUpTrayIcon,
} from '@heroicons/react/24/solid';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRecruiterContext } from '../context/recruitercontext';
import { createJobNotification } from '../firebase';
import NotificationToast from '../components/NotificationToast';

export default function JobsManagement() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const { companyId } = useRecruiterContext();
    const [newJob, setNewJob] = useState({
        name: '',
        detail: '',
        experience: '',
        salary: '',
        categoryId: '',
        endDate: ''
    });


    useEffect(() => {
        if (companyId) {
            fetchAllJobs(companyId);
        }
    }, [companyId]);

    const [isEditing, setIsEditing] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [categoryNames, setCategoryNames] = useState({});
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState('');
    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

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

            // Ensure consistent job data format
            const mappedJobs = data.map(job => {
                // Extract categoryId from job data
                const categoryId = job.categoryId || (job.category && job.category.id ? job.category.id : '');

                return {
                    ...job,
                    // Ensure we have categoryId for display purposes
                    categoryId: categoryId
                };
            });

            setJobs(mappedJobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const fetchJobById = async (jobId) => {
        try {
            // Prevent trying to fetch jobs with client-side temporary IDs
            if (!jobId || isNaN(Number(jobId)) || jobId.toString().length > 10) {
                setIsEditing(false);
                setEditingJob(null);
                router.push('/recruiter/jobs-management');
                return;
            }

            // Fetch job data
            const res = await fetch(`/api/job/get-job-by-id/${jobId}`);
            if (!res.ok) throw new Error('Failed to fetch job');
            const data = await res.json();

            if (data) {

                // Fetch category ID directly using the dedicated API
                const categoryRes = await fetch(`/api/category/get-cateId-by-jobId/${jobId}`);
                if (!categoryRes.ok) throw new Error('Failed to fetch category ID');
                const categoryId = await categoryRes.json();

                // Format the date for the input field (YYYY-MM-DD)
                let formattedDate = '';
                if (data.endDate) {
                    // Handle different date formats
                    const dateObj = new Date(data.endDate);
                    if (!isNaN(dateObj)) {
                        formattedDate = dateObj.toISOString().split('T')[0];
                    } else if (typeof data.endDate === 'string') {
                        // Try to parse different string formats
                        const dateParts = data.endDate.split('T')[0].split(' ')[0];
                        formattedDate = dateParts;
                    }
                }

                // Fetch categories first to ensure they're loaded
                await fetchCategories();

                // Create a consistent job object with the category ID
                const mappedJob = {
                    ...data,
                    categoryId: String(categoryId),
                    endDate: formattedDate
                };

                setEditingJob(mappedJob);
                setIsEditing(true);
            } else {
                console.error('Job data is undefined or null');
                setIsEditing(false);
                router.push('/recruiter/jobs-management');
            }
        } catch (error) {
            console.error('Error fetching job:', error);
            setIsEditing(false);
            router.push('/recruiter/jobs-management');
        }
    };

    useEffect(() => {
        if (id) {
            fetchJobById(id);
        } else {
            setIsEditing(false);
            setEditingJob(null);
            setNewJob({ name: '', detail: '', experience: '', salary: '', categoryId: '', endDate: '' });
        }
    }, [id]);





    // Fetch categories when component mounts
    useEffect(() => {
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewJob((prev) => ({ ...prev, [name]: value }));
    };

    // Display toast notification
    const showToast = (title, message, type = 'info') => {
        setToast({
            show: true,
            title,
            message,
            type
        });
    };

    // Close toast notification
    const closeToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    const handlePost = async () => {
        const token = localStorage.getItem('token');
        try {
            // Make sure we're sending the category ID as is
            const categoryId = newJob.categoryId || '';

            // Convert date string to ISO format required by LocalDateTime.parse()
            const formattedEndDate = newJob.endDate ? `${newJob.endDate}T00:00:00` : '';

            const response = await fetch(`http://localhost:8080/api/job/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Bearer ${token}`
                },
                body: new URLSearchParams({
                    name: newJob.name,
                    detail: newJob.detail,
                    experience: newJob.experience,
                    salary: newJob.salary,
                    categoryId: categoryId,
                    companyId: companyId,
                    endDate: formattedEndDate
                }),
            });

            if (!response.ok) {
                throw new Error("Error creating job");
            }

            // Instead of creating a job with a temporary ID, fetch all jobs again to get the accurate data
            const successMessage = await response.text();
            setSuccessMessage(successMessage);
            setNewJob({ name: '', detail: '', experience: '', salary: '', categoryId: '', endDate: '' });

            // Create notification for job creation
            await createJobNotification('create', newJob.name);
            
            // Show toast notification
            showToast('Job Created', `Job "${newJob.name}" has been created successfully.`, 'success');

            // Refresh the job list to get the actual job with the server-generated ID and proper category
            fetchAllJobs(companyId);
        } catch (error) {
            console.error("Error creating job:", error);
            showToast('Error', 'Failed to create job. Please try again.', 'error');
        }
    };

    const handleEdit = (job) => {
        if (job && job.id && !isNaN(Number(job.id))) {
            router.push(`/recruiter/jobs-management?id=${job.id}`);
        } else {
            console.error('Invalid job ID for editing');
        }
    };


    const handleUpdate = async () => {
        const token = localStorage.getItem('token');
        try {
            // Use the categoryId from editingJob
            const categoryId = editingJob.categoryId;

            // Convert date string to ISO format required by LocalDateTime.parse()
            const formattedEndDate = editingJob.endDate ? `${editingJob.endDate}T00:00:00` : '';

            const response = await fetch(`/api/job/edit/${editingJob.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Bearer ${token}`
                },
                body: new URLSearchParams({
                    name: editingJob.name,
                    detail: editingJob.detail,
                    experience: editingJob.experience,
                    salary: editingJob.salary,
                    categoryId: categoryId,
                    endDate: formattedEndDate
                }),
            });

            if (!response.ok) {
                throw new Error("Error updating job");
            }

            const updatedJob = await response.json();

            // Create notification for job update
            await createJobNotification('update', editingJob.name);
            
            // Show toast notification
            showToast('Job Updated', `Job "${editingJob.name}" has been updated successfully.`, 'info');

            // Refresh the job list to get the updated data
            fetchAllJobs(companyId);

            setIsEditing(false);
            setEditingJob(null);
            setSuccessMessage('Job updated successfully!');
            router.push('/recruiter/jobs-management');
        } catch (error) {
            console.error("Error updating job:", error);
            showToast('Error', 'Failed to update job. Please try again.', 'error');
        }
    };

    const handleDelete = async (jobId) => {
        try {
            // Get job name before deletion
            const jobToDelete = jobs.find(job => job.id === jobId);
            const jobName = jobToDelete ? jobToDelete.name : 'Unknown job';
            
            const response = await fetch(`/api/job/delete/${jobId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Error deleting job");
            }

            // Create notification for job deletion
            await createJobNotification('delete', jobName);
            
            // Show toast notification
            showToast('Job Deleted', `Job "${jobName}" has been deleted.`, 'warning');

            setJobs((prev) => prev.filter((job) => job.id !== jobId));
            setDeleteSuccessMessage('Job deleted successfully!');
        } catch (error) {
            console.error("Error deleting job:", error);
            showToast('Error', 'Failed to delete job. Please try again.', 'error');
        }
    };

    const handlePublish = async (jobId) => {
        try {
            // Get job name before publishing
            const jobToPublish = jobs.find(job => job.id === jobId);
            const jobName = jobToPublish ? jobToPublish.name : 'Unknown job';
            
            const response = await fetch(`/api/job/publish/${jobId}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Error publishing job");
            }

            const message = await response.text();
            setSuccessMessage(message);
            
            // Create notification for job publishing
            await createJobNotification('publish', jobName);
            
            // Show toast notification
            showToast('Job Published', `Job "${jobName}" has been published.`, 'success');
            
            setJobs((prev) =>
                prev.map((job) =>
                    job.id === jobId ? { ...job, enable: true } : job
                )
            );
        } catch (error) {
            console.error("Error publishing job:", error);
            showToast('Error', 'Failed to publish job. Please try again.', 'error');
        }
    };

    const handleUnpublish = async (jobId) => {
        try {
            // Get job name before unpublishing
            const jobToUnpublish = jobs.find(job => job.id === jobId);
            const jobName = jobToUnpublish ? jobToUnpublish.name : 'Unknown job';
            
            const response = await fetch(`/api/job/unpublish/${jobId}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Error unpublishing job");
            }

            const message = await response.text();
            setSuccessMessage(message);
            
            // Create notification for job unpublishing
            await createJobNotification('unpublish', jobName);
            
            // Show toast notification
            showToast('Job Unpublished', `Job "${jobName}" has been unpublished.`, 'warning');
            
            setJobs((prev) =>
                prev.map((job) =>
                    job.id === jobId ? { ...job, enable: false } : job
                )
            );
        } catch (error) {
            console.error("Error unpublishing job:", error);
            showToast('Error', 'Failed to unpublish job. Please try again.', 'error');
        }
    };

    return (
        <div
            suppressHydrationWarning
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6"
        >
            <div suppressHydrationWarning className="mx-auto max-w-7xl">
                <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-gray-800">
                    Jobs Management
                </h1>

                {/* Toast notification */}
                <NotificationToast
                    show={toast.show}
                    title={toast.title}
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />

                {/* ======= notifications ======= */}
                {successMessage && (
                    <Alert color="green" icon={<CheckCircleIcon className="h-6 w-6" />}>
                        {successMessage}
                    </Alert>
                )}
                {deleteSuccessMessage && (
                    <Alert color="rose" icon={<XCircleIcon className="h-6 w-6" />}>
                        {deleteSuccessMessage}
                    </Alert>
                )}

                {/* ======= create/edit job form ======= */}
                <Card className="mb-10">
                    <h2 className="mb-6 text-2xl font-bold text-gray-700">
                        {isEditing ? 'Edit Job' : 'Create New Job'}
                    </h2>

                    <form className="grid grid-cols-1 gap-6 md:grid-cols-2 text-black">
                        <Input
                            label="Job Title"
                            name="name"
                            value={isEditing ? editingJob?.name : newJob.name}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, name: e.target.value })
                                    : handleChange(e)
                            }
                        />
                        <Input
                            label="Experience"
                            name="experience"
                            value={isEditing ? editingJob?.experience : newJob.experience}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({
                                        ...editingJob,
                                        experience: e.target.value,
                                    })
                                    : handleChange(e)
                            }
                        />
                        <Input
                            label="Salary"
                            name="salary"
                            value={isEditing ? editingJob?.salary : newJob.salary}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, salary: e.target.value })
                                    : handleChange(e)
                            }
                        />
                        <Select
                            label="Category"
                            value={
                                isEditing ? editingJob?.categoryId || '' : newJob.categoryId
                            }
                            onChange={(e) => {
                                const val = e.target.value;
                                isEditing
                                    ? setEditingJob({ ...editingJob, categoryId: val })
                                    : setNewJob((prev) => ({ ...prev, categoryId: val }));
                            }}
                            options={categories}
                        />
                        <Input
                            type="date"
                            label="End Date"
                            name="endDate"
                            value={isEditing ? editingJob?.endDate : newJob.endDate}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, endDate: e.target.value })
                                    : handleChange(e)
                            }
                        />
                        <Textarea
                            label="Job Description"
                            name="detail"
                            value={isEditing ? editingJob?.detail : newJob.detail}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, detail: e.target.value })
                                    : handleChange(e)
                            }
                            className="md:col-span-2"
                        />
                    </form>

                    <div suppressHydrationWarning className="mt-8 flex flex-wrap gap-3">
                        <Button
                            color={isEditing ? 'indigo' : 'emerald'}
                            icon={<ArrowUpTrayIcon className="h-5 w-5" />}
                            onClick={isEditing ? handleUpdate : handlePost}
                        >
                            {isEditing ? 'Update' : 'Post Job'}
                        </Button>
                        <Button
                            color="slate"
                            onClick={() => {
                                setIsEditing(false);
                                setEditingJob(null);
                                setNewJob({
                                    name: '',
                                    detail: '',
                                    experience: '',
                                    salary: '',
                                    category: '',
                                    endDate: '',
                                });
                                router.push('/recruiter/jobs-management');
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>

                {/* ======= job list ======= */}
                <Card>
                    <h2 className="mb-6 text-2xl font-bold text-gray-700">Job List</h2>

                    {jobs.length === 0 ? (
                        <p className="text-gray-500">No jobs available.</p>
                    ) : (
                        <div suppressHydrationWarning className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Experience</th>
                                        <th className="px-4 py-3">Salary</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">End Date</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {jobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-gray-50 text-black">
                                            <td className="px-4 py-3 font-medium">{job.name}</td>
                                            <td className="px-4 py-3">{job.experience}</td>
                                            <td className="px-4 py-3">{job.salary}</td>
                                            <td className="px-4 py-3">
                                                {categoryNames[job.categoryId] || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {job.endDate?.split('T')[0] || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {job.enable ? (
                                                    <Badge color="emerald">Published</Badge>
                                                ) : (
                                                    <Badge color="amber">Draft</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                                                {job.enable ? (
                                                    <IconButton
                                                        title="Unpublish"
                                                        color="amber"
                                                        onClick={() => handleUnpublish(job.id)}
                                                    >
                                                        <ArrowUpTrayIcon className="h-4 w-4 rotate-180" />
                                                    </IconButton>
                                                ) : (
                                                    <IconButton
                                                        title="Publish"
                                                        color="emerald"
                                                        onClick={() => handlePublish(job.id)}
                                                    >
                                                        <ArrowUpTrayIcon className="h-4 w-4" />
                                                    </IconButton>
                                                )}

                                                <IconButton
                                                    title="Edit"
                                                    color="indigo"
                                                    onClick={() => handleEdit(job)}
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </IconButton>

                                                <IconButton
                                                    title="Delete"
                                                    color="rose"
                                                    onClick={() => handleDelete(job.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

/* ---------- Các component UI phụ (gọn, tái sử dụng) ---------- */

function Card({ children, className = '' }) {
    return (
        <div
            suppressHydrationWarning
            className={`rounded-3xl bg-white p-8 shadow-xl ${className}`}
        >
            {children}
        </div>
    );
}

function Input({ label, ...props }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <input
                {...props}
                className="rounded-lg border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
        </label>
    );
}

function Textarea({ label, className = '', ...props }) {
    return (
        <label className={`flex flex-col gap-1 ${className}`}>
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <textarea
                rows={4}
                {...props}
                className="rounded-lg border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
        </label>
    );
}

function Select({ label, options, ...props }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <select
                {...props}
                className="rounded-lg border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
                <option value="">— select —</option>
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.name}
                    </option>
                ))}
            </select>
        </label>
    );
}

function Button({ children, color = 'indigo', icon, ...props }) {
    const bg = {
        indigo: 'bg-indigo-600 hover:bg-indigo-700',
        emerald: 'bg-emerald-600 hover:bg-emerald-700',
        slate: 'bg-slate-500 hover:bg-slate-600',
    }[color];
    return (
        <button
            {...props}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-white shadow ${bg} transition`}
        >
            {icon}
            {children}
        </button>
    );
}

function IconButton({ children, color = 'indigo', ...props }) {
    const cls = {
        indigo:
            'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-indigo-200',
        emerald:
            'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 focus:ring-emerald-200',
        amber:
            'text-amber-600 hover:bg-amber-50 hover:text-amber-700 focus:ring-amber-200',
        rose:
            'text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus:ring-rose-200',
    }[color];
    return (
        <button
            {...props}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition focus:outline-none focus:ring-2 ${cls}`}
        >
            {children}
        </button>
    );
}

function Badge({ children, color = 'indigo' }) {
    const bg = {
        indigo: 'bg-indigo-100 text-indigo-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
    }[color];
    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${bg}`}
        >
            {children}
        </span>
    );
}

function Alert({ children, color = 'green', icon }) {
    const bg = {
        green: 'bg-emerald-50 text-emerald-800',
        rose: 'bg-rose-50 text-rose-800',
    }[color];
    return (
        <div
            suppressHydrationWarning
            className={`mb-6 flex items-start gap-3 rounded-2xl px-4 py-3 ${bg}`}
        >
            {icon}
            <span className="text-sm font-medium">{children}</span>
        </div>
    );
}