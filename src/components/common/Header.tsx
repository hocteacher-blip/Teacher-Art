import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { 
  Bell, Search, School, ChevronDown, CheckCircle2, 
  AlertCircle, LogOut, Settings, HardDrive, Menu, X, ArrowRightLeft 
} from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: string, param?: any) => void;
  activeView: string;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeView, onToggleSidebar }) => {
  const { currentUser, logout, users, switchUser } = useAuth();
  const { notifications, markNotificationRead } = useLMS();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const userNotifications = notifications.filter(
    n => !currentUser || n.userId === currentUser.id || n.userId === 'ALL'
  );
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-md text-[10px]">Quản trị viên</span>;
      case 'teacher':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">Giáo viên</span>;
      case 'student':
        return <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[10px]">Học sinh</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-lg tracking-tight text-slate-800">
                  E-LEARNING <span className="text-emerald-600">SCHOOL</span>
                </span>
                <span className="hidden sm:inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                  TIỂU HỌC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Hệ Thống Quản Lý Học Tập Trực Tuyến
              </p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, bài giảng SCORM, học sinh..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Right side: DEMO mode badge + Notifications + User Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Explicit DEMO Mode Indicator (Dữ liệu cục bộ / Trực tuyến) */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chế độ DEMO (Lưu trữ cục bộ)</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                  <h4 className="font-heading font-bold text-sm text-slate-800">Thông báo học tập</h4>
                  <span className="text-xs text-slate-500">{userNotifications.length} thông báo</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-1">
                  {userNotifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Không có thông báo mới
                    </div>
                  ) : (
                    userNotifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-emerald-50/50' : ''}`}
                      >
                        <div className="flex items-start space-x-2.5">
                          <div className="mt-0.5">
                            {n.type === 'assignment' ? (
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    {getRoleBadge(currentUser.role)}
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-[11px] text-emerald-700 font-medium">{currentUser.email}</p>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Mã: {currentUser.code}</span>
                      <span>{currentUser.role === 'teacher' ? 'Tổ Tin học & Công nghệ' : (currentUser.className || 'Trường TH')}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('settings');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cài đặt hệ thống</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('reports');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Báo cáo học tập</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowSwitchModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                      <span>Đăng nhập tài khoản khác</span>
                    </button>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center space-x-2 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Switch Account Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-heading font-bold text-base text-slate-800 mb-1">
              Chuyển tài khoản đăng nhập
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Chọn tài khoản đã xác thực trên hệ thống
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {users.map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setShowSwitchModal(false);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center space-x-3 cursor-pointer transition-colors ${
                    u.id === currentUser?.id
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div>
                    {getRoleBadge(u.role)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end mt-3">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
