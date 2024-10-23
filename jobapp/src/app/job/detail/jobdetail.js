'use client';

import { useUserContext } from '@/app/context/usercontext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function JobDetail() {
    const [job, setJob] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const router = useRouter();

    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const { email, account } = useUserContext();
    const [candidate, setCandidate] = useState(null);

    // Lấy thông tin ứng viên
    useEffect(() => {
        if (email) {
            fetch(`http://localhost:8080/api/candidate/get-candidate-by-email?email=${email}`)
                .then(res => res.json())
                .then(data => {
                    setCandidate(data);
                })
                .catch(error => {
                    console.error('Error fetching candidate:', error);
                });
        }
    }, [email]);

    // Lấy chi tiết công việc
    useEffect(() => {
        if (id) {
            fetch(`http://localhost:8080/api/job/detail/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    setJob(data);
                })
                .catch((error) => {
                    console.error('Error fetching job detail:', error);
                });
        }
    }, [id]);


    useEffect(() => {
        if (candidate) {
            fetch(`http://localhost:8080/api/job-candidate/check-saved-job?candidateId=${candidate.id}&jobId=${id}`)
                .then(res => {
                    if (!res.ok) {
                        setIsSaved(false);
                        return null;
                    }
                    return res.json();
                })
                .then(data => {
                    if (data !== null) {
                        setIsSaved(data);
                    }
                })
                .catch(error => {
                    console.error('Error checking saved job:', error);
                });
        }
    }, [candidate, id]);
    

    // Xử lý khi nhấn nút lưu tin
    const handleSaveClick = () => {
        if (!email) {
            alert("Bạn phải đăng nhập để lưu công việc!"); // Hiển thị thông báo yêu cầu đăng nhập
            return;
        }

        if (isSaved) {
            fetch(`http://localhost:8080/api/job-candidate/unsave-job?jobId=${id}&candidateId=${candidate.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(res => {
                    if (res.ok) {
                        setIsSaved(false);
                    }
                })
                .catch(error => {
                    console.error('Error unsaving job:', error);
                });
        } else {
            fetch(`http://localhost:8080/api/job-candidate/save-job?jobId=${id}&candidateId=${candidate.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(res => {
                    if (res.ok) {
                        setIsSaved(true);
                    }
                })
                .catch(error => {
                    console.error('Error saving job:', error);
                });
        }
    };

    // Xử lý khi nhấn nút ứng tuyển
    const handleApplyClick = () => {
        if (!email) {
            alert("Bạn phải đăng nhập để ứng tuyển!"); // Hiển thị thông báo yêu cầu đăng nhập
            return;
        }
        router.push(`apply?id=${id}`);
    };

    if (!job) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 text-black">
            <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-2/3">
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h1 className="text-2xl font-bold mb-4">{job.name}</h1>
                        <div className="flex items-center justify-between mb-6">
                            <div className="space-y-1">
                                <div className="text-green-600 font-semibold">Lương {job.salary}</div>
                                <div>{job.address}</div>
                                <div>Kinh nghiệm: {job.experience}</div>
                            </div>
                            <div className="space-x-2">
                                <button
                                    className="bg-green-600 text-white py-2 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-green-500 hover:shadow-lg"
                                    onClick={handleApplyClick}
                                >
                                    Ứng tuyển ngay
                                </button>

                                <button
                                    className={`border py-2 px-4 rounded-lg transition-all duration-300 ease-in-out ${isSaved
                                        ? 'border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white'
                                        : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                                        }`}
                                    onClick={handleSaveClick}
                                >
                                    {isSaved ? 'Đã lưu' : 'Lưu tin'}
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-500">Hạn nộp hồ sơ: {job.endDate}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Chi tiết tin tuyển dụng</h2>
                        <h3 className="font-semibold mb-2">Chi tiết công việc</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            {job.detail}
                        </ul>
                    </div>
                </div>

                <div className="w-full lg:w-1/3 lg:ml-8 mt-8 lg:mt-0">
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="font-bold text-lg mb-4">Thông tin công ty</h3>
                        <p className="mb-2">{job.companyName}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="font-bold text-lg mb-4">Ngành nghề</h3>
                        <p>{job.categoryName}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold text-lg mb-4">Khu vực</h3>
                        <p>{job.address}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
