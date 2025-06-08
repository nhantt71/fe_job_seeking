import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiImage, FiLoader, FiAlertCircle, FiCheck } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const PhoneInput = dynamic(() => Promise.resolve(({ value, onChange }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        required
        pattern="[0-9]*"
        inputMode="numeric"
        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all text-black group-hover:border-indigo-300"
        style={{ WebkitAppearance: 'textfield', MozAppearance: 'textfield', appearance: 'textfield' }}
        placeholder="0xx-xxxxxxx"
    />
)), { ssr: false });

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [account, setAccount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!email || !password || !fullName || !phoneNumber || !avatar) {
            setError('All fields are required, including your profile picture');
            return;
        }

        if (phoneNumber.length !== 10) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", "candidate");
        formData.append("file", avatar);

        try {
            const registerResponse = await fetch("/api/auth/register", {
                method: "POST",
                body: formData,
            });

            if (!registerResponse.ok) {
                const errorText = await registerResponse.text();
                throw new Error(errorText || 'Registration failed. Please check your details.');
            }

            const contentType = registerResponse.headers.get("content-type");
            let savedAccount;
            if (contentType && contentType.includes("application/json")) {
                savedAccount = await registerResponse.json();
            } else {
                throw new Error("Unexpected response format from server.");
            }

            const candidateFormData = new FormData();
            candidateFormData.append("phoneNumber", phoneNumber);
            candidateFormData.append("fullname", fullName);
            candidateFormData.append("accountId", savedAccount.id);

            const createCandidateResponse = await fetch(
                "/api/candidate/create",
                {
                    method: "POST",
                    body: candidateFormData,
                }
            );

            if (!createCandidateResponse.ok) {
                const errorText = await createCandidateResponse.text();
                throw new Error(errorText || 'Error completing your profile. Please try again.');
            }

            setSuccess('Registration successful! Please check your email to verify your account. You will be redirected to login page...');
            setTimeout(() => router.push("/candidate/login"), 2000);
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || 'Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should be less than 2MB');
                return;
            }
            setAvatar(file);
            setError('');
        }
    };

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 10) {
            setPhoneNumber(value);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20 backdrop-blur-sm">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
                    <div className="relative z-10 py-8 px-8 text-center">
                        <h1 className="text-3xl font-bold text-white">Join Our Community</h1>
                        <p className="text-indigo-100 mt-2">Start your journey with us today</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 flex items-center gap-3 bg-red-50/80 text-red-600 p-4 rounded-lg border border-red-100 animate-fade-in">
                            <FiAlertCircle className="flex-shrink-0 text-lg" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 flex items-center gap-3 bg-green-50/80 text-green-600 p-4 rounded-lg border border-green-100 animate-fade-in">
                            <FiCheck className="flex-shrink-0 text-lg" />
                            <span className="text-sm">{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <FiUser />
                                </div>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-200 group-hover:border-indigo-300"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <FiPhone />
                                </div>
                                <PhoneInput
                                    value={phoneNumber}
                                    onChange={handlePhoneNumberChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <FiMail />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-200 group-hover:border-indigo-300"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <FiLock />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-200 group-hover:border-indigo-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <FiLock />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-200 group-hover:border-indigo-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <FiImage />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    required
                                    className="w-full pl-10 pr-3 py-2.5 text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-200 group-hover:border-indigo-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-md'}`}
                        >
                            {isLoading ? (
                                <>
                                    <FiLoader className="animate-spin mr-2" />
                                    Creating account...
                                </>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a
                            href="/candidate/login"
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Sign in
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Register = dynamic(() => Promise.resolve(RegisterForm), {
    ssr: false
});