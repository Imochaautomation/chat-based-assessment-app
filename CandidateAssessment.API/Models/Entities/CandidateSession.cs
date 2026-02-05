using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CandidateAssessment.API.Models.Entities;

[Table("candidate_sessions")]
public class CandidateSession
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("candidate_id")]
    public Guid CandidateId { get; set; }

    [Column("assessment_id")]
    public Guid AssessmentId { get; set; }

    [Column("status")]
    [MaxLength(50)]
    public string Status { get; set; } = "in_progress"; // "in_progress", "completed"

    [Column("current_section_index")]
    public int CurrentSectionIndex { get; set; } = 0;

    [Column("current_question_index")]
    public int CurrentQuestionIndex { get; set; } = 0;

    [Column("section_order", TypeName = "jsonb")]
    public string? SectionOrder { get; set; } // JSON array of section IDs in randomized order

    [Column("started_at")]
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    [Column("completed_at")]
    public DateTime? CompletedAt { get; set; }

    // Navigation
    [ForeignKey("CandidateId")]
    public Candidate? Candidate { get; set; }

    [ForeignKey("AssessmentId")]
    public Assessment? Assessment { get; set; }

    public ICollection<CandidateResponse> Responses { get; set; } = new List<CandidateResponse>();
}
