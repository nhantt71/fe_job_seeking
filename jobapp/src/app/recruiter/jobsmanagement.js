import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function JobsManagement() {
    const [jobs, setJobs] = useState([
        {
            id: 1,
            name: "Frontend Developer",
            detail: "Develop and maintain the front-end of our website.",
            experience: "2+ years",
            salary: "$100k/year",
            category: "Development",
            endDate: "2024-12-31",
            enable: false,
        },
        {
            id: 2,
            name: "Backend Developer",
            detail: "Build APIs and handle server-side logic.",
            experience: "3+ years",
            salary: "$120k/year",
            category: "Development",
            endDate: "2024-10-15",
            enable: true,
        },
    ]);

    const [categories, setCategories] = useState([]);
    const [newJob, setNewJob] = useState({
        name: '',
        detail: '',
        experience: '',
        salary: '',
        category: '',
        endDate: '',
        enable: false,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const router = useRouter();

    // Hàm gọi API để lấy danh sách category
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories'); // Thay thế với API thực tế của bạn
            const data = await response.json();
            setCategories(data); // Giả định API trả về mảng các category
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Hàm xử lý form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewJob((prev) => ({ ...prev, [name]: value }));
    };

    const handlePost = () => {
        setJobs((prev) => [...prev, { ...newJob, id: jobs.length + 1 }]);
        setNewJob({ name: '', detail: '', experience: '', salary: '', category: '', endDate: '', enable: false });
    };

    const handleEdit = (job) => {
        setIsEditing(true);
        setEditingJob(job);
    };

    const handleUpdate = () => {
        setJobs((prev) =>
            prev.map((job) =>
                job.id === editingJob.id ? editingJob : job
            )
        );
        setIsEditing(false);
        setEditingJob(null);
    };

    const handleDelete = (id) => {
        setJobs((prev) => prev.filter((job) => job.id !== id));
    };

    const handlePublish = (id) => {
        setJobs((prev) =>
            prev.map((job) =>
                job.id === id ? { ...job, enable: !job.enable } : job
            )
        );
    };

    const handleView = (id) => {
        router.push(`/job/${id}`);
    };

    return (
        <div className="container mx-auto p-6 text-black">
            <h1 className="text-2xl font-bold mb-6">Jobs Management</h1>

            {/* Form tạo mới hoặc chỉnh sửa job */}
            <div className="bg-white shadow-md rounded p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Job" : "Create Job"}</h2>

                <form>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input
                            type="text"
                            name="name"
                            value={isEditing ? editingJob.name : newJob.name}
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
                            value={isEditing ? editingJob.experience : newJob.experience}
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
                            value={isEditing ? editingJob.salary : newJob.salary}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, salary: e.target.value })
                                    : handleChange(e)
                            }
                            placeholder="Salary"
                            className="border p-2 rounded"
                        />
                        
                        {/* Spinner cho Category */}
                        <select
                            name="category"
                            value={isEditing ? editingJob.category : newJob.category}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, category: e.target.value })
                                    : handleChange(e)
                            }
                            className="border p-2 rounded"
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        
                        <input
                            type="date"
                            name="endDate"
                            value={isEditing ? editingJob.endDate : newJob.endDate}
                            onChange={(e) =>
                                isEditing
                                    ? setEditingJob({ ...editingJob, endDate: e.target.value })
                                    : handleChange(e)
                            }
                            className="border p-2 rounded"
                        />
                        <textarea
                            name="detail"
                            value={isEditing ? editingJob.detail : newJob.detail}
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
                </form>
            </div>

            {/* Danh sách các công việc */}
            <div className="bg-white shadow-md rounded p-6">
                <h2 className="text-xl font-bold mb-4">Job List</h2>
                <ul>
                    {jobs.map((job) => (
                        <li key={job.id} className="mb-4 p-4 border rounded bg-gray-50">
                            <h3 className="text-lg font-bold">{job.name}</h3>
                            <p>Experience: {job.experience}</p>
                            <p>Salary: {job.salary}</p>
                            <p>Category: {job.category}</p>
                            <p>End Date: {job.endDate}</p>

                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => handlePublish(job.id)}
                                    className={`px-4 py-2 rounded ${
                                        job.enable ? "bg-green-500" : "bg-gray-500"
                                    } text-white`}
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
