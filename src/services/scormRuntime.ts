/**
 * SCORM 1.2 and SCORM 2004 Runtime API Bridge
 * Implements window.API (SCORM 1.2) and window.API_1484_11 (SCORM 2004)
 * Real-time event dispatching to LMS React state
 */

export interface ScormCmiData {
  'cmi.core.lesson_status'?: string;
  'cmi.core.score.raw'?: string;
  'cmi.core.score.min'?: string;
  'cmi.core.score.max'?: string;
  'cmi.core.lesson_location'?: string;
  'cmi.core.session_time'?: string;
  'cmi.core.total_time'?: string;
  'cmi.suspend_data'?: string;
  'cmi.core.student_id'?: string;
  'cmi.core.student_name'?: string;
  // SCORM 2004 equivalents
  'cmi.completion_status'?: string;
  'cmi.success_status'?: string;
  'cmi.score.raw'?: string;
  'cmi.score.scaled'?: string;
  'cmi.location'?: string;
  'cmi.session_time'?: string;
  [key: string]: any;
}

export interface ScormRuntimeCallbacks {
  onCommit?: (data: ScormCmiData) => void;
  onStatusChange?: (status: string) => void;
  onScoreChange?: (score: number) => void;
  onLocationChange?: (location: string) => void;
}

export class ScormRuntimeBridge {
  private cmi: ScormCmiData = {};
  private initialized: boolean = false;
  private lastError: string = '0';
  private callbacks: ScormRuntimeCallbacks = {};

  constructor(initialData?: ScormCmiData, callbacks?: ScormRuntimeCallbacks) {
    this.cmi = {
      'cmi.core.lesson_status': 'incomplete',
      'cmi.core.student_id': 'HS001',
      'cmi.core.student_name': 'Học sinh',
      'cmi.core.lesson_location': '0',
      'cmi.core.score.raw': '0',
      'cmi.core.score.min': '0',
      'cmi.core.score.max': '100',
      'cmi.suspend_data': '',
      'cmi.completion_status': 'incomplete',
      'cmi.success_status': 'unknown',
      ...initialData,
    };
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  public setCallbacks(callbacks: ScormRuntimeCallbacks) {
    this.callbacks = callbacks;
  }

  public getCmi(): ScormCmiData {
    return { ...this.cmi };
  }

  // SCORM 1.2 API
  public LMSInitialize(param: string = ''): string {
    this.initialized = true;
    this.lastError = '0';
    return 'true';
  }

  public LMSFinish(param: string = ''): string {
    this.initialized = false;
    this.lastError = '0';
    if (this.callbacks.onCommit) {
      this.callbacks.onCommit(this.cmi);
    }
    return 'true';
  }

  public LMSGetValue(element: string): string {
    if (!this.initialized) {
      this.lastError = '301'; // Not initialized
      return '';
    }
    this.lastError = '0';
    return this.cmi[element] !== undefined ? String(this.cmi[element]) : '';
  }

  public LMSSetValue(element: string, value: string): string {
    if (!this.initialized) {
      this.lastError = '301';
      return 'false';
    }
    this.cmi[element] = value;
    this.lastError = '0';

    if (element === 'cmi.core.lesson_status' || element === 'cmi.completion_status') {
      this.callbacks.onStatusChange?.(value);
    }
    if (element === 'cmi.core.score.raw' || element === 'cmi.score.raw') {
      const num = parseFloat(value);
      if (!isNaN(num)) this.callbacks.onScoreChange?.(num);
    }
    if (element === 'cmi.core.lesson_location' || element === 'cmi.location') {
      this.callbacks.onLocationChange?.(value);
    }
    return 'true';
  }

  public LMSCommit(param: string = ''): string {
    this.lastError = '0';
    if (this.callbacks.onCommit) {
      this.callbacks.onCommit(this.cmi);
    }
    return 'true';
  }

  public LMSGetLastError(): string {
    return this.lastError;
  }

  public LMSGetErrorString(errorCode: string): string {
    return 'SCORM operation status ' + errorCode;
  }

  public LMSGetDiagnostic(errorCode: string): string {
    return 'Diagnostic info for ' + errorCode;
  }

  // SCORM 2004 API (API_1484_11)
  public Initialize(param: string = ''): string {
    return this.LMSInitialize(param);
  }

  public Terminate(param: string = ''): string {
    return this.LMSFinish(param);
  }

  public GetValue(element: string): string {
    return this.LMSGetValue(element);
  }

  public SetValue(element: string, value: string): string {
    return this.LMSSetValue(element, value);
  }

  public Commit(param: string = ''): string {
    return this.LMSCommit(param);
  }

  public GetLastError(): string {
    return this.LMSGetLastError();
  }

  public GetErrorString(errorCode: string): string {
    return this.LMSGetErrorString(errorCode);
  }

  public GetDiagnostic(errorCode: string): string {
    return this.LMSGetDiagnostic(errorCode);
  }

  /**
   * Attaches the runtime to a target window (e.g. parent or iframe contentWindow)
   */
  public attachToWindow(targetWindow: any) {
    if (!targetWindow) return;
    targetWindow.API = {
      LMSInitialize: this.LMSInitialize.bind(this),
      LMSFinish: this.LMSFinish.bind(this),
      LMSGetValue: this.LMSGetValue.bind(this),
      LMSSetValue: this.LMSSetValue.bind(this),
      LMSCommit: this.LMSCommit.bind(this),
      LMSGetLastError: this.LMSGetLastError.bind(this),
      LMSGetErrorString: this.LMSGetErrorString.bind(this),
      LMSGetDiagnostic: this.LMSGetDiagnostic.bind(this),
    };
    targetWindow.API_1484_11 = {
      Initialize: this.Initialize.bind(this),
      Terminate: this.Terminate.bind(this),
      GetValue: this.GetValue.bind(this),
      SetValue: this.SetValue.bind(this),
      Commit: this.Commit.bind(this),
      GetLastError: this.GetLastError.bind(this),
      GetErrorString: this.GetErrorString.bind(this),
      GetDiagnostic: this.GetDiagnostic.bind(this),
    };
  }
}
