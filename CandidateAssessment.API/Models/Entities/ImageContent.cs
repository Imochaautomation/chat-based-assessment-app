using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CandidateAssessment.API.Models.Entities;

[Table("image_contents")]
public class ImageContent
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("section_id")]
    public Guid SectionId { get; set; }

    [Column("image_url")]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [Column("alt_text")]
    [MaxLength(500)]
    public string? AltText { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("SectionId")]
    public Section? Section { get; set; }
}
