'use client';
import { useEffect, useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [isLoading, setLoading] = useState(true);

    // Fetch job categories from the API
    useEffect(() => {
        fetch('http://localhost:8080/api/category')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });
    }, []);

    // Fetch provinces from the API
    useEffect(() => {
        fetch('http://localhost:8080/api/v1/locations/provinces')
            .then(res => res.json())
            .then(data => setCities(data))
            .catch((error) => {
                console.error('Error fetching cities:', error);
            });
    }, []);

    // Handle form submission for search
    const handleSearch = (e) => {
        e.preventDefault();

        // Check if any search parameters are filled
        if (keyword || selectedProvince || selectedCategory) {
            onSearch({
                keyword,
                province: selectedProvince,
                categoryId: selectedCategory,
            });
        } else {
            // If no search parameters, fetch all jobs
            onSearch(); // Assuming `onSearch` can handle an empty call to fetch all jobs
        }
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
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                >
                    <option value="" disabled>Chọn thành phố</option>
                    {cities.map((city, index) => (
                        <option value={city} key={index}>
                            {city}
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
