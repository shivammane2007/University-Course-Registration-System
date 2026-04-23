'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff, LogIn, UserCircle, ShieldCheck, BookOpen } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['admin', 'faculty', 'student']),
});

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(typeof window !== 'undefined' && !!localStorage.getItem('usrs_remember_id'));

  const { register, handleSubmit, watch, setValue, clearErrors, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { 
      role: (typeof window !== 'undefined' && localStorage.getItem('usrs_remember_role')) || 'student',
      user_id: (typeof window !== 'undefined' && localStorage.getItem('usrs_remember_id')) || ''
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (values) => {
    setIsLoading(true);
    // Normalize Student/Faculty IDs to uppercase
    const normalizedValues = {
      ...values,
      user_id: values.role === 'admin' ? values.user_id : values.user_id.toUpperCase()
    };
    
    try {
      const { data } = await api.post('/auth/login', normalizedValues);
      const { accessToken, refreshToken, user } = data.data;
      
      if (rememberMe) {
        localStorage.setItem('usrs_remember_id', normalizedValues.user_id);
        localStorage.setItem('usrs_remember_role', normalizedValues.role);
      } else {
        localStorage.removeItem('usrs_remember_id');
        localStorage.removeItem('usrs_remember_role');
      }

      setAuth({
        user,
        token: accessToken,
        refreshToken,
        role: user.role
      });
      
      toast.success('Welcome back!');
      
      const rolePath = normalizedValues.role === 'admin' ? '/admin/dashboard' : normalizedValues.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard';
      router.push(rolePath);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'admin', label: 'Administrator', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'faculty', label: 'Faculty', icon: UserCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  // Auto-detect role based on user_id prefix
  const userIdValue = watch('user_id');
  useEffect(() => {
    if (userIdValue?.toUpperCase().startsWith('PRN')) {
      setValue('role', 'student');
      clearErrors('role');
    } else if (userIdValue?.toUpperCase().startsWith('FAC')) {
      setValue('role', 'faculty');
      clearErrors('role');
    }
  }, [userIdValue, setValue, clearErrors]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[140px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[160px]" />
      
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden m-4 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-accent via-accent-hover to-indigo-900 p-16 flex-col justify-between relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          
          <div className="relative z-10 flex items-center gap-4 group cursor-default">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl transition-transform duration-500 group-hover:rotate-12">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-white tracking-tight block">USRS Portal</span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Academic Excellence</span>
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl lg:text-6xl font-display font-bold text-white leading-[1.2] mb-8 tracking-tight">
              Empowering the <br /> 
              <span className="inline-block mt-3 px-6 py-2 rounded-2xl bg-white/10 border border-white/20 shadow-lg">
                Next Generation
              </span> <br /> 
              <span className="inline-block mt-3">of Learners.</span>
            </h1>
            <p className="text-white/80 text-xl leading-relaxed max-w-md font-medium">
              Streamlining university registrations with a modern, secure, and intuitive platform for everyone.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-accent-hover bg-white/10 shadow-lg overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-tr from-white/5 to-white/20" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-accent-hover bg-accent-hover flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                +2k
              </div>
            </div>
            <div className="h-10 w-[1px] bg-white/20" />
            <span className="text-white/60 text-xs font-medium tracking-wide">
              Trusted by thousands of <br />
              students across the globe
            </span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-10 lg:p-20 flex flex-col justify-center bg-white relative">
          <div className="mb-12">
            <h2 className="text-4xl font-display font-bold text-primary-900 mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-muted text-lg">Enter your details to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Role Selection */}
            <div>
              <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-4 ml-1">Account Role</p>
              <div className="grid grid-cols-3 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setValue('role', role.id);
                      clearErrors();
                    }}
                    className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-500 group relative overflow-hidden ${
                      selectedRole === role.id 
                        ? `border-accent bg-accent/5 shadow-xl shadow-accent/10` 
                        : 'border-primary-50 bg-primary-50/30 hover:border-accent/20 hover:bg-white hover:shadow-lg'
                    }`}
                  >
                    <div className={`transition-all duration-500 ${
                      selectedRole === role.id ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      <role.icon className={`w-7 h-7 mb-3 transition-colors duration-500 ${
                        selectedRole === role.id ? 'text-accent' : 'text-primary-300 group-hover:text-primary-600'
                      }`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
                      selectedRole === role.id ? 'text-accent' : 'text-primary-400 group-hover:text-primary-700'
                    }`}>
                      {role.label}
                    </span>
                    {selectedRole === role.id && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
                    )}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('role')} />
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="form-label" htmlFor="user_id">
                  {selectedRole === 'student' ? 'Student PRN Number' : selectedRole === 'faculty' ? 'Faculty ID' : 'Administrator Username'}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300 group-focus-within:text-accent transition-colors">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <input
                    {...register('user_id')}
                    id="user_id"
                    type="text"
                    placeholder={selectedRole === 'student' ? "e.g. PRN2024001" : "Enter your ID"}
                    className={`${errors.user_id ? 'form-input-error' : 'form-input'} pl-12 h-14 text-base font-medium`}
                  />
                </div>
                {errors.user_id && <p className="form-error">{errors.user_id.message}</p>}
              </div>

              <div className="group">
                <label className="form-label" htmlFor="password">Security Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300 group-focus-within:text-accent transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <input
                    {...register('password')}
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`${errors.password ? 'form-input-error' : 'form-input'} pl-12 h-14 text-base font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-300 hover:text-accent transition-all p-1 hover:bg-accent/10 rounded-lg"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only" 
                  />
                  <div className="w-5 h-5 border-2 border-primary-100 rounded-md peer-checked:bg-accent peer-checked:border-accent transition-all" />
                  <div className="absolute text-white scale-0 peer-checked:scale-100 transition-transform">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary-500 group-hover:text-primary-900 transition-colors">Stay signed in</span>
              </label>
              <button type="button" className="text-sm font-bold text-accent hover:text-accent-hover transition-colors underline-offset-4 hover:underline">
                Reset password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden rounded-[20px] active:scale-[0.98] transition-transform duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-indigo-600 transition-all duration-500 group-hover:scale-110" />
              <div className="relative py-4 flex items-center justify-center gap-3 text-white font-bold text-lg shadow-xl shadow-accent/25">
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Dashboard</span>
                    <LogIn className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-primary-50 text-center">
            <p className="text-sm text-primary-400 font-medium">
              Having trouble logging in? <span className="font-bold text-accent hover:text-accent-hover cursor-pointer transition-colors decoration-2 hover:underline">Support Center</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom info */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30 pointer-events-none">
        <div className="h-[1px] w-12 bg-white" />
        <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">
          University System Management 2026
        </span>
        <div className="h-[1px] w-12 bg-white" />
      </div>
    </div>
  );
}
