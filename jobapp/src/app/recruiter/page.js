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
import { useRecruiterContext } from "../context/recruitercontext";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
    const { setUserData} = useUserContext();
    const { companyId } = useRecruiterContext();
    const [numberofjobs, setNumberofjobs] = useState(0);
    const [publishedjobs, setPublishedJobs] = useState(0);
    const [candidatesSaved, setCandidatesSaved] = useState(0);
    const [candidatesApplied, setCandidatesApplied] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [jobs, setJobs] = useState([]);

    const fetchJobs = async () => {
        fetch(`/api/job/get-job-by-company-id/${companyId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => {
            if (!res.ok) throw new Error('Cannot fetch jobs');
            return res.json();
        })
        .then(data => {
            setJobs(data);
            setNumberofjobs(data.length);
        })
        .catch(() => {
            setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    };

    const fetchPublishedJobs = async () => {
        fetch(`/api/job/get-published-jobs-by-company-id/${companyId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => {
            if (!res.ok) throw new Error('Cannot fetch published jobs');
            return res.json();
        })
        .then(data => {
            setPublishedJobs(data.length);
        })
        .catch(() => {
            setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    };

    const fetchCandidatesSaved = async () => {
        const token = localStorage.getItem('token');
        fetch(`/api/company-candidate/get-saved-candidates/${companyId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        })
        .then(res => {
            if (!res.ok) throw new Error('Cannot fetch candidates saved');
            return res.json();
        })
        .then(data => {
            setCandidatesSaved(data.length);
        })
        .catch(() => {
            setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    };

    const fetchCandidatesApplied = async () => {
        const token = localStorage.getItem('token');
        fetch(`/api/company-candidate/get-applied-candidates/${companyId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        })
        .then(res => {
            if (!res.ok) throw new Error('Cannot fetch candidates applied');
            return res.json();
        })
        .then(data => {
            setCandidatesApplied(data.length);
        })
        .catch(() => {
            setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    };
  

    useEffect(() => {
        fetchJobs();
        fetchPublishedJobs();
        fetchCandidatesSaved();
        fetchCandidatesApplied();
    }, [companyId]);
        
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
        labels: ['Published Jobs', 'All Jobs', 'Saved Candidates', 'Applied Candidates'],
        datasets: [
            {
                label: 'Recruitment Overview',
                data: [publishedjobs, numberofjobs, candidatesSaved, candidatesApplied],
                backgroundColor: ['#6366F1', '#FBBF24', '#34D399', '#EC4899'],
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Recruitment Overview', font: { size: 20 } },
        },
    };

    if (isLoading) {
        return (
            <div suppressHydrationWarning className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white">
                <div suppressHydrationWarning className="text-center animate-pulse">
                    <div suppressHydrationWarning className="h-12 w-12 mx-auto rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div suppressHydrationWarning className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-white">
                <div suppressHydrationWarning className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-500 mb-6">Please log in as a recruiter to view the dashboard.</p>
                    <Link href="/recruiter/login">
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition shadow-lg">
                            Recruiter Login
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
                <title>Recruiter Dashboard</title>
                <meta name="description" content="Manage job postings and candidates" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="bg-gradient-to-b from-indigo-50 via-white to-white min-h-screen pt-28">
                <div suppressHydrationWarning className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-12 tracking-tight">Welcome Back, Recruiter</h1>

                    {/* Overview Cards */}
                    <div suppressHydrationWarning className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                        {[
                            { title: "Published Jobs", value: publishedjobs, color: "text-indigo-600", icon: "📢" },
                            { title: "All Jobs", value: numberofjobs, color: "text-yellow-500", icon: "🗂️" },
                            { title: "Saved Candidates", value: candidatesSaved, color: "text-green-500", icon: "💾" },
                            { title: "Applied Candidates", value: candidatesApplied, color: "text-pink-500", icon: "📨" },
                        ].map((item, i) => (
                            <div suppressHydrationWarning key={i} className="bg-white shadow-xl rounded-2xl p-6 transition-transform hover:-translate-y-1 hover:shadow-2xl text-center">
                                <div suppressHydrationWarning className="text-4xl mb-2">{item.icon}</div>
                                <h3 className="text-sm font-semibold text-gray-500">{item.title}</h3>
                                <p className={`text-4xl font-extrabold mt-2 ${item.color}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Chart Section */}
                    <div suppressHydrationWarning className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recruitment Stats</h2>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
