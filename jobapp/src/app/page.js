"use client";
import Head from 'next/head';
import { useEffect, useState } from 'react';
import CustomTopBar from './customtopbar';
import FeaturedJob from './featuredjob';
import Footer from './footer';
import JobList from './joblist';
import SearchBar from './searchbar';

export default function Home() {

  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('http://localhost:8080/api/category/get-job-amount')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);

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
            <SearchBar />
          </div>
        </section>

        <JobList />

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-black">Top ngành nghề nổi bật</h1>
          <div className="grid grid-cols-4 gap-4">
            {currentItems.map((cate) => (
              <FeaturedJob key={cate.name} {...cate} />
            ))}
          </div>

          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              className={`rounded-full p-2 ${currentPage === 1 ? 'bg-gray-200' : 'bg-green-500'} text-white`}
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              &#8249;
            </button>

            <span className="text-black font-medium">Trang {currentPage} / {totalPages}</span>

            <button
              className={`rounded-full p-2 ${currentPage === totalPages ? 'bg-gray-200' : 'bg-green-500'} text-white`}
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              &#8250;
            </button>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}