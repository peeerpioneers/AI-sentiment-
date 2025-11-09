
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SentimentData } from '../types';

interface SentimentChartProps {
  data: SentimentData;
}

const COLORS = {
  positive: '#22c55e', // green-500
  negative: '#ef4444', // red-500
  neutral: '#eab308',  // yellow-500
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    const percentage = ((payload[0].value / total) * 100).toFixed(1);
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
        <p className="label font-bold text-white">{`${label}`}</p>
        <p className="intro text-gray-300">{`Comments: ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};


export const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Positive', count: data.positiveComments, color: COLORS.positive },
    { name: 'Negative', count: data.negativeComments, color: COLORS.negative },
    { name: 'Neutral', count: data.neutralComments, color: COLORS.neutral },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={chartData} 
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
        <XAxis dataKey="name" tick={{ fill: '#a0aec0' }} stroke="#4a5568" />
        <YAxis tick={{ fill: '#a0aec0' }} stroke="#4a5568" />
        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(107, 114, 128, 0.2)'}} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
