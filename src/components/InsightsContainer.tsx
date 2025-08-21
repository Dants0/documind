// components/InsightsContainer.tsx
import React from 'react';
import { Insights } from './Insights';
import { useSemanticAnalysis, processSemanticInsights } from '../hooks/useSemanticAnalyse';
import { InsightsContainerProps } from '../interfaces/InsightsContainerProps';


export const InsightsContainer: React.FC<InsightsContainerProps> = ({ summaries }) => {
  const { semanticData, isLoading, error } = useSemanticAnalysis(summaries);

  // Processar dados combinando summaries com análise semântica
  const enrichedSummaries = React.useMemo(() => {
    if (semanticData.length === 0) return summaries;
    return processSemanticInsights(semanticData, summaries);
  }, [summaries, semanticData]);

  console.log(enrichedSummaries)

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-400 mb-2">Erro na Análise Semântica</h3>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <div>
              <p className="text-white font-medium">Analisando conteúdo semântico...</p>
              <p className="text-gray-400 text-sm">Processando {summaries.length} documento{summaries.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      )}

      <Insights summaries={enrichedSummaries} />
    </div>
  );
};