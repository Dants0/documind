import React, { useState, useEffect } from 'react';
import { readTextFile, BaseDirectory, exists } from '@tauri-apps/plugin-fs';
import { Summary, SummaryList } from './Summary';
import { Navigation, TabType } from './Navigation';
import { Settings } from './Settings';
import { Insights } from './Insights';
import { FileUpload, loadSummariesFromFile } from './FileUploadNew'

interface MainViewProps {
  initialApiKey?: string;
}

export const MainView: React.FC<MainViewProps> = ({ initialApiKey }) => {
  const SETTINGS_FILE = 'settings.json';

  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(initialApiKey || null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  // Carrega a apiKey e os summaries do disco
  useEffect(() => {
    const loadData = async () => {
      // 1. Carrega a API Key
      try {
        const settingsFileExists = await exists(SETTINGS_FILE, { baseDir: BaseDirectory.AppConfig });
        if (settingsFileExists) {
          const content = await readTextFile(SETTINGS_FILE, { baseDir: BaseDirectory.AppConfig });
          const data = JSON.parse(content);
          if (data.apiKey && data.apiKey.trim()) {
            setApiKey(data.apiKey.trim());
          }
        }
      } catch (error) {
        console.error('Erro ao carregar a chave de API:', error);
      }

      // 2. Carrega os Summaries usando a função que você criou
      try {
        const loadedSummaries = await loadSummariesFromFile();
        setSummaries(loadedSummaries);
        console.log('Summaries carregados com sucesso.');
      } catch (error) {
        console.error('Erro ao carregar os summaries:', error);
        setSummaries([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [initialApiKey]);

  // Função para adicionar um novo resumo à lista
  const handleAddSummary = (newSummary: Omit<Summary, 'id' | 'date'>) => {
    const summaryWithIdAndDate: Summary = {
      ...newSummary,
      id: Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
    };
    // Atualiza o estado da lista de summaries com o novo resumo
    setSummaries(prev => [summaryWithIdAndDate, ...prev]);
  };

  // Função para atualizar a API Key
  const handleApiKeyUpdate = (newApiKey: string | null) => {
    setApiKey(newApiKey);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="p-8 bg-gray-800 rounded-xl text-center border border-gray-700">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Novo Documento</h2>
              <p className="text-gray-400">Faça upload de um documento para gerar análise inteligente com IA</p>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
              {apiKey ? (
                <FileUpload onAnalysisComplete={handleAddSummary} apiKey={apiKey} />
              ) : (
                <div className="text-center p-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Configure sua API Key
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Para usar a análise de documentos, você precisa configurar sua chave da OpenAI.
                  </p>
                  <button onClick={() => setActiveTab('settings')} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Ir para Configurações</span>
                  </button>
                </div>
              )}
            </div>
            {apiKey && summaries.length > 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Analisado</p>
                      <p className="text-2xl font-bold text-blue-400">{summaries.length}</p>
                    </div>
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Esta Semana</p>
                      <p className="text-2xl font-bold text-green-400">
                        {summaries.filter(s => {
                          const summaryDate = new Date(s.date.split('/').reverse().join('-'));
                          const oneWeekAgo = new Date();
                          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                          return summaryDate >= oneWeekAgo;
                        }).length}
                      </p>
                    </div>
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pronto</p>
                      <p className="text-2xl font-bold text-purple-400">100%</p>
                    </div>
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'analyzed':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Arquivos Analisados</h2>
              <p className="text-gray-400">Visualize e gerencie todos os documentos processados</p>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
              <SummaryList summaries={summaries} />
            </div>
          </div>
        );
      case 'insights':
        return <Insights summaries={summaries} />;
      case 'settings':
        return <Settings apiKey={apiKey} onApiKeyUpdate={handleApiKeyUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasApiKey={!!apiKey}
      />
      <div className="container mx-auto p-6 md:p-8 pb-12">
        {renderTabContent()}
      </div>
      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                Documentos suportados: <span className="text-gray-300">TXT, PDF, JSON, MD, CSV, DOC, DOCX</span>
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-500 text-xs">
                Todos os dados são armazenados localmente • Privacidade garantida
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};