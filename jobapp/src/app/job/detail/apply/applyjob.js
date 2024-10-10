// pages/apply.js (hoặc app/apply/page.js)
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ApplyJob() {
    const router = useRouter();

    // Thông tin công việc (có thể nhận từ props hoặc API)
    const jobTitle = "Nhân Viên Kinh Doanh/ Tư Vấn Thiết Bị"; // Ví dụ tên công việc
    const companyName = "Công ty TNHH Công Nghệ FEDI"; // Ví dụ tên công ty
    const jobLocation = "Biên Hòa, Đồng Nai"; // Ví dụ địa điểm làm việc

    const [selectedCV, setSelectedCV] = useState('');
    const [uploadCV, setUploadCV] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý logic gửi CV và thư tự giới thiệu ở đây
        console.log('Gửi thông tin ứng tuyển', { selectedCV, uploadCV, coverLetter });
        // Có thể chuyển hướng về trang khác sau khi gửi
        router.push('/');
    };

    const handleCVChange = (e) => {
        setSelectedCV(e.target.value);
        setUploadCV(null); // Reset upload CV nếu chọn CV
    };

    const handleUploadChange = (e) => {
        setUploadCV(e.target.files[0]);
        setSelectedCV(''); // Reset selected CV nếu upload CV mới
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-center">Ứng tuyển cho công việc</h2>

                {/* Thông tin công việc */}
                <div className="mb-6 border-b pb-4">
                    <h3 className="font-semibold">Tên công việc: {jobTitle}</h3>
                    <p>Tên công ty: {companyName}</p>
                    <p>Địa điểm: {jobLocation}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Chọn CV có sẵn:</label>
                        <select value={selectedCV} onChange={handleCVChange} className="border rounded w-full py-2 px-3">
                            <option value="">Chọn CV</option>
                            <option value="cv1">CV 1</option>
                            <option value="cv2">CV 2</option>
                            <option value="cv3">CV 3</option>
                            {/* Thêm các CV khác nếu có */}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Tải CV lên:</label>
                        <input
                            type="file"
                            onChange={handleUploadChange}
                            className="border rounded w-full py-2 px-3"
                        />
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
                            onClick={() => router.push('/job/detail')}
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
