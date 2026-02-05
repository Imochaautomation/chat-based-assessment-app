import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-mcq-options',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="mcq-options">
      <button 
        *ngFor="let option of options; let i = index"
        class="option-btn"
        [class.selected]="selectedOption === option"
        [disabled]="disabled"
        (click)="selectOption(option)"
      >
        <span class="option-letter">{{ getOptionLetter(i) }}</span>
        <span class="option-text">{{ getOptionText(option) }}</span>
      </button>
    </div>
  `,
    styles: [`
    .mcq-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .option-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }
    
    .option-btn:hover:not(:disabled) {
      border-color: #667eea;
      background: #f8f9ff;
    }
    
    .option-btn.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    }
    
    .option-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .option-letter {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #667eea;
      color: white;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .option-btn.selected .option-letter {
      background: #764ba2;
    }
    
    .option-text {
      color: #333;
      font-size: 15px;
      line-height: 1.4;
    }
  `]
})
export class McqOptionsComponent {
    @Input() options: string[] = [];
    @Input() selectedOption: string | null = null;
    @Input() disabled: boolean = false;
    @Output() optionSelected = new EventEmitter<string>();

    selectOption(option: string): void {
        if (!this.disabled) {
            this.optionSelected.emit(option);
        }
    }

    getOptionLetter(index: number): string {
        return String.fromCharCode(65 + index); // A, B, C, D...
    }

    getOptionText(option: string): string {
        // Remove leading letter if present (e.g., "A) Text" -> "Text")
        return option.replace(/^[A-D]\)\s*/, '');
    }
}
