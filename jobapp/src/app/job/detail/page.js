"use client";
import CustomTopBar from '@/app/common/customtopbar';
import Footer from '@/app/common/footer';
import SearchBar from '@/app/common/searchbar';
import FindingJobList from '@/app/findingjoblist';
import JobDetail from '@/app/jobdetail';
import RelatedJob from '@/app/relatedjob';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {

    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState(false);
    const [page, setPage] = useState(0);
    const categoriesPerPage = 8;
    const startIdx = page * categoriesPerPage;
    const [relatedJobs, setRelatedJobs] = useState([]);


    useEffect(() => {
        fetch('http://localhost:8080/api/category/get-job-amount')
            .then(res => res.json())
            .then(data => {
                const filteredData = data.filter(category => category.jobs > 0);
                setCategories(filteredData);
            })
            .finally(() => setLoading(false));
    }, [])


    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 20;

    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;


    const handleSearch = (searchQuery) => {
        fetch(`http://localhost:8080/api/job/search?keyword=${searchQuery.keyword}`)
            .then(res => res.json())
            .then(data => {
                setSearchResults(data);
                setSearchMode(true);
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

                {searchMode ? (
                    <>
                        <FindingJobList jobs={searchResults} />
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
                                <div className="max-w-7xl mx-auto p-6 text-black">
                                    <h1 className="text-3xl font-bold mb-6 text-black-700 text-black">Việc làm liên quan</h1>
                                    <RelatedJob jobs={relatedJobs} />
                                </div>
                                <Footer />
                            </>
                        )}
                    </>
                )}

            </main>
        </>
    );
}