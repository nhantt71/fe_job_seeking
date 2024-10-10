// pages/job/AppliedJobs.js
import Link from 'next/link';
import { useState } from 'react';

const AppliedJobs = () => {
    // Giả định một danh sách các job đã ứng tuyển (có thể lấy từ API hoặc state quản lý)
    const [appliedJobs, setAppliedJobs] = useState([
        { id: 1, title: 'Software Engineer', company: 'Company D' },
        { id: 2, title: 'Data Scientist', company: 'Company E' },
    ]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-0 py-6 text-black">
            <h1 className="text-2xl font-semibold mb-4">Applied Jobs</h1>
            <ul>
                {appliedJobs.map(job => (
                    <li key={job.id} className="border-b py-4 flex justify-between items-center">
                        <Link href={`/job/detail?id=${job.id}`} className="text-blue-600 hover:underline">
                            {job.title} at {job.company}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AppliedJobs;
