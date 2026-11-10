import { 
  User, School, AcademicYear, SchoolClass, Subject, TeachingAssignment,
  Course, CourseModule, Lesson, LessonStop, 
  LearningPackage, LearningAssignment, StudentProgress, 
  NotificationItem 
} from '../types/lms';

const STORAGE_KEY_PREFIX = 'ELEMS_LMS_DATA_ONLINE_100_V3_';
const LEGACY_STORAGE_KEYS = [
  'ELEMS_LMS_DATA_EMPTY_USERS_V2_DB',
  'ELEMS_LMS_DATA_EMPTY_USERS_V2_',
  'ELEMS_LMS_DATA_CLEAN_V1_DB',
  'ELEMS_LMS_DATA_CLEAN_V1_',
  'ELEMS_LMS_DATA_V4_DB',
  'ELEMS_LMS_DATA_V4_',
  'ELEMS_LMS_DATA_V3_DB',
  'ELEMS_LMS_DATA_V2_DB',
  'ELEMS_LMS_DATA_V1_DB',
];

export interface LMSDatabase {
  users: User[];
  schools: School[];
  academicYears: AcademicYear[];
  classes: SchoolClass[];
  subjects: Subject[];
  teachingAssignments: TeachingAssignment[];
  courses: Course[];
  modules: CourseModule[];
  lessons: Lesson[];
  packages: LearningPackage[];
  stops: LessonStop[];
  assignments: LearningAssignment[];
  progress: StudentProgress[];
  notifications: NotificationItem[];
}

export const INITIAL_SCHOOL: School = {
  id: 'SCH_01',
  code: 'TH-LVT01',
  name: 'Trường Tiểu học Lê Văn Tám',
  address: 'Số 16 Hoàng Hoa Thám, Quận Ba Đình, TP. Hà Nội',
  phone: '024 3845 2299',
  email: 'c1levantam@edu.hanoi.gov.vn',
  principalName: 'Thầy Nguyễn Văn Học',
  academicYear: '2024-2025',
  logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=80',
  website: 'https://th-levantam.hanoi.edu.vn',
};

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  { 
    id: 'AY_2024_2025', 
    code: '2024-2025', 
    name: 'Năm học 2024 - 2025', 
    isCurrent: true, 
    status: 'active',
    startDate: '2024-09-05',
    endDate: '2025-05-31',
    notes: 'Năm học trọng điểm thực hiện đổi mới giáo dục theo chuẩn GDPT 2018'
  },
  { 
    id: 'AY_2025_2026', 
    code: '2025-2026', 
    name: 'Năm học 2025 - 2026', 
    isCurrent: false, 
    status: 'active',
    startDate: '2025-09-05',
    endDate: '2026-05-31',
    notes: 'Kế hoạch năm học tiếp theo'
  },
];

export const INITIAL_CLASSES: SchoolClass[] = [
  { id: 'CLS_1A', code: 'LOP-1A', name: 'Lớp 1A', grade: 1, academicYearId: 'AY_2024_2025', academicYearName: '2024-2025', homeroomTeacherId: 'USR_GV_HOC', homeroomTeacherName: 'Thầy Nguyễn Văn Học', studentCount: 0, status: 'active', roomNumber: 'P.101' },
  { id: 'CLS_1B', code: 'LOP-1B', name: 'Lớp 1B', grade: 1, academicYearId: 'AY_2024_2025', academicYearName: '2024-2025', homeroomTeacherId: 'USR_GV_HOC', homeroomTeacherName: 'Thầy Nguyễn Văn Học', studentCount: 0, status: 'active', roomNumber: 'P.102' },
  { id: 'CLS_2A', code: 'LOP-2A', name: 'Lớp 2A', grade: 2, academicYearId: 'AY_2024_2025', academicYearName: '2024-2025', homeroomTeacherId: 'USR_GV_HOC', homeroomTeacherName: 'Thầy Nguyễn Văn Học', studentCount: 0, status: 'active', roomNumber: 'P.201' },
  { id: 'CLS_2B', code: 'LOP-2B', name: 'Lớp 2B', grade: 2, academicYearId: 'AY_2024_2025', academicYearName: '2024-2025', homeroomTeacherId: 'USR_GV_HOC', homeroomTeacherName: 'Thầy Nguyễn Văn Học', studentCount: 0, status: 'active', roomNumber: 'P.202' },
  { id: 'CLS_3A', code: 'LOP-3A', name: 'Lớp 3A', grade: 3, academicYearId: 'AY_2024_2025', academicYearName: '2024-2025', homeroomTeacherId: 'USR_GV_HOC', homeroomTeacherName: 'Thầy Nguyễn Văn Học', studentCount: 0, status: 'active', roomNumber: 'P.301' },
  { id: 'CLS_3B', code: 'LOP-3B', name: 'Lớp 3B', grade: 3, academicYearId: 'AY_2024_2025', academicYearName: '2024-2025', homeroomTeacherId: 'USR_GV_HOC', homeroomTeacherName: 'Thầy Nguyễn Văn Học', studentCount: 0, status: 'active', roomNumber: 'P.302' },
  { id: 'CLS_4A', code: 'LOP-4A', name: 'Lớp 4A', grade: 4, academicYearId: 'AY_2024_2025', academicYearName: '2024-2025', homeroomTeacherId: 'USR_GV_HOC', homeroomTeacherName: 'Thầy Nguyễn Văn Học', studentCount: 0, status: 'active', roomNumber: 'P.401' },
  { id: 'CLS_4B', code: 'LOP-4B', name: 'Lớp 4B', grade: 4, academicYearId: 'AY_2024_2025', academicYearName: '2024-2025', homeroomTeacherId: 'USR_GV_HOC', homeroomTeacherName: 'Thầy Nguyễn Văn Học', studentCount: 0, status: 'active', roomNumber: 'P.402' },
  { id: 'CLS_5A', code: 'LOP-5A', name: 'Lớp 5A', grade: 5, academicYearId: 'AY_2024_2025', academicYearName: '2024-2025', homeroomTeacherId: 'USR_GV_HOC', homeroomTeacherName: 'Thầy Nguyễn Văn Học', studentCount: 0, status: 'active', roomNumber: 'P.501' },
  { id: 'CLS_5B', code: 'LOP-5B', name: 'Lớp 5B', grade: 5, academicYearId: 'AY_2024_2025', academicYearName: '2024-2025', homeroomTeacherId: 'USR_GV_HOC', homeroomTeacherName: 'Thầy Nguyễn Văn Học', studentCount: 0, status: 'active', roomNumber: 'P.502' },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'SUB_TOAN', name: 'Toán', code: 'TOAN', grades: [1, 2, 3, 4, 5], periodsPerWeek: 5, description: 'Phát triển tư duy logic, kỹ năng tính toán và giải quyết vấn đề toán học', icon: 'Calculator', color: 'bg-emerald-500' },
  { id: 'SUB_TV', name: 'Tiếng Việt', code: 'TV', grades: [1, 2, 3, 4, 5], periodsPerWeek: 7, description: 'Rèn luyện 4 kỹ năng nghe, nói, đọc, viết và cảm thụ văn học', icon: 'BookOpen', color: 'bg-amber-500' },
  { id: 'SUB_TIN', name: 'Tin học', code: 'TIN', grades: [3, 4, 5], periodsPerWeek: 2, description: 'Ứng dụng CNTT, kỹ năng máy tính và tư duy thuật toán tiểu học', icon: 'Laptop', color: 'bg-blue-500' },
  { id: 'SUB_TA', name: 'Tiếng Anh', code: 'TA', grades: [1, 2, 3, 4, 5], periodsPerWeek: 4, description: 'Giao tiếp tiếng Anh cơ bản theo chuẩn quốc tế và khung năng lực ngoại ngữ', icon: 'Languages', color: 'bg-purple-500' },
  { id: 'SUB_MT', name: 'Mĩ thuật', code: 'MT', grades: [1, 2, 3, 4, 5], periodsPerWeek: 1, description: 'Khơi nguồn sáng tạo hội họa, màu sắc và tạo hình nghệ thuật', icon: 'Palette', color: 'bg-pink-500' },
  { id: 'SUB_DD', name: 'Đạo đức', code: 'DD', grades: [1, 2, 3, 4, 5], periodsPerWeek: 1, description: 'Giáo dục phẩm chất, lòng nhân ái, lễ phép và kỹ năng sống văn minh', icon: 'HeartHandshake', color: 'bg-rose-500' },
  { id: 'SUB_TNXH', name: 'Tự nhiên và Xã hội', code: 'TNXH', grades: [1, 2, 3], periodsPerWeek: 2, description: 'Khám phá tự nhiên quanh em, bảo vệ sức khỏe và môi trường sống', icon: 'TreePine', color: 'bg-lime-500' },
  { id: 'SUB_KH', name: 'Khoa học', code: 'KH', grades: [4, 5], periodsPerWeek: 2, description: 'Tìm hiểu các hiện tượng khoa học, năng lượng, vật chất và sinh giới', icon: 'Sparkles', color: 'bg-cyan-500' },
  { id: 'SUB_LSDL', name: 'Lịch sử và Địa lí', code: 'LSDL', grades: [4, 5], periodsPerWeek: 2, description: 'Tự hào lịch sử hào hùng của dân tộc và khám phá non sông đất nước Việt Nam', icon: 'Compass', color: 'bg-indigo-500' },
];

export const INITIAL_TEACHING_ASSIGNMENTS: TeachingAssignment[] = [
  { id: 'ASN_T_01', teacherId: 'USR_GV_HOC', teacherName: 'Thầy Nguyễn Văn Học', classId: 'CLS_3A', className: 'Lớp 3A', grade: 3, subjectId: 'SUB_TIN', subjectName: 'Tin học', academicYearId: 'AY_2024_2025', periodsPerWeek: 2, roleInClass: 'primary', notes: 'Giảng dạy lý thuyết & thực hành phòng máy', createdAt: '2024-08-25T08:00:00Z' },
  { id: 'ASN_T_02', teacherId: 'USR_GV_HOC', teacherName: 'Thầy Nguyễn Văn Học', classId: 'CLS_3B', className: 'Lớp 3B', grade: 3, subjectId: 'SUB_TIN', subjectName: 'Tin học', academicYearId: 'AY_2024_2025', periodsPerWeek: 2, roleInClass: 'primary', notes: 'Giảng dạy lý thuyết & thực hành', createdAt: '2024-08-25T08:00:00Z' },
  { id: 'ASN_T_03', teacherId: 'USR_GV_HOC', teacherName: 'Thầy Nguyễn Văn Học', classId: 'CLS_4A', className: 'Lớp 4A', grade: 4, subjectId: 'SUB_TIN', subjectName: 'Tin học', academicYearId: 'AY_2024_2025', periodsPerWeek: 2, roleInClass: 'primary', notes: 'Soạn thảo văn bản & bảng tính', createdAt: '2024-08-25T08:00:00Z' },
  { id: 'ASN_T_04', teacherId: 'USR_GV_HOC', teacherName: 'Thầy Nguyễn Văn Học', classId: 'CLS_4B', className: 'Lớp 4B', grade: 4, subjectId: 'SUB_TIN', subjectName: 'Tin học', academicYearId: 'AY_2024_2025', periodsPerWeek: 2, roleInClass: 'primary', notes: 'Phòng thực hành số 2', createdAt: '2024-08-25T08:00:00Z' },
  { id: 'ASN_T_05', teacherId: 'USR_GV_HOC', teacherName: 'Thầy Nguyễn Văn Học', classId: 'CLS_5A', className: 'Lớp 5A', grade: 5, subjectId: 'SUB_TIN', subjectName: 'Tin học', academicYearId: 'AY_2024_2025', periodsPerWeek: 2, roleInClass: 'primary', notes: 'Lập trình đồ họa Scratch cơ bản', createdAt: '2024-08-25T08:00:00Z' },
];

/**
 * Authentic teacher account (Hoc.teacher@gmail.com) for 100% online operation.
 */
export const INITIAL_USERS: User[] = [
  {
    id: 'USR_GV_HOC',
    name: 'Thầy Nguyễn Văn Học',
    username: 'thayhoc',
    email: 'Hoc.teacher@gmail.com',
    role: 'teacher',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    code: 'GV-HOC01',
    schoolId: 'SCH_01',
    phone: '0912 345 678',
    birthDate: '1988-06-15',
    subjects: ['SUB_TIN', 'SUB_TOAN', 'SUB_KH'],
    createdAt: '2024-08-15T08:00:00Z',
    updatedAt: '2024-08-15T08:00:00Z',
  },
];

/**
 * Empty sample courses, modules, lessons, stops, packages, assignments, progress, and notifications.
 * The system starts clean for authentic school usage.
 */
export const INITIAL_COURSES: Course[] = [];
export const INITIAL_MODULES: CourseModule[] = [];
export const INITIAL_LESSONS: Lesson[] = [];
export const INITIAL_STOPS: LessonStop[] = [];
export const INITIAL_PACKAGES: LearningPackage[] = [];
export const INITIAL_ASSIGNMENTS: LearningAssignment[] = [];
export const INITIAL_PROGRESS: StudentProgress[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

// Identifiers of removed sample entities to sanitize any cached data
const SAMPLE_COURSE_IDS = new Set(['CRS_TIN5', 'CRS_TIN3', 'CRS_TOAN4', 'CRS_TV2', 'CRS_TA5']);
const SAMPLE_USER_IDS = new Set(['USR_ADMIN', 'USR_HS01', 'USR_HS02', 'USR_HS03']);
const SAMPLE_PACKAGE_IDS = new Set(['PKG_SCORM_TIN3', 'PKG_HTML5_TA5']);
const SAMPLE_ASSIGNMENT_IDS = new Set(['ASN_01', 'ASN_02']);
const SAMPLE_PROGRESS_IDS = new Set(['PRG_HS01_TIN1', 'PRG_HS02_TOAN1']);
const SAMPLE_NOTIF_IDS = new Set(['NOTIF_01', 'NOTIF_02', 'NOTIF_03']);

export class StorageService {
  public static loadDatabase(): LMSDatabase {
    // Purge legacy storage keys once
    try {
      LEGACY_STORAGE_KEYS.forEach(k => {
        localStorage.removeItem(k);
        localStorage.removeItem(k + 'DB');
      });
      localStorage.removeItem('ELEMS_ACTIVE_USER_ID');
    } catch (e) {
      // Ignore
    }

    try {
      const dataStr = localStorage.getItem(STORAGE_KEY_PREFIX + 'DB');
      if (dataStr) {
        const parsed: LMSDatabase = JSON.parse(dataStr);

        // Sanitize any sample items that might have been saved in browser cache
        if (parsed.users) {
          parsed.users = parsed.users.filter((u: User) => !SAMPLE_USER_IDS.has(u.id));
        }
        if (parsed.courses) {
          parsed.courses = parsed.courses.filter((c: Course) => !SAMPLE_COURSE_IDS.has(c.id));
        }
        if (parsed.modules) {
          parsed.modules = parsed.modules.filter((m: CourseModule) => !SAMPLE_COURSE_IDS.has(m.courseId));
        }
        if (parsed.lessons) {
          parsed.lessons = parsed.lessons.filter((l: Lesson) => !SAMPLE_COURSE_IDS.has(l.courseId));
        }
        if (parsed.stops) {
          parsed.stops = parsed.stops.filter((s: LessonStop) => !s.id.startsWith('STP_TIN') && !s.id.startsWith('STP_TOAN'));
        }
        if (parsed.packages) {
          parsed.packages = parsed.packages.filter((p: LearningPackage) => !SAMPLE_PACKAGE_IDS.has(p.id));
        }
        if (parsed.assignments) {
          parsed.assignments = parsed.assignments.filter((a: LearningAssignment) => !SAMPLE_ASSIGNMENT_IDS.has(a.id) && !SAMPLE_COURSE_IDS.has(a.courseId));
        }
        if (parsed.progress) {
          parsed.progress = parsed.progress.filter((p: StudentProgress) => !SAMPLE_PROGRESS_IDS.has(p.id) && !SAMPLE_USER_IDS.has(p.studentId) && !SAMPLE_COURSE_IDS.has(p.courseId));
        }
        if (parsed.notifications) {
          parsed.notifications = parsed.notifications.filter((n: NotificationItem) => !SAMPLE_NOTIF_IDS.has(n.id) && !SAMPLE_USER_IDS.has(n.userId));
        }

        // Ensure teacher account is active for 100% online operation
        const hasHoc = parsed.users?.some((u: User) => u.email?.toLowerCase() === 'hoc.teacher@gmail.com');
        if (!hasHoc) {
          parsed.users = [INITIAL_USERS[0], ...(parsed.users || [])];
        }

        if (!parsed.teachingAssignments || parsed.teachingAssignments.length === 0) {
          parsed.teachingAssignments = INITIAL_TEACHING_ASSIGNMENTS;
        }
        if (!parsed.schools || parsed.schools.length === 0) {
          parsed.schools = [INITIAL_SCHOOL];
        }
        if (!parsed.academicYears || parsed.academicYears.length === 0) {
          parsed.academicYears = INITIAL_ACADEMIC_YEARS;
        }
        if (!parsed.classes || parsed.classes.length === 0) {
          parsed.classes = INITIAL_CLASSES;
        }
        if (!parsed.subjects || parsed.subjects.length === 0) {
          parsed.subjects = INITIAL_SUBJECTS;
        }

        StorageService.saveDatabase(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse database from localStorage', e);
    }

    // Default clean seed
    const initialDb: LMSDatabase = {
      users: INITIAL_USERS,
      schools: [INITIAL_SCHOOL],
      academicYears: INITIAL_ACADEMIC_YEARS,
      classes: INITIAL_CLASSES,
      subjects: INITIAL_SUBJECTS,
      teachingAssignments: INITIAL_TEACHING_ASSIGNMENTS,
      courses: INITIAL_COURSES,
      modules: INITIAL_MODULES,
      lessons: INITIAL_LESSONS,
      packages: INITIAL_PACKAGES,
      stops: INITIAL_STOPS,
      assignments: INITIAL_ASSIGNMENTS,
      progress: INITIAL_PROGRESS,
      notifications: INITIAL_NOTIFICATIONS,
    };
    StorageService.saveDatabase(initialDb);
    return initialDb;
  }

  public static saveDatabase(db: LMSDatabase): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'DB', JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save database to localStorage', e);
    }
  }

  public static resetToDefault(): LMSDatabase {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'DB');
      LEGACY_STORAGE_KEYS.forEach(k => {
        localStorage.removeItem(k);
        localStorage.removeItem(k + 'DB');
      });
    } catch (e) {}
    return StorageService.loadDatabase();
  }
}
