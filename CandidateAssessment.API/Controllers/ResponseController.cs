using Microsoft.AspNetCore.Mvc;
using CandidateAssessment.API.Models.DTOs;
using CandidateAssessment.API.Services;

namespace CandidateAssessment.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResponseController : ControllerBase
{
    private readonly IAssessmentService _assessmentService;

    public ResponseController(IAssessmentService assessmentService)
    {
        _assessmentService = assessmentService;
    }

    [HttpPost("submit")]
    public async Task<ActionResult<AnswerResultDto>> SubmitAnswer([FromBody] SubmitAnswerDto dto)
    {
        var result = await _assessmentService.SubmitAnswerAsync(dto);
        if (!result.Success)
        {
            return BadRequest("Failed to submit answer");
        }
        return Ok(result);
    }

    [HttpPost("submit-audio")]
    public async Task<ActionResult<AnswerResultDto>> SubmitAudioAnswer([FromForm] SubmitAudioDto dto)
    {
        // For audio answers, we just record that the response was submitted
        // In a real application, you would save the audio file to storage
        var submitDto = new SubmitAnswerDto
        {
            SessionId = dto.SessionId,
            QuestionId = dto.QuestionId,
            AnswerText = "[Audio Response Recorded]" // Placeholder for audio transcription
        };

        var result = await _assessmentService.SubmitAnswerAsync(submitDto);
        if (!result.Success)
        {
            return BadRequest("Failed to submit audio answer");
        }
        return Ok(result);
    }
}

