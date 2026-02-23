/*
  # Learning Platform Database Schema

  ## Overview
  Creates a comprehensive database schema for a personalized learning platform
  with quiz tracking, progress analytics, and ML-based recommendations.

  ## Tables Created

  1. **profiles**
     - `id` (uuid, references auth.users)
     - `email` (text)
     - `full_name` (text)
     - `current_level` (text) - Beginner, Intermediate, Advanced
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **topics**
     - `id` (uuid, primary key)
     - `name` (text) - Topic name
     - `description` (text) - Topic description
     - `difficulty` (text) - Easy, Medium, Hard
     - `category` (text) - Subject category
     - `created_at` (timestamptz)

  3. **questions**
     - `id` (uuid, primary key)
     - `topic_id` (uuid, references topics)
     - `question_text` (text)
     - `options` (jsonb) - Array of answer options
     - `correct_answer` (integer) - Index of correct option
     - `difficulty` (text) - Easy, Medium, Hard
     - `points` (integer) - Points for correct answer
     - `created_at` (timestamptz)

  4. **quiz_attempts**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `topic_id` (uuid, references topics)
     - `question_id` (uuid, references questions)
     - `selected_answer` (integer)
     - `is_correct` (boolean)
     - `time_taken` (integer) - Seconds taken
     - `points_earned` (integer)
     - `attempted_at` (timestamptz)

  5. **recommendations**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `recommended_topic_id` (uuid, references topics)
     - `current_level` (text)
     - `difficulty_adjustment` (text) - Increase, Decrease, Maintain
     - `reason` (text) - Explanation for recommendation
     - `ml_cluster` (integer) - K-means cluster assignment
     - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - All tables require authentication
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  current_level text DEFAULT 'Beginner' CHECK (current_level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics are viewable by authenticated users"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  points integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by authenticated users"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer integer NOT NULL,
  is_correct boolean NOT NULL,
  time_taken integer DEFAULT 0,
  points_earned integer DEFAULT 0,
  attempted_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommended_topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  current_level text NOT NULL,
  difficulty_adjustment text NOT NULL CHECK (difficulty_adjustment IN ('Increase', 'Decrease', 'Maintain')),
  reason text,
  ml_cluster integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic_id ON quiz_attempts(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_attempted_at ON quiz_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
