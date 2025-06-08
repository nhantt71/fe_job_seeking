'use client';

import { useEffect } from 'react';
import { useUserContext } from '../context/usercontext';

export default function AuthInitializer() {
    const { setUserData, setRecommendationCvId, setMainCVIdForJobs } = useUserContext();

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            // Check if we've already fetched the CV ID in this session
            const mainCvIdFromStorage = localStorage.getItem('mainCvId');
            const lastFetchTime = localStorage.getItem('mainCvIdFetchTime');
            const currentTime = new Date().getTime();
            
            // If we have a stored CV ID and it was fetched less than 1 hour ago, use it
            if (mainCvIdFromStorage && lastFetchTime && (currentTime - parseInt(lastFetchTime)) < 3600000) {
                console.log("Using cached main CV ID:", mainCvIdFromStorage);
                setRecommendationCvId(mainCvIdFromStorage);
                setMainCVIdForJobs(mainCvIdFromStorage);
                return;
            }

            try {
                // Get current user info
                const userRes = await fetch('/api/auth/current-user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!userRes.ok) {
                    throw new Error('Token expired or invalid');
                }

                const userData = await userRes.json();
                setUserData(userData.username, userData);

                // Fetch candidate data to get ID
                if (userData.username) {
                    const candidateRes = await fetch(`/api/candidate/get-candidate-by-email?email=${encodeURIComponent(userData.username)}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (candidateRes.ok) {
                        const candidateData = await candidateRes.json();
                        
                        // If candidate exists, fetch their CVs to find the main one
                        if (candidateData && candidateData.id) {
                            const cvsRes = await fetch(`/api/cv/get-cvs-by-candidate-id/${candidateData.id}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                }
                            });
                            
                            if (cvsRes.ok) {
                                const cvsList = await cvsRes.json();
                                // Find the main CV
                                const mainCv = cvsList.find(cv => cv.mainCV);
                                
                                if (mainCv) {
                                    // Set the main CV ID as the recommendation CV ID
                                    setRecommendationCvId(mainCv.id);
                                    setMainCVIdForJobs(mainCv.id);
                                    
                                    // Store the CV ID and fetch time in localStorage
                                    localStorage.setItem('mainCvId', mainCv.id);
                                    localStorage.setItem('mainCvIdFetchTime', currentTime.toString());
                                    
                                    console.log("Main CV set as recommendation CV:", mainCv.id);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('mainCvId');
                localStorage.removeItem('mainCvIdFetchTime');
            }
        };

        initializeAuth();
    }, [setUserData, setRecommendationCvId, setMainCVIdForJobs]);

    return null; // This component doesn't render anything
} 