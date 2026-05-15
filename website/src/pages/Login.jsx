import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-900/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Brand & Trust */}
        <div className="hidden lg:flex flex-col gap-10">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30">
                 <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Locser</h1>
           </div>
           
           <div className="space-y-6">
              <h2 className="text-5xl xl:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
                 Your neighborhood's <br />
                 <span className="text-blue-600">trusted experts.</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-md">
                 Join thousands of residents in Chandigarh booking verified professionals for home services.
              </p>
           </div>

           <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                 ))}
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                 <span className="text-blue-600 font-black">10,000+</span> professionals <br /> ready to help you.
              </p>
           </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-white/50 dark:border-slate-700/50 relative overflow-hidden group">
            {/* Decorative Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>

            <div className="relative z-10">
               <div className="mb-10">
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Welcome Back</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">Sign in to continue</p>
               </div>
               
               {error && (
                 <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl font-bold text-xs flex items-center gap-3 animate-shake">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    {error}
                 </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1" htmlFor="email">Email Address</label>
                   <div className="relative group">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                     <input 
                       value={email}
                       onChange={e => setEmail(e.target.value)}
                       className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm" 
                       id="email" 
                       placeholder="name@example.com" 
                       type="email"
                       required
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest" htmlFor="password">Password</label>
                      <button type="button" className="text-[10px] font-black text-blue-600 uppercase hover:underline">Forgot?</button>
                   </div>
                   <div className="relative group">
                     <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                     <input 
                       value={password}
                       onChange={e => setPassword(e.target.value)}
                       className="w-full pl-14 pr-14 py-5 bg-white dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm" 
                       id="password" 
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
                   className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3" 
                   type="submit"
                 >
                   Sign In
                   <ArrowRight className="w-5 h-5" />
                 </button>

                 <div className="relative py-4">
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

                 <p className="text-center text-sm font-bold text-slate-500 dark:text-slate-400 mt-10">
                   Don't have an account? <br className="md:hidden" />
                   <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-black ml-1">Create free account</Link>
                 </p>
               </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

