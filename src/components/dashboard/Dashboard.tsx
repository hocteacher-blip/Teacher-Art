import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';
import { Course, Lesson } from '../../types/lms';
import { HardDrive, Info } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, param?: any) => void;
  onPlayLesson?: (course: Course, lesson: Lesson) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onPlayLesson }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'teacher';

  return (
    <div className="space-y-6">
      {/* Explicit DEMO / Offline Data Storage Notice */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2.5 text-emerald-900 font-semibold">
          <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <b>Chế độ DEMO:</b> Dữ liệu học tập, gói bài giảng SCORM và điểm số được lưu trữ cục bộ bảo mật trên trình duyệt (IndexedDB / LocalStorage) và sẵn sàng tích hợp Firebase/Cloud khi được yêu cầu.
          </span>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto shrink-0">
          Hoạt động ngoại tuyến 100%
        </span>
      </div>

      {/* Role-specific dashboard */}
      {role === 'admin' && <AdminDashboard onNavigate={onNavigate} />}
      {role === 'teacher' && <TeacherDashboard onNavigate={onNavigate} />}
      {role === 'student' && (
        <StudentDashboard
          onNavigate={onNavigate}
          onPlayLesson={(crs, les) => onPlayLesson?.(crs, les)}
        />
      )}
    </div>
  );
};
