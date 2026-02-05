using Microsoft.AspNetCore.Mvc;
using CandidateAssessment.API.Models.DTOs;
using CandidateAssessment.API.Services;

namespace CandidateAssessment.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CandidateController : ControllerBase
{
    private readonly IAssessmentService _assessmentService;

    public CandidateController(IAssessmentService assessmentService)
    {
        _assessmentService = assessmentService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<CandidateDto>> Register([FromBody] RegisterCandidateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Name is required");
        }

        var candidate = await _assessmentService.RegisterCandidateAsync(dto);
        return Ok(candidate);
    }
}
