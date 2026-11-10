import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { LearningAssignment, Course } from '../../types/lms';
import { 
  Send, Plus, Calendar, Clock, Award, 
  Users, CheckCircle2, AlertCircle, Trash2, X, ChevronRight, BookOpen
} from 'lucide-react';

interface AssignmentManagerProps {
  initialCourse?: Course | null;
  onSelectCourse?: (course: Course) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({ initialCourse, onSelectCourse }) => {
  const { currentUser } = useAuth();
  const { 
    assignments, 
    courses, 
    classes, 
    createAssignment, 
    deleteAssignment,
    progressList 
  } = useLMS();

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const studentId = currentUser?.id;

  const [showModal, setShowModal] = useState(false);
  const [courseId, setCourseId] = useState(initialCourse?.id || courses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<'student' | 'group' | 'class' | 'multiple_classes' | 'school'>('class');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(['CLS_3A']);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [minPassScore, setMinPassScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [allowRetake, setAllowRetake] = useState(true);
  const [note, setNote] = useState('Các em hoàn thành đầy đủ bài học và vượt qua các điểm dừng tương tác.');

  const handleOpenCreate = () => {
    const defaultCourse = courses[0];
    setCourseId(defaultCourse?.id || '');
    setTitle(`Nhiệm vụ: ${defaultCourse?.title || 'Khóa học'}`);
    setTargetType('class');
    setSelectedClassIds(['CLS_3A']);
    setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setMinPassScore(70);
    setMaxAttempts(3);
    setAllowRetake(true);
    setNote('Các em hoàn thành đầy đủ bài học và vượt qua các điểm dừng tương tác.');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const crs = courses.find(c => c.id === courseId);
    const targetNames = classes.filter(c => selectedClassIds.includes(c.id)).map(c => c.name);

    createAssignment({
      courseId,
      title,
      assignedByTeacherId: currentUser?.id || 'USR_GV01',
      assignedByTeacherName: currentUser?.name || 'Giáo viên',
      targetType,
      targetIds: selectedClassIds,
      targetNames: targetType === 'school' ? ['Toàn trường'] : targetNames,
      dueDate,
      minPassScore,
      maxAttempts,
      allowRetake,
      requiredCompletionRate: 100,
      note,
    });

    setShowModal(false);
  };

  const getTargetBadge = (type: string, names: string[]) => {
    switch (type) {
      case 'school':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Toàn trường</span>;
      case 'class':
      case 'multiple_classes':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">{names.join(', ') || 'Lớp học'}</span>;
      case 'student':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Cá nhân học sinh</span>;
      default:
        return null;
    }
  };

  // For students: filter assignments assigned to their class or school
  const studentClassId = currentUser?.classId || 'CLS_3A';
  const displayedAssignments = isTeacherOrAdmin 
    ? assignments 
    : assignments.filter(a => a.targetType === 'school' || a.targetIds.includes(studentClassId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {isTeacherOrAdmin ? 'Kế hoạch học tập & Giao nhiệm vụ' : 'Bài tập & Nhiệm vụ được giao'}
            </span>
            <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-600">
              {displayedAssignments.length} nhiệm vụ
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">
            {isTeacherOrAdmin ? 'Quản lý giao bài học tập' : 'Danh sách bài học cần hoàn thành'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập thời hạn nộp bài, điểm đạt tối thiểu, số lần làm bài và điều kiện tiếp tục cho học sinh.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Giao bài học mới</span>
          </button>
        )}
      </div>

      {/* Assignment List */}
      {displayedAssignments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <Send className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800">Chưa có nhiệm vụ học tập nào</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isTeacherOrAdmin 
              ? 'Hãy giao bài học đầu tiên cho các lớp học hoặc nhóm học sinh để bắt đầu theo dõi tiến độ.'
              : 'Tuyệt vời! Em hiện tại không có bài tập nào còn tồn đọng.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedAssignments.map((asn) => {
            const course = courses.find(c => c.id === asn.courseId);
            const isDueSoon = new Date(asn.dueDate).getTime() - Date.now() < 3 * 86400000;

            return (
              <div
                key={asn.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        <Send className="w-4 h-4" />
                      </span>
                      <div>
                        {getTargetBadge(asn.targetType, asn.targetNames)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hạn: <b className={isDueSoon ? 'text-rose-600' : 'text-slate-700'}>{asn.dueDate}</b></span>
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-base text-slate-800">
                    {asn.title}
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    Khóa học: {course?.title || 'Khóa học'}
                  </p>

                  {asn.note && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                      💡 {asn.note}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Điểm tối thiểu</span>
                      <span className="text-xs font-bold text-emerald-600">{asn.minPassScore}%</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Số lần làm</span>
                      <span className="text-xs font-bold text-slate-700">{asn.maxAttempts} lần</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Học lại</span>
                      <span className="text-xs font-bold text-slate-700">{asn.allowRetake ? 'Cho phép' : 'Không'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Người giao: <b className="text-slate-600">{asn.assignedByTeacherName}</b>
                  </span>

                  <div className="flex items-center space-x-2">
                    {course && onSelectCourse && (
                      <button
                        onClick={() => onSelectCourse(course)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 transition-colors"
                      >
                        <span>{isTeacherOrAdmin ? 'Xem khóa học' : 'Làm bài ngay'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isTeacherOrAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`Hủy nhiệm vụ "${asn.title}"?`)) {
                            deleteAssignment(asn.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl"
                        title="Hủy giao bài"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-lg text-slate-800">
                Giao bài học & bài giảng e-learning
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 max-h-[75vh] overflow-y-auto px-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn khóa học</label>
                <select
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    const c = courses.find(item => item.id === e.target.value);
                    if (c) setTitle(`Nhiệm vụ: ${c.title}`);
                  }}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>[Khối {c.grade} - {c.subjectName}] {c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề nhiệm vụ</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đối tượng giao bài</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="class">Một lớp học</option>
                  <option value="multiple_classes">Nhiều lớp học</option>
                  <option value="school">Toàn trường</option>
                  <option value="student">Một học sinh cụ thể</option>
                </select>
              </div>

              {targetType !== 'school' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chọn lớp học</label>
                  <div className="grid grid-cols-3 gap-2">
                    {classes.map(cls => (
                      <label key={cls.id} className="flex items-center space-x-2 text-xs font-medium p-2 bg-slate-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedClassIds.includes(cls.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClassIds([...selectedClassIds, cls.id]);
                            } else {
                              setSelectedClassIds(selectedClassIds.filter(id => id !== cls.id));
                            }
                          }}
                          className="accent-emerald-600"
                        />
                        <span>{cls.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hạn hoàn thành</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Điểm đạt tối thiểu (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={minPassScore}
                    onChange={(e) => setMinPassScore(parseInt(e.target.value) || 70)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lời nhắn của thầy cô</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Xác nhận giao bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
