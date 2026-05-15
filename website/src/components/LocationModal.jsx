import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { X, MapPin, Navigation, Search, Check, Globe, Home, Briefcase, Plus, Trash2, Loader2 } from 'lucide-react';
import L from 'leaflet';
import axios from 'axios';

// Fix for Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationModal = ({ isOpen, onClose, onSelect, currentLocation }) => {
  const [position, setPosition] = useState([30.7333, 76.7794]); // Default: Chandigarh
  const [address, setAddress] = useState(currentLocation || 'Chandigarh, India');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveLabel, setSaveLabel] = useState('Home');

  useEffect(() => {
    const saved = localStorage.getItem('locser_saved_addresses');
    if (saved) setSavedAddresses(JSON.parse(saved));
  }, []);

  const reverseGeocode = async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (response.data && response.data.display_name) {
        setAddress(response.data.display_name);
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleSaveLocation = () => {
    const newAddress = {
      id: Date.now(),
      label: saveLabel,
      address: address,
      coords: position
    };
    const updated = [...savedAddresses, newAddress];
    setSavedAddresses(updated);
    localStorage.setItem('locser_saved_addresses', JSON.stringify(updated));
    setShowSaveInput(false);
  };

  const handleDeleteSaved = (e, id) => {
    e.stopPropagation();
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    localStorage.setItem('locser_saved_addresses', JSON.stringify(updated));
  };

  const popularCities = [
    { name: 'Chandigarh', coords: [30.7333, 76.7794] },
    { name: 'New Delhi', coords: [28.6139, 77.2090] },
    { name: 'Mumbai', coords: [19.0760, 72.8777] },
    { name: 'Bangalore', coords: [12.9716, 77.5946] }
  ];

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });

    return position === null ? null : (
      <Marker position={position}></Marker>
    );
  }

  function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
      if (isOpen) {
        const timer1 = setTimeout(() => map.invalidateSize(), 100);
        const timer2 = setTimeout(() => map.invalidateSize(), 500);
        const timer3 = setTimeout(() => map.invalidateSize(), 1000);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
        };
      }
    }, [isOpen, map]);
    
    useEffect(() => {
      map.flyTo(center, 13);
    }, [center]);
    
    return null;
  }

  const handleCitySelect = (city) => {
    setPosition(city.coords);
    setAddress(`${city.name}, India`);
  };

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          reverseGeocode(newPos[0], newPos[1]);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          alert("Could not get your location");
        }
      );
    }
  };

  const handleConfirm = () => {
    localStorage.setItem('locser_current_location', address);
    onSelect(address);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        {/* Left Panel: Controls */}
        <div className="w-full md:w-[420px] p-8 flex flex-col border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 overflow-y-auto hide-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Location Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="relative mb-6 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search for area, street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none text-sm font-bold transition-all"
            />
          </div>

          <button 
            onClick={handleGetCurrentLocation}
            className="flex items-center justify-center gap-3 w-full py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-sm mb-8 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all border border-blue-100 dark:border-blue-800/50 group shrink-0"
          >
            <Navigation className={`w-5 h-5 ${isLocating ? 'animate-pulse' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'} transition-transform`} />
            {isLocating ? 'Locating...' : 'Use Current Location'}
          </button>

          {/* Saved Addresses Section */}
          <div className="mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
              Saved Addresses
              <button onClick={() => setShowSaveInput(!showSaveInput)} className="text-blue-600 hover:underline">
                {showSaveInput ? 'Cancel' : 'Add New'}
              </button>
            </h3>
            
            {showSaveInput && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 mb-4 animate-in slide-in-from-top-4">
                <p className="text-[10px] font-bold text-blue-600 mb-2">SAVE CURRENT PIN AS:</p>
                <div className="flex gap-2 mb-3">
                   {['Home', 'Work', 'Other'].map(l => (
                     <button 
                       key={l}
                       onClick={() => setSaveLabel(l)}
                       className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${saveLabel === l ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
                     >
                       {l}
                     </button>
                   ))}
                </div>
                <button 
                  onClick={handleSaveLocation}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/20"
                >
                  Save Address
                </button>
              </div>
            )}

            <div className="space-y-3">
              {savedAddresses.map((sa) => (
                <div 
                  key={sa.id}
                  onClick={() => { setPosition(sa.coords); setAddress(sa.address); }}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-600/50 cursor-pointer group transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                    {sa.label === 'Home' ? <Home className="w-5 h-5 text-blue-600" /> : sa.label === 'Work' ? <Briefcase className="w-5 h-5 text-blue-600" /> : <MapPin className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{sa.label}</p>
                    <p className="text-[10px] text-slate-500 truncate font-bold">{sa.address}</p>
                  </div>
                  <button onClick={(e) => handleDeleteSaved(e, sa.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Popular Cities</h3>
            <div className="grid grid-cols-2 gap-2">
              {popularCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city)}
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all border ${
                    address.includes(city.name) 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-600/50'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{city.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
             <div className="mb-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                {isReverseGeocoding && (
                   <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                   </div>
                )}
                <div className="flex items-start gap-3">
                   <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                   <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Selected Location</span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-3">{address}</p>
                   </div>
                </div>
             </div>
             <button 
               onClick={handleConfirm}
               className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
             >
               Confirm Selection
             </button>
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <MapContainer 
            center={position} 
            zoom={13} 
            scrollWheelZoom={true} 
            className="w-full h-full z-0"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; Google'
              url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={20}
            />
            <LocationMarker />
            <ChangeView center={position} />
          </MapContainer>
          
          <div className="absolute bottom-8 right-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 dark:border-slate-800 shadow-xl pointer-events-none">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Click on map to select precise location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;

