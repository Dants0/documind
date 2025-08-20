import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { Summary, SummaryList } from './Summary';


// Dados de exemplo para a lista de resumos.
const initialSummaries: Summary[] = [
  { id: 1, title: 'Relatório Trimestral Q3.pdf', date: '18/08/2025', preview: 'O relatório aponta um crescimento de 15% nas vendas, impulsionado pelo novo produto...' },
  { id: 2, title: 'Contrato de Serviço - Empresa X.docx', date: '15/08/2025', preview: 'As cláusulas principais incluem os termos de pagamento, confidencialidade e prazo de vigência...' },
];

// A tela principal da aplicação. Agora ela gerencia o estado da lista de resumos.
export const MainView: React.FC = () => {
  const [summaries, setSummaries] = useState<Summary[]>(initialSummaries);

  // Função para adicionar um novo resumo à lista.
  // Ela será passada para o componente FileUpload.
  const handleAddSummary = (newSummary: Omit<Summary, 'id' | 'date'>) => {
    const summaryWithIdAndDate: Summary = {
      ...newSummary,
      id: Date.now(), // Usando timestamp como ID simples
      date: new Date().toLocaleDateString('pt-BR'),
    };
    // Adiciona o novo resumo no topo da lista
    setSummaries(prevSummaries => [summaryWithIdAndDate, ...prevSummaries]);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-center text-gray-100">Analisador de Documentos com IA</h1>
        <p className="text-center text-gray-400 mt-2">
          Faça o upload de um documento para gerar um resumo inteligente e obter insights.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-4">1. Novo Documento</h2>
          {/* Passamos a função para adicionar o resumo como prop */}
          <FileUpload onAnalysisComplete={handleAddSummary} />
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-4">2. Resumos Gerados</h2>
          {/* A lista de resumos agora é passada via props */}
          <SummaryList summaries={summaries} />
        </div>
      </div>
    </div>
  );
};
