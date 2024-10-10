import { useState } from 'react';

export default function SavedCandidates() {
    const [candidates, setCandidates] = useState([
        {
            id: 1,
            fullName: "Alice Johnson",
            phoneNumber: "123-456-7890",
            email: "alice@example.com",
            avatar: "https://via.placeholder.com/50",
            cvUrl: "/path/to/cv-alice.pdf", // Đường dẫn đến CV
            isSaved: true // Trạng thái lưu
        },
        {
            id: 2,
            fullName: "Bob Smith",
            phoneNumber: "987-654-3210",
            email: "bob@example.com",
            avatar: "https://via.placeholder.com/50",
            cvUrl: "/path/to/cv-bob.pdf", // Đường dẫn đến CV
            isSaved: true // Trạng thái lưu
        },
        // Bạn có thể thêm nhiều ứng viên khác vào đây
    ]);

    // Hàm để lưu hoặc bỏ lưu ứng viên
    const handleSaveToggle = (id) => {
        setCandidates((prevCandidates) =>
            prevCandidates.map((candidate) =>
                candidate.id === id ? { ...candidate, isSaved: !candidate.isSaved } : candidate
            )
        );
    };

    return (
        <div className="container mx-auto p-6 text-black">
            <h1 className="text-2xl font-bold mb-6">Saved Candidates</h1>

            <div className="bg-white shadow-md rounded p-6">
                <ul>
                    {candidates.map((candidate) => (
                        <li key={candidate.id} className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center">
                                <img
                                    src={candidate.avatar}
                                    alt={candidate.fullName}
                                    className="w-10 h-10 rounded-full mr-4"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold">{candidate.fullName}</h3>
                                    <p className="text-sm text-gray-600">{candidate.phoneNumber}</p>
                                    <p className="text-sm text-gray-600">{candidate.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <a
                                    href={candidate.cvUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    View CV
                                </a>
                                <button
                                    onClick={() => handleSaveToggle(candidate.id)}
                                    className={`px-4 py-2 ${candidate.isSaved ? 'bg-red-500' : 'bg-green-500'} text-white rounded hover:bg-opacity-75`}
                                >
                                    {candidate.isSaved ? 'Unsave' : 'Save'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
