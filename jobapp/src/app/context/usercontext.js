'use client'
import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [email, setEmail] = useState(null);
    const [account, setAccount] = useState(null);
    const [role, setRole] = useState(null);
    const [recommendationCvId, setRecommendationCvId] = useState(null);
    const [mainCVIdForJobs, setMainCVIdForJobs] = useState(null);

    // This function can be called to set the user data
    const setUserData = (email, account, role, recommendationCvId, mainCVIdForJobs) => {
        setEmail(email);
        setAccount(account);
        setRole(account?.role || role || null);
        if (recommendationCvId) {
            setRecommendationCvId(recommendationCvId);
        }
        if (mainCVIdForJobs) {
            setMainCVIdForJobs(mainCVIdForJobs);
        }
    };  


    return (
        <UserContext.Provider value={{ 
            email, 
            account, 
            role, 
            setUserData, 
            recommendationCvId, 
            setRecommendationCvId,
            mainCVIdForJobs,
            setMainCVIdForJobs
        }}>
            {children}  
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    return useContext(UserContext);
};
