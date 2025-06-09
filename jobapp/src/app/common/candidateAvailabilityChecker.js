'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../context/usercontext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function CandidateAvailabilityChecker() {
    const { email, recommendationCvId, setRecommendationCvId } = useUserContext();
    const [isChecking, setIsChecking] = useState(false);
    const [lastCheckTime, setLastCheckTime] = useState(null);
    const [cacheCheckTimer, setCacheCheckTimer] = useState(null);

    // Firebase notification function for job recommendations
    const updateFirebaseNotificationForJobRecommendation = async (email, cvId, recommendationsCount) => {
        try {
            if (!email) return;
            
            const notificationsRef = collection(db, 'notifications', email, 'items');
            await addDoc(notificationsRef, {
                email,
                action: 'Recommendation',
                numb_recommendation: recommendationsCount,
                cvId: cvId,
                read: false,
                timestamp: serverTimestamp()
            });
            console.log('Firebase notification updated for job recommendations');
        } catch (error) {
            console.error('Error updating Firebase notification:', error);
        }
    };

    // Function to reanalyze CV after the timer
    const reanalyzeCvAfterTimeout = async (candidateId, cvId) => {
        if (!cvId || !candidateId) return;
        
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            console.log(`1801 seconds elapsed, checking cache key for CV ${cvId}`);
            
            // First check if the cache key exists using the new API
            const cacheKeyToCheck = `recommend:cv:${cvId}`;
            const cacheCheckRes = await fetch(`http://127.0.0.1:8000/api/cache/check-exists?key=${cacheKeyToCheck}`);
            
            if (!cacheCheckRes.ok) {
                console.log(`Cache check API failed with status ${cacheCheckRes.status}`);
                return;
            }
            
            const cacheExists = await cacheCheckRes.json();
            
            // If cache doesn't exist, delete the analysis and reanalyze
            if (!cacheExists) {
                console.log(`Cache key ${cacheKeyToCheck} not found, deleting existing analysis and re-analyzing CV`);
                
                // First delete the existing CV analysis
                const deleteRes = await fetch(`/api/cv-job-matches/delete-cv-analysis/${cvId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!deleteRes.ok) {
                    console.warn(`Failed to delete CV analysis for CV ID ${cvId}: ${deleteRes.status}`);
                } else {
                    console.log(`Successfully deleted existing analysis for CV ID ${cvId}`);
                }
                
                // Then re-analyze the CV
                await analyzeCandidateCV(candidateId, cvId);
            } else {
                console.log(`Cache key ${cacheKeyToCheck} exists, skipping analysis`);
            }
            
        } catch (error) {
            console.error('Error re-analyzing CV:', error);
        }
    };

    useEffect(() => {
        const checkCandidateStatus = async () => {
            // Don't proceed if no email or recommendationCvId
            if (!email || !recommendationCvId) return;
            
            // Check if we've already checked availability recently (within last hour)
            const lastAvailabilityCheck = localStorage.getItem('lastAvailabilityCheck');
            const currentTime = new Date().getTime();
            
            if (lastAvailabilityCheck && (currentTime - parseInt(lastAvailabilityCheck)) < 3600000) {
                console.log("Skipping availability check - performed recently");
                return;
            }

            if (isChecking) return; // Prevent concurrent checks
            setIsChecking(true);

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log("No auth token found");
                    setIsChecking(false);
                    return;
                }

                // Get candidate ID from email
                const candidateRes = await fetch(`/api/candidate/get-candidate-by-email?email=${encodeURIComponent(email)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!candidateRes.ok) {
                    throw new Error(`Failed to fetch candidate data: ${candidateRes.status}`);
                }

                const candidateData = await candidateRes.json();
                
                if (!candidateData || !candidateData.id) {
                    throw new Error('No valid candidate data found');
                }

                // Check candidate availability
                const availabilityRes = await fetch(`/api/candidate/check-available/${candidateData.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!availabilityRes.ok) {
                    throw new Error(`Failed to check availability: ${availabilityRes.status}`);
                }

                const isAvailable = await availabilityRes.json();
                
                // Store check time
                localStorage.setItem('lastAvailabilityCheck', currentTime.toString());
                
                // If candidate is available and we have a CV ID, analyze CV
                if (isAvailable === true && recommendationCvId) {
                    await analyzeCandidateCV(candidateData.id, recommendationCvId);
                    
                    // Set up the cache check timer after successful analysis
                    if (cacheCheckTimer) clearTimeout(cacheCheckTimer);
                    
                    const timer = setTimeout(() => {
                        reanalyzeCvAfterTimeout(candidateData.id, recommendationCvId);
                    }, 1801 * 1000); // 1801 seconds
                    
                    setCacheCheckTimer(timer);
                }
            } catch (error) {
                console.error('Error checking candidate availability:', error);
            } finally {
                setIsChecking(false);
            }
        };

        const analyzeCandidateCV = async (candidateId, cvId) => {
            try {
                const token = localStorage.getItem('token');
                
                // At the beginning of runCVAnalysis
                if (localStorage.getItem('cvAnalysisInProgress') === 'true') {
                    console.log('CV analysis already in progress, skipping');
                    return;
                }
                localStorage.setItem('cvAnalysisInProgress', 'true');

                // Get CV file URL
                const cvFileRes = await fetch(`/api/cv/get-fileCV-by-CV-id/${cvId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                
                if (!cvFileRes.ok) {
                    throw new Error('Failed to retrieve CV URL');
                }
                
                const cvUrl = await cvFileRes.text();
                
                // Extract text from CV
                const extractRes = await fetch(`/api/ocr/extract/${candidateId}?fileUrl=${encodeURIComponent(cvUrl)}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                
                if (!extractRes.ok) {
                    throw new Error('Failed to extract text from CV URL');
                }
                
                const cvText = await extractRes.text();
                
                // Analyze CV
                const analyzeRes = await fetch(`http://127.0.0.1:8000/api/analyze/cv`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cv_text: cvText,
                        cv_id: cvId,
                    }),
                });
                
                if (!analyzeRes.ok) {
                    throw new Error(`API request failed with status ${analyzeRes.status}`);
                }
                
                const data = await analyzeRes.json();
                
                // Get the recommendations count and log
                const recommendationsCount = Array.isArray(data) ? data.length : 0;
                console.log(`CV analyzed successfully. Found ${recommendationsCount} job recommendations.`);
                
                // Send notification to Firebase
                await updateFirebaseNotificationForJobRecommendation(email, cvId, recommendationsCount);
                
                // Update last analysis time
                localStorage.setItem('lastCvAnalysisTime', new Date().getTime().toString());
                
                console.log('Starting analysis for candidate:', candidateData.id, candidateData.fullname);
                // After analysis
                console.log('Completed analysis for candidate:', candidateData.id);
                
            } catch (error) {
                console.error('Error analyzing CV:', error);
            } finally {
                // At the end in finally block
                localStorage.removeItem('cvAnalysisInProgress');
            }
        };

        // Run the check when component mounts and recommendationCvId is available
        if (email && recommendationCvId) {
            checkCandidateStatus();
        }
        
        // Clean up timer on unmount
        return () => {
            if (cacheCheckTimer) {
                clearTimeout(cacheCheckTimer);
            }
        };
    }, [email, recommendationCvId, isChecking, cacheCheckTimer]);

    return null; // This component doesn't render anything
} 