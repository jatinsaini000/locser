import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, ShieldCheck, ArrowRight, Briefcase } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/signup', { fullName, email, password, role });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Account creation failed. Please try again.');
    }
  };

  const handleGoogleSuccess = async (response) => {
    setError('');
    try {
      const res = await api.post('/auth/google', { credential: response.credential });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.png" 
          alt="Background" 
          className="w-full h-full object-cover scale-110 blur-2xl opacity-60 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-transparent to-blue-900/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Information */}
        <div className="hidden lg:flex flex-col gap-10">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30">
                 <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Locser</h1>
           </div>
           
           <div className="space-y-6">
              <h2 className="text-5xl xl:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
                 Start your journey <br />
                 <span className="text-blue-600">today.</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-md">
                 Whether you're looking for help or looking to provide it, you're in the right place.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-6 pt-6 max-w-md">
              <div className="p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/50 dark:border-slate-700/50">
                 <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                 </div>
                 <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">Secure</h4>
                 <p className="text-xs text-slate-500 font-bold">Encrypted data protection</p>
              </div>
              <div className="p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/50 dark:border-slate-700/50">
                 <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-blue-600" />
                 </div>
                 <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">Verified</h4>
                 <p className="text-xs text-slate-500 font-bold">Trusted local community</p>
              </div>
           </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="w-full max-w-lg mx-auto lg:mx-0">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-white/50 dark:border-slate-700/50 relative overflow-hidden group">
            <div className="relative z-10">
               <div className="mb-8">
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Create Account</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">Join our community</p>
               </div>
               

               {error && (
                 <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl font-bold text-xs flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    {error}
                 </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                   <div className="relative group">
                     <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                     <input 
                       value={fullName}
                       onChange={e => setFullName(e.target.value)}
                       className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300" 
                       placeholder="Enter your name" 
                       type="text"
                       required
                     />
                   </div>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                   <div className="relative group">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                     <input 
                       value={email}
                       onChange={e => setEmail(e.target.value)}
                       className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300" 
                       placeholder="name@example.com" 
                       type="email"
                       required
                     />
                   </div>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                   <div className="relative group">
                     <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                     <input 
                       value={password}
                       onChange={e => setPassword(e.target.value)}
                       className="w-full pl-14 pr-14 py-4 bg-white dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300" 
                       placeholder="••••••••" 
                       type={showPassword ? "text" : "password"}
                       required
                     />
                     <button 
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors" 
                       type="button"
                     >
                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                   </div>
                 </div>

                 <button 
                   className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4" 
                   type="submit"
                 >
                   Create Account
                   <ArrowRight className="w-5 h-5" />
                 </button>

                 <div className="relative py-4 mt-6">
                    <div className="absolute inset-0 flex items-center">
                       <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                       <span className="bg-transparent px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
                    </div>
                 </div>

                 <div className="flex justify-center mb-6">
                   <GoogleLogin
                     onSuccess={handleGoogleSuccess}
                     onError={() => setError('Google login failed')}
                     useOneTap
                     theme="outline"
                     shape="pill"
                   />
                 </div>

                 <p className="text-center text-sm font-bold text-slate-500 dark:text-slate-400 mt-8">
                   Already have an account? 
                   <Link to="/login" className="text-blue-600 hover:text-blue-700 font-black ml-1">Log In</Link>
                 </p>
               </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

