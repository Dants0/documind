// hooks/useSemanticAnalysis.ts
import { useState, useEffect } from 'react';
import {  } from '@tauri-apps/api/';
import { invoke } from '@tauri-apps/api/core';
import { SemanticData } from '../interfaces/SemmanticData';


export const useSemanticAnalysis = (summaries: any[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [semanticData, setSemanticData] = useState<SemanticData[]>([]);

  const analyzeDocuments = async () => {
    if (summaries.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Extrair conteúdo dos documentos (assumindo que existe um campo 'content')
      const contents = summaries.map(summary => summary.content || summary.title);
      
      const results: SemanticData[] = await invoke('batch_analyze_semantics', {
        documents: contents
      });

      setSemanticData(results);
    } catch (err) {
      setError(err as string);
      console.error('Erro na análise semântica:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeDocument = async (content: string): Promise<SemanticData | null> => {
    try {
      const result: SemanticData = await invoke('analyze_document_semantics', {
        content
      });
      return result;
    } catch (err) {
      console.error('Erro ao analisar documento:', err);
      return null;
    }
  };

  useEffect(() => {
    analyzeDocuments();
  }, [summaries]);

  return {
    semanticData,
    isLoading,
    error,
    analyzeDocument,
    refetch: analyzeDocuments
  };
};

// Função utilitária para processar dados para os componentes
export const processSemanticInsights = (semanticData: SemanticData[], summaries: any[]) => {
  // Combinar dados semânticos com summaries existentes
  return summaries.map((summary, index) => ({
    ...summary,
    keywords: semanticData[index]?.keywords || [],
    themes: semanticData[index]?.themes || [],
    language: semanticData[index]?.language,
    complexityScore: semanticData[index]?.complexity_score || 0,
    readabilityScore: semanticData[index]?.readability_score || 0,
    wordCount: semanticData[index]?.word_count || 0,
    sentimentScore: semanticData[index]?.sentiment_score || 0,
  }));
};