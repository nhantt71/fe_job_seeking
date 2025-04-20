'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRecruiterContext } from '../context/recruitercontext';
import { useUserContext } from '../context/usercontext';

export default function Profile() {
    const router = useRouter();
    const [city, setCity] = useState('');
    const [gender, setGender] = useState('');
    const [province, setProvince] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [fullname, setFullname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState(null);
    const { recruiter, setRecruiterData } = useRecruiterContext();
    const { email } = useUserContext();
    const [account, setAccount] = useState();
    const [editable, setEditable] = useState(false);

    useEffect(() => {
        fetchAccount(email);
        if (recruiter) {
            setFullname(recruiter.fullname);
            setPhoneNumber(recruiter.phoneNumber);
            setCity(recruiter.city);
            setGender(recruiter.gender);
            setProvince(recruiter.province);
        }
    }, [recruiter]);

    const fetchAccount = async (email) => {
        try {
            const response = await fetch(`/api/auth/get-account-by-email?email=${email}`);
            const data = await response.json();
            setAccount(data);
            setAvatar(data.avatar);
        } catch (err) {
            console.log(err);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await fetch(`/api/recruiter/edit/${recruiter.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullname, phoneNumber, city, gender, province }),
            });
    
            if (response.ok) {
                const updatedRecruiter = await response.json();
                setRecruiterData(updatedRecruiter);
                setEditable(false);
            } else {
                console.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setPasswordError(null);

        try {
            await fetch(`/api/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: account.id,
                    oldPassword,
                    newPassword,
                }),
            });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
        }
    };

    const handleChangeAvatar = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('accountId', account.id);

        try {
            const response = await fetch(`/api/auth/change-avatar`, {
                method: 'POST',
                body: formData,
            });
            const updatedAccount = await response.json();
            setAvatar(updatedAccount.avatar);
        } catch (error) {
            console.error('Error changing avatar:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 text-black pt-20">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

                <div className="border-b pb-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Account</h2>
                    <div className="flex items-center mb-4">
                        <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover mr-4" />
                        <input type="file" onChange={(e) => handleChangeAvatar(e.target.files[0])} />
                        <div>
                            <p className="text-lg font-semibold text-gray-700">{email}</p>
                            <p className="text-sm text-gray-500">Email (cannot be changed)</p>
                        </div>
                    </div>
                    <button onClick={() => setEditable(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Edit Profile
                    </button>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Full Name</label>
                            <input
                                type="text"
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                                disabled={!editable}
                                className={`border p-2 rounded w-full ${editable ? 'bg-white' : 'bg-gray-100'}`}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Gender</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                disabled={!editable}
                                className={`border p-2 rounded w-full ${editable ? 'bg-white' : 'bg-gray-100'}`}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Phone Number</label>
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={!editable}
                                className={`border p-2 rounded w-full ${editable ? 'bg-white' : 'bg-gray-100'}`}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">City</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                disabled={!editable}
                                className={`border p-2 rounded w-full ${editable ? 'bg-white' : 'bg-gray-100'}`}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Province</label>
                            <input
                                type="text"
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                disabled={!editable}
                                className={`border p-2 rounded w-full ${editable ? 'bg-white' : 'bg-gray-100'}`}
                            />
                        </div>
                    </div>

                    {editable && (
                        <button
                            onClick={handleUpdateProfile}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-4"
                        >
                            Save Changes
                        </button>
                    )}
                </div>

                <div className="border-t mt-6 pt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Old Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-600">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                    </div>
                    {passwordError && (
                        <p className="text-red-500 mb-4">{passwordError}</p>
                    )}
                    <button
                        onClick={handleChangePassword}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
}
