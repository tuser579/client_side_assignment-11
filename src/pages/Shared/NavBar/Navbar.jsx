import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import './Navbar.css'
import { HiClipboardList, HiHome, HiInformationCircle, HiLogin, HiLogout, HiPhone } from 'react-icons/hi';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { Crown } from 'lucide-react';

const Navbar = () => {

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

    <NavLink to="/" className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition-colors">
      <HiHome className="w-4.5 h-4.5" /> Home
    </NavLink>

    <NavLink to="/all-issue" className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition-colors">
      <HiClipboardList className='w-4.5 h-4.5' />All Issues
    </NavLink>

    <NavLink to="/aboutus" className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition-colors" >
      <HiInformationCircle className="w-4.5 h-4.5" /> About Us
    </NavLink>

    <NavLink to="/contact" className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition-colors" >
      <HiPhone className="w-4.5 h-4.5" /> Contact
    </NavLink>

  </>

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CityFix
              </h1>
              <p className="text-xs text-gray-500">Public Issue Reporting</p>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-8">
            <ul
              tabIndex="-1"
              className="flex flex-row space-x-5 menu menu-sm dropdown-content bg-base-100  z-1 mt-3 p-2  text-black">
              {links}
            </ul>
          </div>

          <div className='flex items-center gap-2'>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden text-gray-700 focus:outline-none p-2"
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

            <div className='flex'>
              {user ? (
                <div className="relative">

                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="relative">
                      <img
                        className="w-10 sm:w-13 h-10 sm:h-13 rounded-full border hover:border-2 border-blue-500"
                        alt="User Photo URL"
                        src={user?.photoURL}
                      />
                      {singUser?.isPremium && (
                        <Crown className="w-4.5 h-4.5 rounded-full p-0.5 bg-amber-400 text-white absolute bottom-0 right-0" />
                      )}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{user?.displayName}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <NavLink
                        to="/dashboard"
                        className="block px-4 py-3 text-blue-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Dashboard
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        Logout
                      </button>
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
                    <NavLink to="/login" className="flex items-center justify-center w-full px-3 py-2.5  bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={handleMobileMenuClose} >
                      <HiLogin className="text-2xl" />
                    </NavLink>
                    <NavLink to="/logout"
                      className="flex items-center justify-center w-full px-3 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={handleMobileMenuClose} >
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
              <div className="pt-4 pb-6 flex flex-col space-y-4 border-t border-gray-200 mt-4">
                <ul
                  tabIndex="-1"
                  className="space-y-3 menu menu-sm dropdown-content bg-base-100  z-1 mt-3 p-2 text-black">
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