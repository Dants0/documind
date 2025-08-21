import React from 'react';
import { Summary } from '../interfaces/Summary';

interface InsightsProps {
  summaries: Summary[];
}

export const Insights: React.FC<InsightsProps> = ({ summaries }) => {
  // Calcular estatísticas
  const totalDocuments = summaries.length;
  const documentsThisWeek = summaries.filter(summary => {
    const summaryDate = new Date(summary.date.split('/').reverse().join('-'));
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return summaryDate >= oneWeekAgo;
  }).length;

  // Tipos de documento mais comum
  const documentTypes = summaries.reduce((acc, summary) => {
    const extension = summary.title.split('.').pop()?.toLowerCase() || 'unknown';
    acc[extension] = (acc[extension] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonType = Object.entries(documentTypes).sort(([, a], [, b]) => b - a)[0];

  const stats = [
    {
      title: 'Total de Documentos',
      value: totalDocuments,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30'
    },
    {
      title: 'Esta Semana',
      value: documentsThisWeek,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'text-green-400',
      bgColor: 'bg-green-900/30'
    },
    {
      title: 'Tipo Mais Comum',
      value: mostCommonType ? `${mostCommonType[0].toUpperCase()} (${mostCommonType[1]})` : 'N/A',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/30'
    }
  ];

  const recentDocuments = summaries.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard de Insights</h2>
        <p className="text-gray-400">Visualize estatísticas e tendências dos seus documentos analisados</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-1`}>
                  {typeof stat.value === 'number' ? stat.value : stat.value}
                </p>
              </div>
              <div className={stat.color}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Atividade Recente
        </h3>

        {recentDocuments.length > 0 ? (
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white truncate max-w-xs">{doc.title}</p>
                    <p className="text-sm text-gray-400">{doc.date}</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full">
                  Analisado
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">Nenhum documento analisado ainda</p>
            <p className="text-gray-600 text-sm mt-1">Faça upload de documentos para ver insights aqui</p>
          </div>
        )}
      </div>

      {/* Document Types Chart */}
      {Object.keys(documentTypes).length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Tipos de Documento
          </h3>

          <div className="space-y-3">
            {Object.entries(documentTypes)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const percentage = (count / totalDocuments) * 100;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-gray-300 font-medium uppercase">{type}</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm ml-4">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};