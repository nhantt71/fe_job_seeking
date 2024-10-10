'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function JobDetail() {
    const [isSaved, setIsSaved] = useState(false);
    const router = useRouter();

    const handleSaveClick = () => {
        setIsSaved(!isSaved);
    };

    const handleApplyClick = () => {
        router.push('detail/apply');
    };

    return (
        <div className="max-w-7xl mx-auto p-6 text-black">
            <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-2/3">
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h1 className="text-2xl font-bold mb-4">Nhân Viên Kinh Doanh/ Tư Vấn Thiết Bị</h1>
                        <div className="flex items-center justify-between mb-6">
                            <div className="space-y-1">
                                <div className="text-green-600 font-semibold">15 - 25 triệu</div>
                                <div>Đồng Nai</div>
                                <div>Kinh nghiệm: 1 năm</div>
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
                        <p className="text-gray-500">Hạn nộp hồ sơ: 22/10/2024</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Chi tiết tin tuyển dụng</h2>
                        <h3 className="font-semibold mb-2">Mô tả công việc</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Chăm sóc khách hàng từ Data do công ty cung cấp</li>
                            <li>Tìm kiếm KH mới, phát triển mở rộng nguồn khách hàng</li>
                            <li>
                                Tư vấn báo giá cho khách hàng về thiết bị máy móc sản phẩm công ty nhập khẩu
                            </li>
                            <li>Đàm phán ký hợp đồng với khách hàng</li>
                        </ul>

                        <h3 className="font-semibold mt-6 mb-2">Yêu cầu ứng viên</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Ứng viên tốt nghiệp từ Trung cấp trở lên. Năm sinh từ 1989 - 2000</li>
                            <li>Ứng viên có 1-2 năm kinh nghiệm</li>
                        </ul>

                        <h3 className="font-semibold mt-6 mb-2">Quyền lợi</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Thu nhập TB: 15.000.000 - 25.000.000 VND</li>
                            <li>Hưởng các chế độ theo quy định nhà nước</li>
                        </ul>
                    </div>
                </div>

                <div className="w-full lg:w-1/3 lg:ml-8 mt-8 lg:mt-0">
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="font-bold text-lg mb-4">Thông tin công ty</h3>
                        <p className="mb-2">Công ty TNHH Công Nghệ FEDI</p>
                        <p>10-24 nhân viên</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="font-bold text-lg mb-4">Ngành nghề</h3>
                        <p>Kinh doanh / Bán hàng</p>
                        <p>Bán hàng kỹ thuật</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold text-lg mb-4">Khu vực</h3>
                        <p>Biên Hòa, Đồng Nai</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
