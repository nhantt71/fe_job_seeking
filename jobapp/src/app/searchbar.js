'use client';
import { useEffect, useState } from 'react';

const SearchBar = () => {
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [isLoading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedCity, setSelectedCity] = useState('')
    const [job, setJob] = useState('')
    
    useEffect(() => {
        fetch('http://localhost:8080/api/category')
            .then(res => res.json())
            .then(data => {
                setCategories(data)
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/')
            .then(res => res.json())
            .then(data => setCities(data))
    }, [])

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Keyword:', keyword, 'City:', cities, 'Category:', categories);
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

                <select
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                    style={{ color: 'black' }}
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    <option value="" disabled>Chọn thành phố</option>
                    {cities.map((city) => (
                        <option value={city.name}>
                            {city.name}
                        </option>
                    ))}
                </select>

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