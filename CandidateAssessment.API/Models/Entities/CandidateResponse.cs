using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CandidateAssessment.API.Models.Entities;

[Table("candidate_responses")]
public class CandidateResponse
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("session_id")]
    public Guid SessionId { get; set; }

    [Column("question_id")]
    public Guid QuestionId { get; set; }

    [Column("answer_text")]
    public string? AnswerText { get; set; }

    [Column("selected_option")]
    [MaxLength(255)]
    public string? SelectedOption { get; set; }

    [Column("is_correct")]
    public bool? IsCorrect { get; set; }

    [Column("score_earned")]
    public int ScoreEarned { get; set; } = 0;

    [Column("answered_at")]
    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("SessionId")]
    public CandidateSession? Session { get; set; }

    [ForeignKey("QuestionId")]
    public Question? Question { get; set; }
}
