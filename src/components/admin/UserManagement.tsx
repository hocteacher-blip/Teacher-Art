import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { User, UserRole, UserStatus } from '../../types/lms';
import { 
  Users, Plus, Search, Edit3, Trash2, Lock, Unlock, 
  FileSpreadsheet, Upload, Download, ShieldCheck, 
  CheckCircle2, XCircle, AlertTriangle, Filter, ChevronLeft, 
  ChevronRight, ArrowUpDown, Calendar, Mail, UserCheck, X, Sparkles, GraduationCap
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { FormField, Input, Select } from '../common/Form';
import { EmptyState } from '../common/EmptyState';
import { formatDateVN } from '../../utils/formatters';

interface ExcelImportRow {
  stt: number;
  code: string;
  name: string;
  birthDate: string;
  className: string;
  username: string;
  isValid: boolean;
  errorReason?: string;
}

export const UserManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { db, createUser, updateUser, deleteUser, deleteAllUsers, toggleUserStatus, createUsersBatch, classes } = useLMS();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Add/Edit User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formCode, setFormCode] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formClassName, setFormClassName] = useState('Lớp 3A');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');
  const [formError, setFormError] = useState('');

  // Bulk Excel Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRows, setImportRows] = useState<ExcelImportRow[]>([]);
  const [importStatusMessage, setImportStatusMessage] = useState('');
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  // Filter users based on role permissions
  // If teacher, they manage students and view staff accounts
  const accessibleUsers = db.users.filter(u => {
    if (isAdmin || isTeacher) return true;
    return false;
  });

  const filteredUsers = accessibleUsers.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      u.code.toLowerCase().includes(q) ||
      (u.className && u.className.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesClass = classFilter === 'all' || u.className === classFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesClass;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormName('');
    const randomNum = Math.floor(100 + Math.random() * 900);
    const defaultCode = isTeacher ? `HS3A-${randomNum}` : `ND-${randomNum}`;
    setFormCode(defaultCode);
    setFormUsername(`user_${defaultCode.toLowerCase().replace('-', '_')}`);
    setFormEmail(`${defaultCode.toLowerCase().replace('-', '_')}@th-tieuhoc.edu.vn`);
    setFormRole(isTeacher ? 'student' : 'student'); // Teachers can only create students
    setFormPhone('');
    setFormBirthDate('2016-05-10');
    setFormClassName(classes[0]?.name || 'Lớp 3A');
    setFormStatus('active');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    // Teachers cannot edit admin or other teachers
    if (isTeacher && user.role !== 'student') {
      alert('Bạn chỉ có quyền quản lý danh sách học sinh thuộc phạm vi lớp học được giao.');
      return;
    }

    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username || user.email.split('@')[0]);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormCode(user.code);
    setFormPhone(user.phone || '');
    setFormBirthDate(user.birthDate || '');
    setFormClassName(user.className || 'Lớp 3A');
    setFormStatus(user.status || 'active');
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Add / Edit
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const targetCode = formCode.trim().toUpperCase();
    const targetUsername = formUsername.trim().toLowerCase();
    const targetEmail = formEmail.trim().toLowerCase();

    // Check duplicate code
    const duplicateCode = db.users.find(
      u => u.id !== editingUser?.id && u.code.toLowerCase() === targetCode.toLowerCase()
    );
    if (duplicateCode) {
      setFormError(`Mã người dùng "${targetCode}" đã được sử dụng bởi ${duplicateCode.name}.`);
      return;
    }

    // Check duplicate username
    const duplicateUsername = db.users.find(
      u => u.id !== editingUser?.id && u.username?.toLowerCase() === targetUsername
    );
    if (duplicateUsername) {
      setFormError(`Tên đăng nhập "${targetUsername}" đã tồn tại trên hệ thống.`);
      return;
    }

    // Role security check: prevent teacher from setting role to admin
    let finalRole: UserRole = formRole;
    if (isTeacher) {
      finalRole = 'student'; // strictly enforced
    }

    const cls = classes.find(c => c.name === formClassName);

    const payload: Partial<User> = {
      name: formName.trim(),
      username: targetUsername,
      email: targetEmail,
      code: targetCode,
      role: finalRole,
      status: formStatus,
      phone: formPhone.trim() || undefined,
      birthDate: formBirthDate || undefined,
      className: finalRole === 'student' ? formClassName : undefined,
      classId: finalRole === 'student' ? cls?.id : undefined,
    };

    if (editingUser) {
      updateUser(editingUser.id, payload);
    } else {
      createUser(payload);
    }

    setIsModalOpen(false);
  };

  // Toggle Lock/Unlock
  const handleToggleLock = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Bạn không thể tự khóa tài khoản đang đăng nhập của chính mình.');
      return;
    }
    if (isTeacher && user.role !== 'student') {
      alert('Bạn chỉ có quyền thao tác trên tài khoản học sinh.');
      return;
    }

    const action = user.status === 'locked' ? 'mở khóa' : 'khóa';
    if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản của ${user.name} (${user.code})?`)) {
      toggleUserStatus(user.id);
    }
  };

  // Delete User with strict validation
  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Bạn không thể tự xóa tài khoản của chính mình.');
      return;
    }
    if (isTeacher && user.role !== 'student') {
      alert('Bạn không có quyền xóa tài khoản Giáo viên hoặc Quản trị viên.');
      return;
    }

    if (confirm(`Xác nhận xóa tài khoản "${user.name}" (${user.code}) khỏi hệ thống? Thao tác này không thể hoàn tác.`)) {
      deleteUser(user.id);
    }
  };

  // Export Users to Excel (CSV with UTF-8 BOM)
  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Mã người dùng',
      'Họ và tên',
      'Tên đăng nhập',
      'Email',
      'Vai trò',
      'Lớp học',
      'Ngày sinh',
      'Trạng thái',
      'Ngày tạo tài khoản',
    ];

    const rows = filteredUsers.map((u, idx) => {
      const roleVN = u.role === 'admin' ? 'Quản trị viên' : u.role === 'teacher' ? 'Giáo viên' : 'Học sinh';
      const statusVN = u.status === 'locked' ? 'Đã khóa' : 'Đang hoạt động';
      return [
        idx + 1,
        `"${u.code}"`,
        `"${u.name.replace(/"/g, '""')}"`,
        `"${u.username || ''}"`,
        `"${u.email}"`,
        `"${roleVN}"`,
        `"${u.className || '—'}"`,
        `"${u.birthDate ? formatDateVN(u.birthDate) : '—'}"`,
        `"${statusVN}"`,
        `"${formatDateVN(u.createdAt)}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Nguoi_Dung_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Standard Excel Import Template
  const handleDownloadTemplate = () => {
    const templateHeaders = ['STT', 'Mã học sinh', 'Họ và tên', 'Ngày sinh', 'Lớp', 'Tên đăng nhập'];
    const sampleRows = [
      ['1', 'HS3A-15', 'Nguyễn Minh Quân', '2016-03-12', 'Lớp 3A', 'minhquan.3a'],
      ['2', 'HS3A-16', 'Trần Thu Trang', '2016-07-24', 'Lớp 3A', 'thutrang.3a'],
      ['3', 'HS3A-17', 'Phạm Đức Anh', '2016-11-09', 'Lớp 3A', 'ducanh.3a'],
    ];

    const content = '\uFEFF' + [templateHeaders.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mau_Nhap_Hoc_Sinh_Tieu_Hoc.csv`;
    link.click();
  };

  // Parse CSV File for Bulk Student Import with Duplicate Verification
  const processImportText = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      alert('Tệp không có dữ liệu học sinh.');
      return;
    }

    // Skip header line
    const dataLines = lines.slice(1);
    const existingCodes = new Set(db.users.map(u => u.code.toLowerCase()));
    const existingUsernames = new Set(db.users.map(u => (u.username || '').toLowerCase()));
    const batchCodes = new Set<string>();
    const batchUsernames = new Set<string>();

    const rows: ExcelImportRow[] = [];

    dataLines.forEach((line, index) => {
      // Split by comma
      const parts = line.split(',').map(s => s.replace(/^"|"$/g, '').trim());
      if (parts.length < 3) return;

      const stt = parseInt(parts[0]) || index + 1;
      const code = parts[1] || '';
      const name = parts[2] || '';
      const birthDate = parts[3] || '2016-01-01';
      const className = parts[4] || 'Lớp 3A';
      const username = parts[5] || (name ? name.toLowerCase().replace(/\s+/g, '') + '.' + code.toLowerCase() : '');

      let isValid = true;
      let errorReason = '';

      if (!name) {
        isValid = false;
        errorReason = 'Thiếu họ và tên học sinh';
      } else if (!code) {
        isValid = false;
        errorReason = 'Thiếu mã học sinh';
      } else if (existingCodes.has(code.toLowerCase())) {
        isValid = false;
        errorReason = `Mã "${code}" đã tồn tại trong hệ thống`;
      } else if (batchCodes.has(code.toLowerCase())) {
        isValid = false;
        errorReason = `Mã "${code}" bị trùng lặp trong tệp Excel`;
      } else if (username && existingUsernames.has(username.toLowerCase())) {
        isValid = false;
        errorReason = `Tên đăng nhập "${username}" đã có người dùng`;
      } else if (username && batchUsernames.has(username.toLowerCase())) {
        isValid = false;
        errorReason = `Tên đăng nhập "${username}" bị trùng lặp trong tệp`;
      }

      if (isValid) {
        batchCodes.add(code.toLowerCase());
        if (username) batchUsernames.add(username.toLowerCase());
      }

      rows.push({
        stt,
        code,
        name,
        birthDate,
        className,
        username,
        isValid,
        errorReason,
      });
    });

    setImportRows(rows);
    setIsImportModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) processImportText(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Demo 5 students pre-check
  const handleLoadSample5Students = () => {
    const sampleCsv = `STT,Mã học sinh,Họ và tên,Ngày sinh,Lớp,Tên đăng nhập
1,HS3A-20,Vũ Gia Huy,2016-02-14,Lớp 3A,giahuy.3a
2,HS3A-21,Đặng Ngọc Mai,2016-05-19,Lớp 3A,ngocmai.3a
3,HS3A-22,Hoàng Minh Khôi,2016-09-30,Lớp 3A,minhkhoi.3a
4,HS3A-01,Nguyễn An Nhiên (Trùng mã),2016-04-12,Lớp 3A,annhien.3a
5,HS3A-23,Lý Phương Linh,2016-12-01,Lớp 3A,phuonglinh.3a`;
    processImportText(sampleCsv);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    const validRows = importRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Không có bản ghi hợp lệ nào để nhập.');
      return;
    }

    setIsProcessingImport(true);
    const usersToCreate: Partial<User>[] = validRows.map(r => ({
      code: r.code,
      name: r.name,
      username: r.username,
      email: `${r.username}@th-tieuhoc.edu.vn`,
      role: 'student',
      status: 'active',
      className: r.className,
      birthDate: r.birthDate,
    }));

    const result = createUsersBatch(usersToCreate);
    setIsProcessingImport(false);
    setIsImportModalOpen(false);

    alert(`🎉 Đã nhập thành công ${result.added} học sinh mới vào hệ thống!`);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Quản trị viên</span>;
      case 'teacher':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Giáo viên</span>;
      case 'student':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Học sinh</span>;
    }
  };

  const getStatusBadge = (status?: UserStatus) => {
    if (status === 'locked') {
      return (
        <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
          <Lock className="w-3 h-3 text-rose-500" />
          <span>Đã khóa</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Hoạt động</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {isAdmin ? 'Quản trị nhân sự & Tài khoản' : 'Quản lý học sinh phân công'}
            </span>
            <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-600">
              {filteredUsers.length} tài khoản
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">
            {isAdmin ? 'Quản lý người dùng & Phân quyền' : 'Danh sách học sinh các lớp học'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {isAdmin 
              ? 'Toàn quyền quản lý tài khoản quản trị viên, giáo viên và học sinh, kiểm soát trạng thái hoạt động, khóa/mở khóa và xuất nhập dữ liệu.'
              : 'Thầy/Cô quản lý danh sách học sinh thuộc các lớp phụ trách, tạo tài khoản mới hoặc nhập danh sách học sinh hàng loạt từ Excel.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Xuất danh sách ra Excel CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Nhập danh sách học sinh từ file Excel CSV"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Nhập từ Excel</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isTeacher ? 'Thêm học sinh mới' : 'Thêm tài khoản mới'}</span>
          </button>

          {db.users.length > 0 && (
            <button
              onClick={() => {
                if (confirm('XÁC NHẬN: Bạn có chắc chắn muốn XÓA TẤT CẢ các tài khoản trên hệ thống? Thao tác này sẽ xóa sạch danh sách người dùng và đưa hệ thống về trạng thái chưa có tài khoản.')) {
                  deleteAllUsers();
                  window.location.reload();
                }
              }}
              className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Xóa tất cả các tài khoản trên hệ thống"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Xóa tất cả tài khoản</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên, mã, email, tên đăng nhập..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter (only if Admin) */}
          {isAdmin && (
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-500">Vai trò:</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="teacher">Giáo viên</option>
                <option value="student">Học sinh</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Đã khóa</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-500">Lớp:</span>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users DataTable */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã người dùng</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Tên đăng nhập</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Lớp học</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <EmptyState
                      title="Không tìm thấy người dùng nào"
                      description="Không có tài khoản nào phù hợp với điều kiện tìm kiếm và bộ lọc hiện tại."
                      actionLabel={isTeacher ? "+ Thêm học sinh" : "+ Thêm tài khoản"}
                      onAction={handleOpenCreate}
                    />
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const canEdit = isAdmin || (isTeacher && user.role === 'student');

                  return (
                    <tr key={user.id} className={`hover:bg-slate-50/70 transition-colors ${user.status === 'locked' ? 'bg-slate-50/40 opacity-75' : ''}`}>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {user.code}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-800">{user.name}</span>
                            {user.birthDate && (
                              <span className="text-[10px] text-slate-400 block">
                                Sinh: {formatDateVN(user.birthDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">
                        {user.username || user.email.split('@')[0]}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {user.email}
                      </td>

                      <td className="py-3.5 px-4">
                        {getRoleBadge(user.role)}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {user.role === 'student' ? (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                            {user.className || 'Chưa xếp lớp'}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Ban giáo viên</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(user.status)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDateVN(user.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Edit button */}
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Lock / Unlock button */}
                          {canEdit && !isSelf && (
                            <button
                              onClick={() => handleToggleLock(user)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.status === 'locked'
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                              title={user.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            >
                              {user.status === 'locked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Delete button */}
                          {canEdit && !isSelf && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa tài khoản theo quy định"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
            <span>
              Hiển thị <b>{(currentPage - 1) * pageSize + 1}</b> - <b>{Math.min(currentPage * pageSize, filteredUsers.length)}</b> trong số <b>{filteredUsers.length}</b> tài khoản
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-700 px-2">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Chỉnh sửa thông tin: ${editingUser.name}` : (isTeacher ? 'Tạo tài khoản học sinh mới' : 'Thêm người dùng mới')}
        subtitle="Hệ thống tự động kiểm tra tính hợp lệ và chống trùng lặp"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Mã người dùng (Mã HS / GV)" required>
              <Input
                type="text"
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="HS3A-01, GV-HOC01..."
                className="font-mono uppercase font-bold"
              />
            </FormField>

            <FormField label="Họ và tên đầy đủ" required>
              <Input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Nguyễn An Nhiên"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Tên đăng nhập (Username)" required>
              <Input
                type="text"
                required
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="annhien.3a"
                className="font-mono"
              />
            </FormField>

            <FormField label="Email liên kết" required>
              <Input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value.toLowerCase())}
                placeholder="annhien@th-tieuhoc.edu.vn"
                className="font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Vai trò người dùng" required>
              {isAdmin ? (
                <Select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                >
                  <option value="student">Học sinh</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="admin">Quản trị viên</option>
                </Select>
              ) : (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                  Học sinh (Giáo viên chỉ được tạo tài khoản học sinh)
                </div>
              )}
            </FormField>

            <FormField label="Trạng thái tài khoản">
              <Select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as UserStatus)}
              >
                <option value="active">Đang hoạt động</option>
                <option value="locked">Khóa tài khoản</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formRole === 'student' && (
              <FormField label="Lớp học phụ trách">
                <Select
                  value={formClassName}
                  onChange={(e) => setFormClassName(e.target.value)}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name} (Khối {c.grade})</option>
                  ))}
                </Select>
              </FormField>
            )}

            <FormField label="Ngày sinh">
              <Input
                type="date"
                value={formBirthDate}
                onChange={(e) => setFormBirthDate(e.target.value)}
              />
            </FormField>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20"
            >
              {editingUser ? 'Lưu cập nhật' : 'Xác nhận tạo tài khoản'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Excel Import Modal with Duplicate Checking */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Nhập danh sách học sinh hàng loạt từ Excel"
        subtitle="Hệ thống tự động phát hiện và cảnh báo các bản ghi bị trùng lặp"
        maxWidth="3xl"
      >
        <div className="space-y-4">
          {/* Quick Helper Tools */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-emerald-900">Quy định tệp Excel (CSV):</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Cột chuẩn: <b>STT, Mã học sinh, Họ và tên, Ngày sinh, Lớp, Tên đăng nhập</b>
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold text-xs rounded-lg flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp mẫu</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSample5Students}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thử nghiệm 5 học sinh mẫu</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-500">
              Tổng số dòng: <b>{importRows.length}</b>
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hợp lệ: {importRows.filter(r => r.isValid).length}
              </span>
              <span className="text-rose-700 font-bold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Lỗi / Trùng lặp: {importRows.filter(r => !r.isValid).length}
              </span>
            </div>
          </div>

          {/* Preview Table */}
          <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Lớp</th>
                  <th className="py-2.5 px-3">Tên đăng nhập</th>
                  <th className="py-2.5 px-3">Trạng thái kiểm tra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {importRows.map((r, i) => (
                  <tr key={i} className={r.isValid ? 'bg-white' : 'bg-rose-50/50'}>
                    <td className="py-2.5 px-3 font-mono">{r.stt}</td>
                    <td className="py-2.5 px-3 font-mono font-bold">{r.code}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{r.name}</td>
                    <td className="py-2.5 px-3">{r.className}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{r.username}</td>
                    <td className="py-2.5 px-3">
                      {r.isValid ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Hợp lệ
                        </span>
                      ) : (
                        <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px]" title={r.errorReason}>
                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{r.errorReason}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * Chỉ các dòng hợp lệ (màu xanh) mới được ghi vào cơ sở dữ liệu.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isProcessingImport || importRows.filter(r => r.isValid).length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-600/20"
              >
                {isProcessingImport ? 'Đang nhập...' : `Xác nhận nhập ${importRows.filter(r => r.isValid).length} học sinh`}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
