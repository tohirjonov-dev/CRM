import React, { useState, useEffect } from 'react';
import { User, Server, Sparkles, Keyboard } from 'lucide-react';
import api from '../lib/api';
import { loadPreferences, savePreferences, triggerGlobalSearch } from '../lib/preferences';
import { ROLE_UZ } from '../lib/uz';

interface SettingsProps {
  user: { full_name: string; email: string; role: string } | null;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [apiHealth, setApiHealth] = useState<'checking' | 'healthy' | 'offline'>('checking');
  const [dbStatus, setDbStatus] = useState<string>('Tekshirilmoqda...');
  const [apiVersion, setApiVersion] = useState<string>('—');
  const [microAnimations, setMicroAnimations] = useState(() => loadPreferences().microAnimations);
  const [keybindTested, setKeybindTested] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data.status === 'healthy') {
          setApiHealth('healthy');
          setApiVersion(res.data.version || '1.0.0');
          setDbStatus('Ishlayapti');
        } else {
          setApiHealth('offline');
          setDbStatus('Noma\'lum');
        }
      } catch {
        setApiHealth('offline');
        setDbStatus('Ulanmagan');
      }
    };
    checkHealth();
  }, []);

  const toggleMicroAnimations = () => {
    const next = !microAnimations;
    setMicroAnimations(next);
    savePreferences({ microAnimations: next });
  };

  const testKeybind = () => {
    triggerGlobalSearch();
    setKeybindTested(true);
    setTimeout(() => setKeybindTested(false), 2500);
  };

  const healthLabel =
    apiHealth === 'healthy' ? 'Ulangan' : apiHealth === 'offline' ? 'Oflayn' : 'Tekshirilmoqda...';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Tizim sozlamalari</h1>
        <p className="text-xs text-gray-400 mt-0.5">Profil, server holati va interfeys sozlamalari</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/5 bg-black/40 p-5 glass-card space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <User size={16} className="text-gold-400" />
              <span>Operator profili</span>
            </h3>

            {user ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 border border-white/5 bg-black/20 rounded-lg">
                  <span className="text-gray-500 font-semibold block uppercase">To&apos;liq ism</span>
                  <span className="text-white font-bold text-sm mt-1 block">{user.full_name}</span>
                </div>
                <div className="p-3 border border-white/5 bg-black/20 rounded-lg">
                  <span className="text-gray-500 font-semibold block uppercase">Rol</span>
                  <span className="text-gold-400 font-bold text-sm mt-1 block">
                    {ROLE_UZ[user.role] || user.role}
                  </span>
                </div>
                <div className="p-3 border border-white/5 bg-black/20 rounded-lg col-span-2">
                  <span className="text-gray-500 font-semibold block uppercase">Email</span>
                  <span className="text-white font-bold text-sm mt-1 block">{user.email}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Profil yuklanmoqda...</p>
            )}
          </div>

          <div className="rounded-xl border border-white/5 bg-black/40 p-5 glass-card space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server size={16} className="text-gold-400" />
              <span>Server va ma&apos;lumotlar bazasi</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 border border-white/5 bg-black/20 rounded-lg">
                <span className="text-gray-500 font-semibold block uppercase">API manzili</span>
                <span className="text-gray-300 font-mono mt-1 block truncate">
                  {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
                </span>
              </div>
              <div className="p-3 border border-white/5 bg-black/20 rounded-lg">
                <span className="text-gray-500 font-semibold block uppercase">Server holati</span>
                <span
                  className={`font-bold mt-1 block ${
                    apiHealth === 'healthy'
                      ? 'text-emerald-400'
                      : apiHealth === 'offline'
                        ? 'text-red-400'
                        : 'text-gray-400'
                  }`}
                >
                  {healthLabel}
                </span>
              </div>
              <div className="p-3 border border-white/5 bg-black/20 rounded-lg">
                <span className="text-gray-500 font-semibold block uppercase">PostgreSQL</span>
                <span className="text-white font-bold mt-1 block">{dbStatus}</span>
              </div>
              <div className="p-3 border border-white/5 bg-black/20 rounded-lg">
                <span className="text-gray-500 font-semibold block uppercase">Versiya</span>
                <span className="text-white font-bold mt-1 block">{apiVersion}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-5 glass-card space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-gold-400" />
            <span>Mavzu va interfeys</span>
          </h3>

          <div className="space-y-4 text-xs">
            <p className="text-gray-400 leading-relaxed">
              ApparelCloud B2B ombor interfeysi uchun qorong&apos;u oltin mavzu ishlatiladi — ko&apos;zni
              kam charchatadi va ombor sharoitida yaxshi o&apos;qiladi.
            </p>

            <div className="p-3 border border-gold-500/20 bg-gold-500/5 rounded-lg space-y-2">
              <span className="text-gold-400 font-bold block">Faol mavzu: Professional qorong&apos;u</span>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0a0a0a] border border-white/10" title="Asosiy fon" />
                <div className="w-6 h-6 rounded-full bg-[#D4AF37]" title="Oltin urg'u" />
                <div className="w-6 h-6 rounded-full bg-[#EFEFEF]" title="Matn" />
                <div className="w-6 h-6 rounded-full bg-[#121212] border border-white/10" title="Shisha panel" />
              </div>
            </div>

            <div className="p-3 border border-white/5 bg-black/20 rounded-lg">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-300 font-semibold">Mikro-animatsiyalar</span>
                <button
                  type="button"
                  onClick={toggleMicroAnimations}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    microAnimations ? 'bg-gold-500' : 'bg-white/10'
                  }`}
                  aria-pressed={microAnimations}
                  aria-label="Mikro-animatsiyalarni yoqish yoki o'chirish"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${
                      microAnimations ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                Holat:{' '}
                <span className={microAnimations ? 'text-emerald-400 font-bold' : 'text-gray-400 font-bold'}>
                  {microAnimations ? 'Yoqilgan' : "O'chirilgan"}
                </span>
              </p>
            </div>

            <div className="p-3 border border-white/5 bg-black/20 rounded-lg space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                  <Keyboard size={14} className="text-gold-400" />
                  Global qidiruv (⌘K / Ctrl+K)
                </span>
                <span className="text-gold-400 font-bold">Tayyor</span>
              </div>
              <p className="text-[10px] text-gray-500">
                Yuqoridagi qidiruv maydoniga tez o&apos;tish uchun tugmani bosing yoki klaviaturadan
                ⌘K (Mac) yoki Ctrl+K (Windows) bosing.
              </p>
              <button
                type="button"
                onClick={testKeybind}
                className="w-full py-2 rounded-lg border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-semibold hover:bg-gold-500/20 transition-colors"
              >
                {keybindTested ? 'Qidiruv maydoni faollashtirildi ✓' : 'Qidiruvni sinab ko\'rish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
