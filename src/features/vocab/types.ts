export interface Notebook {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  created_at: string;
  word_count?: number;
}

export interface WordFamilyMember {
  pos: string;
  word: string;
  meaning_vi: string;
}

export interface VocabMetadata {
  phonetic?: string;
  audio_url?: string;
  detailed_explanation?: string;
  topic?: string;
  word_family?: WordFamilyMember[];
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  toeic_example?: string;
  toeic_example_translation?: string;
}

export interface VocabEntry {
  id: string;
  user_id: string;
  word: string;
  lemma: string;
  meaning: string;
  context_sentence: string;
  part_of_speech?: string;
  phonetic?: string;
  audio_url?: string;
  context_translation?: string;
  metadata?: VocabMetadata;
  source_question_id: string | null;
  notebook_id?: string | null;
  created_at: string;
  card?: {
    id: string;
    state: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
    stability: number;
    difficulty: number;
    due: string;
    reps: number;
    lapses: number;
  };
}

export interface SaveVocabParams {
  word: string;
  meaning: string;
  contextSentence: string;
  partOfSpeech?: string;
  phonetic?: string;
  contextTranslation?: string;
  questionId?: string;
  notebookId?: string | null;
}

export interface SaveVocabResult {
  success: boolean;
  isDuplicate?: boolean;
  message: string;
  entry?: VocabEntry;
}

export interface BatchVocabItem {
  word: string;
  meaning: string;
  partOfSpeech?: string;
  phonetic?: string;
}

export interface SaveBatchVocabParams {
  items: BatchVocabItem[];
  contextSentence: string;
  contextTranslation?: string;
  questionId?: string;
  notebookId?: string | null;
}

export interface SaveBatchVocabResult {
  success: boolean;
  savedCount: number;
  duplicateCount: number;
  message: string;
}
