import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    Candidate,
    RegisterCandidateRequest,
    Assessment,
    Session,
    StartAssessmentRequest,
    NextItem,
    SubmitAnswerRequest,
    AnswerResult
} from '../models';

@Injectable({
    providedIn: 'root'
})
export class AssessmentService {
    private apiUrl = 'http://localhost:5000/api';

    constructor(private http: HttpClient) { }

    registerCandidate(request: RegisterCandidateRequest): Observable<Candidate> {
        return this.http.post<Candidate>(`${this.apiUrl}/candidate/register`, request);
    }

    getActiveAssessment(): Observable<Assessment> {
        return this.http.get<Assessment>(`${this.apiUrl}/assessment/active`);
    }

    startAssessment(request: StartAssessmentRequest): Observable<Session> {
        return this.http.post<Session>(`${this.apiUrl}/assessment/start`, request);
    }

    getNextItem(sessionId: string): Observable<NextItem> {
        return this.http.get<NextItem>(`${this.apiUrl}/assessment/${sessionId}/next`);
    }

    proceedToQuestions(sessionId: string): Observable<NextItem> {
        return this.http.post<NextItem>(`${this.apiUrl}/assessment/${sessionId}/proceed`, {});
    }

    submitAnswer(request: SubmitAnswerRequest): Observable<AnswerResult> {
        // For speaking questions with audio blob, use FormData
        if (request.audioBlob) {
            const formData = new FormData();
            formData.append('sessionId', request.sessionId);
            formData.append('questionId', request.questionId);
            formData.append('audio', request.audioBlob, 'recording.webm');
            return this.http.post<AnswerResult>(`${this.apiUrl}/response/submit-audio`, formData);
        }

        // For other question types, send as JSON
        const jsonRequest: any = {
            sessionId: request.sessionId,
            questionId: request.questionId
        };

        if (request.answerText) {
            jsonRequest.answerText = request.answerText;
        }
        if (request.selectedOption) {
            jsonRequest.selectedOption = request.selectedOption;
        }
        if (request.selectedOptions && request.selectedOptions.length > 0) {
            jsonRequest.selectedOptions = request.selectedOptions;
        }
        if (request.blankAnswers && Object.keys(request.blankAnswers).length > 0) {
            jsonRequest.blankAnswers = request.blankAnswers;
        }

        return this.http.post<AnswerResult>(`${this.apiUrl}/response/submit`, jsonRequest);
    }

    completeAssessment(sessionId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/assessment/${sessionId}/complete`, {});
    }
}

