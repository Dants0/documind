import React, { useState } from 'react';
import { writeTextFile, readTextFile, BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';

interface SettingsProps {
  apiKey: string | null;
  onApiKeyUpdate: (apiKey: string | null) => void;
}

export const Settings: React.FC<SettingsProps> = ({ apiKey, onApiKeyUpdate }) => {
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const SETTINGS_FILE = 'settings.json';
  const SETTINGS_PATH = 'settings';

  const ensureSettingsDirectory = async () => {
    try {
      const dirExists = await exists(SETTINGS_PATH, { baseDir: BaseDirectory.AppConfig });
      if (!dirExists) {
        await mkdir(SETTINGS_PATH, {
          baseDir: BaseDirectory.AppConfig,
          recursive: true
        });
      }
    } catch (error) {
      console.error('Erro ao garantir diretório de configurações:', error);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = inputValue.trim();

    if (!key) {
      alert('Por favor, insira uma chave de API válida');
      return;
    }

    setIsLoading(true);
    try {
      await ensureSettingsDirectory();
      const settingsData = { apiKey: key };

      await writeTextFile(
        `${SETTINGS_PATH}/${SETTINGS_FILE}`,
        JSON.stringify(settingsData, null, 2),
        { baseDir: BaseDirectory.AppConfig }
      );

      onApiKeyUpdate(key);
      setIsEditing(false);
      setInputValue('');
      console.log('Chave de API salva com sucesso');
    } catch (error) {
      alert('Erro ao salvar chave de API: ' + error);
      console.error('Erro ao salvar chave de API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveApiKey = async () => {
    if (!confirm('Tem certeza que deseja remover a chave de API salva?')) {
      return;
    }

    setIsLoading(true);
    try {
      await ensureSettingsDirectory();
      await writeTextFile(`${SETTINGS_PATH}/${SETTINGS_FILE}`, JSON.stringify({}), {
        baseDir: BaseDirectory.AppConfig
      });

      onApiKeyUpdate(null);
      setInputValue('');
      console.log('Chave de API removida com sucesso');
    } catch (error) {
      console.error('Erro ao limpar chave de API:', error);
      alert('Erro ao remover a chave. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '***...***';
    return `${key.slice(0, 4)}${'*'.repeat(Math.max(4, key.length - 8))}${key.slice(-4)}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setInputValue(apiKey || '');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Configurações</h2>
        <p className="text-gray-400">Gerencie suas preferências e configurações da aplicação</p>
      </div>

      {/* API Configuration */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <h3 className="text-xl font-semibold text-white">Chave da API OpenAI</h3>
        </div>

        {apiKey && !isEditing ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-700 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Chave configurada:</p>
                  <code className="text-green-400 font-mono text-sm">{maskApiKey(apiKey)}</code>
                </div>
                <div className="flex items-center space-x-2 text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Ativa</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Alterar</span>
              </button>
              <button
                onClick={handleRemoveApiKey}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remover</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveApiKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {apiKey ? 'Nova chave de API:' : 'Chave de API OpenAI:'}
              </label>
              <input
                type="password"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Sua chave é armazenada localmente e nunca é compartilhada.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>Salvar</span>
                  </>
                )}
              </button>

              {apiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setInputValue('');
                  }}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* App Information */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-white">Sobre a Aplicação</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Nome:</span>
              <span className="text-white font-medium">DocuMind</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Versão:</span>
              <span className="text-white font-medium">1.1.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Tecnologia:</span>
              <span className="text-white font-medium">Tauri + React</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">IA:</span>
              <span className="text-white font-medium">OpenAI GPT-4</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Formatos:</span>
              <span className="text-white font-medium">PDF, TXT, DOC, etc.</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Armazenamento:</span>
              <span className="text-white font-medium">Local</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <p className="text-gray-300 text-sm">
            DocuMind é uma ferramenta de análise de documentos que utiliza inteligência artificial
            para gerar resumos e insights de seus arquivos. Todos os dados são processados e
            armazenados localmente em seu dispositivo, garantindo privacidade e segurança.
          </p>
        </div>
      </div>

      {/* Support & Help */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5z" />
          </svg>
          <h3 className="text-xl font-semibold text-white">Suporte & Ajuda</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-medium text-white">Documentação</p>
                <p className="text-sm text-gray-400">Guias de uso</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-white">FAQ</p>
                <p className="text-sm text-gray-400">Perguntas frequentes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};