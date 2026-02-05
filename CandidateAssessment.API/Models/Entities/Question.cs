using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CandidateAssessment.API.Models.Entities;

[Table("questions")]
public class Question
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("section_id")]
    public Guid SectionId { get; set; }

    [Required]
    [Column("question_text")]
    public string QuestionText { get; set; } = string.Empty;

    [Column("question_type")]
    [MaxLength(50)]
    public string QuestionType { get; set; } = "text"; 
    // Types: "writing", "speaking", "image", "mcq", "maq", "fill_blanks", "true_false", "reading", "listening"
    // Legacy types: "text", "both"

    [Column("sub_question_type")]
    [MaxLength(50)]
    public string? SubQuestionType { get; set; } // For reading/listening: "mcq", "maq", "fill_blanks", "true_false"

    [Column("options", TypeName = "jsonb")]
    public string? Options { get; set; } // JSON array for MCQ/MAQ options

    [Column("blanks", TypeName = "jsonb")]
    public string? Blanks { get; set; } // JSON array for fill-in-blanks [{id, placeholder, correctAnswer}]

    [Column("correct_answer")]
    public string? CorrectAnswer { get; set; }

    [Column("image_url")]
    public string? ImageUrl { get; set; } // For image-based questions

    [Column("audio_url")]
    public string? AudioUrl { get; set; } // For listening/speaking questions

    [Column("passage")]
    public string? Passage { get; set; } // For reading section questions

    [Column("passage_title")]
    public string? PassageTitle { get; set; }

    [Column("score")]
    public int Score { get; set; } = 1;

    [Column("display_order")]
    public int DisplayOrder { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("SectionId")]
    public Section? Section { get; set; }

    public ICollection<CandidateResponse> Responses { get; set; } = new List<CandidateResponse>();
}

