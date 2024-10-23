'use client';

import { createContext, useContext, useState } from 'react';

const RecruiterContext = createContext();

export const useRecruiterContext = () => {
    return useContext(RecruiterContext);
};

export const RecruiterProvider = ({ children }) => {
    const [recruiter, setRecruiter] = useState(null);

    const setRecruiterData = (recruiterData) => {
        setRecruiter(recruiterData);
    };

    return (
        <RecruiterContext.Provider value={{ recruiter, setRecruiterData }}>
            {children}
        </RecruiterContext.Provider>
    );
};
