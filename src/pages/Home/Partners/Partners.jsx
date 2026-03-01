import React from 'react';
import { motion } from 'framer-motion';

const partners = [
  {
    id: 1,
    name: "City Municipality",
    role: "Government Partner",
    description: "Official municipal integration for streamlined issue routing and department coordination.",
    avatar: "CM",
    accent: "from-blue-500 to-purple-500",
    category: "Government"
  },
  {
    id: 2,
    name: "Urban Works Co.",
    role: "Infrastructure Partner",
    description: "Leading infrastructure maintenance company handling road, drainage, and utility repairs.",
    avatar: "UW",
    accent: "from-emerald-500 to-teal-400",
    category: "Infrastructure"
  },
  {
    id: 3,
    name: "SafeCity Foundation",
    role: "NGO Partner",
    description: "Non-profit organization dedicated to improving public safety and urban living standards.",
    avatar: "SC",
    accent: "from-orange-500 to-amber-400",
    category: "NGO"
  },
  {
    id: 4,
    name: "TechBridge Labs",
    role: "Technology Partner",
    description: "Powering our real-time mapping, analytics engine, and AI-assisted issue categorization.",
    avatar: "TB",
    accent: "from-sky-500 to-cyan-400",
    category: "Technology"
  },
  {
    id: 5,
    name: "GreenCity Alliance",
    role: "Environmental Partner",
    description: "Collaborating on parks, drainage, and environmental infrastructure issue resolution.",
    avatar: "GC",
    accent: "from-green-500 to-emerald-400",
    category: "Environment"
  },
  {
    id: 6,
    name: "Civic Media Network",
    role: "Media Partner",
    description: "Amplifying unresolved civic issues through local journalism and community broadcasting.",
    avatar: "CN",
    accent: "from-violet-500 to-fuchsia-400",
    category: "Media"
  },
  {
    id: 7,
    name: "PublicWorks Dept.",
    role: "Operations Partner",
    description: "Government operations team managing field crews, equipment dispatch, and on-site repairs.",
    avatar: "PW",
    accent: "from-pink-500 to-rose-400",
    category: "Government"
  },
  {
    id: 8,
    name: "SmartCity Initiative",
    role: "Innovation Partner",
    description: "Driving smart city research, IoT sensor integration, and future urban planning strategies.",
    avatar: "SI",
    accent: "from-indigo-500 to-blue-400",
    category: "Innovation"
  },
];

const categoryColors = {
  "Government":    "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  "Infrastructure":"bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  "NGO":           "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  "Technology":    "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
  "Environment":   "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  "Media":         "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
  "Innovation":    "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
};

const Partners = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-8">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Our Trusted <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Partners</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Working alongside governments, NGOs, and innovators to build cities that listen, respond, and improve.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Avatar + Category */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-linear-to-r ${partner.accent} rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                  {partner.avatar}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${categoryColors[partner.category]}`}>
                  {partner.category}
                </span>
              </div>

              {/* Name & Role */}
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                {partner.name}
              </h3>
              <p className={`text-sm font-semibold text-transparent bg-clip-text bg-linear-to-r ${partner.accent} mb-3`}>
                {partner.role}
              </p>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {partner.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;