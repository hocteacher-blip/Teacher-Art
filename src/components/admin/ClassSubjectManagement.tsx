import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { School, AcademicYear, SchoolClass, Subject, TeachingAssignment, User } from '../../types/lms';
import { 
  Building2, Calendar, Layers, BookOpen, Users, 
  Plus, Edit3, Trash2, ArrowRightLeft, Upload, 
  Download, CheckCircle2, AlertTriangle, X, Search, 
  Filter, ShieldCheck, ChevronRight, Eye, RefreshCw, 
  Copy, GraduationCap, Laptop, Calculator, Languages, 
  Palette, HeartHandshake, Sparkles, Compass, Check,
  UserCheck, ExternalLink, Clock, FileSpreadsheet,
  Phone, Mail, Globe, MapPin, User as UserIcon
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { FormField, Input, Select, Textarea } from '../common/Form';
import { EmptyState } from '../common/EmptyState';
import { formatDateVN } from '../../utils/formatters';

type TabType = 'school' | 'academic_years' | 'classes' | 'subjects' | 'assignments';

export const ClassSubjectManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    school, updateSchool,
    academicYears, currentAcademicYear, createAcademicYear, updateAcademicYear, setCurrentAcademicYear, archiveAcademicYear, copyClassStructure, transitionAcademicYear,
    classes, createClass, updateClass, deleteClass, transferStudent,
    subjects, createSubject, updateSubject, deleteSubject,
    teachingAssignments, createTeachingAssignment, updateTeachingAssignment, deleteTeachingAssignment,
    db, createUsersBatch, courses
  } = useLMS();

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';

  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // -------------------------------------------------------------
  // TAB 1: TRƯỜNG HỌC (SCHOOL INFO)
  // -------------------------------------------------------------
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [schoolName, setSchoolName] = useState(school.name);
  const [schoolCode, setSchoolCode] = useState(school.code || 'TH-LVT01');
  const [schoolAddress, setSchoolAddress] = useState(school.address);
  const [schoolPhone, setSchoolPhone] = useState(school.phone);
  const [schoolEmail, setSchoolEmail] = useState(school.email);
  const [schoolPrincipal, setSchoolPrincipal] = useState(school.principalName);
  const [schoolAcademicYear, setSchoolAcademicYear] = useState(school.academicYear);
  const [schoolLogo, setSchoolLogo] = useState(school.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=80');
  const [schoolWebsite, setSchoolWebsite] = useState(school.website || 'https://th-levantam.hanoi.edu.vn');

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchool({
      name: schoolName,
      code: schoolCode,
      address: schoolAddress,
      phone: schoolPhone,
      email: schoolEmail,
      principalName: schoolPrincipal,
      academicYear: schoolAcademicYear,
      logo: schoolLogo,
      website: schoolWebsite,
    });
    setIsEditingSchool(false);
    showToast('Cập nhật thông tin trường học thành công!');
  };

  // -------------------------------------------------------------
  // TAB 2: NĂM HỌC (ACADEMIC YEARS)
  // -------------------------------------------------------------
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [yearCode, setYearCode] = useState('');
  const [yearName, setYearName] = useState('');
  const [yearStartDate, setYearStartDate] = useState('2025-09-05');
  const [yearEndDate, setYearEndDate] = useState('2026-05-31');
  const [yearNotes, setYearNotes] = useState('');

  // Year copy/transition modal
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromYear, setCopyFromYear] = useState(currentAcademicYear?.id || 'AY_2024_2025');
  const [copyToYear, setCopyToYear] = useState('');

  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [transitionFromYear, setTransitionFromYear] = useState(currentAcademicYear?.id || 'AY_2024_2025');
  const [transitionToYear, setTransitionToYear] = useState('');
  const [advanceGradesCheck, setAdvanceGradesCheck] = useState(true);

  const handleOpenYearCreate = () => {
    setEditingYear(null);
    setYearCode('2025-2026');
    setYearName('Năm học 2025 - 2026');
    setYearStartDate('2025-09-05');
    setYearEndDate('2026-05-31');
    setYearNotes('Kế hoạch năm học mới tiếp tục đổi mới GDPT 2018');
    setShowYearModal(true);
  };

  const handleSaveYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingYear) {
      updateAcademicYear(editingYear.id, {
        code: yearCode,
        name: yearName,
        startDate: yearStartDate,
        endDate: yearEndDate,
        notes: yearNotes,
      });
      showToast(`Đã cập nhật năm học ${yearCode}!`);
    } else {
      createAcademicYear({
        code: yearCode,
        name: yearName,
        startDate: yearStartDate,
        endDate: yearEndDate,
        notes: yearNotes,
        isCurrent: false,
        status: 'active',
      });
      showToast(`Đã khởi tạo năm học mới ${yearCode}!`);
    }
    setShowYearModal(false);
  };

  const handleExecuteCopyStructure = () => {
    if (!copyToYear) {
      alert('Vui lòng chọn năm học đích để sao chép!');
      return;
    }
    const count = copyClassStructure(copyFromYear, copyToYear);
    setShowCopyModal(false);
    showToast(`Đã sao chép thành công ${count} lớp học sang năm học mới!`);
  };

  const handleExecuteTransition = () => {
    if (!transitionToYear) {
      alert('Vui lòng chọn năm học đích để kết chuyển!');
      return;
    }
    const result = transitionAcademicYear(transitionFromYear, transitionToYear, advanceGradesCheck);
    setShowTransitionModal(false);
    showToast(`Kết chuyển năm học thành công: Cập nhật ${result.updatedClasses} lớp và nâng khối cho ${result.updatedStudents} học sinh!`);
  };

  // -------------------------------------------------------------
  // TAB 3: LỚP HỌC (CLASSES GRADE 1 - 5)
  // -------------------------------------------------------------
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [classSearch, setClassSearch] = useState('');

  // Class Modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [classNameInput, setClassNameInput] = useState('');
  const [classCodeInput, setClassCodeInput] = useState('');
  const [classGradeInput, setClassGradeInput] = useState<number>(3);
  const [classTeacherId, setClassTeacherId] = useState('USR_GV_HOC');
  const [classYearId, setClassYearId] = useState(currentAcademicYear?.id || 'AY_2024_2025');
  const [classRoom, setClassRoom] = useState('P.301');

  // Student Roster Modal (View & Manage Students in Class)
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<SchoolClass | null>(null);
  const [studentSearchInClass, setStudentSearchInClass] = useState('');

  // Transfer Student Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState<User | null>(null);
  const [transferTargetClassId, setTransferTargetClassId] = useState('');

  // Add Existing Student to Class Modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedUnassignedStudentId, setSelectedUnassignedStudentId] = useState('');

  // Import Class Students Modal
  const [showImportClassModal, setShowImportClassModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const teachersList = db.users.filter(u => u.role === 'teacher' || u.role === 'admin');
  const allStudents = db.users.filter(u => u.role === 'student');

  const filteredClasses = classes.filter(c => {
    const matchesGrade = selectedGradeFilter === 'all' || c.grade === selectedGradeFilter;
    const matchesYear = selectedYearFilter === 'all' || c.academicYearId === selectedYearFilter;
    const matchesSearch = !classSearch || 
      c.name.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(classSearch.toLowerCase()) ||
      (c.homeroomTeacherName && c.homeroomTeacherName.toLowerCase().includes(classSearch.toLowerCase()));
    return matchesGrade && matchesYear && matchesSearch;
  });

  const handleOpenCreateClass = () => {
    setEditingClass(null);
    const nextNum = Math.floor(10 + Math.random() * 90);
    setClassNameInput(`Lớp 3C`);
    setClassCodeInput(`LOP-3C`);
    setClassGradeInput(3);
    setClassTeacherId('USR_GV_HOC');
    setClassYearId(currentAcademicYear?.id || 'AY_2024_2025');
    setClassRoom(`P.3${nextNum % 10}`);
    setShowClassModal(true);
  };

  const handleOpenEditClass = (cls: SchoolClass) => {
    setEditingClass(cls);
    setClassNameInput(cls.name);
    setClassCodeInput(cls.code);
    setClassGradeInput(cls.grade);
    setClassTeacherId(cls.homeroomTeacherId);
    setClassYearId(cls.academicYearId);
    setClassRoom(cls.roomNumber || 'P.101');
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachersList.find(t => t.id === classTeacherId);
    const yearObj = academicYears.find(y => y.id === classYearId);

    if (editingClass) {
      updateClass(editingClass.id, {
        name: classNameInput,
        code: classCodeInput,
        grade: classGradeInput,
        homeroomTeacherId: classTeacherId,
        homeroomTeacherName: teacher?.name || 'Giáo viên',
        academicYearId: classYearId,
        academicYearName: yearObj?.code || '2024-2025',
        roomNumber: classRoom,
      });
      showToast(`Đã cập nhật thông tin ${classNameInput}!`);
    } else {
      createClass({
        name: classNameInput,
        code: classCodeInput,
        grade: classGradeInput,
        homeroomTeacherId: classTeacherId,
        homeroomTeacherName: teacher?.name || 'Giáo viên',
        academicYearId: classYearId,
        academicYearName: yearObj?.code || '2024-2025',
        studentCount: 0,
        status: 'active',
        roomNumber: classRoom,
      });
      showToast(`Đã tạo mới ${classNameInput} thành công!`);
    }
    setShowClassModal(false);
  };

  const handleDeleteClass = (cls: SchoolClass) => {
    if (cls.studentCount > 0) {
      if (!confirm(`${cls.name} đang có ${cls.studentCount} học sinh. Bạn có chắc chắn muốn xóa lớp này không?`)) {
        return;
      }
    } else {
      if (!confirm(`Bạn có chắc chắn muốn xóa ${cls.name}?`)) return;
    }
    deleteClass(cls.id);
    showToast(`Đã xóa ${cls.name}`);
  };

  // Get real student list for a class
  const getStudentsForClass = (cls: SchoolClass) => {
    return allStudents.filter(s => s.classId === cls.id || s.className === cls.name);
  };

  // Export class students to CSV UTF-8 BOM
  const handleExportClassStudents = (cls: SchoolClass) => {
    const studentsInClass = getStudentsForClass(cls);
    if (studentsInClass.length === 0) {
      alert(`Lớp ${cls.name} hiện chưa có học sinh để xuất danh sách.`);
      return;
    }

    const headers = ['STT', 'Mã học sinh', 'Họ và tên', 'Tên đăng nhập', 'Email', 'Ngày sinh', 'Lớp', 'Trạng thái'];
    const rows = studentsInClass.map((s, index) => [
      index + 1,
      s.code,
      `"${s.name.replace(/"/g, '""')}"`,
      s.username || '',
      s.email,
      s.birthDate || 'Chưa cập nhật',
      cls.name,
      s.status === 'active' ? 'Đang học' : 'Đã khóa'
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Hoc_Sinh_${cls.name.replace(/\s+/g, '_')}_${school.academicYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Đã xuất danh sách học sinh ${cls.name} ra file Excel!`);
  };

  // Transfer Student action
  const handleExecuteTransfer = () => {
    if (!studentToTransfer || !transferTargetClassId) {
      alert('Vui lòng chọn lớp chuyển đến!');
      return;
    }
    const targetClass = classes.find(c => c.id === transferTargetClassId);
    transferStudent(studentToTransfer.id, transferTargetClassId);
    setShowTransferModal(false);
    showToast(`Đã chuyển em ${studentToTransfer.name} sang ${targetClass?.name || 'lớp mới'} thành công!`);
  };

  // -------------------------------------------------------------
  // TAB 4: MÔN HỌC (SUBJECTS)
  // -------------------------------------------------------------
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectPeriods, setSubjectPeriods] = useState<number>(2);
  const [subjectGrades, setSubjectGrades] = useState<number[]>([1, 2, 3, 4, 5]);
  const [subjectDesc, setSubjectDesc] = useState('');
  const [subjectColor, setSubjectColor] = useState('bg-blue-500');

  const handleOpenCreateSubject = () => {
    setEditingSubject(null);
    setSubjectName('');
    setSubjectCode('');
    setSubjectPeriods(2);
    setSubjectGrades([1, 2, 3, 4, 5]);
    setSubjectDesc('');
    setSubjectColor('bg-blue-500');
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectName(sub.name);
    setSubjectCode(sub.code);
    setSubjectPeriods(sub.periodsPerWeek || 2);
    setSubjectGrades(sub.grades);
    setSubjectDesc(sub.description || '');
    setSubjectColor(sub.color || 'bg-blue-500');
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name: subjectName,
        code: subjectCode.toUpperCase(),
        periodsPerWeek: subjectPeriods,
        grades: subjectGrades,
        description: subjectDesc,
        color: subjectColor,
      });
      showToast(`Đã cập nhật môn ${subjectName}!`);
    } else {
      createSubject({
        name: subjectName,
        code: subjectCode.toUpperCase(),
        periodsPerWeek: subjectPeriods,
        grades: subjectGrades,
        description: subjectDesc,
        color: subjectColor,
        icon: 'BookOpen',
      });
      showToast(`Đã thêm môn ${subjectName} vào chương trình học!`);
    }
    setShowSubjectModal(false);
  };

  const handleDeleteSubject = (sub: Subject) => {
    if (confirm(`Bạn có chắc chắn muốn xóa môn học "${sub.name}" khỏi danh mục nhà trường?`)) {
      deleteSubject(sub.id);
      showToast(`Đã xóa môn ${sub.name}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 5: PHÂN CÔNG GIẢNG DẠY (TEACHING ASSIGNMENTS)
  // -------------------------------------------------------------
  const [assignmentViewMode, setAssignmentViewMode] = useState<'teacher' | 'class' | 'subject'>('teacher');
  const [assignmentTeacherFilter, setAssignmentTeacherFilter] = useState<string>('all');
  const [assignmentClassFilter, setAssignmentClassFilter] = useState<string>('all');
  const [assignmentSubjectFilter, setAssignmentSubjectFilter] = useState<string>('all');

  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TeachingAssignment | null>(null);
  const [assignTeacherId, setAssignTeacherId] = useState('USR_GV_HOC');
  const [assignClassId, setAssignClassId] = useState('CLS_3A');
  const [assignSubjectId, setAssignSubjectId] = useState('SUB_TIN');
  const [assignPeriods, setAssignPeriods] = useState<number>(2);
  const [assignRole, setAssignRole] = useState<'primary' | 'assistant'>('primary');
  const [assignNotes, setAssignNotes] = useState('');

  const filteredAssignments = teachingAssignments.filter(a => {
    const matchesTeacher = assignmentTeacherFilter === 'all' || a.teacherId === assignmentTeacherFilter;
    const matchesClass = assignmentClassFilter === 'all' || a.classId === assignmentClassFilter;
    const matchesSubject = assignmentSubjectFilter === 'all' || a.subjectId === assignmentSubjectFilter;
    return matchesTeacher && matchesClass && matchesSubject;
  });

  const handleOpenCreateAssign = () => {
    setEditingAssignment(null);
    setAssignTeacherId('USR_GV_HOC');
    setAssignClassId('CLS_3A');
    setAssignSubjectId('SUB_TIN');
    setAssignPeriods(2);
    setAssignRole('primary');
    setAssignNotes('Phụ trách giảng dạy và đánh giá');
    setShowAssignModal(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const t = teachersList.find(item => item.id === assignTeacherId);
    const c = classes.find(item => item.id === assignClassId);
    const s = subjects.find(item => item.id === assignSubjectId);

    if (editingAssignment) {
      updateTeachingAssignment(editingAssignment.id, {
        teacherId: assignTeacherId,
        teacherName: t?.name || 'Giáo viên',
        classId: assignClassId,
        className: c?.name || 'Lớp học',
        grade: c?.grade || 3,
        subjectId: assignSubjectId,
        subjectName: s?.name || 'Môn học',
        periodsPerWeek: assignPeriods,
        roleInClass: assignRole,
        notes: assignNotes,
      });
      showToast(`Đã cập nhật phân công giảng dạy!`);
    } else {
      createTeachingAssignment({
        teacherId: assignTeacherId,
        teacherName: t?.name || 'Giáo viên',
        classId: assignClassId,
        className: c?.name || 'Lớp học',
        grade: c?.grade || 3,
        subjectId: assignSubjectId,
        subjectName: s?.name || 'Môn học',
        academicYearId: c?.academicYearId || currentAcademicYear?.id || 'AY_2024_2025',
        periodsPerWeek: assignPeriods,
        roleInClass: assignRole,
        notes: assignNotes,
      });
      showToast(`Đã phân công ${t?.name} dạy môn ${s?.name} (${c?.name})!`);
    }
    setShowAssignModal(false);
  };

  const handleDeleteAssignment = (assign: TeachingAssignment) => {
    if (confirm(`Bạn có chắc muốn xóa phân công môn ${assign.subjectName} tại ${assign.className} của ${assign.teacherName}?`)) {
      deleteTeachingAssignment(assign.id);
      showToast(`Đã xóa phân công giảng dạy`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-700/30">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
              <img 
                src={school.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=80'} 
                alt="Logo trường" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {school.code || 'TH-LVT01'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  <span>{currentAcademicYear?.name || `Năm học ${school.academicYear}`}</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 font-heading">
                {school.name}
              </h1>
              <p className="text-xs text-emerald-100/80 flex items-center mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-300 flex-shrink-0" />
                <span>{school.address}</span>
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
            <div className="px-3 py-1.5">
              <p className="text-[10px] uppercase font-bold text-emerald-300/80">Khối lớp</p>
              <p className="text-lg font-extrabold font-heading text-white">5 Khối</p>
            </div>
            <div className="px-3 py-1.5 border-l border-white/10">
              <p className="text-[10px] uppercase font-bold text-emerald-300/80">Tổng số lớp</p>
              <p className="text-lg font-extrabold font-heading text-white">{classes.length} Lớp</p>
            </div>
            <div className="px-3 py-1.5 border-l border-white/10">
              <p className="text-[10px] uppercase font-bold text-emerald-300/80">Môn học</p>
              <p className="text-lg font-extrabold font-heading text-white">{subjects.length} Môn</p>
            </div>
            <div className="px-3 py-1.5 border-l border-white/10">
              <p className="text-[10px] uppercase font-bold text-emerald-300/80">Phân công</p>
              <p className="text-lg font-extrabold font-heading text-white">{teachingAssignments.length} Lớp/Môn</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center space-x-1 sm:space-x-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'classes'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Quản lý Lớp học ({classes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>4. Quản lý Môn học ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'assignments'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>5. Phân công giảng dạy ({teachingAssignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('academic_years')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'academic_years'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>2. Quản lý Năm học ({academicYears.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('school')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'school'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Thông tin Trường học</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: THÔNG TIN TRƯỜNG HỌC                                              */}
      {/* ========================================================================= */}
      {activeTab === 'school' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left card: School Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-slate-100 shadow-md bg-slate-50 flex items-center justify-center">
                <img 
                  src={school.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=80'} 
                  alt="School Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h2 className="font-heading font-extrabold text-xl text-slate-800 mt-4">{school.name}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Mã trường: <span className="font-bold text-slate-700">{school.code || 'TH-LVT01'}</span></p>

            <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3 text-left text-xs">
              <div className="flex items-center space-x-3 text-slate-600">
                <UserIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Hiệu trưởng</p>
                  <p className="font-bold text-slate-800">{school.principalName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Năm học áp dụng</p>
                  <p className="font-bold text-slate-800">{school.academicYear}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Điện thoại</p>
                  <p className="font-bold text-slate-800">{school.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Hòm thư điện tử</p>
                  <p className="font-bold text-slate-800">{school.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Cổng thông tin</p>
                  <a href={school.website} target="_blank" rel="noreferrer" className="font-bold text-emerald-600 hover:underline">
                    {school.website || 'th-levantam.hanoi.edu.vn'}
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSchoolName(school.name);
                setSchoolCode(school.code || 'TH-LVT01');
                setSchoolAddress(school.address);
                setSchoolPhone(school.phone);
                setSchoolEmail(school.email);
                setSchoolPrincipal(school.principalName);
                setSchoolAcademicYear(school.academicYear);
                setSchoolLogo(school.logo);
                setSchoolWebsite(school.website || '');
                setIsEditingSchool(true);
              }}
              className="mt-6 w-full py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors border border-emerald-200/60"
            >
              <Edit3 className="w-4 h-4" />
              <span>Cập nhật thông tin trường</span>
            </button>
          </div>

          {/* Right: Overview / Edit Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            {isEditingSchool ? (
              <form onSubmit={handleSaveSchool} className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="font-heading font-extrabold text-lg text-slate-800">
                    Chỉnh sửa thông tin trường học
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingSchool(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Tên trường học" required>
                    <Input
                      value={schoolName}
                      onChange={e => setSchoolName(e.target.value)}
                      placeholder="Ví dụ: Trường Tiểu học Lê Văn Tám"
                      required
                    />
                  </FormField>
                  <FormField label="Mã trường" required>
                    <Input
                      value={schoolCode}
                      onChange={e => setSchoolCode(e.target.value)}
                      placeholder="Ví dụ: TH-LVT01"
                      required
                    />
                  </FormField>
                </div>

                <FormField label="Địa chỉ trường học" required>
                  <Input
                    value={schoolAddress}
                    onChange={e => setSchoolAddress(e.target.value)}
                    placeholder="Số 16 Hoàng Hoa Thám, Ba Đình, Hà Nội"
                    required
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Hiệu trưởng / Người đại diện" required>
                    <Input
                      value={schoolPrincipal}
                      onChange={e => setSchoolPrincipal(e.target.value)}
                      placeholder="Thầy Nguyễn Văn Quản"
                      required
                    />
                  </FormField>
                  <FormField label="Năm học hiện hành" required>
                    <Select
                      value={schoolAcademicYear}
                      onChange={e => setSchoolAcademicYear(e.target.value)}
                    >
                      {academicYears.map(y => (
                        <option key={y.id} value={y.code}>{y.name}</option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Số điện thoại liên hệ">
                    <Input
                      value={schoolPhone}
                      onChange={e => setSchoolPhone(e.target.value)}
                      placeholder="024 3845 2299"
                    />
                  </FormField>
                  <FormField label="Email trường học">
                    <Input
                      value={schoolEmail}
                      onChange={e => setSchoolEmail(e.target.value)}
                      placeholder="c1levantam@edu.hanoi.gov.vn"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Đường dẫn Logo (URL ảnh)">
                    <Input
                      value={schoolLogo}
                      onChange={e => setSchoolLogo(e.target.value)}
                      placeholder="https://..."
                    />
                  </FormField>
                  <FormField label="Website trường">
                    <Input
                      value={schoolWebsite}
                      onChange={e => setSchoolWebsite(e.target.value)}
                      placeholder="https://th-levantam.hanoi.edu.vn"
                    />
                  </FormField>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingSchool(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
                  >
                    Lưu thông tin trường học
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-800">
                    Quy mô & Cơ cấu tổ chức giáo dục
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Trường Tiểu học Lê Văn Tám thực hiện giảng dạy chương trình giáo dục phổ thông mới theo chuẩn Bộ GD&ĐT (GDPT 2018).
                  </p>
                </div>

                {/* Grid summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start space-x-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Cấu trúc 5 khối lớp</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Phân bổ 10 lớp học chuẩn hóa từ Khối 1 đến Khối 5 với giáo viên chủ nhiệm chuyên trách.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start space-x-3">
                    <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">9 Môn học GDPT 2018</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Đầy đủ môn Toán, Tiếng Việt, Tin học, Tiếng Anh, Mĩ thuật, Đạo đức, TN&XH, Khoa học, Lịch sử - Địa lí.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-start space-x-3">
                    <div className="p-2.5 bg-amber-600 text-white rounded-xl">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Học bạ số & LMS E-Learning</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Tích hợp phân công giảng dạy trực tiếp vào kho bài giảng video tương tác và gói SCORM 1.2.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-start space-x-3">
                    <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">An toàn dữ liệu học sinh</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Quản lý hồ sơ học sinh, chuyển lớp, sao chép năm học và xuất file Excel chuẩn Unicode UTF-8.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <h4 className="font-bold text-slate-700 text-xs flex items-center">
                    <Sparkles className="w-4 h-4 text-emerald-600 mr-1.5" />
                    <span>Quyền hạn theo vai trò</span>
                  </h4>
                  <ul className="text-xs text-slate-600 mt-2 space-y-1.5 list-disc list-inside">
                    <li><strong className="text-slate-700">Quản trị viên:</strong> Toàn quyền cấu hình thông tin trường, mở năm học, sao chép lớp và phân công giảng dạy.</li>
                    <li><strong className="text-slate-700">Giáo viên ({currentUser?.name}):</strong> Xem cơ cấu trường, quản lý danh sách học sinh của lớp chủ nhiệm và giảng dạy các lớp được phân công.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QUẢN LÝ NĂM HỌC (ACADEMIC YEARS)                                  */}
      {/* ========================================================================= */}
      {activeTab === 'academic_years' && (
        <div className="space-y-6">
          {/* Top Actions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-slate-800">
                Danh sách năm học & Kỳ học
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý các niên khóa, thiết lập năm học hiện hành, lưu trữ dữ liệu cũ và chuyển tiếp học sinh.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setCopyFromYear(currentAcademicYear?.id || academicYears[0]?.id || '');
                  setCopyToYear(academicYears.find(y => !y.isCurrent)?.id || '');
                  setShowCopyModal(true);
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Sao chép cấu trúc lớp</span>
              </button>

              <button
                onClick={() => {
                  setTransitionFromYear(currentAcademicYear?.id || academicYears[0]?.id || '');
                  setTransitionToYear(academicYears.find(y => !y.isCurrent)?.id || '');
                  setShowTransitionModal(true);
                }}
                className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Chuyển dữ liệu sang năm học mới</span>
              </button>

              <button
                onClick={handleOpenYearCreate}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo năm học mới</span>
              </button>
            </div>
          </div>

          {/* Academic Years List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {academicYears.map(year => {
              const isCurrent = year.isCurrent;
              const isArchived = year.status === 'archived';
              const classCountInYear = classes.filter(c => c.academicYearId === year.id).length;

              return (
                <div 
                  key={year.id} 
                  className={`bg-white rounded-3xl p-6 border transition-all relative ${
                    isCurrent 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                      : isArchived
                        ? 'border-slate-200 bg-slate-50/70 opacity-80'
                        : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center space-x-1 shadow-sm">
                      <Check className="w-3 h-3" />
                      <span>Năm học hiện tại</span>
                    </div>
                  )}

                  {isArchived && (
                    <div className="absolute top-4 right-4 bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                      Đã lưu trữ
                    </div>
                  )}

                  <div className="p-3 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Calendar className="w-6 h-6" />
                  </div>

                  <h4 className="font-heading font-extrabold text-lg text-slate-800 mt-4">
                    {year.name}
                  </h4>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">Mã niên khóa: {year.code}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Thời gian:</span>
                      <span className="font-medium text-slate-700">{formatDateVN(year.startDate || '2024-09-05')} - {formatDateVN(year.endDate || '2025-05-31')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Số lớp học:</span>
                      <span className="font-bold text-slate-800">{classCountInYear} lớp</span>
                    </div>
                    {year.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {year.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {!isCurrent && (
                      <button
                        onClick={() => {
                          setCurrentAcademicYear(year.id);
                          showToast(`Đã thiết lập ${year.name} làm năm học hiện tại!`);
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        Đặt làm hiện tại
                      </button>
                    )}

                    {!isArchived && !isCurrent && (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn lưu trữ năm học ${year.code}?`)) {
                            archiveAcademicYear(year.id);
                            showToast(`Đã lưu trữ năm học ${year.code}`);
                          }
                        }}
                        className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold rounded-xl transition-colors hover:bg-slate-100"
                      >
                        Lưu trữ
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingYear(year);
                        setYearCode(year.code);
                        setYearName(year.name);
                        setYearStartDate(year.startDate || '2024-09-05');
                        setYearEndDate(year.endDate || '2025-05-31');
                        setYearNotes(year.notes || '');
                        setShowYearModal(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50 ml-auto transition-colors"
                      title="Chỉnh sửa năm học"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUẢN LÝ LỚP HỌC (CLASSES GRADE 1 - 5)                             */}
      {/* ========================================================================= */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Grade Filter Pills */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setSelectedGradeFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedGradeFilter === 'all'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả khối
                </button>
                {[1, 2, 3, 4, 5].map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGradeFilter(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedGradeFilter === g
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Khối {g}
                  </button>
                ))}
              </div>

              {/* Year Filter */}
              <select
                value={selectedYearFilter}
                onChange={e => setSelectedYearFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Tất cả năm học</option>
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm lớp, mã lớp, GVCN..."
                  value={classSearch}
                  onChange={e => setClassSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenCreateClass}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm lớp học</span>
              </button>
            </div>
          </div>

          {/* Classes Grid */}
          {filteredClasses.length === 0 ? (
            <EmptyState
              title="Không tìm thấy lớp học phù hợp"
              description="Thử thay đổi bộ lọc khối lớp hoặc nhấn Thêm lớp học để tạo lớp mới."
              actionLabel="Tạo lớp học mới"
              onAction={handleOpenCreateClass}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredClasses.map(cls => {
                const studentsInClass = getStudentsForClass(cls);
                const actualCount = studentsInClass.length;

                return (
                  <div 
                    key={cls.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-heading font-extrabold text-base">
                            {cls.grade}
                          </span>
                          <div>
                            <h4 className="font-heading font-extrabold text-base text-slate-800 group-hover:text-emerald-700 transition-colors">
                              {cls.name}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cls.code}</p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                          {cls.roomNumber || 'P.101'}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">Giáo viên CN:</span>
                          <span className="font-bold text-slate-800">{cls.homeroomTeacherName || 'Chưa phân công'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">Sĩ số thực tế:</span>
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                            {actualCount > 0 ? actualCount : cls.studentCount} học sinh
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">Niên khóa:</span>
                          <span className="font-medium text-slate-700">{cls.academicYearName || '2024-2025'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                      <button
                        onClick={() => {
                          setSelectedClassForRoster(cls);
                          setStudentSearchInClass('');
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Danh sách HS ({actualCount})</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleExportClassStudents(cls)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                          title="Xuất danh sách ra Excel"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditClass(cls)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                          title="Sửa lớp học"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Xóa lớp học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: QUẢN LÝ MÔN HỌC (SUBJECTS)                                        */}
      {/* ========================================================================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Chương trình Giáo dục Phổ thông 2018
              </span>
              <h3 className="font-heading font-extrabold text-xl text-slate-800 mt-0.5">
                Danh mục Môn học Tiểu học
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bao gồm 9 môn học chính khóa cấp tiểu học theo quy định của Bộ Giáo dục & Đào tạo.
              </p>
            </div>

            <button
              onClick={handleOpenCreateSubject}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm môn học mới</span>
            </button>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map(sub => {
              const coursesWithSub = courses.filter(c => c.subjectId === sub.id).length;
              const assignmentsWithSub = teachingAssignments.filter(a => a.subjectId === sub.id).length;

              return (
                <div 
                  key={sub.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-bold shadow-sm ${sub.color || 'bg-emerald-600'}`}>
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-heading font-extrabold text-lg text-slate-800">{sub.name}</h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600">
                            Mã: {sub.code}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                          {sub.periodsPerWeek || 2} tiết/tuần
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-4 line-clamp-2">
                      {sub.description || 'Chương trình giảng dạy chính khóa theo chuẩn năng lực phẩm chất học sinh tiểu học.'}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Khối lớp áp dụng:</span>
                        <div className="flex items-center space-x-1">
                          {sub.grades.map(g => (
                            <span key={g} className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Khóa học e-learning:</span>
                        <span className="font-bold text-slate-800">{coursesWithSub} khóa học</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Phân công giảng dạy:</span>
                        <span className="font-bold text-slate-800">{assignmentsWithSub} lớp</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenEditSubject(sub)}
                      className="px-3 py-1.5 text-slate-600 hover:text-emerald-700 text-xs font-bold rounded-xl hover:bg-slate-100 flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(sub)}
                      className="px-3 py-1.5 text-slate-400 hover:text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-50 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PHÂN CÔNG GIẢNG DẠY (TEACHING ASSIGNMENTS)                        */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Kế hoạch đào tạo & Đứng lớp
              </span>
              <h3 className="font-heading font-extrabold text-xl text-slate-800 mt-0.5">
                Bảng Phân Công Giảng Dạy Toàn Trường
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Giáo viên có thể được phân công dạy nhiều lớp và nhiều môn học. Dữ liệu liên kết trực tiếp với module khóa học e-learning.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenCreateAssign}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm phân công</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Lọc theo:</span>
            </div>

            <select
              value={assignmentTeacherFilter}
              onChange={e => setAssignmentTeacherFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất cả giáo viên</option>
              {teachersList.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>

            <select
              value={assignmentClassFilter}
              onChange={e => setAssignmentClassFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất cả lớp học</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} (Khối {c.grade})</option>
              ))}
            </select>

            <select
              value={assignmentSubjectFilter}
              onChange={e => setAssignmentSubjectFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất cả môn học</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>Môn {s.name}</option>
              ))}
            </select>
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="py-3.5 px-4">Giáo viên phụ trách</th>
                    <th className="py-3.5 px-4">Lớp học</th>
                    <th className="py-3.5 px-4">Khối</th>
                    <th className="py-3.5 px-4">Môn học</th>
                    <th className="py-3.5 px-4">Số tiết/tuần</th>
                    <th className="py-3.5 px-4">Vai trò</th>
                    <th className="py-3.5 px-4">Ghi chú</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Chưa có phân công giảng dạy nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map(assign => {
                      return (
                        <tr key={assign.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                                {assign.teacherName.charAt(0)}
                              </div>
                              <span>{assign.teacherName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {assign.className}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-bold">
                            Khối {assign.grade}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {assign.subjectName}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <span className="font-bold text-slate-700">{assign.periodsPerWeek || 2}</span> tiết
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              assign.roleInClass === 'assistant' 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {assign.roleInClass === 'assistant' ? 'Trợ giảng' : 'Giáo viên chính'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                            {assign.notes || '—'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingAssignment(assign);
                                setAssignTeacherId(assign.teacherId);
                                setAssignClassId(assign.classId);
                                setAssignSubjectId(assign.subjectId);
                                setAssignPeriods(assign.periodsPerWeek || 2);
                                setAssignRole(assign.roleInClass || 'primary');
                                setAssignNotes(assign.notes || '');
                                setShowAssignModal(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                              title="Sửa phân công"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAssignment(assign)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Xóa phân công"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW & MANAGE STUDENTS IN CLASS                                    */}
      {/* ========================================================================= */}
      {selectedClassForRoster && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedClassForRoster(null)}
          title={`Danh Sách Học Sinh: ${selectedClassForRoster.name} (${selectedClassForRoster.academicYearName || '2024-2025'})`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            {/* Class Stats Banner */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-800">
                  Giáo viên chủ nhiệm: <span className="font-extrabold">{selectedClassForRoster.homeroomTeacherName || 'Thầy Nguyễn Văn Học'}</span>
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Phòng học: {selectedClassForRoster.roomNumber || 'P.101'} • Mã lớp: {selectedClassForRoster.code}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm học sinh</span>
                </button>

                <button
                  onClick={() => handleExportClassStudents(selectedClassForRoster)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>

            {/* Search inside class */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm học sinh theo tên, mã học sinh, tên đăng nhập..."
                value={studentSearchInClass}
                onChange={e => setStudentSearchInClass(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Students Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Mã HS</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3">Tên đăng nhập</th>
                    <th className="py-2.5 px-3">Ngày sinh</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getStudentsForClass(selectedClassForRoster)
                    .filter(s => {
                      const q = studentSearchInClass.toLowerCase().trim();
                      return !q || 
                        s.name.toLowerCase().includes(q) || 
                        s.code.toLowerCase().includes(q) || 
                        (s.username && s.username.toLowerCase().includes(q));
                    })
                    .map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 font-extrabold text-emerald-700">{s.code}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">
                          <div className="flex items-center space-x-2">
                            <img src={s.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                            <span>{s.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{s.username || s.email.split('@')[0]}</td>
                        <td className="py-2 px-3 text-slate-500">{s.birthDate || 'Chưa cập nhật'}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {s.status === 'active' ? 'Đang học' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => {
                              setStudentToTransfer(s);
                              setTransferTargetClassId(
                                classes.find(c => c.id !== selectedClassForRoster.id)?.id || ''
                              );
                              setShowTransferModal(true);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg transition-colors flex items-center space-x-1 ml-auto"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Chuyển lớp</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedClassForRoster(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRANSFER STUDENT TO ANOTHER CLASS                                  */}
      {/* ========================================================================= */}
      {showTransferModal && studentToTransfer && (
        <Modal
          isOpen={true}
          onClose={() => setShowTransferModal(false)}
          title={`Chuyển Lớp Học Sinh`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-800">
                Đang chuyển học sinh: <strong className="font-extrabold">{studentToTransfer.name}</strong> ({studentToTransfer.code})
              </p>
              <p className="text-[11px] text-blue-600 mt-1">
                Lớp hiện tại: <strong>{studentToTransfer.className || 'Chưa có lớp'}</strong>
              </p>
            </div>

            <FormField label="Chọn lớp học chuyển đến" required>
              <Select
                value={transferTargetClassId}
                onChange={e => setTransferTargetClassId(e.target.value)}
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Khối {c.grade} • GVCN: {c.homeroomTeacherName})
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="flex items-center justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Xác nhận chuyển lớp</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD STUDENT TO CLASS                                              */}
      {/* ========================================================================= */}
      {showAddStudentModal && selectedClassForRoster && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddStudentModal(false)}
          title={`Thêm Học Sinh Vào ${selectedClassForRoster.name}`}
        >
          <div className="space-y-4">
            <FormField label="Chọn học sinh chưa có lớp hoặc từ danh sách toàn trường" required>
              <Select
                value={selectedUnassignedStudentId}
                onChange={e => setSelectedUnassignedStudentId(e.target.value)}
              >
                <option value="">-- Chọn học sinh --</option>
                {allStudents
                  .filter(s => s.className !== selectedClassForRoster.name)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} - Hiện tại: {s.className || 'Chưa phân lớp'})
                    </option>
                  ))}
              </Select>
            </FormField>

            <div className="flex items-center justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedUnassignedStudentId) {
                    alert('Vui lòng chọn học sinh!');
                    return;
                  }
                  transferStudent(selectedUnassignedStudentId, selectedClassForRoster.id);
                  setShowAddStudentModal(false);
                  showToast(`Đã thêm học sinh vào ${selectedClassForRoster.name}!`);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
              >
                Xác nhận thêm
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT CLASS                                               */}
      {/* ========================================================================= */}
      {showClassModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowClassModal(false)}
          title={editingClass ? `Chỉnh sửa lớp: ${editingClass.name}` : 'Tạo lớp học mới'}
        >
          <form onSubmit={handleSaveClass} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tên lớp học" required>
                <Input
                  value={classNameInput}
                  onChange={e => setClassNameInput(e.target.value)}
                  placeholder="Ví dụ: Lớp 3A"
                  required
                />
              </FormField>
              <FormField label="Mã lớp" required>
                <Input
                  value={classCodeInput}
                  onChange={e => setClassCodeInput(e.target.value)}
                  placeholder="Ví dụ: LOP-3A"
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Khối lớp (1 - 5)" required>
                <Select
                  value={classGradeInput}
                  onChange={e => setClassGradeInput(parseInt(e.target.value, 10))}
                >
                  <option value={1}>Khối 1</option>
                  <option value={2}>Khối 2</option>
                  <option value={3}>Khối 3</option>
                  <option value={4}>Khối 4</option>
                  <option value={5}>Khối 5</option>
                </Select>
              </FormField>
              <FormField label="Phòng học">
                <Input
                  value={classRoom}
                  onChange={e => setClassRoom(e.target.value)}
                  placeholder="Ví dụ: P.301"
                />
              </FormField>
            </div>

            <FormField label="Giáo viên chủ nhiệm" required>
              <Select
                value={classTeacherId}
                onChange={e => setClassTeacherId(e.target.value)}
              >
                {teachersList.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Năm học áp dụng" required>
              <Select
                value={classYearId}
                onChange={e => setClassYearId(e.target.value)}
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </Select>
            </FormField>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClassModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
              >
                {editingClass ? 'Lưu thay đổi' : 'Tạo lớp học'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT SUBJECT                                             */}
      {/* ========================================================================= */}
      {showSubjectModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowSubjectModal(false)}
          title={editingSubject ? `Chỉnh sửa môn học: ${editingSubject.name}` : 'Thêm môn học mới'}
        >
          <form onSubmit={handleSaveSubject} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tên môn học" required>
                <Input
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  placeholder="Ví dụ: Hoạt động trải nghiệm"
                  required
                />
              </FormField>
              <FormField label="Mã môn học" required>
                <Input
                  value={subjectCode}
                  onChange={e => setSubjectCode(e.target.value)}
                  placeholder="Ví dụ: HĐTN"
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Số tiết / tuần" required>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={subjectPeriods}
                  onChange={e => setSubjectPeriods(parseInt(e.target.value, 10) || 1)}
                  required
                />
              </FormField>
              <FormField label="Màu sắc chủ đạo">
                <Select
                  value={subjectColor}
                  onChange={e => setSubjectColor(e.target.value)}
                >
                  <option value="bg-emerald-500">Xanh lục (Toán)</option>
                  <option value="bg-amber-500">Vàng hổ phách (Tiếng Việt)</option>
                  <option value="bg-blue-500">Xanh dương (Tin học)</option>
                  <option value="bg-purple-500">Tím (Tiếng Anh)</option>
                  <option value="bg-pink-500">Hồng (Mĩ thuật)</option>
                  <option value="bg-rose-500">Đỏ hồng (Đạo đức)</option>
                  <option value="bg-lime-500">Xanh lá chanh (TN&XH)</option>
                  <option value="bg-cyan-500">Xanh mạ (Khoa học)</option>
                  <option value="bg-indigo-500">Chàm (Lịch sử & Địa lí)</option>
                </Select>
              </FormField>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Khối lớp áp dụng:
              </label>
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5].map(g => {
                  const checked = subjectGrades.includes(g);
                  return (
                    <label key={g} className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => {
                          if (e.target.checked) {
                            setSubjectGrades(prev => [...prev, g].sort());
                          } else {
                            setSubjectGrades(prev => prev.filter(item => item !== g));
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Khối {g}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <FormField label="Mô tả môn học">
              <Textarea
                rows={2}
                value={subjectDesc}
                onChange={e => setSubjectDesc(e.target.value)}
                placeholder="Mô tả nội dung chương trình theo GDPT 2018..."
              />
            </FormField>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
              >
                {editingSubject ? 'Lưu thay đổi' : 'Thêm môn học'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT TEACHING ASSIGNMENT                                  */}
      {/* ========================================================================= */}
      {showAssignModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAssignModal(false)}
          title={editingAssignment ? 'Chỉnh sửa phân công giảng dạy' : 'Phân công giảng dạy mới'}
        >
          <form onSubmit={handleSaveAssignment} className="space-y-4">
            <FormField label="Chọn Giáo viên giảng dạy" required>
              <Select
                value={assignTeacherId}
                onChange={e => setAssignTeacherId(e.target.value)}
              >
                {teachersList.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.code} - {t.email})</option>
                ))}
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Lớp học phụ trách" required>
                <Select
                  value={assignClassId}
                  onChange={e => setAssignClassId(e.target.value)}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Khối {c.grade})</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Môn học giảng dạy" required>
                <Select
                  value={assignSubjectId}
                  onChange={e => setAssignSubjectId(e.target.value)}
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>Môn {s.name}</option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Số tiết dạy / tuần">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={assignPeriods}
                  onChange={e => setAssignPeriods(parseInt(e.target.value, 10) || 1)}
                />
              </FormField>
              <FormField label="Vai trò đứng lớp">
                <Select
                  value={assignRole}
                  onChange={e => setAssignRole(e.target.value as any)}
                >
                  <option value="primary">Giáo viên chính</option>
                  <option value="assistant">Trợ giảng / Thực hành</option>
                </Select>
              </FormField>
            </div>

            <FormField label="Ghi chú phân công">
              <Input
                value={assignNotes}
                onChange={e => setAssignNotes(e.target.value)}
                placeholder="Ví dụ: Phụ trách phòng máy số 1, chuyên đề toán nâng cao..."
              />
            </FormField>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
              >
                {editingAssignment ? 'Lưu thay đổi' : 'Xác nhận phân công'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT ACADEMIC YEAR                                        */}
      {/* ========================================================================= */}
      {showYearModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowYearModal(false)}
          title={editingYear ? `Chỉnh sửa năm học: ${editingYear.name}` : 'Tạo năm học mới'}
        >
          <form onSubmit={handleSaveYear} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Mã niên khóa" required>
                <Input
                  value={yearCode}
                  onChange={e => setYearCode(e.target.value)}
                  placeholder="2025-2026"
                  required
                />
              </FormField>
              <FormField label="Tên năm học" required>
                <Input
                  value={yearName}
                  onChange={e => setYearName(e.target.value)}
                  placeholder="Năm học 2025 - 2026"
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Ngày khai giảng" required>
                <Input
                  type="date"
                  value={yearStartDate}
                  onChange={e => setYearStartDate(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Ngày kết thúc năm học" required>
                <Input
                  type="date"
                  value={yearEndDate}
                  onChange={e => setYearEndDate(e.target.value)}
                  required
                />
              </FormField>
            </div>

            <FormField label="Ghi chú kế hoạch">
              <Textarea
                rows={2}
                value={yearNotes}
                onChange={e => setYearNotes(e.target.value)}
                placeholder="Kế hoạch trọng tâm của niên khóa..."
              />
            </FormField>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowYearModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
              >
                {editingYear ? 'Lưu thay đổi' : 'Khởi tạo năm học'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SAO CHÉP CẤU TRÚC LỚP HỌC                                         */}
      {/* ========================================================================= */}
      {showCopyModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCopyModal(false)}
          title="Sao Chép Cấu Trúc Lớp Học Sang Năm Mới"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800">
              Chức năng này sẽ sao chép toàn bộ danh sách lớp học (từ Khối 1 đến Khối 5) từ năm học nguồn sang năm học mới, giúp nhà trường không phải tạo lại thủ công từng lớp. Sĩ số trong năm mới sẽ được đặt về 0 để sẵn sàng nhận học sinh mới.
            </div>

            <FormField label="Từ năm học nguồn" required>
              <Select
                value={copyFromYear}
                onChange={e => setCopyFromYear(e.target.value)}
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name} ({y.code})</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Sang năm học đích" required>
              <Select
                value={copyToYear}
                onChange={e => setCopyToYear(e.target.value)}
              >
                <option value="">-- Chọn năm học nhận dữ liệu --</option>
                {academicYears
                  .filter(y => y.id !== copyFromYear)
                  .map(y => (
                    <option key={y.id} value={y.id}>{y.name} ({y.code})</option>
                  ))}
              </Select>
            </FormField>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteCopyStructure}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>Tiến hành sao chép</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHUYỂN DỮ LIỆU SANG NĂM HỌC MỚI (NÂNG KHỐI HỌC SINH)             */}
      {/* ========================================================================= */}
      {showTransitionModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowTransitionModal(false)}
          title="Kết Chuyển Dữ Liệu Học Sinh Sang Năm Học Mới"
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-800 space-y-2">
              <p className="font-bold flex items-center">
                <RefreshCw className="w-4 h-4 mr-1 text-blue-600" />
                <span>Quy trình chuyển tiếp năm học tự động:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Học sinh Khối 1 lên Khối 2 (ví dụ: Lớp 1A lên Lớp 2A).</li>
                <li>Học sinh Khối 2 lên Khối 3; Khối 3 lên Khối 4; Khối 4 lên Khối 5.</li>
                <li>Học sinh Khối 5 hoàn thành chương trình tiểu học sẽ được lưu trữ thành Cựu học sinh.</li>
                <li>Khởi tạo các lớp học tương ứng cho năm học mới.</li>
              </ul>
            </div>

            <FormField label="Từ năm học hiện tại" required>
              <Select
                value={transitionFromYear}
                onChange={e => setTransitionFromYear(e.target.value)}
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Đến năm học mới" required>
              <Select
                value={transitionToYear}
                onChange={e => setTransitionToYear(e.target.value)}
              >
                <option value="">-- Chọn năm học mới --</option>
                {academicYears
                  .filter(y => y.id !== transitionFromYear)
                  .map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
              </Select>
            </FormField>

            <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={advanceGradesCheck}
                onChange={e => setAdvanceGradesCheck(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Tự động nâng khối toàn bộ học sinh (Khối 1 lên 2, 2 lên 3, 3 lên 4, 4 lên 5)</span>
            </label>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTransitionModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteTransition}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tiến hành kết chuyển</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
