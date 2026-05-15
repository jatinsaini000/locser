import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Search as SearchIcon, ChevronDown, History, X, Star } from 'lucide-react';
import api from '../api';
import { formatPrice } from '../utils/currency';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['Emergency Plumber', 'House Cleaning']);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data?.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // First try fetching all services
      api.get('/services')
        .then(res => {
          let allServices = res.data?.data || [];
          if (query) {
             const lowerQuery = query.toLowerCase();
             allServices = allServices.filter(s => 
               s.title?.toLowerCase().includes(lowerQuery) || 
               s.description?.toLowerCase().includes(lowerQuery)
             );
          }
          setResults(allServices);
        })
        .catch(console.error);
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleRecentSearchClick = (searchItem) => {
    setQuery(searchItem);
  };

  const removeRecentSearch = (e, itemToRemove) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(item => item !== itemToRemove));
  };

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 pt-8 md:pt-12 min-h-screen transition-colors duration-200">
      {/* Header & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-800 z-10 transition-colors duration-200 border-b border-transparent dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Find Services</h1>
          </div>
          <button className="hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors">
            <SlidersHorizontal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </button>
        </div>
        <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-xl px-4 py-3 transition-colors">
          <SearchIcon className="w-6 h-6 text-slate-400 dark:text-slate-400 mr-3" />
          <input 
            type="text"
            className="flex-1 bg-transparent border-none text-base text-slate-900 dark:text-white outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400" 
            placeholder="Plumbing, cleaning, AC repair..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="pb-24">
        {/* Filter Pills */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar">
          <button className="flex items-center gap-1 bg-blue-600 dark:bg-blue-600 px-4 py-2 rounded-full h-9 justify-center min-w-max transition-colors">
            <span className="text-white text-sm font-medium">Price: Any</span>
            <ChevronDown className="w-4 h-4 text-white" />
          </button>
          <button className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-full h-9 justify-center min-w-max border border-transparent dark:border-slate-700 transition-colors">
            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Rating: 4.5+</span>
            <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-400" />
          </button>
          <button className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-full h-9 justify-center min-w-max border border-transparent dark:border-slate-700 transition-colors">
            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Distance</span>
            <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-400" />
          </button>
        </div>

        {/* Recent Searches */}
        {!query && recentSearches.length > 0 && (
          <div className="mt-6 px-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Searches</h2>
              <button onClick={() => setRecentSearches([])}>
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Clear All</span>
              </button>
            </div>
            <div className="flex flex-col">
              {recentSearches.map((searchItem, idx) => (
                <button 
                  key={searchItem}
                  onClick={() => handleRecentSearchClick(searchItem)}
                  className={`flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${idx !== 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">{searchItem}</span>
                  </div>
                  <X className="w-5 h-5 text-slate-400" onClick={(e) => removeRecentSearch(e, searchItem)} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results / Recommended */}
        <div className="mt-8 px-4 md:px-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            {query ? 'Search Results' : 'Recommended for You'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map(service => (
              <RecommendationCard 
                key={service.id}
                service={service}
                onClick={() => navigate(`/service/${service.id}`)}
              />
            ))}
            {results.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8 col-span-full">No services found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ service, onClick }) {
  return (
    <button onClick={onClick} className="group bg-white dark:bg-slate-800 text-left rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 dark:border-slate-700 p-5 flex gap-5 w-full transition-all duration-300 hover:-translate-y-1">
      <img 
        src={service.imageUrl} 
        referrerPolicy="no-referrer"
        className="w-28 h-28 md:w-32 md:h-32 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform duration-500" 
        alt={service.title} 
        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80"; }}
      />
      <div className="flex flex-col justify-between flex-1 py-1">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{service.title}</h3>
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-slate-200">
              {service.provider.rating} <span className="font-medium text-slate-500 dark:text-slate-400">({service.provider.reviewCount} reviews)</span>
            </span>
          </div>
        </div>
        <div className="flex justify-between items-end mt-3">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Starting at</span>
            <span className="text-blue-600 dark:text-blue-400 font-black text-xl">{formatPrice(service.price)}</span>
          </div>
          <div className="bg-slate-900 dark:bg-slate-700 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-md shadow-slate-900/20 group-hover:shadow-blue-600/30 transition-all duration-300">
            Book
          </div>
        </div>
      </div>
    </button>
  );
}
