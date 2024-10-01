import Link from 'next/link';
import { useState } from 'react';



const FindingJobList = ({ jobs }) => {
    const [selectedJob, setSelectedJob] = useState(null);

    return (
        <div className='flex justify-center'>
            <div className='w-2/4'>
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className="flex border p-6 rounded-lg shadow hover:shadow-lg transition duration-200 mt-5"
                    >
                        <div className="mr-4">
                            <img
                                src={job.companyLogo}
                                alt={`${job.company} logo`}
                                className="w-16 h-16 rounded-full"
                            />
                        </div>
                        <div className='flex flex-grow'>
                            <div className="flex-grow">
                                <div className='flex'>
                                    <h2 className="text-base font-semibold text-gray-800 pr-10">{job.name}</h2>
                                    <h2 className="text-base font-semibold text-green-500">{job.salary}</h2>
                                </div>

                                <p className="text-sm text-gray-500 mb-2">{job.companyName}</p>

                                <div className='flex'>
                                    <p className="text-sm text-gray-500 pr-5">{job.address}</p>
                                    <p className="text-sm text-gray-500">{`Cập nhật ${job.createdDate}`}</p>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-1 ml-auto">
                                <button
                                    onClick={() => setSelectedJob(job)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Xem nhanh
                                </button>
                                <button
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Ứng tuyển
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div>
                {selectedJob && (
                    <div className="ml-4 p-4 border rounded-lg shadow-lg mt-5 mb-5" style={{ width: '600px', maxHeight: '1000px', overflowY: 'auto' }}>
                        <div className='flex'>
                            <div>
                                <h2 className="text-lg font-semibold text-black">{selectedJob.name}</h2>
                                <div className='flex'>
                                    <p className="text-sm text-gray-500 mr-2">{`${selectedJob.salary}`}</p>
                                    <p className="text-sm text-gray-500 mr-2">{`${selectedJob.address}`}</p>
                                    <p className="text-sm text-gray-500">{`${selectedJob.experience}`}</p>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-1 ml-auto">
                                <button
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                                >
                                    Ứng tuyển ngay
                                </button>
                            </div>
                        </div>
                        <hr style={{
                            border: 'none',
                            height: '1px',
                            backgroundColor: '#ccc'
                        }} />
                        <div style={{ maxHeight: '300px', overflowY: 'auto', overflowX: 'hidden' }}>
                            <p className="text-gray-600" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>{selectedJob.detail}</p>
                        </div>
                        <p className="text-sm text-gray-500">{`Địa chỉ: ${selectedJob.address}`}</p>
                        <p className="text-sm text-gray-500">{`Lương: ${selectedJob.salary}`}</p>
                        <div className='flex'>
                            <p className="text-sm text-gray-500 mr-3">{`Công ty: ${selectedJob.companyName}`}</p>
                            <Link href="/company/${selectedJob.companyId}" className="text-blue-500 hover:underline">
                                Chi tiết công ty
                            </Link>
                        </div>
                        <div className='flex'>
                            <button
                                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-1"
                            >
                                Xem chi tiết
                            </button>
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}</div>
        </div>
    );
};

export default FindingJobList;
