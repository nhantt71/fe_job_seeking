"use client";

import Footer from "@/app/common/footer";
import RecruiterCustomTopBar from "@/app/common/recruitercustomtopbar";
import Head from "next/head";
import CandidateRecommendation from "./candidaterecommendation";

export default function Home() {
    return (
        <>
            <RecruiterCustomTopBar />
            <Head>
                <title>Recruiter Dashboard</title>
                <meta name="description" content="Manage job postings and candidates" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main suppressHydrationWarning className="bg-gray-100 min-h-screen pt-20">
                <CandidateRecommendation/>
            </main>
            <Footer />
        </>
    );
}
