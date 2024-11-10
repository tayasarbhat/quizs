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

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    fetchQuestionsFromGoogleSheet();
  };

  const fetchQuestionsFromGoogleSheet = async () => {
    try {
      const googleSheetUrl = 'https://script.google.com/macros/s/AKfycbwPhOWFa43GMXW3V9B2VDFxuiOOr1h8M1j-PJgBhBjoH4PBAk_oG2lbXyb63k0EXxF-/exec';
      const response = await fetch(googleSheetUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      if (data.values && data.values.length > 1) {
        const formattedQuestions = data.values.slice(1).map((row: string[]) => ({
          question: row[0],
          options: row.slice(1, 5),
          answer: parseInt(row[5]) - 1,
          explanation: row[6] || 'No explanation provided.'
        }));

        // Extract leaderboard data from columns M and N
        const leaderboardData = data.values.slice(1)
          .filter(row => row[12] && row[13]) // Filter rows with name and score
          .map(row => ({
            name: row[12],
            score: parseInt(row[13])
          }));

        setQuestions(formattedQuestions);
        setLeaderboard(leaderboardData);
        setQuizStarted(true);
      } else {
        alert("The Google Sheet does not contain valid questions.");
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
    
    // Update leaderboard in Google Sheet
    try {
      const range = `Sheet1!M${leaderboard.length + 2}:N${leaderboard.length + 2}`;
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/1p2BSkCJE-ihLk3AlW1lU_1wc4VPEyUwDwERG3L-_uhg/values/${range}?valueInputOption=RAW&key=AIzaSyDYaHabUZ6Ce5Q3VnXd0kSWSNd6XuD0nFY`;
      
      await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[playerName, score]],
        }),
      });

      // Update local leaderboard
      setLeaderboard([...leaderboard, { name: playerName, score }]);
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
