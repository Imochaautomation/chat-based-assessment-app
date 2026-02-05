namespace CandidateAssessment.API.Models.DTOs;

public class StartAssessmentDto
{
    public Guid CandidateId { get; set; }
    public Guid AssessmentId { get; set; }
}

public class SessionDto
{
    public Guid SessionId { get; set; }
    public Guid CandidateId { get; set; }
    public Guid AssessmentId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalSections { get; set; }
    public int TotalQuestions { get; set; }
}

public class AssessmentInfoDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int TotalSections { get; set; }
    public int TotalQuestions { get; set; }
}
