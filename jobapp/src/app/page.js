"use client";
import Head from 'next/head';
import { useEffect, useState } from 'react';
import CustomTopBar from './common/customtopbar';
import Footer from './common/footer';
import FeaturedCompanies from './featuredcompany';
import FeaturedJobs from './featuredjob';
import FindingJobList from './findingjoblist';
import JobList from './joblist';
import SearchBar from './searchbar';

export default function Home() {

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [page, setPage] = useState(0);
  const categoriesPerPage = 8;
  const startIdx = page * categoriesPerPage;
  const paginatedCategories = categories.slice(startIdx, startIdx + categoriesPerPage);


  useEffect(() => {
    fetch('http://localhost:8080/api/category/get-job-amount')
      .then(res => res.json())
      .then(data => {
        const filteredData = data.filter(category => category.jobs > 0);
        setCategories(filteredData);
      })
      .finally(() => setLoading(false));
  }, [])


  const handlePrev = () => {
    setPage((prev) => (prev > 0 ? prev - 1 : prev));
  };


  const handleNext = () => {
    const maxPages = Math.ceil(categories.length / categoriesPerPage);
    setPage((prev) => (prev < maxPages - 1 ? prev + 1 : prev));
  };


  const [findingJobs, setFindingJobs] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 20;

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = findingJobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(findingJobs.length / jobsPerPage);
  const [searchResults, setSearchResults] = useState([]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


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
                <JobList />

                <div className="mt-4 container mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-black">Top ngành nghề nổi bật</h1>
                    <div className="flex space-x-4">
                      <button
                        onClick={handlePrev}
                        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                        disabled={page === 0}
                      >
                        ⬅️
                      </button>
                      <button
                        onClick={handleNext}
                        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                        disabled={startIdx + categoriesPerPage >= categories.length}
                      >
                        ➡️
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {paginatedCategories.map((category) => (
                      <FeaturedJobs
                        key={category.id}
                        icon={category.icon}
                        name={category.name}
                        jobCount={category.jobs}
                      />
                    ))}
                  </div>
                </div>
                <FeaturedCompanies />

                <Footer />
              </>
            )}
          </>
        )}

      </main>
    </>
  );
}