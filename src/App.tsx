import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LMSProvider, useLMS } from './context/LMSContext';
import { AppLayout } from './components/common/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { CourseList } from './components/courses/CourseList';
import { CourseDetail } from './components/courses/CourseDetail';
import { LectureRepository } from './components/elearning/LectureRepository';
import { StopEditorTimeline } from './components/elearning/StopEditorTimeline';
import { LecturePlayer } from './components/elearning/LecturePlayer';
import { AssignmentManager } from './components/assignments/AssignmentManager';
import { ProgressTracker } from './components/progress/ProgressTracker';
import { AnalyticsReport } from './components/reports/AnalyticsReport';
import { UserManagement } from './components/admin/UserManagement';
import { ClassSubjectManagement } from './components/admin/ClassSubjectManagement';
import { SystemSettings } from './components/admin/SystemSettings';
import { LoginView } from './components/auth/LoginView';
import { Course, Lesson } from './types/lms';

function LMSMainContent() {
  const { currentUser } = useAuth();
  const { courses, lessons } = useLMS();

  // Navigation state
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Player & Stop editor states
  const [isPlayingLecture, setIsPlayingLecture] = useState<boolean>(false);
  const [isEditingStops, setIsEditingStops] = useState<boolean>(false);
  const [editingStopsLesson, setEditingStopsLesson] = useState<Lesson | null>(null);

  const handleNavigate = (view: string, param?: any) => {
    setIsPlayingLecture(false);
    setIsEditingStops(false);
    setActiveView(view);
    if (view === 'courses' && param) {
      setSelectedCourse(param);
    } else if (view === 'courses' && !param) {
      setSelectedCourse(null);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setActiveView('courses');
  };

  const handlePlayLesson = (course: Course, lesson: Lesson) => {
    setSelectedCourse(course);
    setSelectedLesson(lesson);
    setIsPlayingLecture(true);
  };

  const handleEditStops = (lesson: Lesson) => {
    setEditingStopsLesson(lesson);
    setIsEditingStops(true);
  };

  if (!currentUser) {
    return <LoginView />;
  }

  // Active full-screen lecture player
  if (isPlayingLecture && selectedCourse && selectedLesson) {
    return (
      <LecturePlayer
        course={selectedCourse}
        lesson={selectedLesson}
        onBack={() => setIsPlayingLecture(false)}
        onSelectLesson={(lessonId: string) => {
          const found = lessons.find(l => l.id === lessonId);
          if (found) setSelectedLesson(found);
        }}
      />
    );
  }

  // Active Stop Timeline editor
  if (isEditingStops && editingStopsLesson) {
    return (
      <AppLayout activeView={activeView} onNavigate={handleNavigate}>
        <StopEditorTimeline
          lesson={editingStopsLesson}
          onBack={() => setIsEditingStops(false)}
          onTestPlayer={() => {
            const crs = courses.find(c => c.id === editingStopsLesson.courseId);
            if (crs) {
              setSelectedCourse(crs);
              setSelectedLesson(editingStopsLesson);
              setIsEditingStops(false);
              setIsPlayingLecture(true);
            }
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout activeView={activeView} onNavigate={handleNavigate}>
      {/* 1. Tổng quan (Dashboard) */}
      {activeView === 'dashboard' && (
        <Dashboard
          onNavigate={handleNavigate}
          onPlayLesson={(crs, les) => handlePlayLesson(crs, les)}
        />
      )}

      {/* 2. Khóa học (Courses) */}
      {activeView === 'courses' && (
        selectedCourse ? (
          <CourseDetail
            course={selectedCourse}
            onBack={() => setSelectedCourse(null)}
            onPlayLesson={(les) => handlePlayLesson(selectedCourse, les)}
            onEditStops={(les) => handleEditStops(les)}
            onAssignCourse={() => setActiveView('assignments')}
          />
        ) : (
          <CourseList onSelectCourse={handleSelectCourse} />
        )
      )}

      {/* 3. Bài giảng (SCORM / HTML5 / Video Repository) */}
      {activeView === 'repository' && (
        <LectureRepository
          onAttachToCourse={() => setActiveView('courses')}
        />
      )}

      {/* 4. Lớp học (Classes & Subjects) */}
      {activeView === 'classes' && (
        <ClassSubjectManagement />
      )}

      {/* 5. Giao bài (Assignments) */}
      {activeView === 'assignments' && (
        <AssignmentManager
          initialCourse={selectedCourse}
          onSelectCourse={(crs) => {
            setSelectedCourse(crs);
            setActiveView('courses');
          }}
        />
      )}

      {/* 6. Tiến độ học tập (Progress) */}
      {activeView === 'progress' && (
        <ProgressTracker />
      )}

      {/* 7. Báo cáo (Reports & Statistics) */}
      {activeView === 'reports' && (
        <AnalyticsReport />
      )}

      {/* 8. Người dùng (Users) */}
      {activeView === 'users' && (
        <UserManagement />
      )}

      {/* 9. Cài đặt (Settings) */}
      {activeView === 'settings' && (
        <SystemSettings />
      )}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LMSProvider>
        <LMSMainContent />
      </LMSProvider>
    </AuthProvider>
  );
}
