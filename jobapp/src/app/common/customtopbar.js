
const CustomTopBar = () => {
    return (
        <header className="bg-white shadow-md py-3 fixed top-0 left-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-0 flex justify-between items-center">

                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Seeking & Hiring Job</span>
                </div>

                <nav className="flex space-x-8 text-gray-800">
                    <a href="#" className="hover:text-green-600 text-sm">Jobs</a>
                    <a href="#" className="hover:text-green-600 text-sm">Profile & CV</a>
                    <a href="#" className="hover:text-green-600 text-sm">Company</a>
                </nav>

                <div className="flex items-center space-x-6">
                    <a href="#" className="text-gray-800 hover:text-green-600 text-sm">
                        Bạn là nhà tuyển dụng? <span className="font-semibold">Đăng tuyển ngay</span>
                    </a>
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-600 hover:text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a7.002 7.002 0 00-6-6.917V3a2 2 0 10-4 0v1.083A7.002 7.002 0 002 11v3.158c0 .538-.214 1.055-.595 1.437L0 17h5m4 0v2a2 2 0 104 0v-2m-4 0h4"></path>
                            </svg>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 13v-2a7 7 0 00-14 0v2m14 0a5 5 0 01-10 0m10 0v5a2 2 0 11-4 0v-5m4 0H5"></path>
                            </svg>
                        </a>
                        <div className="relative">
                            <button className="flex items-center space-x-2 focus:outline-none">
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src="https://res.cloudinary.com/dsp3ymism/image/upload/v1727003509/wmxpdyr6oftjnzcyrusr.jpg"
                                    alt="User Profile"
                                />
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
};

export default CustomTopBar;
