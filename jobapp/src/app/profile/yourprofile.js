'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserContext } from '../context/usercontext';

export default function YourProfile() {
    const { email, account, setUserData } = useUserContext();
    const [searchStatus, setSearchStatus] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [fullname, setFullname] = useState('');
    const [phoneNumber, setPhonenumber] = useState('');
    const [candidate, setCandidate] = useState(null);
    const [cvList, setCvList] = useState([]);
    const [selectedCvId, setSelectedCvId] = useState(null);

    useEffect(() => {
        if (email) {
            fetch(`http://localhost:8080/api/candidate/get-candidate-by-email?email=${email}`)
                .then(res => res.json())
                .then(data => {
                    setCandidate(data);
                    if (data) {
                        setFullname(data.fullname || '');
                        setPhonenumber(data.phoneNumber || '');
                        setSearchStatus(data.available);
                    }
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
                }).catch(err => {
                    console.error(err);
                });
        }
    }, [candidate]);

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatar(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const saveAvatar = () => {
        if (!avatar) {
            alert("Please select an avatar file.");
            return;
        }

        const formData = new FormData();
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput && fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        fetch(`http://localhost:8080/api/auth/change-avatar?accountId=${account.id}`, {
            method: 'POST',
            body: formData,
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setUserData(data.email, data);
                alert('Avatar changed successfully!');
            })
            .catch(error => {
                console.error('Error changing avatar:', error);
                alert('Failed to change avatar. Please check your file and try again.');
            });
    };

    const editInformation = () => {
        fetch(`http://localhost:8080/api/candidate/edit/${candidate.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullname: fullname,
                phoneNumber: phonenumber,
            }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setCandidate(prev => ({
                    ...prev,
                    fullname: data.fullname,
                    phoneNumber: data.phoneNumber,
                }));
                alert('Information updated successfully!');
            })
            .catch(error => {
                console.error('Error updating information:', error);
                alert('Failed to update information. Please try again.');
            });
    };

    const toggleSearchStatus = () => {
        if (!selectedCvId) {
            alert("Bạn cần chọn CV chính trước khi bật trạng thái tìm kiếm việc làm.");
            return;
        }
    
        const enableUrl = `http://localhost:8080/api/candidate/enable-finding-jobs/${candidate.id}`;
        const disableUrl = `http://localhost:8080/api/candidate/disable-finding-jobs/${candidate.id}`;
        const toggleUrl = searchStatus ? disableUrl : enableUrl;
    
        fetch(toggleUrl, { method: 'POST' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to toggle job search status');
                return res.json();
            })
            .then(() => {
                setSearchStatus(!searchStatus);
    
                if (!searchStatus) {
                    fetch(`http://localhost:8080/api/cv/make-main-cv?id=${selectedCvId}&candidateId=${candidate.id}`, {
                        method: 'POST',
                    })
                        .then(res => {
                            if (!res.ok) throw new Error('Failed to mark CV as main');
                            return res.json();
                        })
                        .then(() => {
                            return fetch(`http://localhost:8080/api/cv/get-fileCV-by-CV-id/${selectedCvId}`);
                        })
                        .then(res => {
                            if (!res.ok) throw new Error('Failed to retrieve CV URL');
                            return res.text();
                        })
                        .then(cvUrl => {
                            return fetch(`http://localhost:8080/api/extract-text-from-url/${candidate.id}?imageUrl=${encodeURIComponent(cvUrl)}`, {
                                method: 'POST'
                            });
                        })
                        .then(res => {
                            if (!res.ok) throw new Error('Failed to extract text from CV URL');
                            return res.text();
                        })
                        .then(data => {
                            alert(`Job search enabled, CV processed: ${data}`);
                        })
                        .catch(error => {
                            console.error('Error processing CV for job search:', error);
                            alert('Error processing CV for job search.');
                        });
                } else {
                    fetch(`http://localhost:8080/api/cv/unmake-all-main-cv?candidateId=${candidate.id}`, {
                        method: 'POST',
                    })
                        .then(res => {
                            if (!res.ok) throw new Error('Failed to unmark all CVs as main');
                            return res.json();
                        })
                        .then(() => {
                            return fetch(`http://localhost:8080/api/extract-cv/delete-by-candidate-id/${candidate.id}`, {
                                method: 'DELETE'
                            });
                        })
                        .then(res => {
                            if (!res.ok) throw new Error('Failed to delete extracted CV data');
                            return res.text();
                        })
                        .then(data => {
                            alert('Job search disabled, CV data deleted.');
                        })
                        .catch(error => {
                            console.error('Error deleting CV data:', error);
                            alert('Failed to delete CV data.');
                        });
                }
            })
            .catch(error => {
                console.error('Error toggling job search status:', error);
                alert('Failed to toggle job search status. Please try again.');
            });
    };
    

    const handleCvSelect = event => {
        const cvId = parseInt(event.target.value, 10);
        if (searchStatus) {
            alert("Bạn cần tắt trạng thái tìm việc trước khi thay đổi CV chính.");
            return;
        }
        setSelectedCvId(cvId);
    };

    return (
        <div className="container mx-auto p-4 text-black">
            <div className="flex space-x-4">
                {/* Left Side Cards */}
                <div className="w-2/3 space-y-4">
                    {/* Account Card */}
                    <div className="bg-white shadow-md rounded-lg p-5">
                        <h2 className="text-xl font-bold mb-4">Account</h2>

                        {/* Avatar Section */}
                        <div className="flex items-center mb-4">
                            <img
                                src={account?.avatar || '/path/to/default-avatar.png'}
                                alt="Avatar"
                                className="w-20 h-20 rounded-full object-cover mr-4"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="text-sm text-gray-600"
                            />
                        </div>

                        {/* Email Section */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </div>

                        {/* Save Button */}
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                            onClick={saveAvatar}>
                            Save
                        </button>

                        {/* Change Password Button */}
                        <Link href="/profile/changepassword">
                            <button className="bg-red-500 text-white px-4 py-2 rounded-md">
                                Change Password
                            </button>
                        </Link>
                    </div>

                    {/* Information Card */}
                    <div className="bg-white shadow-md rounded-lg p-5">
                        <h2 className="text-xl font-bold mb-4">Information</h2>

                        {/* Fullname Section */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullname}
                                onChange={e => setFullname(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>

                        {/* Phone Number Section */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                value={phonenumber}
                                onChange={e => setPhonenumber(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>

                        {/* Save Button */}
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            onClick={editInformation}>
                            Save
                        </button>
                    </div>
                </div>

                {/* Right Side Card */}
                <div className="w-1/3 bg-white shadow-md rounded-lg p-5">
                    <div className="flex items-center mb-4">
                        <img
                            src={account?.avatar || '/path/to/default-avatar.png'} // Default avatar if account.avatar is null
                            alt="User Avatar"
                            className="w-12 h-12 rounded-full mr-4"
                        />
                        <h2 className="text-lg font-semibold">Chào {candidate ? candidate.fullname : 'User'}, đã trở lại!</h2>
                    </div>

                    {/* CV Selection */}
                    {cvList.length > 0 ? (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Chọn CV chính</h3>
                            <select
                                value={selectedCvId || ''}
                                onChange={handleCvSelect}
                                className="w-full px-4 py-2 border rounded-lg"
                                disabled={searchStatus} // Disable when searchStatus is true
                            >
                                <option value="" disabled>Chọn CV của bạn</option>
                                {cvList.map(cv => (
                                    <option key={cv.id} value={cv.id}>
                                        {cv.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <p className="text-gray-600">Bạn chưa có CV nào.</p>
                            <Link href="/cv">
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                    Upload CV
                                </button>
                            </Link>
                        </div>
                    )}

                    <div className="flex items-center mt-4">
                        {/* Toggle Switch */}
                        <div
                            onClick={toggleSearchStatus}
                            className={`w-12 h-6 flex items-center bg-${searchStatus ? 'green-500' : 'gray-300'} rounded-full p-1 cursor-pointer transition-colors duration-300`}
                        >
                            {/* Circle inside the switch */}
                            <div
                                className={`bg-white w-5 h-5 rounded-full shadow-md transform ${searchStatus ? 'translate-x-6' : 'translate-x-0'} transition-transform duration-300`}
                            ></div>
                        </div>

                        {/* Status Text */}
                        <span className={`ml-3 font-medium ${searchStatus ? 'text-green-500' : 'text-gray-500'}`}>
                            Trạng thái tìm việc đang {searchStatus ? 'bật' : 'tắt'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
