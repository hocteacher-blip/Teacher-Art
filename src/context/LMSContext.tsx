import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LMSDatabase, StorageService, INITIAL_SCHOOL, INITIAL_TEACHING_ASSIGNMENTS 
} from '../services/storage';
import { 
  Course, CourseModule, Lesson, LessonStop, 
  LearningPackage, LearningAssignment, StudentProgress, 
  StudentStopAnswer, SchoolClass, Subject, User, NotificationItem,
  School, AcademicYear, TeachingAssignment
} from '../types/lms';

interface LMSContextType {
  db: LMSDatabase;
  school: School;
  academicYears: AcademicYear[];
  currentAcademicYear: AcademicYear | undefined;
  courses: Course[];
  modules: CourseModule[];
  lessons: Lesson[];
  stops: LessonStop[];
  packages: LearningPackage[];
  assignments: LearningAssignment[];
  progressList: StudentProgress[];
  classes: SchoolClass[];
  subjects: Subject[];
  teachingAssignments: TeachingAssignment[];
  notifications: NotificationItem[];
  
  // School & Academic Year
  updateSchool: (updates: Partial<School>) => void;
  createAcademicYear: (year: Partial<AcademicYear>) => AcademicYear;
  updateAcademicYear: (id: string, updates: Partial<AcademicYear>) => void;
  setCurrentAcademicYear: (id: string) => void;
  archiveAcademicYear: (id: string) => void;
  copyClassStructure: (fromYearId: string, toYearId: string) => number;
  transitionAcademicYear: (fromYearId: string, toYearId: string, advanceGrades: boolean) => { updatedClasses: number; updatedStudents: number };

  // Courses & Lessons
  createCourse: (course: Partial<Course>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  duplicateCourse: (courseId: string) => Course;
  publishCourse: (courseId: string) => void;
  unpublishCourse: (courseId: string) => void;
  createModule: (module: Partial<CourseModule>) => CourseModule;
  updateModule: (id: string, updates: Partial<CourseModule>) => void;
  deleteModule: (id: string) => void;
  reorderModules: (courseId: string, orderedModuleIds: string[]) => void;
  createLesson: (lesson: Partial<Lesson>) => Lesson;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  reorderLessons: (moduleId: string, orderedLessonIds: string[]) => void;

  // Stops
  createStop: (stop: Partial<LessonStop>) => LessonStop;
  updateStop: (id: string, updates: Partial<LessonStop>) => void;
  deleteStop: (id: string) => void;
  getStopsForLesson: (lessonId: string) => LessonStop[];

  // Packages
  addPackage: (pkg: Partial<LearningPackage>) => LearningPackage;
  deletePackage: (id: string) => void;

  // Assignments
  createAssignment: (asn: Partial<LearningAssignment>) => LearningAssignment;
  updateAssignment: (id: string, updates: Partial<LearningAssignment>) => void;
  deleteAssignment: (id: string) => void;

  // Student progress
  getStudentProgress: (studentId: string, lessonId: string) => StudentProgress | undefined;
  saveStudentProgress: (data: Partial<StudentProgress> & { studentId: string; lessonId: string; courseId: string }) => StudentProgress;
  recordStopAnswer: (answer: StudentStopAnswer, courseId: string, lessonId: string) => void;

  // Admin users / classes / subjects
  createUser: (user: Partial<User>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  deleteAllUsers: () => void;
  toggleUserStatus: (id: string) => boolean;
  createUsersBatch: (newUsers: Partial<User>[]) => { added: number; errors: string[] };
  createClass: (cls: Partial<SchoolClass>) => SchoolClass;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;
  transferStudent: (studentId: string, targetClassId: string, note?: string) => boolean;
  addStudentToClass: (classId: string, studentId: string) => boolean;
  createSubject: (sub: Partial<Subject>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Teaching Assignments
  createTeachingAssignment: (assign: Partial<TeachingAssignment>) => TeachingAssignment;
  updateTeachingAssignment: (id: string, updates: Partial<TeachingAssignment>) => void;
  deleteTeachingAssignment: (id: string) => void;
  batchAssignTeaching: (teacherId: string, assignments: { classId: string; subjectId: string; periodsPerWeek?: number; roleInClass?: 'primary' | 'assistant' }[]) => number;

  // Misc
  markNotificationRead: (id: string) => void;
  resetAllData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<LMSDatabase>(() => StorageService.loadDatabase());

  // Keep state synced to localStorage
  const updateDbAndSave = (updater: (prev: LMSDatabase) => LMSDatabase) => {
    setDb(prev => {
      const next = updater(prev);
      StorageService.saveDatabase(next);
      return next;
    });
  };

  const createCourse = (courseData: Partial<Course>): Course => {
    const newCourse: Course = {
      id: 'CRS_' + Date.now(),
      code: courseData.code || 'KH-' + Math.floor(100 + Math.random() * 900),
      title: courseData.title || 'Khóa học mới',
      subjectId: courseData.subjectId || 'SUB_TIN',
      subjectName: courseData.subjectName || 'Tin học & Công nghệ',
      grade: courseData.grade || 3,
      teacherId: courseData.teacherId || 'USR_GV_HOC',
      teacherName: courseData.teacherName || 'Thầy Nguyễn Văn Học',
      academicYear: courseData.academicYear || '2024-2025',
      description: courseData.description || '',
      thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
      startDate: courseData.startDate || new Date().toISOString().split('T')[0],
      endDate: courseData.endDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      status: courseData.status || 'published',
      modulesCount: 1,
      lessonsCount: 0,
      totalDurationMinutes: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const initialMod: CourseModule = {
      id: 'MOD_' + Date.now(),
      courseId: newCourse.id,
      title: 'Chương 1: Khởi động và Khám phá',
      order: 1,
      description: 'Chủ đề kiến thức trọng tâm',
    };

    updateDbAndSave(prev => ({
      ...prev,
      courses: [newCourse, ...prev.courses],
      modules: [...prev.modules, initialMod],
    }));

    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    updateDbAndSave(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c),
    }));
  };

  const deleteCourse = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== id),
      modules: prev.modules.filter(m => m.courseId !== id),
      lessons: prev.lessons.filter(l => l.courseId !== id),
      assignments: prev.assignments.filter(a => a.courseId !== id),
      progress: prev.progress.filter(p => p.courseId !== id),
    }));
  };

  const publishCourse = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === id ? { ...c, status: 'published', updatedAt: new Date().toISOString() } : c),
    }));
  };

  const unpublishCourse = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === id ? { ...c, status: 'draft', updatedAt: new Date().toISOString() } : c),
    }));
  };

  const duplicateCourse = (courseId: string): Course => {
    const origCourse = db.courses.find(c => c.id === courseId);
    if (!origCourse) throw new Error('Không tìm thấy khóa học để sao chép');

    const newCourseId = 'CRS_' + Date.now();
    const newCourse: Course = {
      ...origCourse,
      id: newCourseId,
      code: `${origCourse.code}-COPY`,
      title: `${origCourse.title} (Bản sao)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const origModules = db.modules.filter(m => m.courseId === courseId);
    const newModules: CourseModule[] = [];
    const newLessons: Lesson[] = [];
    const newStops: LessonStop[] = [];

    origModules.forEach((m, mIdx) => {
      const newModId = `MOD_${Date.now()}_${mIdx}`;
      newModules.push({
        ...m,
        id: newModId,
        courseId: newCourseId,
      });

      const origLessons = db.lessons.filter(l => l.moduleId === m.id);
      origLessons.forEach((l, lIdx) => {
        const newLessonId = `LES_${Date.now()}_${mIdx}_${lIdx}`;
        newLessons.push({
          ...l,
          id: newLessonId,
          moduleId: newModId,
          courseId: newCourseId,
        });

        const origStops = db.stops.filter(s => s.lessonId === l.id);
        origStops.forEach((s, sIdx) => {
          newStops.push({
            ...s,
            id: `STP_${Date.now()}_${mIdx}_${lIdx}_${sIdx}`,
            lessonId: newLessonId,
          });
        });
      });
    });

    newCourse.modulesCount = newModules.length;
    newCourse.lessonsCount = newLessons.length;

    updateDbAndSave(prev => ({
      ...prev,
      courses: [newCourse, ...prev.courses],
      modules: [...prev.modules, ...newModules],
      lessons: [...prev.lessons, ...newLessons],
      stops: [...prev.stops, ...newStops],
    }));

    return newCourse;
  };

  const reorderModules = (courseId: string, orderedModuleIds: string[]) => {
    updateDbAndSave(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.courseId !== courseId) return m;
        const index = orderedModuleIds.indexOf(m.id);
        return index !== -1 ? { ...m, order: index + 1 } : m;
      }),
    }));
  };

  const createModule = (moduleData: Partial<CourseModule>): CourseModule => {
    const newModule: CourseModule = {
      id: 'MOD_' + Date.now(),
      courseId: moduleData.courseId || '',
      title: moduleData.title || 'Chủ đề mới',
      order: (moduleData.order ?? 1),
      description: moduleData.description || '',
    };
    updateDbAndSave(prev => {
      const nextModules = [...prev.modules, newModule];
      const count = nextModules.filter(m => m.courseId === newModule.courseId).length;
      return {
        ...prev,
        modules: nextModules,
        courses: prev.courses.map(c => c.id === newModule.courseId ? { ...c, modulesCount: count } : c),
      };
    });
    return newModule;
  };

  const updateModule = (id: string, updates: Partial<CourseModule>) => {
    updateDbAndSave(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === id ? { ...m, ...updates } : m),
    }));
  };

  const deleteModule = (id: string) => {
    updateDbAndSave(prev => {
      const target = prev.modules.find(m => m.id === id);
      const nextModules = prev.modules.filter(m => m.id !== id);
      const nextLessons = prev.lessons.filter(l => l.moduleId !== id);
      const courseId = target?.courseId;
      return {
        ...prev,
        modules: nextModules,
        lessons: nextLessons,
        courses: prev.courses.map(c => c.id === courseId ? {
          ...c,
          modulesCount: nextModules.filter(m => m.courseId === courseId).length,
          lessonsCount: nextLessons.filter(l => l.courseId === courseId).length,
        } : c),
      };
    });
  };

  const createLesson = (lessonData: Partial<Lesson>): Lesson => {
    const newLesson: Lesson = {
      id: 'LES_' + Date.now(),
      moduleId: lessonData.moduleId || '',
      courseId: lessonData.courseId || '',
      title: lessonData.title || 'Bài học mới',
      description: lessonData.description || '',
      order: lessonData.order ?? 1,
      type: lessonData.type || 'video',
      durationSeconds: lessonData.durationSeconds || 300,
      contentUrl: lessonData.contentUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      fileName: lessonData.fileName || '',
      fileSize: lessonData.fileSize || '15 MB',
      stopsCount: 0,
      packageId: lessonData.packageId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateDbAndSave(prev => {
      const nextLessons = [...prev.lessons, newLesson];
      const courseLessonsCount = nextLessons.filter(l => l.courseId === newLesson.courseId).length;
      return {
        ...prev,
        lessons: nextLessons,
        courses: prev.courses.map(c => c.id === newLesson.courseId ? { ...c, lessonsCount: courseLessonsCount } : c),
      };
    });
    return newLesson;
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    updateDbAndSave(prev => ({
      ...prev,
      lessons: prev.lessons.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l),
    }));
  };

  const deleteLesson = (id: string) => {
    updateDbAndSave(prev => {
      const target = prev.lessons.find(l => l.id === id);
      const nextLessons = prev.lessons.filter(l => l.id !== id);
      const courseId = target?.courseId;
      return {
        ...prev,
        lessons: nextLessons,
        stops: prev.stops.filter(s => s.lessonId !== id),
        courses: prev.courses.map(c => c.id === courseId ? {
          ...c,
          lessonsCount: nextLessons.filter(l => l.courseId === courseId).length,
        } : c),
      };
    });
  };

  const reorderLessons = (moduleId: string, orderedLessonIds: string[]) => {
    updateDbAndSave(prev => ({
      ...prev,
      lessons: prev.lessons.map(l => {
        if (l.moduleId !== moduleId) return l;
        const index = orderedLessonIds.indexOf(l.id);
        return index !== -1 ? { ...l, order: index + 1 } : l;
      }),
    }));
  };

  const createStop = (stopData: Partial<LessonStop>): LessonStop => {
    const newStop: LessonStop = {
      id: 'STP_' + Date.now(),
      lessonId: stopData.lessonId || '',
      title: stopData.title || 'Điểm dừng tương tác mới',
      stopType: stopData.stopType || 'quiz_single',
      timestampSeconds: stopData.timestampSeconds || 30,
      pageNumber: stopData.pageNumber,
      questionText: stopData.questionText || 'Em hãy chọn câu trả lời đúng nhất:',
      questionImage: stopData.questionImage,
      audioPrompt: stopData.audioPrompt,
      options: stopData.options || [
        { id: 'opt_1', text: 'Đáp án A', isCorrect: true, explanation: 'Chính xác!' },
        { id: 'opt_2', text: 'Đáp án B', isCorrect: false },
      ],
      correctTextAnswer: stopData.correctTextAnswer,
      explanationCorrect: stopData.explanationCorrect || 'Chúc mừng em đã trả lời đúng!',
      explanationIncorrect: stopData.explanationIncorrect || 'Chưa chính xác, em hãy xem lại bài nhé.',
      points: stopData.points || 10,
      maxAttempts: stopData.maxAttempts || 2,
      timeLimitSeconds: stopData.timeLimitSeconds || 60,
      continuationPolicy: stopData.continuationPolicy || 'require_correct',
      order: stopData.order || 1,
      teacherNote: stopData.teacherNote,
    };

    updateDbAndSave(prev => {
      const nextStops = [...prev.stops, newStop];
      const count = nextStops.filter(s => s.lessonId === newStop.lessonId).length;
      return {
        ...prev,
        stops: nextStops,
        lessons: prev.lessons.map(l => l.id === newStop.lessonId ? { ...l, stopsCount: count } : l),
      };
    });
    return newStop;
  };

  const updateStop = (id: string, updates: Partial<LessonStop>) => {
    updateDbAndSave(prev => ({
      ...prev,
      stops: prev.stops.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const deleteStop = (id: string) => {
    updateDbAndSave(prev => {
      const target = prev.stops.find(s => s.id === id);
      const nextStops = prev.stops.filter(s => s.id !== id);
      const lessonId = target?.lessonId;
      return {
        ...prev,
        stops: nextStops,
        lessons: prev.lessons.map(l => l.id === lessonId ? {
          ...l,
          stopsCount: nextStops.filter(s => s.lessonId === lessonId).length,
        } : l),
      };
    });
  };

  const getStopsForLesson = (lessonId: string): LessonStop[] => {
    return db.stops
      .filter(s => s.lessonId === lessonId)
      .sort((a, b) => a.timestampSeconds - b.timestampSeconds || a.order - b.order);
  };

  const addPackage = (pkgData: Partial<LearningPackage>): LearningPackage => {
    const newPkg: LearningPackage = {
      id: 'PKG_' + Date.now(),
      name: pkgData.name || 'Gói bài giảng e-learning',
      type: pkgData.type || 'scorm12',
      fileName: pkgData.fileName || 'lecture_package.zip',
      fileSizeBytes: pkgData.fileSizeBytes || 2048000,
      uploadDate: new Date().toISOString(),
      uploaderId: pkgData.uploaderId || 'USR_GV_HOC',
      uploaderName: pkgData.uploaderName || 'Thầy Nguyễn Văn Học',
      entryPoint: pkgData.entryPoint || 'index.html',
      scormVersion: pkgData.scormVersion,
      scormTitle: pkgData.scormTitle,
      extractedFilesCount: pkgData.extractedFilesCount || 5,
      packageBlobUrl: pkgData.packageBlobUrl,
    };
    updateDbAndSave(prev => ({
      ...prev,
      packages: [newPkg, ...prev.packages],
    }));
    return newPkg;
  };

  const deletePackage = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      packages: prev.packages.filter(p => p.id !== id),
    }));
  };

  const createAssignment = (asnData: Partial<LearningAssignment>): LearningAssignment => {
    const newAsn: LearningAssignment = {
      id: 'ASN_' + Date.now(),
      courseId: asnData.courseId || '',
      lessonId: asnData.lessonId,
      title: asnData.title || 'Nhiệm vụ học tập',
      assignedByTeacherId: asnData.assignedByTeacherId || 'USR_GV_HOC',
      assignedByTeacherName: asnData.assignedByTeacherName || 'Thầy Nguyễn Văn Học',
      targetType: asnData.targetType || 'class',
      targetIds: asnData.targetIds || ['CLS_3A'],
      targetNames: asnData.targetNames || ['Lớp 3A'],
      assignedDate: asnData.assignedDate || new Date().toISOString().split('T')[0],
      dueDate: asnData.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      maxAttempts: asnData.maxAttempts || 3,
      minPassScore: asnData.minPassScore || 70,
      allowRetake: asnData.allowRetake ?? true,
      requiredCompletionRate: asnData.requiredCompletionRate || 100,
      note: asnData.note,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    updateDbAndSave(prev => ({
      ...prev,
      assignments: [newAsn, ...prev.assignments],
    }));
    return newAsn;
  };

  const updateAssignment = (id: string, updates: Partial<LearningAssignment>) => {
    updateDbAndSave(prev => ({
      ...prev,
      assignments: prev.assignments.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  };

  const deleteAssignment = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => a.id !== id),
    }));
  };

  const getStudentProgress = (studentId: string, lessonId: string): StudentProgress | undefined => {
    return db.progress.find(p => p.studentId === studentId && p.lessonId === lessonId);
  };

  const saveStudentProgress = (data: Partial<StudentProgress> & { studentId: string; lessonId: string; courseId: string }): StudentProgress => {
    let result: StudentProgress;
    updateDbAndSave(prev => {
      const existingIndex = prev.progress.findIndex(p => p.studentId === data.studentId && p.lessonId === data.lessonId);
      const studentUser = prev.users.find(u => u.id === data.studentId);

      if (existingIndex >= 0) {
        const updated = {
          ...prev.progress[existingIndex],
          ...data,
          lastActiveAt: new Date().toISOString(),
        };
        result = updated;
        const newProgressList = [...prev.progress];
        newProgressList[existingIndex] = updated;
        return { ...prev, progress: newProgressList };
      } else {
        const created: StudentProgress = {
          id: 'PRG_' + Date.now(),
          studentName: studentUser?.name || 'Học sinh',
          studentClass: studentUser?.className || 'Lớp 3A',
          status: 'in_progress',
          currentPositionSeconds: 0,
          maxPositionSeconds: 0,
          completionPercentage: 0,
          score: 0,
          timeSpentSeconds: 0,
          completedStops: [],
          answers: {},
          firstStartedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          ...data,
        };
        result = created;
        return { ...prev, progress: [created, ...prev.progress] };
      }
    });
    // @ts-ignore
    return result!;
  };

  const recordStopAnswer = (answer: StudentStopAnswer, courseId: string, lessonId: string) => {
    updateDbAndSave(prev => {
      const existing = prev.progress.find(p => p.studentId === answer.studentId && p.lessonId === lessonId);
      const studentUser = prev.users.find(u => u.id === answer.studentId);
      const stop = prev.stops.find(s => s.id === answer.stopId);

      const existingAnswers = existing?.answers || {};
      const newAnswers = { ...existingAnswers, [answer.stopId]: answer };

      // Calculate total stops completed
      const lessonStops = prev.stops.filter(s => s.lessonId === lessonId);
      const completedStops = Object.keys(newAnswers).filter(stopId => newAnswers[stopId].isCorrect || newAnswers[stopId].attemptsCount > 0);

      // Calculate score
      let totalPointsEarned = 0;
      let totalPossiblePoints = 0;
      lessonStops.forEach(s => {
        totalPossiblePoints += s.points;
        const ans = newAnswers[s.id];
        if (ans && ans.isCorrect) {
          totalPointsEarned += s.points;
        }
      });
      const scoreNormalized = totalPossiblePoints > 0 ? Math.round((totalPointsEarned / totalPossiblePoints) * 100) : 100;

      if (existing) {
        const updatedProgressList = prev.progress.map(p => {
          if (p.id === existing.id) {
            return {
              ...p,
              answers: newAnswers,
              completedStops,
              score: scoreNormalized,
              lastActiveAt: new Date().toISOString(),
            };
          }
          return p;
        });
        return { ...prev, progress: updatedProgressList };
      } else {
        const newProg: StudentProgress = {
          id: 'PRG_' + Date.now(),
          studentId: answer.studentId,
          studentName: studentUser?.name || 'Học sinh',
          studentClass: studentUser?.className || 'Lớp 3A',
          courseId,
          lessonId,
          status: 'in_progress',
          currentPositionSeconds: stop?.timestampSeconds || 0,
          maxPositionSeconds: stop?.timestampSeconds || 0,
          completionPercentage: 30,
          score: scoreNormalized,
          timeSpentSeconds: 60,
          completedStops,
          answers: newAnswers,
          firstStartedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        };
        return { ...prev, progress: [newProg, ...prev.progress] };
      }
    });
  };

  const createUser = (userData: Partial<User>): User => {
    const rawUsername = userData.username || (userData.email ? userData.email.split('@')[0] : 'user' + Date.now());
    const newUser: User = {
      id: 'USR_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: userData.name || 'Người dùng mới',
      username: rawUsername.toLowerCase().trim(),
      email: userData.email || `${rawUsername}@th-tieuhoc.edu.vn`,
      role: userData.role || 'student',
      status: userData.status || 'active',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      code: userData.code || 'ND-' + Math.floor(1000 + Math.random() * 9000),
      schoolId: 'SCH_01',
      className: userData.className,
      classId: userData.classId,
      phone: userData.phone || '',
      birthDate: userData.birthDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateDbAndSave(prev => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    updateDbAndSave(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u),
    }));
  };

  const toggleUserStatus = (id: string): boolean => {
    let nextStatus: 'active' | 'locked' = 'active';
    updateDbAndSave(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === id) {
          nextStatus = u.status === 'locked' ? 'active' : 'locked';
          return { ...u, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return u;
      }),
    }));
    return nextStatus === 'active';
  };

  const createUsersBatch = (newUsers: Partial<User>[]): { added: number; errors: string[] } => {
    const errors: string[] = [];
    const validUsersToAdd: User[] = [];

    const existingCodes = new Set(db.users.map(u => u.code.toLowerCase()));
    const existingUsernames = new Set(db.users.map(u => u.username?.toLowerCase() || ''));
    const existingEmails = new Set(db.users.map(u => u.email.toLowerCase()));

    newUsers.forEach((uData, idx) => {
      const code = (uData.code || '').trim().toLowerCase();
      const username = (uData.username || (uData.email ? uData.email.split('@')[0] : '')).trim().toLowerCase();
      const email = (uData.email || `${username || 'hs' + idx}@th-tieuhoc.edu.vn`).trim().toLowerCase();
      const name = (uData.name || '').trim();

      if (!name) {
        errors.push(`Dòng ${idx + 1}: Thiếu họ và tên học sinh.`);
        return;
      }

      if (!code) {
        errors.push(`Dòng ${idx + 1} (${name}): Thiếu mã học sinh.`);
        return;
      }

      if (existingCodes.has(code)) {
        errors.push(`Dòng ${idx + 1} (${name}): Mã học sinh "${code.toUpperCase()}" đã tồn tại trên hệ thống.`);
        return;
      }

      if (username && existingUsernames.has(username)) {
        errors.push(`Dòng ${idx + 1} (${name}): Tên đăng nhập "${username}" đã được sử dụng.`);
        return;
      }

      if (existingEmails.has(email)) {
        errors.push(`Dòng ${idx + 1} (${name}): Email "${email}" đã tồn tại.`);
        return;
      }

      // Mark as reserved for subsequent rows in this batch
      existingCodes.add(code);
      if (username) existingUsernames.add(username);
      existingEmails.add(email);

      const createdUser: User = {
        id: 'USR_' + Date.now() + '_' + idx + '_' + Math.floor(Math.random() * 1000),
        name: uData.name || 'Học sinh',
        username: username || 'hs_' + code,
        email: email,
        role: uData.role || 'student',
        status: 'active',
        avatar: uData.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        code: uData.code || code.toUpperCase(),
        schoolId: 'SCH_01',
        className: uData.className || 'Lớp 3A',
        classId: uData.classId,
        birthDate: uData.birthDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      validUsersToAdd.push(createdUser);
    });

    if (validUsersToAdd.length > 0) {
      updateDbAndSave(prev => ({
        ...prev,
        users: [...prev.users, ...validUsersToAdd],
      }));
    }

    return { added: validUsersToAdd.length, errors };
  };

  const deleteUser = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id),
    }));
  };

  const deleteAllUsers = () => {
    updateDbAndSave(prev => ({
      ...prev,
      users: [],
    }));
    try {
      localStorage.removeItem('ELEMS_ACTIVE_USER_ID');
    } catch (e) {}
  };

  const updateSchool = (updates: Partial<School>) => {
    updateDbAndSave(prev => {
      const current = prev.schools?.[0] || INITIAL_SCHOOL;
      const updated: School = { ...current, ...updates };
      return {
        ...prev,
        schools: [updated],
      };
    });
  };

  const createAcademicYear = (yearData: Partial<AcademicYear>): AcademicYear => {
    const newYear: AcademicYear = {
      id: 'AY_' + Date.now(),
      code: yearData.code || '2025-2026',
      name: yearData.name || `Năm học ${yearData.code || '2025 - 2026'}`,
      isCurrent: !!yearData.isCurrent,
      status: yearData.status || 'active',
      startDate: yearData.startDate || '2025-09-05',
      endDate: yearData.endDate || '2026-05-31',
      notes: yearData.notes || '',
    };
    updateDbAndSave(prev => ({
      ...prev,
      academicYears: newYear.isCurrent
        ? [...prev.academicYears.map(y => ({ ...y, isCurrent: false })), newYear]
        : [...prev.academicYears, newYear],
    }));
    return newYear;
  };

  const updateAcademicYear = (id: string, updates: Partial<AcademicYear>) => {
    updateDbAndSave(prev => ({
      ...prev,
      academicYears: prev.academicYears.map(y => {
        if (y.id === id) {
          return { ...y, ...updates };
        }
        if (updates.isCurrent && y.id !== id) {
          return { ...y, isCurrent: false };
        }
        return y;
      }),
    }));
  };

  const setCurrentAcademicYear = (id: string) => {
    updateDbAndSave(prev => {
      const target = prev.academicYears.find(y => y.id === id);
      const updatedSchools = target && prev.schools?.[0]
        ? [{ ...prev.schools[0], academicYear: target.code }]
        : prev.schools;
      return {
        ...prev,
        schools: updatedSchools,
        academicYears: prev.academicYears.map(y => ({
          ...y,
          isCurrent: y.id === id,
        })),
      };
    });
  };

  const archiveAcademicYear = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      academicYears: prev.academicYears.map(y => y.id === id ? { ...y, status: 'archived', isCurrent: false } : y),
    }));
  };

  const copyClassStructure = (fromYearId: string, toYearId: string): number => {
    let count = 0;
    updateDbAndSave(prev => {
      const sourceClasses = prev.classes.filter(c => c.academicYearId === fromYearId);
      const targetYear = prev.academicYears.find(y => y.id === toYearId);
      const newClasses: SchoolClass[] = sourceClasses.map(sc => {
        count++;
        return {
          ...sc,
          id: 'CLS_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
          code: sc.code || `LOP-${sc.name.replace(/\D/g, '')}`,
          academicYearId: toYearId,
          academicYearName: targetYear?.code || sc.academicYearName,
          studentCount: 0,
        };
      });
      return {
        ...prev,
        classes: [...prev.classes, ...newClasses],
      };
    });
    return count;
  };

  const transitionAcademicYear = (fromYearId: string, toYearId: string, advanceGrades: boolean): { updatedClasses: number; updatedStudents: number } => {
    let updatedClasses = 0;
    let updatedStudents = 0;
    updateDbAndSave(prev => {
      const targetYear = prev.academicYears.find(y => y.id === toYearId);
      const sourceClasses = prev.classes.filter(c => c.academicYearId === fromYearId);
      const existingInTarget = prev.classes.filter(c => c.academicYearId === toYearId);
      
      const newClasses: SchoolClass[] = [];
      if (existingInTarget.length === 0) {
        sourceClasses.forEach(sc => {
          updatedClasses++;
          newClasses.push({
            ...sc,
            id: 'CLS_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            academicYearId: toYearId,
            academicYearName: targetYear?.code || sc.academicYearName,
            grade: advanceGrades && sc.grade < 5 ? sc.grade + 1 : sc.grade,
            studentCount: 0,
          });
        });
      }

      let updatedUsers = prev.users;
      if (advanceGrades) {
        updatedUsers = prev.users.map(u => {
          if (u.role === 'student' && u.className) {
            updatedStudents++;
            const match = u.className.match(/Lớp\s*(\d+)([A-Za-z]?)/i);
            if (match) {
              const currentGrade = parseInt(match[1], 10);
              const section = match[2] || 'A';
              if (currentGrade < 5) {
                const nextGrade = currentGrade + 1;
                return { ...u, className: `Lớp ${nextGrade}${section}` };
              } else {
                return { ...u, status: 'locked', className: `Cựu HS (Khối 5${section})` };
              }
            }
          }
          return u;
        });
      }

      return {
        ...prev,
        classes: [...prev.classes, ...newClasses],
        users: updatedUsers,
      };
    });
    return { updatedClasses, updatedStudents };
  };

  const createClass = (clsData: Partial<SchoolClass>): SchoolClass => {
    const newClass: SchoolClass = {
      id: 'CLS_' + Date.now(),
      code: clsData.code || ('LOP-' + (clsData.name ? clsData.name.replace(/\s+/g, '') : 'MOI')),
      name: clsData.name || 'Lớp mới',
      grade: clsData.grade || 1,
      academicYearId: clsData.academicYearId || 'AY_2024_2025',
      academicYearName: clsData.academicYearName || '2024-2025',
      homeroomTeacherId: clsData.homeroomTeacherId || 'USR_GV_HOC',
      homeroomTeacherName: clsData.homeroomTeacherName || 'Thầy Nguyễn Văn Học',
      studentCount: clsData.studentCount || 0,
      status: clsData.status || 'active',
      roomNumber: clsData.roomNumber || 'P.101',
    };
    updateDbAndSave(prev => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));
    return newClass;
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    updateDbAndSave(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const deleteClass = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== id),
    }));
  };

  const transferStudent = (studentId: string, targetClassId: string): boolean => {
    let success = false;
    updateDbAndSave(prev => {
      const student = prev.users.find(u => u.id === studentId);
      const targetClass = prev.classes.find(c => c.id === targetClassId);
      if (!student || !targetClass) return prev;

      const updatedUsers = prev.users.map(u => {
        if (u.id === studentId) {
          return {
            ...u,
            classId: targetClass.id,
            className: targetClass.name,
            updatedAt: new Date().toISOString(),
          };
        }
        return u;
      });

      const updatedClasses = prev.classes.map(c => {
        const count = updatedUsers.filter(u => u.role === 'student' && (u.classId === c.id || u.className === c.name)).length;
        return { ...c, studentCount: count };
      });

      success = true;
      return {
        ...prev,
        users: updatedUsers,
        classes: updatedClasses,
      };
    });
    return success;
  };

  const addStudentToClass = (classId: string, studentId: string): boolean => {
    return transferStudent(studentId, classId);
  };

  const createSubject = (subData: Partial<Subject>): Subject => {
    const newSub: Subject = {
      id: 'SUB_' + Date.now(),
      name: subData.name || 'Môn học mới',
      code: subData.code || 'MON',
      grades: subData.grades || [1, 2, 3, 4, 5],
      periodsPerWeek: subData.periodsPerWeek || 2,
      description: subData.description || '',
      icon: subData.icon || 'BookOpen',
      color: subData.color || 'bg-blue-500',
    };
    updateDbAndSave(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSub],
    }));
    return newSub;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    updateDbAndSave(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const deleteSubject = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
    }));
  };

  const createTeachingAssignment = (assignData: Partial<TeachingAssignment>): TeachingAssignment => {
    const newAssign: TeachingAssignment = {
      id: 'ASN_T_' + Date.now(),
      teacherId: assignData.teacherId || 'USR_GV_HOC',
      teacherName: assignData.teacherName || 'Giáo viên',
      classId: assignData.classId || 'CLS_3A',
      className: assignData.className || 'Lớp 3A',
      grade: assignData.grade || 3,
      subjectId: assignData.subjectId || 'SUB_TIN',
      subjectName: assignData.subjectName || 'Tin học',
      academicYearId: assignData.academicYearId || 'AY_2024_2025',
      periodsPerWeek: assignData.periodsPerWeek || 2,
      roleInClass: assignData.roleInClass || 'primary',
      notes: assignData.notes || '',
      createdAt: new Date().toISOString(),
    };
    updateDbAndSave(prev => ({
      ...prev,
      teachingAssignments: [...(prev.teachingAssignments || []), newAssign],
    }));
    return newAssign;
  };

  const updateTeachingAssignment = (id: string, updates: Partial<TeachingAssignment>) => {
    updateDbAndSave(prev => ({
      ...prev,
      teachingAssignments: (prev.teachingAssignments || []).map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  };

  const deleteTeachingAssignment = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      teachingAssignments: (prev.teachingAssignments || []).filter(a => a.id !== id),
    }));
  };

  const batchAssignTeaching = (teacherId: string, assignments: { classId: string; subjectId: string; periodsPerWeek?: number; roleInClass?: 'primary' | 'assistant' }[]): number => {
    let added = 0;
    updateDbAndSave(prev => {
      const teacher = prev.users.find(u => u.id === teacherId);
      const teacherName = teacher?.name || 'Giáo viên';
      const newItems: TeachingAssignment[] = [];
      assignments.forEach(item => {
        const cls = prev.classes.find(c => c.id === item.classId);
        const sub = prev.subjects.find(s => s.id === item.subjectId);
        if (cls && sub) {
          added++;
          newItems.push({
            id: 'ASN_T_' + Date.now() + '_' + added,
            teacherId,
            teacherName,
            classId: item.classId,
            className: cls.name,
            grade: cls.grade,
            subjectId: item.subjectId,
            subjectName: sub.name,
            academicYearId: cls.academicYearId || 'AY_2024_2025',
            periodsPerWeek: item.periodsPerWeek || sub.periodsPerWeek || 2,
            roleInClass: item.roleInClass || 'primary',
            createdAt: new Date().toISOString(),
          });
        }
      });
      return {
        ...prev,
        teachingAssignments: [...(prev.teachingAssignments || []), ...newItems],
      };
    });
    return added;
  };

  const markNotificationRead = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
    }));
  };

  const resetAllData = () => {
    const fresh = StorageService.resetToDefault();
    setDb(fresh);
  };

  const exportDatabaseJson = (): string => {
    return JSON.stringify(db, null, 2);
  };

  const importDatabaseJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.users && parsed.courses) {
        StorageService.saveDatabase(parsed);
        setDb(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON', e);
    }
    return false;
  };

  const currentAcademicYear = db.academicYears?.find(y => y.isCurrent) || db.academicYears?.[0];
  const school = db.schools?.[0] || INITIAL_SCHOOL;

  return (
    <LMSContext.Provider
      value={{
        db,
        school,
        academicYears: db.academicYears || [],
        currentAcademicYear,
        courses: db.courses,
        modules: db.modules,
        lessons: db.lessons,
        stops: db.stops,
        packages: db.packages,
        assignments: db.assignments,
        progressList: db.progress,
        classes: db.classes,
        subjects: db.subjects,
        teachingAssignments: db.teachingAssignments || [],
        notifications: db.notifications,
        updateSchool,
        createAcademicYear,
        updateAcademicYear,
        setCurrentAcademicYear,
        archiveAcademicYear,
        copyClassStructure,
        transitionAcademicYear,
        createCourse,
        updateCourse,
        deleteCourse,
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
        addPackage,
        deletePackage,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        getStudentProgress,
        saveStudentProgress,
        recordStopAnswer,
        createUser,
        updateUser,
        deleteUser,
        deleteAllUsers,
        toggleUserStatus,
        createUsersBatch,
        createClass,
        updateClass,
        deleteClass,
        transferStudent,
        addStudentToClass,
        createSubject,
        updateSubject,
        deleteSubject,
        createTeachingAssignment,
        updateTeachingAssignment,
        deleteTeachingAssignment,
        batchAssignTeaching,
        markNotificationRead,
        resetAllData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};
