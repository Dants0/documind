import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';

export const useShortcuts = () => {
  useEffect(() => {
    let unlisten: any;

    const setupListener = async () => {
      unlisten = await listen('shortcut-event', (event) => {

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
      window.dispatchEvent(new CustomEvent('ctrl-d-pressed'));
    };

    const handleAltSpace = () => {
      const searchInput: any = document.querySelector('input[type="search"]');
      if (searchInput) {
        searchInput.focus();
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);
};