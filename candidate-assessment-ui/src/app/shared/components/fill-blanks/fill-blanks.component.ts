import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlankItem } from '../../../core/models';

interface ParsedSegment {
  type: 'text' | 'blank';
  content: string;
  blankId?: string;
}

@Component({
  selector: 'app-fill-blanks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fill-blanks">
      <p class="fb-hint">Fill in the blanks:</p>
      <div class="sentence-container">
        <ng-container *ngFor="let segment of parsedSegments; let i = index">
          <span *ngIf="segment.type === 'text'" class="text-segment">{{ segment.content }}</span>
          <input 
            *ngIf="segment.type === 'blank'"
            type="text"
            class="blank-input"
            [placeholder]="'Answer ' + (getBlankNumber(segment.blankId!) + 1)"
            [value]="answers[segment.blankId!] || ''"
            [disabled]="disabled"
            (input)="onBlankInput($event, segment.blankId!)"
          />
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .fill-blanks {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .fb-hint {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
    
    .sentence-container {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      line-height: 2.2;
      font-size: 16px;
      color: #333;
    }
    
    .text-segment {
      display: inline;
    }
    
    .blank-input {
      display: inline-block;
      width: 120px;
      padding: 6px 12px;
      margin: 0 4px;
      border: 2px solid #667eea;
      border-radius: 6px;
      font-size: 15px;
      font-family: inherit;
      text-align: center;
      background: #f8f9ff;
      transition: all 0.2s ease;
    }
    
    .blank-input:focus {
      outline: none;
      border-color: #764ba2;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      background: white;
    }
    
    .blank-input:disabled {
      background: #f0f0f0;
      border-color: #ccc;
      cursor: not-allowed;
    }
    
    .blank-input::placeholder {
      color: #aaa;
      font-size: 12px;
    }
  `]
})
export class FillBlanksComponent implements OnInit, OnChanges {
  @Input() sentence: string = '';
  @Input() blanks: BlankItem[] = [];
  @Input() disabled: boolean = false;
  @Output() answersChanged = new EventEmitter<Record<string, string>>();

  parsedSegments: ParsedSegment[] = [];
  answers: Record<string, string> = {};

  ngOnInit(): void {
    this.parseSentence();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sentence'] || changes['blanks']) {
      this.parseSentence();
    }
  }

  private parseSentence(): void {
    this.parsedSegments = [];
    this.answers = {};

    if (!this.sentence) return;

    // Pattern to match blanks like ___ or ___1___ or [blank] or {blank}
    const blankPattern = /(___|___\d+___|___[^_]+___|\[blank\]|\{blank\})/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blankIndex = 0;

    while ((match = blankPattern.exec(this.sentence)) !== null) {
      // Add text before the blank
      if (match.index > lastIndex) {
        this.parsedSegments.push({
          type: 'text',
          content: this.sentence.substring(lastIndex, match.index)
        });
      }

      // Add the blank - use provided blank ID or generate one
      const blankId = this.blanks[blankIndex]?.id || `blank_${blankIndex}`;
      this.parsedSegments.push({
        type: 'blank',
        content: '',
        blankId: blankId
      });

      // Initialize answer for this blank
      this.answers[blankId] = '';

      blankIndex++;
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < this.sentence.length) {
      this.parsedSegments.push({
        type: 'text',
        content: this.sentence.substring(lastIndex)
      });
    }
  }

  getBlankNumber(blankId: string): number {
    return this.blanks.findIndex(b => b.id === blankId);
  }

  onBlankInput(event: Event, blankId: string): void {
    const input = event.target as HTMLInputElement;
    this.answers[blankId] = input.value;
    this.answersChanged.emit({ ...this.answers });
  }
}
