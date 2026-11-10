import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, BookOpen, FolderArchive, 
  Send, TrendingUp, BarChart3, Users, 
  Settings, GraduationCap, Layers, Sparkles 
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string, param?: any) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'teacher';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'courses',
      label: 'Khóa học',
      icon: BookOpen,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'repository',
      label: 'Bài giảng',
      icon: FolderArchive,
      badge: 'SCORM/HTML5',
      roles: ['admin', 'teacher'],
    },
    {
      id: 'classes',
      label: 'Trường & Lớp học',
      icon: Layers,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'assignments',
      label: 'Giao bài',
      icon: Send,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'progress',
      label: 'Tiến độ học tập',
      icon: TrendingUp,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: BarChart3,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'users',
      label: 'Người dùng',
      icon: Users,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings,
      roles: ['admin', 'teacher'],
    },
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role banner in sidebar */}
      <div className="p-4 border-b border-slate-100">
        <div className={`p-3 rounded-2xl flex items-center space-x-3 ${
          role === 'admin' 
            ? 'bg-rose-50 border border-rose-200/60' 
            : role === 'teacher' 
            ? 'bg-emerald-50 border border-emerald-200/60' 
            : 'bg-blue-50 border border-blue-200/60'
        }`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            role === 'admin' 
              ? 'bg-rose-500 text-white' 
              : role === 'teacher' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}>
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {role === 'admin' ? 'Quản trị viên' : role === 'teacher' ? 'Giáo viên phụ trách' : 'Góc học tập'}
            </p>
            <p className="text-xs font-extrabold text-slate-800 truncate">
              {currentUser?.name || 'Thầy Nguyễn Văn Học'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links - Exactly the 9 items from Prompt 00 */}
      <div className="flex-1 py-4 px-3 space-y-1">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose?.();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* School Info Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-2 text-slate-600">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700">Trường TH Lê Văn Tám</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Năm học 2024 - 2025</p>
        <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-200/60 pt-2 flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-emerald-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Trực tuyến 100%</span>
          </span>
          <span className="text-slate-500 font-semibold">TT 09/BGDĐT</span>
        </div>
      </div>
    </aside>
  );
};
