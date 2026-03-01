import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      icon: "🚀",
      title: "Real-time Tracking",
      description: "Track your reported issues in real-time with live status updates"
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Report issues on-the-go with our mobile-optimized platform"
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "Your data and privacy are protected with enterprise security"
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Get insights with detailed analytics and reporting features"
    },
    {
      icon: "👥",
      title: "Community Voting",
      description: "Vote on important issues to prioritize municipal actions"
    },
    {
      icon: "🏆",
      title: "Gamification",
      description: "Earn badges and recognition for active community participation"
    },
    {
      icon: "📸",
      title: "Photo Evidence",
      description: "Upload photos to provide visual evidence for reported issues"
    },
    {
      icon: "⏰",
      title: "24/7 Support",
      description: "Get round-the-clock support for any questions or concerns"
    }
  ];

  return (
    <section className="bg-gray-50 dark:bg-gray-800 pb-5 pt-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Why Choose <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">CityFix</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Powerful features designed to make public issue reporting simple and effective
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="mx-auto w-16 h-16 bg-linear-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                {feature.icon}
              </div>
              <h3 className="flex justify-center text-xl font-bold text-gray-800 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;