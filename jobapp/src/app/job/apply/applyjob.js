'use client';

import { useUserContext } from '@/app/context/usercontext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ApplyJob() {
    const router = useRouter();
    const { email } = useUserContext();

    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [candidate, setCandidate] = useState(null);
    const [cvList, setCvList] = useState([]);
    const [selectedCV, setSelectedCV] = useState('');
    const [uploadCV, setUploadCV] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [job, setJob] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (email) {
            fetch(`/api/candidate/get-candidate-by-email?email=${email}`)
                .then(res => res.json())
                .then(data => {
                    setCandidate(data);
                })
                .catch(error => {
                    console.error('Error fetching candidate:', error);
                });
        }
    }, [email]);

    useEffect(() => {
        if (candidate) {
            fetch(`/api/cv/get-cvs-by-candidate-id/${candidate.id}`)
                .then(res => res.json())
                .then(data => {
                    setCvList(data);
                }).catch(err => {
                    console.error(err);
                });
        }
    }, [candidate]);

    useEffect(() => {
        if (id) {
            fetch(`/api/job/detail/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    setJob(data);
                    if (data) {
                        setCompanyName(data.companyName || '')
                        setName(data.name || '')
                        setAddress(data.address || '')
                    }
                })
                .catch((error) => {
                    console.error('Error fetching job detail:', error);
                });
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const wordCount = coverLetter.trim().split(/\s+/).length;
        if (wordCount > 1000) {
            alert("Thư tự giới thiệu không được vượt quá 1000 từ.");
            return;
        }

        if (uploadCV) {
            const formData = new FormData();
            formData.append('jobId', job.id);
            formData.append('candidateId', candidate.id);
            formData.append('applicantName', candidate.fullname);
            formData.append('applicantEmail', email);
            formData.append('selfMail', coverLetter);
            formData.append('cvFile', uploadCV);

            try {
                const response = await fetch(`/api/job/apply-with-file`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    alert('Ứng tuyển thành công!');
                    router.push('/');
                } else {
                    const errorMessage = await response.text();
                    alert(`Failed to apply: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error applying with file:', error);
                alert('Đã xảy ra lỗi trong quá trình ứng tuyển. Vui lòng thử lại.');
            }
        } else if (selectedCV) {
            try {
                const fetchFileCV = await fetch(`/api/cv/get-fileCV-by-CV-id/${selectedCV}`);
                
                if (!fetchFileCV.ok) {
                    alert('Không thể lấy fileCV cho CV đã chọn.');
                    return;
                }
        
                const fileCV = await fetchFileCV.text();
        
                const response = await fetch(`/api/job/apply?jobId=${job.id}&candidateId=${candidate.id}&applicantName=${candidate.fullname}&applicantEmail=${email}&selfMail=${coverLetter}&cvFile=${fileCV}`, {
                    method: 'POST',
                });
        
                if (response.ok) {
                    alert('Ứng tuyển thành công!');
                    router.push('/');
                } else {
                    const errorMessage = await response.text();
                    alert(`Failed to apply: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error applying with CV:', error);
                alert('Đã xảy ra lỗi trong quá trình ứng tuyển. Vui lòng thử lại.');
            }
        } else {
            alert("Vui lòng chọn CV để ứng tuyển!");
        }
    };

    const handleCVChange = (e) => {
        setSelectedCV(e.target.value);
        setUploadCV(null);
    };

    const handleUploadChange = (e) => {
        setUploadCV(e.target.files[0]);
        setSelectedCV('');
    };

    const handleRemoveUpload = () => {
        setUploadCV(null);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-center">Ứng tuyển cho công việc</h2>

                <div className="mb-6 border-b pb-4">
                    <h3 className="font-semibold">Tên công việc: {name}</h3>
                    <p>Tên công ty: {companyName}</p>
                    <p>Địa điểm: {address}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Chọn CV có sẵn:</label>
                        <select
                            value={selectedCV}
                            onChange={handleCVChange}
                            className="border rounded w-full py-2 px-3"
                            disabled={!!uploadCV}
                        >
                            <option value="">Chọn CV</option>
                            {cvList.map((cv) => (
                                <option key={cv.id} value={cv.id}>{cv.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Tải CV lên:</label>
                        <div className="flex items-center">
                            <input
                                type="file"
                                onChange={handleUploadChange}
                                className="border rounded w-full py-2 px-3"
                                disabled={!!selectedCV}
                            />
                            {uploadCV && (
                                <button
                                    type="button"
                                    className="ml-2 text-red-600"
                                    onClick={handleRemoveUpload}
                                >
                                    X
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Thư tự giới thiệu:</label>
                        <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            className="border rounded w-full py-2 px-3 h-32"
                        ></textarea>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="bg-green-600 text-white py-2 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-green-500 hover:shadow-lg"
                            disabled={!selectedCV && !uploadCV}
                        >
                            Ứng tuyển
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-gray-500 text-white py-2 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-gray-400 hover:shadow-lg"
                        >
                            Hủy
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
