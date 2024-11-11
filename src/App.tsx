import React, { useState } from 'react';
import { Question } from './types';
import NameInput from './components/NameInput';
import QuizSection from './components/QuizSection';
import ScoreSection from './components/ScoreSection';

interface LeaderboardEntry {
  name: string;
  score: number;
}

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState<string>('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Replace {SCRIPT_ID} with your actual Apps Script deployment ID
  const scriptURL = 'https://script.google.com/macros/s/AKfycbyyQBxGYjqMDBVx2Vxb82JanGWYWyjQnpmbWYEhZQWpSxaZbTN5VT6UF5HfIpGZRCAO/exec';

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    fetchQuestionsFromGoogleSheet();
  };

  const fetchQuestionsFromGoogleSheet = async () => {
    try {
      const response = await fetch(scriptURL);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setLeaderboard(data.leaderboard || []);
        setQuizStarted(true);
      } else {
        alert("No valid questions received from server.");
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert("Unable to fetch questions at this time.");
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newUserAnswers);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };

  const handleTimeout = () => {
    const newUserAnswers = [...userAnswers];
    if (newUserAnswers[currentQuestionIndex] === undefined) {
      newUserAnswers[currentQuestionIndex] = null;
      setUserAnswers(newUserAnswers);
    }
    moveToNextQuestion();
  };

  const handleNext = () => {
    if (userAnswers[currentQuestionIndex] === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
    moveToNextQuestion();
  };

  const handleSkip = () => {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = null;
    setUserAnswers(newUserAnswers);
    moveToNextQuestion();
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const completeQuiz = async () => {
    setQuizCompleted(true);
    
    // Update leaderboard via Apps Script
    try {
      const response = await fetch(scriptURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          score: score,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Update local leaderboard
        setLeaderboard([...leaderboard, { name: playerName, score }]);
      } else {
        console.error('Error updating leaderboard:', data);
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setQuizCompleted(false);
    setQuizStarted(false);
    setPlayerName('');
    setQuestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!playerName && (
          <NameInput onNameSubmit={handleNameSubmit} />
        )}
        
        {quizStarted && !quizCompleted && questions.length > 0 && (
          <QuizSection
            question={questions[currentQuestionIndex]}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            selectedAnswer={userAnswers[currentQuestionIndex]}
            onOptionSelect={handleOptionSelect}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            onTimeout={handleTimeout}
          />
        )}

        {quizCompleted && (
          <ScoreSection
            score={score}
            totalQuestions={questions.length}
            questions={questions}
            userAnswers={userAnswers}
            onReset={resetQuiz}
            playerName={playerName}
            leaderboard={leaderboard}
          />
        )}
      </div>
    </div>
  );
};

export default App;
