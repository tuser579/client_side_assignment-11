import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import { HiOutlineLightningBolt, HiOutlinePhotograph } from 'react-icons/hi';

const LatestResolvedIssue = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetch('https://cityfix-server.vercel.app/sixResolvedIssue')
      .then(res => res.json())
      .then(data => {
        setIssues(data);
      })
  }, [issues]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return { bg: 'bg-linear-to-r from-green-500 to-emerald-600', text: 'text-green-100', icon: '✅' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-100', icon: '📋' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-linear-to-r from-orange-500 to-red-500';
      case 'Normal':
        return 'bg-linear-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Streetlight': '💡',
      'Road_Damage': '🛣️',
      'Garbage': '🗑️',
      'Footpath': '🚶',
      'Drainage': '🌊',
      'Traffic': '🚦',
      'Parks': '🌳',
      'Public_Toilet': '🚻',
      'Noise': '🔇',
      'Electricity': '💡',
      'Water_Supply': '💧',
      'Sanitation': '🗑️',
      'Infrastructure': '🏗️',
      'Other': '❓'
    };
    return icons[category] || '📋';
  };

  return (
    <section className="py-15 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Latest <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Resolved Issues</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto">
            Track the progress of reported issues and see how our community is making a difference
          </p>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {issues.length > 0 ? (
            issues.map((issue, index) => {
              const statusColors = getStatusColor(issue.status);

              return (
                <motion.div
                  key={issue._id || issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative hover:-translate-y-2 duration-300 shadow-2xl rounded-lg border dark:border-gray-700 border-gray-200 bg-white dark:bg-gray-800 ${issue.isBoosted ? 'ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>

                  {/* Boosted Badge */}
                  {issue.isBoosted && (
                    <div className="absolute -top-3.5 left-4 z-10">
                      <div className="bg-linear-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1 shadow-lg">
                        <HiOutlineLightningBolt className="w-3 h-3" />
                        Boosted
                      </div>
                    </div>
                  )}

                  {/* Issue Image with Overlay */}
                  <div className="relative h-45 overflow-hidden rounded-lg">
                    <img
                      src={issue.images[0]}
                      alt={issue.title}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent"></div>

                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 ${statusColors.bg} text-white px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center shadow-lg`}>
                      <span className="mr-2">{statusColors.icon}</span>
                      {issue.status}
                    </div>

                    {/* Priority Badge */}
                    <div className={`absolute top-4 left-4 ${getPriorityColor(issue.priority)} text-white px-3 py-1 rounded-xl text-xs font-bold shadow-lg`}>
                      {issue.priority}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-xl flex items-center">
                      <span className="text-sm mr-2">{getCategoryIcon(issue.category)}</span>
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{issue.category}</span>
                    </div>

                    {issue.images && issue.images.length > 0 && (
                      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-medium flex items-center space-x-1">
                        <HiOutlinePhotograph className="w-3 h-3" />
                        <span>{issue.images.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Issue Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3
                        className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
                        data-tooltip-id={`title-${issue._id || issue.id}`}
                        data-tooltip-content={issue.title}
                      >
                        {issue.title.length > 25 ? issue.title.slice(0, 16) + ' ...' : issue.title}
                      </h3>

                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2 h-12">
                      {issue.description.length > 25 ? issue.description.slice(0, 65) + ' ...' : issue.description}
                    </p>

                    {/* Meta Information */}
                    <div className="space-y-2 pt-3">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{issue.location}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm">By {issue.reportedByName || 'Anonymous'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 dark:border-gray-700">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{issue.upVotes || 0} votes</span>
                      </div>

                      <Link
                        to={`/issueDetailsPage/${issue._id}`}
                        className="inline-flex items-center px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 group/btn shadow-md hover:shadow-lg"
                      >
                        View Details
                        <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            /* No Resolved Issues Section */
            <div className="col-span-full">
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-blue-200 dark:border-gray-600 rounded-xl p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                  No Resolved Issues Yet
                </h3>

                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                  There are currently no resolved issues to display. When issues are resolved by the community or authorities, they will appear here.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/all-issue"
                    className="inline-flex items-center px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    View All Issues
                  </Link>

                  <Link
                    to="/dashboard/reportIssue"
                    className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-700 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Report New Issue
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestResolvedIssue;