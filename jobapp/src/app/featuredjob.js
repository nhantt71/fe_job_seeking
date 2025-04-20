'use client';

import { useRouter } from 'next/navigation';

const FeaturedJobs = ({ categoryId, icon, name, jobCount }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/job?cateId=${categoryId}`);
    };

    return (
        <div 
            className="border p-4 rounded-lg flex flex-col items-center transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer"
            onClick={handleClick}
        >
            <img src={icon} alt={name} height={100} width={100} />
            <h3 className="text-xl font-semibold mt-2 text-black">{name}</h3>
            <p className="text-sm text-black">{jobCount} việc làm</p>
        </div>
    );
};

export default FeaturedJobs;
