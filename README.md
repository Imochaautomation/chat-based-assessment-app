# Chat-Based Assessment Application

A conversational assessment platform where candidates answer audio-based, image-based, and reading-based questions through a simple chat interface.

## Tech Stack

- **Frontend**: Angular 17+ (standalone components)
- **Backend**: .NET 8 Web API
- **Database**: PostgreSQL

## Project Structure

```
Candidate-assessment/
├── CandidateAssessment.API/     # .NET 8 Backend
│   ├── Controllers/             # API endpoints
│   ├── Models/                  # Entities & DTOs
│   ├── Data/                    # DbContext & Seed
│   └── Services/               # Business logic
│
└── candidate-assessment-ui/     # Angular 17+ Frontend
    └── src/app/
        ├── core/                # Models & Services
        ├── features/            # Pages (landing, chat, completion)
        └── shared/              # Reusable components
```

## Railway Deployment

This application is configured for one-click deployment on Railway.

### Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/YOUR_TEMPLATE_URL)

Or manually:
1. Fork this repository
2. Create a new project in Railway
3. Add a PostgreSQL database service
4. Deploy from GitHub repository
5. Railway will automatically detect the `nixpacks.toml` configuration

### Environment Variables

The following environment variables are automatically configured:
- `DATABASE_URL` - PostgreSQL connection (auto-set by Railway PostgreSQL plugin)
- `ASPNETCORE_ENVIRONMENT` - Set to "Production"
- `ASPNETCORE_URLS` - Set to "http://0.0.0.0:8080"

### Deployment Architecture

- **Single Service**: Both .NET API and Angular UI run together
- **Backend**: Serves API at `/api/*` endpoints
- **Frontend**: Static files served from wwwroot, fallback to index.html for SPA routes
- **Database**: PostgreSQL with automatic connection string parsing from DATABASE_URL

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- PostgreSQL database

### Database Setup

1. Create a PostgreSQL database named `candidate_assessment`
2. Update connection string in `CandidateAssessment.API/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=YOUR_HOST;Port=5432;Database=candidate_assessment;Username=YOUR_USER;Password=YOUR_PASSWORD"
}
```

### Running the Backend

```bash
cd CandidateAssessment.API
dotnet run
```
API will be available at `http://localhost:5000`

### Running the Frontend

```bash
cd candidate-assessment-ui
npm install
npm start
```
UI will be available at `http://localhost:4200`

## Features

### Question Types
- **Audio-based**: Candidates listen to audio (one-time play) then answer questions
- **Image-based**: Zoomable image with related questions
- **Reading-based**: Passage disappears after proceeding to questions

### Assessment Flow
1. Enter name on landing page
2. Chat-based greeting and start
3. Randomized section order
4. Progress indicator throughout
5. One-way navigation (no going back)
6. Completion screen at end

### Answer Types
- Multiple choice (MCQ)
- Free text
- Both combined

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/candidate/register` | Register candidate |
| GET | `/api/assessment/active` | Get active assessment |
| POST | `/api/assessment/start` | Start session |
| GET | `/api/assessment/{sessionId}/next` | Get next item |
| POST | `/api/assessment/{sessionId}/proceed` | Proceed to questions |
| POST | `/api/response/submit` | Submit answer |
| POST | `/api/assessment/{sessionId}/complete` | Complete assessment |

## Mock Data

The application seeds with:
- 1 Assessment: "English Proficiency Assessment"
- 4 Sections: 2 audio, 1 image, 1 reading
- 18 Questions total

### Adding Real Content

Replace placeholder files in:
- `candidate-assessment-ui/src/assets/audio/` - Audio files (.mp3)
- `candidate-assessment-ui/src/assets/images/` - Image files (.jpg, .png)

## Database Tables

| Table | Purpose |
|-------|---------|
| candidates | Candidate info |
| assessments | Assessment metadata |
| sections | Content sections |
| audio_contents | Audio URLs |
| image_contents | Image URLs |
| reading_contents | Passages |
| questions | Questions & options |
| candidate_sessions | Session tracking |
| candidate_responses | All answers |
