namespace CandidateAssessment.API.Models.DTOs;

public class ChatMessageDto
{
    public string Type { get; set; } = string.Empty; // "greeting", "content", "question", "response", "completion"
    public string? Text { get; set; }
    public ContentDto? Content { get; set; }
    public QuestionDto? Question { get; set; }
    public ProgressDto? Progress { get; set; }
    public bool IsFromUser { get; set; } = false;
}

public class ContentDto
{
    public string Type { get; set; } = string.Empty; // "audio", "image", "reading"
    public string? AudioUrl { get; set; }
    public string? ImageUrl { get; set; }
    public string? Passage { get; set; }
    public string? Title { get; set; }
}

public class BlankItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Placeholder { get; set; } = string.Empty;
    public string? CorrectAnswer { get; set; }
}

public class QuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    // Types: "writing", "speaking", "image", "mcq", "maq", "fill_blanks", "true_false", "reading", "listening"
    // Legacy: "text", "both"
    
    public string? SubQuestionType { get; set; } // For reading/listening sub-questions
    public List<string>? Options { get; set; } // For MCQ/MAQ
    public List<BlankItemDto>? Blanks { get; set; } // For fill_blanks
    public string? ImageUrl { get; set; } // For image questions
    public string? AudioUrl { get; set; } // For listening/speaking
    public string? Passage { get; set; } // For reading section
    public string? PassageTitle { get; set; } // For reading section
    public int QuestionNumber { get; set; }
    public int TotalQuestionsInSection { get; set; }
}

public class ProgressDto
{
    public int CurrentSection { get; set; }
    public int TotalSections { get; set; }
    public int CurrentQuestion { get; set; }
    public int TotalQuestions { get; set; }
    public double PercentComplete { get; set; }
}

public class NextItemDto
{
    public string ItemType { get; set; } = string.Empty; // "greeting", "content", "question", "completed"
    public ChatMessageDto? Message { get; set; }
    public bool IsAssessmentComplete { get; set; } = false;
}

