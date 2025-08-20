import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Summary } from './Summary';
; // Importando o tipo Summary

// Ícone de Upload em SVG para não depender de arquivos externos.
const UploadIcon = () => (
  <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H13a4 4 0 014 4v5m-5 4h5a4 4 0 004-4v-1.586a1 1 0 00-.293-.707l-1.414-1.414a1 1 0 00-.707-.293H10a4 4 0 00-4 4v1.586a1 1 0 00.293.707l1.414 1.414a1 1 0 00.707.293h.001z"></path>
  </svg>
);

interface FileUploadProps {
  onAnalysisComplete: (newSummary: Omit<Summary, 'id' | 'date'>) => void;
}

// Componente de upload agora recebe uma função para notificar a conclusão da análise.
export const FileUpload: React.FC<FileUploadProps> = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  const handleAnalysis = () => {
    if (!file) return;

    setIsProcessing(true);
    console.log(`Iniciando análise do arquivo: ${file.name}`);

    // Simula a chamada à IA e o processamento
    setTimeout(() => {
      console.log("Análise concluída!");

      // Cria um novo objeto de resumo com base no arquivo
      const newSummary = {
        title: file.name,
        preview: `Este é um resumo gerado por IA para o documento ${file.name}. Ele contém insights...`
      };

      // Chama a função do componente pai para adicionar o novo resumo à lista
      onAnalysisComplete(newSummary);

      setIsProcessing(false);
      setFile(null); // Limpa o arquivo após o processamento
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ${isDragActive ? 'border-blue-500 bg-gray-700' : 'border-gray-600 hover:border-blue-600'}`}
      >
        <input {...getInputProps()} />
        <UploadIcon />
        <p className="mt-4 text-gray-400">
          {isDragActive ? "Solte o arquivo aqui..." : "Arraste e solte um documento aqui, ou clique para selecionar."}
        </p>
      </div>

      {file && (
        <div className="text-center p-4 bg-gray-700 rounded-lg">
          <p className="font-semibold">Arquivo selecionado:</p>
          <p className="text-sm text-gray-300">{file.name}</p>
        </div>
      )}

      <button
        onClick={handleAnalysis}
        disabled={!file || isProcessing}
        className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg transition-all duration-200 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? 'Analisando...' : 'Iniciar Análise'}
      </button>
    </div>
  );
};