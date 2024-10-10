"use client";

import Footer from "@/app/common/footer";
import RecruiterCustomTopBar from "@/app/common/recruitercustomtopbar";
import Head from "next/head";
import Profile from "../profile";

export default function Home() {


    return (
        <>
            <RecruiterCustomTopBar />
            <Head>
                <title>Recruiter Dashboard</title>
                <meta name="description" content="Manage job postings and candidates" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Profile />

            <Footer />
        </>
    );
}
