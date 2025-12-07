import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

const HowItWorks = () => {
    const steps = [
        {
            step: 1,
            title: "Report Issue",
            description: "Take a photo, add details, and submit your infrastructure issue in less than 2 minutes",
            icon: "📱",
            gradient: "from-blue-500 to-cyan-500",
            details: [
                "Upload photos/videos",
                "Pin location on map",
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
            description: "Issue gets assigned to the relevant municipal department for immediate action",
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
        <section className="pt-20 pb-10 bg-linear-to-b from-white to-gray-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-linear-to-r from-blue-100/30 to-cyan-100/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-linear-to-r from-purple-100/30 to-pink-100/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-linear-to-r from-transparent via-blue-200/20 to-transparent"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl"
                    >
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        How <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">CityFix</span> Works
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-gray-600 text-lg max-w-3xl mx-auto"
                    >
                        Simple steps to report and get public infrastructure issues resolved efficiently.
                        Join thousands of citizens making their cities better.
                    </motion.p>
                </div>

                {/* Steps Timeline */}
                <div className="relative">
                    {/* Connecting Line for Desktop */}
                    <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-linear-to-r from-blue-400 via-purple-400 to-orange-400 transform -translate-y-1/2"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.step}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                {/* Step Number with Connector */}
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 lg:top-0 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
                                    <div className={`w-12 h-12 bg-linear-to-r ${step.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg relative z-10`}>
                                        {step.step}
                                    </div>

                                    {/* Connector Line for Mobile */}
                                    {index < steps.length - 1 && (
                                        <div className="lg:hidden absolute top-1/2 left-full w-full h-0.5 bg-linear-to-r from-blue-400 to-purple-400 transform translate-x-4"></div>
                                    )}
                                </div>

                                {/* Step Card */}
                                <div className="mt-8 lg:mt-12">
                                    <div className={`bg-linear-to-br ${step.gradient} p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300`}>
                                        <div className="bg-white rounded-xl p-6 h-full">
                                            {/* Icon */}
                                            <div className="flex items-center mb-4">
                                                <div className={`w-16 h-16 bg-linear-to-r ${step.gradient} rounded-xl flex items-center justify-center text-3xl mr-4 shadow-lg`}>
                                                    {step.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                                                    <div className="flex items-center mt-1">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                        <span className="text-sm text-gray-500">Step {step.step}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-600 mb-6">
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
                                                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                                            {detail}
                                                        </span>
                                                        <Tooltip id={`tooltip-${step.step}-${idx}`} />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Animated Progress Indicator */}
                                            <div className="relative pt-4">
                                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${(step.step / steps.length) * 100}%` }}
                                                        transition={{ duration: 1, delay: 0.3 }}
                                                        viewport={{ once: true }}
                                                        className={`h-full bg-linear-to-r ${step.gradient} rounded-full`}
                                                    ></motion.div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500 mt-2">
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
                    className="mt-20"
                >
                    <div className="bg-linear-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
                            Why Citizens Trust CityFix
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
                                    <div className="w-20 h-20 bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        {stat.icon}
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                    <div className="text-gray-600 text-sm">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Ready to Report Your First Issue?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Join our community of active citizens and help improve public infrastructure in your area.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold">
                                Start Reporting Now
                            </button>
                            <button className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 font-semibold">
                                Watch Demo Video
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Visual Timeline for Mobile */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-12 lg:hidden"
                >
                    <div className="relative h-1 bg-linear-to-r from-blue-400 to-purple-400 rounded-full">
                        {steps.map((step, index) => (
                            <div
                                key={step.step}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${(index / (steps.length - 1)) * 100}%` }}
                            >
                                <div className={`w-4 h-4 rounded-full bg-linear-to-r ${step.gradient}`}></div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HowItWorks;