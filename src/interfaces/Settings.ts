
export interface SettingsProps {
  apiKey: string | null;
  onApiKeyUpdate: (apiKey: string | null) => void;
}