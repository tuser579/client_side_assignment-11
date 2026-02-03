import { useRef, useState } from 'react';
import {
    Shield,
    CheckCircle,
    AlertCircle,
    CreditCard,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Star,
    Crown,
    Bell,
    Settings,
    Award,
    Zap,
    Lock,
    Eye,
    EyeOff,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { HiUser } from 'react-icons/hi';
import axios from 'axios';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import Swal from "sweetalert2";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
    const { user, updateUserProfile } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: singUser = {}, refetch } = useQuery({
        queryKey: ['singleUser', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/singleUser?email=${user.email}`);
            return res.data;
        }
    })

    // Form state - initialize with default values or fetched data
    const [formData, setFormData] = useState({
        name: singUser?.name,
        email: singUser?.email,
        phoneNumber: singUser?.phoneNumber,
        photoURL: singUser?.photoURL,
        address: singUser?.address,
        memberSince: singUser?.memberSince,
        isPremium: singUser?.isPremium,
        isBlocked: singUser?.isBlocked,
        issueCount: singUser?.issueCount,
        successfulReports: 18,
        citizenScore: 85,
    });

    const fileInputRef = useRef(null);

    const handleEditProfileImage = () => {
        // Trigger the hidden file input when edit icon is clicked
        fileInputRef.current?.click();
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            // Validate file type
            const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
            if (!validImageTypes.includes(file.type)) {
                Swal.fire({
                    icon: "error",
                    title: "Invalid File Type",
                    text: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
                });
                return;
            }

            // Validate file size (e.g., 5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                Swal.fire({
                    icon: "warning",
                    title: "File Too Large",
                    text: "File size should be less than 5MB",
                });
                return;
            }

            // Ask for confirmation before proceeding
            Swal.fire({
                title: "Confirm Upload",
                text: "Do you want to use this image as your profile picture?",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, upload it!",
            }).then((result) => {
                if (result.isConfirmed) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        // Update formData with the preview image
                        setFormData((prev) => ({
                            ...prev,
                            photoURL: e.target.result,
                        }));

                        // Success notification
                        Swal.fire({
                            icon: "success",
                            title: "Image Selected",
                            text: "Your image has been validated and uploaded!",
                        });

                        // Upload the image to server or store file for later
                        handleImageUpload(file);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    };

    // Optional: Function to upload image to server
    const handleImageUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`;

            const response = await axios.post(image_API_URL, formData);

            // Update the profile image URL in your database
            const imageUrl = response.data.data.url;

            // Update in Firebase (if using Firebase)
            if (user) {
                const userProfile = {
                    photoURL: imageUrl
                };
                await updateUserProfile(userProfile);

                // Also update in your MongoDB
                axiosSecure.patch(`/userPhotoUpdate/${singUser?._id}`, {
                    photoURL: imageUrl
                })
                    .then(res => {
                        console.log(res);
                        refetch();
                    })
                    .catch(error => { console.log(error) })
            }

            return imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };


    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Update formData when API data is fetched
    useState(() => {
        if (singUser && Object.keys(singUser).length > 0) {
            setFormData(prev => ({
                ...prev,
                ...singUser
            }));
        }
    }, [singUser]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle password change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdatePassword = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        // Validate current password is provided
        if (!passwordData.currentPassword?.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Missing Password",
                text: "Please enter your current password.",
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        // Validate new passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Password Mismatch",
                text: "New password and confirmation do not match.",
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        // Validate new password meets requirements (optional but recommended)
        if (passwordData.newPassword.length < 6) {
            Swal.fire({
                icon: "warning",
                title: "Weak Password",
                text: "Password must be at least 6 characters long.",
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        // Show confirmation dialog
        const confirmation = await Swal.fire({
            title: "Confirm Password Change",
            text: "This action will update your password. Make sure you remember your new password.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Update Password",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            backdrop: true,
            allowOutsideClick: false
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        try {
            // Reauthenticate user with current password
            const credential = EmailAuthProvider.credential(
                user.email,
                passwordData.currentPassword
            );

            await reauthenticateWithCredential(user, credential);

            // Update to new password
            await updatePassword(user, passwordData.newPassword);

            // Success notification
            await Swal.fire({
                icon: "success",
                title: "Password Updated!",
                text: "Your password has been changed successfully.",
                confirmButtonColor: "#3085d6",
                timer: 2000,
                showConfirmButton: false
            });

            // Reset form data
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            // Optional: Log user activity
            console.log("Password updated successfully for user:", user.email);

        } catch (error) {
            console.error("Password update error:", error);

            // Handle specific Firebase authentication errors
            let errorMessage = "An unexpected error occurred. Please try again.";
            let errorTitle = "Update Failed";

            switch (error.code) {
                case "auth/wrong-password":
                    errorMessage = "The current password you entered is incorrect.";
                    errorTitle = "Incorrect Password";
                    break;
                case "auth/too-many-requests":
                    errorMessage = "Too many failed attempts. Please try again later.";
                    errorTitle = "Too Many Attempts";
                    break;
                case "auth/weak-password":
                    errorMessage = "New password is too weak. Please use a stronger password.";
                    errorTitle = "Weak Password";
                    break;
                case "auth/requires-recent-login":
                    errorMessage = "This operation requires recent authentication. Please sign in again.";
                    errorTitle = "Reauthentication Required";
                    break;
                default:
                    errorMessage = error.message || errorMessage;
            }

            Swal.fire({
                icon: "error",
                title: errorTitle,
                text: errorMessage,
                confirmButtonColor: "#3085d6"
            });
        }
    };

    const handleSaveProfile = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to save these profile changes?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, save it!"
        }).then((result) => {
            if (result.isConfirmed) {
                // Close editing mode
                setIsEditing(false);

                // API call to update user
                axiosSecure.patch(`/updateUser/${singUser?._id}`, formData)
                    .then(res => {
                        const userProfile = {
                            displayName: formData?.name,
                        };

                        updateUserProfile(userProfile)
                            .then(() => {
                                console.log(formData, user);
                                Swal.fire("Success", "Profile updated successfully!", "success");
                            })
                            .catch((error) => {
                                console.error(error);
                                Swal.fire("Error", error.message, "error");
                            });

                        refetch();
                    })
                    .catch((error) => {
                        console.error(error);
                        Swal.fire("Error", "Failed to update profile.", "error");
                    });
            }
        });
    };

    const handleSubscribe = async () => {
        // Check if user is blocked
        if (singUser?.isBlocked) {
            showBlockedAccountAlert();
            return;
        }

        // Show subscription confirmation
        const isConfirmed = await confirmSubscription();
        if (!isConfirmed) return;

        // Process payment
        await processPayment();
    };

    // Helper functions
    const showBlockedAccountAlert = () => {
        toast.error('Your account is blocked. Please contact authorities.', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    };

    const confirmSubscription = async () => {
        const result = await Swal.fire({
            title: 'Confirm Subscription',
            text: 'Do you want to proceed with Premium Subscription?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, proceed',
            cancelButtonText: 'Cancel'
        });

        return result.isConfirmed;
    };

    const processPayment = async () => {
        const paymentInfo = {
            cost: 1000,
            userID: singUser?._id,
            name: singUser?.name,
            email: singUser?.email,
            type: 'Premium Subscription',
            totalPayment: singUser.totalPayment + 1000
        };

        try {
            const res = await axiosSecure.post('/create-checkout-session', paymentInfo);
            console.log(res.data);

            Swal.fire({
                icon: 'success',
                title: 'Redirecting...',
                text: 'You will be redirected to payment gateway.',
                timer: 3000,
                showConfirmButton: false
            });

            // Add a small delay to allow user to see the success message
            setTimeout(() => {
                window.location.assign(res.data.url);
            }, 1500);
        } catch (error) {
            console.error('Payment error:', error);

            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: 'Something went wrong. Please try again later.'
            });
        }
    };


    // Stats cards data
    const stats = [
        {
            title: 'Total Reports',
            value: singUser?.issueCount,
            icon: <AlertCircle className="w-6 h-6" />,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Successful Reports',
            value: formData.successfulReports,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Citizen Score',
            value: formData.citizenScore,
            icon: <Award className="w-6 h-6" />,
            color: 'bg-amber-100 text-amber-600',
        },
    ];

    // Premium benefits
    const premiumBenefits = [
        'Unlimited issue submissions',
        'Priority support (24-48h response)',
        'Advanced analytics dashboard',
        'Direct communication channel',
        'Verified citizen badge',
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">

            {/* for notification */}
            <ToastContainer />

            {/* Blocked User Warning */}
            {singUser?.isBlocked && (
                <div className="mb-6">
                    <div className="alert alert-error shadow-lg">
                        <AlertCircle className="w-6 h-6" />
                        <div>
                            <h3 className="font-bold">Account Blocked</h3>
                            <div className="text-xs">
                                Your account has been temporarily blocked by the administration.
                                Please contact the authorities at{' '}
                                <a href="tel:+8809609333222" className="font-semibold underline">
                                    +880 9609 333222
                                </a>{' '}
                                or email{' '}
                                <a href="mailto:support@infra.gov" className="font-semibold underline">
                                    support@infra.gov
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className='mx-auto'>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mx-auto">
                                My Profile
                            </h1>
                            {singUser?.isPremium && (
                                <div className="badge badge-lg bg-linear-to-r from-yellow-500 to-amber-500 border-0 text-white gap-1">
                                    <Crown className="w-4 h-4" />
                                    Premium
                                </div>
                            )}
                        </div>
                        <p className="text-gray-600 mt-2">
                            Manage your account and subscription settings
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Info & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body p-6 md:p-8">
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                <div className='space-y-4 flex flex-col items-center lg:items-start'>

                                    <div>
                                        {/* Hidden file input */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />

                                        {/* Profile Image Section */}
                                        <div className="relative w-32 h-32 mx-auto mb-4">
                                            {singUser?.photoURL ? (
                                                <div className="relative w-full h-full group">
                                                    <img
                                                        src={singUser?.photoURL}
                                                        alt={singUser?.name}
                                                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                                                    />
                                                    {/* Edit icon overlay */}
                                                    <button
                                                        type="button"
                                                        onClick={handleEditProfileImage}
                                                        className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full shadow-lg border-2 border-white hover:bg-blue-600 transition-all duration-200 group-hover:scale-110"
                                                        title="Change profile picture"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-white"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative w-full h-full group">
                                                    <div className="flex items-center justify-center w-full h-full rounded-full bg-linear-to-r from-blue-400 to-purple-500 text-white text-4xl font-bold border-4 border-white shadow-lg">
                                                        {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    {/* Edit icon overlay for placeholder */}
                                                    <button
                                                        type="button"
                                                        onClick={handleEditProfileImage}
                                                        className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full shadow-lg border-2 border-white hover:bg-blue-600 transition-all duration-200 group-hover:scale-110"
                                                        title="Upload profile picture"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-white"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Profile Info */}
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-blue-800 text-center flex items-center gap-2">
                                            {singUser?.name}  {singUser?.isPremium && (
                                                <div className="bg-linear-to-r from-yellow-500 to-amber-500 rounded-full p-1">
                                                    <Crown className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </h2>
                                        <p className="text-gray-500 flex items-center gap-2 mt-1 justify-center lg:justify-start">
                                            <Mail className="w-4 h-4" />
                                            {singUser?.email}
                                        </p>
                                    </div>
                                </div>

                                {/* User Stats */}
                                <div className="flex-1">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {stats.map((stat, index) => (
                                            <div
                                                key={index}
                                                className={`${stat.color} p-4 rounded-lg flex items-center gap-3`}
                                            >
                                                {stat.icon}
                                                <div>
                                                    <p className="text-sm font-medium">{stat.title}</p>
                                                    <p className="text-xl font-bold">{stat.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Profile Form */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="card-title text-gray-800">
                                    <HiUser className="w-6 h-6 mr-2" />
                                    Personal Information
                                </h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn btn-outline btn-sm"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                // Reset form data from API data if available
                                                if (singUser && Object.keys(singUser).length > 0) {
                                                    setFormData(singUser);
                                                }
                                            }}
                                            className="btn btn-ghost btn-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button onClick={handleSaveProfile} className="btn bg-blue-500 text-white hover:w-27 hover:bg-blue-700 btn-sm">
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="form-control flex flex-col gap-2">
                                    <label className="label">
                                        <span className="label-text text-[1.1rem] font-bold">Full Name</span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                        />
                                    ) : (
                                        <p className="text-gray-700">{singUser?.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="form-control flex flex-col gap-2">
                                    <label className="label mr-1.5">
                                        <span className="label-text text-[1.1rem] font-bold">Email</span>
                                    </label>

                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="w-4 h-4" />
                                        {singUser?.email}
                                    </div>
                                </div>


                                {/* Phone */}
                                <div className="form-control flex flex-col gap-2">
                                    <label className="label">
                                        <span className="label-text text-[1.1rem] font-bold">Phone Number</span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone className="w-4 h-4" />
                                            {singUser?.phone}
                                        </div>
                                    )}
                                </div>

                                {/* Address */}
                                <div className="form-control md:col-span-2 flex flex-col gap-2">
                                    <label className="label mr-2">
                                        <span className="label-text text-[1.1rem] font-bold">Address</span>
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="textarea textarea-bordered h-24"
                                        />
                                    ) : (
                                        <div className="flex items-start gap-2 text-gray-700">
                                            <MapPin className="w-4 h-4 mt-1" />
                                            {singUser?.address}
                                        </div>
                                    )}
                                </div>

                                {/* Join Date (Read-only) */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Member Since</span>
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(singUser?.memberSince).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Account Status</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {singUser?.isBlocked ? (
                                            <span className="badge badge-error gap-1">
                                                <Lock className="w-3 h-3" />
                                                Blocked
                                            </span>
                                        ) : singUser.isPremium ? (
                                            <span className="badge badge-success gap-1">
                                                <Shield className="w-3 h-3" />
                                                Premium Active
                                            </span>
                                        ) : (
                                            <span className="badge badge-neutral">Regular</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-gray-800 mb-6">
                                <Lock className="w-6 h-6 mr-2" />
                                Change Password
                            </h2>
                            <div className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-bold text-[1rem]">Current Password</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="input input-bordered w-full pr-10"
                                        />
                                        <button
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                            onClick={() => setShowPassword(!showPassword)}
                                            type="button"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label flex">
                                        <span className="label-text font-bold text-[1rem]">New Password</span>
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label flex">
                                        <span className="label-text font-bold text-[1rem]">Confirm New Password</span>
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <button onClick={handleUpdatePassword} className="btn bg-amber-500 hover:bg-amber-600 text-white hover:text-white border-0">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Subscription & Benefits */}
                <div className="space-y-8">
                    {/* Premium Subscription Card */}
                    <div className="card bg-linear-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-xl">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-linear-to-r from-yellow-500 to-amber-500 rounded-lg">
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Premium Citizen
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Unlock all features
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="text-center mb-4">
                                    <span className="text-4xl font-bold text-gray-800">৳1000</span>
                                </div>
                                <p className="text-sm text-gray-600 text-center mb-6">
                                    No limits on issue submissions. Priority support included.
                                </p>
                                {!singUser?.isPremium ? (
                                    <button
                                        onClick={handleSubscribe}
                                        // disabled={singUser?.isBlocked}
                                        className="btn w-full bg-linear-to-r from-yellow-500 to-amber-500 border-0 text-white hover:from-yellow-600 hover:to-amber-600"
                                    // data-tooltip-content={
                                    //     singUser?.isBlocked ? "Account Blocked" : ""
                                    // }
                                    >
                                        <CreditCard className="w-5 h-5 mr-2" />
                                        Subscribe Now
                                    </button>
                                ) : (
                                    <div className="text-center">
                                        <div className="badge badge-lg badge-success gap-2 mb-3">
                                            <CheckCircle className="w-4 h-4" />
                                            Active Subscription
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Benefits List */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-700">Premium Benefits:</h4>
                                {premiumBenefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-sm text-gray-600">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Additional Features Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title text-gray-800 mb-4">
                                <Settings className="w-6 h-6 mr-2" />
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <button className="btn btn-outline w-full justify-start">
                                    <Bell className="w-4 h-4 mr-2" />
                                    Notification Settings
                                </button>
                                <button className="btn btn-outline w-full justify-start">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Privacy Settings
                                </button>
                                <button className="btn btn-outline w-full justify-start">
                                    <Star className="w-4 h-4 mr-2" />
                                    Rate Our Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProfilePage;