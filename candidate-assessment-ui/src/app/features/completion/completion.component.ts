import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-completion',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="completion-container">
      <div class="completion-card">
        <div class="success-icon">🎉</div>
        <h1>Assessment Completed!</h1>
        <p class="message">
          Thank you for completing the English Proficiency Assessment.
          Your responses have been recorded successfully.
        </p>
        <button (click)="goHome()" class="home-btn">
          Back to Home
        </button>
      </div>
    </div>
  `,
    styles: [`
    .completion-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      padding: 20px;
    }
    
    .completion-card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }
    
    .success-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }
    
    h1 {
      color: #1a1a2e;
      font-size: 28px;
      margin: 0 0 16px 0;
      font-weight: 700;
    }
    
    .message {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    
    .home-btn {
      padding: 14px 32px;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .home-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(17, 153, 142, 0.4);
    }
  `]
})
export class CompletionComponent {
    constructor(private router: Router) { }

    goHome(): void {
        this.router.navigate(['/']);
    }
}
