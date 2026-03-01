import { useRef, useState, useEffect } from 'react';
import {
  Shield, CheckCircle, Mail, Phone, MapPin, Calendar,
  Settings, Lock, Eye, EyeOff, Key, Activity, UserCog,
  Camera, Save, X, User, ShieldCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { HiUser } from 'react-icons/hi';
import axios from 'axios';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ═══════════════════════════════════════════════
   SKELETON COMPONENTS
═══════════════════════════════════════════════ */
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />
);

const ProfileCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
    <div className="flex flex-col items-center">
      <Shimmer className="w-28 h-28 rounded-full mb-4" />
      <Shimmer className="h-5 w-36 rounded-md mb-2" />
      <Shimmer className="h-4 w-24 rounded-md mb-6" />
      <div className="w-full space-y-3">
        <Shimmer className="h-12 w-full rounded-xl" />
        <Shimmer className="h-10 w-full rounded-xl" />
        <Shimmer className="h-10 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <div className="flex items-center gap-3 mb-4">
      <Shimmer className="w-11 h-11 rounded-xl shrink-0" />
      <Shimmer className="h-3 w-20 rounded-md" />
    </div>
    <Shimmer className="h-5 w-32 rounded-md mb-1.5" />
    <Shimmer className="h-3 w-20 rounded-md" />
  </div>
);

const FormFieldSkeleton = () => (
  <div className="space-y-1.5">
    <Shimmer className="h-3 w-24 rounded-md" />
    <Shimmer className="h-12 w-full rounded-xl" />
  </div>
);

/* ═══════════════════════════════════════════════
   INPUT COMPONENT
═══════════════════════════════════════════════ */
const inputCls = `w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`;

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    {children}
  </div>
);

const ReadonlyField = ({ icon: Icon, value, placeholder = 'Not provided' }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-xl">
    {Icon && <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />}
    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{value || placeholder}</span>
  </div>
);

/* ═══════════════════════════════════════════════
   PASSWORD STRENGTH INDICATOR
═══════════════════════════════════════════════ */
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'];
  const textColors = ['', 'text-red-600 dark:text-red-400', 'text-amber-600 dark:text-amber-400', 'text-blue-600 dark:text-blue-400', 'text-emerald-600 dark:text-emerald-400'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-gray-200 dark:bg-gray-600'}`} />
        ))}
      </div>
      <p className={`text-xs font-semibold ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const AdminProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phoneNumber: '', photoURL: '',
    address: '', memberSince: '', department: '', role: '',
    adminLevel: '', lastLogin: '', isSuperAdmin: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const { data: adminData = {}, isLoading, refetch } = useQuery({
    queryKey: ['adminProfile', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/singleUser?email=${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (adminData && Object.keys(adminData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...adminData,
        lastLogin: adminData.lastLogin || new Date().toISOString()
      }));
    }
  }, [adminData]);

  /* ── Stats ── */
  const statsCards = [
    {
      title: 'Member Since',
      value: formData.memberSince
        ? new Date(formData.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A',
      icon: Calendar,
      linear: 'from-blue-500 to-cyan-500',
      bg: 'bg-linear-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-100',
      iconBg: 'bg-linear-to-br from-blue-500 to-cyan-500',
    },
    {
      title: 'Last Login',
      value: formData.lastLogin
        ? new Date(formData.lastLogin).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'N/A',
      icon: Activity,
      linear: 'from-violet-500 to-purple-500',
      bg: 'bg-linear-to-br from-violet-50 to-purple-50 border-violet-200 dark:from-violet-900/20 dark:to-purple-900/20 dark:border-violet-800',
      text: 'text-violet-800 dark:text-violet-100',
      iconBg: 'bg-linear-to-br from-violet-500 to-purple-500',
    },
    {
      title: 'Access Level',
      value: formData.isSuperAdmin ? 'Super Admin' : 'Administrator',
      icon: UserCog,
      linear: 'from-amber-500 to-orange-500',
      bg: 'bg-linear-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-100',
      iconBg: 'bg-linear-to-br from-amber-500 to-orange-500',
    },
  ];

  /* ── Photo upload ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!valid.includes(file.type)) {
      Swal.fire({ icon: 'error', title: 'Invalid File Type', text: 'Please select a JPEG, PNG, GIF, or WebP image.', customClass: { popup: 'rounded-2xl' } });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'File Too Large', text: 'Max file size is 5MB.', customClass: { popup: 'rounded-2xl' } });
      return;
    }

    Swal.fire({
      title: 'Update Profile Photo?', icon: 'question', showCancelButton: true,
      confirmButtonColor: '#3b82f6', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, upload!', customClass: { popup: 'rounded-2xl' }
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      setIsUploadingPhoto(true);
      try {
        const formDataObj = new FormData();
        formDataObj.append('image', file);
        const res = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`, formDataObj);
        const photoURL = res.data.data.url;
        await updateUserProfile({ photoURL });
        await axiosSecure.patch(`/userPhotoUpdate/${adminData?._id}`, { photoURL });
        setFormData(prev => ({ ...prev, photoURL }));
        refetch();
        toast.success('Profile photo updated!');
      } catch (err) {
        toast.error('Failed to upload photo. Please try again.');
      } finally {
        setIsUploadingPhoto(false);
      }
    });
  };

  /* ── Profile save ── */
  const handleSaveProfile = () => {
    Swal.fire({
      title: 'Save Changes?', text: 'Update your admin profile?', icon: 'question',
      showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Save', customClass: { popup: 'rounded-2xl' }
    }).then(result => {
      if (!result.isConfirmed) return;
      axiosSecure.patch(`/updateUser/${adminData?._id}`, formData)
        .then(() => {
          updateUserProfile({ displayName: formData.name })
            .then(() => { toast.success('Profile updated!'); refetch(); setIsEditing(false); })
            .catch(() => toast.error('Failed to update display name.'));
        })
        .catch(() => toast.error('Failed to save changes.'));
    });
  };

  /* ── Password update ── */
  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword.trim()) { toast.warning('Enter your current password.'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (passwordData.newPassword.length < 8) { toast.warning('Password must be at least 8 characters.'); return; }

    const confirmed = await Swal.fire({
      title: 'Update Password?', text: 'This will change your admin password.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Update', customClass: { popup: 'rounded-2xl' }
    });
    if (!confirmed.isConfirmed) return;

    try {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(auth.currentUser.email, passwordData.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwordData.newPassword);
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.code === 'auth/wrong-password' ? 'Current password is incorrect.'
        : err.code === 'auth/weak-password' ? 'Password is too weak.'
        : err.message;
      toast.error(msg);
    }
  };

  const avatarGradients = [
    'from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500',
    'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
  ];
  const avatarGrad = avatarGradients[(formData.name || '').charCodeAt(0) % avatarGradients.length];

  const navTabs = [
    { key: 'profile',  label: 'Personal Info', icon: HiUser },
    { key: 'security', label: 'Security',       icon: Shield },
  ];

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 md:p-6">
      <ToastContainer
        position="top-right"
        toastClassName="!rounded-xl !text-sm"
        progressClassName="!rounded-full"
      />

      <div className="max-w-7xl mx-auto space-y-6">

        {/* ══ HEADER ══ */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/40 shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Admin{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                Profile
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Manage your personal information and security settings
            </p>
          </div>
        </div>

        {/* ══ STAT CARDS ══ */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statsCards.map(({ title, value, icon: Icon, bg, text, iconBg }) => (
              <div key={title} className={`${bg} border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs dark:text-white font-bold uppercase tracking-widest opacity-70 text-current">{title}</span>
                </div>
                <div className={`text-lg font-bold ${text}`}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* ══ MAIN LAYOUT ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Profile Card */}
            {isLoading ? <ProfileCardSkeleton /> : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-colors">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

                    {formData.photoURL ? (
                      <div className="relative w-24 h-24">
                        <img
                          src={formData.photoURL}
                          alt={formData.name}
                          className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-700 shadow-lg"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 hover:scale-110 transition-transform disabled:opacity-60"
                        >
                          {isUploadingPhoto
                            ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <Camera className="w-3.5 h-3.5 text-white" />}
                        </button>
                      </div>
                    ) : (
                      <div className="relative w-24 h-24">
                        <div className={`w-24 h-24 rounded-xl bg-linear-to-br ${avatarGrad} flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-gray-700`}>
                          {formData.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 hover:scale-110 transition-transform disabled:opacity-60"
                        >
                          <Camera className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center truncate w-full">{formData.name}</h2>
                  <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-100 dark:border-blue-800">
                    {formData.isSuperAdmin ? '★ Super Admin' : 'Administrator'}
                  </span>
                </div>

                {/* Email info block */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{formData.email}</span>
                </div>
              </div>
            )}

            {/* Nav tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm transition-colors">
              <nav className="space-y-1">
                {navTabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === key
                      ? 'bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">

              {/* ══ PERSONAL INFO TAB ══ */}
              {activeTab === 'profile' && (
                <div className="p-5 md:p-7">
                  {/* Tab header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 pb-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your profile details</p>
                      </div>
                    </div>

                    {isLoading ? (
                      <Shimmer className="h-10 w-28 rounded-xl" />
                    ) : !isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 dark:shadow-blue-900/40 hover:shadow-lg transition-all self-start sm:self-auto"
                      >
                        <Settings className="w-4 h-4" />Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2 self-start sm:self-auto">
                        <button
                          onClick={() => { setIsEditing(false); setFormData(adminData); }}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-all"
                        >
                          <X className="w-4 h-4" />Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 dark:shadow-emerald-900/40 transition-all"
                        >
                          <Save className="w-4 h-4" />Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Form fields */}
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {Array.from({ length: 6 }).map((_, i) => <FormFieldSkeleton key={i} />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <Field label="Full Name" icon={User}>
                        {isEditing ? (
                          <input type="text" name="name" value={formData.name}
                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                            placeholder="Enter full name" className={inputCls} />
                        ) : (
                          <ReadonlyField value={formData.name} />
                        )}
                      </Field>

                      {/* Email */}
                      <Field label="Email Address" icon={Mail}>
                        <ReadonlyField icon={Mail} value={formData.email} />
                      </Field>

                      {/* Phone */}
                      <Field label="Phone Number" icon={Phone}>
                        {isEditing ? (
                          <input type="tel" name="phoneNumber" value={formData.phoneNumber}
                            onChange={e => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                            placeholder="+1 555 123-4567" className={inputCls} />
                        ) : (
                          <ReadonlyField icon={Phone} value={formData.phoneNumber} placeholder="Not provided" />
                        )}
                      </Field>

                      {/* Role */}
                      <Field label="Role / Position" icon={UserCog}>
                        {isEditing ? (
                          <input type="text" name="role" value={formData.role}
                            onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                            placeholder="Enter role/position" className={inputCls} />
                        ) : (
                          <ReadonlyField value={formData.role || 'System Administrator'} />
                        )}
                      </Field>

                      {/* Address — spans 2 cols on md */}
                      <div className="md:col-span-2">
                        <Field label="Address" icon={MapPin}>
                          {isEditing ? (
                            <textarea name="address" value={formData.address}
                              onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                              placeholder="Enter your address" rows={3}
                              className={`${inputCls} resize-none`} />
                          ) : (
                            <ReadonlyField icon={MapPin} value={formData.address} placeholder="Not provided" />
                          )}
                        </Field>
                      </div>

                      {/* Department */}
                      <div className="md:col-span-2">
                        <Field label="Department">
                          {isEditing ? (
                            <input type="text" name="department" value={formData.department}
                              onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                              placeholder="Enter department" className={inputCls} />
                          ) : (
                            <ReadonlyField value={formData.department} placeholder="Not specified" />
                          )}
                        </Field>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ SECURITY TAB ══ */}
              {activeTab === 'security' && (
                <div className="p-5 md:p-7">
                  {/* Tab header */}
                  <div className="flex items-center gap-3 mb-7 pb-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-10 h-10 bg-linear-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security Settings</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage your password and account security</p>
                    </div>
                  </div>

                  <div className="max-w-lg space-y-5">
                    {/* Change Password card */}
                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                          <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Change Password</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your account password securely</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Current password */}
                        <Field label="Current Password" icon={Lock}>
                          <div className="relative">
                            <input
                              type={showCurrentPw ? 'text' : 'password'}
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                              placeholder="Enter current password"
                              className={`${inputCls} pr-12`}
                            />
                            <button type="button" onClick={() => setShowCurrentPw(p => !p)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </Field>

                        {/* New password */}
                        <Field label="New Password" icon={Lock}>
                          <div className="relative">
                            <input
                              type={showNewPw ? 'text' : 'password'}
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                              placeholder="Enter new password"
                              className={`${inputCls} pr-12`}
                            />
                            <button type="button" onClick={() => setShowNewPw(p => !p)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <PasswordStrength password={passwordData.newPassword} />
                        </Field>

                        {/* Confirm password */}
                        <Field label="Confirm New Password" icon={Lock}>
                          <div className="relative">
                            <input
                              type={showConfirmPw ? 'text' : 'password'}
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                              className={`${inputCls} pr-12 ${passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
                            />
                            <button type="button" onClick={() => setShowConfirmPw(p => !p)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                              {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                              Passwords do not match
                            </p>
                          )}
                        </Field>

                        <button
                          onClick={handleUpdatePassword}
                          disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 dark:shadow-blue-900/40 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" />
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Password requirements */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Password Requirements</h4>
                      </div>
                      <ul className="space-y-2">
                        {[
                          'Minimum 8 characters',
                          'At least one uppercase letter',
                          'At least one number',
                          'At least one special character',
                        ].map(req => (
                          <li key={req} className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            {req}
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
  );
};

export default AdminProfilePage;