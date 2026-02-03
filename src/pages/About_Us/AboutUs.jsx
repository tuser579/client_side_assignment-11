import React from 'react';
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

const AboutUs = () => {
  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Citizen Reporting",
      description: "Easy-to-use platform for reporting infrastructure issues in real-time"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Transparency",
      description: "Full visibility into issue status and resolution progress"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Reduced Response Time",
      description: "Streamlined workflows for faster issue resolution"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Data Analytics",
      description: "Comprehensive infrastructure data collection and analysis"
    }
  ];

  const stats = [
    { label: "Avg. Response Time", value: "48h", change: "-65%" },
    { label: "Issues Resolved", value: "10K+", change: "+40%" },
    { label: "Citizen Satisfaction", value: "94%", change: "+25%" },
    { label: "Cities Covered", value: "50+", change: "Growing" }
  ];

 
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-blue-800 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <Target className="h-4 w-4 mr-2" />
              Transforming Municipal Services
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Building Better
              <span className="text-blue-600"> Communities</span>
              <span className="text-blue-600"> Together</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A modern digital platform connecting citizens with local government to 
              report, track, and resolve public infrastructure issues efficiently.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-15 mb-10 sm:mb-20">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-6">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-blue-100 leading-relaxed">
              To bridge the gap between citizens and municipal services by providing 
              a transparent, efficient, and user-friendly platform for reporting and 
              resolving public infrastructure issues.
            </p>
          </div>
          
          <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-6">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-gray-300 leading-relaxed">
              To create smarter, more responsive cities where every citizen can 
              contribute to community improvement and track real-time progress 
              on infrastructure maintenance.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-15 mb-10 sm:mb-15">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Key Benefits
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Our platform delivers measurable improvements in municipal service delivery
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AboutUs;