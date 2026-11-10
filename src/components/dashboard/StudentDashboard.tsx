import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { Course, Lesson } from '../../types/lms';
import { 
  PlayCircle, BookOpen, Award, CheckCircle2, 
  Clock, AlertCircle, Sparkles, Send, ArrowRight 
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (view: string, param?: any) => void;
  onPlayLesson: (course: Course, lesson: Lesson) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onPlayLesson }) => {
  const { currentUser } = useAuth();
  const { courses, lessons, progressList, assignments, notifications } = useLMS();

  const studentId = currentUser?.id || '';
  const myProgress = progressList.filter(p => p.studentId === studentId);

  const completedCount = myProgress.filter(p => p.status === 'completed').length;
  const inProgressCount = myProgress.filter(p => p.status === 'in_progress').length;
  const avgScore = myProgress.length > 0 
    ? Math.round(myProgress.reduce((sum, p) => sum + (p.score || 0), 0) / myProgress.length) 
    : 100;

  // Filter courses for student grade if available
  const studentGrade = currentUser?.className ? parseInt(currentUser.className.replace(/\D/g, '')) || 3 : 3;
  const relevantCourses = courses.filter(c => c.grade === studentGrade || true);

  const handleStartLearningCourse = (course: Course) => {
    const courseLessons = lessons.filter(l => l.courseId === course.id).sort((a, b) => a.order - b.order);
    if (courseLessons.length === 0) {
      alert('Khóa học này đang được thầy cô cập nhật nội dung.');
      return;
    }

    // Find first unfinished lesson, or first lesson
    const nextLesson = courseLessons.find(l => {
      const prog = myProgress.find(p => p.lessonId === l.id);
      return !prog || prog.status !== 'completed';
    }) || courseLessons[0];

    onPlayLesson(course, nextLesson);
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Góc học tập trực tuyến • {currentUser?.className || 'Lớp 3A'}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl leading-tight">
            Chào mừng {currentUser?.name}! 🌟
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Hôm nay em hãy cùng khám phá các bài giảng e-learning bổ ích, vượt qua các thử thách điểm dừng tương tác và rinh về thật nhiều điểm số cao nhé!
          </p>

          <div className="flex items-center space-x-4 mt-6">
            <button
              onClick={() => onNavigate('courses')}
              className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Xem tất cả khóa học</span>
            </button>
            <button
              onClick={() => onNavigate('assignments')}
              className="px-4 py-2.5 bg-blue-800/60 hover:bg-blue-800 text-white font-bold text-xs rounded-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Nhiệm vụ thầy cô giao</span>
            </button>
          </div>
        </div>

        {/* Decorative graphic */}
        <div className="absolute right-0 bottom-0 opacity-15 transform translate-x-10 translate-y-6 pointer-events-none">
          <Award className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Student KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Bài đã hoàn thành</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{completedCount}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Xuất sắc</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Bài đang học</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{inProgressCount}</div>
          <span className="text-[11px] text-amber-700 font-semibold">Cần hoàn thành tiếp</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Điểm trung bình</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">{avgScore}đ</div>
          <span className="text-[11px] text-blue-700 font-semibold">Kết quả học tập</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Nhiệm vụ được giao</span>
          <div className="text-2xl font-extrabold text-purple-600 mt-2">{assignments.length}</div>
          <span className="text-[11px] text-purple-700 font-semibold">Trong tuần này</span>
        </div>
      </div>

      {/* My Courses Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">
              Các khóa học trực tuyến của em
            </h3>
            <p className="text-xs text-slate-500">Bấm "Vào học ngay" để bắt đầu bài giảng tương tác</p>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs text-blue-600 font-bold hover:underline flex items-center space-x-1"
          >
            <span>Xem danh sách đầy đủ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {relevantCourses.map((course) => {
            const courseLessons = lessons.filter(l => l.courseId === course.id);
            let done = 0;
            courseLessons.forEach(l => {
              const p = myProgress.find(prg => prg.lessonId === l.id && prg.status === 'completed');
              if (p) done++;
            });
            const percent = courseLessons.length > 0 ? Math.round((done / courseLessons.length) * 100) : 0;

            return (
              <div
                key={course.id}
                className="bg-slate-50/70 rounded-3xl p-5 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-36 rounded-2xl overflow-hidden mb-3.5">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-slate-800">
                      Khối {course.grade} • {course.subjectName}
                    </div>
                  </div>

                  <h4 className="font-heading font-bold text-sm text-slate-800 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{course.description}</p>

                  {/* Progress bar */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Tiến độ bài học:</span>
                      <span className="text-emerald-600 font-bold">{percent}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Hoàn thành {done}/{courseLessons.length} bài giảng e-learning
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    GV: {course.teacherName}
                  </span>

                  <button
                    onClick={() => handleStartLearningCourse(course)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Vào học ngay</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
