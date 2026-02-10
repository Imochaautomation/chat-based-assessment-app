import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../../core/services';
import { ChatMessage, Content, Question, NextItem, QuestionType } from '../../core/models';
import { AudioPlayerComponent } from '../../shared/components/audio-player/audio-player.component';
import { ImageViewerComponent } from '../../shared/components/image-viewer/image-viewer.component';
import { ReadingPassageComponent } from '../../shared/components/reading-passage/reading-passage.component';

import { FillBlanksComponent } from '../../shared/components/fill-blanks/fill-blanks.component';
import { SpeakingInputComponent } from '../../shared/components/speaking-input/speaking-input.component';

interface ChatHistoryItem {
  questionNumber: number;
  questionText: string;
  answerText: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AudioPlayerComponent,
    ImageViewerComponent,
    ReadingPassageComponent,
    FillBlanksComponent,
    SpeakingInputComponent
  ],
  template: `
    <div class="assessment-container">
      <!-- Left Side: Section Content (60%) -->
      <div class="left-panel">
        <!-- Section Header -->
        <div class="section-header" *ngIf="currentSectionType">
          <h2 class="section-title">{{ getSectionTitle() }}</h2>
          <p class="section-instructions">{{ getSectionInstructions() }}</p>
        </div>

        <!-- Section Content Display -->
        <div class="section-content" *ngIf="currentContent">
          <app-audio-player 
            *ngIf="currentContent.type === 'audio'"
            [audioUrl]="currentContent.audioUrl || ''"
            (audioCompleted)="onAudioCompleted()">
          </app-audio-player>
          
          <app-image-viewer 
            *ngIf="currentContent.type === 'image'"
            [imageUrl]="currentContent.imageUrl || ''"
            [altText]="currentContent.title || ''">
          </app-image-viewer>
          
          <app-reading-passage 
            *ngIf="currentContent.type === 'reading'"
            [passage]="currentContent.passage || ''"
            [title]="currentContent.title || ''">
          </app-reading-passage>
        </div>

        <!-- Speaking Question Display (when current question is speaking) -->
        <div class="section-content speaking-question" *ngIf="currentSectionType === 'speaking' && currentQuestion?.questionType === 'speaking'">
          <div class="speaking-topic">
            <h3>Speaking Topic</h3>
            <div class="topic-text" [innerHTML]="formatSpeakingQuestion(currentQuestion!.text)"></div>
          </div>
        </div>

        <!-- Writing Question Display (when current question is writing) -->
        <div class="section-content writing-question" *ngIf="currentSectionType === 'writing' && currentQuestion?.questionType === 'writing'">
          <div class="writing-topic">
            <h3>Essay Question</h3>
            <div class="topic-text" [innerHTML]="formatWritingQuestion(currentQuestion!.text)"></div>
          </div>
        </div>

        <!-- MCQ/MAQ/Fill Blanks/True False Section Info -->
        <div class="section-info" *ngIf="currentSectionType === 'mcq' || currentSectionType === 'maq' || currentSectionType === 'fill_blanks' || currentSectionType === 'true_false'">
          <div class="info-icon">❓</div>
          <h3 class="info-title">{{ getSectionTitle() }}</h3>
          <p class="info-text">
            {{ getSectionInstructions() }}
          </p>
        </div>

        <!-- Writing/Speaking Section Info (no content) -->
        <div class="section-info" *ngIf="(currentSectionType === 'writing' && !currentQuestion) || (currentSectionType === 'speaking' && !currentQuestion)">
          <div class="info-icon">{{ currentSectionType === 'writing' ? '✍️' : '🎤' }}</div>
          <p class="info-text">
            {{ currentSectionType === 'writing' ? 'In this section, you will answer writing questions.' : 'In this section, you will record spoken responses.' }}
          </p>
        </div>

      </div>

      <!-- Right Side: Chat Interface (40%) -->
      <div class="right-panel" #rightPanelContainer>
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading assessment...</p>
        </div>

        <!-- Chat Messages Area -->
        <div class="chat-messages" #chatMessagesContainer>
          <!-- Welcome Message -->
          <div class="chat-message system-message" *ngIf="chatHistory.length === 0 && !currentQuestion">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="message-bubble system-bubble">
                <p class="message-text">Welcome! Let's start your assessment. The first question will appear here.</p>
              </div>
              <span class="message-time">Just now</span>
            </div>
          </div>

          <!-- Chat History -->
          <div *ngFor="let item of chatHistory; let last = last" class="chat-history-item">
            <!-- System Question -->
            <div class="chat-message system-message">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="message-bubble system-bubble">
                  <span class="question-label">Question {{ item.questionNumber }}</span>
                  <p class="message-text">{{ item.questionText }}</p>
                </div>
                <span class="message-time">{{ getCurrentTime() }}</span>
              </div>
            </div>
            
            <!-- User Answer -->
            <div class="chat-message user-message">
              <div class="message-content">
                <div class="message-bubble user-bubble">
                  <p class="message-text">{{ item.answerText }}</p>
                </div>
                <span class="message-time">{{ getCurrentTime() }}</span>
              </div>
              <div class="message-avatar user-avatar">👤</div>
            </div>
          </div>

          <!-- Current Question (shown as chat message with inline input) -->
          <ng-container *ngIf="currentQuestion && !isLoading">
            <!-- System Question -->
            <div class="chat-message system-message current-q">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="message-bubble system-bubble">
                  <span class="question-label">Question {{ currentQuestion.questionNumber }} of {{ currentQuestion.totalQuestionsInSection }}</span>
                  <p class="message-text" *ngIf="currentQuestion.questionType !== 'speaking' && currentQuestion.questionType !== 'writing'">{{ currentQuestion.text }}</p>
                  <p class="message-text" *ngIf="currentQuestion.questionType === 'speaking'" [innerHTML]="formatSpeakingInstructions(currentQuestion.text)"></p>
                  <p class="message-text" *ngIf="currentQuestion.questionType === 'writing'" [innerHTML]="formatWritingInstructions(currentQuestion.text)"></p>
                </div>
                <span class="message-time">{{ getCurrentTime() }}</span>
                
                <!-- Inline Answer Input Area -->
                <div class="inline-input-area">
                  <!-- MCQ Options as quick reply buttons -->
                  <div class="quick-reply-options" *ngIf="currentQuestion.questionType === 'mcq' || (currentQuestion.questionType === 'image' && currentQuestion.options && currentQuestion.options.length > 0)">
                    <button 
                      *ngFor="let option of currentQuestion.options; let i = index"
                      class="quick-reply-btn"
                      [class.selected]="selectedOption === option"
                      [disabled]="isSubmitting"
                      (click)="onOptionSelected(option)">
                      <span class="option-letter">{{ ['A', 'B', 'C', 'D'][i] }}</span>
                      <span class="option-text">{{ option }}</span>
                    </button>
                  </div>
                  
                  <!-- MAQ Options -->
                  <div class="quick-reply-options multi-select" *ngIf="currentQuestion.questionType === 'maq'">
                    <button 
                      *ngFor="let option of currentQuestion.options; let i = index"
                      class="quick-reply-btn"
                      [class.selected]="selectedOptions.includes(option)"
                      [disabled]="isSubmitting"
                      (click)="toggleMultiSelect(option)">
                      <span class="checkbox">{{ selectedOptions.includes(option) ? '☑' : '☐' }}</span>
                      <span class="option-text">{{ option }}</span>
                    </button>
                    <button class="send-reply-btn" [disabled]="selectedOptions.length === 0 || isSubmitting" (click)="submitAnswer()">
                      ✓ Confirm Selection
                    </button>
                  </div>
                  
                  <!-- True/False -->
                  <div class="quick-reply-options binary" *ngIf="currentQuestion.questionType === 'true_false' || currentQuestion.subQuestionType === 'true_false'">
                    <button 
                      class="quick-reply-btn"
                      [class.selected]="trueFalseAnswer === true"
                      [disabled]="isSubmitting"
                      (click)="onTrueFalseSelected(true)">
                      ✓ True
                    </button>
                    <button 
                      class="quick-reply-btn"
                      [class.selected]="trueFalseAnswer === false"
                      [disabled]="isSubmitting"
                      (click)="onTrueFalseSelected(false)">
                      ✗ False
                    </button>
                  </div>
                  
                  <!-- Writing: Text input -->
                  <div class="text-input-area" *ngIf="currentQuestion.questionType === 'writing' || (currentQuestion.questionType === 'image' && (!currentQuestion.options || currentQuestion.options.length === 0))">
                    <textarea 
                      class="chat-textarea"
                      [(ngModel)]="textAnswer"
                      [placeholder]="'Type your answer...'"
                      [disabled]="isSubmitting"
                      rows="3"></textarea>
                    <button class="send-reply-btn" [disabled]="!textAnswer.trim() || isSubmitting" (click)="submitAnswer()">
                      ➤ Send
                    </button>
                  </div>
                  
                  <!-- Speaking: Audio recorder -->
                  <div class="speaking-input-area" *ngIf="currentQuestion.questionType === 'speaking'">
                    <app-speaking-input
                      [disabled]="isSubmitting"
                      (audioRecorded)="onAudioRecorded($event)">
                    </app-speaking-input>
                    <button class="send-reply-btn" [disabled]="!audioBlob || isSubmitting" (click)="submitAnswer()">
                      ➤ Send Recording
                    </button>
                  </div>
                  
                  <!-- Fill in Blanks -->
                  <div class="fill-blanks-area" *ngIf="currentQuestion.questionType === 'fill_blanks' || currentQuestion.subQuestionType === 'fill_blanks'">
                    <app-fill-blanks
                      [sentence]="currentQuestion.text"
                      [blanks]="currentQuestion.blanks || []"
                      [disabled]="isSubmitting"
                      (answersChanged)="onBlanksChanged($event)">
                    </app-fill-blanks>
                    <button class="send-reply-btn" [disabled]="!canSubmit || isSubmitting" (click)="submitAnswer()">
                      ➤ Send Answer
                    </button>
                  </div>
                  
                  <!-- Reading/Listening Sub-questions -->
                  <ng-container *ngIf="(currentQuestion.questionType === 'reading' || currentQuestion.questionType === 'listening') && currentQuestion.subQuestionType">
                    <!-- MCQ Sub-question -->
                    <div class="quick-reply-options" *ngIf="currentQuestion.subQuestionType === 'mcq'">
                      <button 
                        *ngFor="let option of currentQuestion.options; let i = index"
                        class="quick-reply-btn"
                        [class.selected]="selectedOption === option"
                        [disabled]="isSubmitting"
                        (click)="onOptionSelected(option)">
                        <span class="option-letter">{{ ['A', 'B', 'C', 'D'][i] }}</span>
                        <span class="option-text">{{ option }}</span>
                      </button>
                    </div>
                    
                    <!-- MAQ Sub-question -->
                    <div class="quick-reply-options multi-select" *ngIf="currentQuestion.subQuestionType === 'maq'">
                      <button 
                        *ngFor="let option of currentQuestion.options; let i = index"
                        class="quick-reply-btn"
                        [class.selected]="selectedOptions.includes(option)"
                        [disabled]="isSubmitting"
                        (click)="toggleMultiSelect(option)">
                        <span class="checkbox">{{ selectedOptions.includes(option) ? '☑' : '☐' }}</span>
                        <span class="option-text">{{ option }}</span>
                      </button>
                      <button class="send-reply-btn" [disabled]="selectedOptions.length === 0 || isSubmitting" (click)="submitAnswer()">
                        ✓ Confirm Selection
                      </button>
                    </div>
                    
                    <!-- Fill Blanks Sub-question -->
                    <div class="fill-blanks-area" *ngIf="currentQuestion.subQuestionType === 'fill_blanks'">
                      <app-fill-blanks
                        [sentence]="currentQuestion.text"
                        [blanks]="currentQuestion.blanks || []"
                        [disabled]="isSubmitting"
                        (answersChanged)="onBlanksChanged($event)">
                      </app-fill-blanks>
                      <button class="send-reply-btn" [disabled]="!canSubmit || isSubmitting" (click)="submitAnswer()">
                        ➤ Send Answer
                      </button>
                    </div>
                    
                    <!-- True/False Sub-question -->
                    <div class="quick-reply-options binary" *ngIf="currentQuestion.subQuestionType === 'true_false'">
                      <button 
                        class="quick-reply-btn"
                        [class.selected]="trueFalseAnswer === true"
                        [disabled]="isSubmitting"
                        (click)="onTrueFalseSelected(true)">
                        ✓ True
                      </button>
                      <button 
                        class="quick-reply-btn"
                        [class.selected]="trueFalseAnswer === false"
                        [disabled]="isSubmitting"
                        (click)="onTrueFalseSelected(false)">
                        ✗ False
                      </button>
                    </div>
                  </ng-container>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- Typing Indicator -->
          <div class="chat-message system-message" *ngIf="isSubmitting">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Spacer for scroll -->
        <div style="height: 20px; flex-shrink: 0;"></div>
      </div>
    </div>
  `,
  styles: [`
    .assessment-container {
      display: flex;
      height: 100vh;
      background: #f5f6fa;
      overflow: hidden;
    }
    
    /* Left Panel (60%) */
    .left-panel {
      width: 60%;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-right: 1px solid #e0e0e0;
      overflow-y: auto;
    }
    
    .section-header {
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      flex-shrink: 0;
    }
    
    .section-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 700;
    }
    
    .section-instructions {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.5;
    }
    
    .section-content {
      padding: 24px;
      background: #f8f9fa;
      flex-shrink: 0;
    }
    
    .speaking-question {
      background: #f0f4ff;
      border-left: 4px solid #667eea;
    }
    
    .speaking-topic {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    .speaking-topic h3 {
      margin: 0 0 16px 0;
      color: #667eea;
      font-size: 18px;
      font-weight: 600;
    }
    
    .topic-text {
      font-size: 16px;
      line-height: 1.6;
      color: #333;
    }
    
    .topic-text strong {
      color: #667eea;
      font-weight: 600;
    }
    
    .speaking-instructions {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 16px;
      margin-top: 8px;
    }
    
    .speaking-instructions h4 {
      margin: 0 0 12px 0;
      color: #856404;
      font-size: 16px;
      font-weight: 600;
    }
    
    .speaking-instructions div {
      font-size: 14px;
      line-height: 1.5;
      color: #856404;
    }
    
    .speaking-instructions strong {
      font-weight: 600;
    }
    
    .writing-question {
      background: #f0fff4;
      border-left: 4px solid #38a169;
    }
    
    .writing-topic {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    .writing-topic h3 {
      margin: 0 0 16px 0;
      color: #38a169;
      font-size: 18px;
      font-weight: 600;
    }
    
    .writing-instructions {
      background: #e6fffa;
      border: 1px solid #81e6d9;
      border-radius: 8px;
      padding: 16px;
      margin-top: 8px;
    }
    
    .writing-instructions h4 {
      margin: 0 0 12px 0;
      color: #234e52;
      font-size: 16px;
      font-weight: 600;
    }
    
    .writing-instructions div {
      font-size: 14px;
      line-height: 1.5;
      color: #234e52;
    }
    
    .writing-instructions strong {
      font-weight: 600;
    }
    
    .section-info {
      padding: 40px 24px;
      background: #f8f9fa;
      text-align: center;
      flex-shrink: 0;
    }
    
    .info-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .info-text {
      color: #666;
      font-size: 16px;
      margin: 0;
    }
    
    .info-title {
      color: #333;
      font-size: 20px;
      font-weight: 600;
      margin: 12px 0 8px 0;
    }
    
    /* Right Panel (40%) */
    .right-panel {
      width: 40%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, #e3f2fd 0%, #f5f6fa 100%);
      overflow-y: auto;
      max-height: 100vh;
    }
    
    /* Chat Messages */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: transparent;
    }
    
    /* Chat History Item */
    .chat-history-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      animation: fadeInUp 0.3s ease-out;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Chat Message Row */
    .chat-message {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      max-width: 100%;
    }
    
    .system-message {
      align-self: flex-start;
    }
    
    .user-message {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    
    /* Avatar */
    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }
    
    .user-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    /* Message Content */
    .message-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-width: calc(100% - 50px);
    }
    
    /* Message Bubble */
    .message-bubble {
      padding: 12px 16px;
      border-radius: 18px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      position: relative;
      word-wrap: break-word;
    }
    
    .system-bubble {
      background: white;
      border-bottom-left-radius: 4px;
      color: #333;
    }
    
    .user-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom-right-radius: 4px;
      color: white;
    }
    
    .question-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .user-bubble .question-label {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .message-text {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
    }
    
    /* Message Time */
    .message-time {
      font-size: 11px;
      color: #999;
      margin: 0 4px;
    }
    
    .user-message .message-time {
      text-align: right;
    }
    
    /* Typing Indicator */
    .typing-indicator {
      background: white;
      padding: 16px 20px;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: typing 1.4s infinite;
      opacity: 0.4;
    }
    
    .typing-indicator span:nth-child(1) { animation-delay: 0s; }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes typing {
      0%, 100% { transform: translateY(0); opacity: 0.4; }
      50% { transform: translateY(-10px); opacity: 1; }
    }
    
    /* Current Question Styles */
    .current-q {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Inline Input Area */
    .inline-input-area {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #e0e0e0;
    }
    
    /* Quick Reply Buttons */
    .quick-reply-options {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .quick-reply-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: #f8f9fa;
      border: 2px solid #e0e0e0;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      font-size: 14px;
    }
    
    .quick-reply-btn:hover:not(:disabled) {
      background: #e3f2fd;
      border-color: #667eea;
      transform: translateX(4px);
    }
    
    .quick-reply-btn.selected {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #667eea;
      color: white;
    }
    
    .option-letter {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
      color: #667eea;
      flex-shrink: 0;
    }
    
    .quick-reply-btn.selected .option-letter {
      background: rgba(255, 255, 255, 0.9);
    }
    
    .option-text {
      flex: 1;
    }
    
    .checkbox {
      font-size: 16px;
      flex-shrink: 0;
    }
    
    .quick-reply-options.multi-select {
      gap: 6px;
    }
    
    .quick-reply-options.binary {
      flex-direction: row;
      gap: 10px;
    }
    
    .quick-reply-options.binary .quick-reply-btn {
      flex: 1;
      justify-content: center;
    }
    
    /* Send Reply Button */
    .send-reply-btn {
      margin-top: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      align-self: flex-start;
    }
    
    .send-reply-btn:hover:not(:disabled) {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .send-reply-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Text Input Area */
    .text-input-area {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .chat-textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 16px;
      font-size: 14px;
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
    }
    
    .chat-textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .chat-textarea:disabled {
      background: #f5f5f5;
    }
    
    /* Speaking Input Area */
    .speaking-input-area {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    /* Fill Blanks Area */
    .fill-blanks-area {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
      color: #666;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .current-question {
      display: flex;
      flex-direction: column;
      padding: 16px;
      flex-shrink: 0;
      background: white;
      border-top: 1px solid #e0e0e0;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    }
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .question-number-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .question-type-badge {
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
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
    .badge-text { background: #e5e7eb; color: #374151; }
    .badge-both { background: #fce7f3; color: #be185d; }
    
    .question-image-container {
      margin-bottom: 12px;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .question-text-container {
      background: #f8f9fa;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    
    .current-question-text {
      margin: 0;
      font-size: 14px;
      color: #333;
      line-height: 1.5;
    }
    
    .input-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .submit-container {
      margin-top: 12px;
    }
    
    .submit-btn {
      width: 100%;
      padding: 12px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 24px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .submit-btn:hover:not(:disabled) {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .submit-btn:active:not(:disabled) {
      transform: scale(0.98);
    }
    
    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Responsive adjustments */
    @media (max-width: 900px) {
      .assessment-container {
        flex-direction: column;
      }
      
      .left-panel {
        width: 100%;
        height: 50vh;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .right-panel {
        width: 100%;
        height: 50vh;
      }
    }
  `]
})
export class ChatComponent implements OnInit {
  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef;

  sessionId: string = '';
  chatHistory: ChatHistoryItem[] = [];
  
  // Current Section State
  currentSectionType: string | null = null;
  currentContent: Content | null = null;
  currentQuestion: Question | null = null;
  currentSectionId: string | null = null;
  isLoading: boolean = true;

  // Answer state variables
  selectedOption: string | null = null;
  selectedOptions: string[] = [];
  textAnswer: string = '';
  blankAnswers: Record<string, string> = {};
  trueFalseAnswer: boolean | null = null;
  audioBlob: Blob | null = null;
  isSubmitting: boolean = false;

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
    this.startAssessment();
  }

  startAssessment(): void {
    // Skip greeting and go directly to first content/question
    this.assessmentService.proceedToQuestions(this.sessionId).subscribe({
      next: (nextItem) => {
        this.isLoading = false;
        this.handleNextItem(nextItem);
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }

  loadNextItem(): void {
    this.assessmentService.getNextItem(this.sessionId).subscribe({
      next: (nextItem) => this.handleNextItem(nextItem),
      error: () => this.router.navigate(['/'])
    });
  }

  handleNextItem(nextItem: NextItem): void {
    if (!nextItem.message) return;

    switch (nextItem.itemType) {
      case 'content':
        this.currentContent = nextItem.message.content || null;
        this.currentSectionType = nextItem.message.content?.type || null;
        this.currentQuestion = null;
        // Automatically proceed to questions after showing content
        setTimeout(() => {
          this.proceedToNext();
        }, 100);
        break;

      case 'question':
        const newQuestion = nextItem.message.question || null;
        
        // Check if this is a new section
        // Section changes when question number resets to 1 or goes backward
        if (newQuestion) {
          const prevQuestionNumber = this.currentQuestion?.questionNumber || 0;
          const isNewSection = this.chatHistory.length > 0 && 
            (newQuestion.questionNumber === 1 || newQuestion.questionNumber <= prevQuestionNumber);
          
          if (isNewSection) {
            // Clear chat history for new section
            this.chatHistory = [];
            // Clear section content (will be set below based on question type)
            this.currentContent = null;
            this.currentSectionType = null;
          }
        }
        
        this.currentQuestion = newQuestion;
        this.resetAnswerState();
        
        // For reading/listening sections, the content is included in the question
        // and should be displayed in the left panel
        if (this.currentQuestion) {
          const qType = this.currentQuestion.questionType;
          if (qType === 'reading') {
            this.currentSectionType = 'reading';
            this.currentContent = {
              type: 'reading',
              passage: this.currentQuestion.passage || '',
              title: this.currentQuestion.passageTitle || 'Reading Passage'
            };
          } else if (qType === 'listening') {
            this.currentSectionType = 'listening';
            this.currentContent = {
              type: 'audio',
              audioUrl: this.currentQuestion.audioUrl || ''
            };
          } else if (qType === 'image') {
            this.currentSectionType = 'image';
            this.currentContent = {
              type: 'image',
              imageUrl: this.currentQuestion.imageUrl || '',
              title: 'Question Image'
            };
          } else if (qType === 'writing') {
            this.currentSectionType = 'writing';
            this.currentContent = null;
          } else if (qType === 'speaking') {
            this.currentSectionType = 'speaking';
            this.currentContent = null;
          } else {
            // For MCQ, MAQ, Fill Blanks, True/False - no content to display
            this.currentSectionType = qType;
            this.currentContent = null;
          }
        }
        break;

      case 'completed':
        this.assessmentService.completeAssessment(this.sessionId).subscribe();
        this.router.navigate(['/completed']);
        break;
    }

    this.scrollChatToBottom();
  }

  proceedToNext(): void {
    this.assessmentService.proceedToQuestions(this.sessionId).subscribe({
      next: (nextItem) => this.handleNextItem(nextItem)
    });
  }

  resetAnswerState(): void {
    this.selectedOption = null;
    this.selectedOptions = [];
    this.textAnswer = '';
    this.blankAnswers = {};
    this.trueFalseAnswer = null;
    this.audioBlob = null;
  }

  scrollChatToBottom(): void {
    setTimeout(() => {
      if (this.chatMessagesContainer) {
        const container = this.chatMessagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  // Split speaking question text into question and instructions
  private splitSpeakingText(text: string): { question: string; instructions: string } {
    const separator = '---';
    const parts = text.split(separator);
    
    if (parts.length >= 2) {
      return {
        question: parts[0].trim(),
        instructions: parts[1].trim()
      };
    }
    
    // If no separator found, return full text as question
    return {
      question: text,
      instructions: ''
    };
  }

  formatSpeakingQuestion(text: string): string {
    const { question } = this.splitSpeakingText(text);
    // Convert newlines to <br> and markdown bold to HTML
    return question
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  formatSpeakingInstructions(text: string): string {
    const { instructions } = this.splitSpeakingText(text);
    // Convert newlines to <br> and markdown bold to HTML
    return instructions
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // Split writing question text into question and instructions
  private splitWritingText(text: string): { question: string; instructions: string } {
    const separator = '---';
    const parts = text.split(separator);
    
    if (parts.length >= 2) {
      // First part is the essay question, second part is instructions
      return {
        question: parts[0].trim(),
        instructions: parts[1].trim()
      };
    }
    
    // If no separator found, return full text as question
    return {
      question: text,
      instructions: ''
    };
  }

  formatWritingQuestion(text: string): string {
    const { question } = this.splitWritingText(text);
    // Convert newlines to <br> and markdown bold to HTML
    return question
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  formatWritingInstructions(text: string): string {
    const { instructions } = this.splitWritingText(text);
    // Convert newlines to <br> and markdown bold to HTML
    return instructions
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  getSectionTitle(): string {
    const titles: Record<string, string> = {
      'audio': '🎧 Listening Section',
      'image': '🖼️ Visual Section',
      'reading': '📖 Reading Section',
      'writing': '✍️ Writing Section',
      'speaking': '🎤 Speaking Section',
      'mcq': '❓ Multiple Choice Section',
      'maq': '☑️ Multi-Select Section',
      'fill_blanks': '📝 Fill in the Blanks',
      'true_false': '✓ True or False'
    };
    return titles[this.currentSectionType || ''] || 'Assessment Section';
  }

  getSectionInstructions(): string {
    const instructions: Record<string, string> = {
      'audio': 'Listen carefully to the audio. You can only play it once. Questions will follow.',
      'image': 'Examine the image carefully. Answer the questions that follow based on what you see.',
      'reading': 'Read the passage carefully. The passage will remain visible while you answer questions.',
      'writing': 'Answer the writing questions with complete sentences and proper grammar.',
      'speaking': 'Record your spoken responses clearly. Each recording should be at least 30 seconds.',
      'mcq': 'Select the best answer for each question. Only one option is correct.',
      'maq': 'Select all options that apply. There may be more than one correct answer.',
      'fill_blanks': 'Fill in the missing words to complete the sentences.',
      'true_false': 'Determine if each statement is true or false.'
    };
    return instructions[this.currentSectionType || ''] || 'Complete the questions below.';
  }

  onAudioCompleted(): void {
    // Audio completed - can proceed if needed
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
      'text': 'Text Answer',
      'both': 'MCQ + Text'
    };
    return labels[type] || type;
  }

  getQuestionTypeBadgeClass(type: QuestionType): string {
    return `badge-${type}`;
  }

  // Event handlers for different question types
  onOptionSelected(option: string): void {
    this.selectedOption = option;
    // Auto-submit for MCQ questions (instant reply like chat)
    const type = this.currentQuestion?.questionType;
    const subType = this.currentQuestion?.subQuestionType;
    const effectiveType = (type === 'reading' || type === 'listening') && subType ? subType : type;
    
    if (effectiveType === 'mcq' || (type === 'image' && this.currentQuestion?.options && this.currentQuestion.options.length > 0)) {
      // Small delay to show selection before submitting
      setTimeout(() => {
        this.submitAnswer();
      }, 200);
    }
  }

  onOptionsChanged(options: string[]): void {
    this.selectedOptions = options;
  }

  toggleMultiSelect(option: string): void {
    const index = this.selectedOptions.indexOf(option);
    if (index === -1) {
      this.selectedOptions.push(option);
    } else {
      this.selectedOptions.splice(index, 1);
    }
    // Trigger change detection
    this.selectedOptions = [...this.selectedOptions];
  }

  onBlanksChanged(answers: Record<string, string>): void {
    this.blankAnswers = answers;
  }

  onTrueFalseSelected(value: boolean): void {
    this.trueFalseAnswer = value;
    this.selectedOption = value ? 'True' : 'False';
    // Auto-submit for True/False questions (instant reply like chat)
    setTimeout(() => {
      this.submitAnswer();
    }, 200);
  }

  onAudioRecorded(blob: Blob | undefined): void {
    this.audioBlob = blob || null;
    this.cdr.detectChanges();
  }

  get canSubmit(): boolean {
    if (!this.currentQuestion) return false;

    const type = this.currentQuestion.questionType;
    const subType = this.currentQuestion.subQuestionType;
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
        return Object.keys(this.blankAnswers).length > 0 &&
          Object.values(this.blankAnswers).some(v => v && v.trim().length > 0);
      case 'true_false':
        return this.trueFalseAnswer !== null;
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

    // Add question and answer to history
    this.chatHistory.push({
      questionNumber: this.currentQuestion.questionNumber,
      questionText: this.currentQuestion.text,
      answerText: answerText
    });

    // Build submit request
    const request = this.buildSubmitRequest();

    this.assessmentService.submitAnswer(request).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.scrollChatToBottom();
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
