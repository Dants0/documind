import React, { useState } from 'react';
import { SummaryListProps } from './SummaryList';

const ExpandIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);



// O componente agora é "burro", apenas recebe a lista de resumos e a exibe.
export const SummaryList: React.FC<SummaryListProps> = ({ summaries, onDelete, onDownload }) => {
  const [expandedSummaryId, setExpandedSummaryId] = useState<number | null>(null);

  const handleExpandToggle = (id: number) => {
    setExpandedSummaryId(id === expandedSummaryId ? null : id);
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {summaries.length > 0 ? (
        summaries.map(summary => {
          const isExpanded = summary.id === expandedSummaryId;
          return (
            <div
              key={summary.id}
              className="bg-gray-700 p-4 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center justify-between cursor-pointer" onClick={() => handleExpandToggle(summary.id)}>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{summary.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{summary.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ExpandIcon isExpanded={isExpanded} />
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-2">{summary.preview}</p>

              {isExpanded && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-200 mb-2">Análise Detalhada</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{summary.analyse}</p>
                </div>
              )}

              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => onDownload(summary)}
                  className="p-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  title="Baixar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
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
          );
        })
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhum resumo gerado ainda.</p>
          <p className="text-gray-500 text-sm">Faça o upload de um documento para começar.</p>
        </div>
      )}
    </div>
  );
};