using System.Text.Json;
using CandidateAssessment.API.Models.Entities;

namespace CandidateAssessment.API.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext context)
    {
        // Check if data already exists
        if (context.Assessments.Any())
        {
            return;
        }

        // Create Assessment
        var assessment = new Assessment
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Title = "English Proficiency Assessment",
            Description = "A comprehensive assessment testing listening, visual comprehension, reading, and writing skills.",
            IsActive = true
        };
        context.Assessments.Add(assessment);

        // Create Sections with randomizable order
        var sections = new List<Section>();

        // Audio/Listening Section
        var audioSection = new Section
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222221"),
            AssessmentId = assessment.Id,
            Type = "audio",
            DisplayOrder = 1
        };
        sections.Add(audioSection);

        // Speaking Section
        var speakingSection = new Section
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            AssessmentId = assessment.Id,
            Type = "speaking",
            DisplayOrder = 2
        };
        sections.Add(speakingSection);

        // Image Section
        var imageSection = new Section
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            AssessmentId = assessment.Id,
            Type = "image",
            DisplayOrder = 3
        };
        sections.Add(imageSection);

        // Reading Section
        var readingSection = new Section
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            AssessmentId = assessment.Id,
            Type = "reading",
            DisplayOrder = 4
        };
        sections.Add(readingSection);

        // Writing Section
        var writingSection = new Section
        {
            Id = Guid.Parse("55555555-1111-1111-1111-111111111111"),
            AssessmentId = assessment.Id,
            Type = "writing",
            DisplayOrder = 5
        };
        sections.Add(writingSection);

        context.Sections.AddRange(sections);

        // Audio Content - Using the provided MP3 file
        context.AudioContents.Add(new AudioContent
        {
            Id = Guid.NewGuid(),
            SectionId = audioSection.Id,
            AudioUrl = "/assets/audio/listening-audio.mp3",
            Transcript = "Meeting discussion about sales performance, customer support improvements, and quarterly results."
        });

        // Image Content - Horse grazing on green grass
        context.ImageContents.Add(new ImageContent
        {
            Id = Guid.NewGuid(),
            SectionId = imageSection.Id,
            ImageUrl = "/assets/images/horse-grazing.jpg",
            AltText = "A horse eating grass on a green field"
        });

        // Reading Content
        context.ReadingContents.Add(new ReadingContent
        {
            Id = Guid.NewGuid(),
            SectionId = readingSection.Id,
            Title = "The Future of Renewable Energy",
            Passage = @"The transition to renewable energy sources represents one of the most significant shifts in human history. As concerns about climate change intensify and fossil fuel reserves diminish, nations worldwide are investing heavily in solar, wind, and hydroelectric power.

Solar energy has seen remarkable growth in recent years. The cost of photovoltaic panels has dropped by over 80% in the last decade, making solar power increasingly competitive with traditional energy sources. Countries like Germany and China have emerged as leaders in solar installation, while developing nations are leapfrogging traditional infrastructure to embrace clean energy directly.

Wind power, too, has expanded dramatically. Offshore wind farms now dot coastlines from the North Sea to the shores of Asia, generating electricity for millions of homes. Advances in turbine technology have made wind energy more efficient than ever, with modern turbines capable of generating power even in low-wind conditions.

However, challenges remain. The intermittent nature of renewable sources requires innovative storage solutions and grid modernization. Battery technology is evolving rapidly, with new lithium-ion and solid-state batteries promising longer storage capacity and faster charging times.

The economic implications are profound. The renewable energy sector now employs more workers than the fossil fuel industry in many countries. This transition creates opportunities for job creation, economic growth, and energy independence."
        });

        // Questions for Audio/Listening Section - MCQ and MAQ questions about the meeting
        var audioQuestions = new List<Question>
        {
            new Question
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555501"),
                SectionId = audioSection.Id,
                QuestionText = "Which statements are correct about today's meeting?",
                QuestionType = "maq",
                Options = JsonSerializer.Serialize(new[] {
                    "A) Sales went up last quarter, but some problems remained.",
                    "B) Customer support was not discussed in the meeting.",
                    "C) The team plans to improve how they help customers this quarter.",
                    "D) No action was decided during the meeting."
                }),
                CorrectAnswer = "A,C",
                DisplayOrder = 1
            },
            new Question
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555502"),
                SectionId = audioSection.Id,
                QuestionText = "Which statements are correct about the last quarter?",
                QuestionType = "maq",
                Options = JsonSerializer.Serialize(new[] {
                    "A) Several actions were agreed upon.",
                    "B) Last quarter's results were all positive.",
                    "C) The meeting was about next year's budget.",
                    "D) Response times were slower than the target."
                }),
                CorrectAnswer = "B,D",
                DisplayOrder = 2
            },
            new Question
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555503"),
                SectionId = audioSection.Id,
                QuestionText = "How does the speaker view the sales performance overall?",
                QuestionType = "mcq",
                Options = JsonSerializer.Serialize(new[] {
                    "A) As disappointing despite expectations",
                    "B) As positive but needing further improvement",
                    "C) As unchanged from previous quarters",
                    "D) As unrelated to customer satisfaction"
                }),
                CorrectAnswer = "B",
                DisplayOrder = 3
            }
        };

        // Questions for Speaking Section
        var speakingQuestions = new List<Question>
        {
            new Question
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555601"),
                SectionId = speakingSection.Id,
                QuestionText = @"Please speak into the microphone.

Talk about activities you do to relax after work. Your response can include the following points:

• What type of activities do you like to do after work?
• Is there a specific time you usually start relaxing?
• Do you usually do these activities alone or with others?
• How do these activities help you relax?

---

**Instructions:**
For our NLP models to work accurately, you need to speak for a minimum of 1 minute.
The timer at the bottom of the screen would help you to keep track of your progress.
Start speaking at the end of the countdown. Best of luck!",
                QuestionType = "speaking",
                DisplayOrder = 1
            }
        };

        // Questions for Image Section - Horse grazing image
        var imageQuestions = new List<Question>
        {
            // Speaking question - describe the image
            new Question
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666661"),
                SectionId = imageSection.Id,
                QuestionText = @"Please look at the camera and speak into the microphone.

Look at the image and describe what you see:

• What can you see in the photo?
• Where is the scene taking place?
• What is the animal doing?
• Describe the environment and surroundings.

---

**Instructions:**
For our NLP models to work accurately, you need to speak for a minimum of 1 minute.
The timer at the bottom of the screen would help you to keep track of your progress.
Start speaking at the end of the countdown. Best of luck!",
                QuestionType = "speaking",
                DisplayOrder = 1
            }
        };

        // Questions for Reading Section
        var readingQuestions = new List<Question>
        {
            new Question
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777771"),
                SectionId = readingSection.Id,
                QuestionText = "What has happened to the cost of solar panels over the last decade?",
                QuestionType = "mcq",
                Options = JsonSerializer.Serialize(new[] {
                    "A) Increased by 80%",
                    "B) Dropped by over 80%",
                    "C) Remained stable",
                    "D) Fluctuated unpredictably"
                }),
                CorrectAnswer = "B",
                DisplayOrder = 1
            },
            new Question
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777772"),
                SectionId = readingSection.Id,
                QuestionText = "Which countries are mentioned as leaders in solar installation?",
                QuestionType = "mcq",
                Options = JsonSerializer.Serialize(new[] {
                    "A) USA and UK",
                    "B) Germany and China",
                    "C) India and Japan",
                    "D) France and Italy"
                }),
                CorrectAnswer = "B",
                DisplayOrder = 2
            },
            new Question
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777773"),
                SectionId = readingSection.Id,
                QuestionText = "The renewable energy sector employs more workers than the fossil fuel industry in many countries.",
                QuestionType = "true_false",
                CorrectAnswer = "True",
                DisplayOrder = 3
            }
        };

        // Questions for Writing Section - Essay
        var writingQuestions = new List<Question>
        {
            new Question
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888801"),
                SectionId = writingSection.Id,
                QuestionText = @"Essay: Write 100–120 words answering this question:

Should companies provide paid time for employees to learn new skills? Give your opinion and explain how it can benefit both the employee and the company.

---

**Instruction:** We recommend writing a minimum of 100 words to help our evaluation engine assess your response effectively and score accurately. A short response may lead to lower scores.

**Note:** Our NLP model excludes special characters from the submitted answer to generate an accurate result. Please avoid excessive use to get an accurate score.

---

Many people learn important skills in the workplace. Write about a work-related skill that you think is useful in your job. Your essay can include the following points:

• Describe the skill and where you learned it.
• Explain why this skill is important at work.
• Give one example of how it is used in your job.",
                QuestionType = "writing",
                DisplayOrder = 1
            }
        };

        context.Questions.AddRange(audioQuestions);
        context.Questions.AddRange(speakingQuestions);
        context.Questions.AddRange(imageQuestions);
        context.Questions.AddRange(readingQuestions);
        context.Questions.AddRange(writingQuestions);

        context.SaveChanges();
    }
}
