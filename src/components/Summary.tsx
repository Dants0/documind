import React from 'react';

// Exportando o tipo 'Summary' para que outros componentes possam usá-lo.
export interface Summary {
  id: number;
  title: string;
  date: string;
  preview: string;
  analyse: string;
}

interface SummaryListProps {
  summaries: Summary[];
  onSummaryClick?: (summary: Summary) => void;
}

export const SummaryList: React.FC<SummaryListProps> = ({ summaries, onSummaryClick }) => (
  <div className="space-y-4">
    {summaries.map(summary => (
      <div
        key={summary.id}
        className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition"
        onClick={() => onSummaryClick && onSummaryClick(summary)}
        tabIndex={0}
        role="button"
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onSummaryClick && onSummaryClick(summary);
        }}
      >
        <h3 className="font-semibold text-lg mb-1">{summary.title}</h3>
        <p className="text-gray-400 text-sm mb-2">{summary.date}</p>
        <p className="text-gray-300 truncate">{summary.preview}</p>
      </div>
    ))}
  </div>
);