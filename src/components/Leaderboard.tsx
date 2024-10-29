import React from 'react';
import { Trophy } from 'lucide-react';

interface LeaderboardEntry {
  name: string;
  score: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-800">Leaderboard</h3>
      </div>
      <div className="space-y-2">
        {sortedEntries.map((entry, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0
                ? 'bg-yellow-50 border-2 border-yellow-200'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 font-bold">
                {index + 1}
              </span>
              <span className="font-medium">{entry.name}</span>
            </div>
            <span className="font-bold text-indigo-600">{entry.score} points</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;