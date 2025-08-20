// src/components/ApiKeySetup.tsx
import React, { useState } from 'react';

interface ApiKeySetupProps {
  onSubmit: (apiKey: string) => void;
}

// Componente para a tela de configuração inicial da chave de API.
// É a primeira tela que o usuário verá.
export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-100">Bem-vindo!</h1>
        <p className="text-center text-gray-400 mb-8">
          Para começar, por favor, insira sua chave de API.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="sua-api-key-aqui"
            className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-md"
          >
            Salvar e Continuar
          </button>
        </form>
         <p className="text-xs text-gray-500 mt-6 text-center">
          Sua chave de API é armazenada localmente e nunca é compartilhada.
        </p>
      </div>
    </div>
  );
};