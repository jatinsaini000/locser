import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, DollarSign, ArrowRight, ShieldCheck, Download, Calendar } from 'lucide-react';
import api from '../api';
import { formatPrice } from '../utils/currency';

export default function Earnings() {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/provider/earnings')
      .then(res => {
        setEarningsData(res.data?.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch earnings:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!earningsData) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Failed to load earnings data.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Earnings Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold">Track your revenue and platform deductions.</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 shadow-xl shadow-blue-600/20 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <p className="text-blue-100 font-bold text-sm uppercase tracking-widest mb-1">Net Earnings</p>
            <h2 className="text-4xl font-black">{formatPrice(earningsData.netEarnings)}</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-slate-700/50">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest mb-1">Total Revenue</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{formatPrice(earningsData.totalEarned)}</h2>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-slate-700/50">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
            <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest mb-1">Deductions (Taxes & Fees)</p>
          <h2 className="text-3xl font-black text-red-600 dark:text-red-400">-{formatPrice(earningsData.platformFee + earningsData.tax)}</h2>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-slate-700/50">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" /> Financial Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-600 dark:text-slate-300">Total Bookings Revenue</span>
              <span className="font-black text-slate-900 dark:text-white">{formatPrice(earningsData.totalEarned)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
              <span className="font-bold text-slate-600 dark:text-slate-400">Platform Fee (10%)</span>
              <span className="font-black text-red-600 dark:text-red-400">-{formatPrice(earningsData.platformFee)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30">
              <span className="font-bold text-slate-600 dark:text-slate-400">Local Tax (5%)</span>
              <span className="font-black text-orange-600 dark:text-orange-400">-{formatPrice(earningsData.tax)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <span className="font-bold text-blue-800 dark:text-blue-300">Final Payout Amount</span>
              <span className="font-black text-blue-700 dark:text-blue-400 text-xl">{formatPrice(earningsData.netEarnings)}</span>
            </div>
          </div>
          
          <button className="w-full mt-6 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95">
             <Download className="w-5 h-5" /> Download Tax Report
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" /> Recent Transactions
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {earningsData.bookings.length > 0 ? (
              earningsData.bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{booking.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{new Date(booking.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600 dark:text-green-400">+{formatPrice(booking.amount)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Completed</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-500 font-bold">No completed bookings yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
