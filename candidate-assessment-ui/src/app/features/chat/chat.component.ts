import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../../core/services';
import { ChatMessage, Content, Question, Progress, NextItem, QuestionType, BlankItem } from '../../core/models';
import { AudioPlayerComponent } from '../../shared/components/audio-player/audio-player.component';
import { ImageViewerComponent } from '../../shared/components/image-viewer/image-viewer.component';
import { ReadingPassageComponent } from '../../shared/components/reading-passage/reading-passage.component';
import { McqOptionsComponent } from '../../shared/components/mcq-options/mcq-options.component';
import { MaqOptionsComponent } from '../../shared/components/maq-options/maq-options.component';
import { TextInputComponent } from '../../shared/components/text-input/text-input.component';
import { TrueFalseComponent } from '../../shared/components/true-false/true-false.component';
import { FillBlanksComponent } from '../../shared/components/fill-blanks/fill-blanks.component';
import { SpeakingInputComponent } from '../../shared/components/speaking-input/speaking-input.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';

interface DisplayMessage {
  type: 'system' | 'user' | 'content' | 'question';
  text?: string;
  content?: Content;
  question?: Question;
  isFromUser: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    AudioPlayerComponent,
    ImageViewerComponent,
    ReadingPassageComponent,
    McqOptionsComponent,
    MaqOptionsComponent,
    TextInputComponent,
    TrueFalseComponent,
    FillBlanksComponent,
    SpeakingInputComponent,
    ProgressBarComponent
  ],
  template: `
    <div class="chat-container">
      <!-- Progress Bar -->
      <app-progress-bar [progress]="currentProgress"></app-progress-bar>
      
      <!-- Messages Area -->
      <div class="messages-area" #messagesContainer>
        <div *ngFor="let msg of messages" class="message" [class.user-message]="msg.isFromUser">
          <div class="message-bubble" [class.user-bubble]="msg.isFromUser">
            <!-- System/Bot text messages -->
            <div *ngIf="msg.text && !msg.content && !msg.question" 
                 class="message-text" 
                 [innerHTML]="formatText(msg.text)">
            </div>
            
            <!-- Content display -->
            <div *ngIf="msg.content" class="content-display">
              <app-audio-player 
                *ngIf="msg.content.type === 'audio'"
                [audioUrl]="msg.content.audioUrl || ''"
                (audioCompleted)="onAudioCompleted()">
              </app-audio-player>
              
              <app-image-viewer 
                *ngIf="msg.content.type === 'image'"
                [imageUrl]="msg.content.imageUrl || ''"
                [altText]="msg.content.title || ''">
              </app-image-viewer>
              
              <app-reading-passage 
                *ngIf="msg.content.type === 'reading'"
                [passage]="msg.content.passage || ''"
                [title]="msg.content.title || ''">
              </app-reading-passage>
            </div>
            
            <!-- Question display -->
            <div *ngIf="msg.question" class="question-display">
              <p class="question-number">Question {{ msg.question.questionNumber }} of {{ msg.question.totalQuestionsInSection }}</p>
              <span class="question-type-badge" [ngClass]="getQuestionTypeBadgeClass(msg.question.questionType)">
                {{ getQuestionTypeLabel(msg.question.questionType) }}
              </span>
              
              <!-- Image for image-based questions -->
              <div *ngIf="msg.question.questionType === 'image' && msg.question.imageUrl" class="question-image">
                <app-image-viewer 
                  [imageUrl]="msg.question.imageUrl"
                  [altText]="'Question Image'">
                </app-image-viewer>
              </div>
              
              <p class="question-text">{{ msg.question.text }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Input Area -->
      <div class="input-area">
        <!-- Ready button for greeting -->
        <div *ngIf="currentState === 'greeting'" class="action-buttons">
          <button class="primary-btn" (click)="onReady()">Yes, I'm Ready!</button>
        </div>
        
        <!-- Proceed button for content -->
        <div *ngIf="currentState === 'content'" class="action-buttons">
          <button class="primary-btn" (click)="onProceed()" [disabled]="!canProceed">
            {{ getProceedButtonText() }}
          </button>
        </div>
        
        <!-- Question input based on type -->
        <div *ngIf="currentState === 'question' && currentQuestion" class="question-input">
          
          <!-- Writing: Text input -->
          <app-text-input 
            *ngIf="currentQuestion.questionType === 'writing'"
            [value]="textAnswer"
            [placeholder]="'Type your answer here...'"
            [disabled]="isSubmitting"
            (valueChange)="textAnswer = $event">
          </app-text-input>
          
          <!-- Speaking: Audio recorder -->
          <app-speaking-input
            *ngIf="currentQuestion.questionType === 'speaking'"
            [disabled]="isSubmitting"
            (audioRecorded)="onAudioRecorded($event)">
          </app-speaking-input>
          
          <!-- Image: Show MCQ or Text based on options -->
          <ng-container *ngIf="currentQuestion.questionType === 'image'">
            <app-mcq-options 
              *ngIf="currentQuestion.options && currentQuestion.options.length > 0"
              [options]="currentQuestion.options"
              [selectedOption]="selectedOption"
              [disabled]="isSubmitting"
              (optionSelected)="onOptionSelected($event)">
            </app-mcq-options>
            <app-text-input 
              *ngIf="!currentQuestion.options || currentQuestion.options.length === 0"
              [value]="textAnswer"
              [disabled]="isSubmitting"
              (valueChange)="textAnswer = $event">
            </app-text-input>
          </ng-container>
          
          <!-- MCQ: Single select -->
          <app-mcq-options 
            *ngIf="currentQuestion.questionType === 'mcq'"
            [options]="currentQuestion.options || []"
            [selectedOption]="selectedOption"
            [disabled]="isSubmitting"
            (optionSelected)="onOptionSelected($event)">
          </app-mcq-options>
          
          <!-- MAQ: Multi select -->
          <app-maq-options 
            *ngIf="currentQuestion.questionType === 'maq'"
            [options]="currentQuestion.options || []"
            [selectedOptions]="selectedOptions"
            [disabled]="isSubmitting"
            (optionsChanged)="onOptionsChanged($event)">
          </app-maq-options>
          
          <!-- Fill in Blanks -->
          <app-fill-blanks
            *ngIf="currentQuestion.questionType === 'fill_blanks'"
            [sentence]="currentQuestion.text"
            [blanks]="currentQuestion.blanks || []"
            [disabled]="isSubmitting"
            (answersChanged)="onBlanksChanged($event)">
          </app-fill-blanks>
          
          <!-- True/False -->
          <app-true-false
            *ngIf="currentQuestion.questionType === 'true_false'"
            [selected]="trueFalseAnswer"
            [disabled]="isSubmitting"
            (selectionChanged)="onTrueFalseSelected($event)">
          </app-true-false>
          
          <!-- Reading Section Sub-questions -->
          <ng-container *ngIf="currentQuestion.questionType === 'reading' && currentQuestion.subQuestionType">
            <app-mcq-options 
              *ngIf="currentQuestion.subQuestionType === 'mcq'"
              [options]="currentQuestion.options || []"
              [selectedOption]="selectedOption"
              [disabled]="isSubmitting"
              (optionSelected)="onOptionSelected($event)">
            </app-mcq-options>
            
            <app-maq-options 
              *ngIf="currentQuestion.subQuestionType === 'maq'"
              [options]="currentQuestion.options || []"
              [selectedOptions]="selectedOptions"
              [disabled]="isSubmitting"
              (optionsChanged)="onOptionsChanged($event)">
            </app-maq-options>
            
            <app-fill-blanks
              *ngIf="currentQuestion.subQuestionType === 'fill_blanks'"
              [sentence]="currentQuestion.text"
              [blanks]="currentQuestion.blanks || []"
              [disabled]="isSubmitting"
              (answersChanged)="onBlanksChanged($event)">
            </app-fill-blanks>
            
            <app-true-false
              *ngIf="currentQuestion.subQuestionType === 'true_false'"
              [selected]="trueFalseAnswer"
              [disabled]="isSubmitting"
              (selectionChanged)="onTrueFalseSelected($event)">
            </app-true-false>
          </ng-container>
          
          <!-- Listening Section Sub-questions -->
          <ng-container *ngIf="currentQuestion.questionType === 'listening' && currentQuestion.subQuestionType">
            <app-mcq-options 
              *ngIf="currentQuestion.subQuestionType === 'mcq'"
              [options]="currentQuestion.options || []"
              [selectedOption]="selectedOption"
              [disabled]="isSubmitting"
              (optionSelected)="onOptionSelected($event)">
            </app-mcq-options>
            
            <app-maq-options 
              *ngIf="currentQuestion.subQuestionType === 'maq'"
              [options]="currentQuestion.options || []"
              [selectedOptions]="selectedOptions"
              [disabled]="isSubmitting"
              (optionsChanged)="onOptionsChanged($event)">
            </app-maq-options>
            
            <app-fill-blanks
              *ngIf="currentQuestion.subQuestionType === 'fill_blanks'"
              [sentence]="currentQuestion.text"
              [blanks]="currentQuestion.blanks || []"
              [disabled]="isSubmitting"
              (answersChanged)="onBlanksChanged($event)">
            </app-fill-blanks>
            
            <app-true-false
              *ngIf="currentQuestion.subQuestionType === 'true_false'"
              [selected]="trueFalseAnswer"
              [disabled]="isSubmitting"
              (selectionChanged)="onTrueFalseSelected($event)">
            </app-true-false>
          </ng-container>
          
          <!-- Legacy: Text only questions (from old backend) -->
          <app-text-input 
            *ngIf="currentQuestion.questionType === 'text'"
            [value]="textAnswer"
            [placeholder]="'Type your answer here...'"
            [disabled]="isSubmitting"
            (valueChange)="textAnswer = $event">
          </app-text-input>
          
          <!-- Legacy: Both MCQ and Text (from old backend) -->
          <ng-container *ngIf="currentQuestion.questionType === 'both'">
            <app-mcq-options 
              *ngIf="currentQuestion.options && currentQuestion.options.length > 0"
              [options]="currentQuestion.options"
              [selectedOption]="selectedOption"
              [disabled]="isSubmitting"
              (optionSelected)="onOptionSelected($event)">
            </app-mcq-options>
            <app-text-input 
              [value]="textAnswer"
              [placeholder]="'Add additional explanation (optional)...'"
              [disabled]="isSubmitting"
              (valueChange)="textAnswer = $event">
            </app-text-input>
          </ng-container>
          
          <!-- Submit Button -->
          <button 
            class="submit-btn" 
            (click)="submitAnswer()" 
            [disabled]="!canSubmit || isSubmitting">
            {{ isSubmitting ? 'Submitting...' : 'Submit Answer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f5f6fa;
    }
    
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .message {
      display: flex;
      justify-content: flex-start;
    }
    
    .message.user-message {
      justify-content: flex-end;
    }
    
    .message-bubble {
      max-width: 80%;
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    .message-bubble.user-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .message-text {
      line-height: 1.6;
      font-size: 15px;
    }
    
    .message-text strong {
      font-weight: 600;
    }
    
    .content-display {
      min-width: 300px;
    }
    
    .question-display {
      min-width: 280px;
    }
    
    .question-number {
      font-size: 12px;
      color: #888;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      font-weight: 600;
    }
    
    .question-type-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    
    .badge-writing { background: #dbeafe; color: #1d4ed8; }
    .badge-speaking { background: #fce7f3; color: #be185d; }
    .badge-image { background: #d1fae5; color: #047857; }
    .badge-mcq { background: #e0e7ff; color: #4338ca; }
    .badge-maq { background: #fef3c7; color: #b45309; }
    .badge-fill_blanks { background: #f3e8ff; color: #7c3aed; }
    .badge-true_false { background: #ccfbf1; color: #0d9488; }
    .badge-reading { background: #fee2e2; color: #dc2626; }
    .badge-listening { background: #cffafe; color: #0891b2; }
    
    .question-image {
      margin: 12px 0;
    }
    
    .question-text {
      margin: 0;
      font-size: 16px;
      color: #333;
      line-height: 1.5;
    }
    
    .input-area {
      background: white;
      border-top: 1px solid #eee;
      padding: 20px;
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
    }
    
    .primary-btn {
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .primary-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    
    .primary-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .question-input {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .submit-btn {
      padding: 14px 24px;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      align-self: flex-end;
    }
    
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(17, 153, 142, 0.4);
    }
    
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ChatComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  sessionId: string = '';
  messages: DisplayMessage[] = [];
  currentProgress: Progress | null = null;

  currentState: 'greeting' | 'content' | 'question' | 'completed' = 'greeting';
  currentContent: Content | null = null;
  currentQuestion: Question | null = null;

  // Answer state variables for different question types
  selectedOption: string | null = null;        // For MCQ, True/False
  selectedOptions: string[] = [];              // For MAQ
  textAnswer: string = '';                     // For Writing
  blankAnswers: Record<string, string> = {};   // For Fill in Blanks
  trueFalseAnswer: boolean | null = null;      // For True/False
  audioBlob: Blob | null = null;               // For Speaking

  isSubmitting: boolean = false;
  canProceed: boolean = false;
  audioPlayed: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';
    if (!this.sessionId) {
      this.router.navigate(['/']);
      return;
    }
    this.loadNextItem();
  }

  loadNextItem(): void {
    this.assessmentService.getNextItem(this.sessionId).subscribe({
      next: (nextItem) => this.handleNextItem(nextItem),
      error: () => this.router.navigate(['/'])
    });
  }

  handleNextItem(nextItem: NextItem): void {
    if (!nextItem.message) return;

    const msg = nextItem.message;
    this.currentProgress = msg.progress || null;

    switch (nextItem.itemType) {
      case 'greeting':
        this.currentState = 'greeting';
        this.addMessage({
          type: 'system',
          text: msg.text,
          isFromUser: false
        });
        break;

      case 'content':
        this.currentState = 'content';
        this.currentContent = msg.content || null;
        this.audioPlayed = false;
        this.canProceed = true; // Allow proceeding without waiting for audio

        this.addMessage({
          type: 'system',
          text: msg.text,
          isFromUser: false
        });
        this.addMessage({
          type: 'content',
          content: msg.content,
          isFromUser: false
        });
        break;

      case 'question':
        this.currentState = 'question';
        this.currentQuestion = msg.question || null;
        this.resetAnswerState();

        this.addMessage({
          type: 'question',
          question: msg.question,
          isFromUser: false
        });
        break;

      case 'completed':
        this.currentState = 'completed';
        this.assessmentService.completeAssessment(this.sessionId).subscribe();
        this.router.navigate(['/completed']);
        break;
    }

    this.scrollToBottom();
  }

  resetAnswerState(): void {
    this.selectedOption = null;
    this.selectedOptions = [];
    this.textAnswer = '';
    this.blankAnswers = {};
    this.trueFalseAnswer = null;
    this.audioBlob = null;
  }

  addMessage(msg: DisplayMessage): void {
    this.messages.push(msg);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  formatText(text: string): string {
    // Convert markdown-like bold (**text**) to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  getQuestionTypeLabel(type: QuestionType): string {
    const labels: Record<QuestionType, string> = {
      'writing': 'Writing',
      'speaking': 'Speaking',
      'image': 'Image',
      'mcq': 'MCQ',
      'maq': 'Multi-Select',
      'fill_blanks': 'Fill Blanks',
      'true_false': 'True/False',
      'reading': 'Reading',
      'listening': 'Listening',
      // Legacy types
      'text': 'Text Answer',
      'both': 'MCQ + Text'
    };
    return labels[type] || type;
  }

  getQuestionTypeBadgeClass(type: QuestionType): string {
    return `badge-${type}`;
  }

  onReady(): void {
    this.addMessage({
      type: 'user',
      text: "Yes, I'm ready!",
      isFromUser: true
    });

    this.assessmentService.proceedToQuestions(this.sessionId).subscribe({
      next: (nextItem) => this.handleNextItem(nextItem)
    });
  }

  onAudioCompleted(): void {
    this.audioPlayed = true;
    this.canProceed = true;
  }

  getProceedButtonText(): string {
    if (this.currentContent?.type === 'audio' && !this.audioPlayed) {
      return 'Please listen to the audio first';
    }
    return 'Proceed to Questions';
  }

  onProceed(): void {
    this.addMessage({
      type: 'user',
      text: 'Proceed to questions',
      isFromUser: true
    });

    this.assessmentService.proceedToQuestions(this.sessionId).subscribe({
      next: (nextItem) => this.handleNextItem(nextItem)
    });
  }

  // Event handlers for different question types
  onOptionSelected(option: string): void {
    this.selectedOption = option;
  }

  onOptionsChanged(options: string[]): void {
    this.selectedOptions = options;
  }

  onBlanksChanged(answers: Record<string, string>): void {
    this.blankAnswers = answers;
  }

  onTrueFalseSelected(value: boolean): void {
    this.trueFalseAnswer = value;
    this.selectedOption = value ? 'True' : 'False';
  }

  onAudioRecorded(blob: Blob | undefined): void {
    console.log('Audio recorded:', blob);
    this.audioBlob = blob || null;
    console.log('audioBlob set to:', this.audioBlob);
    console.log('canSubmit:', this.canSubmit);
    // Force Angular to detect the change and update the button
    this.cdr.detectChanges();
  }

  get canSubmit(): boolean {
    if (!this.currentQuestion) return false;

    const type = this.currentQuestion.questionType;
    const subType = this.currentQuestion.subQuestionType;

    // Determine effective type for reading/listening sections
    const effectiveType = (type === 'reading' || type === 'listening') && subType ? subType : type;

    switch (effectiveType) {
      case 'writing':
        return !!this.textAnswer.trim();
      case 'speaking':
        return !!this.audioBlob;
      case 'image':
        if (this.currentQuestion.options && this.currentQuestion.options.length > 0) {
          return !!this.selectedOption;
        }
        return !!this.textAnswer.trim();
      case 'mcq':
        return !!this.selectedOption;
      case 'maq':
        return this.selectedOptions.length > 0;
      case 'fill_blanks':
        // Simply check if any blank answer has been filled
        return Object.keys(this.blankAnswers).length > 0 &&
          Object.values(this.blankAnswers).some(v => v && v.trim().length > 0);
      case 'true_false':
        return this.trueFalseAnswer !== null;
      // Legacy types from old backend
      case 'text':
        return !!this.textAnswer.trim();
      case 'both':
        return !!this.selectedOption || !!this.textAnswer.trim();
      default:
        return false;
    }
  }

  submitAnswer(): void {
    if (!this.currentQuestion || !this.canSubmit || this.isSubmitting) return;

    this.isSubmitting = true;

    // Build user answer display text
    let answerText = this.buildAnswerDisplayText();

    this.addMessage({
      type: 'user',
      text: answerText,
      isFromUser: true
    });

    // Build submit request based on question type
    const request = this.buildSubmitRequest();

    this.assessmentService.submitAnswer(request).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        if (result.nextItem) {
          this.handleNextItem(result.nextItem);
        }
      },
      error: () => {
        this.isSubmitting = false;
        alert('Failed to submit answer. Please try again.');
      }
    });
  }

  private buildAnswerDisplayText(): string {
    const type = this.currentQuestion!.questionType;
    const subType = this.currentQuestion!.subQuestionType;
    const effectiveType = (type === 'reading' || type === 'listening') && subType ? subType : type;

    switch (effectiveType) {
      case 'writing':
        return this.textAnswer.trim();
      case 'speaking':
        return '🎤 Audio response recorded';
      case 'image':
        return this.selectedOption || this.textAnswer.trim();
      case 'mcq':
        return this.selectedOption || '';
      case 'maq':
        return this.selectedOptions.join(', ');
      case 'fill_blanks':
        return Object.values(this.blankAnswers).join(', ');
      case 'true_false':
        return this.trueFalseAnswer ? 'True' : 'False';
      // Legacy types from old backend
      case 'text':
        return this.textAnswer.trim();
      case 'both':
        let answer = this.selectedOption || '';
        if (this.textAnswer.trim()) {
          answer += (answer ? '\n' : '') + this.textAnswer.trim();
        }
        return answer;
      default:
        return '';
    }
  }

  private buildSubmitRequest(): any {
    const type = this.currentQuestion!.questionType;
    const subType = this.currentQuestion!.subQuestionType;
    const effectiveType = (type === 'reading' || type === 'listening') && subType ? subType : type;

    const baseRequest = {
      sessionId: this.sessionId,
      questionId: this.currentQuestion!.id
    };

    switch (effectiveType) {
      case 'writing':
        return { ...baseRequest, answerText: this.textAnswer.trim() };
      case 'speaking':
        return { ...baseRequest, audioBlob: this.audioBlob };
      case 'image':
        if (this.selectedOption) {
          return { ...baseRequest, selectedOption: this.selectedOption };
        }
        return { ...baseRequest, answerText: this.textAnswer.trim() };
      case 'mcq':
        return { ...baseRequest, selectedOption: this.selectedOption };
      case 'maq':
        return { ...baseRequest, selectedOptions: this.selectedOptions };
      case 'fill_blanks':
        return { ...baseRequest, blankAnswers: this.blankAnswers };
      case 'true_false':
        return { ...baseRequest, selectedOption: this.trueFalseAnswer ? 'True' : 'False' };
      // Legacy types from old backend
      case 'text':
        return { ...baseRequest, answerText: this.textAnswer.trim() };
      case 'both':
        return {
          ...baseRequest,
          selectedOption: this.selectedOption || undefined,
          answerText: this.textAnswer.trim() || undefined
        };
      default:
        return baseRequest;
    }
  }
}
