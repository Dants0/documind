export const analyzeWithOpenAI = async (text: string, fileName: string, apiKey: string): Promise<{ preview: string; analyse: string }> => {
  const maxLength = 10000;
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '\n\n[Texto truncado devido ao tamanho...]' : text;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em análise de documentos. Você deve fornecer duas coisas: 1) Um resumo breve (preview) de 2-3 linhas, 2) Uma análise detalhada do documento cobrindo os pontos principais, insights e conclusões.'
        },
        {
          role: 'user',
          content: `Analise o seguinte documento "${fileName}":\n\n${truncatedText}\n\nResponda SEMPRE em texto direto, nunca em JSON. Forneça um resumo breve (máx. 2 linhas) e uma análise detalhada, ambos em texto corrido, claros, objetivos e sucintos. Use Markdown para destacar títulos e tópicos, se necessário.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Erro na API OpenAI: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Resposta vazia da OpenAI');
  }

  return {
    preview: "",
    analyse: content
  };
};