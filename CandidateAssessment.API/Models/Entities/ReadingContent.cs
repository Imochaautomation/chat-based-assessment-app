using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CandidateAssessment.API.Models.Entities;

[Table("reading_contents")]
public class ReadingContent
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("section_id")]
    public Guid SectionId { get; set; }

    [Column("title")]
    [MaxLength(255)]
    public string? Title { get; set; }

    [Column("passage")]
    public string Passage { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("SectionId")]
    public Section? Section { get; set; }
}
