import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson, LessonStop, StudentProgress } from '../../types/lms';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { ScormRuntimeBridge } from '../../services/scormRuntime';
import { InteractiveStopModal } from './InteractiveStopModal';
import confetti from 'canvas-confetti';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  ChevronLeft, ChevronRight, CheckCircle2, Award, Clock, 
  BookOpen, RotateCcw, AlertCircle, ArrowLeft, Sparkles, FileText, Lock
} from 'lucide-react';

interface LecturePlayerProps {
  course: Course;
  lesson: Lesson;
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export const LecturePlayer: React.FC<LecturePlayerProps> = ({
  course,
  lesson,
  onBack,
  onSelectLesson,
}) => {
  const { currentUser } = useAuth();
  const { 
    lessons, 
    modules, 
    getStopsForLesson, 
    getStudentProgress, 
    saveStudentProgress 
  } = useLMS();

  const stops = getStopsForLesson(lesson.id);
  const studentId = currentUser?.id || 'USR_GV_HOC';
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  // Video and runtime refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scormBridgeRef = useRef<ScormRuntimeBridge | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(lesson.durationSeconds || 300);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [completedLesson, setCompletedLesson] = useState<boolean>(false);

  // Stops state
  const [activeStop, setActiveStop] = useState<LessonStop | null>(null);
  const [completedStops, setCompletedStops] = useState<string[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, any>>({});
  const [showSyllabus, setShowSyllabus] = useState<boolean>(true);

  // Resume state from database
  useEffect(() => {
    const existingProgress = getStudentProgress(studentId, lesson.id);
    if (existingProgress) {
      setCompletedStops(existingProgress.completedStops || []);
      setAnswersMap(existingProgress.answers || {});
      if (existingProgress.status === 'completed') {
        setCompletedLesson(true);
      }
      if (existingProgress.currentPositionSeconds > 0) {
        setCurrentTime(existingProgress.currentPositionSeconds);
      }
    } else {
      // Initialize first record
      saveStudentProgress({
        studentId,
        lessonId: lesson.id,
        courseId: course.id,
        status: 'in_progress',
        currentPositionSeconds: 0,
        maxPositionSeconds: 0,
        completionPercentage: 5,
        score: 0,
        timeSpentSeconds: 0,
        completedStops: [],
        answers: {},
      });
    }
  }, [lesson.id, studentId]);

  // Set up SCORM bridge if this is a SCORM lesson
  useEffect(() => {
    if (lesson.type === 'scorm12' || lesson.type === 'scorm2004') {
      const bridge = new ScormRuntimeBridge(
        {
          'cmi.core.student_id': currentUser?.code || 'HS-001',
          'cmi.core.student_name': currentUser?.name || 'Học sinh',
          'cmi.core.lesson_status': 'incomplete',
        },
        {
          onCommit: (data) => {
            const status = data['cmi.core.lesson_status'] || data['cmi.completion_status'];
            const rawScore = parseFloat(data['cmi.core.score.raw'] || data['cmi.score.raw'] || '0');
            const isFinished = status === 'completed' || status === 'passed';
            
            if (isFinished) {
              setCompletedLesson(true);
              try { confetti({ particleCount: 60 }); } catch (e) {}
            }

            saveStudentProgress({
              studentId,
              lessonId: lesson.id,
              courseId: course.id,
              status: isFinished ? 'completed' : 'in_progress',
              score: !isNaN(rawScore) ? rawScore : 100,
              completionPercentage: isFinished ? 100 : 80,
              completedAt: isFinished ? new Date().toISOString() : undefined,
            });
          },
        }
      );
      scormBridgeRef.current = bridge;
      bridge.attachToWindow(window);

      if (iframeRef.current && iframeRef.current.contentWindow) {
        bridge.attachToWindow(iframeRef.current.contentWindow);
      }
    }
  }, [lesson.id, currentUser]);

  // Periodic progress autosave
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying && currentTime > 0) {
        const percent = Math.min(100, Math.round((currentTime / (duration || 300)) * 100));
        saveStudentProgress({
          studentId,
          lessonId: lesson.id,
          courseId: course.id,
          currentPositionSeconds: Math.round(currentTime),
          timeSpentSeconds: Math.round(currentTime),
          completionPercentage: percent,
        });
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, currentTime, duration, studentId, lesson.id]);

  // Check interactive stops during video playback
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Look for uncompleted stop within current timestamp window
    const hitStop = stops.find(stop => {
      const diff = Math.abs(current - stop.timestampSeconds);
      const isDone = completedStops.includes(stop.id);
      return diff <= 0.75 && !isDone;
    });

    if (hitStop && !activeStop) {
      videoRef.current.pause();
      setIsPlaying(false);
      setActiveStop(hitStop);
    }

    // Check if reached end of video
    if (duration > 0 && current >= duration - 1 && !completedLesson) {
      handleCompleteLesson();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    // If not teacher/admin, check if jumping past an uncompleted required stop
    if (!isTeacherOrAdmin) {
      const blockingStop = stops.find(
        s => s.timestampSeconds < time && 
             s.timestampSeconds > currentTime && 
             s.continuationPolicy === 'require_correct' && 
             !completedStops.includes(s.id)
      );
      if (blockingStop) {
        alert(`⚠️ Em cần trả lời đúng điểm dừng "${blockingStop.title}" tại ${Math.floor(blockingStop.timestampSeconds / 60)}:${(blockingStop.timestampSeconds % 60).toString().padStart(2, '0')} trước khi xem tiếp.`);
        return;
      }
    }

    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleStopContinue = () => {
    if (activeStop) {
      const nextDone = [...completedStops, activeStop.id];
      setCompletedStops(nextDone);

      // Save to LMS
      saveStudentProgress({
        studentId,
        lessonId: lesson.id,
        courseId: course.id,
        completedStops: nextDone,
      });

      setActiveStop(null);

      // Resume playback after passing stop
      if (videoRef.current) {
        videoRef.current.currentTime += 1;
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleCompleteLesson = () => {
    setCompletedLesson(true);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (e) {}

    saveStudentProgress({
      studentId,
      lessonId: lesson.id,
      courseId: course.id,
      status: 'completed',
      completionPercentage: 100,
      score: 100,
      completedAt: new Date().toISOString(),
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(e => console.error(e));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(e => console.error(e));
    }
  };

  // Syllabus navigation
  const courseLessons = lessons.filter(l => l.courseId === course.id).sort((a, b) => a.order - b.order);
  const currentIndex = courseLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white min-h-[calc(100vh-4rem)]">
      {/* Top Learning Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát phòng học</span>
          </button>
          <div className="hidden sm:block border-l border-slate-700 pl-3">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              {course.title}
            </span>
            <h2 className="text-sm font-bold text-white truncate max-w-md">
              {lesson.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {completedLesson ? (
            <div className="flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Đã hoàn thành bài</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Đang học ({Math.min(100, Math.round((currentTime / (duration || 300)) * 100))}%)</span>
            </div>
          )}

          <button
            onClick={() => setShowSyllabus(!showSyllabus)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              showSyllabus ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Mục lục khóa học</span>
          </button>
        </div>
      </div>

      {/* Main Learning Body */}
      <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>
        {/* Left: Player Area */}
        <div className="flex-1 flex flex-col justify-between bg-black relative overflow-hidden">
          
          {/* Visual Content Display */}
          <div className="flex-1 relative flex items-center justify-center">
            {/* 1. SCORM Package Viewer */}
            {(lesson.type === 'scorm12' || lesson.type === 'scorm2004') ? (
              <div className="w-full h-full flex flex-col bg-slate-950">
                <div className="bg-slate-800/80 px-4 py-2 text-xs flex items-center justify-between text-slate-300 border-b border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-semibold">Đang chạy SCORM {lesson.type === 'scorm2004' ? '2004' : '1.2'} Runtime Bridge</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Tự động đồng bộ điểm số về sổ theo dõi</span>
                </div>
                <iframe
                  ref={iframeRef}
                  title="SCORM Package Player"
                  srcDoc={
                    lesson.contentUrl || 
                    `<!DOCTYPE html><html><body style="font-family:system-ui;margin:0;padding:32px;background:linear-gradient(135deg, #064e3b 0%, #0f172a 100%);color:white;display:flex;align-items:center;justify-center;min-height:80vh;">
                    <div style="background:rgba(255,255,255,0.08);backdrop-filter:blur(8px);padding:32px;border-radius:24px;border:1px solid rgba(255,255,255,0.15);max-width:600px;margin:auto;text-align:center;">
                      <div style="font-size:40px;margin-bottom:12px;">🎒</div>
                      <h2 style="margin:0 0 12px;color:#34d399;font-size:22px;">${lesson.title}</h2>
                      <p style="color:#cbd5e1;font-size:14px;line-height:1.6;">Bài giảng e-learning tương tác SCORM 1.2 chuẩn GDPT 2018. Học sinh có thể tương tác trực tiếp và gửi kết quả về máy chủ nhà trường.</p>
                      <button onclick="parent.postMessage('FINISH_SCORM', '*');" style="margin-top:20px;padding:12px 28px;background:#059669;color:white;border:none;border-radius:12px;font-weight:bold;font-size:15px;cursor:pointer;">
                        ✅ Bấm vào đây để Hoàn thành bài học SCORM
                      </button>
                    </div>
                    <script>
                      window.addEventListener('message', function(e) {
                        if (e.data === 'FINISH_SCORM') {
                          if (window.parent && window.parent.API) {
                            window.parent.API.LMSSetValue('cmi.core.score.raw', '100');
                            window.parent.API.LMSSetValue('cmi.core.lesson_status', 'completed');
                            window.parent.API.LMSCommit('');
                          }
                        }
                      });
                    </script>
                    </body></html>`
                  }
                  className="w-full flex-1 border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            ) : lesson.type === 'video' ? (
              /* 2. Interactive Video Player */
              <div className="relative w-full h-full flex items-center justify-center group">
                <video
                  ref={videoRef}
                  src={lesson.contentUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={togglePlay}
                  className="w-full max-h-[82vh] object-contain cursor-pointer"
                />

                {/* Big Center Play Button overlay when paused */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute z-20 w-16 h-16 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </button>
                )}
              </div>
            ) : (
              /* 3. Slide or Document Viewer */
              <div className="p-8 max-w-2xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-emerald-400 mx-auto flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">{lesson.title}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Tài liệu học tập trực tuyến. Em hãy đọc kỹ kiến thức và tương tác với các điểm dừng bài học bên dưới.
                </p>
                <button
                  onClick={handleCompleteLesson}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 font-bold text-sm rounded-xl"
                >
                  Đánh dấu đã hoàn thành bài giảng
                </button>
              </div>
            )}
          </div>

          {/* Bottom Player Controls Bar (Video & Audio & Stops) */}
          {lesson.type === 'video' && (
            <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 sm:px-6 z-20 shrink-0">
              {/* Timeline scrubber with STOP MARKERS */}
              <div className="relative mb-3 group">
                <div className="relative h-2.5 bg-slate-700 rounded-full cursor-pointer overflow-visible">
                  {/* Progress bar fill */}
                  <div
                    className="h-full bg-emerald-500 rounded-full relative"
                    style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
                  />

                  {/* Stops Markers on Timeline */}
                  {stops.map((stop) => {
                    const percent = Math.min(100, Math.max(0, (stop.timestampSeconds / (duration || 300)) * 100));
                    const isDone = completedStops.includes(stop.id);

                    return (
                      <div
                        key={stop.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSeek(stop.timestampSeconds);
                        }}
                        title={`Điểm dừng: ${stop.title} (${Math.floor(stop.timestampSeconds / 60)}:${(stop.timestampSeconds % 60).toString().padStart(2, '0')})`}
                        style={{ left: `${percent}%` }}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-transform hover:scale-150 cursor-pointer z-30 ${
                          isDone 
                            ? 'bg-emerald-400 border-white' 
                            : 'bg-amber-400 border-slate-900 shadow-md animate-pulse'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Scrubber input */}
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.5"
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <div className="text-xs font-mono text-slate-300">
                    <span className="font-bold text-white">{formatTime(currentTime)}</span>
                    <span className="text-slate-500"> / {formatTime(duration)}</span>
                  </div>

                  {/* Volume */}
                  <div className="hidden sm:flex items-center space-x-1.5 ml-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setVolume(val);
                        if (videoRef.current) videoRef.current.volume = val;
                        setIsMuted(val === 0);
                      }}
                      className="w-16 h-1 bg-slate-700 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Stops count badge */}
                  <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Điểm dừng: <b className="text-emerald-400">{completedStops.length}</b>/{stops.length}
                    </span>
                  </div>

                  {/* Playback Speed */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => {
                      const spd = parseFloat(e.target.value);
                      setPlaybackSpeed(spd);
                      if (videoRef.current) videoRef.current.playbackRate = spd;
                    }}
                    className="bg-slate-800 text-xs font-bold text-slate-200 px-2 py-1 rounded-lg border border-slate-700"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x (Chuẩn)</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                  </select>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Course Syllabus & Stops List Drawer */}
        {showSyllabus && (
          <div className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
              <h3 className="font-heading font-bold text-sm text-white">Mục lục khóa học</h3>
              <p className="text-xs text-slate-400 mt-0.5">{course.title}</p>
            </div>

            {/* Modules and Lessons */}
            <div className="p-3 space-y-4">
              {modules.filter(m => m.courseId === course.id).map((mod, modIdx) => {
                const modLessons = lessons.filter(l => l.moduleId === mod.id);

                return (
                  <div key={mod.id} className="space-y-1.5">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider px-2">
                      {mod.title}
                    </div>

                    <div className="space-y-1">
                      {modLessons.map((les) => {
                        const isCurrent = les.id === lesson.id;
                        const prog = getStudentProgress(studentId, les.id);
                        const isDone = prog?.status === 'completed';

                        return (
                          <div
                            key={les.id}
                            onClick={() => onSelectLesson(les.id)}
                            className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isCurrent
                                ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/50 font-bold'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 overflow-hidden">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                                isCurrent ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {les.order}
                              </span>
                              <span className="truncate">{les.title}</span>
                            </div>
                            <div>
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {les.stopsCount} dừng
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Current Lesson Stops Details */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Các điểm dừng bài này ({stops.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Đã đạt: {completedStops.length}/{stops.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {stops.length === 0 ? (
                    <p className="text-xs text-slate-500 px-2 py-3 italic">
                      Bài học này chưa có điểm dừng tương tác.
                    </p>
                  ) : (
                    stops.map((stop, sIdx) => {
                      const isDone = completedStops.includes(stop.id);
                      return (
                        <div
                          key={stop.id}
                          onClick={() => {
                            handleSeek(stop.timestampSeconds);
                            setActiveStop(stop);
                          }}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border cursor-pointer transition-colors ${
                            isDone 
                              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' 
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[11px] text-slate-400">
                              {Math.floor(stop.timestampSeconds / 60)}:{(stop.timestampSeconds % 60).toString().padStart(2, '0')}
                            </span>
                            <span className="font-semibold truncate max-w-[150px]">{stop.title}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-emerald-400 font-bold">+{stop.points}đ</span>
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-amber-400/80" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Lesson Navigation */}
            <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
              <button
                disabled={!prevLesson}
                onClick={() => prevLesson && onSelectLesson(prevLesson.id)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Bài trước</span>
              </button>

              <button
                disabled={!nextLesson}
                onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold flex items-center space-x-1 text-white shadow-md shadow-emerald-600/30"
              >
                <span>Bài tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Stop Challenge Modal (Pops up automatically) */}
      {activeStop && (
        <InteractiveStopModal
          stop={activeStop}
          courseId={course.id}
          lessonId={lesson.id}
          previousAnswer={answersMap[activeStop.id]}
          onContinue={handleStopContinue}
        />
      )}
    </div>
  );
};
