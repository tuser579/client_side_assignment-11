import React, { useEffect, useState } from 'react';
import {
    HiLogout, HiOutlineChatAlt2, HiOutlineClipboardList, HiOutlineCog,
    HiOutlineCreditCard, HiOutlineDocumentText, HiOutlineExclamationCircle,
    HiOutlineHome, HiOutlinePlusCircle, HiOutlineUser, HiOutlineUserCircle,
    HiOutlineUserGroup, HiOutlineUsers, HiOutlineViewGrid, HiOutlineViewGridAdd,
    HiOutlineChartBar, HiOutlineMenuAlt2, HiOutlineX
} from 'react-icons/hi';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { Crown } from 'lucide-react';
import { useTheme } from '../Components/ThemeToggle';

const roleConfig = {
    citizen: { label: 'Citizen', color: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    admin: { label: 'Admin', color: 'from-violet-500 to-fuchsia-400', bg: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
    staff: { label: 'Staff', color: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
};

const NavItem = ({ to, icon, label, collapsed }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
            ${isActive
                ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
            }`
        }
        title={collapsed ? label : undefined}
    >
        <span className="shrink-0 w-5 h-5">{icon}</span>
        {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
);

const SectionLabel = ({ label, collapsed }) => (
    !collapsed && (
        <p className="px-3 mt-5 mb-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">
            {label}
        </p>
    )
);

const DashboardLayout = () => {

    const { theme, toggle } = useTheme();

    const navigate = useNavigate();
    const { user, logOut } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { data: allUser = [], isLoading } = useQuery({
        queryKey: ['allUser'],
        queryFn: async () => {
            const res = await axiosSecure.get(`/allUser`);
            return res.data;
        }
    });

    const singUser = allUser.find(all => all.email === user?.email);
    const role = singUser?.role;
    const rc = roleConfig[role] || roleConfig.citizen;

    useEffect(() => {
        if (role && window.location.pathname === '/dashboard') {
            if (role === 'citizen') navigate('/dashboard/citizenDashboard');
            else if (role === 'admin') navigate('/dashboard/adminDashboard');
            else if (role === 'staff') navigate('/dashboard/staffDashboard');
        }
    }, [role, navigate]);

    const handleLogout = () => logOut().then(() => navigate('/')).catch(console.log);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="w-14 h-14 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto" />
                <p className="text-gray-600 dark:text-gray-400 mt-4 font-medium">Loading Dashboard...</p>
            </div>
        </div>
    );

    const sidebarContent = (
        <div className={`flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700/60 transition-all duration-300 ${collapsed ? 'w-16' : 'w-55'}`}>

            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-gray-700/60 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-9 h-9 shrink-0 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 truncate">
                        CityFix
                    </span>
                )}
            </div>

            {/* User card */}
            {!collapsed && (
                <div className="mx-3 mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                            <img
                                src={singUser?.photoURL || 'https://via.placeholder.com/40'}
                                alt="avatar"
                                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow"
                            />
                            {singUser?.isPremium && (
                                <Crown className="w-3.5 h-3.5 absolute top-9 right-1 bg-amber-400 text-white rounded-full p-0.5 shadow" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{singUser?.name || 'User'}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rc.bg}`}>{rc.label}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">

                <SectionLabel label="General" collapsed={collapsed} />
                <NavItem to="/" icon={<HiOutlineHome className="w-5 h-5" />} label="Homepage" collapsed={collapsed} />

                {/* Citizen */}
                {role === 'citizen' && (<>
                    <SectionLabel label="My Space" collapsed={collapsed} />
                    <NavItem to="/dashboard/citizenDashboard" icon={<HiOutlineViewGrid className="w-5 h-5" />} label="Dashboard" collapsed={collapsed} />
                    <NavItem to="/dashboard/myIssues" icon={<HiOutlineDocumentText className="w-5 h-5" />} label="My Issues" collapsed={collapsed} />
                    <NavItem to="/dashboard/reportIssue" icon={<HiOutlinePlusCircle className="w-5 h-5" />} label="Report Issue" collapsed={collapsed} />
                    <NavItem to="/dashboard/my-payment-history" icon={<HiOutlineCreditCard className="w-5 h-5" />} label="Payment History" collapsed={collapsed} />
                    <NavItem to="/dashboard/profilePage" icon={<HiOutlineUser className="w-5 h-5" />} label="My Profile" collapsed={collapsed} />
                    <NavItem to="/dashboard/givenReview" icon={<HiOutlineChatAlt2 className="w-5 h-5" />} label="Send Review" collapsed={collapsed} />
                </>)}

                {/* Admin */}
                {role === 'admin' && (<>
                    <SectionLabel label="Management" collapsed={collapsed} />
                    <NavItem to="/dashboard/adminDashboard" icon={<HiOutlineViewGridAdd className="w-5 h-5" />} label="Admin Dashboard" collapsed={collapsed} />
                    <NavItem to="/dashboard/issuesManagement" icon={<HiOutlineExclamationCircle className="w-5 h-5" />} label="Issues Management" collapsed={collapsed} />
                    <NavItem to="/dashboard/manageUsers" icon={<HiOutlineUsers className="w-5 h-5" />} label="Manage Users" collapsed={collapsed} />
                    <NavItem to="/dashboard/staffManagement" icon={<HiOutlineUserGroup className="w-5 h-5" />} label="Staff Management" collapsed={collapsed} />
                    <NavItem to="/dashboard/paymentsPage" icon={<HiOutlineCreditCard className="w-5 h-5" />} label="Payments" collapsed={collapsed} />
                    <NavItem to="/dashboard/adminProfile" icon={<HiOutlineUserCircle className="w-5 h-5" />} label="Profile" collapsed={collapsed} />
                </>)}

                {/* Staff */}
                {role === 'staff' && (<>
                    <SectionLabel label="My Work" collapsed={collapsed} />
                    <NavItem to="/dashboard/staffDashboard" icon={<HiOutlineViewGrid className="w-5 h-5" />} label="Staff Dashboard" collapsed={collapsed} />
                    <NavItem to="/dashboard/assignedIssues" icon={<HiOutlineClipboardList className="w-5 h-5" />} label="Assigned Issues" collapsed={collapsed} />
                    <NavItem to="/dashboard/staffProfile" icon={<HiOutlineUser className="w-5 h-5" />} label="Profile" collapsed={collapsed} />
                </>)}
            </nav>

            {/* Logout */}
            <div className="px-2 pb-4 border-t border-gray-200 dark:border-gray-700/60 pt-3">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <HiLogout className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-800 overflow-hidden transition-colors duration-300">

            {/* ── Desktop Sidebar ─────────────────────────── */}
            <aside className="hidden lg:flex flex-col shrink-0 transition-all duration-300">
                {sidebarContent}
            </aside>

            {/* ── Mobile Sidebar Overlay ───────────────────── */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="relative z-10 flex flex-col w-60 shadow-2xl">
                        {sidebarContent}
                    </div>
                </div>
            )}

            {/* ── Main Content ─────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

                {/* Topbar */}
                <header className="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/60 px-4 sm:px-6 h-16 flex items-center justify-between gap-4 transition-colors duration-300">

                    <div className="flex items-center gap-3">
                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <HiOutlineMenuAlt2 className="w-5 h-5" />
                        </button>

                        {/* Desktop collapse toggle */}
                        <button
                            onClick={() => setCollapsed(c => !c)}
                            className="hidden lg:flex p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <HiOutlineMenuAlt2 className="w-5 h-5" />
                        </button>

                        {/* Breadcrumb title */}
                        <div className="hidden sm:block">
                            <h1 className="text-base font-bold text-gray-900 dark:text-white">
                                {role === 'admin' ? 'Admin' : role === 'staff' ? 'Staff' : 'Citizen'} Dashboard
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Welcome back, {singUser?.name?.split(' ')[0] || 'User'} 👋</p>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        <button onClick={toggle}>
                            {theme === "dark" ? "☀️" : "🌙"}
                        </button>

                        {/* Avatar dropdown */}
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="relative cursor-pointer">
                                <img
                                    src={singUser?.photoURL || 'https://via.placeholder.com/40'}
                                    alt="avatar"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors shadow"
                                />
                                {singUser?.isPremium && (
                                    <Crown className="w-3.5 h-3.5 absolute top-9 right-1 bg-amber-400 text-white rounded-full p-0.5 shadow" />
                                )}
                            </label>
                            <ul tabIndex={0} className="dropdown-content z-50 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-2 space-y-0.5">
                                <li className="px-3 py-2">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{singUser?.name || 'User'}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{singUser?.email || user?.email}</p>
                                </li>
                                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <HiLogout className="w-4 h-4" /> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;