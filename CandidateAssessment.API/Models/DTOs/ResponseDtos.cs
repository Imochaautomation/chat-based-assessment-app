namespace CandidateAssessment.API.Models.DTOs;

public class SubmitAnswerDto
{
    public Guid SessionId { get; set; }
    public Guid QuestionId { get; set; }
    public string? AnswerText { get; set; }                           // For writing/text questions
    public string? SelectedOption { get; set; }                       // For MCQ, True/False
    public List<string>? SelectedOptions { get; set; }                // For MAQ
    public Dictionary<string, string>? BlankAnswers { get; set; }     // For fill-in-blanks
}

public class SubmitAudioDto
{
    public Guid SessionId { get; set; }
    public Guid QuestionId { get; set; }
    public IFormFile? Audio { get; set; }  // The audio file from form data
}

public class AnswerResultDto
{
    public bool Success { get; set; }
    public int ScoreEarned { get; set; }
    public NextItemDto? NextItem { get; set; }
}


