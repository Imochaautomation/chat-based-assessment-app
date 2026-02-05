using Microsoft.EntityFrameworkCore;
using CandidateAssessment.API.Models.Entities;

namespace CandidateAssessment.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Candidate> Candidates { get; set; }
    public DbSet<Assessment> Assessments { get; set; }
    public DbSet<Section> Sections { get; set; }
    public DbSet<AudioContent> AudioContents { get; set; }
    public DbSet<ImageContent> ImageContents { get; set; }
    public DbSet<ReadingContent> ReadingContents { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<CandidateSession> CandidateSessions { get; set; }
    public DbSet<CandidateResponse> CandidateResponses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Section -> AudioContent (one-to-one)
        modelBuilder.Entity<Section>()
            .HasOne(s => s.AudioContent)
            .WithOne(a => a.Section)
            .HasForeignKey<AudioContent>(a => a.SectionId);

        // Section -> ImageContent (one-to-one)
        modelBuilder.Entity<Section>()
            .HasOne(s => s.ImageContent)
            .WithOne(i => i.Section)
            .HasForeignKey<ImageContent>(i => i.SectionId);

        // Section -> ReadingContent (one-to-one)
        modelBuilder.Entity<Section>()
            .HasOne(s => s.ReadingContent)
            .WithOne(r => r.Section)
            .HasForeignKey<ReadingContent>(r => r.SectionId);

        // Assessment -> Sections (one-to-many)
        modelBuilder.Entity<Assessment>()
            .HasMany(a => a.Sections)
            .WithOne(s => s.Assessment)
            .HasForeignKey(s => s.AssessmentId);

        // Section -> Questions (one-to-many)
        modelBuilder.Entity<Section>()
            .HasMany(s => s.Questions)
            .WithOne(q => q.Section)
            .HasForeignKey(q => q.SectionId);

        // CandidateSession -> CandidateResponses (one-to-many)
        modelBuilder.Entity<CandidateSession>()
            .HasMany(s => s.Responses)
            .WithOne(r => r.Session)
            .HasForeignKey(r => r.SessionId);

        // Question -> CandidateResponses (one-to-many)
        modelBuilder.Entity<Question>()
            .HasMany(q => q.Responses)
            .WithOne(r => r.Question)
            .HasForeignKey(r => r.QuestionId);

        // Candidate -> CandidateSessions (one-to-many)
        modelBuilder.Entity<Candidate>()
            .HasMany(c => c.Sessions)
            .WithOne(s => s.Candidate)
            .HasForeignKey(s => s.CandidateId);

        // Assessment -> CandidateSessions (one-to-many)
        modelBuilder.Entity<Assessment>()
            .HasMany(a => a.Sessions)
            .WithOne(s => s.Assessment)
            .HasForeignKey(s => s.AssessmentId);
    }
}
