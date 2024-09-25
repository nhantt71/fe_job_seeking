'use client';

function FeaturedJob({ icon, name, jobs }) {
    return (
        <div className="bg-white shadow-md rounded-lg px-5 py-4">
            <div className="flex items-center">
                <div className="ml-4 center">
                    <img src={icon}/>
                    <h5 className="text-gray-900 text-xl font-medium">{name}</h5>
                    <p className="text-gray-700">{jobs} việc làm</p>
                </div>
            </div>
        </div>
    );
}

export default FeaturedJob;