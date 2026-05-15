import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { User, Settings, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Moon, Sun, X, Mail, ShieldCheck, Award, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Profile() {
  const { user, loading, logout, appMode } = useAuth();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [activeModal, setActiveModal] = useState(null);
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'USD');
  const navigate = useNavigate();

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleCurrency = () => {
    const nextCurr = currency === 'USD' ? 'INR' : 'USD';
    setCurrency(nextCurr);
    localStorage.setItem('currency', nextCurr);
    window.location.reload();
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'Personal Information':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" defaultValue={user?.fullname || 'Loading...'} className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input type="email" defaultValue={user?.email || 'Loading...'} className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <input type="tel" defaultValue="+91 98765 43210" className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold" />
            </div>
            <button 
              onClick={() => setActiveModal(null)}
              className="w-full py-4 mt-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        );
      case 'Payment Methods':
        return (
          <div className="space-y-4">
            <div className="p-5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between bg-slate-50 dark:bg-slate-900/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-black text-slate-900 dark:text-white">•••• 4242</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires 12/26</div>
                </div>
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">Default</span>
            </div>
            <button className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-all">
              + Add New Card
            </button>
          </div>
        );
      case 'Notifications':
        return (
          <div className="space-y-3">
            {[
              { title: 'Push Notifications', active: true },
              { title: 'Email Updates', active: true },
              { title: 'SMS Alerts', active: false },
              { title: 'Promotional Offers', active: false }
            ].map((pref, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">{pref.title}</span>
                <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors cursor-pointer ${pref.active ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${pref.active ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}
          </div>
        );
      case 'Settings':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Location Services</span>
              <div className="w-11 h-6 rounded-full flex items-center p-1 bg-blue-600 cursor-pointer shadow-inner"><div className="w-4 h-4 rounded-full bg-white translate-x-5 shadow-sm" /></div>
            </div>
            <div className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Language</span>
              <span className="text-sm font-black text-blue-600 uppercase tracking-widest">English</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Currency</span>
              <div 
                onClick={toggleCurrency}
                className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 rounded-xl p-1 cursor-pointer select-none border border-slate-100 dark:border-slate-700"
              >
                <div className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${currency === 'USD' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>USD</div>
                <div className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${currency === 'INR' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>INR</div>
              </div>
            </div>
          </div>
        );
      case 'Help & Support':
        return (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Need Assistance?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
              We're here to help! If you have any questions or need help with your bookings, please don't hesitate to reach out.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 mb-8">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Support Email</span>
              <a href="mailto:sainijatin505@gmail.com" className="text-lg font-black text-blue-600 hover:underline break-all">
                support@locser.com
              </a>
            </div>
            <a 
              href="mailto:support@locser.com" 
              className="flex items-center justify-center w-full py-5 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Send an Email Now
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-200">
      <div className="px-6 md:px-12 pt-10 pb-6 bg-white dark:bg-slate-900 sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Manage your profile and preferences</p>
      </div>
      
      <div className="px-6 md:px-12 py-10 pb-32">
        <div className="max-w-4xl grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
             <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-3xl p-8 rounded-[3rem] shadow-2xl border border-white/50 dark:border-slate-700/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full group-hover:bg-blue-500/10 transition-all duration-700"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                   <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-900 p-1 mb-6 shadow-xl border-2 border-white dark:border-slate-700 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="w-full h-full rounded-[1.8rem] object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-[1.8rem] bg-blue-100 flex items-center justify-center">
                           <User className="w-10 h-10 text-blue-600" />
                        </div>
                      )}
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{user ? user.fullname : 'Loading...'}</h2>
                   <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-1">{user ? user.email : 'Loading...'}</p>
                   
                   <div className="flex items-center gap-2 mt-6">
                      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800">
                         <Award className="w-4 h-4 text-blue-600" />
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pro Member</span>
                      </div>
                   </div>
                </div>

                <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-700 space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold">Total Bookings</span>
                      <span className="text-slate-900 dark:text-white font-black">12</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold">Member Since</span>
                      <span className="text-slate-900 dark:text-white font-black">May 2024</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[3rem] shadow-xl border border-white/30 dark:border-slate-700/30 overflow-hidden transition-all duration-500">
              <MenuItem 
                icon={isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} 
                label="Dark Mode" 
                onClick={toggleTheme}
                description="Adjust the interface appearance"
                rightElement={
                  <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                }
              />
              <MenuItem icon={<User className="w-5 h-5" />} label="Personal Information" description="Update your name, email, and phone number" onClick={() => setActiveModal('Personal Information')} />
              <MenuItem icon={<CreditCard className="w-5 h-5" />} label="Payment Methods" description="Securely manage your saved cards" onClick={() => setActiveModal('Payment Methods')} />
              <MenuItem icon={<Bell className="w-5 h-5" />} label="Notifications" description="Configure how you receive alerts" onClick={() => setActiveModal('Notifications')} />
              <MenuItem icon={<Settings className="w-5 h-5" />} label="Settings" description="Location, language, and regional settings" onClick={() => setActiveModal('Settings')} />
              <MenuItem icon={<HelpCircle className="w-5 h-5" />} label="Help & Support" description="Get in touch with our support team" onClick={() => setActiveModal('Help & Support')} />
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95 border-2 border-transparent hover:border-red-200 dark:hover:border-red-500/30 shadow-lg shadow-red-500/5"
            >
              <LogOut className="w-5 h-5" />
              Log Out of Account
            </button>
          </div>
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in transition-all">
          <div className="bg-white dark:bg-slate-800 rounded-t-[3rem] md:rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-0 md:zoom-in-95 border border-white dark:border-slate-700">
            <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 sticky top-0 z-10">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{activeModal}</h2>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full flex items-center justify-center transition-all group"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-300 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, description, onClick, rightElement }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-6 md:p-8 border-b border-slate-100/50 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-800 transition-all last:border-b-0 group text-left"
    >
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
          {icon}
        </div>
        <div>
           <span className="block font-black text-slate-900 dark:text-white text-lg tracking-tight transition-colors group-hover:text-blue-600">{label}</span>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-0.5">{description}</p>
        </div>
      </div>
      {rightElement || (
         <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 group-hover:bg-blue-600 transition-all duration-500">
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
         </div>
      )}
    </button>
  );
}
