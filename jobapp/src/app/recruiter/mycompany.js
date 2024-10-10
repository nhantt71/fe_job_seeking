import { useState } from 'react';

export default function MyCompany() {
    // State cho dữ liệu công ty
    const [company, setCompany] = useState({
        email: "company@example.com",
        information: "This is a leading tech company providing various services...",
        logo: "https://via.placeholder.com/100",
        name: "Tech Innovators Ltd.",
        phoneNumber: "123-456-7890",
        website: "https://techinnovators.com",
        addressDetail: "1234 Silicon Valley",
        city: "San Francisco",
        province: "California",
        createdBy: "John Doe"
    });

    // State cho việc chỉnh sửa
    const [editable, setEditable] = useState(false);

    // Hàm cập nhật dữ liệu sau khi chỉnh sửa
    const handleUpdate = () => {
        setEditable(false); // Tắt chế độ chỉnh sửa sau khi cập nhật
    };

    // Hàm thay đổi thông tin công ty
    const handleChange = (e) => {
        setCompany({
            ...company,
            [e.target.name]: e.target.value,
        });
    };

    // State cho danh sách công việc
    const [jobs, setJobs] = useState([
        { id: 1, title: "Frontend Developer", location: "San Francisco, CA", salary: "$100k/year" },
        { id: 2, title: "Backend Developer", location: "New York, NY", salary: "$120k/year" },
        { id: 3, title: "DevOps Engineer", location: "Austin, TX", salary: "$110k/year" },
        { id: 4, title: "Product Manager", location: "Los Angeles, CA", salary: "$130k/year" },
        { id: 5, title: "UX/UI Designer", location: "Seattle, WA", salary: "$90k/year" },
        { id: 6, title: "Data Scientist", location: "Chicago, IL", salary: "$150k/year" },
        { id: 7, title: "Mobile App Developer", location: "Boston, MA", salary: "$115k/year" },
        { id: 8, title: "AI Engineer", location: "Miami, FL", salary: "$160k/year" }
    ]);

    // State cho trang hiện tại của công việc
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 5;

    // Tính toán công việc hiển thị trên trang hiện tại
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

    // Hàm chuyển trang
    const nextPage = () => {
        if (indexOfLastJob < jobs.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen py-6 text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">My Company</h1>

                    {/* Logo */}
                    <div className="flex items-center mb-4">
                        <img
                            src={company.logo}
                            alt="Company Logo"
                            className="w-24 h-24 rounded-full mr-6 object-cover"
                        />
                        <div>
                            {editable ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={company.name}
                                    onChange={handleChange}
                                    className="border p-2 rounded"
                                />
                            ) : (
                                <h2 className="text-xl font-semibold text-gray-700">{company.name}</h2>
                            )}
                            {editable ? (
                                <input
                                    type="text"
                                    name="website"
                                    value={company.website}
                                    onChange={handleChange}
                                    className="border p-2 rounded mt-2"
                                />
                            ) : (
                                <p className="text-sm text-gray-500">{company.website}</p>
                            )}
                        </div>
                    </div>

                    {/* Thông tin công ty */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">Email</h3>
                            {editable ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={company.email}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.email}</p>
                            )}
                        </div>

                        {/* Số điện thoại */}
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">Phone Number</h3>
                            {editable ? (
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={company.phoneNumber}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.phoneNumber}</p>
                            )}
                        </div>

                        {/* Địa chỉ chi tiết */}
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">Detail of Address</h3>
                            {editable ? (
                                <input
                                    type="text"
                                    name="addressDetail"
                                    value={company.addressDetail}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.addressDetail}</p>
                            )}
                        </div>

                        {/* Thành phố */}
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">City</h3>
                            {editable ? (
                                <input
                                    type="text"
                                    name="city"
                                    value={company.city}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.city}</p>
                            )}
                        </div>

                        {/* Tỉnh/Bang */}
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">Province</h3>
                            {editable ? (
                                <input
                                    type="text"
                                    name="province"
                                    value={company.province}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.province}</p>
                            )}
                        </div>

                        {/* Người tạo công ty */}
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600">Created By</h3>
                            <p className="text-gray-800 mt-1">{company.createdBy}</p>
                        </div>

                        {/* Thông tin công ty */}
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-600">Company Information</h3>
                            {editable ? (
                                <textarea
                                    name="information"
                                    value={company.information}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            ) : (
                                <p className="text-gray-800 mt-1">{company.information}</p>
                            )}
                        </div>
                    </div>

                    {/* Nút Update hoặc Edit */}
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

                    {/* Danh sách công việc đã published */}
                    <div className="mt-10">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Published Jobs</h2>
                        <ul>
                            {currentJobs.map((job) => (
                                <li key={job.id} className="bg-gray-50 p-4 mb-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700">{job.title}</h3>
                                    <p className="text-sm text-gray-500">{job.location}</p>
                                    <p className="text-sm text-gray-500">{job.salary}</p>
                                </li>
                            ))}
                        </ul>

                        {/* Nút chuyển trang */}
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={nextPage}
                                disabled={indexOfLastJob >= jobs.length}
                                className={`px-4 py-2 rounded ${indexOfLastJob >= jobs.length ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
