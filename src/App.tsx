// src/App.tsx
import React from 'react';
import { ApiKeySetup } from './components/ApyKeySetup';
import { MainView } from './components/MainView';


// Este é o componente principal da sua aplicação.
// Ele decide qual tela mostrar ao usuário. Se a chave de API
// ainda não foi configurada, mostra a tela de configuração.
// Caso contrário, mostra a tela principal do aplicativo.
const App: React.FC = () => {
  // Estado para armazenar a chave de API.
  // No futuro, você irá carregar e salvar essa chave de forma segura
  // usando as funcionalidades do Tauri/Rust.
  // Por enquanto, vamos simular com um estado simples.
  const [apiKey, setApiKey] = React.useState<string | null>(null);

  // Função para "salvar" a chave de API.
  const handleApiKeySubmit = (key: string) => {
    console.log('API Key saved:', key); // Log para depuração
    setApiKey(key);
    // Aqui você chamaria uma função do Tauri para salvar a chave
    // de forma persistente e segura no dispositivo do usuário.
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {/* Renderização condicional: se não houver chave, mostra a tela de setup. */}
      {!apiKey ? (
        <ApiKeySetup onSubmit={handleApiKeySubmit} />
      ) : (
        <MainView />
      )}
    </div>
  );
};

export default App;