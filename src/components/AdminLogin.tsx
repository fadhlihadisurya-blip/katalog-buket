import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Flower2, Mail, Lock, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'reset'>('login');

  const { sendPasswordReset } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Gagal login. Periksa email dan password Anda.';
      
      if (err.code === 'auth/operation-not-allowed') {
        errorMessage = `Metode "Email/Password" belum aktif di Firebase Console untuk Project ID: ${auth.app.options.projectId}. Mohon pastikan Anda mengaktifkannya di bagian Build > Authentication > Sign-in method.`;
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = `Domain "${window.location.hostname}" belum diizinkan untuk Firebase Authentication. Harap tambahkan domain ini ke daftar "Authorized domains" di Firebase Console (Authentication > Settings).`;
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Email atau password salah.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Masukkan email Anda terlebih dahulu.');
      return;
    }

    setResetLoading(true);
    setError(null);
    setMessage(null);

    try {
      await sendPasswordReset(email);
      setMessage('Email reset password telah dikirim. Silakan cek inbox Anda.');
      setView('login');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengirim email reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-brand-secondary hover:text-brand-primary transition-colors mb-8 text-sm font-semibold uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Kembali ke Katalog
        </button>

        <div className="bg-white border border-brand-border rounded-2xl p-8 md:p-12 shadow-xl shadow-brand-primary/5">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-border">
              <Flower2 size={32} className="text-brand-primary opacity-80" />
            </div>
            <h1 className="text-2xl font-serif text-brand-text font-bold tracking-tight italic">
              {view === 'login' ? 'Admin Access' : 'Reset Password'}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-secondary mt-3 font-semibold">
              {view === 'login' ? 'Managed Boutique Portal' : 'Masukkan email untuk menerima link reset.'}
            </p>
            <div className="mt-2 text-[9px] text-brand-secondary opacity-50">
              Project ID: {auth.app.options.projectId}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#FFF5F5] border border-red-100 rounded-lg flex items-start gap-3 text-red-600 text-xs animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-[#F5FFF5] border border-green-100 rounded-lg flex items-start gap-3 text-green-700 text-xs text-center justify-center italic">
              <p>{message}</p>
            </div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-brand-secondary px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                    placeholder="admin@paradisebucket.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs uppercase tracking-widest font-bold text-brand-secondary">Password</label>
                  <button 
                    type="button"
                    onClick={() => setView('reset')}
                    className="text-[10px] uppercase tracking-widest font-bold text-brand-primary hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-primary text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-brand-text transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/10"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In to Dashboard'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-brand-secondary px-1">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                    placeholder="admin@paradisebucket.com"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={resetLoading}
                className="w-full py-4 bg-brand-primary text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-brand-text transition-all flex items-center justify-center gap-2"
              >
                {resetLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
              </button>

              <button 
                type="button"
                onClick={() => setView('login')}
                className="w-full text-center text-xs text-brand-secondary hover:text-brand-primary font-medium"
              >
                Kembali ke Login
              </button>
            </form>
          )}
        </div>
        
        <p className="text-center mt-8 text-[10px] uppercase tracking-widest text-brand-secondary font-medium">
          Paradisebuket Admin Panel &copy; 2026 
        </p>
      </motion.div>
    </div>
  );
};
