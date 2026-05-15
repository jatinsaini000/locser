import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar as Event, MapPin as LocationPin, CreditCard, Lock, Verified } from 'lucide-react';
import api from '../api';
import { formatPrice } from '../utils/currency';
import { useAuth } from '../context/AuthContext';

export default function BookingFlow() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const passedPrice = searchParams.get('totalPrice');

  const [service, setService] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    api.get(`/services/${id}`)
      .then(res => setService(res.data?.data))
      .catch(console.error);
  }, [id]);

  const title = service ? service.title : "Loading...";
  const subtitle = service ? service.subtitle : "Loading...";
  const image = service ? service.imageUrl : "";
  const serviceFee = service ? service.price : 0;
  
  const platformFee = service ? 8.50 : 0;
  const tax = service ? serviceFee * 0.10 : 0;
  const totalPrice = passedPrice ? parseFloat(passedPrice) : (serviceFee + platformFee + tax);

  const [currentLocation, setCurrentLocation] = useState('Not Specified');

  useEffect(() => {
    const savedLoc = localStorage.getItem('locser_current_location');
    if (savedLoc) {
      setCurrentLocation(savedLoc);
    }
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await api.post('/bookings', {
        serviceId: id,
        bookingDate: date || 'ASAP',
        timeSlot: time || 'Morning',
        totalPrice,
        location: currentLocation
      });
      
      if (res.data?.success) {
        setShowSuccess(true);
      } else {
        alert(`Booking failed: ${res.data?.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    setShowSuccess(false);
    navigate('/bookings');
  };

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 relative transition-colors duration-200">
      {/* Top Navigation */}
      <div className="flex items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 transition-colors duration-200">
        <button 
          className="p-2 justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-slate-900 dark:text-white text-lg font-bold flex-1 text-center mr-10">
          Review and Pay
        </h1>
      </div>

      <div className="flex flex-col md:flex-row flex-1 max-w-7xl mx-auto w-full md:px-8 md:py-8 gap-8 mb-32 md:mb-0">
        
        {/* Left Column (Payment & Schedule Details) */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* Booking Summary Header */}
          <div className="px-5 md:px-0 pt-6 pb-3">
            <h2 className="text-slate-900 dark:text-white tracking-tight text-3xl font-black">Checkout</h2>
            <p className="text-slate-500 dark:text-slate-400 text-base mt-1">Review your service details before paying.</p>
          </div>

          {/* Schedule & Location */}
          <div className="px-5 md:px-0 flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-5 bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 shrink-0 border border-transparent dark:border-blue-900/50">
                <Event className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">Schedule</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{date ? `${date}, ${time}` : 'Select a date'}</span>
              </div>
              <button className="hover:bg-blue-50 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">Edit</span>
              </button>
            </div>

            <div className="flex items-center gap-5 bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 shrink-0 border border-transparent dark:border-blue-900/50">
                <LocationPin className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">Location</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{currentLocation}</span>
              </div>
              <button className="hover:bg-blue-50 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">Edit</span>
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="px-5 md:px-0 pt-8 pb-8">
            <h3 className="text-slate-900 dark:text-white tracking-tight text-xl font-bold mb-5">Payment Method</h3>
            <div className="flex flex-col gap-4">
              <button 
                className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 shadow-sm transition-all duration-300 ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]' : 'border-transparent dark:border-slate-700/50 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600'}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center gap-5 text-left">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${paymentMethod === 'card' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600'}`}>
                    <CreditCard className={`w-7 h-7 ${paymentMethod === 'card' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                  </div>
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold text-lg tracking-tight mb-0.5">Credit / Debit Card</div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">•••• •••• •••• 4242</div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'card' ? 'border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                  {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-blue-600 transition-transform" />}
                </div>
              </button>

              <button 
                className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 shadow-sm transition-all duration-300 ${paymentMethod === 'apple' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]' : 'border-transparent dark:border-slate-700/50 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600'}`}
                onClick={() => setPaymentMethod('apple')}
              >
                <div className="flex items-center gap-5 text-left">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${paymentMethod === 'apple' ? 'bg-black dark:bg-white' : 'bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600'}`}>
                    <span className={`font-black text-lg ${paymentMethod === 'apple' ? "text-white dark:text-black" : "text-slate-500 dark:text-slate-400"}`}>Pay</span>
                  </div>
                  <div className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">Apple Pay</div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'apple' ? 'border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                  {paymentMethod === 'apple' && <div className="w-3 h-3 rounded-full bg-blue-600 transition-transform" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Order Summary & CTA) */}
        <div className="w-full md:w-[450px] lg:w-[500px] px-5 md:px-0">
          <div className="md:sticky md:top-24 flex flex-col gap-6">
            <h3 className="hidden md:block text-slate-900 dark:text-white tracking-tight text-xl font-bold">Order Summary</h3>
            
            {/* Service Card Mini */}
            <div className="flex gap-5 rounded-[1.5rem] bg-white dark:bg-slate-800 p-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
              {image && (
                <img 
                  src={image}
                  className="w-28 h-28 rounded-xl object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                  alt={title}
                />
              )}
              <div className="flex-1 flex flex-col justify-center gap-1.5">
                <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 self-start px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/50">Service Details</span>
                <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight line-clamp-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-normal line-clamp-1">{subtitle}</p>
              </div>
            </div>

            {/* Pricing Table */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4 transition-colors duration-200">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Service Fee</span>
                <span className="text-slate-900 dark:text-white font-bold tracking-tight">{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Platform Fee</span>
                <span className="text-slate-900 dark:text-white font-bold tracking-tight">{formatPrice(platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Local Tax</span>
                <span className="text-slate-900 dark:text-white font-bold tracking-tight">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between pt-5 border-t border-slate-200 dark:border-slate-700 border-dashed mt-2">
                <span className="text-slate-900 dark:text-white text-xl font-black tracking-tight">Total Price</span>
                <span className="text-blue-600 dark:text-blue-400 text-2xl font-black tracking-tight">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Desktop Confirm Button */}
            <div className="hidden md:flex flex-col items-center">
              <button 
                className="w-full bg-blue-600 h-16 rounded-[1.25rem] flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all duration-300 disabled:opacity-70 hover:-translate-y-1"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="text-white font-bold text-lg">Processing...</span>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-lg">Confirm & Pay</span>
                  </>
                )}
              </button>
              <span className="text-center text-xs text-slate-500 dark:text-slate-400 font-semibold mt-4 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Payments are secured and encrypted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Button */}
      <div className="md:hidden fixed bottom-0 w-full p-6 pb-8 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur flex flex-col items-center z-20 transition-colors duration-200">
        <button 
          className="w-full bg-blue-600 h-16 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/40 hover:bg-blue-700 transition-colors disabled:opacity-70"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="text-white font-bold text-lg">Processing...</span>
          ) : (
            <>
              <Lock className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">Confirm Payment</span>
            </>
          )}
        </button>
        <span className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium mt-4 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Secured and encrypted
        </span>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 px-8 pt-10 pb-12 rounded-t-[40px] shadow-2xl w-full max-w-md flex flex-col items-center animate-in slide-in-from-bottom-full duration-300">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white dark:border-slate-800 -mt-20 transition-colors">
              <Verified className="w-14 h-14 text-green-600 dark:text-green-500" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight text-center mb-3">Booking Confirmed!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center text-base mb-10 leading-relaxed px-4">
              Your service with {title} is successfully scheduled. A receipt has been sent to your email.
            </p>
            <button 
              className="w-full bg-slate-900 dark:bg-blue-600 h-16 rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-transform hover:bg-slate-800 dark:hover:bg-blue-700"
              onClick={handleFinish}
            >
              <span className="text-white font-bold text-lg">View My Bookings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
