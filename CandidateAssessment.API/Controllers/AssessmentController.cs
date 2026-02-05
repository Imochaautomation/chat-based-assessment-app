using Microsoft.AspNetCore.Mvc;
using CandidateAssessment.API.Models.DTOs;
using CandidateAssessment.API.Services;

namespace CandidateAssessment.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssessmentController : ControllerBase
{
    private readonly IAssessmentService _assessmentService;

    public AssessmentController(IAssessmentService assessmentService)
    {
        _assessmentService = assessmentService;
    }

    [HttpGet("active")]
    public async Task<ActionResult<AssessmentInfoDto>> GetActiveAssessment()
    {
        var assessment = await _assessmentService.GetActiveAssessmentAsync();
        if (assessment == null)
        {
            return NotFound("No active assessment found");
        }
        return Ok(assessment);
    }

    [HttpPost("start")]
    public async Task<ActionResult<SessionDto>> StartAssessment([FromBody] StartAssessmentDto dto)
    {
        try
        {
            var session = await _assessmentService.StartAssessmentAsync(dto);
            return Ok(session);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{sessionId}/next")]
    public async Task<ActionResult<NextItemDto>> GetNextItem(Guid sessionId)
    {
        var nextItem = await _assessmentService.GetNextItemAsync(sessionId);
        return Ok(nextItem);
    }

    [HttpPost("{sessionId}/proceed")]
    public async Task<ActionResult<NextItemDto>> ProceedToQuestions(Guid sessionId)
    {
        var nextItem = await _assessmentService.ProceedToQuestionsAsync(sessionId);
        return Ok(nextItem);
    }

    [HttpPost("{sessionId}/complete")]
    public async Task<ActionResult> CompleteAssessment(Guid sessionId)
    {
        var success = await _assessmentService.CompleteAssessmentAsync(sessionId);
        if (!success)
        {
            return NotFound("Session not found");
        }
        return Ok(new { message = "Assessment completed successfully" });
    }
}
