'use-client';

import CustomTopBar from '@/app/common/customtopbar';
import Footer from '@/app/common/footer';
import SearchBar from '@/app/common/searchbar';
import FindingJobList from '@/app/findingjoblist';
import JobDetail from '@/app/job/detail/jobdetail';
import RelatedJob from '@/app/relatedjob';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState(false);
    const [page, setPage] = useState(0);
    const [relatedJobs, setRelatedJobs] = useState([]);
    const [showApplyDialog, setShowApplyDialog] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // Fetch các danh mục công việc từ API
    useEffect(() => {
        fetch('http://localhost:8080/api/category/get-job-amount')
            .then((res) => res.json())
            .then((data) => {
                const filteredData = data.filter((category) => category.jobs > 0);
                setCategories(filteredData);
            })
            .finally(() => setLoading(false));
    }, []);

    // Xử lý khi người dùng tìm kiếm công việc
    const handleSearch = (searchQuery) => {
        fetch(`http://localhost:8080/api/job/search?keyword=${searchQuery.keyword}`)
            .then((res) => res.json())
            .then((data) => {
                setSearchResults(data);
                setSearchMode(true);
            });
    };

    const handleApplyClick = () => {
        setShowApplyDialog(true);
    };

    
    const closeDialog = () => {
        setShowApplyDialog(false);
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
                                <JobDetail onApply={handleApplyClick} />
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
            {showApplyDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center text-black">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h2 className="text-lg font-bold mb-4">Ứng tuyển cho công việc</h2>

                        <p>Chọn CV để ứng tuyển:</p>
                        <div className="mb-4">
                            <button className="bg-blue-500 text-white py-2 px-4 rounded-md w-full mb-2">Chọn CV</button>
                            <button className="bg-gray-500 text-white py-2 px-4 rounded-md w-full">Tải CV lên</button>
                        </div>

                        <textarea
                            placeholder="Thư tự giới thiệu"
                            className="w-full h-32 border p-2 mb-4"
                        ></textarea>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeDialog}
                                className="bg-gray-500 text-white py-2 px-4 rounded-md"
                            >
                                Hủy
                            </button>
                            <button className="bg-green-500 text-white py-2 px-4 rounded-md">Ứng tuyển</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
