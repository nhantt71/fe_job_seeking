'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiPhone, FiMapPin, FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function RecruiterInformation() {
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [city, setCity] = useState('');
    const [gender, setGender] = useState('');
    const [province, setProvince] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        console.log({
            fullName,
            phoneNumber,
            city,
            gender,
            province,
        });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        router.push('/recruiter');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-8 px-8 text-center">
                        <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
                        <p className="text-blue-100 mt-2">Help us get to know you better</p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Full Name *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none"
                                        placeholder="John Doe"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiUser />
                                    </div>
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number *</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none"
                                        placeholder="+1 (123) 456-7890"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiPhone />
                                    </div>
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Gender</label>
                                <div className="relative">
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none appearance-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiUser />
                                    </div>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                        <FiChevronDown />
                                    </div>
                                </div>
                            </div>

                            {/* Location Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* City */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">City</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none"
                                            placeholder="New York"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <FiMapPin />
                                        </div>
                                    </div>
                                </div>

                                {/* Province */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Province/State</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={province}
                                            onChange={(e) => setProvince(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 outline-none"
                                            placeholder="California"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <FiMapPin />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full px-6 py-3 text-white font-medium rounded-xl shadow-md transition-all duration-200 ${
                                        isSubmitting 
                                            ? 'bg-blue-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                    }`}
                                >
                                    {isSubmitting ? 'Saving...' : 'Complete Profile'}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}