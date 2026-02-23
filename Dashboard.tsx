import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, TrendingUp, Target, Award, BookOpen, BarChart3 } from 'lucide-react';

interface ProgressData {
  user: {
    full_name: string;
    current_level: string;
  };
  overall: {
    total_attempts: number;
    correct_attempts: number;
    total_score: number;
    accuracy: number;
    recent_performance: number;
  };
  by_topic: Array<{
    topicName: string;
    category: string;
    difficulty: string;
    attempted: number;
    correct: number;
    accuracy: number;
  }>;
  by_difficulty: {
    Easy: { attempted: number; correct: number; accuracy: number };
    Medium: { attempted: number; correct: number; accuracy: number };
    Hard: { attempted: number; correct: number; accuracy: number };
  };
  latest_recommendation: {
    topic: string;
    difficulty: string;
    category: string;
    reason: string;
  } | null;
}

export function Dashboard() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-progress`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!progressData || progressData.overall.total_attempts === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Progress Yet</h2>
          <p className="text-gray-600 mb-6">
            Start taking quizzes to see your performance analytics and personalized recommendations
          </p>
        </div>
      </div>
    );
  }

  const { user, overall, by_topic, by_difficulty, latest_recommendation } = progressData;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.full_name || 'Student'}!
        </h2>
        <p className="text-gray-600">Here's your learning progress overview</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-500">Level</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{user.current_level}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-gray-500">Accuracy</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{overall.accuracy}%</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-yellow-600" />
            <span className="text-sm font-medium text-gray-500">Total Score</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{overall.total_score}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-gray-500">Attempts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{overall.total_attempts}</p>
        </div>
      </div>

      {latest_recommendation && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Recommended for You</h3>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-2xl font-semibold mb-2">{latest_recommendation.topic}</p>
              <p className="text-blue-100 mb-2">{latest_recommendation.reason}</p>
              <div className="flex gap-2">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  {latest_recommendation.difficulty}
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  {latest_recommendation.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance by Difficulty</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(by_difficulty).map(([difficulty, stats]) => (
            <div key={difficulty} className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{difficulty}</h4>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    difficulty === 'Easy'
                      ? 'bg-green-100 text-green-700'
                      : difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {stats.attempted} attempts
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="font-semibold text-gray-900">{stats.accuracy.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      difficulty === 'Easy'
                        ? 'bg-green-500'
                        : difficulty === 'Medium'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(stats.accuracy, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance by Topic</h3>
        <div className="space-y-3">
          {by_topic.slice(0, 8).map((topic) => (
            <div key={topic.topicName} className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{topic.topicName}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        topic.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-700'
                          : topic.difficulty === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {topic.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{topic.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{topic.accuracy.toFixed(0)}%</p>
                  <p className="text-sm text-gray-600">
                    {topic.correct}/{topic.attempted}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(topic.accuracy, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
