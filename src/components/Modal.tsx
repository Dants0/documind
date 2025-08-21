import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useRef, useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';

// Utilitário para dividir texto em frases
function splitTextInSentences(text: string) {
  return text.match(/[^.!?]+[.!?]+[\])'"`’”]*|.+/g) || [];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, content }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);

  // Estado para frase selecionada e explicação
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    // Limpa seleção ao fechar modal
    if (!isOpen) {
      setSelectedSentence(null);
      setExplanation(null);
      setLoadingExplanation(false);
    }
  }, [isOpen]);

  // Scroll automático para explicação ao selecionar frase
  useEffect(() => {
    if (selectedSentence && explanationRef.current) {
      explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedSentence, explanation]);

  // Exporta PDF na web
  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);

    const lines = content.split('\n');
    let y = 20;

    lines.forEach(line => {
      // Detecta títulos em Markdown (**Título:**)
      const match = line.match(/^\*\*(.+?)\*\*\s*:?/);
      if (match) {
        doc.setFont("helvetica", "bold");
        doc.text(match[1], 10, y);
        doc.setFont("helvetica", "normal");
        // Remove o título da linha para imprimir o resto, se houver
        const rest = line.replace(/^\*\*.+?\*\*\s*:?\s*/, '');
        if (rest) {
          y += 7;
          const wrapped = doc.splitTextToSize(rest, 180);
          wrapped.forEach((wrapLine: string) => {
            doc.text(wrapLine, 10, y);
            y += 7;
          });
        }
        y += 7; // Espaço extra após título
      } else if (line.trim() !== "") {
        // Texto normal
        const wrapped = doc.splitTextToSize(line, 180);
        wrapped.forEach((wrapLine: string) => {
          doc.text(wrapLine, 10, y);
          y += 7;
        });
        y += 7;
      } else {
        y += 7; // Linha em branco
      }
      // Quebra de página se necessário
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    alert("O resumo se encontra em Downloads!")
    doc.save(`${title.replace(/\.[^/.]+$/, "")}-resumo.pdf`);
  };

  // Função para buscar explicação da IA (mock)
  const explainSentence = async (sentence: string) => {
    setLoadingExplanation(true);
    setExplanation(null);
    setSelectedSentence(sentence);

    // Aqui você pode integrar com sua API/IA real
    // Exemplo mock:
    setTimeout(() => {
      setExplanation(
        `Explicação simplificada para: "${sentence.trim()}"\n\nExemplo prático: Imagine que este conceito está sendo aplicado em uma situação real, facilitando o entendimento do contexto.`
      );
      setLoadingExplanation(false);
    }, 1200);
  };

  // Customização do ReactMarkdown para frases clicáveis mantendo o negrito
  const MarkdownWithClickableSentences = ({ children }: { children: string }) => (
    <ReactMarkdown
      components={{
        p({ children }) {
          // children pode conter elementos React (inclusive <strong>)
          // Vamos montar um array de frases, preservando o negrito
          const elements: React.ReactNode[] = [];
          let buffer: React.ReactNode[] = [];

          function flushBuffer() {
            if (buffer.length > 0) {
              elements.push(buffer);
              buffer = [];
            }
          }

          React.Children.forEach(children, (child) => {
            if (typeof child === 'string') {
              // Split em frases
              const sentences = splitTextInSentences(child);
              sentences.forEach((sentence) => {
                buffer.push(sentence);
                flushBuffer();
              });
            } else if (React.isValidElement(child) && child.type === 'strong') {
              // Se for <strong>, preserve o negrito
              const strongChildren = (child as React.ReactElement<any>).props.children;
              if (typeof strongChildren === 'string') {
                const sentences = splitTextInSentences(strongChildren);
                sentences.forEach((sentence, idx) => {
                  buffer.push(<strong key={idx}>{sentence}</strong>);
                  flushBuffer();
                });
              } else if (Array.isArray(strongChildren)) {
                strongChildren.forEach((grandChild, idx) => {
                  if (typeof grandChild === 'string') {
                    const sentences = splitTextInSentences(grandChild);
                    sentences.forEach((sentence, j) => {
                      buffer.push(<strong key={idx + '-' + j}>{sentence}</strong>);
                      flushBuffer();
                    });
                  } else {
                    buffer.push(<strong key={idx}>{grandChild}</strong>);
                    flushBuffer();
                  }
                });
              }
            } else {
              buffer.push(child);
              flushBuffer();
            }
          });

          // Renderiza cada frase/buffer como um span clicável
          return (
            <p>
              {elements.map((fragment, idx) => (
                <span
                  key={idx}
                  className={`cursor-pointer hover:bg-blue-900/30 transition rounded px-1 ${
                    selectedSentence ===
                    (Array.isArray(fragment)
                      ? fragment.map(f => (typeof f === 'string' ? f : f.props.children)).join('')
                      : typeof fragment === 'string'
                        ? fragment
                        : '')
                      ? 'bg-blue-900/50 font-bold'
                      : ''
                  }`}
                  onClick={() => {
                    const sentenceText = Array.isArray(fragment)
                      ? fragment.map(f => (typeof f === 'string' ? f : f.props.children)).join('')
                      : typeof fragment === 'string'
                        ? fragment
                        : '';
                    explainSentence(sentenceText);
                  }}
                >
                  {fragment}{' '}
                </span>
              ))}
            </p>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] p-8 flex flex-col">
              <button
                className="absolute top-5 right-6 text-gray-400 hover:text-white text-2xl"
                onClick={onClose}
                aria-label="Fechar"
              >
                &times;
              </button>
              <Dialog.Title className="text-2xl text-gray-200 font-bold mb-4">{title}</Dialog.Title>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleExportPdf}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Exportar PDF
                </button>
              </div>
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto text-gray-200 whitespace-pre-line pr-2 prose prose-invert max-w-none"
              >
                <MarkdownWithClickableSentences>{content}</MarkdownWithClickableSentences>
                {selectedSentence && (
                  <div
                    ref={explanationRef}
                    className="mt-4 p-4 bg-gray-800 rounded shadow text-white"
                  >
                    <div className="font-bold mb-2">Explicação:</div>
                    {loadingExplanation ? (
                      <span>Carregando explicação...</span>
                    ) : (
                      <span style={{ whiteSpace: 'pre-line' }}>{explanation}</span>
                    )}
                    <button
                      className="ml-4 text-sm text-blue-400 underline"
                      onClick={() => {
                        setSelectedSentence(null);
                        setExplanation(null);
                      }}
                    >
                      Fechar
                    </button>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};