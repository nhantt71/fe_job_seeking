"use client";
import CustomTopBar from '@/app/common/customtopbar';
import Footer from '@/app/common/footer';
import Head from 'next/head';
import { useState } from 'react';
import AppliedJobs from './appliedjobs';

export default function Home() {
    const [loading, setLoading] = useState(false);

    return (
        <>
            <CustomTopBar />
            <Head>
                <title>Job Seeker and Hiring Website</title>
                <meta name="description" content="Find or post job opportunities with ease" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="bg-gray-100 min-h-screen pt-20">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
                        <p className="ml-4 text-lg text-black">Loading...</p>
                    </div>
                ) : (
                    <>
                        <AppliedJobs />
                        <Footer />
                    </>
                )}
            </main>
        </>
    );
}