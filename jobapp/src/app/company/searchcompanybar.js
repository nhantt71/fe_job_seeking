'use client';
import { useState } from 'react';

const SearchCompanyBar = ({ onSearch }) => {
    const [keyword, setKeyword] = useState('');
    const [isLoading, setLoading] = useState(true);

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({
            keyword
        });
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
            <div className="flex space-x-2 w-full">
                <input
                    style={{ color: 'black' }}
                    type="text"
                    className="border border-gray-300 rounded-lg px-4 py-2 flex-grow focus:outline-none"
                    placeholder="Nhập từ khóa tìm kiếm"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>

            <button
                type="submit"
                className="bg-green-500 text-white px-10 rounded-lg hover:bg-green-600 focus:outline-none ml-4"
            >
                Tìm kiếm
            </button>
        </form>
    );
};

export default SearchCompanyBar;
