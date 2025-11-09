
import React from 'react';
import { SearchIcon, LoadingSpinner } from './icons';

interface StockInputProps {
  symbol: string;
  setSymbol: (symbol: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const StockInput: React.FC<StockInputProps> = ({ symbol, setSymbol, onSubmit, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">$</span>
        </div>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., AAPL, GOOGL"
          className="w-full pl-7 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          disabled={isLoading}
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">Analyzing...</span>
          </>
        ) : (
          <>
            <SearchIcon />
            <span className="ml-2">Analyze</span>
          </>
        )}
      </button>
    </div>
  );
};
