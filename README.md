# DocuMind

Uma aplicação desktop inteligente para análise de documentos usando IA, construída com Tauri, React e TypeScript.

## Sobre o Projeto

DocuMind é uma ferramenta poderosa que permite fazer upload de documentos e obter análises inteligentes geradas por IA. A aplicação processa diferentes tipos de arquivos e fornece resumos detalhados, insights e estatísticas, tudo armazenado localmente para garantir sua privacidade.

## Funcionalidades

- **Análise Inteligente de Documentos**: Upload e análise automática usando OpenAI GPT-4
- **Múltiplos Formatos**: Suporte para PDF, TXT, DOC, DOCX, JSON, MD, CSV
- **Extração de PDF**: Processamento avançado de texto em arquivos PDF
- **Dashboard de Insights**: Estatísticas e métricas dos documentos analisados
- **Armazenamento Local**: Todos os dados ficam no seu dispositivo
- **Interface Moderna**: Design responsivo e intuitivo
- **Navegação por Tabs**: Organização clara das funcionalidades

## Capturas de Tela

### Interface Principal

A aplicação possui uma navegação limpa com tabs para diferentes seções:

- **UPLOAD**: Para enviar novos documentos
- **ARQUIVOS ANALISADOS**: Visualizar documentos processados
- **INSIGHTS**: Dashboard com estatísticas
- **CONFIGURAÇÕES**: Gerenciar API keys e preferências

### Tipos de Análise

- Resumos automáticos de documentos
- Análises detalhadas de conteúdo
- Extração de insights principais
- Estatísticas de uso

## Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Desktop**: Tauri v2
- **Styling**: Tailwind CSS
- **IA**: OpenAI API (GPT-4 Mini)
- **PDF**: PDF.js para extração de texto
- **Ícones**: Lucide React / SVG customizados

## Pré-requisitos

- Node.js 18+
- Rust 1.70+
- Chave da API OpenAI

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/documind.git
cd documind
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o ambiente de desenvolvimento do Tauri:

```bash
npm run tauri dev
```

## Configuração

### API OpenAI

1. Obtenha sua chave API em [OpenAI Platform](https://platform.openai.com/api-keys)
2. Na aplicação, vá para **Configurações**
3. Insira sua chave API
4. A chave é armazenada localmente de forma segura

### Formatos Suportados

- **PDF**: Extração completa de texto
- **TXT**: Texto simples
- **DOC/DOCX**: Documentos do Word (visualização básica)
- **JSON**: Arquivos estruturados
- **MD**: Markdown
- **CSV**: Dados tabulares

## Build para Produção

### Desenvolvimento

```bash
npm run tauri dev
```

### Build da aplicação

```bash
npm run tauri build
```

O executável será gerado em `src-tauri/target/release/`.

## Estrutura do Projeto

```
documind/
├── src/                    # Código React/TypeScript
│   ├── components/         # Componentes da interface
│   │   ├── ApiKeySetup.tsx
│   │   ├── FileUpload.tsx
│   │   ├── MainView.tsx
│   │   ├── Navigation.tsx
│   │   ├── Summary.tsx
│   │   ├── Insights.tsx
│   │   └── Settings.tsx
│   ├── App.tsx            # Componente principal
│   └── main.tsx           # Entry point
├── src-tauri/             # Código Rust/Tauri
│   ├── src/
│   │   └── main.rs        # Backend Tauri
│   ├── Cargo.toml         # Dependências Rust
│   └── tauri.conf.json    # Configurações Tauri
├── public/                # Assets estáticos
└── package.json           # Dependências Node.js
```

## Uso

1. **Primeira Execução**: Configure sua chave OpenAI nas configurações
2. **Upload**: Arraste arquivos para a área de upload ou clique para selecionar
3. **Análise**: Aguarde o processamento automático
4. **Visualização**: Navegue entre as tabs para ver resultados e insights
5. **Gerenciamento**: Visualize histórico na seção "Arquivos Analisados"

## Privacidade e Segurança

- ✅ **Dados Locais**: Todos os arquivos e análises ficam no seu dispositivo
- ✅ **API Segura**: Chave OpenAI armazenada localmente
- ✅ **Sem Telemetria**: Nenhum dado é enviado para servidores externos
- ✅ **Open Source**: Código auditável e transparente

## Limitações

- Requer conexão com internet para análise IA
- Arquivos PDF muito grandes podem demorar para processar
- Documentos Word (.doc/.docx) têm extração de texto limitada
- Limite de tokens da OpenAI pode afetar documentos muito extensos

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Roadmap

- [ ] Suporte a mais formatos de arquivo
- [ ] Análise offline com modelos locais
- [ ] Exportação de relatórios
- [ ] Integração com outros provedores de IA
- [ ] Sistema de tags e categorização
- [ ] Busca avançada nos documentos

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/documind](https://github.com/seu-usuario/documind)

---

## IDE Recomendado

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
