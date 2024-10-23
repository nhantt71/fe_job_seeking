import { useEffect, useState } from 'react';
import SearchCandidateBar from '../common/searchcandidatebar';

const CandidatesList = () => {
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchAvailableCandidates();
    }, []);

    const fetchAvailableCandidates = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/candidate/get-available-candidates');
            const data = await response.json();
            setCandidates(data);
            setIsSearching(false);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    };

    const handleSearch = async (filters) => {
        const queryParams = new URLSearchParams(filters).toString();

        if (!queryParams) {
            fetchAvailableCandidates();
        } else {
            try {
                const response = await fetch(`http://localhost:8080/api/candidate/search?${queryParams}`);
                const candidateIds = await response.json();

                if (candidateIds && candidateIds.length > 0) {
                    const detailedResponse = await fetch(`http://localhost:8080/api/candidate/get-search-candidates`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(candidateIds),
                    });

                    const detailedCandidates = await detailedResponse.json();
                    setFilteredCandidates(detailedCandidates);
                    setIsSearching(true);
                } else {
                    setFilteredCandidates([]);
                    setIsSearching(true);
                }
            } catch (error) {
                console.error('Error searching candidates:', error);
            }
        }
    };


    const toggleSave = (id) => {
        setCandidates((prevCandidates) =>
            prevCandidates.map((candidate) =>
                candidate.id === id ? { ...candidate, isSaved: !candidate.isSaved } : candidate
            )
        );
    };

    const displayCandidates = isSearching ? filteredCandidates : candidates;

    return (
        <main className="bg-gray-100 min-h-screen">
            <section className="bg-blue-600 py-20">
                <div className="container mx-auto text-center text-white">
                    <h1 className="text-5xl font-bold">Find Your Talent Candidates</h1>
                    <SearchCandidateBar onSearch={handleSearch} />
                </div>
            </section>

            <div className="mt-6 space-y-6 text-black pr-20 pl-20">
                {displayCandidates.length === 0 ? (
                    <p className="text-center text-gray-500">No candidates found</p>
                ) : (
                    displayCandidates.map((candidate) => (
                        <div
                            key={candidate.id}
                            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
                        >
                            <div>
                                <h2 className="text-lg font-semibold">{candidate.fullname}</h2>
                                <p className="text-sm text-gray-500">{candidate.email}</p>
                                <p className="text-sm text-gray-500">{candidate.phoneNumber}</p>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={() => window.open(candidate.fileCV, '_blank')}
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
