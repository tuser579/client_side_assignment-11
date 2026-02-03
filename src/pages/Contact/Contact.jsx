import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User,
  Building,
  Globe
} from 'lucide-react';

const Contact = () => {
  
  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      details: ["support@cityfix.gov", "emergency@infrareport.gov"],
      description: "General inquiries & emergency reports",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "24/7 Hotline",
      details: ["+88 01712341234", "+88 01398761234"],
      description: "24/7 emergency infrastructure issues",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Office Locations",
      details: ["City Hall, Downtown, Metro City", "456 Municipal Plaza"],
      description: "Visit our regional offices",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Business Hours",
      details: ["Mon-Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 2:00 PM"],
      description: "Extended hours for urgent matters",
      color: "bg-amber-100 text-amber-600"
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold mb-6">
              <MessageSquare className="h-4 w-4 mr-2" />
              Get In Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact Our <span className="text-blue-200">Municipal</span> Team
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Reach out for support, report urgent infrastructure issues, or provide feedback
              to help us improve city services.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-15">
          {contactInfo.map((info, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${info.color} mb-4`}>
                {info.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
              <div className="space-y-2 mb-3">
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-700 font-medium">{detail}</p>
                ))}
              </div>
              <p className="text-sm text-gray-500">{info.description}</p>
            </div>
          ))}
        </div>

        {/* Map Placeholder */}
        <div className="mb-8 sm:mb-15">
          <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-3xl overflow-hidden">
            <div className="p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Find Our Offices</h2>
              <p className="text-blue-100">Visit us at our municipal service centers</p>
            </div>
            <div className="bg-gray-800 h-64 flex items-center justify-center text-white">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-300" />
                <p className="text-lg font-semibold">Interactive Map</p>
                <p className="text-blue-200 text-sm">Office locations would appear here</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;