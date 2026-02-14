import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageSquare,
  User,
  Building,
  Globe,
  ChevronDown,
  Navigation,
  Search
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons - Using CDN URLs instead of require()
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Contact = () => {
  // State for selected region
  const [selectedRegion, setSelectedRegion] = useState('Dhaka');
  const [serviceCenters, setServiceCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  
  // Fetch service centers data
  useEffect(() => {
    const fetchServiceCenters = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/serviceCenter.json');
        const data = await response.json();
        setServiceCenters(data);
      } catch (error) {
        console.error('Error loading service centers:', error);
        // Default data if fetch fails
        setServiceCenters([
          {
            region: "Dhaka",
            district: "Dhaka",
            city: "Dhaka",
            covered_area: ["Uttara", "Dhanmondi", "Mirpur", "Mohammadpur"],
            status: "active",
            flowchart: "https://example.com/dhaka-flowchart.png",
            longitude: 90.4125,
            latitude: 23.8103
          },
          {
            region: "Gazipur",
            district: "Gazipur",
            city: "Gazipur",
            covered_area: ["Gazipur City", "Kaliakair", "Kapasia"],
            status: "active",
            flowchart: "https://example.com/gazipur-flowchart.png",
            longitude: 90.4200,
            latitude: 24.0025
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceCenters();
  }, []);
  
  // Get selected region data
  const selectedRegionData = serviceCenters.find(center => 
    center.district === selectedRegion || center.region === selectedRegion
  ) || serviceCenters[0] || {};

  // Handle search for regions
  const handleSearch = (e) => {
    e.preventDefault();
    const location = searchQuery.trim().toLowerCase();
    
    if (!location) return;
    
    const district = serviceCenters.find(c => 
      c.district.toLowerCase().includes(location) || 
      c.region.toLowerCase().includes(location) ||
      c.city.toLowerCase().includes(location)
    );

    if (district) {
      setSelectedRegion(district.district);
      const coord = [district.latitude, district.longitude];
      
      // Fly to the location on the map
      if (mapRef.current) {
        mapRef.current.flyTo(coord, 13);
      }
    }
  };

  // Dynamic contact info based on selected region
  const getContactInfo = () => {
    const baseInfo = [
      {
        icon: <Mail className="h-6 w-6" />,
        title: "Email Support",
        details: [
          `support@${selectedRegion.toLowerCase()}-cityfix.gov`,
          `emergency@${selectedRegion.toLowerCase()}infrareport.gov`
        ],
        description: "General inquiries & emergency reports",
        color: "bg-blue-100 text-blue-600"
      },
      {
        icon: <Phone className="h-6 w-6" />,
        title: "24/7 Hotline",
        details: [
          selectedRegion === 'Dhaka' ? "+88 01712341234" : "+88 01876543210",
          selectedRegion === 'Dhaka' ? "+88 01398761234" : "+88 01987654321"
        ],
        description: "24/7 emergency infrastructure issues",
        color: "bg-green-100 text-green-600"
      },
      {
        icon: <MapPin className="h-6 w-6" />,
        title: "Office Locations",
        details: [
          `${selectedRegion} District Office`,
          `Covering: ${selectedRegionData.covered_area?.slice(0, 3).join(', ')}${selectedRegionData.covered_area?.length > 3 ? '...' : ''}`,
          `City Hall, Downtown, ${selectedRegion}`
        ],
        description: `Visit our ${selectedRegion} regional office`,
        color: "bg-purple-100 text-purple-600"
      },
      {
        icon: <Clock className="h-6 w-6" />,
        title: "Business Hours",
        details: [
          "Mon-Fri: 8:00 AM - 6:00 PM",
          "Sat: 9:00 AM - 2:00 PM",
          selectedRegion === 'Dhaka' ? "Sun: Emergency only" : "Sun: Closed"
        ],
        description: "Extended hours for urgent matters",
        color: "bg-amber-100 text-amber-600"
      }
    ];
    
    return baseInfo;
  };

  const contactInfo = getContactInfo();

  // Custom marker icon for selected region
  const selectedIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 46],
    iconAnchor: [15, 46],
    popupAnchor: [1, -34],
    shadowSize: [46, 46]
  });

  // Default marker icon for other regions
  const defaultIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

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
              to help us improve city services across Bangladesh.
            </p>
          </div>
          
          {/* Region Selection and Search */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Search Form */}
                <div>
                  <div className="flex items-center mb-4">
                    <Search className="h-5 w-5 mr-2 text-blue-200" />
                    <label className="text-lg font-medium text-blue-100">
                      Search Your District
                    </label>
                  </div>
                  
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter district or region name..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm text-gray-800 font-medium 
                                 border-2 border-white/30 focus:border-white focus:ring-2 focus:ring-white/50 
                                 focus:outline-none"
                      />
                    </div>
                  </form>
                </div>
                
                {/* Region Dropdown */}
                <div>
                  <div className="flex items-center mb-4">
                    <Building className="h-5 w-5 mr-2 text-blue-200" />
                    <label className="text-lg font-medium text-blue-100">
                      Or Select Region
                    </label>
                  </div>
                  
                  <div className="relative">
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-4 py-3 pl-12 rounded-xl bg-white/90 backdrop-blur-sm text-gray-800 font-medium 
                               border-2 border-white/30 focus:border-white focus:ring-2 focus:ring-white/50 
                               focus:outline-none appearance-none"
                      disabled={serviceCenters.length === 0}
                    >
                      {serviceCenters.length === 0 ? (
                        <option value="">Loading districts...</option>
                      ) : (
                        serviceCenters.map((center, index) => (
                          <option key={index} value={center.district}>
                            {center.district}, {center.region} Region
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedRegionData && (
                <div className="mt-6 p-4 bg-white/10 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-100 text-sm">
                        <span className="font-semibold">Coverage Area:</span>{' '}
                        {selectedRegionData.covered_area?.join(', ') || 'Loading...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedRegionData.status === 'active' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                          {selectedRegionData.status || 'Active'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
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

        {/* Interactive Map Section */}
        <div className="mb-12">
          <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="flex items-center mb-4 md:mb-0">
                  <MapPin className="h-8 w-8 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedRegion} District Coverage Map
                    </h2>
                    <p className="text-blue-100">
                      We are available in {serviceCenters.length} districts across Bangladesh
                    </p>
                  </div>
                </div>
                <div className="text-sm bg-white/20 px-4 py-2 rounded-full font-medium">
                  Click on markers for details
                </div>
              </div>
            </div>
            
            {/* Actual Map Container */}
            <div className="h-[400px] w-full">
              {serviceCenters.length > 0 ? (
                <MapContainer
                  center={[selectedRegionData.latitude || 23.6850, selectedRegionData.longitude || 90.3563]}
                  zoom={selectedRegionData.district === 'Dhaka' ? 8 : 7}
                  scrollWheelZoom={true}
                  className="h-full w-full rounded-b-3xl"
                  ref={mapRef}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Render all markers */}
                  {serviceCenters.map((center, index) => {
                    const isSelected = center.district === selectedRegion;
                    return (
                      <Marker 
                        key={index}
                        position={[center.latitude, center.longitude]}
                        icon={isSelected ? selectedIcon : defaultIcon}
                        eventHandlers={{
                          click: () => {
                            setSelectedRegion(center.district);
                          }
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[250px]">
                            <div className="flex items-center mb-2">
                              <div className={`w-3 h-3 rounded-full mr-2 ${isSelected ? 'bg-blue-600' : 'bg-gray-500'}`}></div>
                              <h3 className="font-bold text-lg text-gray-800">{center.district}</h3>
                            </div>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p><span className="font-semibold">Region:</span> {center.region}</p>
                              <p><span className="font-semibold">City:</span> {center.city}</p>
                              <p><span className="font-semibold">Status:</span> 
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${center.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {center.status}
                                </span>
                              </p>
                              <p className="mt-2"><span className="font-semibold">Covered Areas:</span></p>
                              <p className="text-gray-600">{center.covered_area?.join(', ')}</p>
                              <button 
                                onClick={() => setSelectedRegion(center.district)}
                                className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors text-sm"
                              >
                                Select This District
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-800 rounded-b-3xl">
                  <div className="text-center text-white">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-300" />
                    <p className="text-lg font-semibold">Loading map...</p>
                    <p className="text-blue-200 text-sm">Please wait while we load district data</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Region Information Card */}
        <div className="mb-12">
          <div className="bg-linear-to-r from-purple-600 to-purple-700 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-8 text-white">
              <div className="flex items-center mb-6">
                <Building className="h-8 w-8 mr-3" />
                <h2 className="text-2xl font-bold">
                  {selectedRegion} Regional Office Details
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-200 mb-3">Service Coverage</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegionData.covered_area?.map((area, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-purple-200 mb-3">Region Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-purple-300" />
                      <span>Region: {selectedRegionData.region || selectedRegion}</span>
                    </div>
                    <div className="flex items-center">
                      <Navigation className="h-4 w-4 mr-2 text-green-300" />
                      <span>Status: {selectedRegionData.status || 'Active'}</span>
                    </div>
                    {selectedRegionData.latitude && selectedRegionData.longitude && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-300" />
                        <span>Coordinates: {selectedRegionData.latitude.toFixed(4)}°N, {selectedRegionData.longitude.toFixed(4)}°E</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-purple-200 mb-3">Quick Contact</h3>
                  <div className="space-y-2">
                    <a 
                      href={`tel:${selectedRegion === 'Dhaka' ? "+8801712341234" : "+8801876543210"}`}
                      className="flex items-center p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      <span>Call Office</span>
                    </a>
                    <a 
                      href={`mailto:support@${selectedRegion.toLowerCase()}-cityfix.gov`}
                      className="flex items-center p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      <span>Email Support</span>
                    </a>
                    <button 
                      onClick={() => {
                        if (mapRef.current && selectedRegionData.latitude && selectedRegionData.longitude) {
                          mapRef.current.flyTo([selectedRegionData.latitude, selectedRegionData.longitude], 13);
                        }
                      }}
                      className="w-full flex items-center p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>View on Map</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Immediate Assistance?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <a 
                href={`tel:${selectedRegion === 'Dhaka' ? "+8801712341234" : "+8801876543210"}`}
                className="p-6 bg-linear-to-r from-blue-50 to-blue-100 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-blue-600 text-white rounded-xl mr-4 group-hover:scale-110 transition-transform">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Emergency Call</h3>
                </div>
                <p className="text-gray-600">
                  Call our 24/7 emergency hotline for urgent infrastructure issues
                </p>
              </a>
              
              <a 
                href={`mailto:emergency@${selectedRegion.toLowerCase()}infrareport.gov`}
                className="p-6 bg-linear-to-r from-green-50 to-green-100 rounded-2xl hover:from-green-100 hover:to-green-200 transition-all duration-300 text-left group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-green-600 text-white rounded-xl mr-4 group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Email Report</h3>
                </div>
                <p className="text-gray-600">
                  Send detailed reports with photos to our emergency email support
                </p>
              </a>
              
              <button 
                onClick={() => {
                  if (mapRef.current && selectedRegionData.latitude && selectedRegionData.longitude) {
                    mapRef.current.flyTo([selectedRegionData.latitude, selectedRegionData.longitude], 15);
                  }
                }}
                className="p-6 bg-linear-to-r from-purple-50 to-purple-100 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 text-left group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-purple-600 text-white rounded-xl mr-4 group-hover:scale-110 transition-transform">
                    <Building className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Find Office</h3>
                </div>
                <p className="text-gray-600">
                  Get directions to our {selectedRegion} municipal office
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;