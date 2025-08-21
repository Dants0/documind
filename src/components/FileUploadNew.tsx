import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'react-hot-toast';
import { appDataDir, join } from '@tauri-apps/api/path';
import { writeTextFile, exists, readTextFile, mkdir } from '@tauri-apps/plugin-fs';
import { Summary } from '../interfaces/Summary';
import { FileUploadProps } from '../interfaces/FileUpload';
import { analyzeWithOpenAI } from '../hooks/analyzeWithOpenAi';


pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;

const UploadIcon = () => (
  <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H13a4 4 0 014 4v5m-5 4h5a4 4 0 004-4v-1.586a1 1 0 00-.293-.707l-1.414-1.414a1 1 0 00-.707-.293H10a4 4 0 00-4 4v1.586a1 1 0 00.293.707l1.414 1.414a1 1 0 00.707.293h.001z"></path>
  </svg>
);


const SUMMARIES_FILE_NAME = 'document_analysis_summaries.json';

export const getSummariesFilePath = async (): Promise<string> => {
  const appDataDirPath = await appDataDir();
  return await join(appDataDirPath, SUMMARIES_FILE_NAME);
};

export const saveSummariesToFile = async (summaries: Summary[]): Promise<void> => {
  try {
    const filePath = await getSummariesFilePath();
    const jsonData = JSON.stringify(summaries, null, 2);
    await writeTextFile(filePath, jsonData);
    console.log('Análises salvas no arquivo:', filePath);
  } catch (error) {
    console.error('Erro ao salvar análises no arquivo:', error);
    throw new Error('Falha ao salvar análises no disco');
  }
};

export const loadSummariesFromFile = async (): Promise<Summary[]> => {
  try {
    const filePath = await getSummariesFilePath();
    const fileExists = await exists(filePath);

    if (!fileExists) {
      console.log('Arquivo de análises não existe ainda, retornando array vazio');
      return [];
    }

    const fileContent = await readTextFile(filePath);
    const summaries = JSON.parse(fileContent);
    console.log(`Carregadas ${summaries.length} análises do arquivo:`, filePath);
    return summaries;
  } catch (error) {
    console.error('Erro ao carregar análises do arquivo:', error);
    return [];
  }
};

export const addSummaryToFile = async (newSummary: Summary): Promise<Summary[]> => {
  try {
    const existingSummaries = await loadSummariesFromFile();
    const updatedSummaries = [newSummary, ...existingSummaries];
    await saveSummariesToFile(updatedSummaries);
    return updatedSummaries;
  } catch (error) {
    console.error('Erro ao adicionar análise ao arquivo:', error);
    throw error;
  }
};

export const deleteSummaryFromFile = async (id: number): Promise<Summary[]> => {
  try {
    const existingSummaries = await loadSummariesFromFile();
    const updatedSummaries = existingSummaries.filter(summary => summary.id !== id);
    console.log(updatedSummaries)
    await saveSummariesToFile(updatedSummaries);
    console.log(`Resumo com ID ${id} excluído com sucesso.`);
    return updatedSummaries;
  } catch (error) {
    console.error('Erro ao excluir análise do arquivo:', error);
    throw error;
  }
};

export const downloadSummaryAsFile = async (summary: Summary): Promise<void> => {
  try {
    const appDataPath = await appDataDir();
    const appFolderName = 'DocuMind';
    const appFolderPath = await join(appDataPath, appFolderName);

    try {
      await mkdir(appFolderPath);
    } catch (error) {
      console.log('A pasta DocuMind já existe.');
    }

    const cleanTitle = summary.title.replace(/[\\/:*?"<>|]/g, '');
    const fileName = `${cleanTitle.replace(/\.\w+$/, '')}_analise.txt`;
    const filePath = await join(appFolderPath, fileName);

    const content = `# Análise do Documento: ${summary.title}\n\n` +
      `**Data da Análise:** ${summary.date}\n\n` +
      `## Resumo\n\n${summary.preview}\n\n` +
      `## Análise Detalhada\n\n${summary.analyse}`;

    await writeTextFile(filePath, content);
    alert(`Análise baixada com sucesso`);


  } catch (error) {
    console.error('Erro ao baixar o resumo:', error);
  }
};

const extractTextFromPDF = async (
  file: File,
  onProgress?: (progress: { page: number; total: number }) => void
): Promise<string> => {
  try {
    const arrayBuffer: any = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    console.log(`PDF carregado. Número de páginas: ${pdf.numPages}`);

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (onProgress) {
        onProgress({ page: pageNum, total: pdf.numPages });
      }

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      if (pageText.trim()) {
        fullText += `\n--- Página ${pageNum} ---\n${pageText}\n`;
      }
    }

    if (!fullText.trim()) {
      throw new Error('Nenhum texto foi encontrado no PDF. O arquivo pode conter apenas imagens.');
    }

    console.log(`Texto extraído do PDF: ${fullText.length} caracteres`);
    return fullText;

  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error(`Erro ao processar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  console.log(`Extraindo texto do arquivo: ${file.name} (${fileType})`);

  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
  }
  else if (fileType === 'application/json' || fileName.endsWith('.json')) {
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  }
  else if (fileType.includes('text/') || fileName.endsWith('.md') || fileName.endsWith('.csv')) {
    return await file.text();
  }
  else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return `[Documento Word: ${file.name}]\nTamanho: ${(file.size / 1024).toFixed(2)} KB\n\nPara extrair texto completo de documentos Word, considere converter para PDF ou usar uma biblioteca específica.\n\nEste documento contém ${Math.ceil(file.size / 1024)} KB de conteúdo.`;
  }
  else {
    throw new Error(`Tipo de arquivo não suportado: ${fileType || 'desconhecido'}`);
  }
}


export const FileUpload: React.FC<FileUploadProps> = ({ onAnalysisComplete, apiKey, goToAnalyzedTab }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ page: number; total: number } | null>(null);
  const [processingStep, setProcessingStep] = useState<'extracting' | 'analyzing' | 'saving' | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setProgress(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleAnalysis = async () => {
    if (!file || !apiKey) return;

    setIsProcessing(true);
    setError(null);
    setProgress(null);

    try {
      console.log(`Iniciando análise do arquivo: ${file.name}`);

      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setProcessingStep('extracting');
        text = await extractTextFromPDF(file, setProgress);
      } else {
        setProcessingStep('extracting');
        text = await extractTextFromFile(file);
      }

      setProcessingStep('analyzing');
      setProgress(null);

      const { preview, analyse } = await analyzeWithOpenAI(text, file.name, apiKey);

      setProcessingStep('saving');

      const newSummary: Summary = {
        id: Date.now(),
        title: file.name,
        date: new Date().toLocaleDateString('pt-BR'),
        preview: preview,
        analyse: analyse
      };

      await addSummaryToFile(newSummary);

      onAnalysisComplete(newSummary);
      setFile(null);

      toast.success('Arquivo analisado com sucesso!');
      goToAnalyzedTab();

    } catch (err) {
      console.error('Erro na análise:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido na análise');
      toast.error('Erro ao analisar o arquivo!');
    } finally {
      setIsProcessing(false);
      setProcessingStep(null);
      setProgress(null);
    }
  };

  const getProcessingText = () => {
    if (processingStep === 'extracting') {
      if (progress) {
        return `Extraindo PDF: ${progress.page}/${progress.total} páginas`;
      }
      return file?.type === 'application/pdf' ? 'Extraindo texto do PDF...' : 'Extraindo texto...';
    }
    if (processingStep === 'analyzing') {
      return 'Analisando com IA...';
    }
    if (processingStep === 'saving') {
      return 'Salvando análise...';
    }
    return 'Processando...';
  };

  return (
    <div className="flex flex-col gap-6">
      <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ${isDragActive ? 'border-blue-500 bg-gray-700' : 'border-gray-600 hover:border-blue-600'}`}>
        <input {...getInputProps()} />
        <UploadIcon />
        <p className="mt-4 text-gray-400">{isDragActive ? "Solte o arquivo aqui..." : "Arraste e solte um documento aqui, ou clique para selecionar."}</p>
        <p className="text-xs text-gray-500 mt-2">Suporta: TXT, PDF (extração de texto), JSON, MD, CSV, DOC, DOCX</p>
      </div>

      {file && (
        <div className="text-center p-4 bg-gray-700 rounded-lg">
          <p className="font-semibold">Arquivo selecionado:</p>
          <p className="text-sm text-gray-300">{file.name}</p>
          <p className="text-xs text-gray-500">Tipo: {file.type || 'Desconhecido'}</p>
          <p className="text-xs text-gray-500">Tamanho: {(file.size / 1024).toFixed(2)} KB</p>
          {file.type === 'application/pdf' && (<p className="text-xs text-blue-400 mt-1">✨ Extração de texto PDF habilitada</p>)}
        </div>
      )}

      {progress && (
        <div className="p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
          <p className="text-blue-300 text-sm mb-2">Processando PDF: Página {progress.page} de {progress.total}</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(progress.page / progress.total) * 100}%` }}></div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg">
          <p className="text-red-300 text-sm"><strong>Erro:</strong> {error}</p>
        </div>
      )}

      <button
        onClick={handleAnalysis}
        disabled={!file || isProcessing || !apiKey}
        className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg transition-all duration-200 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            {getProcessingText()}
          </div>
        ) : 'Iniciar Análise'}
      </button>

      {!apiKey && (
        <p className="text-yellow-400 text-sm text-center">
          ⚠️ Chave de API não configurada. Configure sua chave OpenAI para usar a análise.
        </p>
      )}

    </div>
  );
};
