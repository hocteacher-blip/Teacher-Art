import React, { useState, useEffect } from 'react';
import { Course, CourseModule, Lesson, LessonStop, LectureType, CourseStatus } from '../../types/lms';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { 
  ArrowLeft, Plus, Edit3, Trash2, PlayCircle, 
  Settings2, Clock, CheckCircle2, ChevronRight, ChevronDown,
  Video, FileCode, FileText, Send, Sparkles, Layers, X, 
  MoveUp, MoveDown, Copy, Save, Eye, Check, AlertCircle, 
  BookOpen, HelpCircle, Film, Award, ShieldCheck, ExternalLink,
  ListOrdered, Calendar, UserCheck
} from 'lucide-react';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onPlayLesson: (lesson: Lesson) => void;
  onEditStops: (lesson: Lesson) => void;
  onAssignCourse: (course: Course) => void;
}

type SelectedNodeType = 'course' | 'module' | 'lesson';

export const CourseDetail: React.FC<CourseDetailProps> = ({
  course: initialCourse,
  onBack,
  onPlayLesson,
  onEditStops,
  onAssignCourse,
}) => {
  const { currentUser } = useAuth();
  const { 
    courses,
    modules, 
    lessons, 
    stops,
    packages,
    classes,
    subjects,
    currentAcademicYear,
    academicYears,
    updateCourse,
    duplicateCourse,
    publishCourse,
    unpublishCourse,
    createModule, 
    updateModule, 
    deleteModule, 
    reorderModules,
    createLesson, 
    updateLesson, 
    deleteLesson, 
    reorderLessons,
    createStop,
    updateStop,
    deleteStop,
    getStopsForLesson,
    getStudentProgress
  } = useLMS();

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const studentId = currentUser?.id || 'USR_GV_HOC';

  // Keep active course synchronized with LMS database in case of updates
  const activeCourse = courses.find(c => c.id === initialCourse.id) || initialCourse;

  // Selected node in tree
  const [selectedNodeType, setSelectedNodeType] = useState<SelectedNodeType>('course');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(activeCourse.id);

  // Expanded modules in tree
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Course General Edit Form State
  const [courseTitle, setCourseTitle] = useState(activeCourse.title);
  const [courseCode, setCourseCode] = useState(activeCourse.code);
  const [courseSubjectId, setCourseSubjectId] = useState(activeCourse.subjectId);
  const [courseGrade, setCourseGrade] = useState(activeCourse.grade);
  const [courseClassId, setCourseClassId] = useState(activeCourse.classId || '');
  const [courseTargetClassIds, setCourseTargetClassIds] = useState<string[]>(activeCourse.targetClassIds || []);
  const [courseAcademicYear, setCourseAcademicYear] = useState(activeCourse.academicYear || currentAcademicYear?.code || '2024-2025');
  const [courseTeacherName, setCourseTeacherName] = useState(activeCourse.teacherName);
  const [courseDescription, setCourseDescription] = useState(activeCourse.description);
  const [courseThumbnail, setCourseThumbnail] = useState(activeCourse.thumbnail);
  const [courseStartDate, setCourseStartDate] = useState(activeCourse.startDate);
  const [courseEndDate, setCourseEndDate] = useState(activeCourse.endDate);
  const [courseStatus, setCourseStatus] = useState<CourseStatus>(activeCourse.status);

  // Sync state when course changes
  useEffect(() => {
    setCourseTitle(activeCourse.title);
    setCourseCode(activeCourse.code);
    setCourseSubjectId(activeCourse.subjectId);
    setCourseGrade(activeCourse.grade);
    setCourseClassId(activeCourse.classId || '');
    setCourseTargetClassIds(activeCourse.targetClassIds || []);
    setCourseAcademicYear(activeCourse.academicYear);
    setCourseTeacherName(activeCourse.teacherName);
    setCourseDescription(activeCourse.description);
    setCourseThumbnail(activeCourse.thumbnail);
    setCourseStartDate(activeCourse.startDate);
    setCourseEndDate(activeCourse.endDate);
    setCourseStatus(activeCourse.status);
  }, [activeCourse]);

  // Modules & lessons for this course
  const courseModules = modules
    .filter(m => m.courseId === activeCourse.id)
    .sort((a, b) => a.order - b.order);

  // Automatically expand all modules by default
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    courseModules.forEach(m => {
      initialExpanded[m.id] = true;
    });
    setExpandedModules(prev => ({ ...initialExpanded, ...prev }));
  }, [courseModules.length]);

  const toggleModuleExpand = (modId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  // Selected module / lesson objects
  const activeModule = courseModules.find(m => m.id === selectedNodeId);
  const activeLesson = lessons.find(l => l.id === selectedNodeId);

  // Module edit state
  const [editModTitle, setEditModTitle] = useState('');
  const [editModDesc, setEditModDesc] = useState('');

  useEffect(() => {
    if (activeModule) {
      setEditModTitle(activeModule.title);
      setEditModDesc(activeModule.description || '');
    }
  }, [activeModule?.id]);

  // Lesson edit state
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonDesc, setEditLessonDesc] = useState('');
  const [editLessonType, setEditLessonType] = useState<LectureType>('video');
  const [editLessonDurationMinutes, setEditLessonDurationMinutes] = useState(5);
  const [editLessonUrl, setEditLessonUrl] = useState('');
  const [editLessonPackageId, setEditLessonPackageId] = useState('');
  const [lessonActiveTab, setLessonActiveTab] = useState<'lecture' | 'stops' | 'preview'>('lecture');

  useEffect(() => {
    if (activeLesson) {
      setEditLessonTitle(activeLesson.title);
      setEditLessonDesc(activeLesson.description);
      setEditLessonType(activeLesson.type);
      setEditLessonDurationMinutes(Math.round((activeLesson.durationSeconds || 300) / 60));
      setEditLessonUrl(activeLesson.contentUrl || '');
      setEditLessonPackageId(activeLesson.packageId || '');
    }
  }, [activeLesson?.id]);

  // Modal create/edit quick stop state
  const [showStopModal, setShowStopModal] = useState(false);
  const [editingStop, setEditingStop] = useState<LessonStop | null>(null);
  const [stopTitle, setStopTitle] = useState('');
  const [stopType, setStopType] = useState<LessonStop['stopType']>('quiz_single');
  const [stopTimeSeconds, setStopTimeSeconds] = useState(30);
  const [stopQuestion, setStopQuestion] = useState('');
  const [stopExplanationCorrect, setStopExplanationCorrect] = useState('');
  const [stopExplanationIncorrect, setStopExplanationIncorrect] = useState('');
  const [stopPoints, setStopPoints] = useState(10);
  const [stopOptions, setStopOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>([
    { id: 'opt_1', text: 'Đáp án A', isCorrect: true },
    { id: 'opt_2', text: 'Đáp án B', isCorrect: false },
    { id: 'opt_3', text: 'Đáp án C', isCorrect: false },
  ]);

  // Modal Preview state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewingLesson, setPreviewingLesson] = useState<Lesson | null>(null);

  // Handler: Save Entire Course Info
  const handleSaveCourseInfo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const subj = subjects.find(s => s.id === courseSubjectId);
    const assignedClasses = classes.filter(cls => courseTargetClassIds.includes(cls.id));
    const assignedClassNames = assignedClasses.map(cls => cls.name);

    updateCourse(activeCourse.id, {
      title: courseTitle,
      code: courseCode,
      subjectId: courseSubjectId,
      subjectName: subj?.name || activeCourse.subjectName,
      grade: courseGrade,
      classId: courseClassId || assignedClasses[0]?.id || '',
      className: assignedClassNames[0] || '',
      targetClassIds: courseTargetClassIds,
      targetClassNames: assignedClassNames,
      academicYear: courseAcademicYear,
      teacherName: courseTeacherName,
      description: courseDescription,
      thumbnail: courseThumbnail,
      startDate: courseStartDate,
      endDate: courseEndDate,
      status: courseStatus,
    });

    showToast('Đã lưu thành công thông tin khóa học!');
  };

  // Handler: Save Module
  const handleSaveModule = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeModule) return;
    updateModule(activeModule.id, {
      title: editModTitle,
      description: editModDesc,
    });
    showToast('Đã lưu cập nhật chủ đề!');
  };

  // Handler: Save Lesson
  const handleSaveLesson = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeLesson) return;

    let contentUrl = editLessonUrl;
    let fileName = activeLesson.fileName || '';

    if (editLessonType === 'scorm12' || editLessonType === 'scorm2004' || editLessonType === 'html5') {
      const pkg = packages.find(p => p.id === editLessonPackageId);
      if (pkg) {
        contentUrl = pkg.packageBlobUrl || '';
        fileName = pkg.fileName;
      }
    }

    updateLesson(activeLesson.id, {
      title: editLessonTitle,
      description: editLessonDesc,
      type: editLessonType,
      durationSeconds: editLessonDurationMinutes * 60,
      contentUrl,
      fileName,
      packageId: editLessonPackageId || undefined,
    });

    showToast('Đã lưu cập nhật bài giảng & điểm dừng!');
  };

  // Handler: Add New Module
  const handleAddNewModule = () => {
    const newOrder = courseModules.length + 1;
    const newMod = createModule({
      courseId: activeCourse.id,
      title: `Chủ đề ${newOrder}: Nội dung bài học mới`,
      description: 'Mô tả tóm tắt nội dung chủ đề bài học',
      order: newOrder,
    });
    setExpandedModules(prev => ({ ...prev, [newMod.id]: true }));
    setSelectedNodeType('module');
    setSelectedNodeId(newMod.id);
    showToast(`Đã thêm Chủ đề ${newOrder}!`);
  };

  // Handler: Add New Lesson to a Module
  const handleAddNewLesson = (moduleId: string) => {
    const modLessons = lessons.filter(l => l.moduleId === moduleId);
    const newOrder = modLessons.length + 1;
    const newLes = createLesson({
      moduleId,
      courseId: activeCourse.id,
      title: `Bài học ${newOrder}: Bài giảng tương tác mới`,
      description: 'Bài học e-learning đa phương tiện chuẩn GDPT 2018',
      type: 'video',
      durationSeconds: 300,
      contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      fileName: 'bai_giang_video.mp4',
      order: newOrder,
    });
    setSelectedNodeType('lesson');
    setSelectedNodeId(newLes.id);
    setExpandedModules(prev => ({ ...prev, [moduleId]: true }));
    showToast(`Đã thêm Bài học ${newOrder}!`);
  };

  // Handler: Move Module Up/Down
  const handleMoveModule = (moduleId: string, direction: 'up' | 'down') => {
    const idx = courseModules.findIndex(m => m.id === moduleId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === courseModules.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const reordered = [...courseModules];
    const temp = reordered[idx];
    reordered[idx] = reordered[swapIdx];
    reordered[swapIdx] = temp;

    reorderModules(activeCourse.id, reordered.map(m => m.id));
    showToast('Đã thay đổi thứ tự chủ đề');
  };

  // Handler: Move Lesson Up/Down
  const handleMoveLesson = (modId: string, lessonId: string, direction: 'up' | 'down') => {
    const modLessons = lessons.filter(l => l.moduleId === modId).sort((a, b) => a.order - b.order);
    const idx = modLessons.findIndex(l => l.id === lessonId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === modLessons.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const reordered = [...modLessons];
    const temp = reordered[idx];
    reordered[idx] = reordered[swapIdx];
    reordered[swapIdx] = temp;

    reorderLessons(modId, reordered.map(l => l.id));
    showToast('Đã thay đổi thứ tự bài học');
  };

  // Handler: Duplicate Course
  const handleDuplicateCourse = () => {
    const cloned = duplicateCourse(activeCourse.id);
    showToast(`Đã tạo bản sao khóa học: "${cloned.title}"!`);
  };

  // Handler: Publish / Unpublish Toggle
  const handleTogglePublish = () => {
    if (activeCourse.status === 'published') {
      unpublishCourse(activeCourse.id);
      showToast('Đã thu hồi khóa học về trạng thái Bản nháp!');
    } else {
      publishCourse(activeCourse.id);
      showToast('Đã xuất bản khóa học thành công!');
    }
  };

  // Quick Stop management handlers
  const handleOpenAddStop = (lessonId: string) => {
    setEditingStop(null);
    setStopTitle(`Điểm dừng kiểm tra ${stops.filter(s => s.lessonId === lessonId).length + 1}`);
    setStopType('quiz_single');
    setStopTimeSeconds(60);
    setStopQuestion('Em hãy chọn câu trả lời đúng nhất:');
    setStopExplanationCorrect('Rất chính xác! Em đã nắm vững kiến thức trọng tâm.');
    setStopExplanationIncorrect('Chưa đúng rồi! Em hãy xem lại đoạn bài giảng vừa rồi nhé.');
    setStopPoints(10);
    setStopOptions([
      { id: 'opt_1', text: 'Đáp án A (chính xác)', isCorrect: true },
      { id: 'opt_2', text: 'Đáp án B', isCorrect: false },
      { id: 'opt_3', text: 'Đáp án C', isCorrect: false },
    ]);
    setShowStopModal(true);
  };

  const handleOpenEditStop = (stop: LessonStop) => {
    setEditingStop(stop);
    setStopTitle(stop.title);
    setStopType(stop.stopType);
    setStopTimeSeconds(stop.timestampSeconds);
    setStopQuestion(stop.questionText);
    setStopExplanationCorrect(stop.explanationCorrect || '');
    setStopExplanationIncorrect(stop.explanationIncorrect || '');
    setStopPoints(stop.points || 10);
    setStopOptions(stop.options ? [...stop.options] : [
      { id: 'opt_1', text: 'Đáp án A', isCorrect: true },
      { id: 'opt_2', text: 'Đáp án B', isCorrect: false },
    ]);
    setShowStopModal(true);
  };

  const handleSaveStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson) return;

    if (editingStop) {
      updateStop(editingStop.id, {
        title: stopTitle,
        stopType,
        timestampSeconds: stopTimeSeconds,
        questionText: stopQuestion,
        explanationCorrect: stopExplanationCorrect,
        explanationIncorrect: stopExplanationIncorrect,
        points: stopPoints,
        options: stopOptions,
      });
      showToast('Đã cập nhật điểm dừng tương tác!');
    } else {
      createStop({
        lessonId: activeLesson.id,
        title: stopTitle,
        stopType,
        timestampSeconds: stopTimeSeconds,
        questionText: stopQuestion,
        explanationCorrect: stopExplanationCorrect,
        explanationIncorrect: stopExplanationIncorrect,
        points: stopPoints,
        continuationPolicy: 'require_correct',
        options: stopOptions,
      });
      showToast('Đã thêm điểm dừng tương tác mới!');
    }
    setShowStopModal(false);
  };

  // Helper format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP ACTION BAR / TOOLBAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Back & Course Summary */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Quay lại danh sách khóa học"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                {activeCourse.code}
              </span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Khối {activeCourse.grade}
              </span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {activeCourse.subjectName}
              </span>
              {activeCourse.status === 'published' ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Đã xuất bản</span>
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Bản nháp
                </span>
              )}
            </div>
            <h1 className="font-heading font-extrabold text-lg sm:text-xl text-slate-800 mt-1 line-clamp-1">
              {activeCourse.title}
            </h1>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Lưu, Xem trước, Xuất bản/Thu hồi, Giao bài, Sao chép) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút Lưu (Save) */}
          <button
            onClick={() => {
              if (selectedNodeType === 'course') handleSaveCourseInfo();
              else if (selectedNodeType === 'module') handleSaveModule();
              else if (selectedNodeType === 'lesson') handleSaveLesson();
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Lưu tất cả thay đổi hiện tại"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lưu</span>
          </button>

          {/* Nút Xem trước (Preview) */}
          <button
            onClick={() => {
              const firstLes = lessons.find(l => l.courseId === activeCourse.id);
              if (firstLes) {
                setPreviewingLesson(firstLes);
                setShowPreviewModal(true);
              } else {
                showToast('Khóa học chưa có bài giảng nào để xem trước!');
              }
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Xem trước khóa học ở chế độ học sinh"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Xem trước</span>
          </button>

          {/* Nút Xuất bản / Thu hồi (Publish / Unpublish) */}
          <button
            onClick={handleTogglePublish}
            className={`px-3.5 py-2 font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeCourse.status === 'published'
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title={activeCourse.status === 'published' ? 'Thu hồi khóa học về bản nháp' : 'Xuất bản khóa học cho học sinh'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeCourse.status === 'published' ? 'Thu hồi khóa học' : 'Xuất bản khóa học'}</span>
          </button>

          {/* Nút Sao chép khóa học (Duplicate) */}
          <button
            onClick={handleDuplicateCourse}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Sao chép toàn bộ cây cấu trúc khóa học"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Sao chép</span>
          </button>

          {/* Nút Giao bài (Assign) */}
          <button
            onClick={() => onAssignCourse(activeCourse)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Giao bài tập/khóa học cho lớp học"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Giao bài</span>
          </button>
        </div>
      </div>

      {/* 2-PANE STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ======================================================== */}
        {/* LEFT PANE: CÂY CẤU TRÚC KHÓA HỌC (5-TIER HIERARCHY TREE) */}
        {/* Khóa học → Chủ đề → Bài học → Bài giảng → Điểm dừng       */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                Cấu trúc phân cấp LMS
              </span>
              <h2 className="font-heading font-extrabold text-sm sm:text-base text-slate-800">
                Cây bài giảng e-Learning
              </h2>
            </div>
            <button
              onClick={handleAddNewModule}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
              title="Thêm chủ đề mới"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm chủ đề</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {/* LEVEL 1: KHÓA HỌC (Root Node) */}
            <div
              onClick={() => {
                setSelectedNodeType('course');
                setSelectedNodeId(activeCourse.id);
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedNodeType === 'course'
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedNodeType === 'course' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Tầng 1: Khóa học</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{activeCourse.title}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                {courseModules.length} chủ đề
              </span>
            </div>

            {/* LEVEL 2 & 3 & 4 & 5: CHỦ ĐỀ & BÀI HỌC & BÀI GIẢNG & ĐIỂM DỪNG */}
            {courseModules.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Chưa có chủ đề nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Nhấn "Thêm chủ đề" để bắt đầu soạn bài giảng</p>
              </div>
            ) : (
              courseModules.map((mod, modIdx) => {
                const isModSelected = selectedNodeType === 'module' && selectedNodeId === mod.id;
                const isExpanded = !!expandedModules[mod.id];
                const modLessons = lessons.filter(l => l.moduleId === mod.id).sort((a, b) => a.order - b.order);

                return (
                  <div
                    key={mod.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isModSelected
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* LEVEL 2: CHỦ ĐỀ (Header) */}
                    <div
                      onClick={() => {
                        setSelectedNodeType('module');
                        setSelectedNodeId(mod.id);
                      }}
                      className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <button
                          onClick={(e) => toggleModuleExpand(mod.id, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase block">
                            Chủ đề {mod.order || modIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {mod.title}
                          </span>
                        </div>
                      </div>

                      {/* Module Reorder & Actions */}
                      <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100">
                        <button
                          disabled={modIdx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveModule(mod.id, 'up');
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          title="Di chuyển lên"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={modIdx === courseModules.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveModule(mod.id, 'down');
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          title="Di chuyển xuống"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddNewLesson(mod.id);
                          }}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer"
                          title="Thêm bài học vào chủ đề này"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* LEVEL 3 & 4 & 5: BÀI HỌC TRONG CHỦ ĐỀ */}
                    {isExpanded && (
                      <div className="pl-6 pr-2.5 pb-2.5 pt-1 space-y-1.5 border-t border-slate-100 bg-slate-50/50">
                        {modLessons.length === 0 ? (
                          <div className="py-2 px-2 text-[11px] text-slate-400 italic flex items-center justify-between">
                            <span>Chưa có bài học</span>
                            <button
                              onClick={() => handleAddNewLesson(mod.id)}
                              className="text-emerald-600 font-bold text-[10px] hover:underline"
                            >
                              + Thêm bài
                            </button>
                          </div>
                        ) : (
                          modLessons.map((les, lesIdx) => {
                            const isLesSelected = selectedNodeType === 'lesson' && selectedNodeId === les.id;
                            const lesStops = stops.filter(s => s.lessonId === les.id);

                            return (
                              <div
                                key={les.id}
                                onClick={() => {
                                  setSelectedNodeType('lesson');
                                  setSelectedNodeId(les.id);
                                }}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  isLesSelected
                                    ? 'bg-emerald-50 border-emerald-500 shadow-2xs'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 min-w-0">
                                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                      {les.type === 'video' ? (
                                        <Video className="w-3.5 h-3.5 text-purple-600" />
                                      ) : (
                                        <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-slate-800 truncate">
                                        Bài {les.order || lesIdx + 1}: {les.title}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Lesson Reorder Buttons */}
                                  <div className="flex items-center space-x-0.5 shrink-0">
                                    <button
                                      disabled={lesIdx === 0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveLesson(mod.id, les.id, 'up');
                                      }}
                                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                      title="Lên trên"
                                    >
                                      <MoveUp className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      disabled={lesIdx === modLessons.length - 1}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveLesson(mod.id, les.id, 'down');
                                      }}
                                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                      title="Xuống dưới"
                                    >
                                      <MoveDown className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* LEVEL 4 & 5 HIERARCHY BADGES: Bài giảng & Điểm dừng */}
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-8">
                                  {/* Level 4: Bài giảng */}
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 flex items-center space-x-1">
                                    <Film className="w-2.5 h-2.5" />
                                    <span>
                                      {les.type === 'video' ? 'Video MP4' : les.type === 'scorm12' ? 'SCORM 1.2' : 'HTML5'}
                                    </span>
                                  </span>

                                  {/* Level 5: Điểm dừng */}
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 flex items-center space-x-1">
                                    <Award className="w-2.5 h-2.5" />
                                    <span>{lesStops.length} Điểm dừng</span>
                                  </span>

                                  <span className="text-[9px] text-slate-400">
                                    {formatTime(les.durationSeconds || 300)}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANE: KHU VỰC CHỈNH SỬA NỘI DUNG CHI TIẾT          */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs">
          {/* CASE A: COURSE ROOT SELECTED */}
          {selectedNodeType === 'course' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                    Cài đặt tổng quan
                  </span>
                  <h3 className="font-heading font-extrabold text-lg text-slate-800">
                    Chỉnh sửa thông tin Khóa học
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveCourseInfo}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thông tin</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveCourseInfo} className="space-y-4">
                {/* Tên & Mã */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên khóa học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="Ví dụ: Tin học lớp 5"
                      className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mã khóa học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="TIN5-HK1"
                      className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Môn học, Khối lớp, Năm học */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Môn học
                    </label>
                    <select
                      value={courseSubjectId}
                      onChange={(e) => setCourseSubjectId(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Khối lớp
                    </label>
                    <select
                      value={courseGrade}
                      onChange={(e) => setCourseGrade(parseInt(e.target.value) || 1)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {[1, 2, 3, 4, 5].map(g => (
                        <option key={g} value={g}>Khối lớp {g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Năm học
                    </label>
                    <select
                      value={courseAcademicYear}
                      onChange={(e) => setCourseAcademicYear(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {academicYears.map(ay => (
                        <option key={ay.id} value={ay.code}>{ay.name} ({ay.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lớp học áp dụng (Multi-select) & Giáo viên */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lớp học áp dụng (học sinh được truy cập)
                    </label>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {classes
                        .filter(cls => cls.grade === courseGrade)
                        .map(cls => {
                          const isChecked = courseTargetClassIds.includes(cls.id);
                          return (
                            <button
                              type="button"
                              key={cls.id}
                              onClick={() => {
                                if (isChecked) {
                                  setCourseTargetClassIds(courseTargetClassIds.filter(id => id !== cls.id));
                                } else {
                                  setCourseTargetClassIds([...courseTargetClassIds, cls.id]);
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
                      {classes.filter(cls => cls.grade === courseGrade).length === 0 && (
                        <span className="text-[11px] text-slate-400">Không có lớp thuộc khối này</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Giáo viên phụ trách
                    </label>
                    <input
                      type="text"
                      required
                      value={courseTeacherName}
                      onChange={(e) => setCourseTeacherName(e.target.value)}
                      placeholder="Thầy Nguyễn Văn Học"
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Mô tả khóa học */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mô tả khóa học
                  </label>
                  <textarea
                    rows={3}
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="Mô tả mục tiêu, yêu cầu cần đạt theo chuẩn chương trình GDPT 2018..."
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Ảnh đại diện */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ảnh đại diện khóa học (URL)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="url"
                      value={courseThumbnail}
                      onChange={(e) => setCourseThumbnail(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="w-12 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                      <img src={courseThumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Ngày bắt đầu & Kết thúc & Trạng thái */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={courseStartDate}
                      onChange={(e) => setCourseStartDate(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={courseEndDate}
                      onChange={(e) => setCourseEndDate(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
                    <select
                      value={courseStatus}
                      onChange={(e) => setCourseStatus(e.target.value as CourseStatus)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                    >
                      <option value="draft">Bản nháp</option>
                      <option value="published">Đã xuất bản</option>
                      <option value="in_progress">Đang diễn ra</option>
                      <option value="completed">Đã kết thúc</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Course Statistical Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Chủ đề</span>
                    <b className="text-slate-800 text-sm">{courseModules.length}</b>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tổng bài học</span>
                    <b className="text-slate-800 text-sm">{lessons.filter(l => l.courseId === activeCourse.id).length}</b>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Điểm dừng tương tác</span>
                    <b className="text-emerald-700 text-sm">
                      {stops.filter(s => lessons.some(l => l.courseId === activeCourse.id && l.id === s.lessonId)).length}
                    </b>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewModule}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm chủ đề đầu tiên</span>
                </button>
              </div>
            </div>
          )}

          {/* CASE B: MODULE SELECTED */}
          {selectedNodeType === 'module' && activeModule && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                    Tầng 2: Quản lý Chủ đề
                  </span>
                  <h3 className="font-heading font-extrabold text-lg text-slate-800">
                    {activeModule.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa chủ đề này và toàn bộ bài học bên trong?')) {
                        deleteModule(activeModule.id);
                        setSelectedNodeType('course');
                        setSelectedNodeId(activeCourse.id);
                        showToast('Đã xóa chủ đề');
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Xóa chủ đề"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveModule}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu chủ đề</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveModule} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên chủ đề <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editModTitle}
                    onChange={(e) => setEditModTitle(e.target.value)}
                    placeholder="Ví dụ: Chủ đề 1: Máy tính và cộng đồng"
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mô tả chủ đề
                  </label>
                  <textarea
                    rows={3}
                    value={editModDesc}
                    onChange={(e) => setEditModDesc(e.target.value)}
                    placeholder="Mô tả các nội dung chính học sinh cần nắm được trong chủ đề này..."
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </form>

              {/* Danh sách bài học trong chủ đề */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-heading font-extrabold text-sm text-slate-800">
                    Danh sách bài học trong chủ đề ({lessons.filter(l => l.moduleId === activeModule.id).length})
                  </h4>
                  <button
                    onClick={() => handleAddNewLesson(activeModule.id)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm bài học mới</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {lessons.filter(l => l.moduleId === activeModule.id).length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      Chưa có bài học nào trong chủ đề này.
                    </p>
                  ) : (
                    lessons
                      .filter(l => l.moduleId === activeModule.id)
                      .sort((a, b) => a.order - b.order)
                      .map((les, lIdx) => (
                        <div
                          key={les.id}
                          onClick={() => {
                            setSelectedNodeType('lesson');
                            setSelectedNodeId(les.id);
                          }}
                          className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-slate-50 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                              {lIdx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-800">{les.title}</div>
                              <div className="text-[11px] text-slate-400">{les.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                              {les.type}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CASE C: LESSON SELECTED (Level 3: Bài học & Level 4: Bài giảng & Level 5: Điểm dừng) */}
          {selectedNodeType === 'lesson' && activeLesson && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Tầng 3, 4 & 5: Bài học & Điểm dừng tương tác
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      {editLessonType.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-800 mt-0.5">
                    {activeLesson.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
                        deleteLesson(activeLesson.id);
                        setSelectedNodeType('module');
                        setSelectedNodeId(activeLesson.moduleId);
                        showToast('Đã xóa bài học');
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Xóa bài học"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onPlayLesson(activeLesson)}
                    className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                    title="Xem toàn màn hình"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Phát bài giảng</span>
                  </button>

                  <button
                    onClick={handleSaveLesson}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu bài học</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Bài giảng / Điểm dừng tương tác / Xem trước */}
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <button
                  onClick={() => setLessonActiveTab('lecture')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    lessonActiveTab === 'lecture'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Bài giảng & Nội dung</span>
                </button>
                <button
                  onClick={() => setLessonActiveTab('stops')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    lessonActiveTab === 'stops'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Điểm dừng tương tác ({stops.filter(s => s.lessonId === activeLesson.id).length})</span>
                </button>
                <button
                  onClick={() => setLessonActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    lessonActiveTab === 'preview'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem trước tương tác</span>
                </button>
              </div>

              {/* TAB 1: BÀI GIẢNG & NỘI DUNG */}
              {lessonActiveTab === 'lecture' && (
                <form onSubmit={handleSaveLesson} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên bài học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editLessonTitle}
                      onChange={(e) => setEditLessonTitle(e.target.value)}
                      placeholder="Bài học 1: Bản quyền nội dung thông tin"
                      className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Loại bài giảng (Level 4: Bài giảng)
                      </label>
                      <select
                        value={editLessonType}
                        onChange={(e) => setEditLessonType(e.target.value as LectureType)}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="video">Video tương tác (MP4)</option>
                        <option value="scorm12">Chuẩn SCORM 1.2 (iSpring / Storyline)</option>
                        <option value="html5">Gói bài giảng HTML5 tương tác</option>
                        <option value="scorm2004">Chuẩn SCORM 2004</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Thời lượng ước tính (phút)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={editLessonDurationMinutes}
                        onChange={(e) => setEditLessonDurationMinutes(parseInt(e.target.value) || 5)}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {editLessonType === 'video' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Đường dẫn Video bài giảng (MP4 URL)
                      </label>
                      <input
                        type="text"
                        value={editLessonUrl}
                        onChange={(e) => setEditLessonUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Chọn gói SCORM / HTML5 từ Kho học liệu số
                      </label>
                      <select
                        value={editLessonPackageId}
                        onChange={(e) => setEditLessonPackageId(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">-- Chọn gói bài giảng đã tải lên --</option>
                        {packages.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.fileName} - {(p.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mô tả & Hướng dẫn học sinh
                    </label>
                    <textarea
                      rows={3}
                      value={editLessonDesc}
                      onChange={(e) => setEditLessonDesc(e.target.value)}
                      placeholder="Hướng dẫn học sinh chú ý xem video và trả lời các câu hỏi kiểm tra tại điểm dừng..."
                      className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </form>
              )}

              {/* TAB 2: ĐIỂM DỪNG TƯƠNG TÁC (Level 5: Điểm dừng) */}
              {lessonActiveTab === 'stops' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-slate-800">
                        Danh sách điểm dừng trên dòng thời gian
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Hệ thống sẽ tạm dừng bài giảng tại các mốc giây này để học sinh làm bài tập kiểm tra.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditStops(activeLesson)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
                        title="Mở giao diện trực quan dòng thời gian timeline"
                      >
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span>Dòng thời gian trực quan</span>
                      </button>
                      <button
                        onClick={() => handleOpenAddStop(activeLesson.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm điểm dừng</span>
                      </button>
                    </div>
                  </div>

                  {/* List of stops */}
                  <div className="space-y-2.5">
                    {stops.filter(s => s.lessonId === activeLesson.id).length === 0 ? (
                      <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">Chưa có điểm dừng nào</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Thêm điểm dừng để biến video bài giảng thành bài học tương tác thông minh.
                        </p>
                        <button
                          onClick={() => handleOpenAddStop(activeLesson.id)}
                          className="mt-3 px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                          + Thêm điểm dừng đầu tiên
                        </button>
                      </div>
                    ) : (
                      stops
                        .filter(s => s.lessonId === activeLesson.id)
                        .sort((a, b) => a.timestampSeconds - b.timestampSeconds)
                        .map((st, sIdx) => (
                          <div
                            key={st.id}
                            className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs flex items-center justify-between transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-mono font-bold text-xs">
                                {formatTime(st.timestampSeconds)}
                              </span>
                              <div>
                                <div className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                                  <span>{st.title}</span>
                                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    {st.points || 10} điểm
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                  {st.questionText}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleOpenEditStop(st)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                                title="Sửa điểm dừng"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Bạn muốn xóa điểm dừng này?')) {
                                    deleteStop(st.id);
                                    showToast('Đã xóa điểm dừng');
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Xóa điểm dừng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: XEM TRƯỚC TƯƠNG TÁC (Live Interactive Preview) */}
              {lessonActiveTab === 'preview' && (
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-inner">
                    {activeLesson.type === 'video' ? (
                      <video
                        controls
                        src={activeLesson.contentUrl}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white p-6">
                        <FileCode className="w-12 h-12 text-emerald-400 mb-3" />
                        <h4 className="text-sm font-bold">{activeLesson.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">Gói SCORM 1.2 / HTML5 tương tác</p>
                        <button
                          onClick={() => onPlayLesson(activeLesson)}
                          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          Chạy mô phỏng toàn màn hình
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QUICK STOP MODAL */}
      {showStopModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-base text-slate-800">
                {editingStop ? 'Chỉnh sửa Điểm dừng tương tác' : 'Thêm Điểm dừng tương tác mới'}
              </h3>
              <button
                onClick={() => setShowStopModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStop} className="space-y-4 pt-4 max-h-[75vh] overflow-y-auto px-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề điểm dừng</label>
                <input
                  type="text"
                  required
                  value={stopTitle}
                  onChange={(e) => setStopTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra kiến thức bản quyền số"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mốc thời gian (giây)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stopTimeSeconds}
                    onChange={(e) => setStopTimeSeconds(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Tương đương: {formatTime(stopTimeSeconds)}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Điểm số</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={stopPoints}
                    onChange={(e) => setStopPoints(parseInt(e.target.value) || 10)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loại câu hỏi</label>
                <select
                  value={stopType}
                  onChange={(e) => setStopType(e.target.value as LessonStop['stopType'])}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="quiz_single">Trắc nghiệm 1 đáp án</option>
                  <option value="quiz_boolean">Đúng / Sai</option>
                  <option value="quiz_multi">Chọn nhiều đáp án</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi</label>
                <textarea
                  rows={2}
                  required
                  value={stopQuestion}
                  onChange={(e) => setStopQuestion(e.target.value)}
                  placeholder="Em hãy chọn đáp án đúng..."
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Các lựa chọn đáp án</label>
                <div className="space-y-2">
                  {stopOptions.map((opt, optIdx) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <input
                        type={stopType === 'quiz_multi' ? 'checkbox' : 'radio'}
                        name="correct_answer"
                        checked={opt.isCorrect}
                        onChange={() => {
                          if (stopType === 'quiz_multi') {
                            setStopOptions(stopOptions.map((o, idx) => idx === optIdx ? { ...o, isCorrect: !o.isCorrect } : o));
                          } else {
                            setStopOptions(stopOptions.map((o, idx) => ({ ...o, isCorrect: idx === optIdx })));
                          }
                        }}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStopOptions(stopOptions.map((o, idx) => idx === optIdx ? { ...o, text: val } : o));
                        }}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStopModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  {editingStop ? 'Cập nhật điểm dừng' : 'Tạo điểm dừng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT PREVIEW MODAL */}
      {showPreviewModal && previewingLesson && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                  Chế độ xem trước của học sinh
                </span>
                <h3 className="font-heading font-extrabold text-base text-slate-800">
                  {previewingLesson.title}
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950">
                <video
                  controls
                  src={previewingLesson.contentUrl}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-xs text-slate-800">Các điểm dừng trên bài học:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {stops.filter(s => s.lessonId === previewingLesson.id).map(st => (
                    <span key={st.id} className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-700">
                      [{formatTime(st.timestampSeconds)}] {st.title}
                    </span>
                  ))}
                  {stops.filter(s => s.lessonId === previewingLesson.id).length === 0 && (
                    <span className="text-xs text-slate-400 italic">Chưa có điểm dừng</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
