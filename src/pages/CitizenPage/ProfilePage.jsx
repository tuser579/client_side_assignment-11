import { useRef, useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Calendar, Settings, Lock,
    Eye, EyeOff, Key, Award, Shield, Upload, CheckCircle2,
    Crown, CreditCard, AlertCircle, Star, Zap, UserCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import axios from 'axios';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import { toast, Toaster } from 'react-hot-toast';
import ProfilePageSkeleton from '../../Components/ProfilePageSkeleton';

/* ─── shared input class ─────────────────────────── */
const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50";

const ProfilePage = () => {
    const { user, updateUserProfile } = useAuth();
    const axiosSecure = useAxiosSecure();
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [showPassword, setShowPassword] = useState({ cur: false, new: false, con: false });
    const [isUploading, setIsUploading] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [formData, setFormData] = useState({ name: '', phoneNumber: '', address: '' });

    /* ── fetch ── */
    const { data = {}, refetch, isLoading } = useQuery({
        queryKey: ['userData', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const [issuesRes, userRes] = await Promise.all([
                axiosSecure.get(`/myIssues?email=${user?.email}`),
                axiosSecure.get(`/singleUser?email=${user?.email}`)
            ]);
            return { issues: issuesRes.data, users: userRes.data };
        }
    });

    const { issues = [], users: singUser = {} } = data;

    useEffect(() => {
        if (singUser && Object.keys(singUser).length > 0) {
            setFormData({ name: singUser.name || '', phoneNumber: singUser.phoneNumber || '', address: singUser.address || '' });
        }
    }, [singUser]);

    /* ── derived stats ── */
    const totalIssues = singUser?.issueCount || 0;
    const rejectedCount = issues.filter(i => i.status === 'Rejected').length;
    const successfulCount = totalIssues - rejectedCount;
    const citizenScore = totalIssues > 0 ? ((successfulCount / totalIssues) * 100).toFixed(1) : '0.0';

    const stats = [
        { title: 'Total Reports', value: totalIssues, icon: AlertCircle, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500', accent: 'from-blue-500 to-cyan-400' },
        { title: 'Successful Reports', value: successfulCount, icon: CheckCircle2, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-500', accent: 'from-emerald-500 to-teal-400' },
        { title: 'Citizen Score', value: `${citizenScore}%`, icon: Award, iconBg: 'bg-amber-50 dark:bg-amber-900/30', iconColor: 'text-amber-500', accent: 'from-amber-500 to-orange-400' },
    ];

    const premiumBenefits = [
        'Unlimited issue submissions',
        'Priority support (24-48h response)',
        'Advanced analytics dashboard',
        'Direct communication channel',
        'Verified citizen badge',
    ];

    const tabs = [
        { id: 'profile', label: 'Profile Info', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'subscription', label: 'Subscription', icon: Crown },
    ];

    /* ── image upload ── */
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!valid.includes(file.type)) { toast.error('Invalid image type'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB allowed'); return; }

        const confirm = await Swal.fire({
            title: 'Upload this photo?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Upload',
            reverseButtons: true
        });
        if (!confirm.isConfirmed) return;

        if (!singUser?._id) { toast.error('User data not loaded yet. Please wait.'); return; }

        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await axios.post(
                `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`,
                fd
            );
            const imageUrl = res.data.data.url;

            // 1. update Firebase auth profile
            await updateUserProfile({ photoURL: imageUrl });

            // 2. update MongoDB — use the dedicated photo endpoint (not /updateUser)
            await axiosSecure.patch(`/userPhotoUpdate/${singUser._id}`, { photoURL: imageUrl });

            refetch();
            toast.success('Profile photo updated!');
        } catch (err) {
            console.error('Upload error:', err);
            const msg = err?.response?.data?.message || err?.message || 'Upload failed';
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    /* ── save profile ── */
    const handleSaveProfile = async () => {
        const r = await Swal.fire({ title: 'Save changes?', icon: 'question', showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#6b7280', confirmButtonText: 'Save', reverseButtons: true });
        if (!r.isConfirmed) return;
        try {
            await axiosSecure.patch(`/updateUser/${singUser?._id}`, formData);
            await updateUserProfile({ displayName: formData.name });
            toast.success('Profile updated!'); setIsEditing(false); refetch();
        } catch { toast.error('Failed to save changes.'); }
    };

    /* ── password ── */
    const handleUpdatePassword = async () => {
        if (!passwordData.currentPassword?.trim()) { toast.error('Enter current password'); return; }
        if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('Passwords do not match'); return; }
        if (passwordData.newPassword.length < 8) { toast.error('Min 8 characters required'); return; }
        const r = await Swal.fire({ title: 'Update password?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#6b7280', confirmButtonText: 'Update', reverseButtons: true });
        if (!r.isConfirmed) return;
        try {
            const auth = getAuth();
            const credential = EmailAuthProvider.credential(auth.currentUser.email, passwordData.currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, passwordData.newPassword);
            toast.success('Password updated!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            const msg = err.code === 'auth/wrong-password' ? 'Current password is incorrect.'
                : err.code === 'auth/weak-password' ? 'Password too weak.'
                    : err.message;
            toast.error(msg);
        }
    };

    /* ── subscription ── */
    const handleSubscribe = async () => {
        if (singUser?.isBlocked) { toast.error('Account blocked.'); return; }
        const r = await Swal.fire({ title: 'Premium Subscription', text: '৳1000 will be charged.', icon: 'question', showCancelButton: true, confirmButtonColor: '#f59e0b', cancelButtonColor: '#6b7280', confirmButtonText: 'Subscribe ৳1000', reverseButtons: true });
        if (!r.isConfirmed) return;
        try {
            const res = await axiosSecure.post('/create-checkout-session', { cost: 1000, userID: singUser?._id, name: singUser?.name, email: singUser?.email, type: 'Premium Subscription', totalPayment: singUser.totalPayment + 1000, issueId: 1 });
            Swal.fire({ icon: 'success', title: 'Redirecting...', timer: 2000, showConfirmButton: false });
            setTimeout(() => window.location.assign(res.data.url), 1500);
        } catch { Swal.fire({ icon: 'error', title: 'Payment Failed', text: 'Please try again.' }); }
    };

    if (isLoading) return (
        <ProfilePageSkeleton></ProfilePageSkeleton>
    );


    /* ─────────────────────────── RENDER ─────────────────────────── */
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', borderRadius: '12px' } }} />

            <div className="max-w-7xl mx-auto">

                {/* ── Blocked Warning ──────────────────────────── */}
                {singUser?.isBlocked && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-700 dark:text-red-400 text-sm">Account Blocked</p>
                            <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">
                                Contact <a href="tel:+8809609333222" className="underline font-semibold">+880 9609 333222</a>{' '}or{' '}
                                <a href="mailto:support@infra.gov" className="underline font-semibold">support@infra.gov</a>
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Header ───────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-center sm:text-start text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                            My{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Profile</span>
                        </h1>
                        <p className="text-center sm:text-start text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account and subscription settings</p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        {singUser?.isPremium && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20">
                                <Crown className="w-3.5 h-3.5" /> Premium
                            </span>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${singUser?.isBlocked
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${singUser?.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            {singUser?.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                    </div>
                </div>

                {/* ── Main Grid ────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* ── Left Column ──────────────────────────── */}
                    <div className="md:col-span-1 space-y-5">

                        {/* Profile Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />
                            <div className="p-5 flex flex-col items-center">
                                {/* Avatar */}
                                <div className="relative mb-4">
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl">
                                        {singUser?.photoURL ? (
                                            <img src={singUser.photoURL} alt={singUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                                {singUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 hover:scale-110 transition-transform"
                                    >
                                        {isUploading
                                            ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <Upload className="w-3.5 h-3.5" />
                                        }
                                    </button>
                                </div>

                                {/* Name + role */}
                                <div className="text-center mb-4">
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1.5">
                                        {singUser?.name || 'Citizen'}
                                        {singUser?.isPremium && <Crown className="w-4 h-4 text-amber-500" />}
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                                        <Mail className="w-3 h-3" /> {singUser?.email}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center justify-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Since {singUser?.memberSince ? new Date(singUser.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                                    </p>
                                </div>

                                {/* Contact strip */}
                                <div className="w-full space-y-2">
                                    {[
                                        { icon: Phone, value: singUser?.phoneNumber || 'Not set' },
                                        { icon: MapPin, value: singUser?.address || 'Not set' },
                                    ].map((row, i) => {
                                        const Icon = row.icon;
                                        return (
                                            <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{row.value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-blue-500 to-cyan-500" />
                            <nav className="p-3 space-y-1">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    const active = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center justify-center sm:justify-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${active
                                                ? 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            {tab.label}
                                            {tab.id === 'subscription' && !singUser?.isPremium && (
                                                <span className="ml-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full">
                                                    <Crown className="w-2.5 h-2.5" /> Pro
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* ── Right Column ─────────────────────────── */}
                    <div className="md:col-span-3 space-y-5">

                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {stats.map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div key={i} className="flex flex-col items-center sm:items-start bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                        <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                            <Icon className={`w-4 h-4 ${s.iconColor}`} />
                                        </div>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white mb-0.5">{s.value}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.title}</p>
                                        <div className={`mt-2.5 h-0.5 rounded-full bg-linear-to-r ${s.accent}`} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Tab Content Card ─────────────────── */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />
                            <div className="p-5 sm:p-7">

                                {/* ── PROFILE INFO TAB ─────────────── */}
                                {activeTab === 'profile' && (
                                    <div>
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2.5">
                                            <h2 className="flex items-center justify-center sm:justify-start gap-2 text-base font-bold text-gray-900 dark:text-white">
                                                <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-500" />
                                                </div>
                                                Personal Information
                                            </h2>
                                            {!isEditing ? (
                                                <button onClick={() => setIsEditing(true)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md hover:scale-[1.02] transition-all">
                                                    <Settings className="w-3.5 h-3.5" /> Edit Profile
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => { setIsEditing(false); setFormData({ name: singUser?.name || '', phoneNumber: singUser?.phoneNumber || '', address: singUser?.address || '' }); }}
                                                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                        Cancel
                                                    </button>
                                                    <button onClick={handleSaveProfile}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl shadow-md hover:scale-[1.02] transition-all">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                            {/* Full Name */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</span>
                                                </label>
                                                {isEditing
                                                    ? <input type="text" name="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))} className={inputCls} placeholder="Your full name" />
                                                    : <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white font-medium">{singUser?.name || '—'}</div>
                                                }
                                            </div>

                                            {/* Email (read-only) */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</span>
                                                </label>
                                                <div className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400 font-medium flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5 shrink-0" /> {singUser?.email}
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</span>
                                                </label>
                                                {isEditing
                                                    ? <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))} className={inputCls} placeholder="Your phone number" />
                                                    : <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white">{singUser?.phoneNumber || 'Not provided'}</div>
                                                }
                                            </div>

                                            {/* Member Since (read-only) */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Member Since</span>
                                                </label>
                                                <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white">
                                                    {singUser?.memberSince ? new Date(singUser.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                                </div>
                                            </div>

                                            {/* Address (full width) */}
                                            <div className=" ">
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Address</span>
                                                </label>
                                                {isEditing
                                                    ? <textarea name="address" value={formData.address} onChange={e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))} rows={3} className={inputCls} placeholder="Your address" />
                                                    : <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white">{singUser?.address || 'Not provided'}</div>
                                                }
                                            </div>

                                            {/* Account Status (read-only) */}
                                            <div className="">
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide pb-2">Account Status</label>
                                                <div className="flex items-center">
                                                    {singUser?.isBlocked ? (
                                                        <span className="inline-flex w-full items-center gap-1 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold">
                                                            <Lock className="w-3 h-3" /> Blocked
                                                        </span>
                                                    ) : singUser?.isPremium ? (
                                                        <span className="inline-flex w-full items-center gap-1 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold">
                                                            <Crown className="w-3 h-3" /> Premium Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex w-full items-center gap-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold">
                                                            <Shield className="w-3 h-3" /> Regular
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}

                                {/* ── SECURITY TAB ─────────────────── */}
                                {activeTab === 'security' && (
                                    <div>
                                        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-6">
                                            <div className="w-7 h-7 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-violet-500" />
                                            </div>
                                            Security Settings
                                        </h2>

                                        <div className="max-w-lg space-y-5">
                                            {/* Change Password box */}
                                            <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600 p-5">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="w-9 h-9 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                                        <Key className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Change Password</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Update your account password</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* Current */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Current Password</label>
                                                        <div className="relative">
                                                            <input
                                                                type={showPassword.cur ? 'text' : 'password'}
                                                                name="currentPassword" value={passwordData.currentPassword}
                                                                onChange={e => setPasswordData(p => ({ ...p, [e.target.name]: e.target.value }))}
                                                                className={`${inputCls} pr-10`} placeholder="Enter current password"
                                                            />
                                                            <button type="button" onClick={() => setShowPassword(p => ({ ...p, cur: !p.cur }))}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                                {showPassword.cur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* New */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">New Password</label>
                                                        <div className="relative">
                                                            <input
                                                                type={showPassword.new ? 'text' : 'password'}
                                                                name="newPassword" value={passwordData.newPassword}
                                                                onChange={e => setPasswordData(p => ({ ...p, [e.target.name]: e.target.value }))}
                                                                className={`${inputCls} pr-10`} placeholder="Enter new password"
                                                            />
                                                            <button type="button" onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                                {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Minimum 8 characters required</p>
                                                    </div>

                                                    {/* Confirm */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                                                        <div className="relative">
                                                            <input
                                                                type={showPassword.con ? 'text' : 'password'}
                                                                name="confirmPassword" value={passwordData.confirmPassword}
                                                                onChange={e => setPasswordData(p => ({ ...p, [e.target.name]: e.target.value }))}
                                                                className={`${inputCls} pr-10`} placeholder="Confirm new password"
                                                            />
                                                            <button type="button" onClick={() => setShowPassword(p => ({ ...p, con: !p.con }))}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                                {showPassword.con ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                        {/* Match indicator */}
                                                        {passwordData.confirmPassword && (
                                                            <p className={`text-[11px] mt-1 flex items-center gap-1 ${passwordData.newPassword === passwordData.confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {passwordData.newPassword === passwordData.confirmPassword
                                                                    ? <><CheckCircle2 className="w-3 h-3" /> Passwords match</>
                                                                    : <><AlertCircle className="w-3 h-3" /> Passwords do not match</>
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={handleUpdatePassword}
                                                        disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                                        className="w-full py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                                    >
                                                        <Lock className="w-4 h-4" /> Update Password
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Security Tips */}
                                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                                <h4 className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 mb-3">
                                                    <Shield className="w-4 h-4" /> Security Tips
                                                </h4>
                                                <ul className="space-y-1.5">
                                                    {[
                                                        'Use a strong, unique password',
                                                        'Change your password every 90 days',
                                                        'Never share your password with anyone',
                                                        'Always log out on shared computers',
                                                    ].map((tip, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                                                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── SUBSCRIPTION TAB ─────────────── */}
                                {activeTab === 'subscription' && (
                                    <div>
                                        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-6">
                                            <div className="w-7 h-7 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                                <Crown className="w-4 h-4 text-amber-500" />
                                            </div>
                                            Subscription
                                        </h2>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                            {/* Current Plan */}
                                            <div className={`rounded-xl border p-5 ${singUser?.isPremium
                                                ? 'bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800'
                                                : 'bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-600'}`}>
                                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Current Plan</p>
                                                {singUser?.isPremium ? (
                                                    <>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-9 h-9 bg-linear-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                                                                <Crown className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Premium Citizen</p>
                                                                <p className="text-xs text-amber-600 dark:text-amber-400">All features unlocked</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Active Subscription</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-9 h-9 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                                                                <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Regular Citizen</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">3 free reports</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            You've used {singUser?.issueCount || 0} of 3 free reports
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {/* Upgrade Card */}
                                            {!singUser?.isPremium && (
                                                <div className="relative overflow-hidden bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-xl p-5 text-white shadow-xl shadow-violet-500/20">
                                                    <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Crown className="w-4 h-4 text-amber-300" />
                                                        <span className="text-xs font-bold uppercase tracking-wide text-white/70">Premium Plan</span>
                                                    </div>
                                                    <p className="text-3xl font-black mb-0.5">৳1,000</p>
                                                    <p className="text-xs text-white/60 mb-4">One-time payment · Lifetime access</p>
                                                    <button
                                                        onClick={handleSubscribe}
                                                        className="w-full py-2.5 bg-white text-violet-700 text-xs font-black rounded-lg hover:scale-[1.02] transition-all shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        <CreditCard className="w-4 h-4" /> Subscribe Now
                                                    </button>
                                                </div>
                                            )}

                                            {/* If premium, show payment info */}
                                            {singUser?.isPremium && (
                                                <div className="relative overflow-hidden bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-xl p-5 text-white shadow-xl shadow-violet-500/20">
                                                    <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
                                                    <p className="text-xs font-bold uppercase tracking-wide text-white/70 mb-2">Lifetime Spend</p>
                                                    <p className="text-3xl font-black mb-1">৳{singUser?.totalPayment?.toLocaleString() || 0}</p>
                                                    <p className="text-xs text-white/60 mb-3">Total paid on CityFix</p>
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-xl">
                                                        <Star className="w-3.5 h-3.5 text-amber-300" />
                                                        <span className="text-xs font-bold text-white/80">Premium Member — Thank you!</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Benefits (full width) */}
                                            <div className="sm:col-span-2 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600 p-5">
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4">Premium Benefits</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    {premiumBenefits.map((benefit, i) => (
                                                        <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium ${singUser?.isPremium
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                                                            }`}>
                                                            <CheckCircle2 className={`w-4 h-4 shrink-0 ${singUser?.isPremium ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`} />
                                                            {benefit}
                                                        </div>
                                                    ))}
                                                </div>

                                                {!singUser?.isPremium && (
                                                    <button onClick={handleSubscribe}
                                                        className="mt-4 w-full py-2.5 bg-linear-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 hover:scale-[1.01] hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2">
                                                        <Zap className="w-4 h-4" /> Upgrade to Premium · ৳1,000
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;