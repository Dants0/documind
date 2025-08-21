use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SemanticData {
    pub keywords: Vec<String>,
    pub themes: Vec<String>,
    pub language: String,
    pub complexity_score: f32,
    pub readability_score: f32,
    pub word_count: usize,
    pub sentiment_score: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KeywordAnalysis {
    pub word: String,
    pub frequency: usize,
    pub relevance: f32,
}

pub struct SemanticAnalyzer {
    // Palavras comuns portuguesas para filtrar
    stop_words: Vec<String>,
    // Padrões de complexidade
    complexity_patterns: Vec<Regex>,
}

impl SemanticAnalyzer {
    pub fn new() -> Self {
        let stop_words = vec![
            "o", "a", "os", "as", "um", "uma", "uns", "umas", "e", "ou", "mas", "que", "de", "do",
            "da", "dos", "das", "em", "no", "na", "nos", "nas", "por", "para", "com", "se", "é",
            "são", "foi", "foram", "ser", "estar", "ter", "haver", "este", "esta", "estes",
            "estas", "esse", "essa", "esses", "essas", "aquele", "aquela", "aqueles", "aquelas",
            "seu", "sua", "seus", "suas", "meu", "minha", "meus", "minhas", "nosso", "nossa",
            "nossos", "nossas", "muito", "mais", "menos", "bem", "mal", "melhor", "pior", "quando",
            "onde", "como", "porque", "porquê", "qual", "quais", "já", "ainda", "sempre", "nunca",
            "também", "só", "apenas", "pode", "podem", "poderia", "poderiam", "deve", "devem",
        ]
        .iter()
        .map(|s| s.to_string())
        .collect();

        let complexity_patterns = vec![
            Regex::new(r"\b\w{12,}\b").unwrap(), // Palavras muito longas
            Regex::new(r"[;:]").unwrap(),        // Pontuação complexa
            Regex::new(r"\b(todavia|outrossim|não obstante|conquanto|porquanto)\b").unwrap(), // Conectivos complexos
        ];

        Self {
            stop_words,
            complexity_patterns,
        }
    }

    pub fn analyze_text(&self, text: &str) -> SemanticData {
        let cleaned_text = self.clean_text(text);
        let words = self.tokenize(&cleaned_text);

        SemanticData {
            keywords: self.extract_keywords(&words),
            themes: self.identify_themes(&cleaned_text),
            language: self.detect_language(&cleaned_text),
            complexity_score: self.calculate_complexity(&cleaned_text, &words),
            readability_score: self.calculate_readability(&cleaned_text, &words),
            word_count: words.len(),
            sentiment_score: self.analyze_sentiment(&cleaned_text),
        }
    }

    fn clean_text(&self, text: &str) -> String {
        // Remove caracteres especiais e normaliza espaços
        let re = Regex::new(r"[^\w\s\.,;:!?\-]").unwrap();
        re.replace_all(text, " ").to_string().to_lowercase()
    }

    fn tokenize(&self, text: &str) -> Vec<String> {
        text.split_whitespace()
            .map(|word| word.trim_matches(|c: char| !c.is_alphanumeric()))
            .filter(|word| !word.is_empty() && word.len() > 2)
            .map(|word| word.to_string())
            .collect()
    }

    fn extract_keywords(&self, words: &[String]) -> Vec<String> {
        let mut word_freq: HashMap<String, usize> = HashMap::new();

        // Contar frequência das palavras (excluindo stop words)
        for word in words {
            if !self.stop_words.contains(word) && word.len() > 3 {
                *word_freq.entry(word.clone()).or_insert(0) += 1;
            }
        }

        // Ordenar por frequência e pegar as 10 mais importantes
        let mut keywords: Vec<_> = word_freq.into_iter().collect();
        keywords.sort_by(|a, b| b.1.cmp(&a.1));

        keywords
            .into_iter()
            .take(10)
            .map(|(word, _)| word)
            .collect()
    }

    fn identify_themes(&self, text: &str) -> Vec<String> {
        let mut themes = Vec::new();

        // Temas baseados em palavras-chave específicas
        let theme_patterns = vec![
            (
                "Tecnologia",
                vec![
                    "tecnologia",
                    "software",
                    "sistema",
                    "digital",
                    "computador",
                    "internet",
                ],
            ),
            (
                "Negócios",
                vec![
                    "empresa", "negócio", "mercado", "vendas", "cliente", "produto",
                ],
            ),
            (
                "Educação",
                vec![
                    "ensino",
                    "aprendizagem",
                    "escola",
                    "universidade",
                    "curso",
                    "estudante",
                ],
            ),
            (
                "Saúde",
                vec![
                    "saúde",
                    "médico",
                    "tratamento",
                    "paciente",
                    "hospital",
                    "medicina",
                ],
            ),
            (
                "Finanças",
                vec![
                    "dinheiro",
                    "investimento",
                    "banco",
                    "financeiro",
                    "economia",
                    "capital",
                ],
            ),
            (
                "Jurídico",
                vec![
                    "lei",
                    "direito",
                    "jurídico",
                    "advogado",
                    "tribunal",
                    "processo",
                ],
            ),
            (
                "Marketing",
                vec![
                    "marketing",
                    "publicidade",
                    "marca",
                    "campanha",
                    "propaganda",
                    "comunicação",
                ],
            ),
            (
                "Recursos Humanos",
                vec![
                    "funcionário",
                    "contratação",
                    "rh",
                    "treinamento",
                    "carreira",
                    "salário",
                ],
            ),
        ];

        let text_lower = text.to_lowercase();
        for (theme_name, keywords) in theme_patterns {
            let matches = keywords
                .iter()
                .filter(|keyword| text_lower.contains(*keyword))
                .count();

            if matches >= 2 {
                // Pelo menos 2 palavras-chave do tema
                themes.push(theme_name.to_string());
            }
        }

        themes
    }

    fn detect_language(&self, text: &str) -> String {
        // Detecção básica de idioma baseada em palavras comuns
        let portuguese_indicators = ["que", "não", "com", "uma", "para", "são", "dos", "mais"];
        let english_indicators = ["the", "and", "for", "are", "with", "this", "have", "from"];
        let spanish_indicators = ["que", "con", "una", "para", "son", "los", "más", "como"];

        let text_words: Vec<&str> = text.split_whitespace().collect();
        let total_words = text_words.len() as f32;

        let pt_score = portuguese_indicators
            .iter()
            .map(|indicator| text_words.iter().filter(|word| word == &indicator).count())
            .sum::<usize>() as f32
            / total_words;

        let en_score = english_indicators
            .iter()
            .map(|indicator| text_words.iter().filter(|word| word == &indicator).count())
            .sum::<usize>() as f32
            / total_words;

        let es_score = spanish_indicators
            .iter()
            .map(|indicator| text_words.iter().filter(|word| word == &indicator).count())
            .sum::<usize>() as f32
            / total_words;

        if pt_score > en_score && pt_score > es_score {
            "Português".to_string()
        } else if en_score > es_score {
            "Inglês".to_string()
        } else if es_score > 0.0 {
            "Espanhol".to_string()
        } else {
            "NE".to_string()
        }
    }

    fn calculate_complexity(&self, text: &str, words: &[String]) -> f32 {
        let mut complexity_score = 1.0;

        // Fator 1: Comprimento médio das palavras
        let avg_word_length =
            words.iter().map(|w| w.len()).sum::<usize>() as f32 / words.len() as f32;
        complexity_score += (avg_word_length - 4.0).max(0.0) * 0.5;

        // Fator 2: Comprimento das frases
        let sentences = text.split(&['.', '!', '?'][..]).count();
        let avg_sentence_length = words.len() as f32 / sentences as f32;
        complexity_score += (avg_sentence_length - 15.0).max(0.0) * 0.1;

        // Fator 3: Padrões de complexidade
        for pattern in &self.complexity_patterns {
            let matches = pattern.find_iter(text).count() as f32;
            complexity_score += matches * 0.3;
        }

        // Fator 4: Vocabulário único
        let unique_words = words.iter().collect::<std::collections::HashSet<_>>().len() as f32;
        let vocabulary_ratio = unique_words / words.len() as f32;
        complexity_score += vocabulary_ratio * 2.0;

        complexity_score.min(10.0).max(1.0)
    }

    fn calculate_readability(&self, text: &str, words: &[String]) -> f32 {
        // Implementação simplificada do índice Flesch
        let sentences = text
            .split(&['.', '!', '?'][..])
            .filter(|s| !s.trim().is_empty())
            .count() as f32;
        let syllables = words
            .iter()
            .map(|word| self.count_syllables(word))
            .sum::<usize>() as f32;
        let word_count = words.len() as f32;

        if sentences == 0.0 || word_count == 0.0 {
            return 50.0; // Score neutro
        }

        let avg_sentence_length = word_count / sentences;
        let avg_syllables_per_word = syllables / word_count;

        // Fórmula adaptada para português
        let flesch_score =
            248.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word);

        flesch_score.max(0.0).min(100.0)
    }

    fn count_syllables(&self, word: &str) -> usize {
        // Contagem básica de sílabas baseada em vogais
        let vowels = [
            'a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú', 'â', 'ê', 'ô', 'à', 'ã', 'õ',
        ];
        let mut count = 0;
        let mut prev_was_vowel = false;

        for char in word.chars() {
            let is_vowel = vowels.contains(&char.to_lowercase().next().unwrap_or(' '));
            if is_vowel && !prev_was_vowel {
                count += 1;
            }
            prev_was_vowel = is_vowel;
        }

        count.max(1) // Pelo menos 1 sílaba
    }

    fn analyze_sentiment(&self, text: &str) -> f32 {
        // Análise básica de sentimento
        let positive_words = [
            "bom",
            "ótimo",
            "excelente",
            "positivo",
            "sucesso",
            "importante",
            "melhor",
        ];
        let negative_words = [
            "ruim", "péssimo", "problema", "erro", "falha", "negativo", "pior",
        ];

        let words: Vec<&str> = text.split_whitespace().collect();
        let total_words = words.len() as f32;

        let positive_count = positive_words
            .iter()
            .map(|word| {
                words
                    .iter()
                    .filter(|w| w.to_lowercase().contains(word))
                    .count()
            })
            .sum::<usize>() as f32;

        let negative_count = negative_words
            .iter()
            .map(|word| {
                words
                    .iter()
                    .filter(|w| w.to_lowercase().contains(word))
                    .count()
            })
            .sum::<usize>() as f32;

        if total_words == 0.0 {
            return 0.0;
        }

        let sentiment = (positive_count - negative_count) / total_words;
        sentiment.max(-1.0).min(1.0)
    }
}
