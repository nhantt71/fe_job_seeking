'use client';

const FeaturedJobs = ({ icon, name, jobCount }) => {
    return (
        <div className="border p-4 rounded-lg flex flex-col items-center">
            <img src={icon} height={100} width={100}/>
            <h3 className="text-xl font-semibold mt-2 text-black">{name}</h3>
            <p className="text-sm text-black">{jobCount} việc làm</p>
        </div>
    );
};

export default FeaturedJobs;