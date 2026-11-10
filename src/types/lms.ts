export type UserRole = 'admin' | 'teacher' | 'student';
export type UserStatus = 'active' | 'locked';

export interface User {
  id: string;
  name: string;
  username: string; // Tên đăng nhập
  email: string;
  role: UserRole;
  status: UserStatus; // Hoạt động / Bị khóa
  avatar: string;
  phone?: string;
  birthDate?: string; // Ngày sinh
  code: string; // Mã người dùng (Mã GV hoặc Mã HS)
  schoolId: string;
  classId?: string; // For students
  className?: string;
  subjects?: string[]; // For teachers
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  code: string; // Mã trường: TH-LVT01
  name: string; // Tên trường
  address: string; // Địa chỉ
  phone: string;
  email: string;
  principalName: string; // Hiệu trưởng
  academicYear: string; // Năm học hiện hành
  logo: string; // Logo trường
  website?: string;
}

export interface AcademicYear {
  id: string;
  code: string; // 2024-2025
  name: string; // Năm học 2024 - 2025
  isCurrent: boolean;
  status?: 'active' | 'archived';
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface SchoolClass {
  id: string;
  code: string; // Mã lớp: CLS_1A, LOP-1A
  name: string; // 1A, 2A, 3B, 4A, 5A...
  grade: number; // 1, 2, 3, 4, 5
  academicYearId: string;
  academicYearName?: string;
  homeroomTeacherId: string;
  homeroomTeacherName?: string;
  studentCount: number;
  status: 'active' | 'archived';
  roomNumber?: string;
}

export interface Subject {
  id: string;
  name: string; // Tin học, Toán, Tiếng Việt, Tiếng Anh, Mĩ thuật...
  code: string;
  grades: number[]; // e.g. [1, 2, 3, 4, 5]
  periodsPerWeek?: number; // Số tiết / tuần
  description?: string;
  icon: string;
  color: string;
}

export interface TeachingAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  grade: number;
  subjectId: string;
  subjectName: string;
  academicYearId: string;
  periodsPerWeek?: number;
  roleInClass?: 'primary' | 'assistant';
  notes?: string;
  createdAt: string;
}

export type CourseStatus = 'draft' | 'published' | 'in_progress' | 'completed';

export interface Course {
  id: string;
  code: string;
  title: string;
  subjectId: string;
  subjectName: string;
  grade: number;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  classId?: string;
  className?: string;
  targetClassIds?: string[];
  targetClassNames?: string[];
  description: string;
  thumbnail: string;
  startDate: string;
  endDate: string;
  status: CourseStatus;
  modulesCount: number;
  lessonsCount: number;
  totalDurationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  description?: string;
}

export type LectureType = 'scorm12' | 'scorm2004' | 'html5' | 'video' | 'pdf' | 'pptx' | 'interactive';

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  type: LectureType;
  durationSeconds: number; // total length of video or estimated minutes * 60
  packageId?: string;
  contentUrl?: string; // video url, pdf url, or unpacked entry html url
  fileName?: string;
  fileSize?: string;
  stopsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPackage {
  id: string;
  name: string;
  type: LectureType;
  fileName: string;
  fileSizeBytes: number;
  uploadDate: string;
  uploaderId: string;
  uploaderName: string;
  subjectId?: string;
  subjectName?: string;
  grade?: number;
  processingStatus?: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  storagePath?: string;
  entryPoint: string; // e.g. "index.html" or "shared/launch.html"
  scormVersion?: '1.2' | '2004';
  scormTitle?: string;
  manifestData?: any;
  packageBlobUrl?: string; // In-memory/blob url for session
  extractedFilesCount?: number;
  description?: string;
  thumbnail?: string;
}

export type StopType = 
  | 'quiz_single' // Trắc nghiệm 1 đáp án
  | 'quiz_boolean' // Đúng / Sai
  | 'quiz_multi' // Chọn nhiều đáp án
  | 'fill_blank' // Điền từ vào chỗ trống
  | 'short_answer' // Trả lời ngắn
  | 'video_watch' // Xem video bổ trợ
  | 'read_content' // Đọc nội dung/ghi nhớ
  | 'interactive_card' // Bài tập tương tác / thẻ ghi nhớ
  | 'checkpoint' // Kiểm tra kiến thức
  | 'teacher_confirm'; // Yêu cầu giáo viên xác nhận

export type StopContinuationPolicy = 
  | 'require_correct' // A. Bắt buộc đúng mới được tiếp tục
  | 'require_attempt' // B. Bắt buộc trả lời nhưng không yêu cầu đúng
  | 'allow_skip'      // C. Cho phép bỏ qua
  | 'optional';       // D. Chỉ mang tính tương tác, không ảnh hưởng

export interface StopOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface LessonStop {
  id: string;
  lessonId: string;
  title: string;
  stopType: StopType;
  timestampSeconds: number; // For video or interactive (in seconds)
  pageNumber?: number; // For PDF/Slide
  questionText: string;
  questionImage?: string;
  audioPrompt?: string;
  options: StopOption[];
  correctTextAnswer?: string; // For fill_blank and short_answer
  explanationCorrect: string;
  explanationIncorrect: string;
  points: number;
  maxAttempts: number; // e.g. 1, 2, 3 or unlimited (0)
  timeLimitSeconds?: number; // 0 or undefined = unlimited
  continuationPolicy: StopContinuationPolicy;
  order: number;
  teacherNote?: string;
}

export interface LearningAssignment {
  id: string;
  courseId: string;
  lessonId?: string; // specific lesson or entire course
  title: string;
  assignedByTeacherId: string;
  assignedByTeacherName: string;
  targetType: 'student' | 'group' | 'class' | 'multiple_classes' | 'school';
  targetIds: string[]; // List of student IDs or class IDs
  targetNames: string[];
  assignedDate: string;
  dueDate: string;
  maxAttempts: number;
  minPassScore: number; // e.g. 70 (%)
  allowRetake: boolean;
  requiredCompletionRate: number; // e.g. 100 (%)
  note?: string;
  status: 'active' | 'expired' | 'draft';
  createdAt: string;
}

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface StudentStopAnswer {
  stopId: string;
  studentId: string;
  attemptsCount: number;
  selectedOptionIds: string[];
  textAnswer?: string;
  isCorrect: boolean;
  scoreEarned: number;
  answeredAt: string;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  courseId: string;
  lessonId: string;
  status: ProgressStatus;
  currentPositionSeconds: number;
  maxPositionSeconds: number;
  completionPercentage: number;
  score: number;
  timeSpentSeconds: number;
  completedStops: string[]; // stopIds
  answers: Record<string, StudentStopAnswer>; // stopId -> answer
  firstStartedAt: string;
  lastActiveAt: string;
  completedAt?: string;
  scormSuspendData?: string;
  scormLessonStatus?: string;
  teacherFeedback?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'grade' | 'system' | 'reminder';
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
}

export interface ReportSummary {
  totalCourses: number;
  totalLessons: number;
  totalStudents: number;
  totalTeachers: number;
  overallCompletionRate: number;
  averageScore: number;
  averageStudyHours: number;
  strugglingStudentsCount: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
}
