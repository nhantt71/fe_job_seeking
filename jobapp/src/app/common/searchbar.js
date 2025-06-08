'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

const SearchBar = ({ onSearch, initialValues }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [isLoading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Initialize state from URL parameters or initialValues
    useEffect(() => {
        setMounted(true);
        
        // First check URL parameters
        const keywordFromUrl = searchParams.get('keyword');
        const categoryFromUrl = searchParams.get('categoryId');
        const provinceFromUrl = searchParams.get('province');
        const cateIdFromUrl = searchParams.get('cateId');
        
        // Set state from URL parameters if they exist
        if (keywordFromUrl) setKeyword(keywordFromUrl);
        if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
        else if (cateIdFromUrl) setSelectedCategory(cateIdFromUrl);
        if (provinceFromUrl) setSelectedProvince(provinceFromUrl);
        
        // If URL parameters don't exist, use initialValues as fallback
        else if (initialValues) {
            if (initialValues.keyword && !keywordFromUrl) setKeyword(initialValues.keyword);
            if (initialValues.categoryId && !categoryFromUrl && !cateIdFromUrl) setSelectedCategory(initialValues.categoryId);
            if (initialValues.province && !provinceFromUrl) setSelectedProvince(initialValues.province);
        }
    }, [searchParams, initialValues]);

    useEffect(() => {
        if (!mounted) return;
        
        fetch('/api/category')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });
    }, [mounted]);

    useEffect(() => {
        if (!mounted) return;
        
        fetch('/api/v1/locations/provinces')
            .then(res => res.json())
            .then(data => setCities(data))
            .catch((error) => {
                console.error('Error fetching cities:', error);
            });
    }, [mounted]);

    const handleSearch = async (e) => {
        e.preventDefault();
        const searchParams = {
            keyword,
            province: selectedProvince,
            categoryId: selectedCategory,
        };
        
        // Update URL with search parameters
        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        if (selectedProvince) params.set('province', selectedProvince);
        if (selectedCategory) params.set('categoryId', selectedCategory);
        
        // Navigate to the new URL
        const newUrl = params.toString() ? `/job?${params.toString()}` : '/job';
        router.push(newUrl);
        
        // Call the onSearch callback
        await onSearch(searchParams);
    };

    const handleClear = () => {
        setKeyword('');
        setSelectedCategory('');
        setSelectedProvince('');
        onSearch({});
        router.push('/job');
    };

    if (!mounted) {
        return null;
    }

    return (
        <motion.form 
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
            <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* Keyword Search */}
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition-all"
                        placeholder="Job title, keywords, or company"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                {/* Location Select */}
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <select
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 appearance-none bg-white "
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                    >
                        <option value="">All Locations</option>
                        {cities.map((city, index) => (
                            <option value={city} key={index}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Select */}
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <select
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 appearance-none bg-white"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option value={category.id} key={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <motion.button
                        type="button"
                        onClick={handleClear}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors font-medium"
                    >
                        Clear
                    </motion.button>
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all font-medium shadow-md"
                    >
                        Search Jobs
                    </motion.button>
                </div>
            </div>
        </motion.form>
    );
};

export default SearchBar;