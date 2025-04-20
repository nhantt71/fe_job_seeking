"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';


const FeaturedCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const router = useRouter();

    useEffect(()=>{
        fetch('/api/company')
            .then(res => res.json())
            .then(data => {
                const filteredData = data.filter(company => company.jobAmount > 0)
                setCompanies(filteredData)
            })
    }, [])



    return (
        <div className="container mx-auto mt-8 mb-10">
            <h1 className="text-3xl font-bold mb-6 text-black-700 text-black">Nhà tuyển dụng nổi bật</h1>
            <Swiper
                spaceBetween={30}
                slidesPerView={5}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                modules={[Autoplay]}
                className="mySwiper"
            >
                {companies.map((company) => (
                    <SwiperSlide key={company.id}>
                        <div className="p-4 shadow-lg rounded-lg bg-white flex justify-center" onClick={() => router.push('#')}>
                            <img src={company.logo} alt={company.name} className="w-48 h-48 object-contain"/>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default FeaturedCompanies;
