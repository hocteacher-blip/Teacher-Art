import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { 
  BookOpen, Plus, Upload, Settings2, Send, 
  TrendingUp, Award, CheckCircle2, Clock, Users, ArrowRight 
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (view: string, param?: any) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { courses, lessons, packages, assignments, progressList, classes } = useLMS();

  // Teacher's specific courses
  const myCourses = courses.filter(c => c.teacherId === currentUser?.id || true);
  const myLessonsCount = lessons.length;
  const myAssignments = assignments.filter(a => a.assignedByTeacherId === currentUser?.id);

  const completedCount = progressList.filter(p => p.status === 'completed').length;
  const inProgressCount = progressList.filter(p => p.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
            <span>👨‍🏫 Cổng Giáo viên • Thầy Nguyễn Văn Học (Hoc.teacher@gmail.com)</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl leading-tight">
            Chào mừng {currentUser?.name}!
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Thầy/Cô có thể tạo khóa học, tải lên các gói bài giảng e-learning (SCORM/HTML5/Video), thiết lập các mốc điểm dừng tương tác và theo dõi quá trình học tập của các em học sinh.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('courses')}
              className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo khóa học</span>
            </button>
            <button
              onClick={() => onNavigate('repository')}
              className="px-4 py-2.5 bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Tải bài giảng SCORM</span>
            </button>
            <button
              onClick={() => onNavigate('assignments')}
              className="px-4 py-2.5 bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Giao bài tập</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Khóa học phụ trách</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{myCourses.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">{myLessonsCount} bài giảng trực tuyến</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Bài giảng SCORM trong kho</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{packages.length}</div>
          <span className="text-[11px] text-teal-600 font-semibold">Tích hợp API SCORM</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Lượt học sinh hoàn thành</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{completedCount}</div>
          <span className="text-[11px] text-blue-600 font-semibold">{inProgressCount} lượt đang học</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Nhiệm vụ đã giao</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{assignments.length}</div>
          <span className="text-[11px] text-purple-600 font-semibold">Đang trong thời hạn</span>
        </div>
      </div>

      {/* Course List Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">
              Các khóa học trực tuyến đang phụ trách
            </h3>
            <p className="text-xs text-slate-500">Bấm vào khóa học để quản lý bài giảng và các điểm dừng tương tác</p>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs text-emerald-600 font-bold hover:underline flex items-center space-x-1"
          >
            <span>Tất cả khóa học</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myCourses.length === 0 ? (
          <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Chưa có khóa học nào</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Thầy/Cô hãy bắt đầu tạo khóa học mới để soạn bài giảng và đưa vào giảng dạy.
            </p>
            <button
              onClick={() => onNavigate('courses')}
              className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo khóa học mới</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCourses.slice(0, 4).map(course => (
              <div
                key={course.id}
                onClick={() => onNavigate('courses', course)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Khối {course.grade}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{course.code}</span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-emerald-700 transition-colors mt-0.5 line-clamp-1">
                      {course.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {course.subjectName} • {course.lessonsCount} bài học
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-bold text-emerald-600 px-3 py-1.5 rounded-xl bg-white border border-slate-200">
                    Quản lý
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Student Activity Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-heading font-bold text-base text-slate-800">
            Học sinh vừa hoàn thành bài học
          </h3>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs text-emerald-600 font-bold hover:underline flex items-center space-x-1"
          >
            <span>Xem sổ theo dõi chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {progressList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Chưa có lượt học sinh nào hoàn thành bài học.
          </div>
        ) : (
          <div className="space-y-2">
            {progressList.slice(0, 4).map(prog => (
              <div
                key={prog.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-800">{prog.studentName}</span>
                      <span className="text-[10px] font-semibold text-slate-500">({prog.studentClass})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Hoàn thành bài e-learning • Thời gian: {Math.floor(prog.timeSpentSeconds / 60)} phút
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    {prog.score} điểm
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {new Date(prog.lastActiveAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
