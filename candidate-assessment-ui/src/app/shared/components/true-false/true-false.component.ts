import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-true-false',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="true-false">
      <p class="tf-label">Select your answer:</p>
      <div class="tf-buttons">
        <button 
          class="tf-btn true-btn"
          [class.selected]="selected === true"
          [disabled]="disabled"
          (click)="select(true)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>TRUE</span>
        </button>
        <button 
          class="tf-btn false-btn"
          [class.selected]="selected === false"
          [disabled]="disabled"
          (click)="select(false)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>FALSE</span>
        </button>
      </div>
    </div>
  `,
    styles: [`
    .true-false {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .tf-label {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
    
    .tf-buttons {
      display: flex;
      gap: 16px;
    }
    
    .tf-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 24px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 16px;
      font-weight: 600;
    }
    
    .tf-btn svg {
      width: 22px;
      height: 22px;
    }
    
    .tf-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .tf-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* True button styles */
    .true-btn {
      color: #0d9488;
    }
    
    .true-btn:hover:not(:disabled) {
      border-color: #0d9488;
      background: #f0fdfa;
    }
    
    .true-btn.selected {
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      border-color: #0d9488;
      color: white;
    }
    
    /* False button styles */
    .false-btn {
      color: #dc2626;
    }
    
    .false-btn:hover:not(:disabled) {
      border-color: #dc2626;
      background: #fef2f2;
    }
    
    .false-btn.selected {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      border-color: #dc2626;
      color: white;
    }
  `]
})
export class TrueFalseComponent {
    @Input() selected: boolean | null = null;
    @Input() disabled: boolean = false;
    @Output() selectionChanged = new EventEmitter<boolean>();

    select(value: boolean): void {
        if (!this.disabled) {
            this.selectionChanged.emit(value);
        }
    }
}
