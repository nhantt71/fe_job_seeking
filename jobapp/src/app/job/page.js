"use client";

import Head from 'next/head';
import { useRouter } from 'next/navigation'; // Vẫn sử dụng 'next/navigation'
import { useEffect, useState } from 'react';
import CustomTopBar from '../common/customtopbar';
import Footer from '../common/footer';
import SearchBar from '../common/searchbar';
import FindingJobList from '../findingjoblist';

export default function Home() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetch('http://localhost:8080/api/category/get-job-amount')
            .then(res => res.json())
            .then(data => {
                const filteredData = data.filter(category => category.jobs > 0);
                setCategories(filteredData);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        // Khi trang được load, kiểm tra và lấy dữ liệu từ localStorage nếu có
        const storedResults = localStorage.getItem('searchResults');
        if (storedResults) {
            setSearchResults(JSON.parse(storedResults));
        }
    }, []);

    const handleSearch = (searchQuery) => {
        fetch(`http://localhost:8080/api/job/search?keyword=${searchQuery.keyword}`)
            .then(res => res.json())
            .then(data => {
                setSearchResults(data);
                localStorage.setItem('searchResults', JSON.stringify(data));
                router.push('/job');
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

                {searchResults.length > 0 ? (
                    <>
                        <FindingJobList jobs={searchResults} />
                        <Footer />
                    </>
                ) : (
                    <>
                        <p>No jobs found</p>
                        <Footer />
                    </>
                )}
            </main>
        </>
    );
}
