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
  const [subjects, setSubjects] = useState<string[]>(['Math', 'Science', 'History']); // Add your subjects here
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState<string>('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const scriptURL = 'https://script.google.com/macros/s/AKfycbyyQBxGYjqMDBVx2Vxb82JanGWYWyjQnpmbWYEhZQWpSxaZbTN5VT6UF5HfIpGZRCAO/exec';

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    fetchQuestionsFromGoogleSheet(subject);
  };

  const fetchQuestionsFromGoogleSheet = async (subject: string) => {
    try {
      const response = await fetch(`${scriptURL}?subject=${subject}`);
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

    try {
      const response = await fetch(scriptURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          score: score,
          subject: selectedSubject,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
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
    setSelectedSubject(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!playerName && <NameInput onNameSubmit={handleNameSubmit} />}
        
        {playerName && !selectedSubject && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Select a Subject</h2>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectSelect(subject)}
                className="px-4 py-2 m-2 bg-blue-500 text-white rounded shadow"
              >
                {subject}
              </button>
            ))}
          </div>
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
