"use client";

import CustomTopBar from '@/app/common/customtopbar';
import Footer from '@/app/common/footer';
import SearchBar from '@/app/common/searchbar';
import FindingJobList from '@/app/findingjoblist';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function JobPage() {
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const results = localStorage.getItem('searchResults');
        if (results) {
            setSearchResults(JSON.parse(results)); // Retrieve search results from localStorage
            setSearchMode(true); // Switch to search mode
        }
        setLoading(false); // Set loading to false after fetching results
    }, []);

    const handleSearch = (searchQuery) => {
        // Construct the query parameters from the search query
        const { keyword, province, categoryId } = searchQuery;
        let queryParams = `?keyword=${keyword || ''}`;

        if (province) {
            queryParams += `&province=${province}`;
        }
        if (categoryId) {
            queryParams += `&categoryId=${categoryId}`;
        }

        // Fetch the search results
        fetch(`http://localhost:8080/api/job/search${queryParams}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then((data) => {
                setSearchResults(data);
                setSearchMode(true); // Switch to search mode
                localStorage.setItem('searchResults', JSON.stringify(data)); // Store search results
            })
            .catch((error) => {
                console.error('Error fetching search results:', error);
                setSearchResults([]); // Clear results on error
                setSearchMode(false); // Switch back to default mode
            });
    };

    return (
        <>
            <CustomTopBar />
            <Head>
                <title>Job Seeker and Hiring Website</title>
                <meta name="description" content="Find or post job opportunities with ease" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="bg-gray-100 min-h-screen">
                <section className="bg-blue-600 py-20">
                    <div className="container mx-auto text-center text-white">
                        <h1 className="text-5xl font-bold">Find Your Dream Job or Hire Top Talent</h1>
                        <p className="text-xl mt-4">
                            Explore thousands of job listings or post opportunities to find the best candidates.
                        </p>
                        <SearchBar onSearch={handleSearch} />
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
                    </div>
                ) : searchMode ? (
                    <FindingJobList jobs={searchResults} />
                ) : (
                    <div className="flex justify-center items-center py-8">
                        <p className="ml-4 text-lg text-black">No search results found.</p>
                    </div>
                )}
                <Footer />
            </main>
        </>
    );
}
