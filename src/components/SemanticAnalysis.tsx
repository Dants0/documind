import React from 'react';
import { SemanticInsight } from '../interfaces/SemmanticInsight';
import { Summary } from '../interfaces/Summary';
import { SemanticAnalysisProps } from '../interfaces/SemanticAnalyseProps';



// Função para extrair insights semânticos dos documentos
const extractSemanticInsights = (summaries: Summary[]): SemanticInsight => {
  // Agregar palavras-chave
  const keywordMap = new Map<string, { frequency: number; relevance: number }>();
  const themeMap = new Map<string, { confidence: number; documentCount: number }>();
  const languageMap = new Map<string, { code: string; count: number }>();

  let totalComplexity = 0;
  let totalReadability = 0;
  let complexityDistribution = { simple: 0, medium: 0, complex: 0 };
  let documentsWithData = 0;

  summaries.forEach(summary => {
    // Processar palavras-chave
    if (summary.keywords) {
      summary.keywords.forEach(keyword => {
        const current = keywordMap.get(keyword) || { frequency: 0, relevance: 0 };
        keywordMap.set(keyword, {
          frequency: current.frequency + 1,
          relevance: current.relevance + (1 / summary.keywords!.length)
        });
      });
    }

    // Processar temas
    if (summary.themes) {
      summary.themes.forEach(theme => {
        const current = themeMap.get(theme) || { confidence: 0, documentCount: 0 };
        themeMap.set(theme, {
          confidence: Math.max(current.confidence, 0.8), // Simular confiança
          documentCount: current.documentCount + 1
        });
      });
    }

    // Processar línguas
    if (summary.language) {
      const current = languageMap.get(summary.language) || { code: summary.language.toLowerCase(), count: 0 };
      languageMap.set(summary.language, {
        ...current,
        count: current.count + 1
      });
    }

    // Processar complexidade
    if (summary.complexityScore) {
      totalComplexity += summary.complexityScore;
      if (summary.complexityScore <= 3) complexityDistribution.simple++;
      else if (summary.complexityScore <= 6) complexityDistribution.medium++;
      else complexityDistribution.complex++;
      documentsWithData++;
    }

    // Processar legibilidade
    if (summary.readabilityScore) {
      totalReadability += summary.readabilityScore;
    }
  });

  const avgComplexity = documentsWithData > 0 ? totalComplexity / documentsWithData : 0;
  const avgReadability = documentsWithData > 0 ? totalReadability / documentsWithData : 0;

  const getReadabilityClassification = (score: number): SemanticInsight['readability']['classification'] => {
    if (score >= 80) return 'Muito Fácil';
    if (score >= 60) return 'Fácil';
    if (score >= 40) return 'Moderado';
    if (score >= 20) return 'Difícil';
    return 'Muito Difícil';
  };

  return {
    keywords: Array.from(keywordMap.entries())
      .map(([word, data]) => ({ word, ...data }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 15),

    themes: Array.from(themeMap.entries())
      .map(([theme, data]) => ({ theme, ...data }))
      .sort((a, b) => b.documentCount - a.documentCount),

    languages: Array.from(languageMap.entries())
      .map(([language, data]) => ({
        language: language,
        code: data.code,
        documentCount: data.count,
        percentage: (data.count / summaries.length) * 100
      }))
      .sort((a, b) => b.documentCount - a.documentCount),

    complexity: {
      average: avgComplexity,
      distribution: complexityDistribution
    },

    readability: {
      average: avgReadability,
      classification: getReadabilityClassification(avgReadability)
    }
  };
};

export const SemanticAnalysis: React.FC<SemanticAnalysisProps> = ({ summaries }) => {
  const insights = extractSemanticInsights(summaries);


  console.log(insights)

  const getComplexityColor = (score: number) => {
    if (score <= 3) return 'text-green-400';
    if (score <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getComplexityLabel = (score: number) => {
    if (score <= 3) return 'Simples';
    if (score <= 6) return 'Moderado';
    return 'Complexo';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
          <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Análise Semântica
        </h3>
        <p className="text-gray-400">Insights inteligentes sobre o conteúdo dos seus documentos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Palavras-chave mais frequentes */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Palavras-chave Principais
          </h4>

          {insights.keywords.length > 0 ? (
            <div className="space-y-2">
              {insights.keywords.slice(0, 8).map((keyword, index) => (
                <div key={keyword.word} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="text-white font-medium">{keyword.word}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{keyword.frequency}x</span>
                    <div className="w-16 bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(keyword.frequency * 20, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p>Nenhuma palavra-chave identificada ainda</p>
            </div>
          )}
        </div>

        {/* Temas predominantes */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Temas Identificados
          </h4>

          {insights.themes.length > 0 ? (
            <div className="space-y-3">
              {insights.themes.slice(0, 6).map((theme) => (
                <div key={theme.theme} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-white font-medium">{theme.theme}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-green-400 font-bold">{theme.documentCount} doc{theme.documentCount !== 1 ? 's' : ''}</span>
                    <br />
                    <span className="text-xs text-gray-400">{(theme.confidence * 100).toFixed(0)}% conf.</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>Nenhum tema identificado ainda</p>
            </div>
          )}
        </div>

        {/* Línguas detectadas */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Idiomas Detectados
          </h4>

          {insights.languages.length > 0 ? (
            <div className="space-y-3">
              {insights.languages.map((lang) => (
                <div key={lang.code} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-6 bg-yellow-500 text-black text-xs rounded flex items-center justify-center font-bold uppercase">
                      {lang.code}
                    </span>
                    <span className="text-white font-medium">{lang.language}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-yellow-400 font-bold">{lang.documentCount} doc{lang.documentCount !== 1 ? 's' : ''}</span>
                    <br />
                    <span className="text-xs text-gray-400">{lang.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <p>Nenhum idioma detectado ainda</p>
            </div>
          )}
        </div>

        {/* Nível de complexidade */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Complexidade dos Textos
          </h4>

          {insights.complexity.average > 0 ? (
            <div className="space-y-4">
              {/* Score médio */}
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className={`text-3xl font-bold ${getComplexityColor(insights.complexity.average)}`}>
                  {insights.complexity.average.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {getComplexityLabel(insights.complexity.average)} • Legibilidade: {insights.readability.classification}
                </div>
              </div>

              {/* Distribuição */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Simples (1-3)</span>
                  <span className="text-gray-400">{insights.complexity.distribution.simple} docs</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(insights.complexity.distribution.simple / summaries.length) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">Moderado (4-6)</span>
                  <span className="text-gray-400">{insights.complexity.distribution.medium} docs</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(insights.complexity.distribution.medium / summaries.length) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-red-400">Complexo (7-10)</span>
                  <span className="text-gray-400">{insights.complexity.distribution.complex} docs</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-red-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(insights.complexity.distribution.complex / summaries.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Dados de complexidade não disponíveis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};