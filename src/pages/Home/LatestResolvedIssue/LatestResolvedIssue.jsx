import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

const LatestResolvedIssue = () => {
  const [filter, setFilter] = useState('all');

  // Sample issues data
  const issues = [
    {
      id: 1,
      title: "Broken Street Light on Main Road",
      description: "Street light not working for 3 days near Central Park. Reported by multiple citizens.",
      category: "Electricity",
      status: "Resolved",
      location: "Downtown, Sector 5",
      date: "2024-01-15",
      resolvedDate: "2024-01-18",
      votes: 45,
      reportedBy: "John Smith",
      assignedTo: "Electricity Department",
      priority: "High",
      image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      updates: 3
    },
    {
      id: 2,
      title: "Large Pothole on Highway Exit",
      description: "Dangerous pothole causing traffic issues and vehicle damage.",
      category: "Road Maintenance",
      status: "In Progress",
      location: "North Highway, Exit 12",
      date: "2024-01-14",
      resolvedDate: null,
      votes: 89,
      reportedBy: "Sarah Johnson",
      assignedTo: "Road Department",
      priority: "Critical",
      image: "https://images.unsplash.com/photo-1542223616-740d5dff7f56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      updates: 5
    },
    {
      id: 3,
      title: "Water Pipe Leakage in Residential Area",
      description: "Water leakage from main pipe causing wastage and road damage.",
      category: "Water Supply",
      status: "Resolved",
      location: "Green Valley Society",
      date: "2024-01-13",
      resolvedDate: "2024-01-16",
      votes: 67,
      reportedBy: "Mike Wilson",
      assignedTo: "Water Department",
      priority: "High",
      image: "https://images.unsplash.com/photo-1621452773781-0f992fd1f5c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      updates: 4
    },
    {
      id: 4,
      title: "Garbage Overflow at Market Street",
      description: "Garbage bin overflowing for 2 days, causing health concerns.",
      category: "Sanitation",
      status: "Pending",
      location: "Market Street Corner",
      date: "2024-01-12",
      resolvedDate: null,
      votes: 32,
      reportedBy: "Emma Davis",
      assignedTo: "Sanitation Department",
      priority: "Medium",
      image: "https://images.unsplash.com/photo-1578558288136-7207e7747ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      updates: 1
    },
    {
      id: 5,
      title: "Damaged Footpath Tiles",
      description: "Broken tiles causing pedestrian accidents and accessibility issues.",
      category: "Infrastructure",
      status: "Resolved",
      location: "City Center Plaza",
      date: "2024-01-11",
      resolvedDate: "2024-01-14",
      votes: 56,
      reportedBy: "Robert Brown",
      assignedTo: "Municipal Corporation",
      priority: "Medium",
      image: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      updates: 2
    },
    {
      id: 6,
      title: "Traffic Signal Malfunction",
      description: "Signal blinking red causing confusion and traffic congestion.",
      category: "Traffic Control",
      status: "Resolved",
      location: "Main Intersection Point",
      date: "2024-01-10",
      resolvedDate: "2024-01-12",
      votes: 78,
      reportedBy: "Lisa Anderson",
      assignedTo: "Traffic Department",
      priority: "High",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      updates: 3
    },
    {
      id: 7,
      title: "Blocked Drainage System",
      description: "Drainage blocked causing water logging during rains.",
      category: "Drainage",
      status: "In Progress",
      location: "Residential Block B",
      date: "2024-01-09",
      resolvedDate: null,
      votes: 42,
      reportedBy: "David Miller",
      assignedTo: "Drainage Department",
      priority: "High",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      updates: 4
    },
    {
      id: 8,
      title: "Broken Park Bench",
      description: "Public park bench damaged and unusable for senior citizens.",
      category: "Public Amenities",
      status: "Resolved",
      location: "Central Park Area",
      date: "2024-01-08",
      resolvedDate: "2024-01-11",
      votes: 29,
      reportedBy: "Sophia Williams",
      assignedTo: "Parks Department",
      priority: "Low",
      image: "https://images.unsplash.com/photo-1517799094725-e3453440724e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      updates: 2
    }
  ];

  // Filter issues based on status
  const filteredIssues = filter === 'all' 
    ? issues.sort((a, b) => {
        // Sort by status: Resolved first, then In Progress, then Pending
        const statusOrder = { 'Resolved': 1, 'In Progress': 2, 'Pending': 3 };
        return statusOrder[a.status] - statusOrder[b.status] || new Date(b.date) - new Date(a.date);
      })
    : issues.filter(issue => issue.status === filter);

  const displayedIssues = filteredIssues.slice(0, 6);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return { bg: 'bg-linear-to-r from-green-500 to-emerald-600', text: 'text-green-100', icon: '✅' };
      case 'In Progress':
        return { bg: 'bg-linear-to-r from-yellow-500 to-amber-600', text: 'text-yellow-100', icon: '🔄' };
      case 'Pending':
        return { bg: 'bg-linear-to-r from-orange-500 to-red-600', text: 'text-orange-100', icon: '⏳' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-100', icon: '📋' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-linear-to-r from-red-500 to-pink-600';
      case 'High':
        return 'bg-linear-to-r from-orange-500 to-red-500';
      case 'Medium':
        return 'bg-linear-to-r from-yellow-500 to-orange-500';
      case 'Low':
        return 'bg-linear-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Electricity': '💡',
      'Road Maintenance': '🛣️',
      'Water Supply': '💧',
      'Sanitation': '🗑️',
      'Infrastructure': '🏗️',
      'Traffic Control': '🚦',
      'Drainage': '🌊',
      'Public Amenities': '🏛️'
    };
    return icons[category] || '📋';
  };

  return (
    <section className="py-16 bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-green-500 to-emerald-600 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-600">Resolved Issues</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Track the progress of reported issues and see how our community is making a difference
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${filter === 'all' 
              ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
              : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600'
            }`}
          >
            All Issues
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${filter === 'Resolved' 
              ? 'bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
              : 'bg-white border border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'
            }`}
          >
            ✅ Resolved
          </button>
          <button
            onClick={() => setFilter('In Progress')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${filter === 'In Progress' 
              ? 'bg-linear-to-r from-yellow-500 to-amber-600 text-white shadow-lg' 
              : 'bg-white border border-gray-300 text-gray-700 hover:border-yellow-500 hover:text-yellow-600'
            }`}
          >
            🔄 In Progress
          </button>
          <button
            onClick={() => setFilter('Pending')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${filter === 'Pending' 
              ? 'bg-linear-to-r from-orange-500 to-red-600 text-white shadow-lg' 
              : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600'
            }`}
          >
            ⏳ Pending
          </button>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedIssues.map((issue, index) => {
            const statusColors = getStatusColor(issue.status);
            
            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                {/* Issue Image with Overlay */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={issue.image}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 ${statusColors.bg} text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center shadow-lg`}>
                    <span className="mr-2">{statusColors.icon}</span>
                    {issue.status}
                  </div>

                  {/* Priority Badge */}
                  <div className={`absolute top-4 left-4 ${getPriorityColor(issue.priority)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                    {issue.priority}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center">
                    <span className="text-lg mr-2">{getCategoryIcon(issue.category)}</span>
                    <span className="text-sm font-medium text-gray-800">{issue.category}</span>
                  </div>
                </div>

                {/* Issue Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 
                      className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
                      data-tooltip-id={`title-${issue.id}`}
                      data-tooltip-content={issue.title}
                    >
                      {issue.title}
                    </h3>
                    <Tooltip id={`title-${issue.id}`} />
                    
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(issue.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2 h-12">
                    {issue.description}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">{issue.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">By {issue.reportedBy}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">{issue.votes} votes</span>
                      </div>
                    </div>

                    {issue.status === 'Resolved' && issue.resolvedDate && (
                      <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">
                          Resolved on {new Date(issue.resolvedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>{issue.updates} updates</span>
                    </div>
                    
                    <Link
                      to={`/issue/${issue.id}`}
                      className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 group/btn shadow-md hover:shadow-lg"
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
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/all-issues"
            className="inline-flex items-center px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl font-bold"
          >
            View All Reported Issues
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestResolvedIssue;