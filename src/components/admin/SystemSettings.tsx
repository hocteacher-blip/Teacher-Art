import React, { useState, useRef } from 'react';
import { useLMS } from '../../context/LMSContext';
import { 
  Settings, School, Database, Download, Upload, 
  RotateCcw, ShieldCheck, CheckCircle2, HardDrive, Cpu 
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { db, resetAllData, exportDatabaseJson, importDatabaseJson } = useLMS();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const school = db.schools[0] || {
    name: 'Trường Tiểu học Lê Văn Tám',
    address: 'Số 16 Hoàng Hoa Thám, Quận Ba Đình, Hà Nội',
    phone: '024 3845 2299',
    email: 'c1levantam@edu.hanoi.gov.vn',
    principalName: 'Thầy Nguyễn Văn Quản',
    academicYear: '2024-2025',
  };

  const handleExport = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ELEMS_Backup_Database_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const ok = importDatabaseJson(text);
        if (ok) {
          setImportSuccess(true);
          setTimeout(() => {
            setImportSuccess(false);
            window.location.reload();
          }, 1500);
        } else {
          alert('Tệp sao lưu không hợp lệ hoặc bị hỏng.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Hệ thống & Cơ sở dữ liệu
          </span>
          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">
            LMS v1.0 Production
          </span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">
          Cài đặt hệ thống E-LEARNING SCHOOL
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý thông tin đơn vị trường học, cấu hình bộ máy SCORM Runtime, sao lưu và phục hồi dữ liệu.
        </p>
      </div>

      {/* School Information Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">Thông tin Trường học</h3>
            <p className="text-xs text-slate-500">Đơn vị chủ quản hệ thống đào tạo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-500 block mb-1">Tên đơn vị trường học</label>
            <div className="p-3 bg-slate-50 rounded-xl font-bold text-slate-800 border border-slate-200">
              {school.name}
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-500 block mb-1">Hiệu trưởng / Người đại diện</label>
            <div className="p-3 bg-slate-50 rounded-xl font-bold text-slate-800 border border-slate-200">
              {school.principalName}
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-500 block mb-1">Địa chỉ</label>
            <div className="p-3 bg-slate-50 rounded-xl font-medium text-slate-700 border border-slate-200">
              {school.address}
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-500 block mb-1">Năm học hiện tại</label>
            <div className="p-3 bg-slate-50 rounded-xl font-bold text-emerald-700 border border-slate-200">
              {school.academicYear} (Học kỳ II)
            </div>
          </div>
        </div>
      </div>

      {/* 100% Online Operational Status Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-extrabold text-base">Hệ Thống Đang Vận Hành Trực Tuyến 100%</h3>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Tuân thủ Thông tư 09/2021/TT-BGDĐT về quản lý và tổ chức dạy học trực tuyến trong cơ sở giáo dục phổ thông.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold self-start sm:self-auto">
            <span>Trạng thái: 100% Online Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Môi trường mạng</span>
            <span className="font-extrabold text-sm mt-0.5 block">Web Server HTTPS</span>
            <p className="text-[11px] text-emerald-100 mt-0.5">Truy cập tức thì qua trình duyệt</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">SCORM Runtime</span>
            <span className="font-extrabold text-sm mt-0.5 block">API 1.2 & 2004</span>
            <p className="text-[11px] text-emerald-100 mt-0.5">Cầu nối thời gian thực 100%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Học liệu số</span>
            <span className="font-extrabold text-sm mt-0.5 block">HTML5 / Video / PDF</span>
            <p className="text-[11px] text-emerald-100 mt-0.5">Giải nén & chạy trực tiếp</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Đồng bộ tiến độ</span>
            <span className="font-extrabold text-sm mt-0.5 block">Điểm dừng & Điểm số</span>
            <p className="text-[11px] text-emerald-100 mt-0.5">Tự động chấm & lưu trữ</p>
          </div>
        </div>
      </div>

      {/* SCORM Engine & Tech Specs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">Cấu hình Bộ máy e-Learning (SCORM Runtime)</h3>
            <p className="text-xs text-slate-500">Chuẩn kết nối dữ liệu học tập quốc tế</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="font-bold text-emerald-800 block text-sm">SCORM 1.2 Bridge</span>
            <p className="text-emerald-700 mt-1">Đã tích hợp API cmi.core (lesson_status, score.raw, session_time, suspend_data).</p>
          </div>
          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200">
            <span className="font-bold text-teal-800 block text-sm">SCORM 2004 Bridge</span>
            <p className="text-teal-700 mt-1">Hỗ trợ API_1484_11, completion_status, success_status, score.scaled.</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <span className="font-bold text-blue-800 block text-sm">Điểm dừng tương tác</span>
            <p className="text-blue-700 mt-1">10 loại câu hỏi và nhiệm vụ, tự động pause và kiểm tra kết quả theo 4 chế độ.</p>
          </div>
        </div>
      </div>

      {/* Database Backup & Restore */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-800">Sao lưu & Khôi phục Cơ sở dữ liệu</h3>
            <p className="text-xs text-slate-500">Xuất/nhập dữ liệu toàn hệ thống sang tệp JSON an toàn</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Sao lưu toàn bộ dữ liệu (Export JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Phục hồi từ tệp sao lưu (Import JSON)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            onClick={() => {
              if (confirm('Xác nhận đặt lại hệ thống sạch (xóa toàn bộ các khóa học và tài khoản mẫu)?')) {
                resetAllData();
                window.location.reload();
              }
            }}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt lại hệ thống sạch</span>
          </button>
        </div>

        {importSuccess && (
          <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Nhập dữ liệu thành công! Đang tải lại hệ thống...</span>
          </div>
        )}
      </div>
    </div>
  );
};
