export const analyzeContractWithOpenAI = async (text: string, fileName: string, apiKey: string): Promise<{ preview: string; analyse: string }> => {
  const maxLength = 10000;
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '\n\n[Texto truncado devido ao tamanho...]' : text;

  const contractPrompt = `Instruções Gerais:\nVocê é um assistente jurídico altamente especializado em análise de contratos. Sua missão é ler atentamente o documento fornecido e gerar uma análise completa, crítica e estratégica. Você deve identificar informações objetivas, resumir cláusulas e apontar riscos, obrigações e direitos relevantes.\n\nTarefas obrigatórias:\n\nIdentificar e destacar:\n- Valor do contrato (se houver).\n- Fornecedor / Contratado e Contratante.\n- Data de assinatura e vigência do contrato.\n\nAnalisar todas as cláusulas, resumindo-as e destacando:\n- Obrigações de cada parte.\n- Prazos de execução, entregas e vigência.\n- Penalidades, multas e consequências de inadimplemento.\n- Condições de rescisão e renovação automática.\n- Garantias, responsabilidades e limites de responsabilidade.\n- Cláusulas de confidencialidade, propriedade intelectual e não concorrência (se aplicável).\n\nIdentificar informações críticas e riscos jurídicos, como:\n- Obrigações financeiras que podem impactar o fluxo de caixa.\n- Penalidades excessivas ou desproporcionais.\n- Condições ambíguas que podem gerar disputas.\n- Cláusulas que favorecem uma parte de forma desbalanceada.\n\nSugerir perguntas ou pontos de atenção que deveriam ser revisados antes da assinatura, incluindo possíveis ajustes ou negociações.\n\nFormato de resposta estruturado:\n\nValor do contrato: [inserir valor ou “Não informado”]\nFornecedor / Contratado: [nome ou “Não informado”]\nContratante: [nome ou “Não informado”]\nData de assinatura / Vigência: [datas ou “Não informado”]\nResumo detalhado das cláusulas:\nCláusula 1 – [resumo completo, destacando obrigações, prazos e riscos]\nCláusula 2 – [idem]\n…\nRiscos e pontos críticos:\n[Listar pontos de atenção, riscos financeiros, jurídicos ou operacionais]\nPerguntas estratégicas para revisão do contrato:\n[Sugestões de pontos que deveriam ser questionados ou negociados]\nInformações adicionais úteis: [outras observações que impactem execução, compliance ou gestão do contrato]\n\nInstruções especiais:\n- Analise cláusula por cláusula, não deixe nenhum detalhe de fora.\n- Destaque valores, datas, obrigações e penalidades com atenção máxima.\n- Se alguma informação estiver ausente, informe explicitamente como “Não informado”.\n- Seja claro, objetivo e estruturado.\n- Priorize riscos financeiros, jurídicos e estratégicos, além de informações práticas para execução do contrato.`;

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
          content: contractPrompt
        },
        {
          role: 'user',
          content: `Analise o seguinte contrato: "${fileName}"\n\n${truncatedText}`
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

  // O preview pode ser a primeira linha ou um resumo inicial
  const preview = content.split('\n').find((line: string) => line.trim() !== '') || '';

  return {
    preview,
    analyse: content
  };
};
