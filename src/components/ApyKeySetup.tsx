import React, { useState, useEffect } from 'react';
import { writeTextFile, readTextFile, BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';

interface ApiKeySetupProps {
  onSubmit: (apiKey: string) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const SETTINGS_FILE = 'settings.json';
  const SETTINGS_PATH = 'settings'; 

  const ensureSettingsDirectory = async () => {
    try {
      const dirExists = await exists(SETTINGS_PATH, { baseDir: BaseDirectory.AppConfig });
      if (!dirExists) {
        console.log('Diretório de configurações não existe, criando...');
        await mkdir(SETTINGS_PATH, {
          baseDir: BaseDirectory.AppConfig,
          recursive: true
        });
        console.log('Diretório criado com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao garantir diretório de configurações:', error);
    }
  };

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        await ensureSettingsDirectory();

        const fileExists = await exists(`${SETTINGS_PATH}/${SETTINGS_FILE}`, { baseDir: BaseDirectory.AppConfig });

        if (fileExists) {
          const content = await readTextFile(`${SETTINGS_PATH}/${SETTINGS_FILE}`, {
            baseDir: BaseDirectory.AppConfig
          });
          const data = JSON.parse(content);
          if (data.apiKey && data.apiKey.trim()) {
            setSavedApiKey(data.apiKey.trim());
            console.log('Chave de API carregada com sucesso do arquivo');
          } else {
            console.log('Arquivo settings.json encontrado, mas sem chave de API');
          }
        } else {
          console.log('Arquivo settings.json não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar chave de API:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, []);

  useEffect(() => {
    if (savedApiKey && !isEditing && !isLoading) {
      console.log('Auto-enviando com chave existente');
      onSubmit(savedApiKey);
    }
  }, [savedApiKey, isEditing, isLoading, onSubmit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = inputValue.trim();

    if (!key) {
      alert('Por favor, insira uma chave de API válida');
      return;
    }

    try {
      console.log('Salvando nova chave de API no arquivo...');
      await ensureSettingsDirectory();
      const settingsData = { apiKey: key };

      await writeTextFile(
        `${SETTINGS_PATH}/${SETTINGS_FILE}`,
        JSON.stringify(settingsData, null, 2),
        { baseDir: BaseDirectory.AppConfig }
      );

      console.log('Chave de API salva com sucesso');
      setSavedApiKey(key);
      setIsEditing(false);
      onSubmit(key);
    } catch (error) {
      alert('Erro ao salvar chave de API: ' + error);
      console.error('Erro ao salvar chave de API:', error);
      alert('Aviso: Não foi possível salvar a chave permanentemente, mas você pode continuar.');
      setSavedApiKey(key);
      onSubmit(key);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setInputValue(savedApiKey || '');
  };

  const handleClear = async () => {
    if (!confirm('Tem certeza que deseja remover a chave de API salva?')) {
      return;
    }

    try {
      console.log('Removendo chave de API...');
      await ensureSettingsDirectory();
      await writeTextFile(`${SETTINGS_PATH}/${SETTINGS_FILE}`, JSON.stringify({}), {
        baseDir: BaseDirectory.AppConfig
      });

      setSavedApiKey(null);
      setInputValue('');
      setIsEditing(true);
      console.log('Chave de API removida com sucesso');
    } catch (error) {
      console.error('Erro ao limpar chave de API:', error);
      alert('Erro ao remover a chave. Tente novamente.');
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '***...***';
    return `${key.slice(0, 4)}${'*'.repeat(Math.max(4, key.length - 8))}${key.slice(-4)}`;
  };

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

  if (savedApiKey && !isEditing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="p-8 bg-gray-800 rounded-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-100 mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-center text-gray-400 mb-6">
            Chave de API encontrada:
          </p>

          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <code className="text-green-400 font-mono break-all">
              {maskApiKey(savedApiKey)}
            </code>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onSubmit(savedApiKey)}
              className="px-4 py-3 bg-blue-600 rounded-lg text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Continuar
            </button>

            <button
              onClick={handleEdit}
              className="px-4 py-3 bg-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors"
            >
              Alterar Chave
            </button>

            <button
              onClick={handleClear}
              className="px-4 py-3 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors"
            >
              Remover Chave
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="p-8 bg-gray-800 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-100 mb-2">
          {savedApiKey ? 'Alterar Chave de API' : 'Bem-vindo!'}
        </h1>
        <p className="text-center text-gray-400 mb-8">
          {savedApiKey
            ? 'Insira uma nova chave de API:'
            : 'Para começar, insira sua chave de API OpenAI.'
          }
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="sk-..."
            className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            autoFocus
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 rounded-lg text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Salvar e Continuar
            </button>

            {savedApiKey && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-3 bg-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Sua chave de API é armazenada localmente e nunca é compartilhada.
        </p>
      </div>
    </div>
  );
};

export default function App() {
  const handleApiKeySubmit = (key: string) => {
    console.log("Chave de API recebida com sucesso:", key);
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans">
      <ApiKeySetup onSubmit={handleApiKeySubmit} />
    </div>
  );
}