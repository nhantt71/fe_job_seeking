'use client';

import { useState, useEffect } from 'react';
import { useRecruiterContext } from '../context/recruitercontext';

export default function Members() {
    const [members, setMembers] = useState([]);
    const [waitingMembers, setWaitingMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('current');
    const [companyId, setCompanyId] = useState();
    const { recruiter } = useRecruiterContext();

    useEffect(() => {
        if (recruiter?.companyId) {
            setCompanyId(recruiter?.companyId);
        }
    }, [recruiter?.companyId]);

    // Fetch members
    const fetchMembers = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/recruiter/get-members-by-company/${companyId}`);
            const data = await response.json();
            setMembers(Array.isArray(data) ? data : []); // Ensure data is an array
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    // Fetch waiting members
    const fetchWaitingMembers = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/recruiter/get-waiting-recruiters-by-company/${companyId}`);
            const data = await response.json();
            setWaitingMembers(Array.isArray(data) ? data : []); // Ensure data is an array
        } catch (error) {
            console.error('Error fetching waiting members:', error);
        }
    };

    useEffect(() => {
        if (companyId) {
            fetchMembers();
            fetchWaitingMembers();
        }
    }, [companyId]);

    const handleKick = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/recruiter/kick-member/${id}?companyId=${companyId}`, {
                method: 'POST',
            });
            setMembers((prev) => prev.filter((member) => member.id !== id));
        } catch (error) {
            console.error('Error kicking member:', error);
        }
    };

    const handleApprove = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/recruiter/approve-member/${id}?companyId=${companyId}`, {
                method: 'POST',
            });
            const memberToApprove = waitingMembers.find((member) => member.id === id);
            if (memberToApprove) {
                setMembers((prev) => [...prev, memberToApprove]);
                setWaitingMembers((prev) => prev.filter((member) => member.id !== id));
            }
        } catch (error) {
            console.error('Error approving member:', error);
        }
    };

    const handleDecline = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/recruiter/decline-member/${id}?companyId=${companyId}`, {
                method: 'POST',
            });
            setWaitingMembers((prev) => prev.filter((member) => member.id !== id));
        } catch (error) {
            console.error('Error declining member:', error);
        }
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

            {/* List of Members */}
            {activeTab === 'current' ? (
                <div className="bg-white shadow-md rounded p-6 mb-6">
                    <ul>
                        {Array.isArray(members) && members.length > 0 ? (
                            members.map((member) => (
                                <li key={member.id} className="flex items-center justify-between p-4 border-b">
                                    <div className="flex items-center">
                                        <img
                                            src={member.avatar}
                                            alt={member.fullname}
                                            className="w-10 h-10 rounded-full mr-4"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold">{member.fullname}</h3>
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
                            ))
                        ) : (
                            <p>No current members found.</p>
                        )}
                    </ul>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded p-6">
                    <ul>
                        {Array.isArray(waitingMembers) && waitingMembers.length > 0 ? (
                            waitingMembers.map((member) => (
                                <li key={member.id} className="flex items-center justify-between p-4 border-b">
                                    <div className="flex items-center">
                                        <img
                                            src={member.avatar}
                                            alt={member.fullname}
                                            className="w-10 h-10 rounded-full mr-4"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold">{member.fullname}</h3>
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
                            ))
                        ) : (
                            <p>No waiting members found.</p>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
