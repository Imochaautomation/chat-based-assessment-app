import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-maq-options',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="maq-options">
      <p class="maq-hint">Select all that apply:</p>
      <div 
        *ngFor="let option of options; let i = index"
        class="option-checkbox"
        [class.selected]="isSelected(option)"
        [class.disabled]="disabled"
        (click)="toggleOption(option)"
      >
        <div class="checkbox">
          <svg *ngIf="isSelected(option)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="option-letter">{{ getOptionLetter(i) }}</span>
        <span class="option-text">{{ getOptionText(option) }}</span>
      </div>
    </div>
  `,
    styles: [`
    .maq-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .maq-hint {
      font-size: 13px;
      color: #666;
      margin: 0 0 4px 0;
      font-style: italic;
    }
    
    .option-checkbox {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .option-checkbox:hover:not(.disabled) {
      border-color: #667eea;
      background: #f8f9ff;
    }
    
    .option-checkbox.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    }
    
    .option-checkbox.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .checkbox {
      width: 22px;
      height: 22px;
      border: 2px solid #d0d0d0;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    
    .option-checkbox.selected .checkbox {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #667eea;
    }
    
    .checkbox svg {
      width: 14px;
      height: 14px;
      color: white;
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
    
    .option-checkbox.selected .option-letter {
      background: #764ba2;
    }
    
    .option-text {
      color: #333;
      font-size: 15px;
      line-height: 1.4;
    }
  `]
})
export class MaqOptionsComponent {
    @Input() options: string[] = [];
    @Input() selectedOptions: string[] = [];
    @Input() disabled: boolean = false;
    @Output() optionsChanged = new EventEmitter<string[]>();

    isSelected(option: string): boolean {
        return this.selectedOptions.includes(option);
    }

    toggleOption(option: string): void {
        if (this.disabled) return;

        const newSelection = [...this.selectedOptions];
        const index = newSelection.indexOf(option);

        if (index > -1) {
            newSelection.splice(index, 1);
        } else {
            newSelection.push(option);
        }

        this.optionsChanged.emit(newSelection);
    }

    getOptionLetter(index: number): string {
        return String.fromCharCode(65 + index); // A, B, C, D...
    }

    getOptionText(option: string): string {
        // Remove leading letter if present (e.g., "A) Text" -> "Text")
        return option.replace(/^[A-D]\)\s*/, '');
    }
}
