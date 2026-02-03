import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router';
import SocialLogin from '../SocialLogin/SocialLogin';
import axios from 'axios';
import { FaBuilding, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaUser, FaCamera } from 'react-icons/fa';
import useAxiosSecure from '../../../hooks/useAxiosSecure';


const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { registerUser, updateUserProfile } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // console.log('in register', location)

    const axiosSecure = useAxiosSecure();


    const handleRegistration = (data) => {

        // console.log('after register', data.photo[0]);
        const profileImg = data.photo[0];

        registerUser(data.email, data.password)
            .then(result => {
                // console.log(result.user);

                // 1. store the image in form data
                const formData = new FormData();
                formData.append('image', profileImg);

                // 2. send the photo to store and get the ul
                const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`

                axios.post(image_API_URL, formData)
                    .then(res => {
                        // console.log('after image upload', res.data.data.url)

                        // update user profile to firebase
                        const userProfile = {
                            displayName: data.name,
                            photoURL: res.data.data.url
                        }

                        // user data save in db
                        const userData = {
                            name: data.name,
                            email: data.email,
                            photoURL: res.data.data.url,
                            phoneNumber: "",
                            address: "",
                            memberSince: new Date(),
                            isPremium: false,
                            isBlocked: false,
                            role: "citizen",
                            issueCount: 0,
                            totalPayment: 0
                        }
                        axiosSecure.post('/citizensUser', userData)
                            .then()
                            .catch()

                        updateUserProfile(userProfile)
                            .then(() => {
                                // console.log('user profile updated done.')
                                navigate(location.state || '/');
                            })
                            .catch(error => console.log(error))
                    })

            })
            .catch(error => {
                console.log(error)
            })
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-lg"
            >
                {/* Background Decorative Elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-xl"></div>

                <div className="card bg-white/80 backdrop-blur-sm shadow-2xl border border-gray-100">
                    {/* Card Header with Infrastructure Theme */}
                    <div className="card-body p-8">
                        {/* Logo/Title Section */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                                <FaBuilding className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                City<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Fix</span>
                            </h1>
                            <p className="text-gray-600 mt-2">Public Infrastructure Issue Reporting System</p>
                        </div>

                        {/* Welcome Message */}
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join CityFix</h2>
                            <p className="text-gray-600">
                                Create an account to report issues and help improve our city infrastructure
                            </p>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit(handleRegistration)}>
                            <div className="space-y-6">
                                {/* Name Field */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                                            <FaUser className="w-4 h-4" />
                                            Full Name
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            {...register('name', { required: 'Name is required' })}
                                            placeholder="John Doe"
                                            className={`input input-bordered w-full pl-12 ${errors.name ? 'input-error' : 'focus:input-primary'}`}
                                        />
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <FaUser className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {errors.name && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-red-500 text-sm mt-2 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                {errors.name.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Photo Upload Field */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                                            <FaCamera className="w-4 h-4" />
                                            Profile Photo
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            {...register('photo', { required: 'Profile photo is required' })}
                                            className="file-input file-input-bordered w-full pl-7"
                                        />
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <FaCamera className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {errors.photo && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-red-500 text-sm mt-2 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                {errors.photo.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Email Field */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                                            <FaEnvelope className="w-4 h-4" />
                                            Email Address
                                        </span>
                                    </label>
                                    <div className="relative">
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
                                            className={`input input-bordered w-full pl-12 ${errors.email ? 'input-error' : 'focus:input-primary'}`}
                                        />
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <FaEnvelope className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {errors.email && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-red-500 text-sm mt-2 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                {errors.email.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Password Field */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                                            <FaLock className="w-4 h-4" />
                                            Password
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: {
                                                    value: 6,
                                                    message: 'Password must be at least 6 characters'
                                                },
                                                pattern: {
                                                    value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                                                    message: 'Password must contain uppercase, lowercase, number, and special character'
                                                }
                                            })}
                                            placeholder="••••••••"
                                            className={`input input-bordered w-full pl-12 pr-12 ${errors.password ? 'input-error' : 'focus:input-primary'}`}
                                        />
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <FaLock className="w-5 h-5" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {errors.password && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-red-500 text-sm mt-2 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                {errors.password.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Register Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`btn text-white bg-linear-to-r from-green-500 to-emerald-600 hover:from-white hover:to-white hover:text-green-500 hover:bg-white w-full btn-lg shadow-lg hover:shadow-xl transition-all duration-300 ${isLoading ? 'loading' : ''}`}
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="divider my-8">OR</div>

                        {/* Social Login */}
                        <SocialLogin />

                        {/* Login Link */}
                        <div className="text-center mt-8">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    state={location.state}
                                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Join our community to make our city better
                            </p>
                        </div>
                    </div>
                </div>

                {/* Feature Highlights */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Report Infrastructure Issues</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Track Resolution Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Engage with Community</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;