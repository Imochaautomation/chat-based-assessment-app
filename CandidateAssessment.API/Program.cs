using Microsoft.EntityFrameworkCore;
using CandidateAssessment.API.Data;
using CandidateAssessment.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database - Using InMemory for testing (switch to UseNpgsql for production)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("CandidateAssessmentDb"));

// Services
builder.Services.AddScoped<IAssessmentService, AssessmentService>();

// CORS - Allow Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS must be before other middleware
app.UseCors("AllowAngular");

// Skip HTTPS redirection in development to avoid issues
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();
    SeedData.Initialize(context);
}

app.Run();
