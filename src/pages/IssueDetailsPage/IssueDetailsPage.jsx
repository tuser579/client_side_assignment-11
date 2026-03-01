import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import {
    HiOutlineArrowLeft, HiOutlinePencilAlt, HiOutlineTrash,
    HiOutlineLightningBolt, HiOutlineClock, HiOutlineCheckCircle,
    HiOutlineXCircle, HiOutlineExclamationCircle, HiOutlinePhotograph,
    HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineUser,
    HiOutlineUsers, HiOutlineDocumentText, HiOutlineBookmark,
    HiOutlineThumbUp, HiOutlineShare, HiOutlineX, HiOutlineCog,
    HiOutlineRefresh, HiOutlineLockClosed, HiOutlineUpload
} from 'react-icons/hi';
import { AlertCircle, Shield, History, User as UserIcon, Zap } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import IssueDetailsPageSkeleton from '../../Components/IssueDetailsPageSkeleton';

/* ─── tiny helpers ────────────────────────────────────────────── */
const statusConfigs = {
    Pending: { gradient: 'from-amber-500 to-orange-500', icon: <HiOutlineClock className="w-3.5 h-3.5" />, dot: 'bg-amber-400', badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    'In-Progress': { gradient: 'from-blue-500 to-cyan-500', icon: <HiOutlineRefresh className="w-3.5 h-3.5" />, dot: 'bg-blue-400', badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    Working: { gradient: 'from-violet-500 to-purple-500', icon: <HiOutlineCog className="w-3.5 h-3.5" />, dot: 'bg-violet-400', badge: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800' },
    Resolved: { gradient: 'from-emerald-500 to-teal-500', icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" />, dot: 'bg-emerald-400', badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    Closed: { gradient: 'from-gray-500 to-gray-600', icon: <HiOutlineLockClosed className="w-3.5 h-3.5" />, dot: 'bg-gray-400', badge: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600' },
    Rejected: { gradient: 'from-red-500 to-pink-500', icon: <HiOutlineXCircle className="w-3.5 h-3.5" />, dot: 'bg-red-400', badge: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
};
const getStatusConfig = (s) => statusConfigs[s] || statusConfigs.Pending;
const getPriorityConfig = (p) => p === 'High'
    ? { gradient: 'from-red-500 to-orange-500', label: 'High', icon: <HiOutlineExclamationCircle className="w-3 h-3" />, badge: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' }
    : { gradient: 'from-blue-500 to-blue-600', label: 'Normal', icon: <HiOutlineBookmark className="w-3 h-3" />, badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' };

const categoryIcons = { Road_Damage: '🛣️', Streetlight: '💡', Garbage: '🗑️', Footpath: '🚶', Drainage: '🌊', Traffic: '🚦', Parks: '🌳', Public_Toilet: '🚻', Noise: '🔇', Electricity: '⚡', Water_Supply: '💧', Sanitation: '♻️', Infrastructure: '🏗️', Other: '❓' };
const getCategoryIcon = (cat) => categoryIcons[cat] || '📋';

const timelineColors = { Issue_Reported: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', Staff_Assigned: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400', Status_Changed: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', Boost_Issue: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' };
const timelineIcons = { Issue_Reported: <HiOutlineDocumentText className="w-4 h-4" />, Staff_Assigned: <HiOutlineUsers className="w-4 h-4" />, Status_Changed: <HiOutlineClock className="w-4 h-4" />, Boost_Issue: <HiOutlineLightningBolt className="w-4 h-4" />, Rejected: <HiOutlineXCircle className="w-4 h-4" /> };
const getTimelineColor = (t) => timelineColors[t] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
const getTimelineIcon = (t) => timelineIcons[t] || <HiOutlineClock className="w-4 h-4" />;

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatAgo = (d) => {
    const ms = Date.now() - new Date(d); const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), days = Math.floor(ms / 86400000);
    if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`; if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

/* ─── main component ──────────────────────────────────────────── */
const IssueDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: '', description: '', category: '', location: '', images: [] });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [activeImg, setActiveImg] = useState(null);

    const { data: issue = {}, refetch, isLoading, isError, error } = useQuery({
        queryKey: ['issue', id],
        queryFn: async () => (await axiosSecure.get(`/issueDetails/${id}`)).data,
        retry: 2, refetchOnWindowFocus: true
    });

    const { data: currentUser = {} } = useQuery({
        queryKey: ['singleUser', user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/singleUser/${user?.email}`)).data
    });

    useEffect(() => {
        if (showEditModal && issue) {
            setEditFormData({ title: issue.title || '', description: issue.description || '', category: issue.category || '', location: issue.location || '', images: issue.images || [] });
            setImagePreviews((issue.images || []).map(url => ({ url, name: url.split('/').pop() || 'Image', isNew: false })));
        }
    }, [showEditModal, issue]);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (editFormData.images.length + files.length > 5) { toast.error('Maximum 5 images'); return; }
        const newImages = files.slice(0, 5 - editFormData.images.length);
        const newPreviews = newImages.map(f => ({ url: URL.createObjectURL(f), name: f.name, isNew: true }));
        setImagePreviews(p => [...p, ...newPreviews]);
        setUploadingImages(true);
        try {
            const url = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`;
            const urls = await Promise.all(newImages.map(async f => { const fd = new FormData(); fd.append('image', f); return (await axios.post(url, fd)).data.data.url; }));
            setEditFormData(p => ({ ...p, images: [...p.images, ...urls] }));
            toast.success('Images uploaded!');
        } catch { toast.error('Upload failed'); setImagePreviews(p => p.filter(x => !x.isNew)); }
        finally { setUploadingImages(false); }
    };

    const removeImage = (i) => {
        if (imagePreviews[i].isNew) URL.revokeObjectURL(imagePreviews[i].url);
        const p = [...imagePreviews]; p.splice(i, 1); setImagePreviews(p);
        const imgs = [...editFormData.images]; imgs.splice(i, 1); setEditFormData(prev => ({ ...prev, images: imgs }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editFormData.title.trim()) { toast.error('Title required'); return; }
        if (!editFormData.description.trim()) { toast.error('Description required'); return; }
        if (!editFormData.category) { toast.error('Category required'); return; }
        if (!editFormData.location.trim()) { toast.error('Location required'); return; }
        const r = await Swal.fire({ title: 'Update Issue?', icon: 'question', showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#6b7280', confirmButtonText: 'Update', reverseButtons: true });
        if (!r.isConfirmed) return;
        Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            await axiosSecure.patch(`/myIssueUpdate/${id}`, editFormData);
            Swal.fire({ title: 'Updated!', icon: 'success', timer: 2000, showConfirmButton: false });
            queryClient.invalidateQueries(['issue', id]);
            imagePreviews.forEach(p => p.isNew && URL.revokeObjectURL(p.url));
            setImagePreviews([]); setShowEditModal(false);
        } catch (err) { Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed', icon: 'error' }); }
    };

    const handleDelete = () => {
        if (currentUser?.isBlocked) { toast.error('Account blocked.'); return; }
        if (issue?.reportedByEmail !== user?.email) { toast.error('Not your issue.'); return; }
        Swal.fire({ title: 'Delete?', text: "Cannot be undone!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Delete', reverseButtons: true })
            .then(r => {
                if (!r.isConfirmed) return;
                Swal.fire({ title: 'Deleting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                axiosSecure.delete(`/myIssueDelete/${id}`)
                    .then(() => { Swal.fire({ title: 'Deleted!', icon: 'success', timer: 2000, showConfirmButton: false }); setTimeout(() => navigate(-1), 2000); })
                    .catch(err => Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed', icon: 'error' }));
            });
    };

    const handleBoost = async () => {
        if (currentUser?.isBlocked) { toast.error('Account blocked.'); return; }
        const r = await Swal.fire({ title: 'Boost Issue?', text: '৳100 will be charged.', icon: 'question', showCancelButton: true, confirmButtonColor: '#f59e0b', cancelButtonColor: '#6b7280', confirmButtonText: 'Boost ৳100', reverseButtons: true });
        if (!r.isConfirmed) return;
        try {
            const res = await axiosSecure.post('/create-checkout-session', { cost: 100, userID: currentUser?._id, name: currentUser?.name, email: currentUser?.email, type: 'Boost Issue', totalPayment: currentUser.totalPayment + 100, issueId: id });
            Swal.fire({ icon: 'success', title: 'Redirecting...', timer: 2000, showConfirmButton: false });
            setTimeout(() => window.location.assign(res.data.url), 500);
        } catch { Swal.fire({ icon: 'error', title: 'Payment Failed', text: 'Please try again.' }); }
    };

    const handleUpvote = async () => {
        if (currentUser?.isBlocked) { toast.error('Account blocked.'); return; }
        if (issue?.reportedByEmail === user?.email) { toast.error('Cannot upvote own issue.'); return; }
        const arr = Array.isArray(issue.isUpvoted) ? issue.isUpvoted : [];
        if (arr.includes(user.email)) { toast.error('Already upvoted.'); return; }
        try {
            await axiosSecure.patch(`/upvoteIssue/${issue._id}`, { isUpvoted: [...arr, user.email], upVotes: (issue.upVotes || 0) + 1 });
            refetch(); toast.success('Upvoted!');
        } catch { toast.error('Failed to upvote.'); }
    };

    /* ── derived ── */
    if (isLoading) return <IssueDetailsPageSkeleton />;

    if (isError) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Issue Not Found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">{error?.message || 'This issue does not exist.'}</p>
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:scale-[1.02] transition-all shadow-lg">
                    <HiOutlineArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        </div>
    );

    const sc = getStatusConfig(issue.status);
    const pc = getPriorityConfig(issue.priority);
    const isOwner = issue?.reportedByEmail === user?.email;
    const canEdit = isOwner && !currentUser?.isBlocked && issue.status === 'Pending';
    const canDelete = isOwner && !currentUser?.isBlocked && issue.status === 'Pending';
    const canBoost = isOwner && !issue.isBoosted && !currentUser?.isBlocked && issue.status === 'Pending';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', borderRadius: '12px' } }} />

            <div className="max-w-6xl mx-auto">

                {/* ── Blocked Warning ──────────────────────────── */}
                {currentUser?.isBlocked && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-700 dark:text-red-400 text-sm">Account Blocked</p>
                            <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">You cannot perform any actions on issues.</p>
                        </div>
                    </div>
                )}

                {/* ── Top Nav ──────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                    >
                        <HiOutlineArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Issues
                    </button>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sc.badge}`}>
                            {sc.icon} {issue.status}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${pc.badge}`}>
                            {pc.icon} {pc.label} Priority
                        </span>
                        {issue.isBoosted && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-linear-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-md">
                                <HiOutlineLightningBolt className="w-3 h-3" /> Boosted
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Main Grid ────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left ─────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Issue card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />

                            <div className="p-5 sm:p-6">
                                {/* Category + Actions row */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{getCategoryIcon(issue.category)}</span>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{issue.category?.replace('_', ' ') || 'Other'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {canEdit && (
                                            <button onClick={() => setShowEditModal(true)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                                                <HiOutlinePencilAlt className="w-3.5 h-3.5" /> Edit
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button onClick={handleDelete}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                                                <HiOutlineTrash className="w-3.5 h-3.5" /> Delete
                                            </button>
                                        )}
                                        {canBoost && (
                                            <button onClick={handleBoost}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl hover:shadow-md hover:shadow-amber-500/20 hover:scale-[1.02] transition-all">
                                                <HiOutlineLightningBolt className="w-3.5 h-3.5" /> Boost ৳100
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">{issue.title}</h1>

                                {/* Location */}
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-5">
                                    <HiOutlineLocationMarker className="w-4 h-4 shrink-0 text-blue-500" />
                                    <span>{issue.location}</span>
                                </div>

                                {/* Images gallery */}
                                {issue.images?.length > 0 && (
                                    <div className="mb-6">
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                            <HiOutlinePhotograph className="w-4 h-4" /> Evidence ({issue.images.length})
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {issue.images.map((img, i) => (
                                                <div key={i} onClick={() => setActiveImg(img)}
                                                    className="relative aspect-video rounded-xl overflow-hidden cursor-zoom-in group shadow-sm">
                                                    <img src={img} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Description</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{issue.description}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Timeline */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-violet-500 to-indigo-500" />
                            <div className="p-5 sm:p-6">
                                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-6">
                                    <div className="w-7 h-7 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                        <History className="w-4 h-4 text-violet-500" />
                                    </div>
                                    Issue Timeline
                                </h2>

                                {issue.timelineEntry?.length > 0 ? (
                                    <div className="relative">
                                        <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                                        <div className="space-y-6">
                                            {[...issue.timelineEntry].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map((item, i) => (
                                                <div key={i} className="relative flex gap-4">
                                                    <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getTimelineColor(item.action)}`}>
                                                        {getTimelineIcon(item.action)}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pb-2">
                                                        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl p-3.5">
                                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{item.action?.replace(/_/g, ' ')}</span>
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">{formatAgo(item.timestamp)}</span>
                                                            </div>
                                                            {item.note && <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{item.note}</p>}
                                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                                                                <UserIcon className="w-3 h-3" /> {item.by || 'System'}
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 pl-1">{formatDate(item.timestamp)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <HiOutlineClock className="w-7 h-7 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No timeline yet</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Updates will appear here as the issue progresses.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Right Sidebar ────────────────────────── */}
                    <div className="space-y-5">

                        {/* Issue Details card */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-blue-500 to-cyan-500" />
                            <div className="p-5">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                                    <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <HiOutlineDocumentText className="w-4 h-4 text-blue-500" />
                                    </div>
                                    Issue Details
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Issue ID', value: <code className="text-[11px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg break-all">{issue._id}</code> },
                                        { label: 'Reported By', value: <><p className="text-xs font-semibold text-gray-900 dark:text-white">{issue.reportedByName || 'Anonymous'}</p><p className="text-[11px] text-gray-500 dark:text-gray-400">{issue.reportedByEmail}</p></> },
                                        { label: 'Created', value: <p className="text-xs text-gray-700 dark:text-gray-300">{formatDate(issue.createdAt)}</p> },
                                        issue.updatedAt && { label: 'Last Updated', value: <p className="text-xs text-gray-700 dark:text-gray-300">{formatAgo(issue.updatedAt)}</p> },
                                    ].filter(Boolean).map((row, i) => (
                                        <div key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{row.label}</p>
                                            {row.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Assigned Staff */}
                        {issue.assignedStaffId && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                                <div className="h-1 bg-linear-to-r from-violet-500 to-purple-500" />
                                <div className="p-5">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                                        <div className="w-7 h-7 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-violet-500" />
                                        </div>
                                        Assigned Staff
                                    </h3>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 bg-linear-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {issue.assignedStaffName?.charAt(0) || 'S'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{issue.assignedStaffName}</p>
                                            {issue.assignedStaffEmail && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{issue.assignedStaffEmail}</p>}
                                        </div>
                                    </div>
                                    {issue.assignedDate && (
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                            <HiOutlineCalendar className="w-3 h-3" /> Assigned {formatAgo(issue.assignedDate)}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Actions */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-emerald-500 to-teal-500" />
                            <div className="p-5">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                                <div className="space-y-2.5">
                                    <button onClick={handleUpvote}
                                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                        <span className="flex items-center gap-2"><HiOutlineThumbUp className="w-4 h-4" /> Upvote Issue</span>
                                        <span className="bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">{issue.upVotes || 0}</span>
                                    </button>

                                    <button
                                        onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                                        className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                                        <HiOutlineShare className="w-4 h-4" /> Share Issue
                                    </button>

                                    <Link to="/dashboard/reportIssue" className="block">
                                        <button className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-linear-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-md hover:shadow-violet-500/20 hover:scale-[1.02] transition-all">
                                            <Zap className="w-4 h-4" /> Report New Issue
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ── Lightbox ────────────────────────────────── */}
            <AnimatePresence>
                {activeImg && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setActiveImg(null)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            src={activeImg} alt="Full" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
                        <button onClick={() => setActiveImg(null)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                            <HiOutlineX className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Edit Modal ──────────────────────────────── */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="h-1.5 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500 rounded-t-2xl" />
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Issue</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Only pending issues can be modified</p>
                                    </div>
                                    <button onClick={() => { imagePreviews.forEach(p => p.isNew && URL.revokeObjectURL(p.url)); setShowEditModal(false); }}
                                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                                        <HiOutlineX className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Title</label>
                                        <input type="text" name="title" value={editFormData.title} onChange={e => setEditFormData(p => ({ ...p, [e.target.name]: e.target.value }))} className={inputCls} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
                                        <textarea name="description" value={editFormData.description} onChange={e => setEditFormData(p => ({ ...p, [e.target.name]: e.target.value }))} rows={4} className={inputCls} required />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
                                            <select name="category" value={editFormData.category} onChange={e => setEditFormData(p => ({ ...p, [e.target.name]: e.target.value }))} className={`${inputCls} appearance-none`}>
                                                <option value="">Select</option>
                                                {['Road_Damage', 'Streetlight', 'Garbage', 'Footpath', 'Drainage', 'Traffic', 'Parks', 'Public_Toilet', 'Noise', 'Electricity', 'Water_Supply', 'Sanitation', 'Infrastructure', 'Other'].map(c => (
                                                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Location</label>
                                            <input type="text" name="location" value={editFormData.location} onChange={e => setEditFormData(p => ({ ...p, [e.target.name]: e.target.value }))} className={inputCls} required />
                                        </div>
                                    </div>

                                    {/* Image upload */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                            Images ({editFormData.images.length}/5)
                                        </label>
                                        <label className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploadingImages || editFormData.images.length >= 5 ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-700/30'}`}>
                                            {uploadingImages
                                                ? <><div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-500" /><p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Uploading...</p></>
                                                : <><div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"><HiOutlineUpload className="w-5 h-5 text-blue-500" /></div><p className="text-xs text-gray-500 dark:text-gray-400">Click to upload images</p></>
                                            }
                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImages || editFormData.images.length >= 5} />
                                        </label>
                                        {imagePreviews.length > 0 && (
                                            <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                                                {imagePreviews.map((p, i) => (
                                                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                                                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => removeImage(i)}
                                                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600">
                                                            <HiOutlineX className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                                        <button type="submit" disabled={uploadingImages} className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                            {uploadingImages ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</> : <><HiOutlineCheckCircle className="w-4 h-4" />Update Issue</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IssueDetailsPage;