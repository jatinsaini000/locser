import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Search, Calendar, MessageCircle, User, LogIn, MapPin, Bell, ChevronDown, Wallet, SwitchCamera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import LocationModal from './LocationModal';

const Layout = () => {
  const { user, appMode, toggleAppMode } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState(() => localStorage.getItem('locser_current_location') || 'Chandigarh, India');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleLocationSelect = (newLocation) => {
    setLocation(newLocation);
    localStorage.setItem('locser_current_location', newLocation);
  };
  
  const navItems = appMode === 'provider' 
    ? [
        { to: '/bookings', icon: <Calendar className="w-6 h-6" />, label: 'Requests' },
        { to: '/listings', icon: <Search className="w-6 h-6" />, label: 'My Listings' },
        { to: '/earnings', icon: <Wallet className="w-6 h-6" />, label: 'Earnings' },
        { to: '/messages', icon: <MessageCircle className="w-6 h-6" />, label: 'Messages' },
        { to: '/profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
      ]
    : [
        { to: '/', icon: <Home className="w-6 h-6" />, label: 'Home' },
        { to: '/search', icon: <Search className="w-6 h-6" />, label: 'Search' },
        { to: '/bookings', icon: <Calendar className="w-6 h-6" />, label: 'Bookings' },
        { to: '/messages', icon: <MessageCircle className="w-6 h-6" />, label: 'Messages' },
        { to: '/profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
      ];

  const handleModeToggle = () => {
    toggleAppMode();
    // Redirect to relevant starting page for the mode
    if (appMode === 'consumer') {
      navigate('/bookings'); // Switch to provider mode starts at requests/bookings
    } else {
      navigate('/'); // Switch to consumer mode starts at home
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen z-30 transition-all duration-300">
        <div className="p-6 lg:p-8 flex justify-center lg:justify-start">
          <h1 className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight whitespace-nowrap">
            <span className="lg:hidden text-blue-600">LS</span>
            <span className="hidden lg:inline">Locser</span>
          </h1>
        </div>
        <nav className="flex-1 px-3 lg:px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 shadow-lg shadow-blue-600/25 text-white font-bold scale-[1.02]' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                }`
              }
            >
              {item.icon}
              <span className="hidden lg:block text-base">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Mode Switcher Button */}
        {user && (
          <div className="px-4 mb-2">
            <button 
              onClick={handleModeToggle}
              className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black shadow-lg active:scale-95"
            >
              <SwitchCamera className="w-6 h-6" />
              <span className="hidden lg:block text-sm uppercase tracking-tighter">
                {appMode === 'consumer' ? 'Switch to Provider' : 'Switch to Customer'}
              </span>
            </button>
          </div>
        )}

        {/* User Profile Snippet */}
        <div className="p-3 lg:p-4 border-t border-slate-200 dark:border-slate-800 m-3 lg:m-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 transition-colors">
          {user ? (
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-700 overflow-hidden shadow-sm">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="hidden lg:block min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.fullname}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{appMode} Mode</p>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95">
              <LogIn className="w-4 h-4" />
              <span className="hidden lg:inline">Log In</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Right Column (Top Nav + Content) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{location}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            {user && (
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-widest rounded-lg border border-blue-200 dark:border-blue-800">
                {appMode} View
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <Link to="/profile" className="flex items-center gap-3 pl-2 group">
               <div className="text-right hidden xl:block">
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{user ? user.fullname : 'Guest User'}</p>
                  <p className="text-xs text-slate-500">{user ? 'View Profile' : 'Sign in to book'}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-transparent group-hover:border-blue-600 transition-all">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                      {user ? user.fullname.charAt(0) : '?'}
                    </div>
                  )}
               </div>
            </Link>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20">
           <h1 className="text-xl font-black text-blue-600 tracking-tight" onClick={() => navigate('/')}>Locser</h1>
           <div className="flex items-center gap-3">
             <div 
               onClick={() => setIsLocationModalOpen(true)}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700"
             >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[80px]">{location}</span>
             </div>
             {user && (
               <button onClick={handleModeToggle} className="p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl">
                 <SwitchCamera className="w-4 h-4" />
               </button>
             )}
           </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-20 md:pb-0 overflow-y-auto relative bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex justify-around items-center p-3 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 transition-all duration-300 ${
                isActive ? 'text-blue-600 scale-110' : 'text-slate-400'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      {/* Location Selection Modal */}
      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={handleLocationSelect}
        currentLocation={location}
      />
    </div>
  );
};

export default Layout;
