// Question Types for the assessment
export type QuestionType =
    | 'writing'      // Text answer - user types response
    | 'speaking'     // Audio recording - user speaks response
    | 'image'        // Image-based question
    | 'mcq'          // Single choice
    | 'maq'          // Multiple choice (select all that apply)
    | 'fill_blanks'  // Fill in the blanks
    | 'true_false'   // True/False question
    | 'reading'      // Passage with sub-questions
    | 'listening'    // Audio with sub-questions
    // Legacy types for backward compatibility with existing backend
    | 'text'         // Legacy: text-only answer
    | 'both';        // Legacy: MCQ with optional text

// Sub-question types for reading and listening sections
export type SubQuestionType = 'mcq' | 'maq' | 'fill_blanks' | 'true_false';

export interface ChatMessage {
    type: 'greeting' | 'content' | 'question' | 'response' | 'completion';
    text?: string;
    content?: Content;
    question?: Question;
    progress?: Progress;
    isFromUser: boolean;
}

export interface Content {
    type: 'audio' | 'image' | 'reading';
    audioUrl?: string;
    imageUrl?: string;
    passage?: string;
    title?: string;
}

export interface BlankItem {
    id: string;
    placeholder: string;  // e.g., "___1___" or just the blank position
    correctAnswer?: string;
}

export interface Question {
    id: string;
    text: string;
    questionType: QuestionType;
    subQuestionType?: SubQuestionType;  // For reading/listening sub-questions
    options?: string[];                  // For MCQ/MAQ/True-False
    blanks?: BlankItem[];               // For fill-in-blanks
    imageUrl?: string;                  // For image questions
    audioUrl?: string;                  // For listening/speaking
    passage?: string;                   // For reading section
    passageTitle?: string;              // For reading section
    questionNumber: number;
    totalQuestionsInSection: number;
}

export interface Progress {
    currentSection: number;
    totalSections: number;
    currentQuestion: number;
    totalQuestions: number;
    percentComplete: number;
}

export interface NextItem {
    itemType: 'greeting' | 'content' | 'question' | 'completed' | 'error';
    message?: ChatMessage;
    isAssessmentComplete: boolean;
}

export interface SubmitAnswerRequest {
    sessionId: string;
    questionId: string;
    answerText?: string;                       // For writing questions
    selectedOption?: string;                   // For MCQ, True/False
    selectedOptions?: string[];                // For MAQ
    blankAnswers?: Record<string, string>;     // For fill-in-blanks { blankId: answer }
    audioBlob?: Blob;                          // For speaking questions
}

export interface AnswerResult {
    success: boolean;
    scoreEarned: number;
    nextItem?: NextItem;
}
