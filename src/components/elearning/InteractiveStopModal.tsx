import React, { useState } from 'react';
import { LessonStop, StudentStopAnswer } from '../../types/lms';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import confetti from 'canvas-confetti';
import { 
  HelpCircle, CheckCircle, XCircle, Award, 
  ArrowRight, RotateCcw, AlertTriangle, BookOpen, Clock 
} from 'lucide-react';

interface InteractiveStopModalProps {
  stop: LessonStop;
  courseId: string;
  lessonId: string;
  onContinue: () => void;
  previousAnswer?: StudentStopAnswer;
}

export const InteractiveStopModal: React.FC<InteractiveStopModalProps> = ({
  stop,
  courseId,
  lessonId,
  onContinue,
  previousAnswer,
}) => {
  const { currentUser } = useAuth();
  const { recordStopAnswer } = useLMS();

  const [selectedOptions, setSelectedOptions] = useState<string[]>(previousAnswer?.selectedOptionIds || []);
  const [textInput, setTextInput] = useState<string>(previousAnswer?.textAnswer || '');
  const [attempts, setAttempts] = useState<number>(previousAnswer?.attemptsCount || 0);
  const [evaluated, setEvaluated] = useState<boolean>(Boolean(previousAnswer));
  const [isCorrect, setIsCorrect] = useState<boolean>(previousAnswer?.isCorrect || false);
  const [feedback, setFeedback] = useState<string>(
    previousAnswer ? (previousAnswer.isCorrect ? stop.explanationCorrect : stop.explanationIncorrect) : ''
  );

  const studentId = currentUser?.id || 'USR_GV_HOC';
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  const handleSelectOption = (optId: string) => {
    if (evaluated && isCorrect) return;

    if (stop.stopType === 'quiz_multi') {
      if (selectedOptions.includes(optId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optId));
      } else {
        setSelectedOptions([...selectedOptions, optId]);
      }
    } else {
      setSelectedOptions([optId]);
    }
  };

  const handleCheckAnswer = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    let correct = false;

    if (stop.stopType === 'quiz_single' || stop.stopType === 'quiz_boolean') {
      const correctOpt = stop.options.find(o => o.isCorrect);
      correct = selectedOptions.length === 1 && selectedOptions[0] === correctOpt?.id;
    } else if (stop.stopType === 'quiz_multi') {
      const correctIds = stop.options.filter(o => o.isCorrect).map(o => o.id).sort();
      const chosenIds = [...selectedOptions].sort();
      correct = JSON.stringify(correctIds) === JSON.stringify(chosenIds);
    } else if (stop.stopType === 'fill_blank' || stop.stopType === 'short_answer') {
      const target = (stop.correctTextAnswer || '').trim().toLowerCase();
      const entered = textInput.trim().toLowerCase();
      correct = entered === target || target.includes(entered) && entered.length > 2;
    } else if (stop.stopType === 'read_content' || stop.stopType === 'interactive_card' || stop.stopType === 'video_watch') {
      correct = true;
    } else if (stop.stopType === 'teacher_confirm') {
      correct = true;
    } else {
      correct = true;
    }

    setIsCorrect(correct);
    setEvaluated(true);
    setFeedback(correct ? stop.explanationCorrect : stop.explanationIncorrect);

    if (correct) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }

    // Save answer into LMS
    const answerData: StudentStopAnswer = {
      stopId: stop.id,
      studentId,
      attemptsCount: nextAttempts,
      selectedOptionIds: selectedOptions,
      textAnswer: textInput,
      isCorrect: correct,
      scoreEarned: correct ? stop.points : 0,
      answeredAt: new Date().toISOString(),
    };
    recordStopAnswer(answerData, courseId, lessonId);
  };

  const handleRetry = () => {
    setEvaluated(false);
    setSelectedOptions([]);
    setTextInput('');
  };

  // Determine if student is allowed to continue
  const canContinue = 
    isTeacherOrAdmin || // Teacher preview can always test
    (stop.continuationPolicy === 'optional') ||
    (stop.continuationPolicy === 'allow_skip') ||
    (evaluated && isCorrect) ||
    (evaluated && stop.continuationPolicy === 'require_attempt') ||
    (evaluated && stop.maxAttempts > 0 && attempts >= stop.maxAttempts);

  const getStopTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz_single': return 'Trắc nghiệm một lựa chọn';
      case 'quiz_boolean': return 'Câu hỏi Đúng / Sai';
      case 'quiz_multi': return 'Câu hỏi chọn nhiều đáp án';
      case 'fill_blank': return 'Điền từ vào chỗ trống';
      case 'short_answer': return 'Trả lời câu hỏi ngắn';
      case 'read_content': return 'Nội dung ghi nhớ trọng tâm';
      case 'interactive_card': return 'Thẻ kiến thức tương tác';
      case 'video_watch': return 'Quan sát video bổ trợ';
      case 'checkpoint': return 'Điểm dừng kiểm tra kiến thức';
      case 'teacher_confirm': return 'Yêu cầu giáo viên xác nhận';
      default: return 'Điểm dừng tương tác';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-4 border-emerald-400 animate-in zoom-in-95 duration-200">
        
        {/* Header with badge & points */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  {getStopTypeLabel(stop.stopType)}
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Mốc thời gian: {Math.floor(stop.timestampSeconds / 60)}:{(stop.timestampSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-800">
                {stop.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">+{stop.points} điểm</span>
          </div>
        </div>

        {/* Question body */}
        <div className="py-6">
          <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed mb-4">
            {stop.questionText}
          </div>

          {stop.questionImage && (
            <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 max-h-56">
              <img src={stop.questionImage} alt="Hình minh họa" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Interactive Question Types */}
          {(stop.stopType === 'quiz_single' || stop.stopType === 'quiz_boolean' || stop.stopType === 'quiz_multi') && (
            <div className="space-y-2.5">
              {stop.options.map((opt, idx) => {
                const isSelected = selectedOptions.includes(opt.id);
                let optBorder = 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40';
                let optBg = 'bg-white';

                if (evaluated) {
                  if (opt.isCorrect) {
                    optBorder = 'border-emerald-500 ring-2 ring-emerald-500/30';
                    optBg = 'bg-emerald-50';
                  } else if (isSelected && !opt.isCorrect) {
                    optBorder = 'border-rose-400 ring-2 ring-rose-400/30';
                    optBg = 'bg-rose-50';
                  }
                } else if (isSelected) {
                  optBorder = 'border-emerald-600 ring-2 ring-emerald-500/20';
                  optBg = 'bg-emerald-50/60';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-center p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${optBorder} ${optBg}`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs mr-3.5 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm sm:text-base font-medium text-slate-800 flex-1">
                      {opt.text}
                    </span>
                    {evaluated && opt.isCorrect && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 ml-2" />
                    )}
                    {evaluated && isSelected && !opt.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {(stop.stopType === 'fill_blank' || stop.stopType === 'short_answer') && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 uppercase">
                Nhập câu trả lời của em:
              </label>
              <input
                type="text"
                disabled={evaluated && isCorrect}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Gõ từ hoặc số vào đây..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none text-base font-semibold"
              />
              {evaluated && !isCorrect && stop.correctTextAnswer && (
                <p className="text-xs text-slate-500">
                  Đáp án chuẩn của thầy cô: <span className="font-bold text-emerald-700">{stop.correctTextAnswer}</span>
                </p>
              )}
            </div>
          )}

          {(stop.stopType === 'read_content' || stop.stopType === 'interactive_card') && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-slate-700 leading-relaxed text-sm flex items-start space-x-3">
              <BookOpen className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 mb-1">Ghi nhớ trọng tâm bài học:</p>
                <p className="text-amber-950 font-medium">{stop.questionText}</p>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {evaluated && (
            <div className={`mt-5 p-4 rounded-2xl border-2 transition-all ${
              isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
            }`}>
              <div className="flex items-start space-x-3">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-bold text-sm ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {isCorrect ? '🎉 Tuyệt vời! Em đã trả lời đúng!' : '⚠️ Chưa chính xác rồi!'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                    {feedback}
                  </p>
                  {!isCorrect && (
                    <p className="text-[11px] font-semibold text-slate-500 mt-2">
                      Số lần đã thử: {attempts} / {stop.maxAttempts || 'Không giới hạn'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              Điều kiện: {
                stop.continuationPolicy === 'require_correct' ? 'Bắt buộc trả lời đúng' :
                stop.continuationPolicy === 'require_attempt' ? 'Yêu cầu trả lời' : 'Cho phép bỏ qua'
              }
            </span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            {evaluated && !isCorrect && (stop.maxAttempts === 0 || attempts < stop.maxAttempts) && (
              <button
                onClick={handleRetry}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại</span>
              </button>
            )}

            {!evaluated ? (
              <button
                onClick={handleCheckAnswer}
                disabled={
                  (stop.stopType === 'quiz_single' || stop.stopType === 'quiz_boolean' || stop.stopType === 'quiz_multi') &&
                  selectedOptions.length === 0 ||
                  (stop.stopType === 'fill_blank' || stop.stopType === 'short_answer') &&
                  !textInput.trim()
                }
                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Kiểm tra kết quả
              </button>
            ) : (
              <button
                onClick={onContinue}
                disabled={!canContinue}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Tiếp tục bài học</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
