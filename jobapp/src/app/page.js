// app/page.js

"use client";

import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CustomTopBar from './common/customtopbar';
import Footer from './common/footer';
import SearchBar from './common/searchbar';
import FeaturedCompanies from './featuredcompany';
import FeaturedJobs from './featuredjob';
import JobList from './joblist';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [page, setPage] = useState(0);
  const categoriesPerPage = 8;
  const startIdx = page * categoriesPerPage;
  const paginatedCategories = categories.slice(startIdx, startIdx + categoriesPerPage);

  const router = useRouter();

  useEffect(() => {
    fetch('/api/category/get-job-amount')
      .then(res => res.json())
      .then(data => {
        const filteredData = data.filter(category => category.jobs > 0);
        setCategories(filteredData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePrev = () => {
    setPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    const maxPages = Math.ceil(categories.length / categoriesPerPage);
    setPage((prev) => (prev < maxPages - 1 ? prev + 1 : prev));
  };

  const handleSearch = (searchQuery) => {
    const { keyword, province, categoryId } = searchQuery;
    let queryParams = `?keyword=${keyword || ''}`;

    if (province) {
      queryParams += `&province=${province}`;
    }
    if (categoryId) {
      queryParams += `&categoryId=${categoryId}`;
    }

    fetch(`/api/job/search${queryParams}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        if (data.length === 0) {
          // Handle the case where no results are found
          alert('No jobs found for your search criteria.');
          setSearchMode(false); // Optionally reset to non-search mode
        } else {
          localStorage.setItem('searchResults', JSON.stringify(data)); // Store search results
          setSearchMode(true); // Switch to search mode
          router.push('/job'); // Navigate to the job results page
        }
      })
      .catch(error => {
        console.error('Error fetching search results:', error);
        alert('An error occurred while fetching search results. Please try again later.');
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
          <p className="text-lg text-center text-gray-700">Searching...</p>
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
                        categoryId={category.id}
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
