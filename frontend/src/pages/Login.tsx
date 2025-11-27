import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { getErrorMessage } from '@/lib/utils';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Key } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#e0f7fa' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Dark Cyan Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-700 via-cyan-800 to-cyan-900" />
        
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="https://demopublic.blob.core.windows.net/assets/tally-group-logo.png"
                alt="tallygroup"
                className="h-14 w-auto rounded-xl"
              />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Workspace</h1>
                <p className="text-cyan-200 text-sm font-medium uppercase tracking-widest">Booking System</p>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold leading-tight">
            Powering intelligent<br />
            <span className="text-cyan-300">workspace</span> experience
          </h2>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img
              src="https://demopublic.blob.core.windows.net/assets/tally-group-logo.png"
              alt="tallygroup"
              className="h-14 w-auto rounded-xl mb-4"
            />
            <h1 className="text-2xl font-bold text-cyan-800">Workspace Booking</h1>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-cyan-200/50 ring-1 ring-cyan-100">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
              <p className="mt-2 text-slate-500">Sign in to access your workspace</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700" role="alert">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('email')}
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="you@company.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('password')}
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:from-cyan-700 hover:to-cyan-800 hover:shadow-xl hover:shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Sign in
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-500">New to Workspace?</span>
                </div>
              </div>

              <Link
                to="/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
              >
                <UserPlus className="h-5 w-5" />
                Create an account
              </Link>
            </form>
          </div>         
        </div>
      </div>
    </div>
  );
}
