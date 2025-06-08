'use client';


import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomTopBar from '../common/customtopbar';
import Footer from '../common/footer';
import JobRecommendation from './jobrecommendation';
import Head from 'next/head';
import SearchBar from '../common/searchbar';
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
                            <SearchBar onSearch={handleSearch} />
                        </motion.div>
                    </div>
                </section>
                <JobRecommendation />
            </main>
            <Footer />
        </>
    );
}
