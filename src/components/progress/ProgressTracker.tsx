import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { StudentProgress, User } from '../../types/lms';
import { 
  TrendingUp, Users, CheckCircle2, Clock, AlertTriangle, 
  Search, Filter, MessageSquare, Award, X, Sparkles, ChevronRight 
} from 'lucide-react';

export const ProgressTracker: React.FC = () => {
  const { 
    progressList, 
    courses, 
    lessons, 
    classes, 
    db, 
    stops, 
    saveStudentProgress 
  } = useLMS();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Teacher feedback modal
  const [feedbackModalProgress, setFeedbackModalProgress] = useState<StudentProgress | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Extract all students from db
  const students = db.users.filter(u => u.role === 'student');

  // Filter progress
  const filteredProgress = progressList.filter(p => {
    const matchesCourse = selectedCourseId === 'all' || p.courseId === selectedCourseId;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.studentClass.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesStatus && matchesSearch;
  });

  const handleOpenFeedback = (prog: StudentProgress) => {
    setFeedbackModalProgress(prog);
    setFeedbackText(prog.teacherFeedback || '');
  };

  const handleSaveFeedback = () => {
    if (!feedbackModalProgress) return;
    saveStudentProgress({
      studentId: feedbackModalProgress.studentId,
      lessonId: feedbackModalProgress.lessonId,
      courseId: feedbackModalProgress.courseId,
      teacherFeedback: feedbackText,
    });
    setFeedbackModalProgress(null);
  };

  const completedCount = filteredProgress.filter(p => p.status === 'completed').length;
  const inProgressCount = filteredProgress.filter(p => p.status === 'in_progress').length;
  const avgScore = filteredProgress.length > 0
    ? Math.round(filteredProgress.reduce((acc, p) => acc + (p.score || 0), 0) / filteredProgress.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Hệ thống giám sát học tập trực tuyến
            </span>
            <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-600">
              {filteredProgress.length} lượt học
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">
            Theo dõi tiến độ học tập của học sinh
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận thời gian học thực tế, điểm số các điểm dừng, tỷ lệ hoàn thành và phản hồi học tập.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center min-w-[90px]">
            <span className="block text-[10px] font-bold text-emerald-700 uppercase">Hoàn thành</span>
            <span className="text-lg font-extrabold text-emerald-800">{completedCount}</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center min-w-[90px]">
            <span className="block text-[10px] font-bold text-amber-700 uppercase">Đang học</span>
            <span className="text-lg font-extrabold text-amber-800">{inProgressCount}</span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center min-w-[90px]">
            <span className="block text-[10px] font-bold text-blue-700 uppercase">Điểm TB</span>
            <span className="text-lg font-extrabold text-blue-800">{avgScore}đ</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh hoặc lớp..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
          >
            <option value="all">Tất cả khóa học</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="in_progress">Đang học</option>
            <option value="not_started">Chưa bắt đầu</option>
          </select>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Học sinh</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">Khóa học / Bài học</th>
                <th className="py-3.5 px-4">Tiến độ</th>
                <th className="py-3.5 px-4 text-center">Điểm số</th>
                <th className="py-3.5 px-4 text-center">Điểm dừng đạt</th>
                <th className="py-3.5 px-4">Thời gian học</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProgress.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    Chưa có dữ liệu tiến độ phù hợp
                  </td>
                </tr>
              ) : (
                filteredProgress.map((prog) => {
                  const course = courses.find(c => c.id === prog.courseId);
                  const lesson = lessons.find(l => l.id === prog.lessonId);
                  const lessonStops = stops.filter(s => s.lessonId === prog.lessonId);

                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{prog.studentName}</div>
                        <div className="text-[10px] text-slate-400">
                          Lần cuối: {new Date(prog.lastActiveAt).toLocaleString('vi-VN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {prog.studentClass}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-emerald-800 line-clamp-1">{course?.title || 'Khóa học'}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{lesson?.title || 'Bài học'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                prog.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${prog.completionPercentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px] text-slate-700">
                            {prog.completionPercentage}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                          prog.score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                          prog.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {prog.score}đ
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {prog.completedStops.length} / {lessonStops.length}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {Math.floor(prog.timeSpentSeconds / 60)}p {(prog.timeSpentSeconds % 60)}s
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenFeedback(prog)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 mx-auto"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{prog.teacherFeedback ? 'Xem nhận xét' : 'Nhận xét'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Feedback Modal */}
      {feedbackModalProgress && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-bold text-base text-slate-800">
                Nhận xét học sinh: {feedbackModalProgress.studentName}
              </h3>
              <button
                onClick={() => setFeedbackModalProgress(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-500">
                Điểm số: <b className="text-emerald-700 font-bold">{feedbackModalProgress.score}đ</b> • 
                Trạng thái: <b className="text-slate-700">{feedbackModalProgress.status === 'completed' ? 'Đã hoàn thành' : 'Đang học'}</b>
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung nhận xét & động viên của thầy cô:
                </label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Thầy/Cô khen ngợi em hoàn thành bài tốt..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setFeedbackModalProgress(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveFeedback}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Lưu nhận xét
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
