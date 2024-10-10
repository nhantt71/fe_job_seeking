import { useState } from 'react';

export default function Members() {
    const [members, setMembers] = useState([
        {
            id: 1,
            name: "John Doe",
            phoneNumber: "123-456-7890",
            email: "john@example.com",
            avatar: "https://via.placeholder.com/50",
        },
        {
            id: 2,
            name: "Jane Smith",
            phoneNumber: "987-654-3210",
            email: "jane@example.com",
            avatar: "https://via.placeholder.com/50",
        },
    ]);

    const [waitingMembers, setWaitingMembers] = useState([
        {
            id: 3,
            name: "Mike Johnson",
            phoneNumber: "555-123-4567",
            email: "mike@example.com",
            avatar: "https://via.placeholder.com/50",
        },
        {
            id: 4,
            name: "Emily Davis",
            phoneNumber: "555-765-4321",
            email: "emily@example.com",
            avatar: "https://via.placeholder.com/50",
        },
    ]);

    const [activeTab, setActiveTab] = useState('current');

    // Hàm kick member
    const handleKick = (id) => {
        setMembers((prev) => prev.filter((member) => member.id !== id));
    };

    // Hàm approve member
    const handleApprove = (id) => {
        const memberToApprove = waitingMembers.find((member) => member.id === id);
        if (memberToApprove) {
            setMembers((prev) => [...prev, memberToApprove]); // Thêm vào danh sách members
            setWaitingMembers((prev) => prev.filter((member) => member.id !== id)); // Xóa khỏi waiting
        }
    };

    // Hàm decline member
    const handleDecline = (id) => {
        setWaitingMembers((prev) => prev.filter((member) => member.id !== id));
    };

    return (
        <div className="container mx-auto p-6 text-black">
            <h1 className="text-2xl font-bold mb-6">Members</h1>

            {/* Tab Navigation */}
            <div className="mb-4">
                <button
                    className={`px-4 py-2 rounded ${activeTab === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setActiveTab('current')}
                >
                    Current Members
                </button>
                <button
                    className={`ml-2 px-4 py-2 rounded ${activeTab === 'waiting' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setActiveTab('waiting')}
                >
                    Waiting Members
                </button>
            </div>

            {/* Danh sách các thành viên */}
            {activeTab === 'current' ? (
                <div className="bg-white shadow-md rounded p-6 mb-6">
                    <ul>
                        {members.map((member) => (
                            <li key={member.id} className="flex items-center justify-between p-4 border-b">
                                <div className="flex items-center">
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-10 h-10 rounded-full mr-4"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold">{member.name}</h3>
                                        <p className="text-sm text-gray-600">{member.phoneNumber}</p>
                                        <p className="text-sm text-gray-600">{member.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleKick(member.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Kick
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded p-6">
                    <ul>
                        {waitingMembers.map((member) => (
                            <li key={member.id} className="flex items-center justify-between p-4 border-b">
                                <div className="flex items-center">
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-10 h-10 rounded-full mr-4"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold">{member.name}</h3>
                                        <p className="text-sm text-gray-600">{member.phoneNumber}</p>
                                        <p className="text-sm text-gray-600">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(member.id)}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDecline(member.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
