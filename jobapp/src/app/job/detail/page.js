'use client';

import CustomTopBar from '@/app/common/customtopbar';
import Footer from '@/app/common/footer';
import SearchBar from '@/app/common/searchbar';
import FindingJobList from '@/app/findingjoblist';
import RelatedJob from '@/app/relatedjob';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import JobDetail from './jobdetail';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const searchParams = useSearchParams();
    const jobId = searchParams.get('id');
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        fetch('/api/category/get-job-amount')
            .then((res) => res.json())
            .then((data) => {
                const filteredData = data.filter((category) => category.jobs > 0);
                setCategories(filteredData);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        // Reset search state when job id changes
        setSearchMode(false);
        setSearchResults([]);
    }, [jobId]);

    useEffect(() => { setIsMounted(true); }, []);
    if (!isMounted) return null;

    const handleSearch = (searchQuery) => {
        // Redirect to the main job search page with the keyword
        router.push(`/job?${encodeURIComponent(searchQuery.keyword)}`);
    };

    // Only render the actual content on the client
    return (
        <>
            <CustomTopBar />
            <Head>
                <title>Job Seeker and Hiring Website</title>
                <meta name="description" content="Find or post job opportunities with ease" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="bg-gray-100 min-h-screen">
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
                            <SearchBar onSearch={handleSearch}/>
                        </motion.div>
                    </div>
                </section>

                {searchMode ? (
                    <>
                        <div className="flex justify-center relative pb-60">
                            <FindingJobList jobs={searchResults} />
                        </div>
                        <Footer />
                    </>
                ) : (
                    <>
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
                                <p className="ml-4 text-lg text-black">Loading...</p>
                            </div>
                        ) : (
                            <>
                                <JobDetail />
                                <RelatedJob />
                                <Footer />
                            </>
                        )}
                    </>
                )}

            </main>
        </>
    );
}
