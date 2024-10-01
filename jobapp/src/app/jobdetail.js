import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

function JobDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [job, setJob] = useState(null);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
            <div className="mb-4">
                <img src={job.companyLogo} alt={job.companyName} className="w-24 h-24 mx-auto" />
                <h2 className="text-2xl font-medium mt-2">{job.companyName}</h2>
                <p>{job.companyDescription}</p>
            </div>
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Mô tả công việc</h3>
                <p>{job.description}</p>
            </div>
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Yêu cầu</h3>
                <ul>
                    {job.requirements.map(req => (
                        <li key={req}>{req}</li>
                    ))}
                </ul>
            </div>
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Quyền lợi</h3>
                <ul>
                    {job.benefits.map(benefit => (
                        <li key={benefit}>{benefit}</li>
                    ))}
                </ul>
            </div>
            <Link href="/jobs">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Quay lại
                </button>
            </Link>
        </div>
    );
}

export default JobDetail;