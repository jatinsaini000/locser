import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Bell, Search, SlidersHorizontal, Star, ShieldCheck, Clock, Award, ChevronRight } from 'lucide-react';
import api from '../api';
import { formatPrice } from '../utils/currency';

const DEFAULT_SERVICE_IMAGE = '/service-placeholder.svg';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/categories').then(r => r.data).catch(() => ({ data: [] })),
      api.get('/services').then(r => r.data).catch(() => ({ data: [] }))
    ]).then(([catRes, servRes]) => {
      setCategories(catRes?.data || []);
      setServices(servRes?.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/hero-bg.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
            Professional services, <br />
            <span className="text-blue-400">at your doorstep.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-xl font-medium">
            Book top-rated professionals for cleaning, plumbing, tutoring, and more. 
            Trusted by over 10,000+ happy customers.
          </p>

          {/* Large Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What service do you need today?"
              className="w-full pl-16 pr-32 py-5 md:py-6 bg-white rounded-2xl shadow-2xl shadow-blue-900/20 text-slate-900 text-lg focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 hidden md:block"
            >
              Search
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="text-slate-300 text-sm font-medium">Popular:</span>
            {['Deep Cleaning', 'Electrician', 'AC Repair', 'Yoga Trainer'].map(item => (
              <button key={item} className="text-sm font-bold text-white hover:text-blue-400 transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">100% Verified</p>
              <p className="text-xs text-slate-500">Service providers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">On-time</p>
              <p className="text-xs text-slate-500">Service guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">4.8+ Rating</p>
              <p className="text-xs text-slate-500">Avg. customer rating</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Premium Quality</p>
              <p className="text-xs text-slate-500">Top notch experience</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-24 pt-12">
        {/* Categories Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between px-6 md:px-12 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Browse Categories</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Find exactly what you're looking for</p>
            </div>
            <button className="flex items-center gap-2 group text-blue-600 font-bold hover:gap-3 transition-all">
              <span>View All</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex overflow-x-auto px-6 md:px-12 gap-6 hide-scrollbar pb-4">
            {categories.map(category => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Services */}
        <section className="px-6 md:px-12 mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Recommended for you</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Top rated professionals in Chandigarh based on your location</p>
            </div>
            <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md hover:bg-slate-50">
              <SlidersHorizontal className="w-5 h-5 text-slate-500" />
              <span className="font-bold text-slate-700 dark:text-slate-200">Refine Search</span>
            </button>
          </div>

          {/* Service Feed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {services.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onClick={() => navigate(`/service/${service.id}`)} 
              />
            ))}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-slate-900 dark:bg-slate-950 py-24 px-6 md:px-12 relative overflow-hidden">
           {/* Decorative Elements */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>

           <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16">
                 <h2 className="text-blue-400 font-black uppercase tracking-widest text-sm mb-4">Why Locser?</h2>
                 <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight">The most trusted way to <br/> get things done.</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   {
                     icon: <ShieldCheck className="w-10 h-10 text-blue-400" />,
                     title: "Verified Professionals",
                     desc: "Every service provider undergoes a rigorous 4-step identity and background verification process."
                   },
                   {
                     icon: <Award className="w-10 h-10 text-blue-400" />,
                     title: "Quality Guaranteed",
                     desc: "If you're not happy with the service, we'll re-do it for free. Our goal is 100% satisfaction."
                   },
                   {
                     icon: <Clock className="w-10 h-10 text-blue-400" />,
                     title: "On-Time Service",
                     desc: "We value your time. If our professional is late, you get an instant discount on your booking."
                   }
                 ].map((item, i) => (
                   <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/10 transition-all group">
                      <div className="mb-6 group-hover:scale-110 transition-transform duration-500">
                         {item.icon}
                      </div>
                      <h4 className="text-xl font-black text-white mb-4 tracking-tight">{item.title}</h4>
                      <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}

function CategoryItem({ category }) {
  const getImageUrl = (name) => {
    const images = {
      'plumbing': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=150&h=150&q=80',
      'cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=150&h=150&q=80',
      'tutoring': 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=150&h=150&q=80',
      'training': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=150&h=150&q=80',
      'electric': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=150&h=150&q=80',
      'moving': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=150&h=150&q=80',
      'landscaping': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=150&h=150&q=80',
      'tech support': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=150&h=150&q=80',
      'pet care': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=150&h=150&q=80',
      'handyman': 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&w=150&h=150&q=80',
    };
    return images[name.toLowerCase()] || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=150`;
  };

  return (
    <button className="group flex flex-col items-center gap-4 min-w-[100px] md:min-w-[120px]">
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center border-2 border-transparent group-hover:border-blue-600 shadow-sm group-hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2">
        <img 
          src={getImageUrl(category.name)} 
          alt={category.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=random&size=150`;
          }}
        />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-wide">{category.name}</span>
    </button>
  );
}

function ServiceCard({ service, onClick }) {
  const imageSrc = service.imageUrl || DEFAULT_SERVICE_IMAGE;

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:-translate-y-2">
      <button className="w-full text-left relative h-60 block overflow-hidden shrink-0" onClick={onClick}>
        <img 
          src={imageSrc}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt={service.title} 
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_SERVICE_IMAGE;
          }}
        />
        <div className="absolute top-4 left-4">
           <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
              Verified
           </div>
        </div>
        <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-1.5 px-3 rounded-2xl flex items-center gap-1.5 shadow-xl">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-black text-slate-900 dark:text-white">{(service.provider.rating || 0).toFixed(1)}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
           <span className="text-white font-bold flex items-center gap-2">
              View Details <ChevronRight className="w-4 h-4" />
           </span>
        </div>
      </button>
      
      <div className="p-6 flex flex-col flex-1">
        <button className="w-full text-left flex-1" onClick={onClick}>
          <div className="flex justify-between items-start mb-4 gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-xl leading-tight text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">{service.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2 font-medium">{service.subtitle}</p>
            </div>
          </div>
        </button>
        
        <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-blue-600 dark:text-blue-400 font-black text-2xl tracking-tighter">{formatPrice(service.price)}</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">/hr</span>
            </div>
          </div>
          <button 
            className="px-6 bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-500 transition-all duration-300 py-3 rounded-2xl flex justify-center items-center text-white font-black shadow-lg shadow-slate-900/20 active:scale-95"
            onClick={onClick}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

