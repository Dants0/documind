export interface SemanticInsight {
  keywords: Array<{
    word: string;
    frequency: number;
    relevance: number;
  }>;
  themes: Array<{
    theme: string;
    confidence: number;
    documentCount: number;
  }>;
  languages: Array<{
    language: string;
    code: string;
    documentCount: number;
    percentage: number;
  }>;
  complexity: {
    average: number;
    distribution: {
      simple: number; // 1-3
      medium: number; // 4-6
      complex: number; // 7-10
    };
  };
  readability: {
    average: number;
    classification: 'Muito Fácil' | 'Fácil' | 'Moderado' | 'Difícil' | 'Muito Difícil';
  };
}
