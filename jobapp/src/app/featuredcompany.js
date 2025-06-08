"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { motion } from 'framer-motion';

const FeaturedCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [isHovering, setIsHovering] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/company')
            .then(res => res.json())
            .then(data => {
                const filteredData = data.filter(company => company.jobAmount > 0)
                setCompanies(filteredData)
            })
    }, [])

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Trusted by Leading Companies</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover opportunities at top employers actively hiring
                    </p>
                </motion.div>

                <div
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className="relative"
                >
                    <Swiper
                        spaceBetween={30}
                        slidesPerView={1}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 5 }
                        }}
                        loop={true}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        }}
                        modules={[Autoplay, Navigation]}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        className="px-12"
                    >
                        {companies.map((company) => (
                            <SwiperSlide key={company.id}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center h-72"
                                    onClick={() => router.push(`/company/detail?id=${company.id}`)}
                                >
                                    <div className="w-32 h-32 flex items-center justify-center p-4 mb-4 bg-gray-50 rounded-lg">
                                        <img
                                            src={company.logo || '/default-company.svg'}
                                            alt={company.name}
                                            className="max-h-20 max-w-20 object-contain"
                                            onError={(e) => {
                                                e.target.src = '/default-company.svg';
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-3 min-h-[3rem]">{company.name}</h3>
                                    <div className="mt-auto">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {company.jobAmount} {company.jobAmount === 1 ? 'opening' : 'openings'}
                                        </span>
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Navigation Arrows */}
                    {!isHovering && (
                        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                            <button className="swiper-button-prev !left-0 !bg-white !shadow-lg !w-10 !h-10 !rounded-full !text-gray-700 hover:!bg-gray-100 transition-colors pointer-events-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button className="swiper-button-next !right-0 !bg-white !shadow-lg !w-10 !h-10 !rounded-full !text-gray-700 hover:!bg-gray-100 transition-colors pointer-events-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-center mt-10">
                    <button
                        onClick={() => router.push('/company')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700"
                    >
                        View All Companies
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeaturedCompanies;