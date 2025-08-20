import React, { useState, useEffect } from 'react';
import { readTextFile, BaseDirectory, exists } from '@tauri-apps/plugin-fs';
import { FileUpload } from './FileUpload';
import { Summary, SummaryList } from './Summary';

// Dados de exemplo para a lista de resumos
const initialSummaries: Summary[] = [
  {
    id: 1,
    title: 'Relatório Trimestral Q3.pdf Mock',
    date: '18/08/2025',
    preview: 'O relatório aponta um crescimento de 15% nas vendas, impulsionado pelo novo produto...',
    analyse: "Análise detalhada do relatório trimestral..."
  },
  {
    id: 2,
    title: 'Contrato de Serviço - Empresa X.docx Mock',
    date: '15/08/2025',
    preview: 'As cláusulas principais incluem os termos de pagamento, confidencialidade e prazo de vigência...',
    analyse: "Análise completa do contrato de serviço..."
  },
];

interface MainViewProps {
  initialApiKey?: string;
}

export const MainView: React.FC<MainViewProps> = ({ initialApiKey }) => {
  const SETTINGS_FILE = 'settings.json';
  const [summaries, setSummaries] = useState<Summary[]>(initialSummaries);
  const [apiKey, setApiKey] = useState<string | null>(initialApiKey || null);
  const [isLoading, setIsLoading] = useState(!initialApiKey);

  // Carrega a apiKey do settings.json se não foi fornecida via props
  useEffect(() => {
    if (initialApiKey) {
      setApiKey(initialApiKey);
      setIsLoading(false);
      return;
    }

    const loadApiKey = async () => {
      try {
        // Verifica se o arquivo existe
        const fileExists = await exists(SETTINGS_FILE, { baseDir: BaseDirectory.AppConfig });

        if (!fileExists) {
          console.log('Arquivo settings.json não encontrado');
          setIsLoading(false);
          return;
        }

        const content = await readTextFile(SETTINGS_FILE, {
          baseDir: BaseDirectory.AppConfig
        });

        console.log('Conteúdo do settings.json carregado:', content);

        const data = JSON.parse(content);
        if (data.apiKey && data.apiKey.trim()) {
          setApiKey(data.apiKey.trim());
          console.log('Chave de API carregada no MainView');
        } else {
          console.log('Nenhuma chave de API encontrada no arquivo');
        }
      } catch (error) {
        console.error('Erro ao carregar chave de API no MainView:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, [initialApiKey]);

  // Função para adicionar um novo resumo à lista
  const handleAddSummary = (newSummary: Omit<Summary, 'id' | 'date'>) => {
    const summaryWithIdAndDate: Summary = {
      ...newSummary,
      id: Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
    };
    setSummaries(prev => [summaryWithIdAndDate, ...prev]);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="p-8 bg-gray-800 rounded-xl text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-center text-gray-100">
            Analisador de Documentos com IA
          </h1>
          <p className="text-center text-gray-400 mt-2">
            Faça o upload de um documento para gerar um resumo inteligente e obter insights.
          </p>

          {/* Status da API Key */}
          <div className="mt-4 text-center">
            {apiKey ? (
              <p className="text-sm text-green-400">
                ✅ Chave de API configurada
              </p>
            ) : (
              <p className="text-sm text-yellow-400">
                ⚠️ Chave de API não configurada
              </p>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seção de Upload */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-4">
              1. Novo Documento
            </h2>

            {apiKey ? (
              <FileUpload
                onAnalysisComplete={handleAddSummary}
                apiKey={apiKey}
              />
            ) : (
              <div className="text-center p-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-4">
                  Nenhuma chave de API encontrada.
                </p>
                <p className="text-sm text-gray-500">
                  Configure sua chave OpenAI para começar a analisar documentos.
                </p>
              </div>
            )}
          </div>

          {/* Seção de Resumos */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-4">
              2. Resumos Gerados
            </h2>
            <SummaryList summaries={summaries} />
          </div>
        </div>

        {/* Footer com informações úteis */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Documentos suportados: TXT, PDF, JSON, MD, CSV, DOC, DOCX
          </p>
          <p className="mt-2">
            Todos os dados são armazenados localmente no seu dispositivo
          </p>
        </footer>
      </div>
    </div>
  );
};