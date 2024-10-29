export interface Question {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}