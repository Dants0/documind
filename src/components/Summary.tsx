import React from 'react';
import { SummaryListProps } from './SummaryList';


export const SummaryList: React.FC<SummaryListProps> = ({ summaries, onSummaryClick, onDelete }) => (
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

        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={() => onDelete(summary.id)}
            className="p-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            title="Excluir Análise"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    ))}
  </div>
);
