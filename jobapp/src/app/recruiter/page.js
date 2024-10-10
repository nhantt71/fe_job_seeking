"use client";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import Head from "next/head";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import Footer from "../common/footer";
import RecruiterCustomTopBar from "../common/recruitercustomtopbar";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
    const [jobStats, setJobStats] = useState({
        published: 5,
        hidden: 2,
        membersPending: 3,
        candidatesSaved: 10,
    });

    const chartData = {
        labels: ['Published Jobs', 'Hidden Jobs', 'Members Pending', 'Saved Candidates'],
        datasets: [
            {
                label: 'Statistics',
                data: [jobStats.published, jobStats.hidden, jobStats.membersPending, jobStats.candidatesSaved],
                backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#FF5722'],
                borderColor: ['#388E3C', '#FFA000', '#1976D2', '#E64A19'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Recruitment Overview',
            },
        },
    };

    return (
        <>
            <RecruiterCustomTopBar />
            <Head>
                <title>Recruiter Dashboard</title>
                <meta name="description" content="Manage job postings and candidates" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="bg-gray-100 min-h-screen pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold text-gray-700 mb-6">Recruiter Dashboard</h1>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-600">Published Jobs</h2>
                            <p className="mt-2 text-3xl font-bold text-green-500">{jobStats.published}</p>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-600">Hidden Jobs</h2>
                            <p className="mt-2 text-3xl font-bold text-yellow-500">{jobStats.hidden}</p>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-600">Pending Members</h2>
                            <p className="mt-2 text-3xl font-bold text-blue-500">{jobStats.membersPending}</p>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-600">Saved Candidates</h2>
                            <p className="mt-2 text-3xl font-bold text-red-500">{jobStats.candidatesSaved}</p>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-600 mb-4">Recruitment Overview</h2>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
