import { Component, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-speaking-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="speaking-input">
      <div class="recording-header">
        <span class="mic-icon">🎤</span>
        <span class="title">Record Your Answer</span>
      </div>
      
      <!-- Countdown Overlay -->
      <div *ngIf="isCountingDown" class="countdown-overlay">
        <div class="countdown-content">
          <div class="countdown-number">{{ countdownValue }}</div>
          <p class="countdown-text">Get ready to speak...</p>
        </div>
      </div>
      
      <!-- Compact Waveform -->
      <div class="waveform-row" *ngIf="!isCountingDown">
        <div class="waveform">
          <div *ngFor="let bar of waveformBars" 
               class="bar" 
               [style.height.px]="bar * 0.6"
               [class.active]="isRecording">
          </div>
        </div>
        <span class="timer" [class.recording]="isRecording" [class.warning]="isRecording && recordingTime < minDuration">
          {{ formatTime(recordingTime) }}
        </span>
      </div>
      
      <!-- Progress Bar (shows during recording) -->
      <div *ngIf="isRecording && !isCountingDown" class="progress-section">
        <div class="progress-bar-container">
          <div class="progress-bar" [style.width.%]="progressPercent"></div>
          <div class="min-marker" [style.left.%]="minMarkerPercent"></div>
        </div>
        <div class="progress-labels">
          <span class="min-label" [class.achieved]="recordingTime >= minDuration">
             {{ recordingTime >= minDuration ? '✓ Min 0:30 reached' : 'Min 0:30 required' }}
          </span>
          <span class="max-label">Max {{ formatTime(maxDuration) }}</span>
        </div>
      </div>
      
      <!-- Control Buttons -->
      <div class="controls" *ngIf="!isCountingDown">
        <button 
          *ngIf="!isRecording && !audioUrl"
          class="record-btn start"
          [disabled]="disabled"
          (click)="initiateRecording()"
        >
          <div class="record-icon"></div>
          Start Recording
        </button>
        
        <button 
          *ngIf="isRecording"
          class="record-btn stop"
          [class.disabled-stop]="recordingTime < minDuration"
          (click)="stopRecording()"
        >
          <div class="stop-icon"></div>
          {{ recordingTime < minDuration ? 'Recording... (' + (minDuration - recordingTime) + 's left)' : 'Stop Recording' }}
        </button>
        
        <div *ngIf="audioUrl && !isRecording" class="playback-controls">
          <div class="recording-success">
            <span class="success-icon">✓</span>
            <span>Recording saved ({{ formatTime(recordingTime) }})</span>
          </div>
          <audio [src]="audioUrl" controls class="audio-playback"></audio>
          <button class="re-record-btn" [disabled]="disabled" (click)="reRecord()">↻ Record Again</button>
        </div>
      </div>
      
      <!-- Minimum time warning -->
      <p *ngIf="showMinTimeWarning && !isRecording && !audioUrl" class="info-message">
        ℹ️ Please speak for at least 30 seconds for accurate assessment
      </p>
      
      <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  `,
  styles: [`
    .speaking-input {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
    }
    
    .recording-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .mic-icon {
      font-size: 18px;
    }
    
    .title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
    
    /* Countdown Overlay */
    .countdown-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(102, 126, 234, 0.95);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    
    .countdown-content {
      text-align: center;
      color: white;
    }
    
    .countdown-number {
      font-size: 72px;
      font-weight: 700;
      animation: pulse-countdown 1s ease-in-out infinite;
    }
    
    .countdown-text {
      font-size: 16px;
      margin-top: 8px;
      opacity: 0.9;
    }
    
    @keyframes pulse-countdown {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    
    .waveform-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .waveform {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      height: 32px;
    }
    
    .bar {
      width: 3px;
      background: #ddd;
      border-radius: 2px;
      transition: height 0.1s ease;
    }
    
    .bar.active {
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    }
    
    .timer {
      font-size: 16px;
      font-weight: 700;
      color: #666;
      font-family: monospace;
      min-width: 50px;
    }
    
    .timer.recording {
      color: #dc2626;
    }
    
    .timer.warning {
      color: #f59e0b;
      animation: blink 1s ease-in-out infinite;
    }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    /* Progress Bar */
    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .progress-bar-container {
      position: relative;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: visible;
    }
    
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #f59e0b 0%, #22c55e 50%, #667eea 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .min-marker {
      position: absolute;
      top: -4px;
      width: 3px;
      height: 16px;
      background: #dc2626;
      border-radius: 2px;
      transform: translateX(-50%);
    }
    
    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }
    
    .min-label {
      color: #f59e0b;
      font-weight: 600;
    }
    
    .min-label.achieved {
      color: #22c55e;
    }
    
    .max-label {
      color: #888;
    }
    
    .controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .record-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      border: none;
      border-radius: 50px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .record-btn.start {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .record-btn.start:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
    
    .record-btn.stop {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      color: white;
      animation: pulse-record 1s ease-in-out infinite;
    }
    
    .record-btn.stop.disabled-stop {
      background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    }
    
    @keyframes pulse-record {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
      50% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0); }
    }
    
    .record-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .record-icon {
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
    }
    
    .stop-icon {
      width: 14px;
      height: 14px;
      background: white;
      border-radius: 3px;
    }
    
    .playback-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      width: 100%;
    }
    
    .recording-success {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #dcfce7;
      border-radius: 8px;
      color: #166534;
      font-weight: 600;
      font-size: 14px;
    }
    
    .success-icon {
      font-size: 16px;
    }
    
    .audio-playback {
      width: 100%;
      max-width: 300px;
      border-radius: 8px;
    }
    
    .re-record-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: transparent;
      border: 2px solid #667eea;
      border-radius: 8px;
      color: #667eea;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .re-record-btn:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }
    
    .re-record-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .info-message {
      color: #3b82f6;
      font-size: 13px;
      margin: 0;
      text-align: center;
      background: #eff6ff;
      padding: 8px 12px;
      border-radius: 6px;
    }
    
    .error-message {
      color: #dc2626;
      font-size: 14px;
      margin: 0;
      text-align: center;
    }
  `]
})
export class SpeakingInputComponent implements OnDestroy {
  @Input() disabled: boolean = false;
  @Input() maxDuration: number = 60; // Max recording time in seconds (1 minute)
  @Input() minDuration: number = 30;  // Minimum recommended time (30 seconds)
  @Input() countdownSeconds: number = 3; // Countdown before recording starts
  @Output() audioRecorded = new EventEmitter<Blob | undefined>();

  isRecording: boolean = false;
  isCountingDown: boolean = false;
  countdownValue: number = 3;
  recordingTime: number = 0;
  audioUrl: string | null = null;
  audioBlob: Blob | null = null;
  errorMessage: string = '';
  showMinTimeWarning: boolean = true;

  waveformBars: number[] = Array(30).fill(10);

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private timerInterval: any;
  private waveformInterval: any;
  private countdownInterval: any;
  private mediaStream: MediaStream | null = null;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // Calculate progress percentage
  get progressPercent(): number {
    return Math.min((this.recordingTime / this.maxDuration) * 100, 100);
  }

  // Calculate where the minimum marker should be positioned
  get minMarkerPercent(): number {
    return (this.minDuration / this.maxDuration) * 100;
  }

  // Initiate recording with countdown
  async initiateRecording(): Promise<void> {
    try {
      this.errorMessage = '';
      this.showMinTimeWarning = false;

      // Request microphone access first
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start countdown
      this.isCountingDown = true;
      this.countdownValue = this.countdownSeconds;

      this.countdownInterval = setInterval(() => {
        this.countdownValue--;
        this.cdr.detectChanges();

        if (this.countdownValue <= 0) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
          this.isCountingDown = false;
          this.startRecording();
        }
      }, 1000);

    } catch (error) {
      this.errorMessage = 'Could not access microphone. Please check your permissions.';
      console.error('Error accessing microphone:', error);
    }
  }

  private startRecording(): void {
    if (!this.mediaStream) return;

    this.mediaRecorder = new MediaRecorder(this.mediaStream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioBlob = audioBlob;
      this.audioUrl = URL.createObjectURL(audioBlob);
      this.audioRecorded.emit(audioBlob);

      // Trigger change detection since this callback is async
      this.cdr.detectChanges();

      // Stop all tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
    };

    this.mediaRecorder.start();
    this.isRecording = true;
    this.startTimer();
    this.startWaveformAnimation();
    this.cdr.detectChanges();
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stopTimer();
      this.stopWaveformAnimation();
    }
  }

  reRecord(): void {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    this.audioUrl = null;
    this.audioBlob = null;
    this.recordingTime = 0;
    this.showMinTimeWarning = true;
    this.audioRecorded.emit(undefined);
  }

  private startTimer(): void {
    this.recordingTime = 0;
    this.timerInterval = setInterval(() => {
      this.recordingTime++;
      this.cdr.detectChanges();
      if (this.recordingTime >= this.maxDuration) {
        this.stopRecording();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private startWaveformAnimation(): void {
    this.waveformInterval = setInterval(() => {
      this.waveformBars = this.waveformBars.map(() =>
        Math.random() * 40 + 10
      );
      this.cdr.detectChanges();
    }, 100);
  }

  private stopWaveformAnimation(): void {
    if (this.waveformInterval) {
      clearInterval(this.waveformInterval);
      this.waveformInterval = null;
    }
    this.waveformBars = Array(30).fill(10);
  }

  private cleanup(): void {
    this.stopTimer();
    this.stopWaveformAnimation();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
