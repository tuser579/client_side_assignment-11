import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router';
import SocialLogin from '../SocialLogin/SocialLogin';
import axios from 'axios';
import { FaBuilding, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaUser, FaCamera } from 'react-icons/fa';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const ErrorMsg = ({ msg }) => (
    <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1.5"
    >
        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        {msg}
    </motion.p>
);

const InputField = ({ icon, error, children }) => (
    <div>
        <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                {icon}
            </div>
            {children}
        </div>
        <AnimatePresence>
            {error && <ErrorMsg msg={error.message} />}
        </AnimatePresence>
    </div>
);

const inputClass = (hasError) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
    bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
    ${hasError
        ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10'
        : 'border-gray-200 dark:border-gray-600'
    }`;

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { registerUser, updateUserProfile } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) setPhotoPreview(URL.createObjectURL(file));
    };

    const handleRegistration = (data) => {
        setIsLoading(true);
        const profileImg = data.photo[0];

        registerUser(data.email, data.password)
            .then(() => {
                const formData = new FormData();
                formData.append('image', profileImg);

                const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`;

                axios.post(image_API_URL, formData).then(res => {
                    const userProfile = { displayName: data.name, photoURL: res.data.data.url };
                    const userData = {
                        name: data.name, email: data.email,
                        photoURL: res.data.data.url, phoneNumber: '',
                        address: '', memberSince: new Date(),
                        isPremium: false, isBlocked: false,
                        role: 'citizen', issueCount: 0, totalPayment: 0
                    };
                    axiosSecure.post('/citizensUser', userData).then().catch();
                    updateUserProfile(userProfile)
                        .then(() => navigate(location.state || '/'))
                        .catch(console.log);
                });
            })
            .catch(console.log)
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden py-5 sm:py-12">

            {/* Ambient blobs */}
            <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-[120px]" />

            {/* Grid texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{
                    backgroundImage: `linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px'
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Top gradient bar */}
                    <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />

                    <div className="p-8 sm:p-10">

                        {/* Logo */}
                        <div className="text-center mb-7">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
                                <FaBuilding className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                City<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Fix</span>
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium tracking-wide uppercase">
                                Public Infrastructure Reporting
                            </p>
                        </div>

                        {/* Heading */}
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Join CityFix</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Create an account and help improve your city
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(handleRegistration)} className="space-y-4">

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                    Full Name
                                </label>
                                <InputField icon={<FaUser className="w-4 h-4" />} error={errors.name}>
                                    <input
                                        type="text"
                                        {...register('name', { required: 'Name is required' })}
                                        placeholder="John Doe"
                                        className={inputClass(errors.name)}
                                    />
                                </InputField>
                            </div>

                            {/* Photo Upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                    Profile Photo
                                </label>
                                <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
                                    bg-gray-50 dark:bg-gray-700/60
                                    ${errors.photo
                                        ? 'border-red-400 dark:border-red-500'
                                        : 'border-gray-200 dark:border-gray-600'
                                    }`}
                                >
                                    {/* Preview */}
                                    <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-600 overflow-hidden shrink-0 flex items-center justify-center">
                                        {photoPreview
                                            ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                                            : <FaCamera className="w-4 h-4 text-gray-400" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <label className="cursor-pointer">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                                Choose photo
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">or drag & drop</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                {...register('photo', { required: 'Profile photo is required' })}
                                                onChange={(e) => {
                                                    register('photo').onChange(e);
                                                    handlePhotoChange(e);
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {errors.photo && <ErrorMsg msg={errors.photo.message} />}
                                </AnimatePresence>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                    Email Address
                                </label>
                                <InputField icon={<FaEnvelope className="w-4 h-4" />} error={errors.email}>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        placeholder="citizen@example.com"
                                        className={inputClass(errors.email)}
                                    />
                                </InputField>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                            pattern: {
                                                value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                                                message: 'Must include uppercase, lowercase, number & special character'
                                            }
                                        })}
                                        placeholder="••••••••"
                                        className={`${inputClass(errors.password)} pr-11`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {errors.password && <ErrorMsg msg={errors.password.message} />}
                                </AnimatePresence>

                                {/* Password hints */}
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {['Uppercase', 'Lowercase', 'Number', 'Special char'].map(hint => (
                                        <span key={hint} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-full">
                                            {hint}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-6 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">or continue with</span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* Social Login */}
                        <SocialLogin />

                        {/* Login link */}
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                state={location.state}
                                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Feature pills */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 flex flex-wrap justify-center gap-3"
                >
                    {[
                        { dot: 'bg-green-500',  label: 'Report Issues' },
                        { dot: 'bg-blue-500',   label: 'Track Progress' },
                        { dot: 'bg-purple-500', label: 'Engage Community' },
                    ].map((f) => (
                        <div
                            key={f.label}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm"
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{f.label}</span>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;