import React, { useEffect } from 'react';
import {
    HiLogout, HiOutlineChatAlt2, HiOutlineClipboardList, HiOutlineCog,
    HiOutlineCreditCard, HiOutlineDocumentText, HiOutlineExclamationCircle,
    HiOutlineHome, HiOutlinePlusCircle, HiOutlineUser, HiOutlineUserCircle,
    HiOutlineUserGroup, HiOutlineUsers, HiOutlineViewGrid, HiOutlineViewGridAdd,
    HiOutlineChartBar, HiOutlineCalendar, HiOutlineStar
} from 'react-icons/hi';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { Crown } from 'lucide-react';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const { user, logOut } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: allUser = [], isLoading } = useQuery({
        queryKey: ['allUser'],
        queryFn: async () => {
            const res = await axiosSecure.get(`/allUser`);
            return res.data;
        }
    });

    const singUser = allUser.find(all => all.email === user?.email);

    // Auto-redirect to appropriate dashboard if on index route
    useEffect(() => {
        if (singUser?.role && window.location.pathname === '/dashboard') {
            if (singUser.role === 'citizen') {
                navigate('/dashboard/citizenDashboard');
            } else if (singUser.role === 'admin') {
                navigate('/dashboard/adminDashboard');
            } else if (singUser.role === 'staff') {
                navigate('/dashboard/staffDashboard');
            }
        }
    }, [singUser, navigate]);

    const handleLogout = () => {
        logOut()
            .then(() => {
                navigate('/');
            })
            .catch(error => {
                console.log(error);
            });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div>
                    <h2 className="text-zinc-900 dark:text-white mt-4">Loading Dashboard...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="drawer lg:drawer-open max-w-8xl">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                {/* Navbar */}
                <nav className="navbar w-full bg-base-300 flex justify-between">
                    <div className='flex items-center'>
                        <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                            {/* Sidebar toggle icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4">
                                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                                <path d="M9 4v16"></path>
                                <path d="M14 10l2 2l-2 2"></path>
                            </svg>
                        </label>
                        <div className="mx-2 w-9 h-9 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            CityFix Dashboard
                        </h1>
                    </div>
                    {/* User Profile Dropdown */}
                    <div className="dropdown dropdown-end">
                        <label
                            tabIndex={0}
                            className="btn btn-ghost btn-circle avatar sm:w-13 sm:mr-4 relative"
                        >
                            <img
                                className="w-10 sm:w-13 h-10 sm:h-13 rounded-full border hover:border-2 border-blue-500"
                                alt="User Photo URL"
                                src={singUser?.photoURL || 'https://via.placeholder.com/40'}
                            />
                            {singUser?.isPremium && (
                                <Crown
                                    className="w-4.5 h-4.5 rounded-full p-0.5 bg-amber-400 text-white 
                 absolute -bottom-1 -right-1 shadow-md"
                                />
                            )}
                        </label>

                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 shadow-2xl rounded-box mt-3 w-52 p-2">
                            <li>
                                <a className="justify-between">
                                    <span className="font-semibold">{singUser?.name || 'User'}</span>
                                    <span className="badge text-white bg-blue-500 capitalize">{singUser?.role}</span>
                                </a>
                            </li>
                            <li>
                                <a className="justify-between">
                                    <span className="font-semibold">{singUser?.email || user?.email}</span>
                                </a>
                            </li>
                            <div className="divider my-1"></div>
                            <li><Link onClick={handleLogout} className="text-error"><HiLogout className="w-5 h-5" /> Logout</Link></li>
                        </ul>
                    </div>
                </nav>
                {/* Page content here */}
                <div className="p-4">
                    <Outlet />
                </div>
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-50">
                    {/* Sidebar content here */}
                    <ul className="menu w-full grow">
                        {/* Homepage Link */}
                        <li>
                            <Link to="/" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">
                                <HiOutlineHome className='w-5 h-5' />
                                <span className="is-drawer-close:hidden">Homepage</span>
                            </Link>
                        </li>

                        {/* Citizen Dashboard Links */}
                        {singUser?.role === 'citizen' && (
                            <>
                                <li>
                                    <NavLink
                                        to="/dashboard/citizenDashboard"
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Citizen Dashboard"
                                    >
                                        <HiOutlineViewGrid className='w-5 h-5' />
                                        <span className="is-drawer-close:hidden">Dashboard</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="My Issues"
                                        to="/dashboard/myIssues"
                                    >
                                        <HiOutlineDocumentText className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">My Issues</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Report Issue"
                                        to="/dashboard/reportIssue"
                                    >
                                        <HiOutlinePlusCircle className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Report Issue</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Payment History"
                                        to="/dashboard/my-payment-history"
                                    >
                                        <HiOutlineCreditCard className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Payment History</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="My Profile"
                                        to="/dashboard/profilePage"
                                    >
                                        <HiOutlineUser className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">My Profile</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Send Review"
                                        to="/dashboard/givenReview"
                                    >
                                        <HiOutlineChatAlt2 className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Send Review</span>
                                    </NavLink>
                                </li>
                            </>
                        )}

                        {/* Admin Dashboard Links */}
                        {singUser?.role === "admin" && (
                            <>
                                <li>
                                    <NavLink
                                        to="/dashboard/adminDashboard"
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Admin Dashboard"
                                    >
                                        <HiOutlineViewGridAdd className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Admin Dashboard</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Issues Management"
                                        to="/dashboard/issuesManagement"
                                    >
                                        <HiOutlineExclamationCircle className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Issues Management</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Manage Users"
                                        to="/dashboard/manageUsers"
                                    >
                                        <HiOutlineUsers className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Manage Users</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Staff Management"
                                        to="/dashboard/staffManagement"
                                    >
                                        <HiOutlineUserGroup className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Staff Management</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Payment Page"
                                        to="/dashboard/paymentsPage"
                                    >
                                        <HiOutlineCreditCard className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Payments</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Admin Profile"
                                        to="/dashboard/adminProfile"
                                    >
                                        <HiOutlineUserCircle className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Profile</span>
                                    </NavLink>
                                </li>
                            </>
                        )}

                        {/* Staff Dashboard Links */}
                        {singUser?.role === 'staff' && (
                            <>
                                <li>
                                    <NavLink
                                        to="/dashboard/staffDashboard"
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Staff Dashboard"
                                    >
                                        <HiOutlineViewGrid className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Staff Dashboard</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Assigned Issues"
                                        to="/dashboard/assignedIssues"
                                    >
                                        <HiOutlineClipboardList className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Assigned Issues</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active bg-base-300' : ''}`
                                        }
                                        data-tip="Staff Profile"
                                        to="/dashboard/staffProfile"
                                    >
                                        <HiOutlineUser className="w-5 h-5" />
                                        <span className="is-drawer-close:hidden">Profile</span>
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;