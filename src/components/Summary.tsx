import React from 'react';

// Exportando o tipo 'Summary' para que outros componentes possam usá-lo.
export interface Summary {
  id: number;
  title: string;
  date: string;
  preview: string;
}

interface SummaryListProps {
  summaries: Summary[];
}

// O componente agora é "burro", apenas recebe a lista de resumos e a exibe.
export const SummaryList: React.FC<SummaryListProps> = ({ summaries }) => {
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {summaries.length > 0 ? (
        summaries.map(summary => (
          <div
            key={summary.id}
            className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200"
          >
            <h3 className="font-bold text-lg truncate">{summary.title}</h3>
            <p className="text-sm text-gray-400">{summary.date}</p>
            <p className="text-gray-300 mt-2 text-sm truncate">{summary.preview}</p>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhum resumo gerado ainda.</p>
          <p className="text-gray-500 text-sm">Faça o upload de um documento para começar.</p>
        </div>
      )}
    </div>
  );
};