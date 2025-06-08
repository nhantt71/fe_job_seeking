"use client";
import Head from 'next/head';
import { useState } from 'react';
import CustomTopBar from '../common/customtopbar';
import Footer from '../common/footer';
import YourProfile from './yourprofile';
import { SafeDiv, SafeMain } from '../components/SafeComponents';

export default function Home() {
    const [loading, setLoading] = useState(false);

    return (
        <>
            <CustomTopBar />
            <Head>
                <title>TalentHive | Where Opportunities Meet Talent</title>
                <meta name="description" content="Find your dream job or the perfect candidate with our seamless platform" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <SafeMain className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen pt-20">
                {loading ? (
                    <SafeDiv className="flex flex-col justify-center items-center min-h-[70vh]">
                        <SafeDiv className="relative">
                            <SafeDiv className="w-32 h-32 border-8 border-indigo-100 rounded-full"></SafeDiv>
                            <SafeDiv className="absolute top-0 left-0 w-32 h-32 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin"></SafeDiv>
                        </SafeDiv>
                        <p className="mt-6 text-lg font-medium text-indigo-600 animate-pulse">Preparing your dashboard...</p>
                    </SafeDiv>
                ) : (
                    <SafeDiv className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Hero Section */}
                        <SafeDiv className="text-center py-12 md:py-16">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Welcome to <span className="text-indigo-600">TalentHive</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Where exceptional talent meets life-changing opportunities
                            </p>
                        </SafeDiv>

                        {/* Main Content */}
                        <SafeDiv className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
                            <SafeDiv className="p-6 sm:p-8">
                                <SafeDiv className="flex items-center mb-6">
                                    <SafeDiv className="p-3 rounded-lg bg-indigo-100 text-indigo-600 mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </SafeDiv>
                                    <h2 className="text-2xl font-bold text-gray-800">Your Professional Profile</h2>
                                </SafeDiv>
                                <YourProfile />
                            </SafeDiv>
                        </SafeDiv>

                        {/* Stats Section */}
                        <SafeDiv className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <SafeDiv className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                <SafeDiv className="text-indigo-600 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </SafeDiv>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">10,000+ Jobs</h3>
                                <p className="text-gray-600">Find your perfect opportunity from our extensive listings</p>
                            </SafeDiv>
                            <SafeDiv className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                <SafeDiv className="text-indigo-600 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </SafeDiv>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">50,000+ Professionals</h3>
                                <p className="text-gray-600">Connect with top talent across various industries</p>
                            </SafeDiv>
                            <SafeDiv className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                <SafeDiv className="text-indigo-600 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </SafeDiv>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">95% Success Rate</h3>
                                <p className="text-gray-600">Our matching algorithm ensures high-quality connections</p>
                            </SafeDiv>
                        </SafeDiv>
                    </SafeDiv>
                )}
                <Footer />
            </SafeMain>
        </>
    );
}