using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CandidateAssessment.API.Models.Entities;

[Table("audio_contents")]
public class AudioContent
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("section_id")]
    public Guid SectionId { get; set; }

    [Column("audio_url")]
    [MaxLength(500)]
    public string AudioUrl { get; set; } = string.Empty;

    [Column("transcript")]
    public string? Transcript { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("SectionId")]
    public Section? Section { get; set; }
}
