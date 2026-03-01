import { useRef, useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Calendar, Settings, Lock,
    Eye, EyeOff, Key, Award, Shield, Upload, CheckCircle2,
    XCircle, UserCircle, Briefcase, IdCard, AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import axios from 'axios';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import { toast, Toaster } from 'react-hot-toast';

/* ─── shared input class ─────────────────────────── */
const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50";

const StaffProfilePage = () => {
    const { user, updateUserProfile } = useAuth();
    const axiosSecure = useAxiosSecure();
    const fileInputRef = useRef(null);

    const [isEditing,    setIsEditing]    = useState(false);
    const [activeTab,    setActiveTab]    = useState('profile');
    const [isUploading,  setIsUploading]  = useState(false);
    const [showPassword, setShowPassword] = useState({ cur: false, new: false, con: false });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [formData,     setFormData]     = useState({
        name: '', email: '', phoneNumber: '', photoURL: '', address: '',
        employeeId: '', department: '', position: '', joinDate: '',
        reportingTo: '', employmentType: '', skills: [],
        emergencyContact: '', lastLogin: '', isActive: true,
    });

    /* ── fetch ── */
    const { data: staffData = {}, refetch } = useQuery({
        queryKey: ['staffProfile', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/singleUser?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    useEffect(() => {
        if (staffData && Object.keys(staffData).length > 0) {
            setFormData(prev => ({
                ...prev,
                ...staffData,
                joinDate:  staffData.joinDate  || new Date().toISOString(),
                lastLogin: staffData.lastLogin || new Date().toISOString(),
            }));
        }
    }, [staffData]);

    /* ── image upload ── */
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!valid.includes(file.type)) { toast.error('Invalid image type'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB allowed'); return; }
        if (!staffData?._id) { toast.error('User data not loaded yet'); return; }

        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`, fd);
            const imageUrl = res.data.data.url;
            await updateUserProfile({ photoURL: imageUrl });
            await axiosSecure.patch(`/updateUser/${staffData._id}`, { photoURL: imageUrl });
            setFormData(p => ({ ...p, photoURL: imageUrl }));
            refetch();
            toast.success('Profile photo updated!');
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    /* ── save profile ── */
    const handleSaveProfile = async () => {
        try {
            await axiosSecure.patch(`/updateUser/${staffData?._id}`, formData);
            await updateUserProfile({ displayName: formData.name });
            toast.success('Profile updated!');
            setIsEditing(false);
            refetch();
        } catch { toast.error('Failed to save changes.'); }
    };

    /* ── skills ── */
    const handleSkillsChange = (e) => {
        setFormData(p => ({
            ...p,
            skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
        }));
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

    /* ── derived ── */
    const employeeIdShort = (() => {
        try {
            const s = staffData._id?.toString() || '';
            return s.length > 10 ? s.slice(10) : s || 'N/A';
        } catch { return 'N/A'; }
    })();

    const tabs = [
        { id: 'profile',  label: 'Personal Info', icon: User   },
        { id: 'security', label: 'Security',       icon: Shield },
    ];

    const statCards = [
        {
            label: 'Employee ID', value: employeeIdShort,
            icon: IdCard, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500',
            accent: 'from-blue-500 to-cyan-400',
        },
        {
            label: 'Join Date',
            value: formData.joinDate
                ? new Date(formData.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : '—',
            icon: Calendar, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-500',
            accent: 'from-emerald-500 to-teal-400',
        },
        {
            label: 'Status', value: formData.isActive ? 'Active' : 'Inactive',
            icon: formData.isActive ? CheckCircle2 : XCircle,
            iconBg:    formData.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30',
            iconColor: formData.isActive ? 'text-emerald-500' : 'text-red-500',
            accent:    formData.isActive ? 'from-emerald-500 to-teal-400' : 'from-red-500 to-rose-400',
        },
    ];

    /* ══════════════════════════════════ RENDER ══════════════════════════════════ */
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', borderRadius: '12px' } }} />

            <div className="max-w-7xl mx-auto">

                {/* ── Header ───────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-center sm:text-start text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                            My{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Profile</span>
                        </h1>
                        <p className="text-center sm:text-start text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your personal information and security settings</p>
                    </div>
                    <span className={`self-center sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        formData.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${formData.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* ── Main Grid ────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* ── Left sidebar ─────────────────────── */}
                    <div className="md:col-span-1 space-y-5">

                        {/* Profile card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />
                            <div className="p-5 flex flex-col items-center">

                                {/* Avatar */}
                                <div className="relative mb-4">
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" disabled={isUploading} />
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl">
                                        {formData.photoURL ? (
                                            <img src={formData.photoURL} alt={formData.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                                {formData.name?.charAt(0)?.toUpperCase() || 'S'}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 hover:scale-110 transition-transform disabled:opacity-70"
                                    >
                                        {isUploading
                                            ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <Upload className="w-3.5 h-3.5" />
                                        }
                                    </button>
                                </div>

                                {/* Name + position */}
                                <div className="text-center mb-4">
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white">{formData.name || 'Staff Member'}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formData.position || 'Staff'}</p>
                                    {formData.department && (
                                        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                            <Briefcase className="w-3 h-3 text-blue-500" />
                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">{formData.department}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Contact strip */}
                                <div className="w-full space-y-2">
                                    {[
                                        { icon: Mail,  value: formData.email           || 'Not set' },
                                        { icon: Phone, value: formData.phoneNumber     || 'Not set' },
                                        { icon: MapPin,value: formData.address         || 'Not set' },
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

                        {/* Nav tabs */}
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
                                            className={`w-full flex items-center justify-center sm:justify-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                                active
                                                    ? 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* ── Right content ────────────────────── */}
                    <div className="md:col-span-3 space-y-5">

                        {/* Stat cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {statCards.map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div key={i} className="flex flex-col items-center sm:items-start bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                        <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                            <Icon className={`w-4 h-4 ${s.iconColor}`} />
                                        </div>
                                        <p className="text-xl font-black text-gray-900 dark:text-white mb-0.5">{s.value}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                                        <div className={`mt-2.5 h-0.5 w-full rounded-full bg-linear-to-r ${s.accent}`} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tab content card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />
                            <div className="p-5 sm:p-7">

                                {/* ══ PROFILE TAB ══ */}
                                {activeTab === 'profile' && (
                                    <div>
                                        {/* Header row */}
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                                            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                                                <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-500" />
                                                </div>
                                                Personal Information
                                            </h2>
                                            {!isEditing ? (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md hover:scale-[1.02] transition-all"
                                                >
                                                    <Settings className="w-3.5 h-3.5" /> Edit Profile
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => { setIsEditing(false); setFormData(p => ({ ...p, ...staffData })); }}
                                                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl shadow-md hover:scale-[1.02] transition-all"
                                                    >
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
                                                    ? <input type="text" name="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Your full name" />
                                                    : <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white font-medium">{formData.name || '—'}</div>
                                                }
                                            </div>

                                            {/* Email (read-only) */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</span>
                                                </label>
                                                <div className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400 font-medium flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5 shrink-0" /> {formData.email || '—'}
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</span>
                                                </label>
                                                {isEditing
                                                    ? <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={e => setFormData(p => ({ ...p, phoneNumber: e.target.value }))} className={inputCls} placeholder="Your phone number" />
                                                    : <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white">{formData.phoneNumber || 'Not provided'}</div>
                                                }
                                            </div>

                                            {/* Emergency Contact */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Emergency Contact</span>
                                                </label>
                                                {isEditing
                                                    ? <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={e => setFormData(p => ({ ...p, emergencyContact: e.target.value }))} className={inputCls} placeholder="Emergency contact number" />
                                                    : <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white">{formData.emergencyContact || 'Not provided'}</div>
                                                }
                                            </div>

                                            {/* Address */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Address</span>
                                                </label>
                                                {isEditing
                                                    ? <textarea name="address" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} rows={3} className={inputCls} placeholder="Your address" />
                                                    : <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white">{formData.address || 'Not provided'}</div>
                                                }
                                            </div>

                                            {/* Skills */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Skills</span>
                                                </label>
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={formData.skills?.join(', ')}
                                                            onChange={handleSkillsChange}
                                                            className={inputCls}
                                                            placeholder="Separate skills with commas (e.g. React, Node.js, Python)"
                                                        />
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Separate each skill with a comma</p>
                                                    </>
                                                ) : (
                                                    <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 flex flex-wrap gap-2">
                                                        {formData.skills?.length > 0
                                                            ? formData.skills.map((skill, i) => (
                                                                <span key={i} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold">
                                                                    {skill}
                                                                </span>
                                                            ))
                                                            : <span className="text-sm text-gray-400 dark:text-gray-500">No skills added</span>
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ══ SECURITY TAB ══ */}
                                {activeTab === 'security' && (
                                    <div>
                                        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-6">
                                            <div className="w-7 h-7 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-violet-500" />
                                            </div>
                                            Security Settings
                                        </h2>

                                        <div className="max-w-lg space-y-5">
                                            {/* Change password box */}
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
                                                                name="currentPassword"
                                                                value={passwordData.currentPassword}
                                                                onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                                                                className={`${inputCls} pr-10`}
                                                                placeholder="Enter current password"
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
                                                                name="newPassword"
                                                                value={passwordData.newPassword}
                                                                onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                                                                className={`${inputCls} pr-10`}
                                                                placeholder="Enter new password"
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
                                                                name="confirmPassword"
                                                                value={passwordData.confirmPassword}
                                                                onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                                                                className={`${inputCls} pr-10`}
                                                                placeholder="Confirm new password"
                                                            />
                                                            <button type="button" onClick={() => setShowPassword(p => ({ ...p, con: !p.con }))}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                                {showPassword.con ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        </div>
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

                                            {/* Security tips */}
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

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffProfilePage;