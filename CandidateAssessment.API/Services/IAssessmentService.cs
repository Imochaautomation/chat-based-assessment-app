using CandidateAssessment.API.Models.DTOs;
using CandidateAssessment.API.Models.Entities;

namespace CandidateAssessment.API.Services;

public interface IAssessmentService
{
    Task<CandidateDto> RegisterCandidateAsync(RegisterCandidateDto dto);
    Task<AssessmentInfoDto?> GetActiveAssessmentAsync();
    Task<SessionDto> StartAssessmentAsync(StartAssessmentDto dto);
    Task<NextItemDto> GetNextItemAsync(Guid sessionId);
    Task<AnswerResultDto> SubmitAnswerAsync(SubmitAnswerDto dto);
    Task<bool> CompleteAssessmentAsync(Guid sessionId);
    Task<NextItemDto> ProceedToQuestionsAsync(Guid sessionId);
}
