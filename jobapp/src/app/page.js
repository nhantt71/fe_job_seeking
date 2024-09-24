import Head from 'next/head';
import CustomTopBar from './customtopbar';
import Footer from './footer';
import JobList from './joblist';
import SearchBar from './searchbar';

export default function Home() {
  return (
    <>
      <CustomTopBar />
      <Head>
        <title>Job Seeker and Hiring Website</title>
        <meta name="description" content="Find or post job opportunities with ease" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-gray-100 min-h-screen">
        {/* Hero Section */}
        <section className="bg-blue-600 py-20">
          <div className="container mx-auto text-center text-white">
            <h1 className="text-5xl font-bold">Find Your Dream Job or Hire Top Talent</h1>
            <p className="text-xl mt-4">
              Explore thousands of job listings or post opportunities to find the best candidates.
            </p>
            {/* Search Form */}
            <SearchBar />
          </div>
        </section>

        <JobList/>
        {/* Job Categories */}
        <section className="py-16">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold">Job Categories</h2>
            <p className="mt-2 text-gray-700">Browse by popular categories</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
                <h3 className="text-lg font-semibold">Software Development</h3>
                <p className="text-sm text-gray-500">1123 Jobs Available</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
                <h3 className="text-lg font-semibold">Design &amp; Creative</h3>
                <p className="text-sm text-gray-500">742 Jobs Available</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
                <h3 className="text-lg font-semibold">Marketing</h3>
                <p className="text-sm text-gray-500">560 Jobs Available</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
                <h3 className="text-lg font-semibold">Customer Support</h3>
                <p className="text-sm text-gray-500">318 Jobs Available</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold">Featured Jobs</h2>
            <p className="mt-2 text-gray-700">Check out the latest job postings</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
                <h3 className="text-lg font-semibold">Frontend Developer</h3>
                <p className="text-sm text-gray-500">Google Inc. - Remote</p>
                <p className="mt-4 text-gray-700">$80,000 - $100,000/year</p>
                <a href="#" className="block mt-4 text-blue-500 font-semibold">
                  View Details
                </a>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
                <h3 className="text-lg font-semibold">UI/UX Designer</h3>
                <p className="text-sm text-gray-500">Apple Inc. - California, USA</p>
                <p className="mt-4 text-gray-700">$90,000 - $120,000/year</p>
                <a href="#" className="block mt-4 text-blue-500 font-semibold">
                  View Details
                </a>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
                <h3 className="text-lg font-semibold">Marketing Manager</h3>
                <p className="text-sm text-gray-500">Amazon - Seattle, USA</p>
                <p className="mt-4 text-gray-700">$70,000 - $90,000/year</p>
                <a href="#" className="block mt-4 text-blue-500 font-semibold">
                  View Details
                </a>
              </div>
            </div>
          </div>
        </section>
        <Footer/>
      </main>
    </>
  );
}