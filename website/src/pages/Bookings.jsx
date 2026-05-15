import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Star, MoreHorizontal, X, Map, ChevronRight, ShieldCheck, ArrowRight } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api';
import { formatPrice } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import StatusTimeline from '../components/StatusTimeline';

export default function Bookings() {
  const { user, appMode, loading: authLoading } = useAuth();
  const isProvider = appMode === 'provider';
  
  const TABS = appMode === 'provider' ? ['Requests', 'Upcoming', 'History'] : ['Upcoming', 'History', 'Cancelled'];
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(appMode === 'provider' ? 'Requests' : 'Upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(appMode === 'provider' ? 'Requests' : 'Upcoming');
  }, [appMode]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/bookings?mode=${appMode}`)
      .then(res => {
        setBookings(res.data?.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user, appMode]);

  const processedBookings = bookings.map(booking => {
    if (booking.status === 'CONFIRMED') {
      const now = new Date();
      let bookingDate;
      
      if (/^\d+$/.test(booking.bookingDate)) {
        // If it's just a day number (like '14'), assume current month
        bookingDate = new Date();
        bookingDate.setDate(parseInt(booking.bookingDate, 10));
      } else {
        bookingDate = new Date(booking.bookingDate);
      }

      // If booking date is strictly in the past (before today) and still CONFIRMED, mark as MISSED for consumers
      // Providers should retain CONFIRMED status so they can still mark past jobs as completed.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appMode === 'consumer' && !isNaN(bookingDate.getTime()) && bookingDate < today) {
        return { ...booking, status: 'MISSED' };
      }
    }
    return booking;
  });

  const filteredBookings = processedBookings.filter(booking => {
    if (appMode === 'provider') {
      if (activeTab === 'Requests') return booking.status === 'PENDING';
      if (activeTab === 'Upcoming') return booking.status === 'CONFIRMED';
      if (activeTab === 'History') return ['COMPLETED', 'REJECTED', 'CANCELLED', 'MISSED'].includes(booking.status);
      return false;
    } else {
      if (activeTab === 'Upcoming') return booking.status === 'CONFIRMED' || booking.status === 'PENDING';
      if (activeTab === 'History') return booking.status === 'COMPLETED';
      if (activeTab === 'Cancelled') return ['CANCELLED', 'REJECTED', 'MISSED'].includes(booking.status);
      return false;
    }
  });

  const [cancellingId, setCancellingId] = useState(null);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  const handleStatusUpdate = async (id, status) => {
    setCancellingId(id);
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b.id == id ? { ...b, status } : b));
      setSelectedBooking(prev => (prev && prev.id == id ? { ...prev, status } : prev));
      setCancelConfirmId(null);
    } catch (err) {
      console.error(err);
      window.alert(`Failed to update booking status. Please try again.`);
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="px-6 md:px-12 pt-10 pb-6 bg-white dark:bg-slate-900 sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">My Bookings</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Manage your scheduled services</p>
           </div>
           <div className="hidden md:flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Safe & Secured</span>
           </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-8">
        {/* Modern Tabs */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 hide-scrollbar">
          {TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-300 relative shrink-0 ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-105' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Bookings Grid */}
        {loading ? (
          <div className="py-20 text-center">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="font-bold text-slate-500">Fetching your bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
               <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No {activeTab.toLowerCase()} bookings</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xs mb-10">Looks like you haven't scheduled any services in this category yet.</p>
            <button 
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:scale-105 transition-all active:scale-95"
            >
              Explore Services <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
            {filteredBookings.map(booking => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onViewDetails={() => setSelectedBooking(booking)} 
                onUpdateStatus={(status) => handleStatusUpdate(booking.id, status)}
                onCancelRequest={() => setCancelConfirmId(booking.id)}
                isCancelling={cancellingId === booking.id}
                isProvider={isProvider}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modern Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in transition-all">
          <div className="bg-white dark:bg-slate-800 rounded-t-[3rem] md:rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-0 md:zoom-in-95 border border-white dark:border-slate-700">
            <div className="relative h-48 bg-slate-200 dark:bg-slate-700 shrink-0">
              <img src={selectedBooking.imageUrl || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"} className="w-full h-full object-cover" alt="Service" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all group"
              >
                <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
              </button>
              <div className="absolute bottom-6 left-8">
                 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg border backdrop-blur-md ${
                    selectedBooking.status === 'CONFIRMED' ? 'bg-blue-600/80 text-white border-blue-400/50' : 
                    selectedBooking.status === 'COMPLETED' ? 'bg-green-600/80 text-white border-green-400/50' :
                    selectedBooking.status === 'CANCELLED' ? 'bg-red-600/80 text-white border-red-400/50' :
                    'bg-orange-600/80 text-white border-orange-400/50'
                 }`}>
                   {selectedBooking.status}
                 </div>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <div className="mb-8">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">{selectedBooking.title}</h3>
                <p className="text-blue-600 font-bold text-sm mt-1">{selectedBooking.providerName}</p>
              </div>

              {/* Status Timeline */}
              <div className="mb-8">
                <StatusTimeline currentStatus={selectedBooking.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</div>
                  <div className="font-black text-slate-900 dark:text-white text-sm">{selectedBooking.bookingDate}, {selectedBooking.timeSlot}</div>
                </div>

                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</div>
                  <div className="font-black text-slate-900 dark:text-white text-sm">{selectedBooking.location || 'Not Specified'}</div>
                </div>
              </div>

              <div className="bg-slate-900 dark:bg-blue-600 p-8 rounded-[2rem] text-white flex justify-between items-center shadow-xl shadow-slate-900/20">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Paid</span>
                    <div className="text-3xl font-black">{formatPrice(selectedBooking.totalPrice || 0)}</div>
                 </div>
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                 </div>
              </div>
            </div>

            <div className="p-8 pt-0 flex flex-col gap-3">
              {!isProvider && (selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'PENDING') && (
                <button 
                  onClick={() => setCancelConfirmId(selectedBooking.id)}
                  disabled={cancellingId === selectedBooking.id}
                  className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-black rounded-2xl transition-all active:scale-95 border border-red-100 disabled:opacity-50"
                >
                  {cancellingId === selectedBooking.id ? 'Processing...' : 'Cancel Booking'}
                </button>
              )}
              {isProvider && selectedBooking.status === 'PENDING' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'CONFIRMED')}
                    disabled={cancellingId === selectedBooking.id}
                    className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'REJECTED')}
                    disabled={cancellingId === selectedBooking.id}
                    className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
              {isProvider && selectedBooking.status === 'CONFIRMED' && (
                <button 
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'COMPLETED')}
                  disabled={cancellingId === selectedBooking.id}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                  Mark as Completed
                </button>
              )}
              <button 
                onClick={() => setSelectedBooking(null)}
                className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelConfirmId != null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Cancel this booking?</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mb-8">
              This cannot be undone. The provider will be notified.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCancelConfirmId(null)}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate(cancelConfirmId, 'CANCELLED')}
                disabled={cancellingId === cancelConfirmId}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {cancellingId === cancelConfirmId ? 'Cancelling…' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, onViewDetails, onUpdateStatus, onCancelRequest, isCancelling, isProvider }) {
  const getStatusConfig = (status) => {
    switch(status) {
      case 'PENDING': return { label: 'Pending for Approval', color: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400' };
      case 'CONFIRMED': return { label: 'Confirmed', color: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' };
      case 'COMPLETED': return { label: 'Completed', color: 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' };
      case 'CANCELLED': return { label: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' };
      case 'REJECTED': return { label: 'Rejected', color: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' };
      case 'MISSED': return { label: 'Missed', color: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' };
      default: return { label: status, color: 'text-slate-500 bg-slate-50 border-slate-100' };
    }
  };

  const status = getStatusConfig(booking.status);

  return (
    <div className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2">
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-700">
                 <img src={booking.imageUrl || "https://placehold.co/150"} alt={booking.title} className="w-full h-full object-cover" />
              </div>
              <div>
                 <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight line-clamp-1">{booking.title || 'Service Booking'}</h3>
                 <span className="text-blue-600 font-bold text-xs">{booking.providerName || 'Provider'}</span>
              </div>
           </div>
           <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${status.color}`}>
             {status.label}
           </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-100/50 dark:border-slate-700/50">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                 <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Date</span>
                 <span className="text-sm font-bold text-slate-900 dark:text-white">{booking.bookingDate}</span>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                 <Clock className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Slot</span>
                 <span className="text-sm font-bold text-slate-900 dark:text-white">{booking.timeSlot}</span>
              </div>
           </div>
        </div>
        
        <div className="mt-8 flex items-center gap-4">
          <button 
            onClick={onViewDetails}
            className="flex-1 py-4 bg-slate-900 dark:bg-blue-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all"
          >
            View Details
          </button>
          
          {!isProvider && (booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
             <button 
               onClick={onCancelRequest}
               disabled={isCancelling}
               className="px-6 py-4 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-black text-xs rounded-2xl transition-all active:scale-95 border border-red-100 disabled:opacity-50"
             >
               {isCancelling ? '...' : 'Cancel'}
             </button>
          )}

          {isProvider && booking.status === 'PENDING' && (
            <div className="flex gap-2">
              <button 
                onClick={() => onUpdateStatus('CONFIRMED')}
                disabled={isCancelling}
                className="px-4 py-4 bg-green-50 hover:bg-green-600 hover:text-white text-green-600 font-black text-xs rounded-2xl transition-all active:scale-95 border border-green-100 disabled:opacity-50"
              >
                Accept
              </button>
              <button 
                onClick={() => onUpdateStatus('REJECTED')}
                disabled={isCancelling}
                className="px-4 py-4 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-black text-xs rounded-2xl transition-all active:scale-95 border border-red-100 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}

          {(!isProvider && (booking.status === 'COMPLETED' || booking.status === 'CANCELLED' || booking.status === 'REJECTED')) && (
            <button 
              onClick={() => window.location.href = `/service/${booking.serviceId}`}
              className="px-6 py-4 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-black text-xs rounded-2xl transition-all active:scale-95 border border-blue-100"
            >
              Re-book
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

