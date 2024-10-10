// pages/job/SavedJobs.js
import Link from 'next/link';
import { useState } from 'react';

const SavedJobs = () => {
    // Giả định một danh sách các job đã lưu (có thể lấy từ API hoặc state quản lý)
    const [savedJobs, setSavedJobs] = useState([
        { id: 1, title: 'Frontend Developer', company: 'Company A' },
        { id: 2, title: 'Backend Developer', company: 'Company B' },
        { id: 3, title: 'Full Stack Developer', company: 'Company C' },
    ]);

    const handleUnsave = (id) => {
        // Xóa job khỏi danh sách saved jobs
        setSavedJobs(savedJobs.filter(job => job.id !== id));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-0 py-6 text-black">
            <h1 className="text-2xl font-semibold mb-4">Saved Jobs</h1>
            <ul>
                {savedJobs.map(job => (
                    <li key={job.id} className="border-b py-4 flex justify-between items-center">
                        <Link href={`/job/detail?id=${job.id}`} className="text-blue-600 hover:underline">
                            {job.title} at {job.company}
                        </Link>
                        <button
                            onClick={() => handleUnsave(job.id)}
                            className="text-red-600 hover:underline"
                        >
                            Unsave
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SavedJobs;
