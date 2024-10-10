import { useState } from 'react';

const SearchCandidateBar = ({ onSearch }) => {
    const [filters, setFilters] = useState({
        experience: '',
        gender: '',
        skill: '',
        language: '',
        employmentStatus: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const handleSearch = () => {
        onSearch(filters); // Gọi hàm onSearch với các bộ lọc
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-black">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Search Candidates</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Kinh nghiệm */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <select
                        name="experience"
                        value={filters.experience}
                        onChange={handleChange}
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select Experience</option>
                        <option value="fresher">Fresher</option>
                        <option value="1-3 years">1-3 Years</option>
                        <option value="3-5 years">3-5 Years</option>
                        <option value="5+ years">5+ Years</option>
                    </select>
                </div>

                {/* Giới tính */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                        name="gender"
                        value={filters.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Kỹ năng */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                    <input
                        type="text"
                        name="skill"
                        value={filters.skill}
                        onChange={handleChange}
                        placeholder="Enter skill"
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Ngôn ngữ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <input
                        type="text"
                        name="language"
                        value={filters.language}
                        onChange={handleChange}
                        placeholder="Enter language"
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Tình trạng làm việc */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                    <select
                        name="employmentStatus"
                        value={filters.employmentStatus}
                        onChange={handleChange}
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select Employment Status</option>
                        <option value="available">Available</option>
                        <option value="not available">Not Available</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Search
                </button>
            </div>
        </div>
    );
};

export default SearchCandidateBar;
