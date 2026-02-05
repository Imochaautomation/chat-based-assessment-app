using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CandidateAssessment.API.Models.Entities;

[Table("sections")]
public class Section
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("assessment_id")]
    public Guid AssessmentId { get; set; }

    [Column("type")]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // "audio", "image", "reading"

    [Column("display_order")]
    public int DisplayOrder { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("AssessmentId")]
    public Assessment? Assessment { get; set; }

    public AudioContent? AudioContent { get; set; }
    public ImageContent? ImageContent { get; set; }
    public ReadingContent? ReadingContent { get; set; }
    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
