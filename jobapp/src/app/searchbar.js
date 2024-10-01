'use client';
import { useEffect, useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8080/api/category')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/')
            .then(res => res.json())
            .then(data => setCities(data));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({
            keyword,
            province: selectedProvince,
            categoryId: selectedCategory,
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

                {/* Chọn thành phố */}
                <select
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                    style={{ color: 'black' }}
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                >
                    <option value="" disabled>Chọn thành phố</option>
                    {cities.map((city) => (
                        <option value={city.name} key={city.code}>
                            {city.name}
                        </option>
                    ))}
                </select>

                {/* Chọn danh mục công việc */}
                <select
                    className="text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="" disabled>Chọn danh mục</option>
                    {categories.map((category) => (
                        <option value={category.name} key={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
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

export default SearchBar;
