import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { ChatComponent } from './features/chat/chat.component';
import { CompletionComponent } from './features/completion/completion.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'chat/:sessionId', component: ChatComponent },
    { path: 'completed', component: CompletionComponent },
    { path: '**', redirectTo: '' }
];
