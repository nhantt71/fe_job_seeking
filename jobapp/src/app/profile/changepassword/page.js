"use client";
import CustomTopBar from '@/app/common/customtopbar';
import Footer from '@/app/common/footer';
import Head from 'next/head';
import { useState } from 'react';
import ChangePassword from './changepassword';

export default function Home() {
    const [loading, setLoading] = useState(false);

    return (
        <>
            <CustomTopBar />
            <Head>
                <title>Secure Your Account | TalentConnect</title>
                <meta name="description" content="Update your password securely to protect your account" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen pt-20">
                {loading ? (
                    <div className="flex flex-col justify-center items-center min-h-[70vh]">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-6 text-lg font-medium text-blue-600 animate-pulse">Securing your account...</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Account Security
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Update your password to keep your account protected
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-8 sm:p-10">
                                <div className="flex items-center mb-8">
                                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
                                        <p className="text-gray-600">Create a strong, unique password</p>
                                    </div>
                                </div>
                                
                                <ChangePassword />
                            </div>
                        </div>
                        <Footer />
                    </div>
                )}
            </main>
        </>
    );
}