'use client';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-10">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                    <h2 className="text-xl font-bold mb-4">Trong Nhan's Company</h2>
                    <p>
                        Address: Go Vap, Ho Chi Minh, Vietnam
                    </p>
                    <p>Email: tonhanlk7103@gmail.com</p>
                    <p>Phone: +84 916 072 042</p>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">Quick Links</h2>
                    <ul className="space-y-2">
                        <li>
                            <a href="#" className="hover:text-green-400">About Us</a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-green-400">Privacy Policy</a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-green-400">Terms of Service</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">Follow Us</h2>
                    <div className="flex space-x-4">
                        <a href="https://www.facebook.com/profile.php?id=100035672183201" className="hover:text-green-400">
                            <i className="fab fa-facebook-f"></i> Facebook
                        </a>
                        <a href="https://github.com/nhantt71" className="hover:text-green-400">
                            <i className="fab fa-twitter"></i> Github
                        </a>
                        <a href="https://www.linkedin.com/in/nh%C3%A2n-t%C3%B4-41873b298/" className="hover:text-green-400">
                            <i className="fab fa-linkedin"></i> LinkedIn
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-10 text-center border-t border-gray-700 pt-6">
                <p>&copy; 2024 Trong Nhan. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
