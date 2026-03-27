"use client";

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiArrowLeft, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '@/provider/AuthProvider';
import config from '@/config';

const SigninMain = (props) => {
    return (
        <Suspense fallback={
            <div className={props.isModal ? '' : 'max-w-lg w-full mx-auto rounded bg-white shadow-xl p-6 sm:p-8 md:p-10'}>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#32BBAB]"></div>
                </div>
            </div>
        }>
            <SigninMainContent {...props} />
        </Suspense>
    );
};

const SigninMainContent = ({ isModal = false }) => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(null);
    const [forgotPasswordError, setForgotPasswordError] = useState(null);
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

    const { login, loading, error } = useAuth();
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loginSuccess = await login(credentials, config.tenantId);

            if (loginSuccess) {
                await new Promise(resolve => setTimeout(resolve, 50));
                const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotPasswordLoading(true);
        setForgotPasswordError(null);
        setForgotPasswordSuccess(null);

        try {
            // Use forgotPasswordEmail instead of hardcoded email
            const response = await fetch('/api/auth/request-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reset email');
            }

            setForgotPasswordSuccess(data.message || 'Reset link sent to your email');
            setForgotPasswordEmail('');
        } catch (err) {
            console.error('Password reset error:', err);
            setForgotPasswordError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setForgotPasswordLoading(false);
        }
    };
    const handleGuestCheckout = () => {
        router.push('/checkout');
    };

    const toggleForgotPassword = () => {
        setShowForgotPassword(!showForgotPassword);
        setForgotPasswordEmail(credentials.email);
        setForgotPasswordSuccess(null);
        setForgotPasswordError(null);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={isModal ? '' : 'max-w-lg w-full mx-auto  rounded bg-white shadow-xl p-6 sm:p-8 md:p-10'}>
            {!showForgotPassword ? (
                <SigninView
                    credentials={credentials}
                    error={error}
                    loading={loading}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleGuestCheckout={handleGuestCheckout}
                    toggleForgotPassword={toggleForgotPassword}
                    showPassword={showPassword}
                    togglePasswordVisibility={togglePasswordVisibility}
                />
            ) : (
                <ForgotPasswordView
                    email={forgotPasswordEmail}
                    loading={forgotPasswordLoading}
                    error={forgotPasswordError}
                    success={forgotPasswordSuccess}
                    setEmail={setForgotPasswordEmail}
                    handleSubmit={handleForgotPassword}
                    toggleForgotPassword={toggleForgotPassword}
                />
            )}
        </div>
    );
};

const SigninView = ({
    credentials,
    error,
    loading,
    handleChange,
    handleSubmit,
    handleGuestCheckout,
    toggleForgotPassword,
    showPassword,
    togglePasswordVisibility
}) => (
    <div className="space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
            </h2>
            <p className="text-gray-600 text-lg">Sign in to continue</p>
        </div>

        {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex">
                    <div className="shrink-0">
                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                </label>
                <div className="relative rounded shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={credentials.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#32BBAB] focus:border-[#32BBAB] transition-all placeholder-gray-400"
                        required
                        autoComplete="email"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <button
                        type="button"
                        onClick={toggleForgotPassword}
                        className="text-sm font-medium text-[#5b9790] hover:text-[#32BBAB] transition-colors"
                    >
                        Forgot password?
                    </button>
                </div>
                <div className="relative rounded shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#32BBAB] focus:border-[#32BBAB] transition-all placeholder-gray-400"
                        required
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    >
                        {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="pt-1">
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent transition ease-in-out duration-300 rounded shadow-sm text-lg font-medium text-white bg-linear-to-r from-teal-500 to-[#32BBAB] hover:from-[#3c7871] hover:to-[#32BBAB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32BBAB] ${loading ? 'opacity-80' : ''}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </>
                    ) : 'Sign In'}
                </button>
            </div>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with</span>
            </div>
        </div>

        <div className="grid gap-4">
            <button
                onClick={handleGuestCheckout}
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
                <FiUser className="mr-3 h-5 w-5 text-[#32BBAB]" />
                Continue as Guest
            </button>
        </div>

        <div className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-[#5b9790] hover:text-[#32BBAB] transition-colors">
                Sign up
            </Link>
        </div>
    </div>
);

const ForgotPasswordView = ({
    email,
    loading,
    error,
    success,
    setEmail,
    handleSubmit,
    toggleForgotPassword
}) => (
    <div className="space-y-6">
        <button
            onClick={toggleForgotPassword}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
            <FiArrowLeft className="mr-2" />
            Back to sign in
        </button>

        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Reset Password
            </h2>
            <p className="text-gray-600 text-lg">Enter your email to receive a reset link</p>
        </div>

        {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex">
                    <div className="shrink-0">
                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        )}

        {success && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <div className="flex">
                    <div className="shrink-0">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                    Email Address
                </label>
                <div className="relative rounded shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        id="resetEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#32BBAB] focus:border-[#5b9790] transition-all placeholder-gray-400"
                        required
                        autoComplete="email"
                    />
                </div>
            </div>

            <div className="pt-1">
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded shadow-sm text-lg font-medium text-white bg-linear-to-r from-[#5b9790] to-[#32BBAB] hover:from-[#5b9790] hover:to-[#5b9790] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32BBAB] transition-all ${loading ? 'opacity-80' : ''}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                        </>
                    ) : 'Send Reset Link'}
                </button>
            </div>
        </form>
    </div>
);

export default SigninMain;