'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';

const SearchCompanyBar = ({ onSearch, onClear, isLoading, initialKeyword = '' }) => {
    const [keyword, setKeyword] = useState(initialKeyword);
    const [isFocused, setIsFocused] = useState(false);

    // Sync with external keyword changes
    useEffect(() => {
        setKeyword(initialKeyword);
    }, [initialKeyword]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            onSearch({
                keyword: keyword.trim()
            });
        }
    };

    const handleClear = () => {
        setKeyword('');
        onClear();
    };

    return (
        <form 
            onSubmit={handleSearch} 
            className={`relative max-w-3xl w-full mx-auto transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}
        >
            <div className={`relative flex items-center h-14 bg-white rounded-xl shadow-lg overflow-hidden border-2 ${isFocused ? 'border-blue-400 shadow-blue-100' : 'border-transparent'}`}>
                {/* Search Icon */}
                <div className="absolute left-4 text-gray-400">
                    <FiSearch className="w-5 h-5" />
                </div>

                {/* Input Field */}
                <input
                    type="text"
                    className="w-full h-full pl-12 pr-16 text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                    placeholder="Search companies by name, industry, or location..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={isLoading}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {/* Clear Button */}
                {keyword && !isLoading && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-14 flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                        aria-label="Clear search"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                )}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="absolute right-14 animate-spin text-blue-500">
                        <FiLoader className="w-5 h-5" />
                    </div>
                )}

                {/* Search Button */}
                <button
                    type="submit"
                    disabled={isLoading || !keyword.trim()}
                    className={`absolute right-0 h-full px-6 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium transition-all ${isLoading || !keyword.trim() ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-600 hover:to-blue-700 active:scale-95'}`}
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <FiLoader className="animate-spin mr-2" />
                            Searching
                        </span>
                    ) : (
                        'Search'
                    )}
                </button>
            </div>

            {/* Micro-interaction hint */}
            {!keyword && !isFocused && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to search
                </div>
            )}
        </form>
    );
};

export default SearchCompanyBar;