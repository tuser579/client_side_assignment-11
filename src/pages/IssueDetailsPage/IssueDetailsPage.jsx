import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import {
    HiOutlineArrowLeft,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlineLightningBolt,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineExclamationCircle,
    HiOutlinePhotograph,
    HiOutlineLocationMarker,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlineUsers,
    HiOutlineDocumentText,
    HiOutlineBookmark,
    HiOutlineChatAlt,
    HiOutlineThumbUp,
    HiOutlineShare,
    HiOutlineX,
    HiOutlineCog,
    HiOutlineRefresh,
    HiOutlineLockClosed
} from 'react-icons/hi';
import {
    AlertCircle,
    Shield,
    History,
    User as UserIcon
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const IssueDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    // State for edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        images: []
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    // State for boost
    const [boosting, setBoosting] = useState(false);

    // Fetch issue details with timeline
    const {
        data: issue = {},
        refetch,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['issue', id],
        queryFn: async () => {
            const response = await axiosSecure.get(`/issueDetails/${id}`);
            return response.data;
        },
        retry: 2,
        refetchOnWindowFocus: true
    });

    // Fetch user data
    const { data: currentUser = {} } = useQuery({
        queryKey: ['singleUser', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const response = await axiosSecure.get(`/singleUser/${user?.email}`);
            return response.data;
        }
    });

    // Initialize edit form when modal opens
    useEffect(() => {
        if (showEditModal && issue) {
            setEditFormData({
                title: issue.title || '',
                description: issue.description || '',
                category: issue.category || '',
                location: issue.location || '',
                images: issue.images || []
            });
            // Set image previews from existing images
            setImagePreviews(
                (issue.images || []).map(url => ({
                    url,
                    name: url.split('/').pop() || 'Image',
                    isNew: false
                }))
            );
        }
    }, [showEditModal, issue]);

    // Handle image upload for edit
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        if (editFormData.images.length + files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        const newImages = files.slice(0, 5 - editFormData.images.length);

        // Create previews
        const newPreviews = newImages.map((file) => ({
            url: URL.createObjectURL(file),
            name: file.name,
            isNew: true
        }));

        setImagePreviews((prev) => [...prev, ...newPreviews]);
        setUploadingImages(true);

        try {
            const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`;

            // Upload each file and get its URL
            const uploadPromises = newImages.map(async (file) => {
                const uploadData = new FormData();
                uploadData.append('image', file);

                const res = await axios.post(image_API_URL, uploadData);
                return res.data.data.url;
            });

            // Wait for all uploads to finish
            const uploadedUrls = await Promise.all(uploadPromises);

            // Update form data with new images
            setEditFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls],
            }));

            toast.success('Images uploaded successfully!');
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Failed to upload images');
            // Remove previews if upload fails
            setImagePreviews(prev => prev.filter(p => !p.isNew));
        } finally {
            setUploadingImages(false);
        }
    };

    // Remove image from edit form
    const removeImage = (index) => {
        // Revoke object URL if it's a new upload preview
        if (imagePreviews[index].isNew) {
            URL.revokeObjectURL(imagePreviews[index].url);
        }

        // Remove from previews
        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);

        // Remove from form data
        const newImages = [...editFormData.images];
        newImages.splice(index, 1);
        setEditFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submit for edit
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!editFormData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!editFormData.description.trim()) {
            toast.error('Description is required');
            return;
        }
        if (!editFormData.category) {
            toast.error('Please select a category');
            return;
        }
        if (!editFormData.location.trim()) {
            toast.error('Location is required');
            return;
        }

        // Show confirmation
        Swal.fire({
            title: 'Update Issue?',
            text: 'Are you sure you want to update this issue?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-2 rounded-xl',
                cancelButton: 'px-6 py-2 rounded-xl'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Show loading
                Swal.fire({
                    title: 'Updating...',
                    text: 'Please wait while we update your issue',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                try {
                    // Make API call to update issue
                    await axiosSecure.patch(`/myIssueUpdate/${id}`, editFormData);

                    // Close loading
                    Swal.close();

                    // Show success
                    Swal.fire({
                        title: 'Updated!',
                        text: 'Issue has been updated successfully.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Refresh issue data
                    queryClient.invalidateQueries(['issue', id]);

                    // Close modal
                    setShowEditModal(false);

                    // Clear image previews
                    imagePreviews.forEach(preview => {
                        if (preview.isNew) {
                            URL.revokeObjectURL(preview.url);
                        }
                    });
                    setImagePreviews([]);

                } catch (error) {
                    // Close loading
                    Swal.close();

                    // Show error
                    Swal.fire({
                        title: 'Error!',
                        text: error.response?.data?.message || 'Failed to update issue. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    };

    // Handle delete with confirmation
    const handleDelete = () => {
        // Check if user is blocked
        if (currentUser?.isBlocked) {
            toast.error('Your account is blocked. Cannot delete issues.');
            return;
        }

        // Check if user owns the issue
        if (issue?.reportedByEmail !== user?.email) {
            toast.error('You can only delete your own issues');
            return;
        }

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-2 rounded-xl',
                cancelButton: 'px-6 py-2 rounded-xl'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: 'Deleting...',
                    text: 'Please wait while we delete your issue',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                axiosSecure.delete(`/myIssueDelete/${id}`)
                    .then(res => {
                        // Close loading
                        Swal.close();

                        // Show success message
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Your issue has been deleted successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        // Navigate back
                        setTimeout(() => {
                            navigate(-1);
                        }, 2000);
                    })
                    .catch(error => {
                        // Close loading
                        Swal.close();

                        // Show error message
                        Swal.fire({
                            title: 'Error!',
                            text: error.response?.data?.message || 'Failed to delete issue. Please try again.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    });
            }
        });
    };

    const handleBoost = async () => {
        // Check if user is blocked
        if (currentUser?.isBlocked) {
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
            title: 'Confirm Boost',
            text: 'Do you want to proceed with Boost Issue?',
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
            cost: 100,
            userID: currentUser?._id,
            name: currentUser?.name,
            email: currentUser?.email,
            type: 'Boost Issue',
            totalPayment: currentUser.totalPayment + 100,
            issueId: id
        };

        try {
            const res = await axiosSecure.post('/create-checkout-session', paymentInfo);
            if (res.data) {
                // Create timeline entry
                const timelineEntry = {
                    action: 'Boost_Issue',
                    timestamp: new Date(),
                    by: user?.email || 'User',
                    note: `Boosted issue by user`
                };

                // Update issue status
                const updateData = {
                    updatedAt: new Date(),
                    timelineEntry: [...issue.timelineEntry, timelineEntry]
                };

                axiosSecure.patch(`/myIssueUpdate/${issue._id}`, updateData);
            }

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
            }, 500);
        } catch (error) {
            console.error('Payment error:', error);

            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: 'Something went wrong. Please try again later.'
            });
        }
    };

    // Handle upvote
    const handleUpvote = async (issue) => {

        // Check if user is blocked to upvote  issue
        if (currentUser?.isBlocked) {
            toast.error('Your account in blocked. You cannot upvote this issue.');
            return;
        }

        // Check if user is trying to upvote their own issue
        if (issue?.reportedByEmail === user.email) {
            toast.error('You cannot upvote your own issue');
            return;
        }

        // Check if already upvoted - ensure isUpvoted is an array
        const isUpvotedArray = Array.isArray(issue.isUpvoted) ? issue.isUpvoted : [];
        if (isUpvotedArray.includes(user.email)) {
            toast.error('You have already upvoted this issue');
            return;
        }


        try {
            // API call to upvote
            await axiosSecure.patch(`/upvoteIssue/${issue._id}`, {
                isUpvoted: [...isUpvotedArray, user.email],
                upVotes: (issue?.upVotes || 0) + 1,
            });

            refetch();
            toast.success('Issue upvoted successfully!');
        } catch (error) {
            toast.error('Failed to upvote. Please try again.');
            console.error('Upvote error:', error);
        }
    };


    // Get status config
    const getStatusConfig = (status) => {
        const configs = {
            'Pending': {
                color: 'bg-orange-500',
                icon: <HiOutlineClock className="w-4 h-4" />,
                text: 'Pending',
                bg: 'bg-orange-50',
                textColor: 'text-orange-700'
            },
            'Working': {
                color: 'bg-purple-500',
                icon: <HiOutlineCog className="w-4 h-4" />, // Changed to Cog (gear icon)
                text: 'Working',
                bg: 'bg-purple-50',
                textColor: 'text-purple-700'
            },
            'In-Progress': {
                color: 'bg-blue-500',
                icon: <HiOutlineRefresh className="w-4 h-4" />, // Changed to Refresh for distinction
                text: 'In Progress',
                bg: 'bg-blue-50',
                textColor: 'text-blue-700'
            },
            'Resolved': {
                color: 'bg-green-500',
                icon: <HiOutlineCheckCircle className="w-4 h-4" />,
                text: 'Resolved',
                bg: 'bg-green-50',
                textColor: 'text-green-700'
            },
            'Closed': {
                color: 'bg-gray-500',
                icon: <HiOutlineLockClosed className="w-4 h-4" />, // Changed to LockClosed
                text: 'Closed',
                bg: 'bg-gray-50',
                textColor: 'text-gray-700'
            },
            'Rejected': {
                color: 'bg-red-500',
                icon: <HiOutlineXCircle className="w-4 h-4" />, // Using XCircle
                text: 'Rejected',
                bg: 'bg-red-50',
                textColor: 'text-red-700'
            }
        };
        return configs[status] || configs.Pending;
    };

    // Get priority config
    const getPriorityConfig = (priority) => {
        const configs = {
            'High': {
                color: 'bg-red-500',
                text: 'High',
                icon: <HiOutlineExclamationCircle className="w-4 h-4" />,
                bg: 'bg-red-50',
                textColor: 'text-red-700'
            },
            'Normal': {
                color: 'bg-blue-500',
                text: 'Normal',
                icon: <HiOutlineBookmark className="w-4 h-4" />,
                bg: 'bg-blue-50',
                textColor: 'text-blue-700'
            }
        };
        return configs[priority] || configs.Normal;
    };

    // Get category config
    const getCategoryConfig = (category) => {
        const categories = {
            'Road_Damage': { icon: '🛣️', name: 'Road Damage' },
            'Streetlight': { icon: '💡', name: 'Street Light' },
            'Water': { icon: '💧', name: 'Water Supply' },
            'Garbage': { icon: '🗑️', name: 'Garbage' },
            'Footpath': { icon: '🚶', name: 'Footpath' },
            'Drainage': { icon: '🌊', name: 'Drainage' },
            'Traffic': { icon: '🚦', name: 'Traffic' },
            'Parks': { icon: '🌳', name: 'Parks' },
            'Public_Toilet': { icon: '🚻', name: 'Public Toilet' },
            'Noise': { icon: '🔇', name: 'Noise' },
            'Electricity': { icon: '💡', name: 'Electricity' },
            'Water_Supply': { icon: '💧', name: 'Water Supply' },
            'Sanitation': { icon: '🗑️', name: 'Sanitation' },
            'Infrastructure': { icon: '🏗️', name: 'Infrastructure' },
            'Other': { icon: '❓', name: 'Other' }
        };
        return categories[category] || { icon: '📋', name: category || 'Other' };
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format timeline date
    const formatTimelineDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} min ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hours ago`;
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // Get timeline icon
    const getTimelineIcon = (type) => {
        const icons = {
            'Issue_Reported': <HiOutlineDocumentText className="w-5 h-5" />,
            'Staff_Assigned': <HiOutlineUsers className="w-5 h-5" />,
            'Status_Changed': <HiOutlineClock className="w-5 h-5" />,
            'Boost_Issue': <HiOutlineLightningBolt className="w-5 h-5" />,
            'Rejected': <HiOutlineXCircle className="w-5 h-5" />
        };
        return icons[type] || <HiOutlineClock className="w-5 h-5" />;
    };

    // Get timeline color
    const getTimelineColor = (type) => {
        const colors = {
            'Issue_Reported': 'bg-blue-100 text-blue-600',
            'Staff_Assigned': 'bg-purple-100 text-purple-600',
            'Status_Changed': 'bg-yellow-100 text-yellow-600',
            'Boost_Issue': 'bg-orange-100 text-orange-600',
            'Rejected': 'bg-red-100 text-red-600'
        };
        return colors[type] || 'bg-gray-100 text-gray-600';
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 p-4 md:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="animate-pulse h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="animate-pulse h-10 w-48 bg-gray-200 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="animate-pulse h-96 bg-gray-200 rounded-2xl mb-6"></div>
                            <div className="animate-pulse h-64 bg-gray-700 rounded-2xl"></div>
                        </div>
                        <div className="space-y-6">
                            <div className="animate-pulse h-48 bg-gray-200 rounded-2xl"></div>
                            <div className="animate-pulse h-64 bg-gray-200 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 p-4 md:p-6 lg:p-8 flex items-center justify-center">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Issue Not Found</h3>
                    <p className="text-gray-600 mb-6">
                        {error?.message || 'The issue you are looking for does not exist or has been removed.'}
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-2 mx-auto"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                        <span>Go Back</span>
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(issue.status);
    const priorityConfig = getPriorityConfig(issue.priority);
    const categoryConfig = getCategoryConfig(issue.category);
    const isOwner = issue?.reportedByEmail === user?.email;
    const canEdit = isOwner && !currentUser?.isBlocked && issue.status === 'Pending';
    const canDelete = isOwner && !currentUser?.isBlocked && issue.status === 'Pending';
    const canBoost = isOwner && !issue.isBoosted && !currentUser?.isBlocked && issue.status === 'Pending';

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 p-4 md:p-6 lg:p-8">
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />

            {/* Blocked User Warning */}
            {currentUser?.isBlocked && (
                <div className="max-w-6xl mx-auto mb-6">
                    <div className="alert alert-error shadow-lg rounded-2xl">
                        <AlertCircle className="w-6 h-6" />
                        <div>
                            <h3 className="font-bold">Account Blocked</h3>
                            <div className="text-xs">
                                Your account has been temporarily blocked. You cannot perform any actions.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Issues</span>
                    </button>

                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.textColor} flex items-center space-x-1`}>
                            {statusConfig.icon}
                            <span>{statusConfig.text}</span>
                        </span>

                        {issue.isBoosted && (
                            <span className="px-3 py-1 bg-linear-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold flex items-center space-x-1">
                                <HiOutlineLightningBolt className="w-4 h-4" />
                                <span>Boosted</span>
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Issue Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                            {/* Issue Header */}
                            <div className="pl-6 sm:pl-8 pb-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1">
                                    <div>
                                        <div className="flex justify-between items-center gap-20 mb-4 mt-6 mr-5">
                                            <div className='flex items-center gap-2'>
                                                <div className='flex items-center gap-2'>
                                                    <span className="text-2xl">{categoryConfig.icon}</span>
                                                    <span className="text-2xl bg-gray-100 text-gray-700">
                                                        {categoryConfig.name}
                                                    </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityConfig.bg} ${priorityConfig.textColor} flex items-center space-x-1`}>
                                                    {priorityConfig.icon}
                                                    <span>{priorityConfig.text} Priority</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Edit Button */}
                                                {canEdit && (
                                                    <button
                                                        onClick={() => setShowEditModal(true)}
                                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200 flex items-center space-x-2"
                                                    >
                                                        <HiOutlinePencilAlt className="w-5 h-5" />
                                                        <span className="font-medium">Edit</span>
                                                    </button>
                                                )}

                                                {/* Delete Button */}
                                                {canDelete && (
                                                    <button
                                                        onClick={handleDelete}
                                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200 flex items-center space-x-2"
                                                    >
                                                        <HiOutlineTrash className="w-5 h-5" />
                                                        <span className="font-medium">Delete</span>
                                                    </button>
                                                )}

                                                {/* Boost Button */}
                                                {canBoost && (
                                                    <button
                                                        onClick={handleBoost}
                                                        disabled={boosting}
                                                        className="px-4 py-2 bg-linear-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {boosting ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                        ) : (
                                                            <HiOutlineLightningBolt className="w-5 h-5" />
                                                        )}
                                                        <span className="font-medium">Boost Issue</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Images Gallery */}
                                        {issue.images && issue.images.length > 0 && (
                                            <div className="mb-8">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <HiOutlinePhotograph className="w-5 h-5" />
                                                    <span>Evidence Images ({issue.images.length})</span>
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {issue.images.map((image, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={image}
                                                                alt={`Issue evidence ${index + 1}`}
                                                                className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                            Title: {issue.title}
                                        </h1>

                                    </div>

                                </div>

                                {/* Location */}
                                <div className="text-2xl flex items-center gap-2 bg-gray-50 rounded-xl mt-2">
                                    {/* <HiOutlineLocationMarker className="w-5 h-5 text-gray-500" /> */}
                                    <div className='flex gap-2'>
                                        <div className="font-semibold text-gray-700">Location:</div>
                                        <div className="text-gray-900">{issue.location}</div>
                                    </div>
                                </div>

                            </div>

                            {/* Issue Body */}
                            <div className="pl-6 md:pl-8 pr-6 md:pr-8 pb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                                <div className="prose max-w-none text-gray-700 mb-8">
                                    <p className="whitespace-pre-line">{issue.description}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Timeline Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 md:p-8 border-b border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                                    <History className="w-6 h-6" />
                                    <span>Issue Timeline</span>
                                </h2>
                            </div>

                            <div className="p-6 md:p-8">
                                {issue.timelineEntry && issue.timelineEntry.length > 0 ? (
                                    <div className="relative">
                                        {/* Vertical Timeline Line */}
                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                        {/* Timeline Items */}
                                        <div className="space-y-8">
                                            {issue.timelineEntry
                                                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                                                .map((item, index) => (
                                                    <div key={index} className="relative flex gap-4">
                                                        {/* Timeline Dot */}
                                                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getTimelineColor(item.action)}`}>
                                                            {getTimelineIcon(item.action)}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 pb-8">
                                                            <div className="bg-gray-50 rounded-xl p-4">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                                    <h4 className="font-semibold text-gray-900">{item.action}</h4>
                                                                    <span className="text-sm text-gray-500">
                                                                        {formatTimelineDate(item.timestamp)}
                                                                    </span>
                                                                </div>

                                                                {item.note && (
                                                                    <p className="text-gray-700 mb-3">{item.note}</p>
                                                                )}

                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                                                        <span className="text-sm text-gray-600">
                                                                            {item.by || 'System'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Detailed Date */}
                                                            <div className="mt-2 text-xs text-gray-400">
                                                                {formatDate(item.timestamp)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <HiOutlineClock className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Timeline Yet</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            The timeline will show updates as this issue progresses through the system.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-8">
                        {/* Assigned Staff Card */}
                        {issue.assignedStaffId && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <Shield className="w-5 h-5" />
                                        <span>Assigned Staff</span>
                                    </h3>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">{issue.assignedStaffName}</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {issue.assignedStaffEmail && (
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <HiOutlineUser className="w-4 h-4" />
                                                <span className="text-sm">{issue.assignedStaffEmail}</span>
                                            </div>
                                        )}
                                    </div>

                                    {issue.assignedDate && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                Assigned on {formatDate(issue.assignedDate)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Issue Metadata Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <HiOutlineDocumentText className="w-5 h-5" />
                                    <span>Issue Details</span>
                                </h3>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="text-gray-500 text-lg font-semibold">Issue ID</div>
                                    <div className="font-mono text-gray-800 bg-gray-50 p-2 rounded-lg">
                                        {issue._id || 'N/A'}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-gray-500 text-lg font-semibold">Reported By</div>
                                    <div className="font-medium text-gray-800">{issue.reportedByName || 'Anonymous'}</div>
                                    <div className="text-sm text-gray-600">{issue.reportedByEmail}</div>
                                </div>

                                <div>
                                    <div className="text-gray-500 text-lg font-semibold">Created</div>
                                    <div className="font-medium text-gray-800">{formatDate(issue.createdAt)}</div>
                                </div>

                                {issue.updatedAt && (
                                    <div>
                                        <div className="text-gray-500 text-lg font-semibold">Last Updated</div>
                                        <div className="font-medium text-gray-800">{formatTimelineDate(issue.updatedAt)}</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Actions Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                            </div>

                            <div className="p-6 space-y-3">
                                <button
                                    onClick={() => handleUpvote(issue)}
                                    className="w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <HiOutlineThumbUp className="w-5 h-5" />
                                        <span className="font-medium">Upvote Issue</span>
                                    </div>
                                    <span className="font-bold">{issue.upVotes || 0}</span>
                                </button>

                                <button
                                    onClick={() => {
                                        if (currentUser?.isBlocked) {
                                            toast.error('Account blocked. Cannot share.');
                                        } else {
                                            navigator.clipboard.writeText(window.location.href);
                                            toast.success('Link copied to clipboard!');
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors duration-200 flex items-center gap-3"
                                >
                                    <HiOutlineShare className="w-5 h-5" />
                                    <span className="font-medium">Share Issue</span>
                                </button>

                                <Link to="/dashboard/reportIssue">
                                    <button className="w-full px-4 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-3">
                                        <HiOutlineDocumentText className="w-5 h-5" />
                                        <span>Report New Issue</span>
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Issue</h2>
                                <button
                                    onClick={() => {
                                        // Clean up object URLs
                                        imagePreviews.forEach(preview => {
                                            if (preview.isNew) {
                                                URL.revokeObjectURL(preview.url);
                                            }
                                        });
                                        setShowEditModal(false);
                                    }}
                                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <HiOutlineX className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit}>
                                <div className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Issue Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={editFormData.title}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={editFormData.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                            required
                                        />
                                    </div>

                                    {/* Category and Location Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                name="category"
                                                value={editFormData.category}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                <option value="road_damage">Road Damage (Potholes)</option>
                                                <option value="streetlight">Broken Streetlight</option>
                                                <option value="water">Water Leakage</option>
                                                <option value="garbage">Garbage Overflow</option>
                                                <option value="footpath">Damaged Footpath</option>
                                                <option value="drainage">Blocked Drainage</option>
                                                <option value="traffic">Traffic Signal Issue</option>
                                                <option value="parks">Park Maintenance</option>
                                                <option value="public_toilet">Public Toilet Issue</option>
                                                <option value="noise">Noise Pollution</option>
                                                <option value="Electricity">Electricity</option>
                                                <option value="Road Maintenance">Road Maintenance</option>
                                                <option value="Water Supply">Water Supply</option>
                                                <option value="Sanitation">Sanitation</option>
                                                <option value="Infrastructure">Infrastructure</option>
                                                <option value="Traffic Control">Traffic Control</option>
                                                <option value="Public Amenities">Public Amenities</option>
                                                <option value="other">Other Issue</option>
                                            </select>
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location *
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={editFormData.location}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Image Upload Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Images ({editFormData.images.length}/5)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                                            <input
                                                type="file"
                                                id="image-upload"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                disabled={uploadingImages || editFormData.images.length >= 5}
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className={`cursor-pointer flex flex-col items-center justify-center ${(uploadingImages || editFormData.images.length >= 5) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <HiOutlinePhotograph className="w-12 h-12 text-gray-400 mb-4" />
                                                <div className="text-gray-600 mb-2">
                                                    {uploadingImages ? 'Uploading images...' : 'Click to upload images'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Maximum 5 images (JPG, PNG, GIF)
                                                </div>
                                            </label>
                                        </div>

                                        {/* Image Previews */}
                                        {imagePreviews.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="font-medium text-gray-700 mb-3">Uploaded Images</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                    {imagePreviews.map((preview, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={preview.url}
                                                                alt={preview.name}
                                                                className="w-full h-32 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            imagePreviews.forEach(preview => {
                                                if (preview.isNew) {
                                                    URL.revokeObjectURL(preview.url);
                                                }
                                            });
                                            setShowEditModal(false);
                                        }}
                                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploadingImages}
                                        className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploadingImages ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineCheckCircle className="w-5 h-5" />
                                                <span>Update Issue</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default IssueDetailsPage;