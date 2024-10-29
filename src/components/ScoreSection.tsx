import React, { useState } from 'react';
import { RefreshCcw, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { Question } from '../types';
import Leaderboard from './Leaderboard';

interface ScoreSectionProps {
  score: number;
  totalQuestions: number;
  questions: Question[];
  userAnswers: (number | null)[];
  onReset: () => void;
  playerName: string;
  leaderboard: Array<{ name: string; score: number }>;
}

const ScoreSection: React.FC<ScoreSectionProps> = ({
  score,
  totalQuestions,
  questions,
  userAnswers,
  onReset,
  playerName,
  leaderboard,
}) => {
  const [showAnswers, setShowAnswers] = useState(false);

  const percentage = Math.round((score / totalQuestions) * 100);
  let message = '';
  if (percentage >= 90) message = 'Outstanding!';
  else if (percentage >= 70) message = 'Great job!';
  else if (percentage >= 50) message = 'Good effort!';
  else message = 'Keep practicing!';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-indigo-600">{percentage}%</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {message} {playerName}!
        </h2>
        <p className="text-xl text-gray-600">
          You scored {score} out of {totalQuestions} questions correctly
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
        >
          {showAnswers ? 'Hide Answers' : 'Show Answers'}
        </button>
        <button
          onClick={onReset}
          className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
        >
          <RefreshCcw className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>

      <Leaderboard entries={leaderboard} />

      {showAnswers && (
        <div className="space-y-8 mt-8">
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="border-t pt-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Question {questionIndex + 1}
                </h3>
                {userAnswers[questionIndex] === question.answer ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
              <p className="text-gray-700 mb-4">{question.question}</p>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-3 rounded-lg ${
                      optionIndex === question.answer
                        ? 'bg-green-100 text-green-800'
                        : optionIndex === userAnswers[questionIndex]
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="inline-block w-6 text-center mr-2">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    {option}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Explanation:</span>
                </div>
                <p className="text-blue-900">{question.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoreSection;