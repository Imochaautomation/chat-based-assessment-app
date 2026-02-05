import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-reading-passage',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="reading-passage">
      <div class="passage-header">
        <span class="icon">📖</span>
        <h3>{{ title || 'Reading Passage' }}</h3>
      </div>
      <div class="passage-content">
        <p>{{ passage }}</p>
      </div>
    </div>
  `,
    styles: [`
    .reading-passage {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      padding: 24px;
      border-left: 4px solid #667eea;
    }
    
    .passage-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .icon {
      font-size: 24px;
    }
    
    h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }
    
    .passage-content {
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .passage-content p {
      margin: 0;
      color: #444;
      line-height: 1.8;
      font-size: 15px;
      white-space: pre-wrap;
    }
  `]
})
export class ReadingPassageComponent {
    @Input() passage: string = '';
    @Input() title: string = '';
}
