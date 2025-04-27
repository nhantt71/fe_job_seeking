"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import Head from "next/head";
import Link from "next/link";
import { useUserContext } from "../context/usercontext";
import Footer from "../common/footer";
import RecruiterCustomTopBar from "../common/recruitercustomtopbar";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
    const { email, account, role, setUserData } = useUserContext();
    const [jobStats, setJobStats] = useState({ published: 5, hidden: 2, candidatesSaved: 10 });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        fetch('/api/auth/current-user', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        })
        .then(res => {
            if (!res.ok) throw new Error('Token expired or invalid');
            return res.json();
        })
        .then(data => {
            setIsAuthenticated(data.authorities[0].authority === 'ROLE_RECRUITER');
        })
        .catch(() => {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    }, []);

    const chartData = {
        labels: ['Published Jobs', 'Hidden Jobs', 'Saved Candidates'],
        datasets: [
            {
                label: 'Recruitment Overview',
                data: [jobStats.published, jobStats.hidden, jobStats.candidatesSaved],
                backgroundColor: ['#4F46E5', '#F59E0B', '#10B981'],
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Recruitment Overview', font: { size: 18 } },
            tooltip: { mode: 'index', intersect: false },
        },
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
                    <p className="text-lg text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Recruiter Login Required</h2>
                    <p className="text-gray-500 mb-6">You need to login as a recruiter to access the dashboard.</p>
                    <Link href="/recruiter/login">
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition">
                            Go to Recruiter Login
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <RecruiterCustomTopBar />
            <Head>
                <title>Company Dashboard</title>
                <meta name="description" content="Manage job postings and candidates" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="bg-gray-50 min-h-screen pt-24">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-10">Dashboard Overview</h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
                        {/* Card */}
                        {[
                            { title: "Published Jobs", value: jobStats.published, color: "text-indigo-500" },
                            { title: "Hidden Jobs", value: jobStats.hidden, color: "text-yellow-500" },
                            { title: "Saved Candidates", value: jobStats.candidatesSaved, color: "text-emerald-500" },
                        ].map((item, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
                                <h2 className="text-md font-semibold text-gray-500">{item.title}</h2>
                                <p className={`mt-4 text-4xl font-bold ${item.color}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-semibold text-gray-700 mb-6">Recruitment Overview</h2>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
