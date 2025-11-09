import React from 'react';
import type { SentimentData } from '../types';
import { SentimentChart } from './SentimentChart';
import { SentimentTrendChart } from './SentimentTrendChart';
import { TotalIcon, PositiveIcon, NegativeIcon, NeutralIcon, BullishIcon, BearishIcon, ThemeItemIcon } from './icons';

interface SentimentDisplayProps {
  data: SentimentData;
  symbol: string;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className={`p-4 rounded-xl bg-gray-800/60 border border-gray-700 flex items-center`}>
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  </div>
);

const ThemeListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start">
    <span className="text-blue-400 mt-1 mr-2"><ThemeItemIcon /></span>
    <span>{children}</span>
  </li>
);

const KeyThemes: React.FC<{ positive: string[]; negative: string[] }> = ({ positive, negative }) => (
  <div>
    <h3 className="text-xl font-semibold text-center mb-4 text-gray-300">Key Themes</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-900/50 p-4 rounded-lg border border-green-500/30">
        <h4 className="flex items-center font-semibold text-green-400 mb-3">
          <BullishIcon />
          <span className="ml-2">Bullish Points</span>
        </h4>
        <ul className="space-y-3 text-gray-300 text-sm">
          {positive.map((theme, i) => <ThemeListItem key={i}>{theme}</ThemeListItem>)}
        </ul>
      </div>
      <div className="bg-gray-900/50 p-4 rounded-lg border border-red-500/30">
        <h4 className="flex items-center font-semibold text-red-400 mb-3">
          <BearishIcon />
          <span className="ml-2">Bearish Points</span>
        </h4>
        <ul className="space-y-3 text-gray-300 text-sm">
          {negative.map((theme, i) => <ThemeListItem key={i}>{theme}</ThemeListItem>)}
        </ul>
      </div>
    </div>
  </div>
);

export const SentimentDisplay: React.FC<SentimentDisplayProps> = ({ data, symbol }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700 animate-fade-in space-y-8">
      <h2 className="text-2xl font-bold text-center">
        Sentiment Analysis for <span className="text-blue-400">${symbol}</span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Comments" value={data.totalComments} icon={<TotalIcon />} color="bg-blue-500/30" />
        <StatCard title="Positive" value={data.positiveComments} icon={<PositiveIcon />} color="bg-green-500/30" />
        <StatCard title="Negative" value={data.negativeComments} icon={<NegativeIcon />} color="bg-red-500/30" />
        <StatCard title="Neutral" value={data.neutralComments} icon={<NeutralIcon />} color="bg-yellow-500/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 w-full">
          <h3 className="text-xl font-semibold text-center mb-4 text-gray-300">Sentiment Distribution</h3>
          <SentimentChart data={data} />
        </div>
        <div className="h-80 w-full">
          <h3 className="text-xl font-semibold text-center mb-4 text-gray-300">Trend (Last 4 Weeks)</h3>
          <SentimentTrendChart data={data.sentimentTrend} />
        </div>
      </div>
      
      <KeyThemes positive={data.positiveThemes} negative={data.negativeThemes} />

    </div>
  );
};
