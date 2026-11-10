import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { 
  Users, BookOpen, FolderArchive, Layers, 
  Award, TrendingUp, Plus, Upload, BarChart3, 
  School, CheckCircle2, AlertCircle, ArrowRight 
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, param?: any) => void;
}

export const AdminDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { courses, packages, classes, db, progressList } = useLMS();

  const totalTeachers = db.users.filter(u => u.role === 'teacher').length;
  const totalStudents = db.users.filter(u => u.role === 'student').length;
  const totalClasses = classes.length;
  const totalCourses = courses.length;
  const totalPackages = packages.length;

  const totalCompletions = progressList.filter(p => p.status === 'completed').length;
  const avgScore = progressList.length > 0 
    ? Math.round(progressList.reduce((sum, p) => sum + (p.score || 0), 0) / progressList.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
            <School className="w-3.5 h-3.5" />
            <span>Trường Tiểu học Lê Văn Tám • Năm học 2024 - 2025</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl leading-tight">
            Xin chào, {currentUser?.name}!
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Hệ thống LMS quản lý học tập trực tuyến đang vận hành ổn định. Toàn trường hiện có <b>{totalCourses} khóa học số</b> và <b>{totalPackages} gói bài giảng e-learning chuẩn SCORM</b>.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('courses')}
              className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Quản lý khóa học
            </button>
            <button
              onClick={() => onNavigate('repository')}
              className="px-4 py-2.5 bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              Kho học liệu SCORM
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2.5 bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              Báo cáo toàn trường
            </button>
          </div>
        </div>

        {/* Decorative graphic in background */}
        <div className="absolute right-0 bottom-0 opacity-15 transform translate-x-12 translate-y-8 pointer-events-none">
          <School className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Khóa học e-Learning</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{totalCourses}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Khối 1 đến Khối 5</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Kho bài giảng SCORM</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{totalPackages}</div>
          <span className="text-[11px] text-teal-600 font-semibold">SCORM 1.2, HTML5</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Học sinh toàn trường</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{totalStudents}</div>
          <span className="text-[11px] text-blue-600 font-semibold">Trong {totalClasses} lớp học</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Giáo viên phụ trách</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{totalTeachers}</div>
          <span className="text-[11px] text-purple-600 font-semibold">Tổ chuyên môn</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Điểm TB học sinh</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{avgScore}đ</div>
          <span className="text-[11px] text-amber-600 font-semibold">{totalCompletions} bài hoàn thành</span>
        </div>
      </div>

      {/* Two columns: Recent Courses and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Active Courses */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-heading font-bold text-base text-slate-800">
              Khóa học tiêu biểu các khối lớp
            </h3>
            <button
              onClick={() => onNavigate('courses')}
              className="text-xs text-emerald-600 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="font-bold text-slate-600">Chưa có khóa học nào trên hệ thống</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Bấm "Xem tất cả" để vào trang Quản lý khóa học.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 4).map(course => (
                <div
                  key={course.id}
                  onClick={() => onNavigate('courses')}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          Khối {course.grade}
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate max-w-xs">
                          {course.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {course.subjectName} • GV: {course.teacherName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600 block">
                      {course.lessonsCount} bài giảng
                    </span>
                    <span className="text-[10px] text-slate-400">Đã xuất bản</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Action Hub & System Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-base text-slate-800 mb-2">
              Lối tắt tác vụ quản trị
            </h3>

            <button
              onClick={() => onNavigate('courses')}
              className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-bold text-xs flex items-center space-x-3 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <span>Tạo khóa học trực tuyến mới</span>
                <p className="text-[10px] font-normal text-emerald-700">Theo chuẩn chương trình GDPT 2018</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('repository')}
              className="w-full p-3 rounded-2xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 font-bold text-xs flex items-center space-x-3 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span>Tải lên gói SCORM / HTML5</span>
                <p className="text-[10px] font-normal text-teal-700">Tự động đọc imsmanifest.xml</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('users')}
              className="w-full p-3 rounded-2xl bg-purple-50 hover:bg-purple-100/80 text-purple-800 font-bold text-xs flex items-center space-x-3 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span>Quản lý tài khoản giáo viên & học sinh</span>
                <p className="text-[10px] font-normal text-purple-700">Phân quyền và danh sách lớp</p>
              </div>
            </button>
          </div>

          {/* Standards Compliance Card */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Tiêu chuẩn kỹ thuật</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hệ thống tuân thủ quy chuẩn kỹ thuật bài giảng e-learning theo quy định của Bộ Giáo dục & Đào tạo: SCORM 1.2, SCORM 2004, HTML5 Responsive và định vị điểm dừng tương tác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
