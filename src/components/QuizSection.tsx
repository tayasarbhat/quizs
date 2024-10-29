import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Forward, Clock } from 'lucide-react';
import { Question } from '../types';

interface QuizSectionProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onOptionSelect: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onTimeout: () => void;
}

const QUESTION_TIME_LIMIT = 60; // 1 minute in seconds

const QuizSection: React.FC<QuizSectionProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onOptionSelect,
  onNext,
  onPrevious,
  onSkip,
  onTimeout,
}) => {
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerIdRef.current) clearInterval(timerIdRef.current); // Clear any existing timer
    timerIdRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerIdRef.current!);
          onTimeout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Start the timer on initial mount only
  useEffect(() => {
    startTimer();
    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current); // Cleanup on unmount
    };
  }, []); // Empty dependency array to run only once on mount

  // Reset timer manually when clicking "Next" or "Skip"
  const handleNext = () => {
    setTimeLeft(QUESTION_TIME_LIMIT);
    startTimer();
    onNext();
  };

  const handleSkip = () => {
    setTimeLeft(QUESTION_TIME_LIMIT);
    startTimer();
    onSkip();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-indigo-600">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <div
            className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
            style={{
              width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%`,
            }}
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{question.question}</h2>
      </div>

      <div className="space-y-4 mb-8">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onOptionSelect(index)}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
              selectedAnswer === index
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <span className="inline-block w-8 h-8 rounded-full bg-gray-100 text-center leading-8 mr-3">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
            currentQuestionIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        <button
          onClick={handleSkip}
          className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
        >
          <Forward className="w-5 h-5 mr-2" />
          Skip
        </button>
        <button
          onClick={handleNext}
          className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
        >
          {currentQuestionIndex === totalQuestions - 1 ? (
            'Submit'
          ) : (
            <>
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizSection;
