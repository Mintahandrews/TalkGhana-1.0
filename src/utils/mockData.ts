import { v4 as uuidv4 } from 'uuid';

// User data
export const mockUser = {
  id: '1',
  name: 'Emmanuel Ofori',
  email: 'emmanuel@talkghana.com',
  avatar: 'https://ui-avatars.com/api/?name=Emmanuel+Ofori&background=random',
  role: 'User',
  joined: '2024-03-15',
  lastActive: '2025-05-14',
  settings: {
    language: 'en',
    darkMode: false,
    notifications: true,
    audioQuality: 'high',
    autoSave: true
  }
};

// Saved Phrases
export const mockPhrases = [
  {
    id: uuidv4(),
    text: 'Akwaaba! Welcome to Ghana!',
    language: 'en',
    category: 'Greetings',
    isFavorite: true,
    lastUsed: '2025-05-10'
  },
  {
    id: uuidv4(),
    text: 'Ɛte sɛn? How are you?',
    language: 'twi',
    category: 'Greetings',
    isFavorite: true,
    lastUsed: '2025-05-12'
  },
  {
    id: uuidv4(),
    text: 'Me din de... My name is...',
    language: 'twi',
    category: 'Introduction',
    isFavorite: false,
    lastUsed: '2025-05-01'
  },
  {
    id: uuidv4(),
    text: 'Medaase! Thank you!',
    language: 'twi',
    category: 'Common Phrases',
    isFavorite: true,
    lastUsed: '2025-05-14'
  },
  {
    id: uuidv4(),
    text: 'Yɛbɛhyia bio! See you again!',
    language: 'twi',
    category: 'Farewells',
    isFavorite: false,
    lastUsed: '2025-04-30'
  }
];

// Recent transcriptions
export const mockTranscriptions = [
  {
    id: uuidv4(),
    audio: 'audio1.mp3',
    text: 'The weather in Accra is beautiful today.',
    language: 'en',
    timestamp: '2025-05-14T14:32:00Z',
    duration: 4.2
  },
  {
    id: uuidv4(),
    audio: 'audio2.mp3',
    text: 'Ɛnnɛ yɛbɛkɔ Makola dwam.',
    language: 'twi',
    timestamp: '2025-05-13T09:15:00Z',
    duration: 3.8
  },
  {
    id: uuidv4(),
    audio: 'audio3.mp3',
    text: 'Please direct me to the nearest hospital.',
    language: 'en',
    timestamp: '2025-05-12T16:45:00Z',
    duration: 2.9
  }
];

// WhatsApp Contacts
export const mockContacts = [
  {
    id: uuidv4(),
    name: 'Kofi Mensah',
    phoneNumber: '+233501234567',
    lastContacted: '2025-05-13T10:42:00Z',
    frequency: 12
  },
  {
    id: uuidv4(),
    name: 'Ama Agyei',
    phoneNumber: '+233551234567',
    lastContacted: '2025-05-11T08:30:00Z',
    frequency: 8
  },
  {
    id: uuidv4(),
    name: 'Kwame Osei',
    phoneNumber: '+233201234567',
    lastContacted: '2025-05-09T14:15:00Z',
    frequency: 5
  }
];

// Help topics
export const mockHelpTopics = [
  {
    id: uuidv4(),
    title: 'Getting Started with TalkGhana',
    category: 'Basics',
    content: 'Learn the basics of using TalkGhana for speech recognition and translation.',
    videoUrl: 'https://example.com/tutorials/getting-started'
  },
  {
    id: uuidv4(),
    title: 'Speech to Text Conversion',
    category: 'Features',
    content: 'How to use the Speech to Text feature for transcribing spoken words.',
    videoUrl: 'https://example.com/tutorials/speech-to-text'
  },
  {
    id: uuidv4(),
    title: 'Text to Speech Conversion',
    category: 'Features',
    content: 'Converting written text to spoken words using TalkGhana.',
    videoUrl: 'https://example.com/tutorials/text-to-speech'
  },
  {
    id: uuidv4(),
    title: 'Using the Phrase Bank',
    category: 'Features',
    content: 'Saving and organizing commonly used phrases for quick access.',
    videoUrl: 'https://example.com/tutorials/phrase-bank'
  },
  {
    id: uuidv4(),
    title: 'WhatsApp Integration',
    category: 'Integration',
    content: 'Sharing TalkGhana audio outputs via WhatsApp.',
    videoUrl: 'https://example.com/tutorials/whatsapp-integration'
  }
];

// Languages supported
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'twi', name: 'Twi' },
  { code: 'ga', name: 'Ga' },
  { code: 'ewe', name: 'Ewe' },
  { code: 'dagbani', name: 'Dagbani' },
  { code: 'hausa', name: 'Hausa' },
  { code: 'fr', name: 'French' }
];
