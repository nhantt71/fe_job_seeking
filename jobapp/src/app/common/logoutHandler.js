'use client';

import { useUserContext } from '../context/usercontext';
import { useRouter } from 'next/navigation';

export default function LogoutHandler() {
    const { recommendationCvId, setUserData, setRecommendationCvId, setMainCVIdForJobs } = useUserContext();
    const router = useRouter();

    // Function to handle logout process
    const handleLogout = async () => {
        try {
            // Only proceed with deletion if we have a CV ID
            if (recommendationCvId) {
                const token = localStorage.getItem('token');
                if (!token) {
                    performLogout();
                    return Promise.resolve(); // Return resolved promise
                }

                // Delete CV analysis
                try {
                    const deleteAnalysisRes = await fetch(`/api/cv-job-matches/delete-cv-analysis/${recommendationCvId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (deleteAnalysisRes.ok) {
                        console.log(`Successfully deleted CV analysis for CV ID ${recommendationCvId}`);
                    } else {
                        console.warn(`Failed to delete CV analysis: ${deleteAnalysisRes.status}`);
                    }
                } catch (error) {
                    console.error('Error deleting CV analysis:', error);
                }

                // Check if cache exists and delete if it does
                try {
                    const cacheKeyToCheck = `recommend:cv:${recommendationCvId}`;

                    // Check if cache exists using the new API
                    const cacheCheckRes = await fetch(`http://127.0.0.1:8000/api/cache/check-exists?key=${cacheKeyToCheck}`);
                                
                    if (cacheCheckRes.ok) {
                        const cacheExists = await cacheCheckRes.json();
                        
                        if (cacheExists) {
                            // Delete the cache key using the new API
                            const deleteCacheRes = await fetch(`http://127.0.0.1:8000/api/cache/delete?key=${cacheKeyToCheck}`, {
                                method: 'DELETE'
                            });

                            if (deleteCacheRes.ok) {
                                console.log(`Successfully deleted cache key: ${cacheKeyToCheck}`);
                            } else {
                                console.warn(`Failed to delete cache key: ${deleteCacheRes.status}`);
                            }
                        } else {
                            console.log(`Cache key ${cacheKeyToCheck} does not exist, no need to delete`);
                        }
                    } else {
                        console.warn(`Failed to check cache key existence: ${cacheCheckRes.status}`);
                    }
                } catch (error) {
                    console.error('Error checking/deleting cache key:', error);
                }

                try {
                    const cacheKey1ToCheck = `nli_analysis:cv:${recommendationCvId}`;
                    const cacheCheckRes1 = await fetch(`http://127.0.0.1:8000/api/cache/check-exists?key=${cacheKey1ToCheck}`);

                    if (cacheCheckRes1.ok) {
                        const cacheExists1 = await cacheCheckRes1.json();

                        if (cacheExists1) {
                            const deleteCacheRes1 = await fetch(`http://127.0.0.1:8000/api/cache/delete?key=${cacheKey1ToCheck}`, {
                                method: 'DELETE'
                            });

                            if (deleteCacheRes1.ok) {
                                console.log(`Successfully deleted cache key: ${cacheKey1ToCheck}`);
                            } else {
                                console.warn(`Failed to delete cache key: ${deleteCacheRes1.status}`);
                            }
                        }
                    }
                    else {
                        console.warn(`Failed to check cache key existence: ${cacheCheckRes1.status}`);
                    }
                } catch (error) {
                    console.error('Error checking/deleting cache key:', error);
                }
            }
        } catch (error) {
            console.error('Error in logout cleanup:', error);
        }

        // Complete the logout process
        performLogout();
        
        // Return a resolved promise for chaining
        return Promise.resolve();
    };

    // Function to perform the actual logout
    const performLogout = () => {
        // Clear all relevant localStorage items
        localStorage.removeItem('token');
        localStorage.removeItem('mainCvId');
        localStorage.removeItem('mainCvIdFetchTime');
        localStorage.removeItem('lastAvailabilityCheck');
        localStorage.removeItem('lastCvAnalysisTime');
        
        // Reset context values
        setUserData(null, null);
        setRecommendationCvId(null);
        setMainCVIdForJobs(null);
        
        // Default redirect handled internally
        // For custom redirects, let the calling code handle it by chaining
        try {
            router.push('/candidate/login');
        } catch (error) {
            console.error('Error navigating to login:', error);
            // Fallback redirect
            window.location.href = '/candidate/login';
        }
    };

    // This component returns the logout function for use in other components
    return { handleLogout };
} 