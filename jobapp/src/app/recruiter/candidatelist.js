import { useState } from 'react';
import SearchCandidateBar from '../common/searchcandidatebar';

// Mock data ứng viên (dữ liệu giả)
const mockCandidates = [
    {
        id: 1,
        fullname: "John Doe",
        phoneNumber: "123-456-7890",
        email: "johndoe@example.com",
        avatar: "https://via.placeholder.com/150",
        experience: "5+ years",
        gender: "male",
        skill: "JavaScript, React",
        language: "English",
        employmentStatus: "available",
        isSaved: true,
    },
    {
        id: 2,
        fullname: "Jane Smith",
        phoneNumber: "987-654-3210",
        email: "janesmith@example.com",
        avatar: "https://via.placeholder.com/150",
        experience: "1-3 years",
        gender: "female",
        skill: "Python, Django",
        language: "French",
        employmentStatus: "not available",
        isSaved: false,
    },
];

const CandidatesList = () => {
    const [candidates, setCandidates] = useState(mockCandidates); // Danh sách ứng viên
    const [filteredCandidates, setFilteredCandidates] = useState([]); // Danh sách ứng viên đã lọc
    const [isSearching, setIsSearching] = useState(false); // Trạng thái tìm kiếm

    // Hàm xử lý tìm kiếm
    const handleSearch = (filters) => {
        const filtered = candidates.filter((candidate) => {
            return (
                (!filters.experience || candidate.experience === filters.experience) &&
                (!filters.gender || candidate.gender === filters.gender) &&
                (!filters.skill || candidate.skill.toLowerCase().includes(filters.skill.toLowerCase())) &&
                (!filters.language || candidate.language.toLowerCase().includes(filters.language.toLowerCase())) &&
                (!filters.employmentStatus || candidate.employmentStatus === filters.employmentStatus)
            );
        });

        setFilteredCandidates(filtered);
        setIsSearching(true); // Chuyển sang trạng thái tìm kiếm
    };

    const toggleSave = (id) => {
        setCandidates((prevCandidates) =>
            prevCandidates.map((candidate) =>
                candidate.id === id
                    ? { ...candidate, isSaved: !candidate.isSaved }
                    : candidate
            )
        );
    };

    // Hiển thị danh sách ứng viên (tất cả hoặc đã tìm kiếm)
    const displayCandidates = isSearching ? filteredCandidates : candidates;

    return (
        <main className="bg-gray-100 min-h-screen">
            <section className="bg-blue-600 py-20">
                <div className="container mx-auto text-center text-white">
                    <h1 className="text-5xl font-bold">Find Your Talent Candidates</h1>
                    <SearchCandidateBar onSearch={handleSearch} />
                </div>
            </section>

            <div className="mt-6 space-y-6 text-black">
                {displayCandidates.length === 0 ? (
                    <p className="text-center text-gray-500">No candidates found</p>
                ) : (
                    displayCandidates.map((candidate) => (
                        <div
                            key={candidate.id}
                            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
                        >
                            {/* Thông tin ứng viên */}
                            <div>
                                <h2 className="text-lg font-semibold">{candidate.fullname}</h2>
                                <p className="text-sm text-gray-500">{candidate.email}</p>
                                <p className="text-sm text-gray-500">{candidate.phoneNumber}</p>
                            </div>

                            {/* Nút hành động */}
                            <div className="flex space-x-4">
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={() => console.log('View CV:', candidate.fullname)}
                                >
                                    View CV
                                </button>
                                <button
                                    onClick={() => toggleSave(candidate.id)}
                                    className={`px-4 py-2 rounded ${candidate.isSaved
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-green-500 text-white hover:bg-green-600'
                                        }`}
                                >
                                    {candidate.isSaved ? 'Unsave' : 'Save'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
};

export default CandidatesList;
