export type TabType = 'upload' | 'analyzed' | 'insights' | 'settings';

export interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasApiKey: boolean;
}