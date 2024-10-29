import React from 'react';
import { Database } from 'lucide-react';

interface UploadSectionProps {
  onFetchQuestions: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFetchQuestions }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center transition-all duration-300 hover:shadow-2xl">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Database className="w-10 h-10 text-indigo-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to the Quiz App
      </h2>
      <p className="text-gray-600 mb-8">
        Click below to start the quiz
      </p>
      <button
        onClick={onFetchQuestions}
        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
      >
        <Database className="w-5 h-5 mr-2" />
        Fetch Questions
      </button>
    </div>
  );
};

export default UploadSection;