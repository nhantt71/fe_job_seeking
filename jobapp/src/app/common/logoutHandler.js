'use client';

import { useUserContext } from '../context/usercontext';
import { useRouter } from 'next/navigation';

export default function LogoutHandler() {
    const { recommendationCvId, setUserData, setRecommendationCvId, setMainCVIdForJobs } = useUserContext();
    const router = useRouter();

    // Function to handle logout process
    const handleLogout = async () => {
        // Skip CV analysis deletion and cache deletion
        // Just perform the logout directly
        performLogout();
        
        // Return a resolved promise for chaining
        return Promise.resolve();
    };

    // Function to perform the actual logout
    const performLogout = () => {
        // Clear all relevant localStorage items except those related to CV-job matches and cache
        localStorage.removeItem('token');
        
        // Keep these values:
        // localStorage.removeItem('mainCvId');
        // localStorage.removeItem('mainCvIdFetchTime');
        // localStorage.removeItem('lastAvailabilityCheck');
        // localStorage.removeItem('lastCvAnalysisTime');
        
        // Reset context values except recommendationCvId and mainCVIdForJobs
        setUserData(null, null);
        
        // Don't reset these values:
        // setRecommendationCvId(null);
        // setMainCVIdForJobs(null);
        
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