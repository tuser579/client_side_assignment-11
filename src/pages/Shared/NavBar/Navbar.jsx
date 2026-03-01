import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import './Navbar.css'
import { HiClipboardList, HiHome, HiInformationCircle, HiLogin, HiLogout, HiPhone, HiViewGrid } from 'react-icons/hi';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { Crown } from 'lucide-react';
import { useTheme } from '../../../Components/ThemeToggle';

const Navbar = () => {

  const { theme, toggle } = useTheme();

  const { user, logOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const { data: singUser = {} } = useQuery({
    queryKey: ['singleUser', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/singleUser?email=${user.email}`);
      return res.data;
    }
  })

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    logOut()
      .then(() => { })
      .catch(error => {
        console.log(error);
      })
    navigate('/');
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  // for navbar NavLink
  const links = <>

    <NavLink to="/" className={({ isActive }) =>
      `flex items-center gap-1 font-medium transition-colors 
      ${isActive
        ? 'px-1 py-1 rounded bg-blue-500 text-white'
        : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
      }`
    }>
      <HiHome className="w-4.5 h-4.5" /> Home
    </NavLink>

    <NavLink to="/all-issue" className={({ isActive }) =>
      `flex items-center gap-1 font-medium transition-colors
      ${isActive
        ? 'px-1 py-1 rounded bg-blue-500 text-white'
        : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
      }`
    }>
      <HiClipboardList className='w-4.5 h-4.5' />All Issues
    </NavLink>

    <NavLink to="/aboutus" className={({ isActive }) =>
      `flex items-center gap-1 font-medium transition-colors
      ${isActive
        ? 'px-1 py-1 rounded bg-blue-500 text-white'
        : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
      }`
    }>
      <HiInformationCircle className="w-4.5 h-4.5" /> About Us
    </NavLink>

    <NavLink to="/contact" className={({ isActive }) =>
      `flex items-center gap-1 font-medium transition-colors
      ${isActive
        ? 'px-1 py-1 rounded bg-blue-500 text-white'
        : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
      }`
    }>
      <HiPhone className="w-4.5 h-4.5" /> Contact
    </NavLink>

    <NavLink
      to="/dashboard"
      className={({ isActive }) =>
        `flex items-center gap-1.5 font-medium transition-colors
    ${isActive
          ? 'px-3 py-1.5 rounded-lg bg-blue-500 text-white'
          : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
        }`
      }
    >
      <HiViewGrid className="w-4 h-4" /> Dashboard
    </NavLink>

  </>

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-1">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-9 sm:w-12 h-9 sm:h-12 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 sm:w-7 h-5 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CityFix
              </h1>
              <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">Public Issue Reporting</p>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-6 pb-2">
            <ul
              tabIndex="-1"
              className="w-full px-3 flex flex-row space-x-3 menu menu-sm dropdown-content bg-base-100 dark:bg-gray-800 z-1 mt-3 p-2 text-gray-700 dark:text-gray-300">
              {links}
            </ul>
          </div>

          <div className='flex items-center gap-2'>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden text-gray-700 dark:text-gray-300 focus:outline-none p-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <div className='flex items-center gap-4'>

              <button onClick={toggle}>
                {theme === "dark" ? "☀️" : "🌙"}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="relative">
                      <img
                        className="w-10 sm:w-13 h-10 sm:h-13 rounded-full border-2 hover:border-3 border-blue-500 dark:border-blue-400 transition-all"
                        alt="User Photo URL"
                        src={singUser?.photoURL}
                      />
                      {singUser?.isPremium && (
                        <Crown className="w-4.5 h-4.5 rounded-full p-0.5 bg-amber-400 text-white absolute -bottom-1 -right-1" />
                      )}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="px-5 py-4 bg-linear-to-br from-blue-500 to-cyan-500 relative">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{user?.displayName}</p>
                            <p className="text-xs text-white/75 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <NavLink
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">Dashboard</span>
                        </NavLink>

                        <div className="my-1.5 border-t border-gray-100 dark:border-gray-700/60"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors">
                            <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <>
                  <div className="hidden sm:flex space-x-3">
                    <NavLink
                      to="/login"
                      className="block w-full text-center px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={handleMobileMenuClose}
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="block w-full text-center px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={handleMobileMenuClose}
                    >
                      Register
                    </NavLink>
                  </div>

                  <div className="flex sm:hidden space-x-3">
                    <NavLink
                      to="/login"
                      className="flex items-center justify-center w-full px-3 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={handleMobileMenuClose}
                    >
                      <HiLogin className="text-2xl" />
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="flex items-center justify-center w-full px-3 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={handleMobileMenuClose}
                    >
                      <HiLogout className="text-2xl" />
                    </NavLink>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col space-y-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <ul
                  tabIndex="-1"
                  className="space-y-3 menu menu-sm dropdown-content bg-base-100 dark:bg-gray-800 z-1 mt-3 p-2 text-gray-700 dark:text-gray-300"
                >
                  {links}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;