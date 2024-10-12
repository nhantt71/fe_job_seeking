'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../context/usercontext';

export default function CVManager() {
    const [cvList, setCvList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [cvName, setCvName] = useState("");
    const [mainCvId, setMainCvId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const cvPerPage = 5;

    const [candidate, setCandidate] = useState(null);
    const { email } = useUserContext();

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

    useEffect(() => {
        if (candidate) {
            fetch(`http://localhost:8080/api/cv/get-cvs-by-candidate-id/${candidate.id}`)
                .then(res => res.json())
                .then(data => {
                    setCvList(data);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [candidate]);

    const handleFileUpload = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleAddCv = () => {
        if (!selectedFile || !cvName || !candidate) {
            alert("Vui lòng nhập tên CV và chọn tệp CV để tải lên.");
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        fetch(`http://localhost:8080/api/cv/upload-cv?candidateId=${candidate.id}&name=${cvName}`, {
            method: 'POST',
            body: formData,
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Failed to upload CV');
                }
            })
            .then((data) => {
                setCvList((prev) => [...prev, data]);
                setCvName("");
                setSelectedFile(null);
            })
            .catch((error) => {
                console.error('Error uploading CV:', error);
            });
    };

    const handleDeleteCv = (id) => {
        fetch(`http://localhost:8080/api/cv/delete-cv/${id}`, {
            method: 'POST',
        })
        .then((res) => {
            if (res.ok) {
                setCvList(cvList.filter(cv => cv.id !== id));
                alert('Xóa CV thành công!');
            } else {
                throw new Error('Failed to delete CV');
            }
        })
        .catch((error) => {
            console.error('Error deleting CV:', error);
            alert('Xóa CV thất bại!');
        });
    };

    const handleViewCv = (fileUrl) => {
        window.open(fileUrl, '_blank');
    };

    const handleSetMainCv = (id) => {
        fetch(`http://localhost:8080/api/cv/make-main-cv?id=${id}&candidateId=${candidate.id}`, {
            method: 'POST',
        })
        .then(res => {
            if (res.ok) {
                setMainCvId(id);
                setCvList(cvList.map(cv => {
                    if (cv.id === id) {
                        return { ...cv, mainCV: true };
                    }
                    return { ...cv, mainCV: false };
                }));
            } else {
                console.error('Failed to make main CV');
            }
        })
        .catch(err => console.error('Error setting main CV:', err));
    };

    const handleUnsetMainCv = (id) => {
        fetch(`http://localhost:8080/api/cv/unmake-main-cv?id=${id}`, {
            method: 'POST',
        })
        .then(res => {
            if (res.ok) {
                setCvList(cvList.map(cv => {
                    if (cv.id === id) {
                        return { ...cv, mainCV: false };
                    }
                    return cv;
                }));
                setMainCvId(null);
            } else {
                console.error('Failed to unset main CV');
            }
        })
        .catch(err => console.error('Error unsetting main CV:', err));
    };

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
                        <p className="text-sm text-gray-500">CV File: {cv.fileCV}</p>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => handleViewCv(cv.fileCV)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                                Xem CV
                            </button>
                            <button
                                onClick={() => handleDeleteCv(cv.id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
                                Xóa CV
                            </button>
                            {mainCvId === cv.id ? (
                                <button
                                    onClick={() => handleUnsetMainCv(cv.id)}
                                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition">
                                    Bỏ làm CV chính
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleSetMainCv(cv.id)}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                                    Đặt làm CV chính
                                </button>
                            )}
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
