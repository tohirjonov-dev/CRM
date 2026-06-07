import React, { useState } from 'react';
import axios from 'axios';
import { Cloud, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { formatApiError } from '../lib/errors';

interface LoginProps {
  onLoginSuccess: (token: string, user: unknown) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@apparelcloud.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await axios.post(`${baseUrl}/api/auth/login`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, user } = response.data;
      onLoginSuccess(access_token, user);
    } catch (err: unknown) {
      console.error(err);
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setError("Email yoki parol noto'g'ri.");
      } else {
        setError(formatApiError(err, 'Autentifikatsiya serveriga ulanib bo‘lmadi.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-b from-[#0a0a0a] to-[#151515]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(214,175,55,0.05),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md border border-white/10 rounded-2xl bg-black/40 glass-card p-8 shadow-gold-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-black shadow-gold font-bold mb-4">
            <Cloud size={24} className="text-black" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">ApparelCloud</h2>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            Ombor, mijozlar, ta&apos;minotchilar va buyurtmalarni boshqarish
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Email manzil
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="siz@kompaniya.uz"
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 focus:border-gold-500/50 text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Parol
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-12 rounded-lg bg-white/5 border border-white/10 focus:border-gold-500/50 text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full h-11 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold text-sm tracking-wide shadow-gold hover:shadow-gold-lg disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Tizimga kirish'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-[10px] text-gray-500">
          <p>Standart hisoblar:</p>
          <div className="flex flex-col justify-center gap-1 mt-2">
            <span>
              Admin: <strong className="text-gray-400">admin@apparelcloud.com</strong> /{' '}
              <strong className="text-gray-400">admin123</strong>
            </span>
            <span>
              Xodim: <strong className="text-gray-400">staff@apparelcloud.com</strong> /{' '}
              <strong className="text-gray-400">staffpassword</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
