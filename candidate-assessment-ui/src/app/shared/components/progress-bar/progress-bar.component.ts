import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Progress } from '../../../core/models';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container" *ngIf="progress">
      <div class="progress-header">
        <div class="section-info">
          <span class="section-badge">Section {{ progress.currentSection }}</span>
          <span class="section-count">of {{ progress.totalSections }}</span>
        </div>
        <div class="percent-display">
          <span class="percent-value">{{ progress.percentComplete | number:'1.0-0' }}</span>
          <span class="percent-sign">%</span>
        </div>
      </div>
      
      <div class="progress-bar-wrapper">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="progress.percentComplete">
            <div class="progress-glow"></div>
          </div>
        </div>
        <div class="section-dots">
          <div *ngFor="let i of sectionArray" 
               class="section-dot" 
               [class.completed]="i < progress.currentSection"
               [class.current]="i === progress.currentSection">
          </div>
        </div>
      </div>
      
      <div class="question-info">
        <span class="question-label">Question</span>
        <span class="question-number">{{ progress.currentQuestion }}</span>
        <span class="question-total">/ {{ progress.totalQuestions }}</span>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      padding: 16px 20px;
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      border-bottom: 1px solid #eee;
    }
    
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .section-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
    }
    
    .section-count {
      color: #888;
      font-size: 13px;
    }
    
    .percent-display {
      display: flex;
      align-items: baseline;
    }
    
    .percent-value {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .percent-sign {
      font-size: 14px;
      font-weight: 600;
      color: #764ba2;
      margin-left: 2px;
    }
    
    .progress-bar-wrapper {
      position: relative;
    }
    
    .progress-bar {
      height: 10px;
      background: #e9ecef;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
      background-size: 200% 100%;
      border-radius: 5px;
      transition: width 0.5s ease;
      position: relative;
      animation: shimmer 2s linear infinite;
    }
    
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    .progress-glow {
      position: absolute;
      top: 0;
      right: 0;
      width: 30px;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
      border-radius: 0 5px 5px 0;
    }
    
    .section-dots {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      padding: 0 4px;
    }
    
    .section-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ddd;
      transition: all 0.3s ease;
    }
    
    .section-dot.completed {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .section-dot.current {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
      animation: pulse-dot 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse-dot {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    
    .question-info {
      margin-top: 12px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    
    .question-label {
      font-size: 12px;
      color: #888;
    }
    
    .question-number {
      font-size: 16px;
      font-weight: 700;
      color: #667eea;
    }
    
    .question-total {
      font-size: 12px;
      color: #888;
    }
  `]
})
export class ProgressBarComponent {
  @Input() progress: Progress | null = null;

  get sectionArray(): number[] {
    if (!this.progress) return [];
    return Array.from({ length: this.progress.totalSections }, (_, i) => i + 1);
  }
}

