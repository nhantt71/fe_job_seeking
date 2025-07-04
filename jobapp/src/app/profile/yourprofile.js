'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserContext } from '../context/usercontext';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import {app} from '@/app/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51RZCRJIHR8guEBZDUVxaPD4ScbDdSnttLgTOs7VxiWWlbgwG6nPMEQqMYKIgrRoe1nAZWK0JpZ9KmSvVaTfWE86n00j3CtyJUi');

export default function YourProfileWrapper(props) {
    const { email, account, setUserData, mainCVIdForJobs, setMainCVIdForJobs } = useUserContext();
    const [searchStatus, setSearchStatus] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [fullname, setFullname] = useState('');
    const [trialTime, setTrialTime] = useState(0);
    const [phoneNumber, setPhonenumber] = useState('');
    const [candidate, setCandidate] = useState(null);
    const [cvList, setCvList] = useState([]);
    const [selectedCvId, setSelectedCvId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [length, setLength] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const router = useRouter();
    const { recommendationCvId, setRecommendationCvId } = useUserContext();
    const db = getFirestore(app);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        setIsLoading(true);
        fetch('/api/auth/current-user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Token expired or invalid');
                }
                return res.json();
            })
            .then(data => {
                setUserData(data.username, data);
                setIsAuthenticated(true);
                if (data.username) {
                    fetchCandidateData(data.username).then(() => {
                        checkAndUpdatePremiumStatus();
                    });
                }
                // Set avatar from account data
                if (data.avatar) {
                    setAvatar(data.avatar);
                }
            })
            .catch(error => {
                console.error('Error verifying token:', error);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            })
            .finally(() => setIsLoading(false));

        // Check premium status every hour
        const premiumCheckInterval = setInterval(checkAndUpdatePremiumStatus, 3600000);

        return () => {
            clearInterval(premiumCheckInterval);
        };
    }, []);

    useEffect(() => {
        // Check for Stripe session completion
        const query = new URLSearchParams(window.location.search);
        const sessionId = query.get('session_id');
        
        if (sessionId) {
            handlePaymentConfirmation(sessionId);
        }
    }, []);

    const fetchCandidateData = async (email) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/candidate/get-candidate-by-email?email=${email}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCandidate(data);
                setFullname(data.fullname || '');
                setPhonenumber(data.phoneNumber || '');
                setSearchStatus(data.available || false);
                setAvatar(data.avatar || null);
                setTrialTime(data.trialTimes || 0);
                fetchCVList(data.id);
                console.log(data);
            }
        } catch (error) {
            console.error('Error fetching candidate data:', error);
        }
    };

    const fetchCVList = async (candidateId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/cv/get-cvs-by-candidate-id/${candidateId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCvList(data);
                // Find and set the main CV
                const mainCv = data.find(cv => cv.mainCV);
                if (mainCv) {
                    setSelectedCvId(mainCv.id);
                    setMainCVIdForJobs(mainCv.id);
                    setRecommendationCvId(mainCv.id);
                }
            }
        } catch (error) {
            console.error('Error fetching CV list:', error);
        }
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatar(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const saveAvatar = () => {
        if (!avatar) {
            alert("Please select an avatar file.");
            return;
        }

        const formData = new FormData();
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput && fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        fetch(`/api/auth/change-avatar?accountId=${account.id}`, {
            method: 'POST',
            body: formData,
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setUserData(data.email, data);
                alert('Avatar changed successfully!');
            })
            .catch(error => {
                console.error('Error changing avatar:', error);
                alert('Failed to change avatar. Please check your file and try again.');
            });
    };

    const editInformation = () => {
        fetch(`/api/candidate/edit/${candidate.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullname: fullname,
                phoneNumber: phoneNumber,
            }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setCandidate(prev => ({
                    ...prev,
                    fullname: data.fullname,
                    phoneNumber: data.phoneNumber,
                }));
                alert('Information updated successfully!');
            })
            .catch(error => {
                console.error('Error updating information:', error);
                alert('Failed to update information. Please try again.');
            });
    };


    const updateFirebaseNotification = async (searchStatus, recommendationsCount = null) => {
        try {
            const notificationsRef = collection(db, 'notifications', email, 'items');
            
            if (searchStatus) {
                // Notification for enabling job search with recommendations count
                await addDoc(notificationsRef, {
                    email,
                    action: 'EnableWithRecommendations',
                    message: `Job search status has been enabled successfully! We found ${recommendationsCount || 0} job recommendations for you.`,
                    cvId: selectedCvId,
                    numb_recommendation: recommendationsCount || 0,
                    read: false,
                    timestamp: serverTimestamp()
                });
            } else {
                // Notification for disabling job search
                await addDoc(notificationsRef, {
                    email,
                    action: 'Disable',
                    message: 'Job search status has been disabled successfully!',
                    cvId: selectedCvId,
                    read: false,
                    timestamp: serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error updating Firebase notification:', error);
        }
    };

    const toggleSearchStatus = () => {
        if (!selectedCvId) {
            alert("You need to select the main CV before turning on job search status.");
            return;
        }

        // Check if trial time is available for non-premium users
        if (!searchStatus && !candidate?.isPremium && trialTime <= 0) {
            alert("You don't have any trial time left. Please purchase a subscription to continue using job search features.");
            return;
        }

        // Check if trial end date has passed for non-premium users
        if (!candidate?.isPremium && candidate?.trialEndDate) {
            const trialEndDate = new Date(candidate.trialEndDate);
            if (trialEndDate < new Date()) {
                alert("Your trial period has ended. Please purchase a subscription to continue using job search features.");
                return;
            }
        }

        const confirmMessage = searchStatus 
            ? "Are you sure you want to turn off job search status? This will make your profile less visible to employers."
            : "Are you sure you want to turn on job search status? This will make your profile visible to employers.";

        if (window.confirm(confirmMessage)) {
            const toggleUrl = searchStatus 
                ? `/api/candidate/disable-finding-jobs/${candidate.id}`
                : candidate?.isPremium 
                    ? `/api/candidate/enable-finding-jobs-premium/${candidate.id}`
                    : `/api/candidate/enable-finding-jobs/${candidate.id}`;

            fetch(toggleUrl, { method: 'POST' })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to toggle job search status');
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        return res.json();
                    }
                    return res.text();
                })
                .then(data => {
                    if (data) {
                        setCandidate(prev => ({
                            ...prev,
                            ...data,
                            trialTimes: data.trialTimes,
                            trialEndDate: data.trialEndDate
                        }));
                        setTrialTime(data.trialTimes);
                    }
                    const newStatus = !searchStatus;
                    setSearchStatus(newStatus);
                    // Update Firebase notification
                    updateFirebaseNotification(newStatus);

                    if (!searchStatus) {
                        fetch(`/api/cv/make-main-cv?id=${selectedCvId}&candidateId=${candidate.id}`, {
                            method: 'POST',
                        })
                            .then(res => {
                                setRecommendationCvId(selectedCvId);
                                setMainCVIdForJobs(selectedCvId);
                                
                                // Store the CV ID and fetch time in localStorage
                                localStorage.setItem('mainCvId', selectedCvId);
                                localStorage.setItem('mainCvIdFetchTime', new Date().getTime().toString());
                                
                                if (!res.ok) throw new Error('Failed to mark CV as main');
                                const contentType = res.headers.get("content-type");
                                if (contentType && contentType.includes("application/json")) {
                                    return res.json();
                                }
                                return res.text();
                            })
                            .then(() => {
                                return fetch(`/api/cv/get-fileCV-by-CV-id/${selectedCvId}`);
                            })
                            .then(res => {
                                if (!res.ok) throw new Error('Failed to retrieve CV URL');
                                return res.text();
                            })
                            .then(cvUrl => {
                                return fetch(`/api/ocr/extract/${candidate.id}?fileUrl=${encodeURIComponent(cvUrl)}`, {
                                    method: 'POST'
                                });
                            })
                            .then(res => {
                                if (!res.ok) throw new Error('Failed to extract text from CV URL');
                                return res.text();
                            })
                            .then(data => {
                                return fetch(`http://127.0.0.1:8000/api/analyze/cv`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        cv_text: data,
                                        cv_id: selectedCvId,
                                    }),
                                });
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`API request failed with status ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(data => {
                                // Get the recommendations count
                                const recommendationsCount = Array.isArray(data) ? data.length : 0;
                                setLength(recommendationsCount);
                                
                                // Now update the search status in the database
                                updateFirebaseNotification(true, recommendationsCount);
                                
                                // Finally update the UI
                                setSearchStatus(true);
                                alert(`Job search status has been enabled successfully! We found ${recommendationsCount} job recommendations for you.`);
                            })
                            .catch(error => {
                                console.error('Error processing CV for job search:', error);
                                alert('Error processing CV for job search.');
                            });
                    } else {
                        // Delete job matches when turning off job search status
                        if (recommendationCvId) {
                            fetch(`/api/cv-job-matches/delete/${recommendationCvId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                }
                            })
                            .then(res => {
                                if (!res.ok) {
                                    console.warn(`Failed to delete job matches for CV ID ${recommendationCvId}: ${res.status}`);
                                }
                                return res.text();
                            })
                            .catch(error => {
                                console.error('Error deleting job matches:', error);
                            });
                        }
                        
                        // Delete Redis cache keys when turning off job search status
                        if (recommendationCvId) {
                            try {
                                // Delete recommend:cv:{cvId} cache key
                                const cacheKeyToCheck = `recommend:cv:${recommendationCvId}`;
                                fetch(`http://127.0.0.1:8000/api/cache/check-exists?key=${cacheKeyToCheck}`)
                                    .then(res => {
                                        if (!res.ok) {
                                            console.warn(`Failed to check cache key existence: ${res.status}`);
                                            return false;
                                        }
                                        return res.json();
                                    })
                                    .then(cacheExists => {
                                        if (cacheExists) {
                                            return fetch(`http://127.0.0.1:8000/api/cache/delete?key=${cacheKeyToCheck}`, {
                                                method: 'DELETE'
                                            });
                                        }
                                    })
                                    .then(res => {
                                        if (res && res.ok) {
                                            console.log(`Successfully deleted cache key: ${cacheKeyToCheck}`);
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error deleting Redis cache key:', error);
                                    });
                                
                                // Delete nli_analysis:cv:{cvId} cache key
                                const cacheKey2ToCheck = `nli_analysis:cv:${recommendationCvId}`;
                                fetch(`http://127.0.0.1:8000/api/cache/check-exists?key=${cacheKey2ToCheck}`)
                                    .then(res => {
                                        if (!res.ok) {
                                            console.warn(`Failed to check cache key existence: ${res.status}`);
                                            return false;
                                        }
                                        return res.json();
                                    })
                                    .then(cacheExists => {
                                        if (cacheExists) {
                                            return fetch(`http://127.0.0.1:8000/api/cache/delete?key=${cacheKey2ToCheck}`, {
                                                method: 'DELETE'
                                            });
                                        }
                                    })
                                    .then(res => {
                                        if (res && res.ok) {
                                            console.log(`Successfully deleted cache key: ${cacheKey2ToCheck}`);
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error deleting Redis cache key:', error);
                                    });
                            } catch (error) {
                                console.error('Error managing Redis cache:', error);
                            }
                        }
                        
                        fetch(`/api/cv/unmake-all-main-cv?candidateId=${candidate.id}`, {
                            method: 'POST',
                        })
                            .then(res => {
                                if (!res.ok) throw new Error('Failed to unmark all CVs as main');
                                const contentType = res.headers.get("content-type");
                                if (contentType && contentType.includes("application/json")) {
                                    return res.json();
                                }
                                return res.text();
                            })
                            .then(() => {
                                // Clear the localStorage entries for mainCvId
                                localStorage.removeItem('mainCvId');
                                localStorage.removeItem('mainCvIdFetchTime');
                                
                                alert('Job search status has been disabled successfully!');
                            })
                            .catch(error => {
                                console.error('Error disabling job search:', error);
                                alert('Failed to disable job search status.');
                            });
                    }
                })
                .catch(error => {
                    console.error('Error toggling job search status:', error);
                    alert('Failed to toggle job search status. Please try again.');
                });
        }
    };

    const handleCvSelect = async (event) => {
        const cvId = event.target.value;
        if (!cvId) return;

        if (searchStatus) {
            alert("You need to disable job search status before changing your main CV.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/cv/make-main-cv?id=${cvId}&candidateId=${candidate.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setSelectedCvId(cvId);
                setMainCVIdForJobs(cvId);
                setRecommendationCvId(cvId);
                
                // Store the CV ID and fetch time in localStorage
                localStorage.setItem('mainCvId', cvId);
                localStorage.setItem('mainCvIdFetchTime', new Date().getTime().toString());

                // Update the CV list to reflect the new main CV
                setCvList(prevList =>
                    prevList.map(cv => ({
                        ...cv,
                        mainCV: cv.id === cvId
                    }))
                );
                alert('Main CV updated successfully');
            } else {
                throw new Error('Failed to set main CV');
            }
        } catch (error) {
            console.error('Error setting main CV:', error);
            alert('Failed to set main CV');
        }
    };

    const handlePaymentConfirmation = async (sessionId) => {
        try {
            // Call your backend to verify the session and confirm payment
            const confirmResponse = await fetch('/api/payment/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    userId: candidate.id,
                }),
            });

            if (confirmResponse.ok) {
                // Refresh candidate data to get updated premium status
                await fetchCandidateData(email);
                alert('Premium upgrade successful! Your account has been upgraded.');
                // Remove the session_id from the URL without refreshing the page
                window.history.replaceState({}, '', window.location.pathname);
            } else {
                const errorData = await confirmResponse.json();
                throw new Error(errorData.message || 'Failed to confirm payment on server');
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('There was an issue confirming your payment. Please contact support.');
        }
    };

    const handleUpgradeToPremium = async () => {
        try {
            const stripe = await stripePromise;
            
            // Create checkout session
            const checkoutResponse = await fetch('/api/payment/create-checkout-session', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ 
                    userId: candidateId,
                    amount: 2000, // $20 in cents
                })
            });

            if (!checkoutResponse.ok) {
                const errorData = await checkoutResponse.json();
                throw new Error(errorData.message || 'Failed to create checkout session');
            }

            const { id: sessionId } = await checkoutResponse.json();
            
            // Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) {
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Error starting payment process:', error);
            alert('Failed to start payment process. Please try again.');
        }
    };

    const checkAndUpdatePremiumStatus = async () => {
        if (candidate?.isPremium && candidate?.premiumEndDate) {
            const premiumEndDate = new Date(candidate.premiumEndDate);
            const now = new Date();

            if (premiumEndDate < now) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`/api/candidate/disable-premium-candidate/${candidate.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        // Refresh candidate data after disabling premium
                        await fetchCandidateData(email);
                        console.log('Premium status disabled due to expiration');
                    }
                } catch (error) {
                    console.error('Error disabling premium status:', error);
                }
            }
        }
    };

    useEffect(() => {
        if (candidate) {
            checkAndUpdatePremiumStatus();
        }
    }, [candidate?.premiumEndDate]);

    if (!isAuthenticated) {
        return (
            <div 
                className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
                suppressHydrationWarning
            >
                <div 
                    className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
                    suppressHydrationWarning
                >
                    <div 
                        className="mb-6"
                        suppressHydrationWarning
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login to View Your Profile</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to access your profile information.</p>
                    <Link href="/candidate/login">
                        <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg">
                            Go to Login
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise}>
            <YourProfile
                candidate={candidate}
                setCandidate={setCandidate}
                searchStatus={searchStatus}
                setSearchStatus={setSearchStatus}
                trialTime={trialTime}
                setTrialTime={setTrialTime}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhonenumber}
                fullname={fullname}
                setFullname={setFullname}
                avatar={avatar}
                setAvatar={setAvatar}
                cvList={cvList}
                setCvList={setCvList}
                selectedCvId={selectedCvId}
                setSelectedCvId={setSelectedCvId}
                mainCVIdForJobs={mainCVIdForJobs}
                setMainCVIdForJobs={setMainCVIdForJobs}
                recommendationCvId={recommendationCvId}
                setRecommendationCvId={setRecommendationCvId}
                length={length}
                setLength={setLength}
                handleCvSelect={handleCvSelect}
                handleAvatarChange={handleAvatarChange}
                saveAvatar={saveAvatar}
                editInformation={editInformation}
                toggleSearchStatus={toggleSearchStatus}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleUpgradeToPremium={handleUpgradeToPremium}
                account={account}
                email={email}
            />
        </Elements>
    );
}

function YourProfile({ candidate, setCandidate, searchStatus, setSearchStatus, trialTime, setTrialTime, phoneNumber, setPhoneNumber, fullname, setFullname, avatar, setAvatar, cvList, setCvList, selectedCvId, setSelectedCvId, mainCVIdForJobs, setMainCVIdForJobs, recommendationCvId, setRecommendationCvId, length, setLength, handleCvSelect, handleAvatarChange, saveAvatar, editInformation, toggleSearchStatus, activeTab, setActiveTab, handleUpgradeToPremium, account, email }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side - Profile Card */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
                                <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                                    <img
                                        src={avatar || account?.avatar || '/default-avatar.png'}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                    <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <h2 className="mt-4 text-2xl font-bold text-white">{fullname || 'User'}</h2>
                                <p className="text-blue-100">{phoneNumber}</p>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800">Account Settings</h3>
                                    <button 
                                        onClick={saveAvatar}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={candidate?.email || account?.email || email || ''}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullname}
                                            onChange={e => setFullname(e.target.value)}
                                            className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={phoneNumber}
                                            onChange={e => setPhoneNumber(e.target.value)}
                                            className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <button
                                        onClick={editInformation}
                                        className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        Update Information
                                    </button>

                                    <Link href="/profile/changepassword">
                                        <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Change Password
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Main Content */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            {/* Tabs */}
                            <div className="border-b border-gray-200">
                                <nav className="flex -mb-px">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    >
                                        Profile Information
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('cv')}
                                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'cv' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    >
                                        CV Management
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    >
                                        Account Settings
                                    </button>
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === 'profile' && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Profile Overview</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                                                        <p className="text-lg font-semibold text-gray-800">{fullname || 'Not set'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="p-3 bg-green-100 rounded-full mr-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                                                        <p className="text-lg font-semibold text-gray-800">{phoneNumber || 'Not set'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="p-3 bg-purple-100 rounded-full mr-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                                        <p className="text-lg font-semibold text-gray-800">{candidate?.email || account?.email || email || 'Not set'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`p-4 rounded-lg ${searchStatus ? 'bg-teal-50' : 'bg-amber-50'}`}>
                                                <div className="flex items-center">
                                                    <div className={`p-3 rounded-full mr-4 ${searchStatus ? 'bg-teal-100' : 'bg-amber-100'}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${searchStatus ? 'text-teal-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500">Job Search Status</h4>
                                                        <div className="flex items-center">
                                                            <p className="text-lg font-semibold text-gray-800 mr-3">
                                                                {searchStatus ? 'Active' : 'Inactive'}
                                                            </p>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="sr-only peer" 
                                                                    checked={searchStatus}
                                                                    onChange={toggleSearchStatus}
                                                                />
                                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-indigo-50 p-4 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="p-3 bg-indigo-100 rounded-full mr-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            {candidate?.isPremium ? (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                            ) : (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            )}
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-500">
                                                            {candidate?.isPremium ? 'Premium Account Status' : 'Trial Information'}
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {candidate?.isPremium ? (
                                                                <>
                                                                    <div className="flex items-center">
                                                                        <p className="text-lg font-semibold text-green-600 flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                                            </svg>
                                                                            Premium Account Active
                                                                        </p>
                                                                    </div>
                                                                    {candidate?.premiumEndDate && (
                                                                        <p className="text-sm text-gray-600">
                                                                            Premium expires: {new Date(candidate.premiumEndDate).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-sm text-indigo-600">
                                                                        Enjoy unlimited access to all premium features
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center">
                                                                        <p className="text-lg font-semibold text-gray-800">
                                                                            Remaining Trials: {trialTime}
                                                                        </p>
                                                                        <div className="relative ml-2 group">
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className="h-5 w-5 text-gray-400 cursor-help"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                                />
                                                                            </svg>
                                                                            <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-50">
                                                                                <div className="text-sm text-gray-600">
                                                                                    <p className="mb-1">• Each trial period lasts for 3 days</p>
                                                                                    <p className="mb-1">• Job search status will automatically turn off when the trial ends</p>
                                                                                    <p className="mb-1">• You can use your remaining trials to reactivate job search</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {candidate?.trialEndDate && (
                                                                        <p className="text-sm text-gray-600">
                                                                            Trial ends: {new Date(candidate.trialEndDate).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                    <div className="mt-4 space-y-3">
                                                                        <button
                                                                            onClick={handleUpgradeToPremium}
                                                                            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold flex items-center justify-center"
                                                                            disabled={isProcessing}
                                                                        >
                                                                            {isProcessing ? (
                                                                                <span className="flex items-center">
                                                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                                    </svg>
                                                                                    Processing...
                                                                                </span>
                                                                            ) : (
                                                                                'Upgrade to Premium ($20/month)'
                                                                            )}
                                                                        </button>
                                                                        <p className="text-xs text-indigo-600 text-center">
                                                                            Get unlimited access to job search features
                                                                        </p>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'cv' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-semibold text-gray-800">CV Management</h3>
                                            <Link href="/cv">
                                                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Upload New CV
                                                </button>
                                            </Link>
                                        </div>

                                        {cvList.length > 0 ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Main CV Selection</label>
                                                    <select
                                                        value={selectedCvId || ''}
                                                        onChange={handleCvSelect}
                                                        className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        disabled={searchStatus}
                                                    >
                                                        <option value="" disabled>Select your main CV</option>
                                                        {cvList.map(cv => (
                                                            <option key={cv.id} value={cv.id}>
                                                                {cv.name || cv.title} {cv.mainCV ? '(Current Main CV)' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {searchStatus && (
                                                        <p className="mt-2 text-sm text-amber-600">
                                                            You need to disable job search status before changing your main CV.
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="mt-6">
                                                    <h4 className="text-lg font-medium text-gray-800 mb-3">Your CVs</h4>
                                                    <div className="space-y-3">
                                                        {cvList.map(cv => (
                                                            <div key={cv.id} className={`p-4 border rounded-lg ${cv.mainCV ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <h5 className="font-medium text-gray-800">{cv.name || cv.title}</h5>
                                                                        <p className="text-sm text-gray-500">Uploaded: {new Date(cv.updatedDate).toLocaleDateString()}</p>
                                                                    </div>
                                                                    <div className="flex space-x-2">
                                                                        {cv.mainCV && (
                                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                                                Main CV
                                                                            </span>
                                                                        )}
                                                                        <Link href={`/cv/edit/${cv.id}`}>
                                                                            <button className="p-1 text-gray-500 hover:text-blue-500">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                            </button>
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <h4 className="mt-4 text-lg font-medium text-gray-800">No CVs Uploaded Yet</h4>
                                                <p className="mt-2 text-gray-600 mb-6">Upload your first CV to get started with job applications</p>
                                                <Link href="/cv">
                                                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                                        Upload CV
                                                    </button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h3>
                                        
                                        <div className="space-y-6">
                                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                                <h4 className="text-lg font-medium text-gray-800 mb-4">Job Search Preferences</h4>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-800">Job Search Status</p>
                                                        <p className="text-sm text-gray-500">
                                                            {searchStatus 
                                                                ? "Your profile is visible to employers" 
                                                                : "Your profile is not visible to employers"}
                                                        </p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="sr-only peer" 
                                                            checked={searchStatus}
                                                            onChange={toggleSearchStatus}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                                <h4 className="text-lg font-medium text-gray-800 mb-4">Security</h4>
                                                
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-800">Password</p>
                                                            <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                                                        </div>
                                                        <Link href="/profile/changepassword">
                                                            <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                                                                Change Password
                                                            </button>
                                                        </Link>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                        <div>
                                                            <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                                                            <p className="text-sm text-gray-500">Add an extra layer of security</p>
                                                        </div>
                                                        <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                                                            Enable 2FA
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
                                                <h4 className="text-lg font-medium text-gray-800 mb-4">Danger Zone</h4>
                                                
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-800">Delete Account</p>
                                                            <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                                                        </div>
                                                        <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                                            Delete Account
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}