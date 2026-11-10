import React, { useState } from 'react';
import { Course, CourseStatus } from '../../types/lms';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { 
  Plus, Search, Filter, BookOpen, Clock, 
  Users, CheckCircle2, ChevronRight, Edit3, Trash2, 
  Calendar, Layers, Sparkles, X, Copy, Check, Send, Award
} from 'lucide-react';

interface CourseListProps {
  onSelectCourse: (course: Course) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ onSelectCourse }) => {
  const { currentUser } = useAuth();
  const { 
    courses, 
    subjects, 
    classes, 
    createCourse, 
    updateCourse, 
    deleteCourse, 
    duplicateCourse,
    publishCourse,
    unpublishCourse,
    lessons, 
    stops,
    progressList, 
    currentAcademicYear, 
    academicYears,
    teachingAssignments 
  } = useLMS();

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const studentId = currentUser?.id;

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal create/edit course states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [subjectId, setSubjectId] = useState('SUB_TIN');
  const [grade, setGrade] = useState(3);
  const [targetClassIds, setTargetClassIds] = useState<string[]>([]);
  const [academicYear, setAcademicYear] = useState(currentAcademicYear?.code || '2024-2025');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [startDate, setStartDate] = useState('2024-09-05');
  const [endDate, setEndDate] = useState('2025-05-20');
  const [status, setStatus] = useState<CourseStatus>('published');
  const [teacherName, setTeacherName] = useState(currentUser?.name || 'Thầy Nguyễn Văn Học');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || c.grade === selectedGrade;
    const matchesSubject = selectedSubject === 'all' || c.subjectId === selectedSubject;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesSubject && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setTitle('');
    setCode('KH-' + Math.floor(100 + Math.random() * 900));
    setSubjectId(subjects[0]?.id || 'SUB_TIN');
    setGrade(3);
    setTargetClassIds([]);
    setAcademicYear(currentAcademicYear?.code || '2024-2025');
    setDescription('Chương trình học tập trực tuyến chuẩn GDPT 2018 dành cho học sinh tiểu học.');
    setThumbnail('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]);
    setStatus('published');
    setTeacherName(currentUser?.name || 'Thầy Nguyễn Văn Học');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCourse(c);
    setTitle(c.title);
    setCode(c.code);
    setSubjectId(c.subjectId);
    setGrade(c.grade);
    setTargetClassIds(c.targetClassIds || (c.classId ? [c.classId] : []));
    setAcademicYear(c.academicYear || currentAcademicYear?.code || '2024-2025');
    setDescription(c.description);
    setThumbnail(c.thumbnail);
    setStartDate(c.startDate);
    setEndDate(c.endDate);
    setStatus(c.status);
    setTeacherName(c.teacherName);
    setIsModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find(s => s.id === subjectId);
    const assignedClasses = classes.filter(cls => targetClassIds.includes(cls.id));
    const assignedClassNames = assignedClasses.map(cls => cls.name);

    const payload: Partial<Course> = {
      title,
      code,
      subjectId,
      subjectName: subj?.name || 'Môn học',
      grade,
      classId: assignedClasses[0]?.id || '',
      className: assignedClassNames[0] || '',
      targetClassIds,
      targetClassNames: assignedClassNames,
      description,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
      startDate,
      endDate,
      status,
      teacherId: currentUser?.id || 'USR_GV_HOC',
      teacherName,
      academicYear,
    };

    if (editingCourse) {
      updateCourse(editingCourse.id, payload);
      showToast('Đã cập nhật thông tin khóa học');
    } else {
      const created = createCourse(payload);
      showToast(`Đã tạo khóa học: ${created.title}`);
    }
    setIsModalOpen(false);
  };

  const handleDuplicate = (c: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned = duplicateCourse(c.id);
    showToast(`Đã nhân bản khóa học thành bản nháp: "${cloned.title}"`);
  };

  const handleTogglePublish = (c: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    if (c.status === 'published') {
      unpublishCourse(c.id);
      showToast(`Đã thu hồi "${c.title}" về Bản nháp`);
    } else {
      publishCourse(c.id);
      showToast(`Đã xuất bản "${c.title}"`);
    }
  };

  const getStatusBadge = (s: CourseStatus) => {
    switch (s) {
      case 'published':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Đã xuất bản</span>;
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Đang diễn ra</span>;
      case 'draft':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Bản nháp</span>;
      case 'completed':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Đã kết thúc</span>;
    }
  };

  // Helper to compute student completion for a course
  const getStudentCourseStats = (courseId: string) => {
    const courseLessons = lessons.filter(l => l.courseId === courseId);
    if (courseLessons.length === 0) return { percent: 0, completed: 0, total: 0 };

    let completed = 0;
    courseLessons.forEach(l => {
      const p = progressList.find(prog => prog.studentId === studentId && prog.lessonId === l.id);
      if (p && p.status === 'completed') completed++;
    });

    const percent = Math.round((completed / courseLessons.length) * 100);
    return { percent, completed, total: courseLessons.length };
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold border border-slate-700">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {currentUser?.role === 'student' ? 'Góc học tập của em' : 'Hệ thống Quản lý Khóa học LMS'}
            </span>
            <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-600">
              {courses.length} khóa học
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">
            {currentUser?.role === 'student' ? 'Các khóa học trực tuyến của em' : 'Quản lý Khóa học & Bài giảng e-Learning'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mô hình cấu trúc 5 tầng: Khóa học → Chủ đề → Bài học → Bài giảng → Điểm dừng kiểm tra kiến thức.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo khóa học mới</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mã khóa học..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Grade filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700"
          >
            <option value="all">Tất cả Khối lớp</option>
            <option value="1">Khối 1</option>
            <option value="2">Khối 2</option>
            <option value="3">Khối 3</option>
            <option value="4">Khối 4</option>
            <option value="5">Khối 5</option>
          </select>

          {/* Subject filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700"
          >
            <option value="all">Tất cả Môn học</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Status filter */}
          {isTeacherOrAdmin && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="in_progress">Đang diễn ra</option>
              <option value="completed">Đã kết thúc</option>
            </select>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-slate-700">
            {courses.length === 0 ? 'Chưa có khóa học nào trên hệ thống' : 'Không tìm thấy khóa học phù hợp'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {courses.length === 0 
              ? 'Tất cả các khóa học mẫu đã được dọn sạch. Thầy/Cô có thể tạo khóa học mới để bắt đầu sử dụng.'
              : 'Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc Khối lớp và Môn học.'}
          </p>
          {isTeacherOrAdmin && courses.length === 0 && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo khóa học mới</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const courseLessonsCount = lessons.filter(l => l.courseId === course.id).length;
            const courseStopsCount = stops.filter(s => lessons.some(l => l.courseId === course.id && l.id === s.lessonId)).length;
            const studentStats = getStudentCourseStats(course.id);

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 shadow-xs">
                        Khối {course.grade}
                      </span>
                      <span className="bg-emerald-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs">
                        {course.subjectName}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {getStatusBadge(course.status)}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase opacity-90">
                        {course.code} • {course.academicYear}
                      </span>
                      <h4 className="font-heading font-extrabold text-base leading-tight mt-0.5 line-clamp-1 drop-shadow-xs">
                        {course.title}
                      </h4>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Classes applied */}
                    <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-600">Lớp:</span>
                      <div className="flex flex-wrap gap-1">
                        {course.targetClassNames && course.targetClassNames.length > 0 ? (
                          course.targetClassNames.map(cn => (
                            <span key={cn} className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-700">
                              {cn}
                            </span>
                          ))
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-700">
                            {course.className || 'Toàn khối'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hierarchy Stats (Lessons & Stops) */}
                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        <span><b>{courseLessonsCount}</b> bài học</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span><b>{courseStopsCount}</b> điểm dừng</span>
                      </div>
                    </div>

                    {/* Progress for student */}
                    {currentUser?.role === 'student' && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-600">Tiến độ của em:</span>
                          <span className="text-emerald-600 font-bold">{studentStats.percent}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${studentStats.percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Info & Quick Actions */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 block text-[11px] truncate max-w-[120px]">
                      {course.teacherName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Cập nhật: {new Date(course.updatedAt || course.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {isTeacherOrAdmin && (
                      <>
                        <button
                          onClick={(e) => handleDuplicate(course, e)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Sao chép khóa học"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleTogglePublish(course, e)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            course.status === 'published'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={course.status === 'published' ? 'Thu hồi về bản nháp' : 'Xuất bản khóa học'}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleOpenEdit(course, e)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Xóa khóa học "${course.title}" và toàn bộ bài giảng bên trong?`)) {
                              deleteCourse(course.id);
                              showToast('Đã xóa khóa học');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa khóa học"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-lg text-slate-800">
                {editingCourse ? 'Chỉnh sửa khóa học' : 'Tạo khóa học trực tuyến mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 pt-4 max-h-[75vh] overflow-y-auto px-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên khóa học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Tin học lớp 5"
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã khóa học</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="TIN5-HK1"
                    className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(parseInt(e.target.value) || 1)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={g}>Khối lớp {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Năm học</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  >
                    {academicYears.map(ay => (
                      <option key={ay.id} value={ay.code}>{ay.name} ({ay.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lớp học áp dụng */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lớp học áp dụng (Học sinh lớp được phân quyền truy cập)
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {classes
                    .filter(c => c.grade === grade)
                    .map(cls => {
                      const isChecked = targetClassIds.includes(cls.id);
                      return (
                        <button
                          type="button"
                          key={cls.id}
                          onClick={() => {
                            if (isChecked) {
                              setTargetClassIds(targetClassIds.filter(id => id !== cls.id));
                            } else {
                              setTargetClassIds([...targetClassIds, cls.id]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isChecked
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {cls.name}
                        </button>
                      );
                    })}
                  {classes.filter(c => c.grade === grade).length === 0 && (
                    <span className="text-[11px] text-slate-400">Không có lớp học nào thuộc khối này</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái khóa học</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CourseStatus)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="in_progress">Đang diễn ra</option>
                    <option value="completed">Đã kết thúc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giáo viên phụ trách</label>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Thầy Nguyễn Văn Học"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả khóa học</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mục tiêu bài học, kiến thức trọng tâm..."
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ảnh đại diện (URL)</label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  {editingCourse ? 'Lưu thay đổi' : 'Tạo khóa học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
