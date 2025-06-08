"use client";

import Footer from "@/app/common/footer";
import RecruiterCustomTopBar from "@/app/common/recruitercustomtopbar";
import Head from "next/head";
import CandidatesList from "../candidatelist";
import ClientOnly from "@/components/ClientOnly";

export default function Home() {
    return (
        <>
            <RecruiterCustomTopBar />
            <Head>
                <title>Recruiter Dashboard</title>
                <meta name="description" content="Manage job postings and candidates" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <ClientOnly>
                <CandidatesList />
            </ClientOnly>

            <Footer />
        </>
    );
}
