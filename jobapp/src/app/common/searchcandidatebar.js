import { useState } from 'react';

const SearchCandidateBar = ({ onSearch }) => {
    const [filters, setFilters] = useState({
        experience: '',
        gender: '',
        skill: '',
        language: '',
        education: '',
        certification: '',
        goal: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const handleSearch = () => {
        onSearch(filters);
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-black">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Search Candidates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <input
                        type="text"
                        name="experience"
                        value={filters.experience}
                        onChange={handleChange}
                        placeholder="Enter experience"
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                        name="gender"
                        value={filters.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md"
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                    <input
                        type="text"
                        name="skill"
                        value={filters.skill}
                        onChange={handleChange}
                        placeholder="Enter skill"
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <input
                        type="text"
                        name="language"
                        value={filters.language}
                        onChange={handleChange}
                        placeholder="Enter language"
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    <input
                        type="text"
                        name="education"
                        value={filters.education}
                        onChange={handleChange}
                        placeholder="Enter education"
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                    <input
                        type="text"
                        name="certification"
                        value={filters.certification}
                        onChange={handleChange}
                        placeholder="Enter certification"
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                    <input
                        type="text"
                        name="goal"
                        value={filters.goal}
                        onChange={handleChange}
                        placeholder="Enter career goal"
                        className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600"
                >
                    Search
                </button>
            </div>
        </div>
    );
};

export default SearchCandidateBar;
