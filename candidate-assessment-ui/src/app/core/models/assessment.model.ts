export interface Assessment {
    id: string;
    title: string;
    description: string | null;
    totalSections: number;
    totalQuestions: number;
}

export interface Session {
    sessionId: string;
    candidateId: string;
    assessmentId: string;
    status: string;
    totalSections: number;
    totalQuestions: number;
}

export interface StartAssessmentRequest {
    candidateId: string;
    assessmentId: string;
}
