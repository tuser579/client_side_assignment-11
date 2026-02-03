import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, } from "chart.js";
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CitizenDashboard = () => {

  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const {
    data = {},
  } = useQuery({
    queryKey: ['userData', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      // Execute both requests in parallel
      const [issuesRes, userRes] = await Promise.all([
        axiosSecure.get(`/myIssues?email=${user?.email}`),
        axiosSecure.get(`/singleUser?email=${user?.email}`)
      ]);

      return {
        issues: issuesRes.data,
        users: userRes.data
      };
    }
  });

  const { issues = [], users: singUser = {} } = data;

  const chartData = {
    // labels: ["Total Issues", "Pending Issues", "In Progress Issues", "Resolved Issues", "Total Payments",],
    labels: ["Total Issues", "Pending Issues", "In Progress Issues", "Resolved Issues",],
    datasets: [
      {
        label: "Dashboard Stats",

        data: [
          // dashboardStats.totalIssues,
          (issues.length),
          // dashboardStats.pendingIssues,
          (issues.filter(issue => issue.status === "Pending"))?.length,
          // dashboardStats.inProgressIssues,
          (issues.filter(issue => issue.status === "In-progress"))?.length,
          // dashboardStats.resolvedIssues, 
          issues.filter(i => i.status === 'Resolved').length,
          // dashboardStats.totalPayments,
          // (singUser?.totalPayment),
        ],

        backgroundColor: [
          "#FF6384", // pink 
          "#36A2EB", // blue 
          "#FFCE56", // yellow 
          "#4BC0C0", // teal 
          "#9966FF", // purple 
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            let value = context.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`w-8 h-8 ${color.replace('text-', 'text-')}`} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8" >

      {/* Blocked singleUser Warning */}
      {singUser.isBlocked && (
        <div className="mb-6">
          <div className="alert alert-error shadow-lg">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Account Blocked</h3>
              <div className="text-xs">
                Your account has been temporarily blocked by the administration.
                Please contact the authorities at{' '}
                <a href="tel:+8809609333222" className="font-semibold underline">
                  +880 9609 333222
                </a>{' '}
                or email{' '}
                <a href="mailto:support@infra.gov" className="font-semibold underline">
                  support@infra.gov
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      < div className="mb-8" >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className='mx-auto'>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              Account Information
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Track and manage your infrastructure reports
            </p>
          </div>

        </div>
      </div >

      {/* Stats Grid */}
      < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" >
        <StatCard
          title="Total Issues"
          value={issues.length}
          icon={BarChart3}
          color="text-blue-500"
        />
        <StatCard
          title="Pending Issues"
          value={(issues.filter(issue => issue.status === "Pending"))?.length}
          icon={Clock}
          color="text-yellow-500"
        />
        <StatCard
          title="In Progress"
          value={(issues.filter(issue => issue.status === "In-progress"))?.length}
          icon={AlertTriangle}
          color="text-orange-500"
        />
        <StatCard
          title="Resolved Issues"
          value={(issues.filter(issue => issue.status === "Resolved"))?.length}
          icon={CheckCircle}
          color="text-green-500"
        />
      </div >

      {/* Charts and Additional Stats */}
      < div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8" >

        {/* Payment Card */}
        < div className="lg:col-span-1 card bg-linear-to-r from-purple-500 to-indigo-600 text-white shadow-xl" >
          <div className="card-body flex flex-col justify-center p-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">Total Payments</span>
              <span className="text-2xl font-bold">৳{singUser.totalPayment}</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg">Premium Subscription</span>
                <span className="text-lg font-semibold">1000 ৳</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg">Priority Reports</span>
                <span className="text-lg font-semibold">100 ৳</span>
              </div>
            </div>
            <NavLink to='my-payment-history' className="btn btn-outline btn-sm p-6 text-white text-[1.1rem] border-white hover:bg-white hover:text-purple-600 mt-6">
              View Payment History
            </NavLink>
          </div>
        </div >

        {/* Chart */}
        < div className="lg:col-span-2 card bg-base-100 shadow-xl" >
          <div className="card-body">
            <h2 className="card-title text-gray-800 dark:text-white">Monthly Report Analysis</h2>

            {/* Simple bar chart visualization */}
            <div className="h-90">
              <Bar data={chartData} options={chartOptions} />
            </div>

          </div>
        </div >

      </div >

    </div >
  );
};

export default CitizenDashboard;