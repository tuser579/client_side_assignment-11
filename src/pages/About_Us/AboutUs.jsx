import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Shield,
  TrendingUp,
  Clock,
  Users,
  Database,
  Zap,
  Target,
  MessageSquare,
  BarChart
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const AboutUs = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Citizen Reporting",
      description: "Easy-to-use platform for reporting infrastructure issues in real-time",
      accent: "from-blue-500 to-cyan-400",
      glow: "rgba(59,130,246,0.15)"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Transparency",
      description: "Full visibility into issue status and resolution progress",
      accent: "from-violet-500 to-fuchsia-400",
      glow: "rgba(139,92,246,0.15)"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Reduced Response Time",
      description: "Streamlined workflows for faster issue resolution",
      accent: "from-emerald-500 to-teal-400",
      glow: "rgba(16,185,129,0.15)"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Analytics",
      description: "Comprehensive infrastructure data collection and analysis",
      accent: "from-orange-500 to-amber-400",
      glow: "rgba(249,115,22,0.15)"
    }
  ];

  const team = [
    { name: "Urban Planning", role: "Infrastructure Division", avatar: "UP", accent: "from-blue-500 to-cyan-400" },
    { name: "Tech & Engineering", role: "Platform Development", avatar: "TE", accent: "from-violet-500 to-fuchsia-400" },
    { name: "Civic Engagement", role: "Community Relations", avatar: "CE", accent: "from-emerald-500 to-teal-400" },
    { name: "Data & Analytics", role: "Insights & Reporting", avatar: "DA", accent: "from-orange-500 to-amber-400" },
  ];

  const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-9 sm:pt-12 pb-6">
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />
        {/* Blobs */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-[120px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Transforming Municipal Services
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Building Better
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-violet-500 to-cyan-400">
                Communities Together
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              A modern digital platform connecting citizens with local government to
              report, track, and resolve public infrastructure issues efficiently.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION & VISION ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative items-center overflow-hidden bg-linear-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-xl p-8 text-white shadow-2xl shadow-blue-500/20"
          >
            <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-cyan-400/10 blur-2xl" />
            <div className="relative flex flex-col items-center sm:items-start">
              <div className=" w-12 h-12 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-blue-200 mb-3 block">Mission</span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h3>
              <p className="text-blue-100 leading-relaxed">
                To bridge the gap between citizens and municipal services by providing
                a transparent, efficient, and user-friendly platform for reporting and
                resolving public infrastructure issues.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Transparency", "Accountability", "Speed"].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-white">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden bg-gray-900 dark:bg-gray-800 rounded-xl p-8 text-white shadow-2xl border border-gray-700 dark:border-gray-600"
          >
            <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-500/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-fuchsia-400/10 blur-2xl" />
            <div className="relative flex flex-col items-center sm:items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-violet-300" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 block">Vision</span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">
                To create smarter, more responsive cities where every citizen can
                contribute to community improvement and track real-time progress
                on infrastructure maintenance.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Smart Cities", "Innovation", "Community"].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── KEY BENEFITS ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Key Benefits
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">CityFix</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Our platform delivers measurable improvements in municipal service delivery
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl p-6 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 bg-linear-to-br ${f.accent} rounded-xl flex items-center justify-center text-white mb-5 shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.description}</p>
              <div className={`mt-4 h-0.5 w-8 rounded-full bg-linear-to-r ${f.accent} group-hover:w-full transition-all duration-500`} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── TEAM DIVISIONS ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              The People <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-fuchsia-500">Behind CityFix</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Dedicated divisions working together to make cities smarter and more responsive
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {team.map((t, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl p-6 text-center hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-16 h-16 bg-linear-to-br ${t.accent} rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg`}>
                {t.avatar}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{t.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
              <div className={`mt-3 h-1 w-12 rounded-full bg-linear-to-r ${t.accent} mx-auto`} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-9 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-linear-to-br from-blue-600 via-violet-600 to-purple-700 rounded-xl p-10 sm:p-14 text-center text-white shadow-2xl shadow-blue-500/20"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
                backgroundSize: '32px 32px'
              }}
            />
          </div>
          <div className="relative">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-white/70 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Join CityFix Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to improve your city?
            </h2>
            <p className="text-white/75 text-lg max-w-xl mx-auto mb-8">
              Join thousands of citizens already making their communities safer, cleaner, and more liveable.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {user ? (
                <a href="/dashboard/reportIssue" className="px-7 py-3 bg-white text-blue-600 text-sm font-bold rounded-xl hover:bg-gray-100 hover:scale-[1.02] transition-all duration-200 shadow-lg">
                  Report an Issue
                </a>
              ) : (
                <a href="/register" className="px-7 py-3 bg-white text-blue-600 text-sm font-bold rounded-xl hover:bg-gray-100 hover:scale-[1.02] transition-all duration-200 shadow-lg">
                  Get Started Register
                </a>
              )}
              <a href="/all-issue" className="px-7 py-3 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors">
                Browse Issues
              </a>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default AboutUs;