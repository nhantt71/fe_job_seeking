'use client';

import { useEffect, useState } from 'react';
import { useRecruiterContext } from '../context/recruitercontext';

export default function SavedCandidates() {
    const [companyId, setCompanyId] = useState();
    const { recruiter } = useRecruiterContext();
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        fetchSavedCandidates();
    }, [companyId]);

    useEffect(() => {
        if (recruiter?.companyId) {
            setCompanyId(recruiter.companyId);
        }
    }, [recruiter?.companyId]);

    const fetchSavedCandidates = async () => {
        try {
            const response = await fetch(`/api/candidate/get-saved-candidates/${companyId}`);
            const data = await response.json();

            const candidatesWithStatus = await Promise.all(
                data.map(async (candidate) => {
                    const isSaved = await fetchSavedStatus(candidate.id);
                    return { ...candidate, isSaved };
                })
            );

            setCandidates(candidatesWithStatus);
        } catch (error) {
            console.error('Error fetching saved candidates:', error);
        }
    };

    const fetchSavedStatus = async (candidateId) => {
        try {
            const response = await fetch(
                `/api/company-candidate/check-saved-status?candidateId=${candidateId}&companyId=${companyId}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching saved status:', error);
            return false;
        }
    };

    const handleSaveToggle = async (candidateId, isCurrentlySaved) => {
        const url = isCurrentlySaved
            ? `/api/company-candidate/unsave-candidate/${candidateId}?companyId=${companyId}`
            : `/api/company-candidate/save-candidate/${candidateId}?companyId=${companyId}`;

        try {
            await fetch(url, { method: 'POST' });
            fetchSavedCandidates();
        } catch (error) {
            console.error(`Error ${isCurrentlySaved ? 'unsaving' : 'saving'} candidate:`, error);
        }
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
                                    href={candidate.fileCV}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    View CV
                                </a>
                                <button
                                    onClick={() => handleSaveToggle(candidate.id, candidate.isSaved)}
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
