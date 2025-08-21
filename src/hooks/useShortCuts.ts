import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';

export const useShortcuts = () => {
  useEffect(() => {
    let unlisten: any;

    const setupListener = async () => {
      // Configurar listener para eventos de atalho
      unlisten = await listen('shortcut-event', (event) => {
        console.log('Shortcut event received:', event.payload);

        switch (event.payload) {
          case 'Ctrl+D triggered':
            handleCtrlD();
            break;
          case 'Alt+Space triggered':
            handleAltSpace();
            break;
          default:
            console.log('Unknown shortcut:', event.payload);
        }
      });
    };

    const handleCtrlD = () => {
      console.log('Ctrl+D action executed');
      // Implementar sua ação aqui
      // Exemplos:
      // - Abrir modal de busca
      // - Criar novo documento
      // - Executar comando específico

      // Exemplo: disparar evento customizado
      window.dispatchEvent(new CustomEvent('ctrl-d-pressed'));
    };

    const handleAltSpace = () => {
      console.log('Alt+Space action executed');
      // Implementar sua ação aqui
      // Exemplos:
      // - Focar no input de pesquisa
      // - Abrir menu de comandos
      // - Toggle de alguma funcionalidade

      // Exemplo: focar no input de busca
      const searchInput: any = document.querySelector('input[type="search"]');
      if (searchInput) {
        searchInput.focus();
      }
    };

    setupListener();

    // Cleanup function
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);
};