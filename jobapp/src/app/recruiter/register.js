import { useState } from 'react';

export function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [gender, setGender] = useState('male');
    const [companyOption, setCompanyOption] = useState('exists');
    const [companyDetails, setCompanyDetails] = useState({
        companyEmail: '',
        companyInfo: '',
        companyLogo: null,
        companyName: '',
        companyPhoneNumber: '',
        companyWebsite: '',
        companyCity: '',
        companyAddressDetail: '',
        companyProvince: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        const formData = {
            email,
            password,
            fullName,
            phoneNumber,
            avatar,
            city,
            province,
            gender,
            companyOption,
            companyDetails: companyOption === 'create' ? companyDetails : null,
        };
        console.log(formData);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(URL.createObjectURL(file));
        }
    };

    const handleCompanyOptionChange = (e) => {
        setCompanyOption(e.target.value);
    };

    const handleCompanyDetailChange = (e) => {
        const { name, value } = e.target;
        setCompanyDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleCompanyLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCompanyDetails((prevDetails) => ({
                ...prevDetails,
                companyLogo: URL.createObjectURL(file),
            }));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-md shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Province</label>
                        <input
                            type="text"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="others">Others</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Avatar</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="w-full border rounded-md"
                        />
                        {avatar && (
                            <img
                                src={avatar}
                                alt="Avatar Preview"
                                className="mt-2 h-20 w-20 rounded-full object-cover"
                            />
                        )}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Company</label>
                        <select
                            value={companyOption}
                            onChange={handleCompanyOptionChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="exists">Company Exists</option>
                            <option value="create">Create a Company</option>
                        </select>
                    </div>
                    {companyOption === 'exists' && (
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Select Company</label>
                            {/* Giả sử bạn có danh sách các công ty lưu trữ */}
                            <select
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a company</option>
                                <option value="company1">Company 1</option>
                                <option value="company2">Company 2</option>
                                {/* Thêm các công ty khác ở đây */}
                            </select>
                        </div>
                    )}
                    {companyOption === 'create' && (
                        <div className="mt-4">
                            <h3 className="text-lg font-medium">Create a Company</h3>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Company Email</label>
                                <input
                                    type="email"
                                    name="companyEmail"
                                    value={companyDetails.companyEmail}
                                    onChange={handleCompanyDetailChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Company Information</label>
                                <textarea
                                    name="companyInfo"
                                    value={companyDetails.companyInfo}
                                    onChange={handleCompanyDetailChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Company Logo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCompanyLogoChange}
                                    className="w-full border rounded-md"
                                />
                                {companyDetails.companyLogo && (
                                    <img
                                        src={companyDetails.companyLogo}
                                        alt="Company Logo Preview"
                                        className="mt-2 h-20 w-20 rounded-full object-cover"
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={companyDetails.companyName}
                                    onChange={handleCompanyDetailChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Company Phone Number</label>
                                <input
                                    type="tel"
                                    name="companyPhoneNumber"
                                    value={companyDetails.companyPhoneNumber}
                                    onChange={handleCompanyDetailChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Company Website</label>
                                <input
                                    type="url"
                                    name="companyWebsite"
                                    value={companyDetails.companyWebsite}
                                    onChange={handleCompanyDetailChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Company City</label>
                                <input
                                    type="text"
                                    name="companyCity"
                                    value={companyDetails.companyCity}
                                    onChange={handleCompanyDetailChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Company Address Detail</label>
                                <input
                                    type="text"
                                    name="companyAddressDetail"
                                    value={companyDetails.companyAddressDetail}
                                    onChange={handleCompanyDetailChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Company Province</label>
                                <input
                                    type="text"
                                    name="companyProvince"
                                    value={companyDetails.companyProvince}
                                    onChange={handleCompanyDetailChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                    >
                        Register
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Already have an account?{' '}
                    <a href="login" className="text-blue-500 hover:underline">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}
