import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Star, MessageCircle, Phone, ShieldCheck, CheckCircle2, Info, Award, UserCheck } from 'lucide-react';
import api from '../api';
import { formatPrice } from '../utils/currency';

const DEFAULT_SERVICE_IMAGE = '/service-placeholder.svg';
const DEFAULT_AVATAR_IMAGE = '/avatar-placeholder.svg';

const generateMumbaiDates = () => {
  const dates = [];
  const now = new Date();
  
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: '2-digit'
    });
    
    const parts = formatter.formatToParts(d);
    const dayName = parts.find(p => p.type === 'weekday').value;
    const dateNum = parts.find(p => p.type === 'day').value;
    
    dates.push({ day: dayName, date: dateNum });
  }
  return dates;
};

const DATES = generateMumbaiDates();

const TIME_SLOTS = [
  "09:00 - 10:00 AM",
  "10:00 - 11:00 AM",
  "11:00 - 12:00 PM",
  "12:00 - 01:00 PM",
  "01:00 - 02:00 PM",
  "02:00 - 03:00 PM",
  "03:00 - 04:00 PM",
  "04:00 - 05:00 PM"
];

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(DATES[0].date);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/services/${id}`)
      .then(res => {
        setService(res.data?.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (service) {
      api.get(`/bookings/slots?serviceId=${service.id}&bookingDate=${selectedDate}`)
        .then(res => {
          if (res.data?.success) {
            const slots = res.data.bookedSlots || [];
            setBookedSlots(slots);
            if (slots.includes(selectedTime)) {
              const firstFree = TIME_SLOTS.find(t => !slots.includes(t));
              if (firstFree) setSelectedTime(firstFree);
            }
          }
        })
        .catch(console.error);
    }
  }, [selectedDate, service, selectedTime]);

  if (loading) {
    return <div className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!service) {
    return (
      <div className="flex-1 bg-white dark:bg-slate-900 flex flex-col items-center justify-center min-h-screen transition-colors duration-200">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Service Not Found</h2>
        <button onClick={() => navigate(-1)} className="bg-blue-600 px-6 py-3 rounded-xl text-white font-bold hover:bg-blue-700 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const serviceFee = service.price;
  const taxesAndFees = serviceFee * 0.15;
  const totalPrice = serviceFee + taxesAndFees;

  const handleMessageProvider = () => {
    if (!service) return;
    const payload = {
      id: service.provider.id,
      senderName: service.provider.name,
      senderAvatar: service.provider.avatarUrl,
      lastMessage: 'Chat started',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    api.post('/messages', payload)
      .then(() => {
        navigate(`/messages?chatId=${service.provider.id}`);
      })
      .catch(console.error);
  };

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-900 min-h-screen pb-20 md:pb-12 relative transition-colors duration-200">
      {/* Header Nav */}
      <div className="flex items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 md:px-8 justify-between border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200 h-20">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90">
          <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-slate-900 dark:text-white text-lg font-black tracking-tight flex-1 text-center truncate px-2">
          {service.title}
        </h1>
        <button className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90">
          <Share className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 max-w-7xl mx-auto w-full px-4 md:px-8">
        {/* Left Column (Main Content) */}
        <div className="flex-1 md:pr-12 md:py-10">
          {/* Hero Image */}
          <div className="relative w-full h-[300px] md:h-[450px] md:rounded-[2.5rem] overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-2xl">
            <img 
              src={service.imageUrl || DEFAULT_SERVICE_IMAGE}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              alt={service.title}
            />
            <div className="absolute top-6 left-6">
               <div className="bg-blue-600/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Service
               </div>
            </div>
          </div>

          {/* Service Title & Stats */}
          <div className="pt-8 mb-10">
            <div className="flex items-center gap-2 mb-4">
               <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Top Rated in Chandigarh
               </span>
               <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  <span>{(service.provider.rating || 0).toFixed(1)}</span>
                  <span className="text-slate-400 font-medium">({service.provider.reviewCount} reviews)</span>
               </div>
            </div>
            <h2 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tighter mb-6">
              {service.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Satisfaction Guarantee Block */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 md:p-10 mb-12 shadow-xl shadow-blue-600/20 text-white relative overflow-hidden">
             <Award className="absolute -right-6 -bottom-6 w-48 h-48 text-white/10 rotate-12" />
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                   <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <div>
                   <h3 className="text-2xl font-black mb-2 tracking-tight">The Locser Promise</h3>
                   <p className="text-blue-100 text-lg font-medium">If you're not 100% satisfied with the quality of service, we will send another professional to fix it for free. Your happiness is our top priority.</p>
                </div>
             </div>
          </div>

          {/* Provider Card */}
          <section className="mb-12">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 tracking-tight uppercase tracking-widest">About the Professional</h3>
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center gap-8 transition-all hover:shadow-xl">
              <div className="relative">
                <img 
                  src={service.provider.avatarUrl || DEFAULT_AVATAR_IMAGE}
                  className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white dark:border-slate-700 shadow-xl object-cover"
                  alt={service.provider.name}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white dark:border-slate-800 w-8 h-8 rounded-full"></div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{service.provider.name}</span>
                  {service.provider.isCertified && (
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter self-center">
                      <Award className="w-3 h-3" />
                      Elite Provider
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">Expert in {service.title.toLowerCase()} with over 5 years of professional experience in Chandigarh and surrounding regions.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Background Checked
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <UserCheck className="w-5 h-5 text-green-500" />
                    Identity Verified
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                 <button 
                  onClick={handleMessageProvider}
                  className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-slate-700 text-white font-black hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat Now
                </button>
                <button className="w-full py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call Now
                </button>
              </div>
            </div>
          </section>

          {/* What's Included */}
          <section className="mb-12">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 tracking-tight uppercase tracking-widest">What's Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {(service.includes ? service.includes.split('\n') : [
                 'Professional grade tools & equipment',
                 'Experienced & background checked professional',
                 '100% Satisfaction guarantee',
                 'Fixed & transparent pricing',
                 'Post-service cleaning & cleanup',
                 'Customer support assistance'
               ]).map((item, i) => (
                 <div key={i} className="flex items-start gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="mt-1">
                       <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">{item}</span>
                 </div>
               ))}
            </div>
          </section>

          {/* Requirements */}
          {service.requirements && (
            <section className="mb-12">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 tracking-tight uppercase tracking-widest">Service Requirements</h3>
              <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-[2rem] flex items-start gap-4">
                 <Info className="w-6 h-6 text-amber-600 shrink-0" />
                 <p className="text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{service.requirements}</p>
              </div>
            </section>
          )}
        </div>

        {/* Right Column (Booking Widget) */}
        <div className="w-full md:w-[400px] lg:w-[450px] md:py-10">
          <div className="md:sticky md:top-28 bg-white dark:bg-slate-800 md:rounded-[2.5rem] md:border border-slate-200 dark:border-slate-700 md:shadow-2xl md:p-8 mb-8 transition-colors duration-200 overflow-hidden relative">
            {/* Top Highlight */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600"></div>

            <h3 className="text-slate-900 dark:text-white text-3xl font-black mb-8 tracking-tight hidden md:block">Schedule Service</h3>
            
            {/* Selection Tabs */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-2xl mb-10">
              <button className="flex-1 py-3 rounded-xl bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400 text-sm font-black transition-all">
                One-time Service
              </button>
              <button className="flex-1 py-3 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all">
                Subscribe & Save
              </button>
            </div>

            {/* Schedule Options */}
            <div className="space-y-10 mb-10">
              <div>
                <div className="flex items-center justify-between mb-4">
                   <h4 className="text-slate-900 dark:text-white text-sm font-black uppercase tracking-widest">Select Date</h4>
                   <span className="text-blue-600 text-[10px] font-black uppercase">Mumbai Time</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {DATES.map((d) => {
                    const isSelected = selectedDate === d.date;
                    return (
                      <button 
                        key={d.date}
                        onClick={() => setSelectedDate(d.date)}
                        className={`flex flex-col items-center justify-center min-w-[80px] py-4 rounded-[1.5rem] border-2 transition-all shrink-0
                          ${isSelected ? 'border-blue-600 bg-blue-600 text-white scale-105 shadow-xl shadow-blue-600/30' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-200'}
                        `}
                      >
                        <span className={`text-[10px] font-black uppercase mb-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{d.day}</span>
                        <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{d.date}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-slate-900 dark:text-white text-sm font-black uppercase tracking-widest">Available Slots</h4>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                     <Info className="w-3 h-3" />
                     <span>{service.duration || '1 hr'} duration</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {TIME_SLOTS.map((t) => {
                    const isSelected = selectedTime === t;
                    const isBooked = bookedSlots.includes(t);
                    return (
                      <button 
                        key={t} 
                        disabled={isBooked}
                        onClick={() => setSelectedTime(t)}
                        className={`py-4 px-2 border-2 rounded-2xl items-center justify-center transition-all
                          ${isSelected && !isBooked ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-lg shadow-blue-600/10' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'}
                          ${isBooked ? 'opacity-30 line-through cursor-not-allowed grayscale' : 'hover:border-blue-200 dark:hover:border-blue-600'}
                        `}
                      >
                        <span className={`text-sm font-black text-center block
                          ${isSelected && !isBooked ? 'text-blue-600 dark:text-blue-400' : (isBooked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300')}
                        `}>
                          {t}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-700 mb-10 transition-colors duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 dark:text-slate-400 font-bold">Base Service Fee</span>
                <span className="text-slate-900 dark:text-white font-black">{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 dark:text-slate-400 font-bold">Taxes & Insurance</span>
                <span className="text-slate-900 dark:text-white font-black">{formatPrice(taxesAndFees)}</span>
              </div>
              <div className="h-[2px] bg-slate-200 dark:bg-slate-700 mb-6 border-dashed" />
              <div className="flex justify-between items-end">
                <div>
                   <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest block mb-1">Total Amount</span>
                   <span className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter">Total Payable</span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-4xl font-black tracking-tighter">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <button 
                className="w-full bg-slate-900 dark:bg-blue-600 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] transition-all duration-500 text-white font-black text-xl tracking-tight"
                onClick={() => navigate(`/booking/${service.id}?date=${selectedDate}&time=${selectedTime}&totalPrice=${totalPrice}`)}
              >
                Book This Professional
              </button>
              <p className="text-center text-slate-400 text-xs font-bold mt-6 flex items-center justify-center gap-1.5 uppercase tracking-widest">
                 <ShieldCheck className="w-3 h-3" />
                 Secure Checkout & Encryption
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile CTA */}
      <div className="md:hidden fixed bottom-0 w-full p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-50 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4 px-2">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase">Total Payable</p>
              <p className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter">{formatPrice(totalPrice)}</p>
           </div>
           <p className="text-blue-600 font-black text-sm">{selectedDate} Oct, {selectedTime.split(' - ')[0]}</p>
        </div>
        <button 
          className="w-full bg-blue-600 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 text-white font-black text-lg transition-all active:scale-95"
          onClick={() => navigate(`/booking/${service.id}?date=${selectedDate}&time=${selectedTime}&totalPrice=${totalPrice}`)}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

