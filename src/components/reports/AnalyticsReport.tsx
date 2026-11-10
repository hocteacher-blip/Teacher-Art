import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import { 
  BarChart3, FileSpreadsheet, Printer, Filter, 
  TrendingUp, Award, Clock, AlertTriangle, 
  CheckCircle2, Users, BookOpen, Sparkles 
} from 'lucide-react';

export const AnalyticsReport: React.FC = () => {
  const { 
    courses, 
    classes, 
    subjects, 
    lessons, 
    stops, 
    progressList, 
    db 
  } = useLMS();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Filter progress
  const filteredProgress = progressList.filter(p => {
    const course = courses.find(c => c.id === p.courseId);
    const matchesClass = selectedClass === 'all' || p.studentClass === selectedClass;
    const matchesSubject = selectedSubject === 'all' || course?.subjectId === selectedSubject;
    const matchesCourse = selectedCourse === 'all' || p.courseId === selectedCourse;
    return matchesClass && matchesSubject && matchesCourse;
  });

  // Calculate Metrics
  const totalAttempts = filteredProgress.length;
  const completedAttempts = filteredProgress.filter(p => p.status === 'completed').length;
  const completionRate = totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0;
  const avgScore = totalAttempts > 0 
    ? Math.round(filteredProgress.reduce((sum, p) => sum + (p.score || 0), 0) / totalAttempts) 
    : 0;
  const avgTimeMinutes = totalAttempts > 0 
    ? Math.round(filteredProgress.reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0) / totalAttempts / 60) 
    : 0;

  // Identify struggling students (score < 60 or completion < 50%)
  const strugglingStudents = filteredProgress.filter(p => p.score < 60 || p.completionPercentage < 50);

  // Difficult stops analysis
  const stopStats: Record<string, { title: string; courseTitle: string; attempts: number; wrongCount: number }> = {};
  filteredProgress.forEach(p => {
    const course = courses.find(c => c.id === p.courseId);
    Object.entries(p.answers || {}).forEach(([stopId, ans]) => {
      const stop = stops.find(s => s.id === stopId);
      if (!stopStats[stopId]) {
        stopStats[stopId] = {
          title: stop?.title || 'Điểm dừng ' + stopId,
          courseTitle: course?.title || '',
          attempts: 0,
          wrongCount: 0,
        };
      }
      stopStats[stopId].attempts += ans.attemptsCount || 1;
      if (!ans.isCorrect) {
        stopStats[stopId].wrongCount += 1;
      }
    });
  });

  const difficultStops = Object.values(stopStats).sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 5);

  // Export to Excel (CSV with UTF-8 BOM)
  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Họ và tên học sinh',
      'Lớp',
      'Khóa học',
      'Bài giảng',
      'Trạng thái',
      'Tiến độ (%)',
      'Điểm số',
      'Thời gian học (giây)',
      'Ngày hoàn thành',
      'Nhận xét của giáo viên',
    ];

    const rows = filteredProgress.map((p, idx) => {
      const course = courses.find(c => c.id === p.courseId);
      const lesson = lessons.find(l => l.id === p.lessonId);
      return [
        idx + 1,
        `"${p.studentName.replace(/"/g, '""')}"`,
        `"${p.studentClass}"`,
        `"${(course?.title || '').replace(/"/g, '""')}"`,
        `"${(lesson?.title || '').replace(/"/g, '""')}"`,
        `"${p.status === 'completed' ? 'Đã hoàn thành' : 'Đang học'}"`,
        p.completionPercentage,
        p.score,
        p.timeSpentSeconds,
        `"${p.completedAt || p.lastActiveAt}"`,
        `"${(p.teacherFeedback || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bao_Cao_Hoc_Tap_LMS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Trung tâm báo cáo & khảo thí điện tử
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              GDPT 2018
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">
            Báo cáo & Thống kê kết quả học tập
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp dữ liệu theo lớp, theo môn học, xác định các điểm dừng khó và học sinh cần hỗ trợ.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel (.CSV)</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 no-print">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Lớp học:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
          >
            <option value="all">Toàn bộ các lớp</option>
            {classes.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Môn học:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Khóa học:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 max-w-xs truncate"
          >
            <option value="all">Tất cả khóa học</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Tỷ lệ hoàn thành</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{completionRate}%</div>
          <span className="text-[11px] text-emerald-600 font-semibold">{completedAttempts}/{totalAttempts} lượt hoàn thành</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Điểm trung bình</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{avgScore}đ</div>
          <span className="text-[11px] text-blue-600 font-semibold">Thang điểm 100</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Thời gian học TB</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{avgTimeMinutes} phút</div>
          <span className="text-[11px] text-slate-400 font-semibold">Mỗi phiên học e-learning</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Cần hỗ trợ</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{strugglingStudents.length} em</div>
          <span className="text-[11px] text-rose-600 font-semibold">Điểm &lt; 60 hoặc chưa đạt</span>
        </div>
      </div>

      {/* Visual Chart Bars by Class */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-heading font-bold text-base text-slate-800 mb-4">
          Biểu đồ tỷ lệ hoàn thành theo lớp học
        </h3>

        <div className="space-y-3">
          {classes.map(cls => {
            const classProg = progressList.filter(p => p.studentClass === cls.name);
            const classCompleted = classProg.filter(p => p.status === 'completed').length;
            const rate = classProg.length > 0 ? Math.round((classCompleted / classProg.length) * 100) : 75;

            return (
              <div key={cls.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{cls.name} (Khối {cls.grade})</span>
                  <span className="font-mono text-emerald-700 font-bold">{rate}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Columns: Difficult Stops & Students Needing Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Difficult Stops */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-heading font-bold text-base text-slate-800">
              Các điểm dừng học sinh gặp khó khăn
            </h3>
          </div>

          <div className="space-y-3">
            {difficultStops.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">Chưa ghi nhận điểm dừng nào có tỷ lệ sai cao.</p>
            ) : (
              difficultStops.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">{item.courseTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 block">
                      {item.wrongCount} lượt sai
                    </span>
                    <span className="text-[10px] text-slate-400">{item.attempts} lần thử</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Struggling Students */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-rose-500" />
            <h3 className="font-heading font-bold text-base text-slate-800">
              Danh sách học sinh cần hỗ trợ & đôn đốc
            </h3>
          </div>

          <div className="space-y-2.5">
            {strugglingStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-emerald-50 rounded-2xl border border-emerald-200">
                🎉 Tất cả các em học sinh đang theo kịp tiến độ rất tốt!
              </div>
            ) : (
              strugglingStudents.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-800">{item.studentName}</span>
                    <span className="text-xs text-slate-500 ml-2">({item.studentClass})</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Tiến độ: {item.completionPercentage}% • Điểm: {item.score}đ
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl">
                    Cần nhắc nhở
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
