import Link from 'next/link';
import { useState } from 'react';

export default function YourProfile() {
    const [searchStatus, setSearchStatus] = useState(false);
    const [avatar, setAvatar] = useState('/default-avatar.png');
    const [fullname, setFullname] = useState('John Doe');
    const [phonenumber, setPhonenumber] = useState('0123456789');
    const [email] = useState('johndoe@example.com');
    const [cvList, setCvList] = useState([
        { id: 1, name: 'CV 1', file: '/path/to/cv1.pdf' },
        { id: 2, name: 'CV 2', file: '/path/to/cv2.pdf' }
    ]);
    const [selectedCvId, setSelectedCvId] = useState(null);

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatar(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleSearchStatus = () => {
        if (selectedCvId) {
            setSearchStatus((prevStatus) => !prevStatus);
        } else {
            alert("Bạn cần chọn CV chính trước khi bật trạng thái tìm kiếm việc làm.");
        }
    };

    const handleCvSelect = (event) => {
        const cvId = parseInt(event.target.value, 10);
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
                                src={avatar}
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
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2">
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
                                onChange={(e) => setFullname(e.target.value)}
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
                                onChange={(e) => setPhonenumber(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>

                        {/* Save Button */}
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                            Save
                        </button>
                    </div>
                </div>

                {/* Right Side Card */}
                <div className="w-1/3 bg-white shadow-md rounded-lg p-5">
                    <div className="flex items-center mb-4">
                        <img
                            src={avatar}
                            alt="User Avatar"
                            className="w-12 h-12 rounded-full mr-4"
                        />
                        <h2 className="text-lg font-semibold">Chào {fullname}, đã trở lại!</h2>
                    </div>

                    {/* CV Selection */}
                    {cvList.length > 0 ? (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Chọn CV chính</h3>
                            <select
                                value={selectedCvId || ''}
                                onChange={handleCvSelect}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="" disabled>Chọn CV của bạn</option>
                                {cvList.map((cv) => (
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
                            className={`w-12 h-6 flex items-center bg-${
                                searchStatus ? 'green-500' : 'gray-300'
                            } rounded-full p-1 cursor-pointer transition-colors duration-300`}
                        >
                            {/* Circle inside the switch */}
                            <div
                                className={`bg-white w-5 h-5 rounded-full shadow-md transform ${
                                    searchStatus ? 'translate-x-6' : 'translate-x-0'
                                } transition-transform duration-300`}
                            ></div>
                        </div>

                        {/* Status Text */}
                        <span
                            className={`ml-3 font-medium ${
                                searchStatus ? 'text-green-500' : 'text-gray-500'
                            }`}
                        >
                            Trạng thái tìm việc đang {searchStatus ? 'bật' : 'tắt'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
