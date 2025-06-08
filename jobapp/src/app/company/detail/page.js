'use client';

import CustomTopBar from '@/app/common/customtopbar';
import Footer from '@/app/common/footer';
import SearchCompanyBar from '../searchcompanybar';
import { useEffect, useState } from 'react';
import CompanyDetail from './companydetail';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');

    const handleSearch = async (searchQuery) => {
        try {
            setIsSearching(true);
            setError(null);
            setSearchKeyword(searchQuery.keyword);

            // Update URL with search keyword
            if (searchQuery.keyword.trim()) {
                router.push(`/company?keyword=${encodeURIComponent(searchQuery.keyword)}`);
            } else {
                router.push('/company');
            }

            // Fetch companies based on search
            const url = searchQuery.keyword.trim()
                ? `/api/company/search?keyword=${encodeURIComponent(searchQuery.keyword)}`
                : '/api/company/get-all-companies';

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to search companies');
            }

            const data = await response.json();
            setSearchResults(data || []);
        } catch (err) {
            setError('Failed to search companies. Please try again.');
            console.error('Error searching companies:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        // Clear URL parameter
        router.push('/company');

        // Fetch all companies
        fetch('/api/company/get-all-companies')
            .then(res => res.json())
            .then(data => setSearchResults(data || []))
            .catch(err => {
                console.error('Error fetching companies:', err);
                setSearchResults([]);
            });
    };

    return (
        <>
            <CustomTopBar />
            <main className="bg-gray-100 min-h-screen">
                <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-20 overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat"></div>
                    </div>
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Discover Amazing Companies
                        </h1>
                        <div className="max-w-2xl mx-auto mt-8">
                            <SearchCompanyBar
                                onSearch={handleSearch}
                                onClear={handleClearSearch}
                                initialKeyword={searchKeyword}
                            />
                        </div>
                    </div>
                </section>
                <CompanyDetail />
            </main>
            <Footer />
        </>
    );
}
