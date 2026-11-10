import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import { LearningPackage, LectureType } from '../../types/lms';
import { PackageUploader } from './PackageUploader';
import { 
  FolderArchive, Upload, Play, Trash2, Search, 
  FileCode, Video, FileText, CheckCircle2, 
  Layers, ExternalLink, X, Plus 
} from 'lucide-react';

interface LectureRepositoryProps {
  onAttachToCourse?: (packageId: string) => void;
}

export const LectureRepository: React.FC<LectureRepositoryProps> = ({ onAttachToCourse }) => {
  const { packages, deletePackage } = useLMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUploader, setShowUploader] = useState(false);
  const [previewPackage, setPreviewPackage] = useState<LearningPackage | null>(null);

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pkg.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || pkg.type === filterType;
    return matchesSearch && matchesType;
  });

  const getPackageTypeBadge = (type: LectureType) => {
    switch (type) {
      case 'scorm12':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">SCORM 1.2</span>;
      case 'scorm2004':
        return <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">SCORM 2004</span>;
      case 'html5':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">HTML5 Package</span>;
      case 'video':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Video MP4</span>;
      case 'pdf':
      case 'pptx':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Tài liệu</span>;
      default:
        return null;
    }
  };

  const getPackageIcon = (type: LectureType) => {
    switch (type) {
      case 'scorm12':
      case 'scorm2004':
      case 'html5':
        return <FileCode className="w-5 h-5 text-emerald-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Kho học liệu số nhà trường
            </span>
            <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-600">
              {packages.length} gói bài giảng
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">
            Kho bài giảng e-Learning
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý và lưu trữ các gói bài giảng chuẩn SCORM 1.2, SCORM 2004, HTML5 ZIP, Video MP4 và tài liệu số.
          </p>
        </div>

        <button
          onClick={() => setShowUploader(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer self-start md:self-center"
        >
          <Upload className="w-4 h-4" />
          <span>Tải bài giảng mới lên</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài giảng hoặc tên tệp..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              filterType === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({packages.length})
          </button>
          <button
            onClick={() => setFilterType('scorm12')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              filterType === 'scorm12' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            SCORM 1.2
          </button>
          <button
            onClick={() => setFilterType('html5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              filterType === 'html5' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            HTML5 ZIP
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              filterType === 'video' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Video MP4
          </button>
        </div>
      </div>

      {/* Package List Grid */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800">Không tìm thấy bài giảng nào</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Không có gói bài giảng phù hợp với bộ lọc hiện tại. Hãy thử tìm kiếm từ khóa khác hoặc tải lên bài giảng mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {getPackageIcon(pkg.type)}
                  </div>
                  <div>
                    {getPackageTypeBadge(pkg.type)}
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {pkg.name}
                </h4>

                <div className="space-y-1.5 mt-3 text-xs text-slate-500 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tệp:</span>
                    <span className="truncate max-w-[170px]" title={pkg.fileName}>{pkg.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dung lượng:</span>
                    <span>{(pkg.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Người tải lên:</span>
                    <span className="text-slate-700 font-sans font-medium">{pkg.uploaderName}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setPreviewPackage(pkg)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Xem thử</span>
                </button>

                <div className="flex items-center space-x-2">
                  {onAttachToCourse && (
                    <button
                      onClick={() => onAttachToCourse(pkg.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Gán vào bài
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Xóa bài giảng "${pkg.name}" khỏi kho học liệu?`)) {
                        deletePackage(pkg.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Xóa bài giảng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <PackageUploader
            onSuccess={() => setShowUploader(false)}
            onCancel={() => setShowUploader(false)}
          />
        </div>
      )}

      {/* Preview Runner Modal */}
      {previewPackage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border border-slate-700 shadow-2xl">
            {/* Modal top */}
            <div className="px-5 py-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <div>
                  <h4 className="font-bold text-sm text-white">{previewPackage.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Định dạng: {previewPackage.type.toUpperCase()} • Tệp: {previewPackage.fileName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewPackage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-black relative flex items-center justify-center">
              {previewPackage.type === 'video' ? (
                <video
                  controls
                  autoPlay
                  src={previewPackage.packageBlobUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  title="Package Preview"
                  srcDoc={
                    previewPackage.packageBlobUrl ||
                    `<!DOCTYPE html><html><body style="font-family:system-ui;margin:0;padding:32px;background:linear-gradient(135deg, #022c22 0%, #0f172a 100%);color:white;display:flex;align-items:center;justify-center;min-height:80vh;">
                    <div style="background:rgba(255,255,255,0.08);backdrop-filter:blur(8px);padding:32px;border-radius:24px;border:1px solid rgba(255,255,255,0.15);max-width:580px;margin:auto;text-align:center;">
                      <div style="font-size:42px;margin-bottom:12px;">💻</div>
                      <h2 style="margin:0 0 12px;color:#34d399;font-size:20px;">Trình xem trước gói e-Learning</h2>
                      <p style="color:#e2e8f0;font-size:14px;line-height:1.6;">${previewPackage.name}</p>
                      <div style="margin-top:20px;padding:12px;background:rgba(0,0,0,0.3);border-radius:12px;font-size:12px;color:#94a3b8;font-family:monospace;">
                        Entry point: ${previewPackage.entryPoint || 'index.html'}<br>
                        Trạng thái SCORM API: Sẵn sàng kết nối
                      </div>
                    </div>
                    </body></html>`
                  }
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
