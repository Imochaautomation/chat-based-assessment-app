import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AssessmentService } from '../../core/services';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="landing-container">
      <div class="landing-card">
        <div class="logo">
          <div class="logo-icon">📝</div>
          <h1>Assessment Portal</h1>
        </div>
        
        <p class="subtitle">Welcome to the English Proficiency Assessment</p>
        
        <form (ngSubmit)="onSubmit()" class="form">
          <div class="form-group">
            <label for="name">Your Name</label>
            <input 
              type="text" 
              id="name" 
              [(ngModel)]="candidateName" 
              name="name"
              placeholder="Enter your full name"
              required
              [disabled]="isLoading"
            />
          </div>
          
          <button type="submit" [disabled]="!candidateName.trim() || isLoading" class="submit-btn">
            <span *ngIf="!isLoading">Start Assessment</span>
            <span *ngIf="isLoading">Loading...</span>
          </button>
        </form>
        
        <p class="info">
          This assessment includes listening, visual, and reading comprehension sections.
        </p>
      </div>
    </div>
  `,
    styles: [`
    .landing-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .landing-card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }
    
    .logo {
      margin-bottom: 24px;
    }
    
    .logo-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    
    .logo h1 {
      font-size: 28px;
      color: #1a1a2e;
      margin: 0;
      font-weight: 700;
    }
    
    .subtitle {
      color: #666;
      font-size: 16px;
      margin-bottom: 32px;
    }
    
    .form {
      margin-bottom: 24px;
    }
    
    .form-group {
      text-align: left;
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .form-group input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }
    
    .form-group input:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
    
    .submit-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .info {
      color: #888;
      font-size: 13px;
      margin: 0;
    }
  `]
})
export class LandingComponent {
    candidateName = '';
    isLoading = false;

    constructor(
        private assessmentService: AssessmentService,
        private router: Router
    ) { }

    onSubmit(): void {
        if (!this.candidateName.trim()) return;

        this.isLoading = true;

        this.assessmentService.registerCandidate({
            name: this.candidateName.trim(),
            role: 'Candidate'
        }).subscribe({
            next: (candidate) => {
                this.assessmentService.getActiveAssessment().subscribe({
                    next: (assessment) => {
                        this.assessmentService.startAssessment({
                            candidateId: candidate.id,
                            assessmentId: assessment.id
                        }).subscribe({
                            next: (session) => {
                                this.router.navigate(['/chat', session.sessionId]);
                            },
                            error: () => {
                                this.isLoading = false;
                                alert('Failed to start assessment. Please try again.');
                            }
                        });
                    },
                    error: () => {
                        this.isLoading = false;
                        alert('No active assessment found.');
                    }
                });
            },
            error: () => {
                this.isLoading = false;
                alert('Failed to register. Please try again.');
            }
        });
    }
}
