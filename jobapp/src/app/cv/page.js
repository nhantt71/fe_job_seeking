"use client";

import Head from 'next/head';
import dynamic from 'next/dynamic';
import CustomTopBar from '../common/customtopbar';
import Footer from '../common/footer';

// Dynamically import CVManager with SSR disabled
const CVManager = dynamic(() => import('./cv'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
                <div className="w-28 h-28 border-[6px] border-opacity-20 border-blue-300 rounded-full"></div>
                <div className="absolute top-0 left-0 w-28 h-28 border-[6px] border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-2xl font-semibold text-gray-800">Preparing Your CV Studio</p>
                <p className="text-blue-500 flex items-center justify-center space-x-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-current animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="inline-block h-2 w-2 rounded-full bg-current animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="inline-block h-2 w-2 rounded-full bg-current animate-bounce" style={{animationDelay: '300ms'}}></span>
                </p>
            </div>
        </div>
    )
});

export default function Home() {
    return (
        <>
            <CustomTopBar />
            <Head>
                <title>TalentHub | Professional CV Management</title>
                <meta name="description" content="Create, manage and perfect your professional CV for your dream job" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="theme-color" content="#3b82f6" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-20">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute left-20 bottom-0 w-96 h-96 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center mb-6">
                            <span className="relative flex h-16 w-16">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-16 w-16 bg-blue-500 items-center justify-center text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </span>
                            </span>
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Elevate Your Career
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Craft a stunning CV that gets you noticed by top employers
                        </p>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                            <h2 className="text-2xl font-bold flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                CV Studio
                            </h2>
                            <p className="opacity-90">Your professional profile builder</p>
                        </div>
                        <CVManager />
                    </div>
                </div>
                <Footer />
            </main>
        </>
    );
}