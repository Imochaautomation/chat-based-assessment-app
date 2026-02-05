namespace CandidateAssessment.API.Models.DTOs;

public class RegisterCandidateDto
{
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "Candidate";
}

public class CandidateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
