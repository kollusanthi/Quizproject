import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Lightbulb, TrendingUp, TrendingDown, Minus, Target, Brain } from 'lucide-react';

interface Recommendation {
  student_id: string;
  current_level: string;
  recommended_topic: string;
  recommended_topic_id: string;
  difficulty_adjustment: string;
  reason: string;
  ml_cluster: number;
  accuracy: number;
  average_score: number;
  total_attempts: number;
  recent_performance: number;
}

export function Recommendations() {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadRecommendation();
  }, []);

  const loadRecommendation = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recommendations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      setRecommendation(data);
    } catch (error) {
      console.error('Error loading recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewRecommendation = async () => {
    setGenerating(true);
    await loadRecommendation();
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Recommendations Yet</h2>
          <p className="text-gray-600">Complete some quizzes to get personalized recommendations</p>
        </div>
      </div>
    );
  }

  const difficultyIcon = {
    Increase: <TrendingUp className="w-6 h-6 text-green-600" />,
    Decrease: <TrendingDown className="w-6 h-6 text-red-600" />,
    Maintain: <Minus className="w-6 h-6 text-blue-600" />,
  };

  const levelColor = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Recommendations</h2>
        <p className="text-gray-600">AI-powered suggestions based on your performance</p>
      </div>

      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Recommended Topic</h3>
              <p className="text-blue-100">Personalized using ML clustering</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${levelColor[recommendation.current_level as keyof typeof levelColor]}`}>
            {recommendation.current_level}
          </span>
        </div>

        <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-6">
          <h4 className="text-3xl font-bold mb-3">{recommendation.recommended_topic}</h4>
          <p className="text-blue-100 text-lg">{recommendation.reason}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium text-blue-100">Difficulty</span>
            </div>
            <div className="flex items-center gap-2">
              {difficultyIcon[recommendation.difficulty_adjustment as keyof typeof difficultyIcon]}
              <span className="text-xl font-bold">{recommendation.difficulty_adjustment}</span>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-100 mb-2">ML Cluster</p>
            <p className="text-3xl font-bold">#{recommendation.ml_cluster}</p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-100 mb-2">Attempts</p>
            <p className="text-3xl font-bold">{recommendation.total_attempts}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Analysis</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Overall Accuracy</span>
              <span className="text-2xl font-bold text-gray-900">{recommendation.accuracy}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(recommendation.accuracy, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Recent Performance</span>
              <span className="text-2xl font-bold text-gray-900">{recommendation.recent_performance}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  recommendation.recent_performance >= recommendation.accuracy
                    ? 'bg-green-600'
                    : 'bg-yellow-600'
                }`}
                style={{ width: `${Math.min(recommendation.recent_performance, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {recommendation.average_score > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Average Score per Question</p>
                <p className="text-3xl font-bold text-gray-900">{recommendation.average_score.toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 mb-1">Current Level</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${levelColor[recommendation.current_level as keyof typeof levelColor]}`}>
                  {recommendation.current_level}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">How Recommendations Work</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>K-means clustering groups you with similar learners</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Performance analysis identifies your strengths and weaknesses</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Difficulty adjustment ensures optimal learning challenge</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Recommendations update after each quiz attempt</span>
          </li>
        </ul>
      </div>

      <button
        onClick={generateNewRecommendation}
        disabled={generating}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Lightbulb className="w-5 h-5" />
            Refresh Recommendations
          </>
        )}
      </button>
    </div>
  );
}
