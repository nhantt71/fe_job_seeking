'use client'

import { useEffect, useState } from 'react';
import CustomTopBar from '../common/customtopbar';
import Footer from '../common/footer';
import CompanyList from './companylist';
import SearchCompanyBar from './searchcompanybar';

function Home() {
    const [companies, setCompanies] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const companiesPerPage = 15;

    useEffect(() => {
        const fetchCompanies = async () => {
            const response = await fetch('http://localhost:8080/api/company');
            const data = await response.json();
            setCompanies(data);
        };

        fetchCompanies();
    }, []);

    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    const currentCompanies = companies.slice(indexOfFirstCompany, indexOfLastCompany);

    const handleNextPage = () => {
        if (indexOfLastCompany < companies.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleSearch = (searchQuery) => {
        fetch(`http://localhost:8080/api/company/search?keyword=${searchQuery.keyword}`)
            .then(res => res.json())
            .then(data => {
                setSearchResults(data);
                setSearchMode(true);
            });
    };

    return (
        <>
            <CustomTopBar />

            <main className="bg-gray-100 min-h-screen">
                <section className="bg-blue-600 py-20">
                    <div className="container mx-auto text-center text-white">
                        <h1 className="text-5xl font-bold">Find A Company</h1>
                        <p className="text-xl mt-4">
                            More than 100 companies in this website
                        </p>
                        <SearchCompanyBar onSearch={handleSearch} />
                    </div>
                </section>
                <div className="container mx-auto px-4 mt-4">
                    <div className="grid grid-cols-3 gap-4">
                        {currentCompanies.map((company, index) => (
                            <CompanyList key={index} company={company} />
                        ))}
                    </div>

                    <div className="flex justify-between mt-4 mb-4">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={indexOfLastCompany >= companies.length}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                        >
                            Next
                        </button>
                    </div>
                </div>
                <Footer/>
            </main>
        </>
    );
}

export default Home;
