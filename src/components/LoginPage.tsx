import React, { useState } from 'react';
import { useKPI } from '../context/KPIContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  LogIn, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  KeyRound,
  ArrowRight
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { users, login, loginAs } = useKPI();
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!usernameInput.trim()) {
      setErrorMsg('Нэвтрэх нэр эсвэл и-мэйл хаягаа оруулна уу.');
      return;
    }
    if (!passwordInput) {
      setErrorMsg('Нууц үгээ оруулна уу.');
      return;
    }

    const result = login(usernameInput, passwordInput);
    if (!result.success) {
      setErrorMsg(result.error || 'Нэвтрэх эрх буруу байна.');
    }
  };

  const handleQuickLogin = (username: string, pass: string) => {
    setUsernameInput(username);
    setPasswordInput(pass);
    setErrorMsg(null);
    login(username, pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Login Form */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                UB GROUP
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Борлуулалт Маркетингийн Газар
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              KPI Цахим Систем
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Маркетингийн багийн 70% үндсэн болон 30% төлөвлөгөөнөөс гадуурх KPI-г бодит цагт хянах, үнэлэх систем
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Нэвтрэх нэр эсвэл И-мэйл
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Жишээ: admin, bold, gan..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Нууц үг
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Нууц үгээ оруулна уу"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Системд нэвтрэх</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            БАТАЛСАН: Борлуулалт, Маркетингийн газрын захирал Н.Гомбосүрэн
          </div>
        </div>

        {/* Right Side: Account Directory with Quick-Login Chips */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Нэвтрэх эрхүүд (Түргэн нэвтрэх)
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Багийн гишүүдийн аккаунт бүрт нэвтрэх нэр ба нууц үг тохируулсан байна. Сонгож шууд нэвтрэх боломжтой:
            </p>

            <div className="space-y-2">
              {users.map(u => {
                const isAdmin = u.role === 'admin';
                return (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white truncate text-[11px]">
                            {u.name}
                          </span>
                          {isAdmin && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold">
                              Админ
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          user: <span className="text-indigo-300 font-bold">{u.username}</span> | pass: <span className="text-slate-300">{u.password}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin(u.username, u.password)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-semibold transition-all shrink-0 flex items-center gap-1"
                      title="Шууд бөглөж нэвтрэх"
                    >
                      <span>Нэвтрэх</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
