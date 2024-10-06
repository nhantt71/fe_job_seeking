

const CompanyDetail = () => {
    return (
        <div className="bg-gray-100 min-h-screen text-black">
            <div className="container mx-auto p-5">
                <div className="bg-white rounded-lg shadow-md mb-5 p-5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <img
                                src="/sapo-logo.png"
                                alt="Sapo Logo"
                                className="w-20 h-20 mr-5"
                            />
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Công ty cổ phần Công nghệ Sapo
                                </h1>
                                <p className="text-gray-600">500-1000 nhân viên</p>
                                <p className="text-gray-600">523 người theo dõi</p>
                            </div>
                        </div>
                        <button className="bg-green-500 text-white py-2 px-5 rounded-lg">
                            + Theo dõi công ty
                        </button>
                    </div>
                    <div className="mt-5">
                        <a
                            href="https://tuyendung.sapo.vn"
                            className="text-blue-500 underline"
                        >
                            https://tuyendung.sapo.vn
                        </a>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex">
                    {/* Left Column (Company Introduction and Job Listings) */}
                    <div className="w-2/3">
                        {/* Company Introduction */}
                        <div className="bg-white rounded-lg shadow-md p-5 mb-5">
                            <h2 className="text-xl font-bold mb-3">Giới thiệu công ty</h2>
                            <p className="text-gray-700">
                                Sapo là nền tảng quản lý và bán hàng đa kênh hàng đầu Việt Nam,
                                được tin dùng bởi +230,000 nhà bán hàng. Sapo cung cấp giải pháp
                                toàn diện giúp doanh nghiệp tối ưu hiệu quả trên mọi kênh bán
                                hàng với phần mềm quản lý bán hàng Sapo POS...
                            </p>
                        </div>

                        {/* Job Listings */}
                        <div className="bg-white rounded-lg shadow-md p-5">
                            <h2 className="text-xl font-bold mb-3">Tuyển dụng</h2>

                            {/* Search Bar */}
                            <div className="flex items-center mb-5">
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Tìm công việc, vị trí ứng tuyển..."
                                // Add an onChange handler here to manage search functionality if needed
                                />
                                <button className="ml-3 bg-green-500 text-white px-5 py-2 rounded-lg">
                                    Tìm kiếm
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-gray-50 p-4 rounded-lg shadow">
                                    <h3 className="font-semibold">
                                        Nhân Viên Kinh Doanh Online Tại Văn Phòng
                                    </h3>
                                    <p className="text-gray-600">15 - 20 triệu</p>
                                    <p className="text-gray-500">
                                        Hà Nội/ Hồ Chí Minh - Còn 26 ngày để ứng tuyển
                                    </p>
                                    <button className="bg-green-500 text-white py-1 px-3 rounded mt-2">
                                        Ứng tuyển
                                    </button>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg shadow">
                                    <h3 className="font-semibold">
                                        Sales Online Phần Mềm SAPO POS - Có Hỗ Trợ Data
                                    </h3>
                                    <p className="text-gray-600">8 - 15 triệu</p>
                                    <p className="text-gray-500">
                                        Hà Nội/ Hồ Chí Minh - Còn 26 ngày để ứng tuyển
                                    </p>
                                    <button className="bg-green-500 text-white py-1 px-3 rounded mt-2">
                                        Ứng tuyển
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar */}
                    <div className="w-1/3 pl-5">
                        {/* Company Contact Information */}
                        <div className="bg-white rounded-lg shadow-md p-5 mb-5">
                            <h2 className="text-xl font-bold mb-3">Thông tin liên hệ</h2>
                            <p className="text-gray-700">
                                <strong>Địa chỉ công ty:</strong>
                                <br />
                                Tầng 6, Tòa Ladeco, 266 Đội Cấn, Quận Ba Đình, TP Hà Nội
                            </p>
                            <div className="mt-3">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6076160174883!2d105.81888981511482!3d21.007746493847415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab68f5bdb8d9%3A0x8eb995c25b77a8a4!2zMjY2IMSQLiDEkOG7kWkgQ8OibiwgVOG6oW5nIELhuqNuLCBCw6AgxJDDrG5oLCBUUC4gSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1695726747743!5m2!1svi!2s"
                                    width="100%"
                                    height="200"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>

                        {/* Other Sidebar Info */}
                        <div className="bg-white rounded-lg shadow-md p-5">
                            <h2 className="text-xl font-bold mb-3">Chia sẻ công ty tới bạn bè</h2>
                            <p className="text-gray-600">Sao chép đường dẫn</p>
                            {/* Add share buttons, copy link function, etc. */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetail;
