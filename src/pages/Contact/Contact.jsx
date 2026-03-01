import React, { useState, useEffect } from 'react';
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
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── FlyTo helper (must be inside MapContainer) ──────────────
const FlyToLocation = ({ coords, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, zoom || 12, { duration: 1.2 });
  }, [coords, zoom, map]);
  return null;
};

const Contact = () => {
  const [selectedRegion, setSelectedRegion] = useState('Dhaka');
  const [serviceCenters, setServiceCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyZoom, setFlyZoom] = useState(12);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServiceCenters = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/serviceCenter.json');
        const data = await response.json();
        setServiceCenters(data);
      } catch (error) {
        setServiceCenters([
          {
            region: "Dhaka", district: "Dhaka", city: "Dhaka",
            covered_area: ["Uttara", "Dhanmondi", "Mirpur", "Mohammadpur"],
            status: "active", longitude: 90.4125, latitude: 23.8103
          },
          {
            region: "Gazipur", district: "Gazipur", city: "Gazipur",
            covered_area: ["Gazipur City", "Kaliakair", "Kapasia"],
            status: "active", longitude: 90.4200, latitude: 24.0025
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServiceCenters();
  }, []);

  const selectedRegionData = serviceCenters.find(c =>
    c.district === selectedRegion || c.region === selectedRegion
  ) || serviceCenters[0] || {};

  // ── onChange live search ─────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (!val.trim()) return;

    const match = serviceCenters.find(c =>
      c.district.toLowerCase().includes(val.toLowerCase()) ||
      c.region.toLowerCase().includes(val.toLowerCase()) ||
      c.city.toLowerCase().includes(val.toLowerCase())
    );

    if (match) {
      setSelectedRegion(match.district);
      setFlyTarget([match.latitude, match.longitude]);
      setFlyZoom(12);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleSearchChange({ target: { value: searchQuery } });
  };

  const handleRegionSelect = (district) => {
    setSelectedRegion(district);
    const match = serviceCenters.find(c => c.district === district);
    if (match) {
      setFlyTarget([match.latitude, match.longitude]);
      setFlyZoom(12);
    }
  };

  const getContactInfo = () => [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      details: [
        `support@${selectedRegion.toLowerCase()}-cityfix.gov`,
        `emergency@${selectedRegion.toLowerCase()}infrareport.gov`
      ],
      description: "General inquiries & emergency reports",
      accent: "from-blue-500 to-cyan-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      iconBg: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "24/7 Hotline",
      details: [
        selectedRegion === 'Dhaka' ? "+88 01712 341234" : "+88 01876 543210",
        selectedRegion === 'Dhaka' ? "+88 01398 761234" : "+88 01987 654321"
      ],
      description: "24/7 emergency infrastructure issues",
      accent: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
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
      accent: "from-violet-500 to-fuchsia-400",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      iconBg: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Business Hours",
      details: [
        "Mon–Fri: 8:00 AM – 6:00 PM",
        "Sat: 9:00 AM – 2:00 PM",
        selectedRegion === 'Dhaka' ? "Sun: Emergency only" : "Sun: Closed"
      ],
      description: "Extended hours for urgent matters",
      accent: "from-orange-500 to-amber-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      iconBg: "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
    }
  ];

  const selectedIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 46], iconAnchor: [15, 46], popupAnchor: [1, -34], shadowSize: [46, 46]
  });

  const defaultIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center transition-colors duration-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-dashed border-blue-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading contact information...</p>
      </div>
    </div>
  );

  const contactInfo = getContactInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">

      {/* ── HERO HEADER ──────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 text-white">
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-linear(rgba(255,255,255,0.6) 1px, transparent 1px),
                              linear-linear(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-xl bg-white animate-pulse" />
              <MessageSquare className="h-4 w-4" /> Get In Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Contact Our{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-cyan-200">
                Municipal
              </span>{' '}
              Team
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Reach out for support, report urgent infrastructure issues, or provide feedback
              to help improve city services across Bangladesh.
            </p>
          </div>

          {/* Search + Region selector */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-5">
                {/* Live Search */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-100 mb-2">
                    <Search className="h-4 w-4" /> Search District (live)
                  </label>
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Type district or region..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-2 border-white/30 focus:border-white focus:ring-2 focus:ring-white/30 focus:outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </form>
                </div>

                {/* Dropdown */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-100 mb-2">
                    <Building className="h-4 w-4" /> Or Select Region
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 z-10" />
                    <select
                      value={selectedRegion}
                      onChange={(e) => handleRegionSelect(e.target.value)}
                      className="w-full pl-10 pr-8 py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white border-2 border-white/30 focus:border-white focus:ring-2 focus:ring-white/30 focus:outline-none appearance-none text-sm font-medium transition-all"
                    >
                      {serviceCenters.map((c, i) => (
                        <option key={i} value={c.district}>{c.district}, {c.region} Region</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Coverage info strip */}
              {selectedRegionData?.covered_area && (
                <div className="mt-4 p-3 bg-white/10 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                  <span className="text-blue-200 font-semibold shrink-0">Coverage:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRegionData.covered_area.map((area, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-white/15 rounded-full text-white text-xs font-medium">{area}</span>
                    ))}
                  </div>
                  <span className={`ml-auto shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedRegionData.status === 'active' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                    {selectedRegionData.status || 'Active'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* ── CONTACT CARDS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {contactInfo.map((info, i) => (
            <div
              key={i}
              className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${info.iconBg} flex items-center justify-center mb-4`}>
                {info.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">{info.title}</h3>
              <div className="space-y-1.5 mb-3">
                {info.details.map((d, idx) => (
                  <p key={idx} className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-snug">{d}</p>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{info.description}</p>
              <div className={`mt-4 h-0.5 w-8 rounded-full bg-linear-to-r ${info.accent}`} />
            </div>
          ))}
        </div>

        {/* ── MAP ────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-950 rounded-xl overflow-hidden shadow-xl border border-blue-500/20">
            <div className="p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-7 w-7 shrink-0" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">{selectedRegion} District Coverage Map</h2>
                  <p className="text-blue-200 text-sm">Available in {serviceCenters.length} districts across Bangladesh</p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-xs bg-white/20 border border-white/20 px-3 py-1.5 rounded-full font-medium">
                Click markers for details
              </span>
            </div>

            <div className="h-[420px] w-full">
              {serviceCenters.length > 0 ? (
                <MapContainer
                  center={[selectedRegionData.latitude || 23.6850, selectedRegionData.longitude || 90.3563]}
                  zoom={8}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Live fly-to on search/select */}
                  {flyTarget && <FlyToLocation coords={flyTarget} zoom={flyZoom} />}

                  {serviceCenters.map((center, idx) => {
                    const isSelected = center.district === selectedRegion;
                    return (
                      <Marker
                        key={idx}
                        position={[center.latitude, center.longitude]}
                        icon={isSelected ? selectedIcon : defaultIcon}
                        eventHandlers={{ click: () => handleRegionSelect(center.district) }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[220px]">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-gray-400'}`} />
                              <h3 className="font-bold text-gray-800">{center.district}</h3>
                            </div>
                            <div className="space-y-1 text-xs text-gray-700">
                              <p><span className="font-semibold">Region:</span> {center.region}</p>
                              <p><span className="font-semibold">City:</span> {center.city}</p>
                              <p className="flex items-center gap-1">
                                <span className="font-semibold">Status:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${center.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {center.status}
                                </span>
                              </p>
                              <p className="mt-1"><span className="font-semibold">Areas:</span> {center.covered_area?.join(', ')}</p>
                            </div>
                            <button
                              onClick={() => handleRegionSelect(center.district)}
                              className="mt-2 w-full bg-blue-600 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Select District
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center text-white">
                    <MapPin className="h-10 w-10 mx-auto mb-3 text-blue-300" />
                    <p className="font-semibold">Loading map...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── REGION OFFICE DETAILS ──────────────────────────── */}
        <div className="pb-12">
          <div className="bg-linear-to-r from-violet-600 to-purple-700 dark:from-violet-800 dark:to-purple-950 rounded-xl overflow-hidden shadow-xl border border-violet-500/20">
            <div className="p-6 sm:p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <Building className="h-7 w-7" />
                <h2 className="text-xl sm:text-2xl font-bold">{selectedRegion} Regional Office Details</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Coverage */}
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-violet-200 mb-3">Service Coverage</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegionData.covered_area?.map((area, i) => (
                      <span key={i} className="px-3 py-1 bg-white/15 border border-white/10 rounded-full text-xs font-medium">{area}</span>
                    ))}
                  </div>
                </div>

                {/* Region details */}
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-violet-200 mb-3">Region Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-white/90">
                      <Globe className="h-4 w-4 text-violet-300 shrink-0" />
                      <span>Region: {selectedRegionData.region || selectedRegion}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <Navigation className="h-4 w-4 text-green-300 shrink-0" />
                      <span>Status: {selectedRegionData.status || 'Active'}</span>
                    </div>
                    {selectedRegionData.latitude && (
                      <div className="flex items-center gap-2 text-white/90">
                        <MapPin className="h-4 w-4 text-blue-300 shrink-0" />
                        <span>{selectedRegionData.latitude.toFixed(4)}°N, {selectedRegionData.longitude.toFixed(4)}°E</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick contact */}
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-violet-200 mb-3">Quick Contact</h3>
                  <div className="space-y-2">
                    <a
                      href={`tel:${selectedRegion === 'Dhaka' ? "+8801712341234" : "+8801876543210"}`}
                      className="flex items-center gap-2 p-2.5 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-colors text-sm"
                    >
                      <Phone className="h-4 w-4" /> Call Office
                    </a>

                    <a
                      href={`mailto:support@${selectedRegion.toLowerCase()}-cityfix.gov`}
                      className="flex items-center gap-2 p-2.5 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-colors text-sm"
                    >
                      <Mail className="h-4 w-4" /> Email Support
                    </a>
                    
                    <button
                      onClick={() => {
                        if (selectedRegionData?.latitude && selectedRegionData?.longitude) {
                          setFlyTarget([selectedRegionData.latitude, selectedRegionData.longitude]);
                          setFlyZoom(14);
                        }
                      }}
                      className="w-full flex items-center gap-2 p-2.5 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-colors text-sm"
                    >
                      <MapPin className="h-4 w-4" /> View on Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;