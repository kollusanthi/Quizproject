import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Trophy } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  category: string;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  difficulty: string;
  points: number;
}

interface QuizAnswer {
  question_id: string;
  selected_answer: number;
  time_taken: number;
}

export function Quiz() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('name');

    if (!error && data) {
      setTopics(data);
    }
    setLoading(false);
  };

  const startQuiz = async (topic: Topic) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topic.id)
      .limit(5);

    if (!error && data) {
      setSelectedTopic(topic);
      setQuestions(data);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setResult(null);
      setQuestionStartTime(Date.now());
    }
    setLoading(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const newAnswer: QuizAnswer = {
      question_id: questions[currentQuestionIndex].id,
      selected_answer: selectedAnswer,
      time_taken: timeTaken,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: QuizAnswer[]) => {
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-quiz`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: selectedTopic?.id,
          answers: finalAnswers,
        }),
      }
    );

    const data = await response.json();
    setResult(data);
    setSubmitting(false);
  };

  const resetQuiz = () => {
    setSelectedTopic(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
          <p className="text-gray-600 mb-8">{result.message}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Score</p>
              <p className="text-3xl font-bold text-gray-900">{result.total_score}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-blue-600">{result.percentage}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Correct</p>
              <p className="text-2xl font-bold text-green-600">{result.correct_answers}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-600">{result.total_questions}</p>
            </div>
          </div>

          <button
            onClick={resetQuiz}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Take Another Quiz
          </button>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Submitting your quiz...</p>
      </div>
    );
  }

  if (selectedTopic && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedTopic.name}</h2>
                <p className="text-blue-100">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <p className="text-white font-medium">{currentQuestion.points} pts</p>
              </div>
            </div>
            <div className="w-full bg-blue-500 bg-opacity-30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question_text}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedAnswer === index
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedAnswer === index
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedAnswer === index && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="mt-8 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose a Topic</h2>
        <p className="text-gray-600">Select a topic to start your quiz</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 cursor-pointer border-2 border-transparent hover:border-blue-500"
            onClick={() => startQuiz(topic)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900">{topic.name}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
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
            <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="bg-gray-100 px-3 py-1 rounded-full">{topic.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
