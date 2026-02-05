import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-audio-player',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="audio-player" [class.played]="hasPlayed">
      <div class="audio-icon">🎧</div>
      <div class="audio-content">
        <p class="label">{{ hasPlayed ? 'Audio played' : 'Listen to the audio' }}</p>
        <audio 
          #audioPlayer
          [src]="audioUrl" 
          (ended)="onAudioEnded()"
          (play)="onAudioPlay()"
          [controls]="!hasPlayed"
          controlsList="nodownload noplaybackrate"
        ></audio>
        <p *ngIf="hasPlayed" class="played-msg">
          ✓ Audio has been played. You cannot replay it.
        </p>
      </div>
    </div>
  `,
    styles: [`
    .audio-player {
      background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    
    .audio-player.played {
      opacity: 0.8;
    }
    
    .audio-icon {
      font-size: 32px;
    }
    
    .audio-content {
      flex: 1;
    }
    
    .label {
      font-weight: 600;
      color: #333;
      margin: 0 0 12px 0;
    }
    
    audio {
      width: 100%;
      border-radius: 8px;
    }
    
    .played-msg {
      color: #11998e;
      font-size: 14px;
      margin: 12px 0 0 0;
      font-weight: 500;
    }
  `]
})
export class AudioPlayerComponent {
    @Input() audioUrl: string = '';
    @Output() audioCompleted = new EventEmitter<void>();

    hasPlayed = false;

    onAudioPlay(): void {
        // Disable further plays after first play
    }

    onAudioEnded(): void {
        this.hasPlayed = true;
        this.audioCompleted.emit();
    }
}
