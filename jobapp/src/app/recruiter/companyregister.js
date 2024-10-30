'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function CompanyRegister({ account }) {
    const [companyName, setCompanyName] = useState('');
    const [companyLogo, setCompanyLogo] = useState(null);
    const [existingCompanies, setExistingCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    
    // New state variables for additional fields
    const [email, setEmail] = useState('');
    const [information, setInformation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [website, setWebsite] = useState('');
    const [city, setCity] = useState('');
    const [detail, setDetail] = useState('');
    const [province, setProvince] = useState('');
    
    const router = useRouter();

    // Fetch existing companies on component mount
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/companies');
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
        if (file) {
            setCompanyLogo(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCompany && !companyName) {
            alert('Please select an existing company or create a new one.');
            return;
        }

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

        try {
            const response = await fetch('http://localhost:8080/api/companies', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to register company');
            }

            // Redirect to the recruiter information page
            router.push('/recruiter/recruiter-information'); // Adjust the path as needed
        } catch (err) {
            console.error(err.message || 'An error occurred during company registration');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-md shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Company Registration</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Existing Company</h3>
                    <select
                        value={selectedCompany}
                        onChange={(e) => {
                            setSelectedCompany(e.target.value);
                            if (e.target.value) {
                                // Clear new company fields if an existing company is selected
                                setCompanyName('');
                                setEmail('');
                                setInformation('');
                                setPhoneNumber('');
                                setWebsite('');
                                setCity('');
                                setDetail('');
                                setProvince('');
                            }
                        }}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a company</option>
                        {existingCompanies.map((company) => (
                            <option key={company.id} value={company.name}>
                                {company.name}
                            </option>
                        ))}
                    </select>

                    <h3 className="text-lg font-semibold">OR Create New Company</h3>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Company Name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            disabled={selectedCompany !== ''}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={selectedCompany !== ''}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Information</label>
                        <textarea
                            value={information}
                            onChange={(e) => setInformation(e.target.value)}
                            disabled={selectedCompany !== ''}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={selectedCompany !== ''}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Website</label>
                        <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            disabled={selectedCompany !== ''}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Company Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCompanyLogoChange}
                            className="w-full border rounded-md"
                        />
                        {companyLogo && (
                            <img
                                src={companyLogo}
                                alt="Company Logo Preview"
                                className="mt-2 h-20 w-20 object-cover rounded-full"
                            />
                        )}
                    </div>

                    <h3 className="text-lg font-semibold">Address</h3>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={selectedCompany !== ''}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Detail</label>
                        <input
                            type="text"
                            value={detail}
                            onChange={(e) => setDetail(e.target.value)}
                            disabled={selectedCompany !== ''}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Province</label>
                        <input
                            type="text"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            disabled={selectedCompany !== ''}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
