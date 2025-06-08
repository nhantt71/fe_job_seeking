'use client';

import { createContext, useContext, useState } from 'react';

const RecruiterContext = createContext();

export const useRecruiterContext = () => {
    return useContext(RecruiterContext);
};

export const RecruiterProvider = ({ children }) => {
    const [recruiter, setRecruiter] = useState(null);
    const [company, setCompany] = useState(null);
    const [companyId, setCompanyId] = useState(0);

    const setRecruiterData = (recruiterData) => {
        setRecruiter(recruiterData);
    };

    const setCompanyData = (companyData) => {
        setCompany(companyData);
    };


    return (
        <RecruiterContext.Provider value={{ recruiter, company, setRecruiterData, setCompanyData, companyId, setCompanyId }}>
            {children}
        </RecruiterContext.Provider>
    );
};
