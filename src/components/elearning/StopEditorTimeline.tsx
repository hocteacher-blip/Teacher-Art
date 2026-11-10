import React, { useState } from 'react';
import { Lesson, LessonStop, StopType, StopContinuationPolicy, StopOption } from '../../types/lms';
import { useLMS } from '../../context/LMSContext';
import { 
  Plus, Edit3, Trash2, Clock, CheckCircle2, 
  PlayCircle, AlertCircle, ChevronRight, X, ArrowLeft, 
  HelpCircle, Sparkles, BookOpen, Layers
} from 'lucide-react';

interface StopEditorTimelineProps {
  lesson: Lesson;
  onBack: () => void;
  onTestPlayer: () => void;
}

export const StopEditorTimeline: React.FC<StopEditorTimelineProps> = ({
  lesson,
  onBack,
  onTestPlayer,
}) => {
  const { getStopsForLesson, createStop, updateStop, deleteStop } = useLMS();
  const stops = getStopsForLesson(lesson.id);

  const [editingStop, setEditingStop] = useState<Partial<LessonStop> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for modal
  const [stopTitle, setStopTitle] = useState('');
  const [stopType, setStopType] = useState<StopType>('quiz_single');
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(30);
  const [questionText, setQuestionText] = useState('');
  const [questionImage, setQuestionImage] = useState('');
  const [points, setPoints] = useState(10);
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(60);
  const [continuationPolicy, setContinuationPolicy] = useState<StopContinuationPolicy>('require_correct');
  const [explanationCorrect, setExplanationCorrect] = useState('Chúc mừng em đã trả lời đúng!');
  const [explanationIncorrect, setExplanationIncorrect] = useState('Chưa chính xác, em hãy xem lại bài giảng nhé.');
  const [correctTextAnswer, setCorrectTextAnswer] = useState('');
  const [options, setOptions] = useState<StopOption[]>([
    { id: 'opt_1', text: 'Đáp án A', isCorrect: true, explanation: 'Chính xác' },
    { id: 'opt_2', text: 'Đáp án B', isCorrect: false },
    { id: 'opt_3', text: 'Đáp án C', isCorrect: false },
    { id: 'opt_4', text: 'Đáp án D', isCorrect: false },
  ]);

  const handleOpenCreate = (timestampSec: number = 60) => {
    setEditingStop(null);
    setStopTitle(`Điểm dừng ${stops.length + 1}: Kiểm tra kiến thức`);
    setStopType('quiz_single');
    setMinutes(Math.floor(timestampSec / 60));
    setSeconds(timestampSec % 60);
    setQuestionText('Em hãy chọn câu trả lời chính xác nhất:');
    setQuestionImage('');
    setPoints(10);
    setMaxAttempts(2);
    setTimeLimitSeconds(60);
    setContinuationPolicy('require_correct');
    setExplanationCorrect('Rất xuất sắc! Em đã nắm vững kiến thức phần này.');
    setExplanationIncorrect('Chưa đúng rồi, em hãy thử lại hoặc xem lại đoạn vừa rồi nhé.');
    setCorrectTextAnswer('');
    setOptions([
      { id: 'opt_1', text: 'Đáp án A (Đúng)', isCorrect: true },
      { id: 'opt_2', text: 'Đáp án B', isCorrect: false },
      { id: 'opt_3', text: 'Đáp án C', isCorrect: false },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stop: LessonStop) => {
    setEditingStop(stop);
    setStopTitle(stop.title);
    setStopType(stop.stopType);
    setMinutes(Math.floor(stop.timestampSeconds / 60));
    setSeconds(stop.timestampSeconds % 60);
    setQuestionText(stop.questionText);
    setQuestionImage(stop.questionImage || '');
    setPoints(stop.points);
    setMaxAttempts(stop.maxAttempts);
    setTimeLimitSeconds(stop.timeLimitSeconds || 60);
    setContinuationPolicy(stop.continuationPolicy);
    setExplanationCorrect(stop.explanationCorrect);
    setExplanationIncorrect(stop.explanationIncorrect);
    setCorrectTextAnswer(stop.correctTextAnswer || '');
    setOptions(stop.options && stop.options.length > 0 ? stop.options : [
      { id: 'opt_1', text: 'Đáp án A', isCorrect: true },
      { id: 'opt_2', text: 'Đáp án B', isCorrect: false },
    ]);
    setIsModalOpen(true);
  };

  const handleSaveStop = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = minutes * 60 + seconds;

    const stopPayload: Partial<LessonStop> = {
      lessonId: lesson.id,
      title: stopTitle,
      stopType,
      timestampSeconds: timestamp,
      questionText,
      questionImage: questionImage.trim() || undefined,
      points,
      maxAttempts,
      timeLimitSeconds,
      continuationPolicy,
      explanationCorrect,
      explanationIncorrect,
      correctTextAnswer: correctTextAnswer.trim() || undefined,
      options,
    };

    if (editingStop && editingStop.id) {
      updateStop(editingStop.id, stopPayload);
    } else {
      createStop(stopPayload);
    }

    setIsModalOpen(false);
  };

  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        id: 'opt_' + Date.now(),
        text: `Lựa chọn ${options.length + 1}`,
        isCorrect: false,
      },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      alert('Cần ít nhất 2 phương án lựa chọn');
      return;
    }
    setOptions(options.filter(o => o.id !== id));
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

  const handleToggleCorrect = (id: string) => {
    if (stopType === 'quiz_multi') {
      setOptions(options.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o));
    } else {
      setOptions(options.map(o => ({ ...o, isCorrect: o.id === id })));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStopTypeBadge = (type: StopType) => {
    const config: Record<StopType, { label: string; color: string }> = {
      quiz_single: { label: '1. Trắc nghiệm 1 đáp án', color: 'bg-emerald-100 text-emerald-800' },
      quiz_boolean: { label: '2. Đúng / Sai', color: 'bg-blue-100 text-blue-800' },
      quiz_multi: { label: '3. Nhiều lựa chọn', color: 'bg-purple-100 text-purple-800' },
      fill_blank: { label: '4. Điền từ khuyết', color: 'bg-amber-100 text-amber-800' },
      short_answer: { label: '5. Trả lời ngắn', color: 'bg-orange-100 text-orange-800' },
      video_watch: { label: '6. Xem video bổ trợ', color: 'bg-rose-100 text-rose-800' },
      read_content: { label: '7. Đọc ghi nhớ', color: 'bg-indigo-100 text-indigo-800' },
      interactive_card: { label: '8. Bài tập tương tác', color: 'bg-teal-100 text-teal-800' },
      checkpoint: { label: '9. Kiểm tra kiến thức', color: 'bg-cyan-100 text-cyan-800' },
      teacher_confirm: { label: '10. GV xác nhận', color: 'bg-fuchsia-100 text-fuchsia-800' },
    };
    return config[type] || { label: type, color: 'bg-slate-100 text-slate-700' };
  };

  const getPolicyLabel = (policy: StopContinuationPolicy) => {
    switch (policy) {
      case 'require_correct': return 'A. Bắt buộc đúng mới được tiếp tục';
      case 'require_attempt': return 'B. Bắt buộc trả lời (không cần đúng)';
      case 'allow_skip': return 'C. Cho phép bỏ qua';
      case 'optional': return 'D. Chỉ tương tác tham khảo';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Trình chỉnh sửa dòng thời gian (Timeline Stops)
              </span>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-slate-600">
                {stops.length} điểm dừng
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-xl text-slate-800">
              {lesson.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onTestPlayer}
            className="px-4 py-2.5 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Thử nghiệm trong Trình phát</span>
          </button>
          <button
            onClick={() => handleOpenCreate(Math.round((stops.length + 1) * 45))}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm điểm dừng mới</span>
          </button>
        </div>
      </div>

      {/* Visual Timeline Bar Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-heading font-bold text-base text-slate-800 mb-4 flex items-center justify-between">
          <span>Dòng thời gian tương tác bài học</span>
          <span className="text-xs text-slate-400 font-normal">Thời lượng: ~{Math.round((lesson.durationSeconds || 300) / 60)} phút</span>
        </h3>

        {/* Visual Track */}
        <div className="relative py-8 px-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="h-3 bg-slate-200 rounded-full relative">
            {/* Markers on track */}
            {stops.map((stop) => {
              const maxDur = lesson.durationSeconds || 300;
              const percent = Math.min(96, Math.max(4, (stop.timestampSeconds / maxDur) * 100));
              return (
                <div
                  key={stop.id}
                  style={{ left: `${percent}%` }}
                  onClick={() => handleOpenEdit(stop)}
                  title={`${stop.title} - ${formatTime(stop.timestampSeconds)}`}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-pointer z-20"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold group-hover:scale-125 transition-transform">
                    {formatTime(stop.timestampSeconds).split(':')[0]}
                  </div>
                  <div className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-xl z-30">
                    {formatTime(stop.timestampSeconds)}: {stop.title}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mt-4 px-1">
            <span>00:00 (Bắt đầu)</span>
            <span>{formatTime(lesson.durationSeconds || 300)} (Kết thúc)</span>
          </div>
        </div>
      </div>

      {/* Timeline Steps Card List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-slate-800">
            Danh sách điểm dừng theo trình tự thời gian
          </h3>
          <span className="text-xs text-slate-500">
            Học sinh sẽ được hệ thống tự động tạm dừng tại các mốc này
          </span>
        </div>

        {stops.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
            <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800">Chưa có điểm dừng nào</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Hãy thêm các điểm dừng kiểm tra kiến thức để bài giảng e-learning trở nên hấp dẫn và hiệu quả.
            </p>
            <button
              onClick={() => handleOpenCreate(30)}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
            >
              + Tạo điểm dừng đầu tiên
            </button>
          </div>
        ) : (
          stops.map((stop, index) => {
            const badge = getStopTypeBadge(stop.stopType);
            return (
              <div
                key={stop.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  {/* Timestamp badge */}
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-emerald-600 mb-0.5" />
                    <span className="font-mono text-xs font-bold text-emerald-800">
                      {formatTime(stop.timestampSeconds)}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        +{stop.points} điểm
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {getPolicyLabel(stop.continuationPolicy)}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-800">{stop.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{stop.questionText}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEdit(stop)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs font-bold transition-colors"
                    title="Chỉnh sửa chi tiết"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xóa điểm dừng "${stop.title}"?`)) {
                        deleteStop(stop.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-colors"
                    title="Xóa điểm dừng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stop Config Modal (Supports all 10 stop types & rules) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-heading font-bold text-lg text-slate-800">
                {editingStop ? 'Chỉnh sửa điểm dừng tương tác' : 'Thiết lập điểm dừng mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStop} className="space-y-4 pt-4 max-h-[75vh] overflow-y-auto px-1">
              
              {/* Type and Timestamp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Loại điểm dừng (10 loại hỗ trợ)
                  </label>
                  <select
                    value={stopType}
                    onChange={(e) => setStopType(e.target.value as StopType)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="quiz_single">1. Trắc nghiệm 1 đáp án đúng</option>
                    <option value="quiz_boolean">2. Câu hỏi Đúng / Sai</option>
                    <option value="quiz_multi">3. Câu hỏi chọn nhiều đáp án đúng</option>
                    <option value="fill_blank">4. Điền từ vào chỗ trống</option>
                    <option value="short_answer">5. Trả lời câu hỏi ngắn</option>
                    <option value="video_watch">6. Xem video bổ trợ</option>
                    <option value="read_content">7. Đọc nội dung ghi nhớ</option>
                    <option value="interactive_card">8. Bài tập tương tác / Thẻ bài</option>
                    <option value="checkpoint">9. Kiểm tra kiến thức tổng hợp</option>
                    <option value="teacher_confirm">10. Yêu cầu giáo viên xác nhận</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mốc thời gian dừng (Phút : Giây)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={minutes}
                      onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                      className="w-full text-center text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300"
                      placeholder="Phút"
                    />
                    <span className="font-bold text-slate-400">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                      className="w-full text-center text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300"
                      placeholder="Giây"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề điểm dừng
                </label>
                <input
                  type="text"
                  required
                  value={stopTitle}
                  onChange={(e) => setStopTitle(e.target.value)}
                  placeholder="Ví dụ: Khởi động, Luyện tập, Vận dụng..."
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung câu hỏi hoặc yêu cầu
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Nhập nội dung hiển thị cho học sinh..."
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Options for Quiz types */}
              {(stopType === 'quiz_single' || stopType === 'quiz_boolean' || stopType === 'quiz_multi') && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Các phương án trả lời (Tick chọn đáp án ĐÚNG):
                    </label>
                    {stopType !== 'quiz_boolean' && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-xs text-emerald-600 font-bold hover:underline"
                      >
                        + Thêm phương án
                      </button>
                    )}
                  </div>

                  {options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCorrect(opt.id)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                          opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {opt.isCorrect ? '✓' : String.fromCharCode(65 + idx)}
                      </button>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                        placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}`}
                      />
                      {options.length > 2 && stopType !== 'quiz_boolean' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Target answer for Fill-in or Short-answer */}
              {(stopType === 'fill_blank' || stopType === 'short_answer') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đáp án đúng (chuẩn so sánh)
                  </label>
                  <input
                    type="text"
                    value={correctTextAnswer}
                    onChange={(e) => setCorrectTextAnswer(e.target.value)}
                    placeholder="Ví dụ: cơ sở, 1200, bàn phím..."
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              )}

              {/* Policy & Points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Điểm số
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số lần thử tối đa
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời gian (giây)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={timeLimitSeconds}
                    onChange={(e) => setTimeLimitSeconds(parseInt(e.target.value) || 60)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Continuation Policy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Điều kiện để học sinh được tiếp tục bài học (4 chế độ chuẩn)
                </label>
                <select
                  value={continuationPolicy}
                  onChange={(e) => setContinuationPolicy(e.target.value as StopContinuationPolicy)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="require_correct">A. Bắt buộc trả lời đúng mới được tiếp tục</option>
                  <option value="require_attempt">B. Bắt buộc trả lời nhưng không yêu cầu đúng</option>
                  <option value="allow_skip">C. Cho phép bỏ qua điểm dừng</option>
                  <option value="optional">D. Điểm dừng chỉ mang tính tương tác, không ảnh hưởng tiến độ</option>
                </select>
              </div>

              {/* Feedbacks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 mb-1">
                    Phản hồi khi làm ĐÚNG
                  </label>
                  <input
                    type="text"
                    value={explanationCorrect}
                    onChange={(e) => setExplanationCorrect(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-700 mb-1">
                    Phản hồi & gợi ý khi làm SAI
                  </label>
                  <input
                    type="text"
                    value={explanationIncorrect}
                    onChange={(e) => setExplanationIncorrect(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-rose-300 bg-rose-50/40"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  {editingStop ? 'Lưu thay đổi' : 'Tạo điểm dừng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
