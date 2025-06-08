import { useState } from 'react';
import { FiSearch, FiBriefcase, FiUser, FiCode, FiGlobe, FiBook, FiAward, FiTarget } from 'react-icons/fi';

const SearchCandidateBar = ({ onSearch,className = '' }) => {
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

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(filters);
    };

    return (
        <div className={`relative ${className}`} suppressHydrationWarning={true}>
        <div className="bg-gradient-to-br from-white to-blue-50 shadow-xl rounded-2xl p-8 mb-8 border border-gray-100" suppressHydrationWarning={true}>
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                Find Your Perfect Candidate
            </h2>
            <p className="text-center text-gray-500 mb-8">
                Refine your search with our powerful filters
            </p>

            <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning={true}>
                    {/* Experience */}
                    <div className="relative" suppressHydrationWarning={true}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Experience</label>
                        <div className="relative" suppressHydrationWarning={true}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning={true}>
                                <FiBriefcase className="h-5 w-5 text-blue-400" />
                            </div>
                            <input
                                type="text"
                                name="experience"
                                value={filters.experience}
                                onChange={handleChange}
                                placeholder="e.g. 5 years"
                                className="pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm text-black"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="relative" suppressHydrationWarning={true}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Gender</label>
                        <div className="relative" suppressHydrationWarning={true}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning={true}>
                                <FiUser className="h-5 w-5 text-blue-400" />
                            </div>
                            <select
                                name="gender"
                                value={filters.gender}
                                onChange={handleChange}
                                className="text-black pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 appearance-none transition-all duration-200 shadow-sm"
                            >
                                <option value="">Any Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" suppressHydrationWarning={true}>
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Skill */}
                    <div className="relative" suppressHydrationWarning={true}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Skill</label>
                        <div className="relative" suppressHydrationWarning={true}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning={true}>
                                <FiCode className="h-5 w-5 text-blue-400" />
                            </div>
                            <input
                                type="text"
                                name="skill"
                                value={filters.skill}
                                onChange={handleChange}
                                placeholder="e.g. React, Python"
                                className="text-black pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Language */}
                    <div className="relative" suppressHydrationWarning={true}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Language</label>
                        <div className="relative" suppressHydrationWarning={true}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning={true}>
                                <FiGlobe className="h-5 w-5 text-blue-400" />
                            </div>
                            <input
                                type="text"
                                name="language"
                                value={filters.language}
                                onChange={handleChange}
                                placeholder="e.g. English, Spanish"
                                className="text-black pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Education */}
                    <div className="relative" suppressHydrationWarning={true}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Education</label>
                        <div className="relative" suppressHydrationWarning={true}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning={true}>
                                <FiBook className="h-5 w-5 text-blue-400" />
                            </div>
                            <input
                                type="text"
                                name="education"
                                value={filters.education}
                                onChange={handleChange}
                                placeholder="e.g. Bachelor's Degree"
                                className="text-black pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Certification */}
                    <div className="relative" suppressHydrationWarning={true}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Certification</label>
                        <div className="relative" suppressHydrationWarning={true}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning={true}>
                                <FiAward className="h-5 w-5 text-blue-400" />
                            </div>
                            <input
                                type="text"
                                name="certification"
                                value={filters.certification}
                                onChange={handleChange}
                                placeholder="e.g. AWS Certified"
                                className="text-black pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Goal */}
                    <div className="relative" suppressHydrationWarning={true}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Career Goal</label>
                        <div className="relative" suppressHydrationWarning={true}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning={true}>
                                <FiTarget className="h-5 w-5 text-blue-400" />
                            </div>
                            <input
                                type="text"
                                name="goal"
                                value={filters.goal}
                                onChange={handleChange}
                                placeholder="e.g. Senior Developer"
                                className="text-black pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center" suppressHydrationWarning={true}>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center"
                    >
                        <FiSearch className="mr-2" />
                        Search Candidates
                    </button>
                </div>
            </form>
        </div>  
        </div>
    );
};

export default SearchCandidateBar;