import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
    Camera, MapPin, AlertCircle, Upload, X, Hash,
    FileText, Shield, Crown, CheckCircle, Clock, Zap, Lock
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import axios from 'axios';
import ReportIssuePageSkeleton from '../../Components/ReportIssuePageSkeleton';

const ReportIssuePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: singUser = {}, isLoading: userLoading } = useQuery({
        queryKey: ['singleUser', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/singleUser?email=${user.email}`);
            return res.data;
        }
    });

    const [singleUser, setSingleUser] = useState({
        isPremium: false, issueCount: 0, maxFreeIssues: 3, isBlocked: false,
    });

    useEffect(() => {
        setSingleUser({
            isPremium: singUser?.isPremium,
            issueCount: singUser?.issueCount,
            maxFreeIssues: 3,
            isBlocked: singUser?.isBlocked,
        });
    }, [singUser]);

    const [formData, setFormData] = useState({
        title: '', description: '', category: '', status: 'Pending',
        priority: 'Normal', location: '', images: [], createdAt: new Date(),
        resolvedDate: '', upVotes: 0, reportedById: singUser?._id,
        reportedByName: user?.displayName, reportedByEmail: user?.email,
        isUpvoted: [], isBoosted: false
    });

    const [errors, setErrors] = useState({});
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

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
        { value: 'Electricity', label: 'Electricity Issue', icon: '⚡' },
        { value: 'Water_Supply', label: 'Water Supply Issue', icon: '💧' },
        { value: 'Sanitation', label: 'Sanitation Issue', icon: '♻️' },
        { value: 'Infrastructure', label: 'Infrastructure Issue', icon: '🏗️' },
        { value: 'Other', label: 'Other Issue', icon: '❓' },
    ];

    const canReportMore = singleUser.isPremium || singleUser.issueCount < singleUser.maxFreeIssues;
    const isDisabled = !canReportMore || singleUser.isBlocked;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (formData.images.length + files.length > 5) {
            Swal.fire({ title: 'Too many images', text: 'Maximum 5 images allowed.', icon: 'warning', confirmButtonColor: '#3b82f6' });
            return;
        }
        const newImages = files.slice(0, 5 - formData.images.length);
        const newPreviews = newImages.map(f => ({ url: URL.createObjectURL(f), name: f.name }));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        setUploading(true);
        try {
            const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`;
            const uploadedUrls = await Promise.all(newImages.map(async (file) => {
                const uploadData = new FormData();
                uploadData.append('image', file);
                const res = await axios.post(image_API_URL, uploadData);
                return res.data.data.url;
            }));
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...uploadedUrls] }));
            if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
        } catch {
            Swal.fire({ title: 'Upload Failed', text: 'Failed to upload images. Please try again.', icon: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        const updatedImages = [...formData.images];
        const updatedPreviews = [...imagePreviews];
        updatedImages.splice(index, 1);
        updatedPreviews.splice(index, 1);
        setFormData(prev => ({ ...prev, images: updatedImages }));
        setImagePreviews(updatedPreviews);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        else if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
        if (!formData.category) newErrors.category = 'Please select a category';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (formData.images.length === 0) newErrors.images = 'At least one image is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canReportMore || singleUser.isBlocked || !validateForm()) return;
        const trackingEntry = {
            action: 'Issue_Reported',
            note: 'Issue has been submitted and is awaiting review',
            timestamp: new Date(), by: user.email,
        };
        const data = { ...formData, timelineEntry: [trackingEntry], createdAt: new Date().toISOString() };

        Swal.fire({
            title: 'Report this issue?', text: 'Are you sure you want to submit this report?',
            icon: 'question', showCancelButton: true, confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, Submit!', reverseButtons: true
        }).then(result => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'Submitting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                axiosSecure.post('/reportIssue', data).then(res => {
                    if (res.data.insertedId) {
                        Swal.fire({
                            title: 'Reported!', text: 'Issue reported successfully.', icon: 'success',
                            confirmButtonColor: '#3b82f6', confirmButtonText: 'View My Issues',
                            showCancelButton: true, cancelButtonText: 'Close'
                        }).then(r => {
                            if (r.isConfirmed) {
                                axiosSecure.patch(`/updateUser/${singUser?._id}`, { issueCount: singUser.issueCount + 1 }).then().catch();
                                navigate('/dashboard/myIssues');
                            }
                        });
                    } else throw new Error('Failed');
                }).catch(err => {
                    Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to report.', icon: 'error' });
                });
            }
        });
    };

    useEffect(() => {
        return () => imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    }, [imagePreviews]);

    const inputCls = (field) => `w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors[field] ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-600'}`;

    if (userLoading) return <ReportIssuePageSkeleton></ReportIssuePageSkeleton>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">

                {/* ── Blocked Warning ───────────────────────────── */}
                {singleUser.isBlocked && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-700 dark:text-red-400 text-sm">Account Blocked</p>
                            <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">
                                Contact{' '}<a href="tel:+8809609333222" className="underline font-semibold">+880 9609 333222</a>{' '}or{' '}
                                <a href="mailto:support@infra.gov" className="underline font-semibold">support@infra.gov</a>
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Limit Warning ─────────────────────────────── */}
                {!singleUser.isBlocked && !canReportMore && (
                    <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">Free Issue Limit Reached</p>
                            <p className="text-amber-600 dark:text-amber-300 text-xs mt-0.5">
                                You've used all {singleUser.maxFreeIssues} free reports. Upgrade to continue.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/profilePage')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl hover:scale-[1.02] transition-all shadow-md shrink-0"
                        >
                            <Crown className="w-3.5 h-3.5" /> Upgrade to Premium
                        </button>
                    </div>
                )}

                {/* ── Header ────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="flex justify-center sm:justify-start text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                            Report an{' '}
                            <span className="ml-1.5 text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Issue</span>
                        </h1>
                        <p className="text-center sm:text-start text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Help improve your city by reporting infrastructure problems
                        </p>
                    </div>

                    {/* Status pill */}
                    <div className="flex justify-center sm:justify-start items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                        <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Status: </span>
                            <span className={`font-bold ${singleUser.isPremium ? 'text-amber-500' : 'text-blue-600 dark:text-blue-400'}`}>
                                {singleUser.isPremium ? '⭐ Premium' : 'Regular'}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
                        <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Issues: </span>
                            <span className={`font-bold ${canReportMore ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                {singleUser.isPremium ? singleUser.issueCount : `${singleUser.issueCount}/${singleUser.maxFreeIssues}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Main Grid ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left — Form ─────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            {/* Top gradient bar */}
                            <div className="h-1 w-full bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />

                            <div className="p-5 sm:p-7">
                                <form onSubmit={handleSubmit} className="space-y-5">

                                    {/* Title */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                            <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Issue Title <span className="text-red-500">*</span></span>
                                        </label>
                                        <input
                                            type="text" name="title" value={formData.title}
                                            onChange={handleInputChange} disabled={isDisabled}
                                            placeholder="Brief, descriptive title of the problem"
                                            className={inputCls('title')}
                                        />
                                        {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Category <span className="text-red-500">*</span></span>
                                        </label>
                                        <select
                                            name="category" value={formData.category}
                                            onChange={handleInputChange} disabled={isDisabled}
                                            className={`${inputCls('category')} appearance-none`}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Description <span className="text-red-500">*</span></span>
                                        </label>
                                        <textarea
                                            name="description" value={formData.description}
                                            onChange={handleInputChange} disabled={isDisabled} rows={5}
                                            placeholder="Describe the issue in detail — when you noticed it, safety concerns, and any other relevant information."
                                            className={inputCls('description')}
                                        />
                                        <div className="flex items-center justify-between mt-1">
                                            {errors.description
                                                ? <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>
                                                : <span />
                                            }
                                            <span className={`text-xs ml-auto ${formData.description.length < 20 ? 'text-gray-400' : 'text-emerald-500'}`}>
                                                {formData.description.length} / 20 min
                                            </span>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location <span className="text-red-500">*</span></span>
                                        </label>
                                        <input
                                            type="text" name="location" value={formData.location}
                                            onChange={handleInputChange} disabled={isDisabled}
                                            placeholder="Street address, landmark, or area name"
                                            className={inputCls('location')}
                                        />
                                        {errors.location && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.location}</p>}
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                            <span className="flex items-center gap-1.5">
                                                <Camera className="w-3.5 h-3.5" /> Photos <span className="text-red-500">*</span>
                                                <span className="text-gray-400 font-normal normal-case">(max 5)</span>
                                            </span>
                                        </label>

                                        {/* Drop zone */}
                                        <label className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${errors.images
                                                ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-700/30 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                                            } ${(isDisabled || formData.images.length >= 5) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {uploading ? (
                                                <>
                                                    <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-blue-500" />
                                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Uploading images...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                                        <Upload className="w-6 h-6 text-blue-500" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            Drop images here or <span className="text-blue-600 dark:text-blue-400">browse</span>
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP — max 5MB each</p>
                                                    </div>
                                                </>
                                            )}
                                            <input
                                                type="file" className="hidden" accept="image/*" multiple
                                                onChange={handleImageUpload}
                                                disabled={isDisabled || formData.images.length >= 5 || uploading}
                                            />
                                        </label>

                                        {/* Previews */}
                                        {imagePreviews.length > 0 && (
                                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                                                        <img src={preview.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                                                        <button
                                                            type="button" onClick={() => removeImage(index)}
                                                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {/* Add more slot */}
                                                {formData.images.length < 5 && (
                                                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                                                        <div className="text-center">
                                                            <span className="text-xl text-gray-400">+</span>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">{formData.images.length}/5</p>
                                                        </div>
                                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={isDisabled || uploading} />
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                        {errors.images && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.images}</p>}
                                    </div>

                                    {/* Submit */}
                                    <div className="pt-2">
                                        <button
                                            type="submit" disabled={isDisabled || uploading}
                                            className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                        >
                                            {uploading
                                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading images...</>
                                                : <><Zap className="w-4 h-4" /> Submit Issue Report</>
                                            }
                                        </button>
                                        {isDisabled && !uploading && (
                                            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center justify-center gap-1">
                                                <Lock className="w-3 h-3" />
                                                {singleUser.isBlocked ? 'Account blocked — cannot submit' : 'Upgrade to Premium to report more issues'}
                                            </p>
                                        )}
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>

                    {/* ── Right — Sidebar ──────────────────────────── */}
                    <div className="space-y-5">

                        {/* Reporting Guidelines */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-emerald-500 to-teal-500" />
                            <div className="p-5">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                                    <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    Reporting Guidelines
                                </h3>
                                <ul className="space-y-2.5">
                                    {[
                                        'Provide a clear, descriptive title',
                                        'Include specific location details',
                                        'Upload clear, well-lit photos',
                                        'Describe any safety concerns',
                                        'Be accurate and factual',
                                    ].map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* What Happens Next */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-blue-500 to-violet-500" />
                            <div className="p-5">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                                    <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                    </div>
                                    What Happens Next
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { step: '1', title: 'Submission Review', desc: 'Admin reviews your report within 24 hours', color: 'bg-blue-500' },
                                        { step: '2', title: 'Verification', desc: 'Staff verifies the issue on-site', color: 'bg-violet-500' },
                                        { step: '3', title: 'Assignment', desc: 'Issue assigned to relevant department', color: 'bg-purple-500' },
                                        { step: '4', title: 'Resolution', desc: 'Issue resolved with regular updates', color: 'bg-emerald-500' },
                                    ].map((item, i, arr) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="relative flex flex-col items-center">
                                                <div className={`w-6 h-6 ${item.color} rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0`}>
                                                    {item.step}
                                                </div>
                                                {i < arr.length - 1 && <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mt-1" />}
                                            </div>
                                            <div className="pb-1">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white">{item.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Premium upsell */}
                        {!singleUser.isPremium && (
                            <div className="relative overflow-hidden bg-linear-to-br from-violet-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg shadow-violet-500/20">
                                <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
                                <div className="flex items-center gap-2 mb-2">
                                    <Crown className="w-4 h-4 text-amber-300" />
                                    <span className="text-xs font-bold uppercase tracking-wide text-white/70">Go Premium</span>
                                </div>
                                <p className="text-sm font-bold mb-1">Unlimited issue reporting</p>
                                <p className="text-xs text-white/60 mb-4">
                                    Free users can report {singleUser.maxFreeIssues} issues. Upgrade for unlimited access.
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard/profilePage')}
                                    className="w-full py-2 bg-white text-violet-700 text-xs font-black rounded-lg hover:scale-[1.02] transition-all shadow-md"
                                >
                                    Upgrade Now →
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportIssuePage;