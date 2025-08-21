export interface Summary {
  id: number;
  title: string;
  date: string;
  preview: string;
  analyse: string;

  keywords?: string[];
  themes?: string[];
  language?: string;
  complexityScore?: number;
  readabilityScore?: number;
  wordCount?: number;
  sentimentScore?: number; 
}