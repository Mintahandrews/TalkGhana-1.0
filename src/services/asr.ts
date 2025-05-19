import axios, { AxiosError } from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/asr' 
  : 'http://localhost:3000/api/asr';

// Language-specific configurations
const LANGUAGE_CONFIGS: Record<string, { model?: string; task?: string }> = {
  twi: { model: 'openai/whisper-medium', task: 'transcribe' },
  ga: { model: 'openai/whisper-medium', task: 'transcribe' },
  ee: { model: 'openai/whisper-medium', task: 'transcribe' },
  ha: { model: 'openai/whisper-medium', task: 'transcribe' },
  dag: { model: 'openai/whisper-medium', task: 'transcribe' },
  en: { model: 'openai/whisper-large-v3', task: 'transcribe' }
};

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  confidence?: number;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
}

interface TranscriptionErrorResponse {
  error: string;
  details?: any;
}

const MAX_FILE_SIZE_MB = 50;
const SUPPORTED_AUDIO_TYPES = [
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/mp3',
  'audio/mp4',
  'audio/mpeg',
  'audio/m4a',
  'audio/x-m4a',
];

/**
 * Validates the audio blob before sending it to the API
 */
function validateAudioBlob(blob: Blob): void {
  // Check file size (50MB limit)
  if (blob.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`Audio file is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`);
  }

  // Check MIME type
  if (blob.type && !SUPPORTED_AUDIO_TYPES.includes(blob.type)) {
    throw new Error(
      `Unsupported audio format: ${blob.type}. Supported formats: ${SUPPORTED_AUDIO_TYPES.join(', ')}`
    );
  }
}

/**
 * Transcribes an audio blob using the Hugging Face ASR API
 * @param audioBlob The audio data to transcribe
 * @param language Optional language code (e.g., 'en', 'es', 'fr')
 * @param model Optional model name (defaults to 'openai/whisper-large-v3')
 * @returns A promise that resolves to the transcription result
 */
export async function transcribeAudio(
  audioBlob: Blob,
  language: string = 'en',
  modelName?: string
): Promise<TranscriptionResult> {
  // Get language-specific configuration
  const langConfig = LANGUAGE_CONFIGS[language] || {};
  const model = modelName || langConfig.model || 'openai/whisper-large-v3';
  const task = langConfig.task || 'transcribe';
  try {
    // Validate the audio blob before sending
    validateAudioBlob(audioBlob);

    const formData = new FormData();
    const fileExtension = audioBlob.type.split('/')[1] || 'webm';
    formData.append('audio', audioBlob, `recording.${fileExtension}`);
    
    // Add required parameters
    formData.append('language', language);
    formData.append('model', model);
    formData.append('task', task);
    
    console.log('Sending transcription request:', {
      language,
      model,
      task,
      fileType: audioBlob.type,
      fileSize: `${(audioBlob.size / (1024 * 1024)).toFixed(2)}MB`
    });

    const response = await axios.post<TranscriptionResult>(
      `${API_URL}/transcribe`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          model: modelName,
          language: language
        },
        withCredentials: true,
        timeout: 300000, // 5 minutes timeout for large files
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<TranscriptionErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to transcribe audio';
      throw new Error(errorMessage);
    }
    
    // Re-throw any non-API errors
    throw error;
  }
}

/**
 * Transcribes an audio file from a URL
 * @param audioUrl The URL of the audio file to transcribe
 * @param language Optional language code (e.g., 'en', 'es', 'fr')
 * @param model Optional model name (defaults to 'openai/whisper-large-v3')
 * @returns A promise that resolves to the transcription result
 */
export async function transcribeAudioFromUrl(
  audioUrl: string,
  language?: string,
  model: string = 'openai/whisper-large-v3'
): Promise<TranscriptionResult> {
  try {
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio from URL: ${response.statusText}`);
    }
    
    const audioBlob = await response.blob();
    return transcribeAudio(audioBlob, language, model);
  } catch (error) {
    console.error('Error fetching audio from URL:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch audio from URL'
    );
  }
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

/**
 * Gets the list of supported Ghanaian languages
 * @returns A promise that resolves to an array of language options
 */
export async function getSupportedLanguages(): Promise<LanguageOption[]> {
  try {
    const response = await axios.get<{ languages: LanguageOption[] }>(
      `${API_URL}/languages`
    );
    return response.data.languages;
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    // Return the simplified list of supported Ghanaian languages if the API call fails
    return [
      { code: 'twi', name: 'Twi', nativeName: 'Twi' },
      { code: 'ga', name: 'Ga', nativeName: 'Ga' },
      { code: 'ee', name: 'Ewe', nativeName: 'Eʋe' },
      { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
      { code: 'dag', name: 'Dagbani', nativeName: 'Dagbanli' },
      { code: 'en', name: 'English', nativeName: 'English' }
    ];
  }
}
