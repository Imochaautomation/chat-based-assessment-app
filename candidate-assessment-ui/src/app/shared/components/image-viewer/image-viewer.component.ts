import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-image-viewer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="image-viewer">
      <div class="image-container" [class.zoomed]="isZoomed" (click)="toggleZoom()">
        <img [src]="imageUrl" [alt]="altText" />
      </div>
      <p class="zoom-hint">
        {{ isZoomed ? 'Click to zoom out' : 'Click image to zoom in' }}
      </p>
    </div>
  `,
    styles: [`
    .image-viewer {
      text-align: center;
    }
    
    .image-container {
      background: #f5f5f5;
      border-radius: 12px;
      padding: 16px;
      cursor: zoom-in;
      transition: all 0.3s ease;
      overflow: hidden;
    }
    
    .image-container.zoomed {
      cursor: zoom-out;
      transform: scale(1.5);
      z-index: 10;
      position: relative;
    }
    
    .image-container img {
      max-width: 100%;
      max-height: 400px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .zoom-hint {
      color: #888;
      font-size: 13px;
      margin: 12px 0 0 0;
    }
  `]
})
export class ImageViewerComponent {
    @Input() imageUrl: string = '';
    @Input() altText: string = '';

    isZoomed = false;

    toggleZoom(): void {
        this.isZoomed = !this.isZoomed;
    }
}
