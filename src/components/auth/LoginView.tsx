import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  School, Lock, Mail, ArrowRight, ShieldCheck, 
  Sparkles, GraduationCap, CheckCircle2, User, UserPlus, LogIn, AlertCircle
} from 'lucide-react';
import { UserRole } from '../../types/lms';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { users, login, register, switchUser } = useAuth();

  const isSystemEmpty = users.length === 0;
  const [authMode, setAuthMode] = useState<'login' | 'register'>(isSystemEmpty ? 'register' : 'login');

  // Login form state
  const [emailInput, setEmailInput] = useState('Hoc.teacher@gmail.com');
  const [passwordInput, setPasswordInput] = useState('123456');
  const [loginErrorMsg, setLoginErrorMsg] = useState('');

  // Register form state
  const [regName, setRegName] = useState('Thầy Nguyễn Văn Học');
  const [regEmail, setRegEmail] = useState('Hoc.teacher@gmail.com');
  const [regRole, setRegRole] = useState<UserRole>('teacher');
  const [regCode, setRegCode] = useState('GV-HOC01');
  const [regPassword, setRegPassword] = useState('123456');
  const [regErrorMsg, setRegErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrorMsg('');

    const targetUser = users.find(
      u => u.email.toLowerCase() === emailInput.trim().toLowerCase() ||
           u.code.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (targetUser) {
      switchUser(targetUser.id);
      onSuccess?.();
    } else {
      setLoginErrorMsg('Không tìm thấy tài khoản với email hoặc mã định danh này.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg('');

    if (!regName.trim()) {
      setRegErrorMsg('Vui lòng nhập họ và tên.');
      return;
    }
    if (!regEmail.trim()) {
      setRegErrorMsg('Vui lòng nhập email.');
      return;
    }

    const emailExists = users.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (emailExists) {
      setRegErrorMsg('Email này đã tồn tại trong hệ thống. Vui lòng chuyển sang tab Đăng nhập.');
      return;
    }

    const created = register({
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      code: regCode.trim() || (regRole === 'teacher' ? 'GV-01' : 'ND-01'),
      username: regEmail.trim().split('@')[0],
      phone: '0912 345 678',
    });

    if (created) {
      onSuccess?.();
    }
  };

  const handleQuickCreateHocTeacher = () => {
    const created = register({
      name: 'Thầy Nguyễn Văn Học',
      email: 'Hoc.teacher@gmail.com',
      role: 'teacher',
      code: 'GV-HOC01',
      username: 'thayhoc',
      phone: '0912 345 678',
    });
    if (created) {
      onSuccess?.();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-4">
            <School className="w-8 h-8" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-800 tracking-tight">
            E-LEARNING <span className="text-emerald-600">SCHOOL</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Hệ Thống Quản Lý Học Tập Trực Tuyến Tiểu Học
          </p>
        </div>

        {/* Notice when system has 0 accounts */}
        {isSystemEmpty && (
          <div className="mb-4 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Toàn bộ tài khoản đã được dọn sạch</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700">
              Hiện tại hệ thống có 0 tài khoản. Thầy/Cô hãy khởi tạo tài khoản đầu tiên để bắt đầu sử dụng.
            </p>
            <button
              type="button"
              onClick={handleQuickCreateHocTeacher}
              className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khởi tạo nhanh tài khoản Thầy Nguyễn Văn Học</span>
            </button>
          </div>
        )}

        {/* Login / Register Card */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xl space-y-5">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center space-x-1.5 ${
                authMode === 'login'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
              {users.length > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {users.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center space-x-1.5 ${
                authMode === 'register'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Tạo tài khoản mới</span>
            </button>
          </div>

          {/* Form: LOGIN */}
          {authMode === 'login' && (
            <div className="space-y-4">
              {loginErrorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
                  {loginErrorMsg}
                </div>
              )}

              {users.length === 0 ? (
                <div className="py-6 text-center space-y-3">
                  <User className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    Chưa có tài khoản nào được lưu trên hệ thống.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tạo tài khoản ngay</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email hoặc Mã định danh
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Hoc.teacher@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Quick Login button for available accounts in the system */}
              {users.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Tài khoản hiện có ({users.length}):
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {users.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchUser(u.id);
                          onSuccess?.();
                        }}
                        className="w-full p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 text-left flex items-center space-x-2.5 transition-colors cursor-pointer"
                      >
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-bold text-slate-800 truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{u.email}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          u.role === 'teacher' ? 'bg-emerald-100 text-emerald-800' :
                          u.role === 'admin' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role === 'teacher' ? 'GV' : u.role === 'admin' ? 'Admin' : 'HS'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form: REGISTER / CREATE NEW ACCOUNT */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regErrorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
                  {regErrorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Thầy Nguyễn Văn Học"
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Hoc.teacher@gmail.com"
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  >
                    <option value="teacher">Giáo viên</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="student">Học sinh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã định danh
                  </label>
                  <input
                    type="text"
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    placeholder="GV-HOC01"
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Khởi tạo & Đăng nhập</span>
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Trường Tiểu học Lê Văn Tám • Hệ thống Học tập Trực tuyến Chuẩn GDPT 2018
        </p>
      </div>
    </div>
  );
};
