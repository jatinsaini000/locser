import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, ExternalLink, Star, MessageSquare, Clock, ShieldCheck, ArrowUpRight, PlusCircle, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { formatPrice } from '../utils/currency';

export default function MyListings() {
  const { user, appMode } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/provider/services');
      if (res.data.success) {
        setListings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appMode === 'provider' && user) {
      fetchListings();
    }
  }, [appMode, user]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      let res;
      if (editingService) {
        res = await api.put(`/services/${editingService.id}`, data);
      } else {
        res = await api.post('/services', data);
      }
      
      if (res.data.success) {
        setIsModalOpen(false);
        fetchListings();
        alert(editingService ? 'Service updated!' : 'Service created!');
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/services/${id}`);
      if (res.data.success) {
        setDeleteConfirmId(null);
        fetchListings();
      }
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (appMode !== 'provider') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <ShieldCheck className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Provider Mode Required</h2>
        <p className="text-slate-500 mt-2">Please switch to Provider mode to manage your listings.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Header Section */}
      <div className="px-6 md:px-12 pt-10 pb-10 bg-white dark:bg-slate-900 sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">My Listings</h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Manage and grow your service business</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" /> List New Service
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {[
            { label: 'Total Services', value: listings.length, icon: <Search className="w-4 h-4" /> },
            { label: 'Active Bookings', value: '12', icon: <Clock className="w-4 h-4" /> },
            { label: 'Avg Rating', value: '4.8', icon: <Star className="w-4 h-4" /> },
            { label: 'Earnings', value: '$1,240', icon: <ShieldCheck className="w-4 h-4" /> },
          ].map((stat, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {stat.icon} {stat.label}
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-12 py-10 pb-32">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-bold text-slate-500">Loading your services...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
               <PlusCircle className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No services listed yet</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xs mb-4 text-sm uppercase tracking-widest">Start by adding your first professional service to the platform.</p>
            <p className="text-[10px] text-slate-400 mb-10">Logged in as: {user?.email} (ID: {user?.id?.substring(0,8)}...)</p>
            <button 
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              List Your First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((svc) => (
              <ListingCard 
                key={svc.id} 
                service={svc} 
                onEdit={() => handleOpenEdit(svc)}
                onDelete={() => setDeleteConfirmId(svc.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in transition-all">
          <div className="bg-white dark:bg-slate-800 rounded-t-[3rem] md:rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-0 md:zoom-in-95 border border-white dark:border-slate-700">
            <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {editingService ? 'Edit Service' : 'Create Professional Service'}
                </h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Provide detailed information to attract customers</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full flex items-center justify-center transition-all group"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-300 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Service Title</label>
                  <input required name="title" defaultValue={editingService?.title} type="text" placeholder="e.g. Premium Home Deep Cleaning" className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select required name="categoryId" defaultValue={editingService?.categoryId || 'c1'} className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold appearance-none">
                      <option value="c1">Cleaning</option>
                      <option value="c2">Plumbing</option>
                      <option value="c3">Tutoring</option>
                      <option value="c4">Electrical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Service Duration</label>
                    <input required name="duration" defaultValue={editingService?.duration} type="text" placeholder="e.g. 2 Hours" className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hourly Price (USD)</label>
                    <input required name="price" defaultValue={editingService?.price} type="number" placeholder="e.g. 45" className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">What's Included (one per line)</label>
                    <textarea name="includes" defaultValue={editingService?.includes} rows="2" placeholder="e.g. Professional cleaning&#10;Equipment provided" className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold"></textarea>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Service Requirements</label>
                  <input name="requirements" defaultValue={editingService?.requirements} type="text" placeholder="e.g. Need access to water and electricity" className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Short Subtitle</label>
                  <input name="subtitle" defaultValue={editingService?.subtitle} type="text" placeholder="e.g. Professional equipment, 5-star service guaranteed" className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                  <textarea name="description" defaultValue={editingService?.description} rows="4" placeholder="Explain what makes your service stand out..." className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold"></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Service Hero Image URL</label>
                  <input name="imageUrl" defaultValue={editingService?.imageUrl} type="text" placeholder="https://images.unsplash.com/..." className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold" />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? 'Saving...' : (editingService ? 'Save Changes' : 'Publish Service Listing')}
                  {!isSubmitting && <Plus className="w-6 h-6" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-700 text-center animate-in zoom-in-95">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Delete Listing?</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">This action cannot be undone. All data associated with this service will be permanently removed.</p>
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={() => handleDelete(deleteConfirmId)}
                   className="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
                 >
                   Yes, Delete Forever
                 </button>
                 <button 
                   onClick={() => setDeleteConfirmId(null)}
                   className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl transition-all hover:bg-slate-200"
                 >
                   Cancel
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function ListingCard({ service, onEdit, onDelete }) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={service.imageUrl || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"} 
          alt={service.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute top-4 right-4 flex gap-2">
           <button 
             onClick={onEdit}
             className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all active:scale-90"
           >
              <Edit2 className="w-4 h-4" />
           </button>
           <button 
             onClick={onDelete}
             className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all active:scale-90 hover:text-red-400"
           >
              <Trash2 className="w-4 h-4" />
           </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
           <div className="flex justify-between items-end">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg mb-2">Active</span>
                <h3 className="text-xl font-black text-white leading-tight tracking-tight">{service.title}</h3>
              </div>
              <div className="text-right">
                 <div className="text-2xl font-black text-white">{formatPrice(service.price)}</div>
                 <div className="text-[10px] font-bold text-white/60 uppercase">per hour</div>
              </div>
           </div>
        </div>
      </div>

      <div className="p-8">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold line-clamp-2 mb-6 leading-relaxed">
          {service.description || "No description provided for this professional service listing."}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bookings</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">12</span>
             </div>
             <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-700"></div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Views</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">248</span>
             </div>
          </div>
          
          <button className="flex items-center gap-2 text-blue-600 font-black text-sm hover:gap-3 transition-all group/btn">
             View Public Page <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
