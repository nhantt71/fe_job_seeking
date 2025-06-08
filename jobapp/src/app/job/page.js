"use client";

import CustomTopBar from '@/app/common/customtopbar';
import Footer from '@/app/common/footer';
import SearchBar from '@/app/common/searchbar';
import FindingJobList from '@/app/findingjoblist';
import { fetchWithoutAuth } from '@/app/utils/api';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
export default function JobPage() {
    const searchParams = useSearchParams();
    const cateId = searchParams.get('cateId');
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [lastSearchQuery, setLastSearchQuery] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [mounted, setMounted] = useState(false);

    // Load initial state from localStorage
    useEffect(() => {
        setMounted(true);
        try {
            const savedState = localStorage.getItem('jobSearchState');
            if (savedState) {
                const { results, query } = JSON.parse(savedState);
                setSearchResults(results);
                setLastSearchQuery(query);
                setSearchMode(true);
            }
        } catch (error) {
            console.error('Error loading saved search state:', error);
            localStorage.removeItem('jobSearchState');
        } finally {
            setLoading(false);
        }
    }, []);

    // Save search state to localStorage whenever it changes
    useEffect(() => {
        if (searchMode && searchResults.length > 0) {
            const searchState = {
                results: searchResults,
                query: lastSearchQuery,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('jobSearchState', JSON.stringify(searchState));
        }
    }, [searchResults, searchMode, lastSearchQuery]);

    const handleSearch = async (searchQuery) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (searchQuery.keyword) params.append('keyword', searchQuery.keyword);
            if (searchQuery.province) params.append('province', searchQuery.province);
            if (searchQuery.categoryId) params.append('categoryId', searchQuery.categoryId);

            console.log('JobPage - Final API URL:', `/api/job/search?${params.toString()}`);

            // Fetch the search results using our utility function
            const data = await fetchWithoutAuth(`/api/job/search?${params.toString()}`);

            console.log('JobPage - API Response:', data);

            // Always set search mode and last query
            setLastSearchQuery(searchQuery);
            setSearchMode(true);

            // Set results (will be empty array if no results or error)
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error fetching search results:', error);
            if (error.message.includes('Failed to fetch')) {
                setError('Unable to connect to the server. Please check your internet connection and try again.');
            } else if (error.message.includes('Server returned')) {
                setError('Server error: ' + error.message);
            } else {
                setError('An error occurred while searching. Please try again.');
            }
            setSearchResults([]);
            setSearchMode(false);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return null; // Return null on server-side and first render
    }

    return (
        <div className="flex flex-col min-h-screen">
            <CustomTopBar />
            <Head>
                <title>Job Seeker and Hiring Website</title>
                <meta name="description" content="Find or post job opportunities with ease" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="flex-1 bg-gray-100 min-h-[2000px] pb-80">
                <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-24 overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat"></div>
                    </div>
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-5xl font-bold text-white mb-6 leading-tight"
                        >
                            Find Your <span className="text-yellow-300">Dream Job</span> or <br />
                            Hire Top <span className="text-yellow-300">Talent</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-blue-100 max-w-2xl mx-auto mb-10"
                        >
                            Discover thousands of job opportunities or post your openings to find the perfect candidates for your team.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="max-w-6xl mx-auto"
                        >
                            <SearchBar
                                onSearch={handleSearch}
                                initialValues={{ categoryId: cateId || '' }}
                            />
                        </motion.div>
                    </div>
                </section>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-indigo-100"></div>
                            <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-indigo-600 font-medium">Finding your dream jobs...</p>
                        <p className="text-gray-500 text-sm">This may take a few moments</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-red-50 rounded-xl max-w-md mx-auto">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : searchMode ? (
                    searchResults.length > 0 ? (
                        <FindingJobList jobs={searchResults} />
                    ) : (
                        <div className="max-w-2xl mx-auto px-4 py-12">
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
                                <div className="mx-auto h-40 w-40 flex items-center justify-center bg-indigo-50 rounded-full mb-6">
                                    <svg className="h-20 w-20 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-3">No jobs found</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    We couldn't find any jobs matching your search criteria. Try adjusting your filters or search terms.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-3">
                                    <button
                                        onClick={() => setSearchMode(false)}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        Clear Search
                                    </button>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                                    >
                                        Try Different Keywords
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="max-w-2xl mx-auto px-4 py-12">
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm p-8 text-center border border-indigo-100">
                            <div className="mx-auto h-40 w-40 flex items-center justify-center bg-white rounded-full mb-6 shadow-md">
                                <svg className="h-20 w-20 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Find Your Dream Job</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Start by entering keywords, location, or other filters to discover amazing opportunities tailored for you.
                            </p>
                            <button
                                onClick={() => setSearchMode(true)}
                                className="px-8 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center mx-auto gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Start Searching
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
