"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomTopBar from './common/customtopbar';
import Footer from './common/footer';
import SearchBar from './common/searchbar';
import FeaturedCompanies from './featuredcompany';
import FeaturedJobs from './featuredjob';
import JobList from './joblist';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [page, setPage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const categoriesPerPage = 8;
  const startIdx = page * categoriesPerPage;
  const paginatedCategories = categories.slice(startIdx, startIdx + categoriesPerPage);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetch('/api/category/get-job-amount')
      .then(res => res.json())
      .then(data => {
        const filteredData = data.filter(category => category.jobs > 0);
        setCategories(filteredData);
      })
      .finally(() => setLoading(false));

    fetch('/api/job')
      .then(res => res.json())
      .then(data => setJobs(data));
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
    const params = new URLSearchParams();

    if (keyword) {
      params.append('keyword', keyword);
    }
    if (province) {
      params.append('province', province);
    }
    if (categoryId) {
      params.append('categoryId', categoryId);
    }

    const queryString = params.toString();
    const queryParams = queryString ? `?${queryString}` : '';

    fetch(`/api/job/search${queryParams}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        if (data.length === 0) {
          alert('No jobs found for your search criteria.');
          setSearchMode(false);
        } else {
          localStorage.setItem('searchResults', JSON.stringify(data));
          setSearchMode(true);
          router.push('/job');
        }
      })
      .catch(error => {
        console.error('Error fetching search results:', error);
        alert('An error occurred while fetching search results. Please try again later.');
      });
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <CustomTopBar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
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

        <AnimatePresence>
          {searchMode ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-lg text-gray-700">Finding the perfect jobs for you...</p>
              </div>
            </motion.div>
          ) : (
            <>
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center py-20"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg text-gray-700">Loading opportunities...</p>
                  </div>
                </motion.div>
              ) : (
                <div className="container mx-auto px-6 py-12">
                  {/* Featured Jobs Section */}
                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-20"
                  >
                    <JobList jobs={jobs} />
                  </motion.section>

                  {/* Categories Section */}
                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-20"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore Top Categories</h2>
                        <p className="text-gray-600">Browse jobs by popular categories</p>
                      </div>
                      <div className="flex space-x-3 mt-4 md:mt-0">
                        <button
                          onClick={handlePrev}
                          disabled={page === 0}
                          className={`p-3 rounded-full shadow-sm ${page === 0 ? 'bg-gray-200 text-gray-400' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={startIdx + categoriesPerPage >= categories.length}
                          className={`p-3 rounded-full shadow-sm ${startIdx + categoriesPerPage >= categories.length ? 'bg-gray-200 text-gray-400' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {paginatedCategories.map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <FeaturedJobs
                            categoryId={category.id}
                            icon={category.icon}
                            name={category.name}
                            jobCount={category.jobs}
                            onCategoryClick={() => handleSearch({ categoryId: category.id })}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>

                  {/* Featured Companies Section */}
                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-20"
                  >
                    <FeaturedCompanies />
                  </motion.section>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}