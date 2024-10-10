'use client';

import { useState } from 'react';

export default function CVManager() {
    const [cvList, setCvList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [cvName, setCvName] = useState("");
    const [mainCvId, setMainCvId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const cvPerPage = 5; // CVs per page

    const handleFileUpload = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleAddCv = () => {
        if (selectedFile && cvName) {
            const newCv = {
                id: Date.now(),
                name: cvName,
                file: URL.createObjectURL(selectedFile),
                isMain: false,
            };
            setCvList([...cvList, newCv]);
            setSelectedFile(null);
            setCvName("");
        }
    };

    const handleDeleteCv = (id) => {
        setCvList(cvList.filter(cv => cv.id !== id));
    };

    const handleViewCv = (fileUrl) => {
        window.open(fileUrl, '_blank');
    };

    const handleSetMainCv = (id) => {
        setMainCvId(id);
    };

    // Pagination logic
    const totalPages = Math.ceil(cvList.length / cvPerPage);
    const currentCvs = cvList.slice((currentPage - 1) * cvPerPage, currentPage * cvPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="container mx-auto mt-8 text-black">
            {/* Phần upload CV */}
            <div className="border border-gray-300 p-4 rounded-lg mb-6">
                <h2 className="text-2xl font-bold mb-4 text-black">Upload CV mới</h2>
                <input 
                    type="text" 
                    placeholder="Tên CV" 
                    value={cvName} 
                    onChange={(e) => setCvName(e.target.value)}
                    className="border p-2 mb-4 w-full"
                />
                <input 
                    type="file" 
                    accept="application/pdf,image/*" 
                    onChange={handleFileUpload}
                    className="mb-4"
                />
                <button 
                    onClick={handleAddCv} 
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                    Thêm CV
                </button>
            </div>

            {/* Danh sách CV */}
            <div className="space-y-4">
                {currentCvs.map((cv) => (
                    <div key={cv.id} className={`border border-gray-300 p-4 rounded-lg ${mainCvId === cv.id ? 'bg-green-100' : ''}`}>
                        <h3 className="text-xl font-bold text-black">{cv.name}</h3>
                        <p className="text-sm text-gray-500">CV File: {cv.file}</p>
                        <div className="flex justify-between mt-4">
                            <button 
                                onClick={() => handleViewCv(cv.file)} 
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                                Xem CV
                            </button>
                            <button 
                                onClick={() => handleDeleteCv(cv.id)} 
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
                                Xóa CV
                            </button>
                            <button 
                                onClick={() => handleSetMainCv(cv.id)} 
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                                Đặt làm CV chính
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination controls */}
            <div className="flex justify-center mt-4 space-x-4 mb-5">
                <button 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1} 
                    className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600 transition'}`}
                >
                    Trang trước
                </button>
                <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages} 
                    className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600 transition'}`}
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
}
