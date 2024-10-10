import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Profile() {
    const router = useRouter();

    // State cho dữ liệu hồ sơ của recruiter
    const [profile, setProfile] = useState({
        email: "recruiter@example.com",
        avatar: "https://via.placeholder.com/150",
        password: "********",
        fullname: "John Doe",
        gender: "male",
        phoneNumber: "123-456-7890",
        city: "San Francisco",
        province: "California",
    });

    // State cho việc chỉnh sửa
    const [editable, setEditable] = useState(false);

    // Hàm xử lý chỉnh sửa thông tin
    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    // Hàm xử lý cập nhật thông tin
    const handleUpdate = () => {
        setEditable(false); // Tắt chế độ chỉnh sửa sau khi cập nhật
        // Logic cập nhật thông tin người dùng ở đây
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 text-black pt-20">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                {/* Phần Account */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>
                <div className="border-b pb-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Account</h2>

                    {/* Avatar */}
                    <div className="flex items-center mb-4">
                        <img
                            src={profile.avatar}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover mr-4"
                        />
                        <div>
                            <p className="text-lg font-semibold text-gray-700">{profile.email}</p>
                            <p className="text-sm text-gray-500">Email (cannot be changed)</p>
                        </div>
                    </div>

                    {/* Nút Change Password */}
                    <button
                        onClick={() => router.push('profile/change-password')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Change Password
                    </button>
                </div>

                {/* Phần Information */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Full Name</label>
                            <input
                                type="text"
                                name="fullname"
                                value={profile.fullname}
                                onChange={handleChange}
                                disabled={!editable}
                                className={`border p-2 rounded w-full ${editable ? 'bg-white' : 'bg-gray-100'}`}
                            />
                        </div>

                        {/* Gender */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Gender</label>
                            <select
                                name="gender"
                                value={profile.gender}
                                onChange={handleChange}
                                disabled={!editable}
                                className={`border p-2 rounded w-full ${editable ? 'bg-white' : 'bg-gray-100'}`}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Phone Number */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={profile.phoneNumber}
                                onChange={handleChange}
                                disabled={!editable}
                                className={`border p-2 rounded w-full ${editable ? 'bg-white' : 'bg-gray-100'}`}
                            />
                        </div>

                        {/* City */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">City</label>
                            <input
                                type="text"
                                name="city"
                                value={profile.city}
                                onChange={handleChange}
                                disabled={!editable}
                                className={`border p-2 rounded w-full ${editable ? 'bg-white' : 'bg-gray-100'}`}
                            />
                        </div>

                        {/* Province */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Province</label>
                            <input
                                type="text"
                                name="province"
                                value={profile.province}
                                onChange={handleChange}
                                disabled={!editable}
                                className={`border p-2 rounded w-full ${editable ? 'bg-white' : 'bg-gray-100'}`}
                            />
                        </div>
                    </div>

                    {/* Nút Edit và Update */}
                    <div className="mt-6">
                        {editable ? (
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Update
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditable(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
