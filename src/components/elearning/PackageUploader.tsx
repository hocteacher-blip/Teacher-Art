import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { parseElearningZip, generateDemoScormZipBlob } from '../../services/zipParser';
import { LectureType } from '../../types/lms';
import { 
  Upload, FileArchive, Video, FileText, CheckCircle2, 
  AlertCircle, Sparkles, Loader2, ArrowRight, X 
} from 'lucide-react';

interface PackageUploaderProps {
  onSuccess: (packageId: string) => void;
  onCancel: () => void;
}

export const PackageUploader: React.FC<PackageUploaderProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { addPackage } = useLMS();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [packageType, setPackageType] = useState<LectureType>('scorm12');
  const [packageName, setPackageName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseLog, setParseLog] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedPackageId, setUploadedPackageId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (!packageName) {
      setPackageName(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Auto-detect type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'zip') {
      // Will be determined via manifest
    } else if (ext === 'mp4' || ext === 'webm') {
      setPackageType('video');
    } else if (ext === 'pdf') {
      setPackageType('pdf');
    } else if (ext === 'pptx' || ext === 'ppt') {
      setPackageType('pptx');
    }
  };

  const handleUploadAndProcess = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn tệp bài giảng cần tải lên');
      return;
    }

    setIsProcessing(true);
    setParseLog(['Bắt đầu tải lên tệp: ' + selectedFile.name + ` (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`]);

    try {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();

      if (ext === 'zip') {
        setParseLog(prev => [...prev, 'Đang giải nén và phân tích cấu trúc gói ZIP...']);
        const parsed = await parseElearningZip(selectedFile);

        setParseLog(prev => [
          ...prev,
          `Đã phân tích xong: Phát hiện định dạng ${parsed.type.toUpperCase()}`,
          parsed.scormVersion ? `Chuẩn SCORM phiên bản: ${parsed.scormVersion}` : 'Định dạng HTML5 Web Package',
          `Điểm khởi chạy (Entry Point): ${parsed.entryPoint}`,
          `Số lượng tệp trong gói: ${parsed.filesCount} tệp`,
        ]);

        const newPkg = addPackage({
          name: packageName || parsed.title,
          type: parsed.type,
          fileName: selectedFile.name,
          fileSizeBytes: selectedFile.size,
          uploaderId: currentUser?.id || 'USR_GV01',
          uploaderName: currentUser?.name || 'Giáo viên',
          entryPoint: parsed.entryPoint,
          scormVersion: parsed.scormVersion,
          scormTitle: parsed.title,
          extractedFilesCount: parsed.filesCount,
          packageBlobUrl: parsed.mainLaunchUrl,
        });

        setUploadedPackageId(newPkg.id);
        setIsSuccess(true);
      } else if (ext === 'mp4') {
        setParseLog(prev => [...prev, 'Đã xác thực định dạng Video MP4 tương thích HTML5 Player']);
        const newPkg = addPackage({
          name: packageName || selectedFile.name,
          type: 'video',
          fileName: selectedFile.name,
          fileSizeBytes: selectedFile.size,
          uploaderId: currentUser?.id || 'USR_GV01',
          uploaderName: currentUser?.name || 'Giáo viên',
          entryPoint: URL.createObjectURL(selectedFile),
          extractedFilesCount: 1,
        });
        setUploadedPackageId(newPkg.id);
        setIsSuccess(true);
      } else {
        // PDF or PPTX
        setParseLog(prev => [...prev, `Đã xác thực tệp tài liệu học tập (${ext?.toUpperCase()})`]);
        const newPkg = addPackage({
          name: packageName || selectedFile.name,
          type: ext === 'pdf' ? 'pdf' : 'pptx',
          fileName: selectedFile.name,
          fileSizeBytes: selectedFile.size,
          uploaderId: currentUser?.id || 'USR_GV01',
          uploaderName: currentUser?.name || 'Giáo viên',
          entryPoint: URL.createObjectURL(selectedFile),
          extractedFilesCount: 1,
        });
        setUploadedPackageId(newPkg.id);
        setIsSuccess(true);
      }
    } catch (err: any) {
      console.error(err);
      setParseLog(prev => [...prev, 'Lỗi xử lý gói bài giảng: ' + (err.message || 'Không thể đọc tệp')]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Demo SCORM Package helper
  const handleGenerateSampleScorm = async () => {
    setIsProcessing(true);
    setParseLog(['Đang khởi tạo gói SCORM 1.2 mẫu chuẩn ADL dành cho Tiểu học...']);

    try {
      const blob = await generateDemoScormZipBlob(
        'Làm quen với bàn phím và chuột máy tính',
        3,
        'Tin học'
      );
      const file = new File([blob], 'scorm12_tin_hoc_lop3_chuan.zip', { type: 'application/zip' });
      setSelectedFile(file);
      setPackageName('SCORM 1.2: Thực hành Chuột & Bàn phím Lớp 3 (Chuẩn ADL)');
      setPackageType('scorm12');

      setParseLog(prev => [
        ...prev,
        'Đã tạo thành công gói SCORM 1.2 có tệp manifest imsmanifest.xml chuẩn và giao diện bài giảng tương tác!',
        'Nhấn nút "Tải lên và xử lý gói bài giảng" bên dưới để hoàn tất.',
      ]);
    } catch (e: any) {
      setParseLog(prev => [...prev, 'Lỗi tạo gói mẫu: ' + e.message]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl max-w-3xl w-full mx-auto animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Trung tâm tải lên bài giảng e-Learning
          </span>
          <h3 className="font-heading font-extrabold text-xl text-slate-800 mt-0.5">
            Tải lên SCORM / HTML5 / Video bài học
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isSuccess ? (
        <div className="space-y-6 pt-6">
          {/* 1-Click Generator for Demo SCORM */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Thử nghiệm nhanh: Chưa có sẵn tệp SCORM trên máy?
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Tạo tức thì 1 gói SCORM 1.2 chuẩn ADL môn Tin học 3 kèm tệp imsmanifest.xml chỉ với 1 cú nhấp chuột.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerateSampleScorm}
              disabled={isProcessing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              ⚡ Tạo gói SCORM mẫu
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên bài giảng hiển thị
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="Ví dụ: SCORM 1.2: Làm quen với chuột máy tính"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Drag & Drop File Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tệp bài giảng (SCORM ZIP, HTML5 ZIP, Video MP4, PDF, PPTX)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.mp4,.pdf,.pptx,.ppt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="font-bold text-xs text-emerald-900">{selectedFile.name}</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Nhấp để chọn lại tệp
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-xs text-slate-700">
                      Kéo thả tệp hoặc nhấp để tải lên từ máy tính
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Hỗ trợ SCORM 1.2/2004 (.zip), HTML5 Package (.zip), Video MP4, PDF, PowerPoint
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Logs */}
            {parseLog.length > 0 && (
              <div className="p-3 bg-slate-900 rounded-2xl text-[11px] font-mono text-emerald-400 max-h-36 overflow-y-auto space-y-1">
                {parseLog.map((log, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span>{'>'}</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleUploadAndProcess}
              disabled={!selectedFile || isProcessing}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-600/20 flex items-center space-x-2"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isProcessing ? 'Đang phân tích gói bài giảng...' : 'Tải lên & Lưu vào kho bài giảng'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Success Screen */
        <div className="py-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h4 className="font-heading font-extrabold text-xl text-slate-800">
              Tải lên bài giảng thành công!
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Gói bài giảng đã được hệ thống lưu vào kho e-Learning và sẵn sàng để gán vào khóa học cũng như thiết lập điểm dừng tương tác.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center space-x-3">
            <button
              onClick={() => uploadedPackageId && onSuccess(uploadedPackageId)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center space-x-2"
            >
              <span>Xem trong kho bài giảng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
