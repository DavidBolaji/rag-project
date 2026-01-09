export interface QuestionResponse {
  answer: string;
  intent: 'visa_eligibility' | 'document_requirements' | 'general_info';
  sources: string[];
}

export interface ConversationTurn {
  question: string;
  answer: string;
}

export interface SpeechResponse {
  text: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  // { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  // { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  // { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  // { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
];