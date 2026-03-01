import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

const HowItWorks = () => {
    const steps = [
        {
            step: 1,
            title: "Report Issue",
            description: "Take a photo, add details, and submit your issue in less than 2 minutes",
            icon: "📱",
            gradient: "from-blue-500 to-cyan-500",
            details: [
                "Upload photos",
                "Select location",
                "Add description & category",
                "Set priority level"
            ],
            animation: "ReportAnimation"
        },
        {
            step: 2,
            title: "Verification",
            description: "Our team verifies and categorizes the issue for appropriate department",
            icon: "✅",
            gradient: "from-green-500 to-emerald-500",
            details: [
                "Automatic validation",
                "Community voting",
                "Department assignment",
                "Priority assessment"
            ],
            animation: "VerifyAnimation"
        },
        {
            step: 3,
            title: "Assignment",
            description: "Issue gets assigned to the relevant department for immediate action",
            icon: "👥",
            gradient: "from-purple-500 to-pink-500",
            details: [
                "Department routing",
                "Resource allocation",
                "Timeline estimation",
                "Cost assessment"
            ],
            animation: "AssignAnimation"
        },
        {
            step: 4,
            title: "Resolution",
            description: "Track progress in real-time and get notified when issue is resolved matter",
            icon: "🎯",
            gradient: "from-orange-500 to-red-500",
            details: [
                "Live status updates",
                "Progress tracking",
                "Photo evidence",
                "Completion verification"
            ],
            animation: "ResolveAnimation"
        }
    ];

    const stats = [
        { value: "2 min", label: "Avg. Report Time", icon: "⏱️" },
        { value: "24h", label: "Response Time", icon: "⚡" },
        { value: "95%", label: "Verification Rate", icon: "✅" },
        { value: "85%", label: "Resolution Rate", icon: "🎯" }
    ];

    return (
        <section className="pt-10 pb-10 bg-linear-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-linear-to-r from-blue-100/30 to-cyan-100/30 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-linear-to-r from-purple-100/30 to-pink-100/30 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-linear-to-r from-transparent via-blue-200/20 dark:via-blue-700/20 to-transparent"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        How <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">CityFix</span> Works
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto"
                    >
                        Simple steps to report and get public infrastructure issues resolved efficiently.
                        Join thousands of citizens making their cities better.
                    </motion.p>
                </div>

                {/* Steps Timeline */}
                <div className="relative">
                    {/* Connecting Line for Desktop */}
                    <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-linear-to-r from-blue-400 via-purple-400 to-orange-400 transform -translate-y-1/2"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-5">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.step}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative mb-6"
                            >
                                {/* Step Number with Connector */}
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 lg:top-0 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
                                    <div className={`w-12 h-12 bg-linear-to-r ${step.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg relative z-10`}>
                                        {step.step}
                                    </div>
                                </div>

                                {/* Step Card */}
                                <div className="mt-8 lg:mt-12">
                                    <div className={`bg-linear-to-br ${step.gradient} p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300`}>
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-full">
                                            {/* Icon */}
                                            <div className="flex items-center mb-4">
                                                <div className={`w-16 h-16 bg-linear-to-r ${step.gradient} rounded-xl flex items-center justify-center text-3xl mr-4 shadow-lg`}>
                                                    {step.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                                                    <div className="flex items-center mt-1">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">Step {step.step}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                                {step.description}
                                            </p>

                                            {/* Details List with Tooltips */}
                                            <div className="space-y-2 mb-6">
                                                {step.details.map((detail, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center group cursor-help"
                                                        data-tooltip-id={`tooltip-${step.step}-${idx}`}
                                                        data-tooltip-content={`Learn more about ${detail.toLowerCase()}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full bg-linear-to-r ${step.gradient} mr-3`}></div>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                            {detail}
                                                        </span>
                                                        <Tooltip id={`tooltip-${step.step}-${idx}`} />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Animated Progress Indicator */}
                                            <div className="relative pt-4">
                                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${(step.step / steps.length) * 100}%` }}
                                                        transition={{ duration: 1, delay: 0.3 }}
                                                        viewport={{ once: true }}
                                                        className={`h-full bg-linear-to-r ${step.gradient} rounded-full`}
                                                    ></motion.div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                    <span>Start</span>
                                                    <span>Step {step.step}</span>
                                                    <span>Complete</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mt-10"
                >
                    <div className="bg-linear-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                        <h3 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
                            Why Citizens Trust <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">CityFix</span>
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="text-center group"
                                >
                                    <div className="w-20 h-20 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        {stat.icon}
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                                    <div className="text-gray-600 dark:text-gray-300 text-sm">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default HowItWorks;