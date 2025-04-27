'use client'
import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [email, setEmail] = useState(null);
    const [account, setAccount] = useState(null);
    const [role, setRole] = useState(null);

    // This function can be called to set the user data
    const setUserData = (email, account, role) => {
        setEmail(email);
        setAccount(account);
        setRole(account.role);
    };

    return (
        <UserContext.Provider value={{ email, account, role, setUserData }}>
            {children}  
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    return useContext(UserContext);
};
