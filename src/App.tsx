import { useState, useEffect } from 'react';
import { readTextFile, BaseDirectory, exists } from '@tauri-apps/plugin-fs';
import { MainView } from './components/MainView';
import { ApiKeySetup } from './components/ApyKeySetup';
import { useShortcuts } from './hooks/useShortCuts';

export default function App() {
  useShortcuts();

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  const SETTINGS_FILE = 'settings.json';

  // Verifica se já existe uma chave de API salva ao iniciar
  useEffect(() => {
    const checkExistingApiKey = async () => {
      try {
        // Verifica se o arquivo de configuração existe
        const fileExists = await exists(SETTINGS_FILE, {
          baseDir: BaseDirectory.AppConfig
        });

        if (fileExists) {
          const content = await readTextFile(SETTINGS_FILE, {
            baseDir: BaseDirectory.AppConfig
          });

          console.log('Verificando chave existente:', content);

          const data = JSON.parse(content);

          if (data.apiKey && data.apiKey.trim()) {
            console.log('Chave de API encontrada, entrando direto no MainView');
            setApiKey(data.apiKey.trim());
            setShowSetup(false);
          } else {
            console.log('Arquivo existe mas não contém chave válida');
            setShowSetup(true);
          }
        } else {
          console.log('Arquivo de configuração não existe, mostrando setup');
          setShowSetup(true);
        }
      } catch (error) {
        console.error('Erro ao verificar chave existente:', error);
        setShowSetup(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingApiKey();
  }, []);

  // Callback para quando a chave de API for configurada
  const handleApiKeySubmit = (newApiKey: string) => {
    console.log('API Key configurada:', newApiKey ? 'Sim' : 'Não');
    setApiKey(newApiKey);
    setShowSetup(false);
  };

  // Loading inicial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="p-8 bg-gray-800 rounded-xl text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Iniciando aplicação...</p>
        </div>
      </div>
    );
  }

  // Mostra tela de configuração se necessário
  if (showSetup || !apiKey) {
    return <ApiKeySetup onSubmit={handleApiKeySubmit} />;
  }

  // Mostra a tela principal com a chave de API
  return <MainView initialApiKey={apiKey} />;
};