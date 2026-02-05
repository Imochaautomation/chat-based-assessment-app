using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using CandidateAssessment.API.Data;
using CandidateAssessment.API.Models.DTOs;
using CandidateAssessment.API.Models.Entities;

namespace CandidateAssessment.API.Services;

public class AssessmentService : IAssessmentService
{
    private readonly AppDbContext _context;
    private readonly Random _random = new Random();

    public AssessmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CandidateDto> RegisterCandidateAsync(RegisterCandidateDto dto)
    {
        var candidate = new Candidate
        {
            Name = dto.Name,
            Role = dto.Role
        };

        _context.Candidates.Add(candidate);
        await _context.SaveChangesAsync();

        return new CandidateDto
        {
            Id = candidate.Id,
            Name = candidate.Name,
            Role = candidate.Role
        };
    }

    public async Task<AssessmentInfoDto?> GetActiveAssessmentAsync()
    {
        var assessment = await _context.Assessments
            .Include(a => a.Sections)
                .ThenInclude(s => s.Questions)
            .FirstOrDefaultAsync(a => a.IsActive);

        if (assessment == null) return null;

        return new AssessmentInfoDto
        {
            Id = assessment.Id,
            Title = assessment.Title,
            Description = assessment.Description,
            TotalSections = assessment.Sections.Count,
            TotalQuestions = assessment.Sections.Sum(s => s.Questions.Count)
        };
    }

    public async Task<SessionDto> StartAssessmentAsync(StartAssessmentDto dto)
    {
        var assessment = await _context.Assessments
            .Include(a => a.Sections)
                .ThenInclude(s => s.Questions)
            .FirstOrDefaultAsync(a => a.Id == dto.AssessmentId);

        if (assessment == null)
            throw new Exception("Assessment not found");

        // Randomize section order
        var sectionIds = assessment.Sections
            .OrderBy(_ => _random.Next())
            .Select(s => s.Id)
            .ToList();

        var session = new CandidateSession
        {
            CandidateId = dto.CandidateId,
            AssessmentId = dto.AssessmentId,
            Status = "in_progress",
            CurrentSectionIndex = -1, // Start at -1 to show greeting first
            CurrentQuestionIndex = -1, // -1 means content needs to be shown
            SectionOrder = JsonSerializer.Serialize(sectionIds)
        };

        _context.CandidateSessions.Add(session);
        await _context.SaveChangesAsync();

        return new SessionDto
        {
            SessionId = session.Id,
            CandidateId = session.CandidateId,
            AssessmentId = session.AssessmentId,
            Status = session.Status,
            TotalSections = assessment.Sections.Count,
            TotalQuestions = assessment.Sections.Sum(s => s.Questions.Count)
        };
    }

    public async Task<NextItemDto> GetNextItemAsync(Guid sessionId)
    {
        var session = await GetSessionWithDetailsAsync(sessionId);
        if (session == null)
            return new NextItemDto { ItemType = "error", IsAssessmentComplete = false };

        var sectionOrder = JsonSerializer.Deserialize<List<Guid>>(session.SectionOrder ?? "[]") ?? new List<Guid>();
        var totalSections = sectionOrder.Count;

        // Calculate total questions for progress
        var allSections = await _context.Sections
            .Include(s => s.Questions)
            .Where(s => sectionOrder.Contains(s.Id))
            .ToListAsync();
        var totalQuestions = allSections.Sum(s => s.Questions.Count);
        var answeredCount = await _context.CandidateResponses.CountAsync(r => r.SessionId == sessionId);

        // Show greeting first
        if (session.CurrentSectionIndex == -1)
        {
            return new NextItemDto
            {
                ItemType = "greeting",
                Message = new ChatMessageDto
                {
                    Type = "greeting",
                    Text = $"Hello {session.Candidate?.Name ?? "there"}! 👋\n\nWelcome to the English Proficiency Assessment. This assessment includes listening, visual comprehension, and reading sections.\n\nAre you ready to begin?",
                    Progress = new ProgressDto
                    {
                        CurrentSection = 0,
                        TotalSections = totalSections,
                        CurrentQuestion = 0,
                        TotalQuestions = totalQuestions,
                        PercentComplete = 0
                    }
                }
            };
        }

        // Check if all sections are complete
        if (session.CurrentSectionIndex >= totalSections)
        {
            return new NextItemDto
            {
                ItemType = "completed",
                IsAssessmentComplete = true,
                Message = new ChatMessageDto
                {
                    Type = "completion",
                    Text = "🎉 Congratulations! You have completed the assessment.\n\nThank you for your participation.",
                    Progress = new ProgressDto
                    {
                        CurrentSection = totalSections,
                        TotalSections = totalSections,
                        CurrentQuestion = totalQuestions,
                        TotalQuestions = totalQuestions,
                        PercentComplete = 100
                    }
                }
            };
        }

        var currentSectionId = sectionOrder[session.CurrentSectionIndex];
        var currentSection = await _context.Sections
            .Include(s => s.AudioContent)
            .Include(s => s.ImageContent)
            .Include(s => s.ReadingContent)
            .Include(s => s.Questions.OrderBy(q => q.DisplayOrder))
            .FirstOrDefaultAsync(s => s.Id == currentSectionId);

        if (currentSection == null)
            return new NextItemDto { ItemType = "error", IsAssessmentComplete = false };

        // Show content if question index is -1 (but skip for speaking/writing sections)
        if (session.CurrentQuestionIndex == -1)
        {
            // Speaking and writing sections have no content to display - go straight to questions
            if (currentSection.Type == "speaking" || currentSection.Type == "writing")
            {
                session.CurrentQuestionIndex = 0;
                await _context.SaveChangesAsync();
                return await GetNextItemAsync(sessionId);
            }

            var content = GetContentDto(currentSection);
            return new NextItemDto
            {
                ItemType = "content",
                Message = new ChatMessageDto
                {
                    Type = "content",
                    Text = GetContentIntroText(currentSection.Type),
                    Content = content,
                    Progress = GetProgress(session.CurrentSectionIndex, totalSections, answeredCount, totalQuestions)
                }
            };
        }

        // Show question
        var questions = currentSection.Questions.OrderBy(q => q.DisplayOrder).ToList();
        if (session.CurrentQuestionIndex >= questions.Count)
        {
            // Move to next section
            session.CurrentSectionIndex++;
            session.CurrentQuestionIndex = -1;
            await _context.SaveChangesAsync();
            return await GetNextItemAsync(sessionId);
        }

        var question = questions[session.CurrentQuestionIndex];
        
        // Parse blanks JSON if present
        List<BlankItemDto>? blanks = null;
        if (!string.IsNullOrEmpty(question.Blanks))
        {
            try
            {
                blanks = JsonSerializer.Deserialize<List<BlankItemDto>>(question.Blanks);
            }
            catch { /* Ignore parsing errors */ }
        }
        
        return new NextItemDto
        {
            ItemType = "question",
            Message = new ChatMessageDto
            {
                Type = "question",
                Question = new QuestionDto
                {
                    Id = question.Id,
                    Text = question.QuestionText,
                    QuestionType = question.QuestionType,
                    SubQuestionType = question.SubQuestionType,
                    Options = string.IsNullOrEmpty(question.Options) 
                        ? null 
                        : JsonSerializer.Deserialize<List<string>>(question.Options),
                    Blanks = blanks,
                    ImageUrl = question.ImageUrl,
                    AudioUrl = question.AudioUrl,
                    Passage = question.Passage,
                    PassageTitle = question.PassageTitle,
                    QuestionNumber = session.CurrentQuestionIndex + 1,
                    TotalQuestionsInSection = questions.Count
                },
                Progress = GetProgress(session.CurrentSectionIndex, totalSections, answeredCount, totalQuestions)
            }
        };
    }

    public async Task<NextItemDto> ProceedToQuestionsAsync(Guid sessionId)
    {
        var session = await _context.CandidateSessions.FindAsync(sessionId);
        if (session == null)
            return new NextItemDto { ItemType = "error", IsAssessmentComplete = false };

        // If we're at greeting, move to first section
        if (session.CurrentSectionIndex == -1)
        {
            session.CurrentSectionIndex = 0;
            session.CurrentQuestionIndex = -1;
        }
        // If we're at content, move to questions
        else if (session.CurrentQuestionIndex == -1)
        {
            session.CurrentQuestionIndex = 0;
        }

        await _context.SaveChangesAsync();
        return await GetNextItemAsync(sessionId);
    }

    public async Task<AnswerResultDto> SubmitAnswerAsync(SubmitAnswerDto dto)
    {
        var session = await _context.CandidateSessions.FindAsync(dto.SessionId);
        if (session == null)
            return new AnswerResultDto { Success = false };

        var question = await _context.Questions.FindAsync(dto.QuestionId);
        if (question == null)
            return new AnswerResultDto { Success = false };

        // Check if correct based on question type
        bool? isCorrect = null;
        int scoreEarned = 0;

        switch (question.QuestionType)
        {
            case "mcq":
            case "both":
                if (!string.IsNullOrEmpty(dto.SelectedOption) && !string.IsNullOrEmpty(question.CorrectAnswer))
                {
                    isCorrect = dto.SelectedOption.StartsWith(question.CorrectAnswer, StringComparison.OrdinalIgnoreCase);
                    scoreEarned = isCorrect == true ? question.Score : 0;
                }
                break;

            case "true_false":
                if (!string.IsNullOrEmpty(dto.SelectedOption) && !string.IsNullOrEmpty(question.CorrectAnswer))
                {
                    isCorrect = dto.SelectedOption.Equals(question.CorrectAnswer, StringComparison.OrdinalIgnoreCase);
                    scoreEarned = isCorrect == true ? question.Score : 0;
                }
                break;

            case "maq":
                // For MAQ, check if all correct options are selected
                if (dto.SelectedOptions != null && !string.IsNullOrEmpty(question.CorrectAnswer))
                {
                    var correctOptions = question.CorrectAnswer.Split(',').Select(o => o.Trim()).ToHashSet();
                    var selectedSet = dto.SelectedOptions.ToHashSet();
                    isCorrect = correctOptions.SetEquals(selectedSet);
                    scoreEarned = isCorrect == true ? question.Score : 0;
                }
                break;

            case "fill_blanks":
                // For fill in blanks, check each blank answer
                if (dto.BlankAnswers != null && !string.IsNullOrEmpty(question.Blanks))
                {
                    try
                    {
                        var blanks = JsonSerializer.Deserialize<List<BlankItemDto>>(question.Blanks);
                        if (blanks != null)
                        {
                            int correctBlanks = blanks.Count(b => 
                                dto.BlankAnswers.TryGetValue(b.Id, out var answer) && 
                                !string.IsNullOrEmpty(b.CorrectAnswer) &&
                                answer.Equals(b.CorrectAnswer, StringComparison.OrdinalIgnoreCase));
                            isCorrect = correctBlanks == blanks.Count;
                            scoreEarned = isCorrect == true ? question.Score : 0;
                        }
                    }
                    catch { /* Ignore parsing errors */ }
                }
                break;

            // For writing, speaking, image - no auto-scoring
            default:
                break;
        }

        // Build answer text for storage
        string? storedAnswerText = dto.AnswerText;
        if (dto.SelectedOptions != null && dto.SelectedOptions.Count > 0)
        {
            storedAnswerText = string.Join(", ", dto.SelectedOptions);
        }
        else if (dto.BlankAnswers != null && dto.BlankAnswers.Count > 0)
        {
            storedAnswerText = JsonSerializer.Serialize(dto.BlankAnswers);
        }

        var response = new CandidateResponse
        {
            SessionId = dto.SessionId,
            QuestionId = dto.QuestionId,
            AnswerText = storedAnswerText,
            SelectedOption = dto.SelectedOption,
            IsCorrect = isCorrect,
            ScoreEarned = scoreEarned
        };

        _context.CandidateResponses.Add(response);

        // Move to next question
        session.CurrentQuestionIndex++;
        await _context.SaveChangesAsync();

        var nextItem = await GetNextItemAsync(dto.SessionId);

        return new AnswerResultDto
        {
            Success = true,
            ScoreEarned = scoreEarned,
            NextItem = nextItem
        };
    }

    public async Task<bool> CompleteAssessmentAsync(Guid sessionId)
    {
        var session = await _context.CandidateSessions.FindAsync(sessionId);
        if (session == null) return false;

        session.Status = "completed";
        session.CompletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<CandidateSession?> GetSessionWithDetailsAsync(Guid sessionId)
    {
        return await _context.CandidateSessions
            .Include(s => s.Candidate)
            .Include(s => s.Assessment)
            .FirstOrDefaultAsync(s => s.Id == sessionId);
    }

    private ContentDto GetContentDto(Section section)
    {
        return section.Type switch
        {
            "audio" => new ContentDto
            {
                Type = "audio",
                AudioUrl = section.AudioContent?.AudioUrl
            },
            "image" => new ContentDto
            {
                Type = "image",
                ImageUrl = section.ImageContent?.ImageUrl,
                Title = section.ImageContent?.AltText
            },
            "reading" => new ContentDto
            {
                Type = "reading",
                Passage = section.ReadingContent?.Passage,
                Title = section.ReadingContent?.Title
            },
            _ => new ContentDto { Type = "unknown" }
        };
    }

    private string GetContentIntroText(string sectionType)
    {
        return sectionType switch
        {
            "audio" => "🎧 **Listening Section**\n\nPlease listen carefully to the following audio. Note: You can only play the audio once.",
            "image" => "🖼️ **Visual Section**\n\nPlease examine the following image carefully. You can zoom in for a closer look.",
            "reading" => "📖 **Reading Section**\n\nPlease read the following passage carefully. The passage will disappear once you proceed to questions.",
            _ => "Please review the following content."
        };
    }

    private ProgressDto GetProgress(int currentSection, int totalSections, int answeredQuestions, int totalQuestions)
    {
        double percent = totalQuestions > 0 ? (double)answeredQuestions / totalQuestions * 100 : 0;
        return new ProgressDto
        {
            CurrentSection = currentSection + 1,
            TotalSections = totalSections,
            CurrentQuestion = answeredQuestions,
            TotalQuestions = totalQuestions,
            PercentComplete = Math.Round(percent, 1)
        };
    }
}
