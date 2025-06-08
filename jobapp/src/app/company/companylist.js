import Link from 'next/link';
import { FiMapPin, FiPhone, FiMail, FiGlobe, FiBriefcase } from 'react-icons/fi';

const CompanyList = ({ company, isSearchResult }) => {
    return (
        <Link href={`/company/detail?id=${company.id}`} className="block group" style={{ textDecoration: 'none' }}>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 h-full flex flex-col">
                {/* Company Logo Header */}
                <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 flex justify-center">
                    <div className="relative h-24 w-24 rounded-full bg-white p-2 shadow-sm border border-gray-200 group-hover:border-blue-300 transition-colors">
                        <img
                            src={company.logo || '/default-company-logo.svg'}
                            alt={`${company.name} Logo`}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                                e.target.src = '/default-company-logo.svg';
                            }}
                        />
                    </div>
                </div>

                {/* Company Info */}
                <div className="p-6 flex-grow">
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-3 group-hover:text-blue-600 transition-colors">
                        {company.name}
                    </h2>

                    {/* Location */}
                    <div className="flex items-center justify-center text-gray-600 mb-4">
                        <FiMapPin className="mr-2 text-blue-500" />
                        <span className="text-sm">
                            {company.addressDetail}, {company.city}, {company.province}
                        </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-6">
                        {company.email && (
                            <div className="flex items-center text-sm text-gray-600">
                                <FiMail className="mr-2 text-blue-500 flex-shrink-0" />
                                <span className="truncate">{company.email}</span>
                            </div>
                        )}
                        
                        {company.phoneNumber && (
                            <div className="flex items-center text-sm text-gray-600">
                                <FiPhone className="mr-2 text-blue-500 flex-shrink-0" />
                                <span>{company.phoneNumber}</span>
                            </div>
                        )}
                        
                        {company.website && (
                            <div className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                                <FiGlobe className="mr-2 text-blue-500 flex-shrink-0" />
                                <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                            </div>
                        )}
                    </div>

                    {/* Jobs Available */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                            <FiBriefcase className="mr-1.5" />
                            {company.jobAmount || 0} Open Positions
                        </div>
                    </div>
                </div>

                {/* Hover Indicator */}
                <div className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
        </Link>
    );
};

export default CompanyList;