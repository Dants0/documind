import { Summary } from "./Summary";

export interface FileUploadProps {
  onAnalysisComplete: (newSummary: Omit<Summary, 'id' | 'date'>) => void;
  apiKey: string;
}
