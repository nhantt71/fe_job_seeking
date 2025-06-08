'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronDown, FiUpload, FiCheck, FiX, FiHome, FiMail, FiInfo, FiPhone, FiGlobe, FiMapPin } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export function CompanyRegister({ account }) {
    const [companyName, setCompanyName] = useState('');
    const [companyLogo, setCompanyLogo] = useState(null);
    const [existingCompanies, setExistingCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [email, setEmail] = useState('');
    const [information, setInformation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [website, setWebsite] = useState('');
    const [city, setCity] = useState('');
    const [detail, setDetail] = useState('');
    const [province, setProvince] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const router = useRouter();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('/api/companies');
                const companies = await response.json();
                setExistingCompanies(companies);
            } catch (err) {
                console.error('Failed to fetch companies:', err.message);
            }
        };

        fetchCompanies();
    }, []);

    const handleCompanyLogoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setCompanyLogo(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!selectedCompany && !companyName) {
            setError('Please select an existing company or create a new one.');
            setIsLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', companyName || selectedCompany);
            formData.append('email', email);
            formData.append('information', information);
            formData.append('phoneNumber', phoneNumber);
            formData.append('website', website);
            formData.append('city', city);
            formData.append('detail', detail);
            formData.append('province', province);

            if (companyLogo) {
                const logoFile = await fetch(companyLogo).then(res => res.blob());
                formData.append('logo', logoFile, 'logo.jpg');
            }

            const response = await fetch('/api/companies', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to register company');
            }

            router.push('/recruiter/recruiter-information');
        } catch (err) {
            setError(err.message || 'An error occurred during company registration');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const clearNewCompanyFields = () => {
        setCompanyName('');
        setEmail('');
        setInformation('');
        setPhoneNumber('');
        setWebsite('');
        setCity('');
        setDetail('');
        setProvince('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-8 px-8 text-center">
                        <h1 className="text-3xl font-bold text-white">Company Registration</h1>
                        <p className="text-blue-100 mt-2">Complete your company profile to get started</p>
                    </div>

                    <div className="p-8">
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 flex items-start gap-3 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100"
                                >
                                    <FiX className="flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Existing Company Selection */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <FiCheck className="text-blue-500" />
                                    Select Existing Company
                                </h3>
                                <div className="relative">
                                    <select
                                        value={selectedCompany}
                                        onChange={(e) => {
                                            setSelectedCompany(e.target.value);
                                            if (e.target.value) clearNewCompanyFields();
                                        }}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none appearance-none bg-gray-50"
                                    >
                                        <option value="">Select a company</option>
                                        {existingCompanies.map((company) => (
                                            <option key={company.id} value={company.name}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiHome />
                                    </div>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                        <FiChevronDown />
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-3 bg-white text-sm text-gray-500">
                                        OR
                                    </span>
                                </div>
                            </div>

                            {/* New Company Form */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <FiHome className="text-blue-500" />
                                    Create New Company
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Company Name */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Company Name *</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                disabled={selectedCompany !== ''}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none bg-gray-50"
                                                required
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiHome />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Email *</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={selectedCompany !== ''}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none bg-gray-50"
                                                required
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiMail />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                disabled={selectedCompany !== ''}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none bg-gray-50"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiPhone />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Website */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Website</label>
                                        <div className="relative">
                                            <input
                                                type="url"
                                                value={website}
                                                onChange={(e) => setWebsite(e.target.value)}
                                                disabled={selectedCompany !== ''}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none bg-gray-50"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiGlobe />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Information */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Company Information</label>
                                    <div className="relative">
                                        <textarea
                                            value={information}
                                            onChange={(e) => setInformation(e.target.value)}
                                            disabled={selectedCompany !== ''}
                                            rows={4}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none bg-gray-50"
                                        />
                                        <div className="absolute top-3 left-3 text-gray-400">
                                            <FiInfo />
                                        </div>
                                    </div>
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Company Logo</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FiUpload className="w-8 h-8 text-gray-400" />
                                                <p className="text-xs text-gray-500 mt-2">Upload Logo</p>
                                            </div>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleCompanyLogoChange} 
                                                className="hidden" 
                                            />
                                        </label>
                                        {companyLogo && (
                                            <div className="relative">
                                                <img
                                                    src={companyLogo}
                                                    alt="Company Logo Preview"
                                                    className="h-32 w-32 object-cover rounded-xl border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setCompanyLogo(null)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                >
                                                    <FiX className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <FiMapPin className="text-blue-500" />
                                        Company Address
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* City */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">City</label>
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                disabled={selectedCompany !== ''}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none bg-gray-50"
                                            />
                                        </div>

                                        {/* Province */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">Province</label>
                                            <input
                                                type="text"
                                                value={province}
                                                onChange={(e) => setProvince(e.target.value)}
                                                disabled={selectedCompany !== ''}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none bg-gray-50"
                                            />
                                        </div>

                                        {/* Detail */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">Address Detail</label>
                                            <input
                                                type="text"
                                                value={detail}
                                                onChange={(e) => setDetail(e.target.value)}
                                                disabled={selectedCompany !== ''}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full px-6 py-3 text-white font-medium rounded-xl shadow-md transition-all duration-200 ${
                                        isLoading 
                                            ? 'bg-blue-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                    }`}
                                >
                                    {isLoading ? 'Processing...' : 'Continue Registration'}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}