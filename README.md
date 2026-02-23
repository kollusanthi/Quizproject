# Personalized Learning Progress & Recommendation System

**AU Campus Recruitment 2026 - Full Stack Developer Assessment**

A comprehensive learning platform that tracks student performance and provides adaptive learning recommendations using machine learning techniques.

## Project Overview

This application implements a full-stack personalized learning platform with the following features:

- **Quiz System**: Interactive quizzes across multiple topics and difficulty levels
- **Progress Tracking**: Comprehensive analytics and performance visualization
- **AI-Powered Recommendations**: ML-based recommendations using K-means clustering
- **User Authentication**: Secure authentication with Supabase Auth
- **Real-time Analytics**: Dynamic performance tracking and insights

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Vercel

### Backend
- **Database**: Supabase PostgreSQL
- **Edge Functions**: Supabase Edge Functions (Deno runtime)
- **Authentication**: Supabase Auth (Email/Password)
- **API**: RESTful API through Edge Functions

### Machine Learning
- **Algorithm**: K-means Clustering (implemented from scratch)
- **Features**: Performance-based student clustering
- **Recommendation Engine**: Rule-based + ML-assisted recommendations
- **Difficulty Adjustment**: Adaptive learning path based on performance

## Database Schema

### Tables

1. **profiles**
   - Stores user profile information
   - Links to auth.users
   - Tracks current learning level

2. **topics**
   - Subject areas for quizzes
   - Contains difficulty and category information

3. **questions**
   - Quiz questions with multiple-choice options
   - Linked to topics
   - Stores correct answers and points

4. **quiz_attempts**
   - Tracks all user quiz submissions
   - Records correctness, time taken, and points earned

5. **recommendations**
   - Stores ML-generated recommendations
   - Includes clustering information and reasoning

### ER Diagram

```
┌─────────────┐         ┌─────────────┐
│   profiles  │         │   topics    │
├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │
│ email       │         │ name        │
│ full_name   │         │ description │
│ current_level│        │ difficulty  │
└─────────────┘         │ category    │
                        └─────────────┘
                               │
                               │ 1:N
                               ▼
                        ┌─────────────┐
                        │  questions  │
                        ├─────────────┤
                        │ id (PK)     │
                        │ topic_id(FK)│
                        │ question_text│
                        │ options     │
                        │ correct_answer│
                        └─────────────┘
                               │
                               │ 1:N
                               ▼
┌─────────────┐         ┌─────────────┐         ┌──────────────────┐
│   profiles  │────────▶│quiz_attempts│◀────────│    questions     │
└─────────────┘   1:N   ├─────────────┤   N:1   └──────────────────┘
                        │ id (PK)     │
                        │ user_id(FK) │
                        │ topic_id(FK)│
                        │ question_id(FK)│
                        │ selected_answer│
                        │ is_correct  │
                        │ points_earned│
                        └─────────────┘

┌─────────────┐         ┌──────────────────┐
│   profiles  │────────▶│ recommendations  │
└─────────────┘   1:N   ├──────────────────┤
                        │ id (PK)          │
                        │ user_id (FK)     │
                        │ recommended_topic_id│
                        │ current_level    │
                        │ difficulty_adjustment│
                        │ reason           │
                        │ ml_cluster       │
                        └──────────────────┘
```

## Edge Functions

### 1. submit-quiz
- **Endpoint**: `/functions/v1/submit-quiz`
- **Method**: POST
- **Purpose**: Processes quiz submissions and calculates scores
- **Input**:
  ```json
  {
    "topic_id": "uuid",
    "answers": [
      {
        "question_id": "uuid",
        "selected_answer": 0,
        "time_taken": 15
      }
    ]
  }
  ```
- **Output**: Quiz results with score, accuracy, and feedback

### 2. generate-recommendations
- **Endpoint**: `/functions/v1/generate-recommendations`
- **Method**: POST
- **Purpose**: Generates personalized learning recommendations using ML
- **Features**:
  - K-means clustering for student grouping
  - Performance analysis across topics and difficulties
  - Adaptive difficulty adjustment
  - Weak topic identification
- **Output**:
  ```json
  {
    "student_id": "uuid",
    "current_level": "Intermediate",
    "recommended_topic": "Neural Networks Basics",
    "difficulty_adjustment": "Increase",
    "reason": "Explanation",
    "ml_cluster": 1,
    "accuracy": 75.5,
    "total_attempts": 50
  }
  ```

### 3. get-progress
- **Endpoint**: `/functions/v1/get-progress`
- **Method**: GET
- **Purpose**: Retrieves comprehensive progress analytics
- **Output**: Detailed performance metrics by topic, difficulty, and time

## Machine Learning Implementation

### K-means Clustering

The system implements K-means clustering from scratch to group students based on:
- Overall accuracy
- Average score per question
- Total attempts (engagement metric)

**Algorithm Steps:**
1. Initialize k centroids randomly
2. Assign each student to nearest centroid
3. Recalculate centroids based on assignments
4. Repeat until convergence or max iterations

**Cluster Interpretation:**
- **Cluster 0**: Beginners - Lower accuracy, fewer attempts
- **Cluster 1**: Intermediate - Moderate accuracy, regular engagement
- **Cluster 2**: Advanced - High accuracy, extensive attempts

### Recommendation Logic

1. **Weak Topic Focus**: Identifies topics with <60% accuracy
2. **Difficulty Matching**: Recommends topics matching current level
3. **Unexplored Topics**: Suggests new topics for knowledge expansion
4. **Difficulty Adjustment**:
   - Increase: Accuracy ≥85% and recent performance ≥80%
   - Decrease: Accuracy <50% or recent performance <40%
   - Maintain: Otherwise

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account (database already configured)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment variables are already configured in `.env`:
   ```
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

4. Database is already set up with:
   - All required tables
   - Sample topics (10 topics covering CS and ML)
   - Sample questions (50 questions across all topics)
   - RLS policies enabled

5. Edge Functions are deployed:
   - submit-quiz
   - generate-recommendations
   - get-progress

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Deployment

**Frontend (Vercel)**:
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy

**Backend (Supabase)**:
- Database and Edge Functions are already deployed and configured

## Features Demonstrated

### ✅ Frontend Requirements
- Interactive quiz interface with multiple-choice questions
- Progress dashboard with comprehensive analytics
- Recommendation display with ML insights
- Responsive design for all screen sizes
- Clean, modern UI with smooth transitions

### ✅ Backend Requirements
- RESTful APIs via Edge Functions
- Secure authentication and authorization
- Quiz submission and scoring logic
- Progress calculation and analytics
- Recommendation generation

### ✅ Database Design
- Normalized schema with proper relationships
- Row Level Security (RLS) enabled on all tables
- Efficient indexing for performance
- Data integrity constraints

### ✅ AI/ML Component
- K-means clustering implementation (from scratch)
- Performance-based student grouping
- Rule-based recommendation logic
- Adaptive difficulty adjustment
- Multi-factor analysis (accuracy, engagement, trends)

### ✅ Deployment
- Frontend deployed on Vercel
- Backend on Supabase
- Full integration between deployed components

## Usage Guide

### For Students

1. **Sign Up / Sign In**
   - Create an account with email and password
   - Your profile is automatically created

2. **Take Quizzes**
   - Browse available topics
   - Select a topic to start a quiz
   - Answer 5 questions per quiz
   - View immediate results

3. **Track Progress**
   - View overall performance metrics
   - Analyze performance by topic and difficulty
   - Track improvement over time

4. **Get Recommendations**
   - Receive AI-powered topic suggestions
   - See difficulty adjustments
   - Understand your learning path
   - View your ML cluster assignment

## API Documentation

### Authentication
All API requests require authentication header:
```
Authorization: Bearer <access_token>
```

### Endpoints

#### Submit Quiz
```
POST /functions/v1/submit-quiz
Content-Type: application/json

{
  "topic_id": "uuid",
  "answers": [...]
}

Response: 200 OK
{
  "success": true,
  "total_score": 85,
  "accuracy": 85.5,
  "message": "Excellent!"
}
```

#### Generate Recommendations
```
POST /functions/v1/generate-recommendations
Content-Type: application/json

Response: 200 OK
{
  "student_id": "uuid",
  "current_level": "Intermediate",
  "recommended_topic": "Neural Networks Basics",
  "difficulty_adjustment": "Increase"
}
```

#### Get Progress
```
GET /functions/v1/get-progress

Response: 200 OK
{
  "overall": {...},
  "by_topic": [...],
  "by_difficulty": {...}
}
```

## Security Features

- Email/password authentication with Supabase Auth
- Row Level Security (RLS) on all database tables
- JWT-based API authentication
- Secure Edge Functions with JWT verification
- CORS properly configured
- Input validation on all endpoints

## Performance Optimizations

- Database indexing on frequently queried columns
- Efficient SQL queries with proper joins
- Client-side caching of static data
- Lazy loading of components
- Optimized bundle size with Vite

## Future Enhancements

- Social learning features (leaderboards, peer comparison)
- More ML algorithms (collaborative filtering, neural networks)
- Spaced repetition system
- Adaptive quiz difficulty in real-time
- Video lessons and interactive content
- Mobile app (React Native)
- Advanced analytics dashboard for educators

## Testing

To test the application:

1. **Authentication**: Create a new account or sign in
2. **Quiz System**: Take quizzes on different topics
3. **Progress Tracking**: Check dashboard after completing quizzes
4. **Recommendations**: View ML-generated recommendations
5. **Performance**: Check different difficulty levels

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Auth.tsx           # Authentication UI
│   │   ├── Dashboard.tsx      # Progress analytics
│   │   ├── Quiz.tsx           # Quiz interface
│   │   ├── Recommendations.tsx # ML recommendations
│   │   └── Layout.tsx         # Main layout
│   ├── contexts/
│   │   └── AuthContext.tsx    # Auth state management
│   ├── lib/
│   │   └── supabase.ts        # Supabase client
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── supabase/
│   └── functions/
│       ├── submit-quiz/       # Quiz submission Edge Function
│       ├── generate-recommendations/ # ML recommendation Engine
│       └── get-progress/      # Progress analytics API
└── README.md
```

## Credits

**Developed for**: AU Campus Recruitment 2026
**Assessment**: Full Stack Developer - Individual Technical Assessment
**Problem Statement**: #2 - Personalized Learning Progress & Recommendation System

## License

This project is developed as part of AU Campus Recruitment 2026 assessment.# Quizproject
