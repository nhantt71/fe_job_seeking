'use client'

import { useEffect, useState } from 'react';
import CustomTopBar from '../common/customtopbar';
import Footer from '../common/footer';
import CompanyList from './companylist';
import SearchCompanyBar from './searchcompanybar';
import { FiSearch, FiChevronLeft, FiChevronRight, FiAlertCircle, Frown } from 'react-icons/fi';
import { FaBuilding, FaRegSadTear } from 'react-icons/fa';
import ClientOnly from '@/components/ClientOnly';

function Home() {
    const [companies, setCompanies] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const companiesPerPage = 15;

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/company');
                if (!response.ok) {
                    throw new Error('Failed to fetch companies');
                }
                const data = await response.json();
                setCompanies(data);
                setError(null);
            } catch (err) {
                setError('Failed to load companies. Please try again later.');
                console.error('Error fetching companies:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleSearch = async (searchQuery) => {
        try {
            setIsSearching(true);
            setError(null);
            setSearchKeyword(searchQuery.keyword);
            
            if (!searchQuery.keyword.trim()) {
                setSearchResults(companies);
                setCurrentPage(1);
                setIsSearching(false);
                return;
            }
            
            const response = await fetch(`/api/company/search?keyword=${encodeURIComponent(searchQuery.keyword)}`);
            if (!response.ok) {
                throw new Error('Failed to search companies');
            }
            
            const data = await response.json();
            setSearchResults(data || []);
            setCurrentPage(1);
        } catch (err) {
            setError('Failed to search companies. Please try again.');
            console.error('Error searching companies:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchResults([]);
        setIsSearching(false);
        setSearchKeyword('');
        setCurrentPage(1);
    };

    // Calculate pagination
    const displayedCompanies = searchKeyword ? searchResults : companies;
    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    const currentCompanies = displayedCompanies.slice(indexOfFirstCompany, indexOfLastCompany);
    const totalPages = Math.ceil(displayedCompanies.length / companiesPerPage);

    const handleNextPage = () => {
        if (indexOfLastCompany < displayedCompanies.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <>
            <CustomTopBar />
            <ClientOnly>
                <main className="bg-gradient-to-b from-blue-50 to-gray-50 min-h-screen">
                    {/* Hero Section */}
                    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-20 overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat"></div>
                        </div>
                        <div className="container mx-auto px-4 text-center relative z-10">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Discover Amazing Companies
                            </h1>
                            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                                Explore our curated collection of {companies.length}+ top companies across various industries
                            </p>
                            
                            <div className="max-w-2xl mx-auto mt-8">
                                <SearchCompanyBar 
                                    onSearch={handleSearch} 
                                    onClear={handleClearSearch}
                                    isLoading={isLoading || isSearching}
                                    initialKeyword={searchKeyword}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Main Content */}
                    <div className="container mx-auto px-4 py-12">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <FiAlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                                <p className="text-gray-600">Loading companies...</p>
                            </div>
                        ) : (
                            <>
                                {/* Search Results Header */}
                                {searchKeyword && (
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-semibold text-gray-800">
                                            {searchResults.length > 0 ? (
                                                <>
                                                    <FiSearch className="inline mr-2" />
                                                    {searchResults.length} results for "{searchKeyword}"
                                                </>
                                            ) : (
                                                <>
                                                    <FaRegSadTear className="inline mr-2" />
                                                    No results found for "{searchKeyword}"
                                                </>
                                            )}
                                        </h2>
                                        <button
                                            onClick={handleClearSearch}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                )}

                                {/* No Results State */}
                                {searchKeyword && searchResults.length === 0 && !isLoading && (
                                    <div className="text-center py-16">
                                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                            <FiSearch className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            We couldn't find any companies matching "{searchKeyword}". Try different keywords or browse all companies.
                                        </p>
                                    </div>
                                )}

                                {/* Company Grid */}
                                {currentCompanies.length > 0 && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {currentCompanies.map((company) => (
                                                <CompanyList 
                                                    key={company.id} 
                                                    company={company}
                                                    isSearchResult={!!searchKeyword}
                                                />
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {displayedCompanies.length > companiesPerPage && (
                                            <div className="flex items-center justify-between mt-12 border-t border-gray-200 pt-6">
                                                <button
                                                    onClick={handlePreviousPage}
                                                    disabled={currentPage === 1}
                                                    className={`inline-flex items-center px-4 py-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                                                >
                                                    <FiChevronLeft className="mr-2" />
                                                    Previous
                                                </button>
                                                
                                                <div className="hidden md:flex items-center space-x-2">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                        <button
                                                            key={page}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                        >
                                                            {page}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="md:hidden text-sm text-gray-600">
                                                    Page {currentPage} of {totalPages}
                                                </div>
                                                
                                                <button
                                                    onClick={handleNextPage}
                                                    disabled={indexOfLastCompany >= displayedCompanies.length}
                                                    className={`inline-flex items-center px-4 py-2 rounded-md ${indexOfLastCompany >= displayedCompanies.length ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                                                >
                                                    Next
                                                    <FiChevronRight className="ml-2" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Initial Empty State (shouldn't normally show) */}
                                {!searchKeyword && currentCompanies.length === 0 && !isLoading && (
                                    <div className="text-center py-16">
                                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                            <FaBuilding className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No companies available</h3>
                                        <p className="text-gray-500">
                                            We couldn't find any companies to display. Please check back later.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </ClientOnly>
            <Footer />
        </>
    );
}

export default Home;