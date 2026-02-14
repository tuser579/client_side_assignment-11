import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
    Camera,
    MapPin,
    AlertCircle,
    Upload,
    X,
    Hash,
    FileText,
    Shield,
    Crown,
    CheckCircle,
    Clock,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import axios from 'axios';

const ReportIssuePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: singUser = {} } = useQuery({
        queryKey: ['singleUser', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/singleUser?email=${user.email}`);
            return res.data;
        }
    })

    // Mock singleUser data - in real app, get from auth context
    const [singleUser, setSingleUser] = useState({
        isPremium: singUser?.isPremium,
        issueCount: singUser?.issueCount,
        maxFreeIssues: 3,
        isBlocked: singUser?.isBlocked,
    });

    useEffect(() => {
        setSingleUser({
            isPremium: singUser?.isPremium,
            issueCount: singUser?.issueCount,
            maxFreeIssues: 3,
            isBlocked: singUser?.isBlocked,
        });
    }, [singUser]);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        status: 'Pending',
        priority: 'Normal',
        location: '',
        images: [],
        createdAt: new Date(),
        resolvedDate: "",
        upVotes: 0,
        reportedById: singleUser?._id,
        reportedByName: user.displayName,
        reportedByEmail: user?.email,
        isUpvoted: [],
        isBoosted: false
    });

    // UI state
    const [errors, setErrors] = useState({});
    const [imagePreviews, setImagePreviews] = useState([]);

    // Categories
    const categories = [
        { value: '', label: 'Select Category', icon: '📋' },
        { value: 'Road_damage', label: 'Road Damage (Potholes)', icon: '🛣️' },
        { value: 'Streetlight', label: 'Broken Streetlight', icon: '💡' },
        { value: 'Garbage', label: 'Garbage Overflow', icon: '🗑️' },
        { value: 'Footpath', label: 'Damaged Footpath', icon: '🚶' },
        { value: 'Drainage', label: 'Blocked Drainage', icon: '🌊' },
        { value: 'Traffic', label: 'Traffic Signal Issue', icon: '🚦' },
        { value: 'Parks', label: 'Park Maintenance', icon: '🌳' },
        { value: 'Public_toilet', label: 'Public Toilet Issue', icon: '🚻' },
        { value: 'Noise', label: 'Noise Pollution', icon: '🔇' },
        { value: 'Electricity', label: 'Electricity Issue', icon: '💡' },
        { value: 'Water_Supply', label: 'Water Supply Issue', icon: '💧' },
        { value: 'Sanitation', label: 'Sanitation Issue', icon: '🗑️' },
        { value: 'Infrastructure', label: 'Infrastructure Issue', icon: '🏗️' },
        { value: 'Other', label: 'Other Issue', icon: '❓' },
    ];

    // Check if singleUser can report more issues
    const canReportMore = singleUser.isPremium || singleUser.issueCount < singleUser.maxFreeIssues;

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        if (formData.images.length + files.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        const newImages = files.slice(0, 5 - formData.images.length);

        // Create previews
        const newPreviews = newImages.map((file) => ({
            url: URL.createObjectURL(file),
            name: file.name,
        }));

        setImagePreviews((prev) => [...prev, ...newPreviews]);

        const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`;

        // Upload each file and get its URL
        const uploadPromises = newImages.map(async (file) => {
            const uploadData = new FormData();   // ✅ renamed
            uploadData.append('image', file);

            const res = await axios.post(image_API_URL, uploadData);
            return res.data.data.url; // hosted image URL
        });

        // Wait for all uploads to finish
        const uploadedUrls = await Promise.all(uploadPromises);

        // ✅ Assign URLs into formData state
        setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...uploadedUrls],
        }));
    };


    // Remove image
    const removeImage = (index) => {
        const updatedImages = [...formData.images];
        const updatedPreviews = [...imagePreviews];

        updatedImages.splice(index, 1);
        updatedPreviews.splice(index, 1);

        setFormData((prev) => ({ ...prev, images: updatedImages }));
        setImagePreviews(updatedPreviews);
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Please select a location';
        }

        if (formData.images.length === 0) {
            newErrors.images = 'At least one image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!canReportMore) {
            alert('You have reached your free issue limit. Please upgrade to Premium.');
            return;
        }

        if (singleUser.isBlocked) {
            alert('Your account is blocked. Please contact authorities.');
            return;
        }

        if (!validateForm()) {
            return;
        }


        try {

            // Create tracking timeline entry
            const trackingEntry = {
                action: 'Issue_Reported',
                note: 'Issue has been submitted and is awaiting review',
                timestamp: new Date(),
                by: user.email,
            };

            // Save to database (simulated)
            const data = {
                ...formData,
                timelineEntry: [trackingEntry],
                createdAt: new Date().toISOString(),
            }

            Swal.fire({
                title: "Report Issue Confirmation",
                text: `Are you sure you want to report this issue?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, Report Issue!",
                cancelButtonText: "Cancel",
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    // Show loading indicator while saving
                    Swal.fire({
                        title: "Saving Issue...",
                        text: "Please wait while we save your issue.",
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    // Save the issue to the database
                    axiosSecure.post('/reportIssue', data)
                        .then(res => {
                            // console.log('Issue saved successfully:', res.data);

                            if (res.data.insertedId) {
                                // Close loading indicator
                                Swal.close();

                                // Show success message
                                Swal.fire({
                                    title: "Success!",
                                    text: "Issue has been reported successfully.",
                                    icon: "success",
                                    confirmButtonColor: "#3085d6",
                                    confirmButtonText: "View My Issues",
                                    showCancelButton: true,
                                    cancelButtonText: "Close"
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        // Alternative: Auto navigate after success
                                        axiosSecure.patch(`/updateUser/${singUser?._id}`, { issueCount: singUser.issueCount + 1 })
                                            .then().catch()

                                        navigate('/dashboard/myIssues');
                                    }
                                });

                            } else {
                                throw new Error('Failed to save issue');
                            }
                        })
                        .catch(error => {
                            console.error('Error saving issue:', error);

                            Swal.fire({
                                title: "Error!",
                                text: error.response?.data?.message || "Failed to report the issue. Please try again.",
                                icon: "error",
                                confirmButtonText: "Try Again"
                            });
                        });
                }
            });

        } catch (error) {
            console.error('Error submitting issue:', error);
            alert('Failed to submit issue. Please try again.');
        }
    };

    // Cleanup image previews on unmount
    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        };
    }, [imagePreviews]);

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">

            {/* Blocked singleUser Warning */}
            {singleUser.isBlocked && (
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

            {/* singleUser Limit Warning */}
            {!singleUser.isBlocked && !canReportMore && (
                <div className="mb-6">
                    <div className="alert alert-warning shadow-lg">
                        <AlertCircle className="w-6 h-6" />
                        <div>
                            <h3 className="font-bold">Free Issue Limit Reached!</h3>
                            <div className="text-sm">
                                You have reported {singleUser?.issueCount} issues. Free singleUsers can only report 3 issues.
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="btn btn-sm btn-primary ml-4 text-black"
                                >
                                    <Crown className="w-4 h-4 mr-2" />
                                    Upgrade to Premium
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="max-w-8xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                Report an Issue
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                Help improve your city by reporting infrastructure problems
                            </p>
                        </div>

                        {/* singleUser Status Card */}
                        <div className="hidden md:block card bg-base-100 shadow-md">
                            <div className="card-body p-4">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="font-semibold">User Status</span>
                                            {
                                                singleUser?.isPremium ? (
                                                    <span className="badge badge-sm bg-linear-to-r from-yellow-500 to-amber-500 border-0 text-white gap-1">
                                                        <Crown className="w-3 h-3" />
                                                        Premium
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-sm bg-gray-400 border-0 text-white gap-1">
                                                        Regular
                                                    </span>
                                                )

                                            }
                                        </div>

                                        <div className={`flex items-center ${singleUser?.isPremium ? 'gap-0' : 'gap-5'}`}>
                                            <p className='font-semibold'>Issues</p>
                                            <p
                                                className={`text-sm pt-1 ${singleUser?.isPremium
                                                    ? 'text-gray-600'
                                                    : canReportMore
                                                        ? 'text-gray-500'
                                                        : 'text-red-500 font-semibold'
                                                    }`}
                                            >
                                                {singleUser.isPremium
                                                    ? `${singleUser.issueCount}`
                                                    : canReportMore
                                                        ? `${singleUser.issueCount}/${singleUser.maxFreeIssues}`
                                                        : 'Limit Reached'}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* singleUser Status Card (Mobile) */}
                <div className="card bg-base-100 shadow-xl md:hidden">
                    <div className="card-body">
                        <h3 className="card-title text-gray-800 dark:text-white">
                            <Shield className="w-5 h-5 mr-2" />
                            Your Reporting Status
                        </h3>
                        <div className="space-y-4 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300 font-semibold">Account Type</span>
                                <span className={`font-semibold ${singleUser.isPremium ? 'text-amber-500' : ''}`}>
                                    {singleUser.isPremium ? 'Premium' : 'Regular'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className='font-semibold'>Issues Count</span>
                                <span
                                    className={`text-sm pt-1 ${singleUser.isPremium
                                        ? 'text-gray-500'
                                        : canReportMore
                                            ? 'text-gray-500'
                                            : 'text-red-500 font-semibold'
                                        }`}
                                >
                                    {singleUser.isPremium
                                        ? `${singleUser.issueCount}`
                                        : canReportMore
                                            ? `${singleUser.issueCount}/${singleUser.maxFreeIssues}`
                                            : 'Limit Reached'}
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body p-6 md:p-8">
                                <form onSubmit={handleSubmit}>
                                    {/* Issue Title */}
                                    <div className="form-control mb-6 flex gap-2">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <Hash className="w-4 h-4" />
                                                Issue Title
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="Brief title of the problem"
                                            className={`input input-bordered ${errors.title ? 'input-error' : ''}`}
                                            disabled={!canReportMore || singleUser.isBlocked}
                                        />
                                        {errors.title && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{errors.title}</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* Category Selection */}
                                    <div className="form-control mb-6 flex gap-2">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Category
                                            </span>
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className={`select select-bordered ${errors.category ? 'select-error' : ''}`}
                                            disabled={!canReportMore || singleUser.isBlocked}
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.icon} {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{errors.category}</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="form-control mb-6 flex gap-2">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Description
                                            </span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Please provide detailed information about the issue. Include when you noticed it, any safety concerns, and specific details."
                                            className={`textarea textarea-bordered w-full h-48 ${errors.description ? 'textarea-error' : ''}`}
                                            disabled={!canReportMore || singleUser.isBlocked}
                                        />
                                        {errors.description && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{errors.description}</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* Location Selection */}
                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Location
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name='location'
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className={`input input-bordered w-full ${errors.location ? 'input-error' : ''}`}
                                            placeholder="Select location details"
                                            disabled={!canReportMore || singleUser.isBlocked}
                                        />

                                        {errors.location && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{errors.location}</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* Image Upload */}
                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <Camera className="w-4 h-4" />
                                                Upload Images
                                                <span className="text-red-500">*</span>
                                                <span className="text-sm text-gray-500 font-normal">
                                                    (Max 5 images, at least 1 required)
                                                </span>
                                            </span>
                                        </label>

                                        {/* Image Upload Area */}
                                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${errors.images
                                            ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                            : 'border-gray-300 hover:border-primary'
                                            }`}>
                                            <div className="flex flex-col items-center">
                                                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                                <p className="mb-2 font-semibold">Drag & drop images here</p>
                                                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                                                <label className="btn btn-primary text-black">
                                                    <Camera className="w-4 h-4 mr-2" />
                                                    Choose Images
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        disabled={!canReportMore || singleUser.isBlocked || formData.images.length >= 5}
                                                    />
                                                </label>
                                                <p className="text-xs text-gray-500 mt-4">
                                                    Supports JPG, PNG, WebP. Max 5MB per image.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Image Previews */}
                                        {imagePreviews.length > 0 && (
                                            <div className="mt-6">
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                    {imagePreviews.map((preview, index) => (
                                                        <div key={index} className="relative group">
                                                            <div className="aspect-square rounded-lg overflow-hidden border">
                                                                <img
                                                                    src={preview.url}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-3">
                                                    {formData.images.length}/5 images uploaded
                                                </p>
                                            </div>
                                        )}

                                        {errors.images && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{errors.images}</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex flex-col sm:flex-row">
                                        <button
                                            type="submit"
                                            className={`btn btn-primary text-black flex-1 p-2 `}
                                            disabled={!canReportMore || singleUser.isBlocked}
                                        >
                                            Submit Issue Report
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Guidelines & Status */}
                    <div className="space-y-6">
                        {/* Reporting Guidelines */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h3 className="card-title text-gray-800 dark:text-white">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Reporting Guidelines
                                </h3>
                                <ul className="space-y-3 mt-4">
                                    <li className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                        <span className="text-sm">Provide clear, descriptive titles</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                        <span className="text-sm">Include specific location details</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                        <span className="text-sm">Upload clear, well-lit photos</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                        <span className="text-sm">Describe safety concerns if any</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                        <span className="text-sm">Be accurate and factual</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* What Happens Next */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h3 className="card-title text-gray-800 dark:text-white">
                                    <Clock className="w-5 h-5 mr-2" />
                                    What Happens Next
                                </h3>
                                <div className="space-y-4 mt-4">
                                    <div className="flex items-start gap-3">
                                        <div className="badge badge-primary text-black badge-lg mt-1">1</div>
                                        <div>
                                            <p className="font-medium">Submission Review</p>
                                            <p className="text-sm text-gray-500">Admin reviews your report within 24 hours</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="badge badge-primary text-black badge-lg mt-1">2</div>
                                        <div>
                                            <p className="font-medium">Verification</p>
                                            <p className="text-sm text-gray-500">Staff verifies the issue on-site</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="badge badge-primary text-black badge-lg mt-1">3</div>
                                        <div>
                                            <p className="font-medium">Assignment</p>
                                            <p className="text-sm text-gray-500">Issue assigned to relevant department</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="badge badge-primary text-black badge-lg mt-1">4</div>
                                        <div>
                                            <p className="font-medium">Resolution</p>
                                            <p className="text-sm text-gray-500">Issue gets resolved with regular updates</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ReportIssuePage;