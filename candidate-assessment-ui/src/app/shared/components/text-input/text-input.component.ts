import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-text-input',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="text-input">
      <textarea
        [(ngModel)]="value"
        [placeholder]="placeholder"
        [disabled]="disabled"
        rows="3"
        (input)="onInput()"
      ></textarea>
    </div>
  `,
    styles: [`
    .text-input {
      width: 100%;
    }
    
    textarea {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 15px;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }
    
    textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }
    
    textarea:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
  `]
})
export class TextInputComponent {
    @Input() value: string = '';
    @Input() placeholder: string = 'Type your answer here...';
    @Input() disabled: boolean = false;
    @Output() valueChange = new EventEmitter<string>();

    onInput(): void {
        this.valueChange.emit(this.value);
    }
}
