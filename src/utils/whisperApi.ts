import { client, type Submission } from '@gradio/client';

// API endpoints
const WHISPER_API_BASE = 'https://7860-gpu-t4-hm-1kxp6a45yamjq-c.europe-west4-0.prod.colab.dev';

// Types
export interface WhisperTranscription {
  text: string;
  language?: string;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  confidence?: number;
}

export interface WhisperTranslation extends WhisperTranscription {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface WhisperOptions {
  language?: string;
  task?: 'transcribe' | 'translate';
  targetLanguage?: string;
  endpointIndex?: number; // 0: record audio, 1: upload audio
  recordingDuration?: number; // For recorded audio, duration in seconds (1-10)
}

export interface YouTubeTranscriptionOptions {
  youtubeURL: string;
  language?: string;
  task?: 'transcribe' | 'translate';
  targetLanguage?: string;
}

export type WhisperEndpointIndex = 0 | 1;

// Cache for transcriptions to avoid repeated API calls
type CacheKey = string;
type CacheValue = { timestamp: number; result: WhisperTranscription | WhisperTranslation };
const transcriptionCache = new Map<CacheKey, CacheValue>();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Generate a cache key based on the audio data and options
 */
const generateCacheKey = (
  audio: Blob | string,
  options?: WhisperOptions
): string => {
  const audioHash = typeof audio === 'string' 
    ? audio 
    : `blob-${audio.size}-${audio.type}`;
  
  return `${audioHash}-${JSON.stringify(options || {})}`;
};

/**
 * Check if a cached result exists and is valid
 */
const getFromCache = (key: CacheKey): WhisperTranscription | WhisperTranslation | null => {
  const cached = transcriptionCache.get(key);
  if (!cached) return null;
  
  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    transcriptionCache.delete(key);
    return null;
  }
  
  return cached.result;
};

/**
 * Add a result to the cache
 */
const addToCache = (
  key: CacheKey, 
  result: WhisperTranscription | WhisperTranslation
): void => {
  transcriptionCache.set(key, {
    timestamp: Date.now(),
    result
  });
  
  // Clean up old cache entries - no need for immediate timeout
  // Only clean up cache when it reaches a certain size to improve performance
  if (transcriptionCache.size > 50) {
    const now = Date.now();
    for (const [key, value] of transcriptionCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        transcriptionCache.delete(key);
      }
    }
  }
};

/**
 * Initialize Gradio client with error handling
 */
const getClient = async () => {
  try {
    return await client(WHISPER_API_BASE);
  } catch (error) {
    console.error('Failed to initialize Whisper API client:', error);
    throw new Error('Failed to connect to Whisper API. Please try again later.');
  }
};

/**
 * Process the API response into a standardized format
 */
const processTranscriptionResponse = (data: string): WhisperTranscription => {
  if (!data) {
    throw new Error('Invalid response from Whisper API');
  }
  
  return {
    text: data || '',
    language: 'auto',
    confidence: 1.0
  };
};

/**
 * Process the translation API response
 */
const processTranslationResponse = (
  data: string,
  sourceLanguage: string,
  targetLanguage: string
): WhisperTranslation => {
  const transcription = processTranscriptionResponse(data);
  
  return {
    ...transcription,
    sourceLanguage,
    targetLanguage
  };
};

/**
 * Transcribe audio using the Whisper API
 */
export const transcribeAudio = async (
  audioBlob: Blob,
  options: WhisperOptions = {}
): Promise<WhisperTranscription> => {
  const cacheKey = generateCacheKey(audioBlob, options);
  const cached = getFromCache(cacheKey);
  if (cached) return cached as WhisperTranscription;
  
  try {
    const app = await getClient();
    
    // Determine which endpoint to use (0: record audio, 1: upload audio)
    const endpointIndex: WhisperEndpointIndex = 
      options.endpointIndex !== undefined ? options.endpointIndex as WhisperEndpointIndex : 1;
    
    let result: Submission;
    
    if (endpointIndex === 0) {
      // Endpoint 0: Record Audio
      result = await app.predict(0, [
        audioBlob,
        options.recordingDuration || 10 // Default to max duration
      ]);
    } else {
      // Endpoint 1: Upload Audio
      result = await app.predict(1, [
        audioBlob
      ]);
    }
    
    if (!result || !result.data) {
      throw new Error('Empty response from Whisper API');
    }
    
    const response = processTranscriptionResponse(result.data as string);
    addToCache(cacheKey, response);
    return response;
  } catch (error) {
    console.error('Error calling Whisper API:', error);
    if (error instanceof Error) {
      if (error.message.includes('429')) {
        throw new Error('Whisper API rate limit exceeded. Please try again later.');
      }
      throw error;
    }
    throw new Error('Failed to transcribe audio');
  }
};

/**
 * Translate audio using the Whisper API
 * Note: The current API doesn't support direct translation, 
 * so we'll need to transcribe first and then translate the text
 */
export const translateAudio = async (
  audioBlob: Blob,
  targetLanguage: string = 'en',
  options: Omit<WhisperOptions, 'targetLanguage'> = {}
): Promise<WhisperTranslation> => {
  const fullOptions = { ...options, targetLanguage, task: 'translate' as const };
  const cacheKey = generateCacheKey(audioBlob, fullOptions);
  const cached = getFromCache(cacheKey);
  if (cached) return cached as WhisperTranslation;
  
  try {
    // First transcribe the audio
    const transcription = await transcribeAudio(audioBlob, options);
    
    // For now, return the transcription as a translation
    // In a real implementation, you would send the text to a translation API
    const response: WhisperTranslation = {
      ...transcription,
      sourceLanguage: transcription.language || 'auto',
      targetLanguage,
      text: `[Translation to ${targetLanguage}]: ${transcription.text}`
    };
    
    addToCache(cacheKey, response);
    return response;
  } catch (error) {
    console.error('Error translating audio:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to translate audio');
  }
};

/**
 * Transcribe a YouTube video
 * Note: The current API doesn't support YouTube transcription,
 * so this is a placeholder for future implementation
 */
export const transcribeYouTube = async (
  options: YouTubeTranscriptionOptions
): Promise<WhisperTranscription> => {
  const cacheKey = generateCacheKey(options.youtubeURL, options);
  const cached = getFromCache(cacheKey);
  if (cached) return cached as WhisperTranscription;
  
  try {
    throw new Error('YouTube video transcription is not supported by the current API');
  } catch (error) {
    console.error('Error transcribing YouTube video:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to transcribe YouTube video');
  }
};

/**
 * Select the optimal API endpoint based on input type and options
 */
export const selectOptimalEndpoint = (
  inputType: 'audio' | 'youtube',
  options?: WhisperOptions
): WhisperEndpointIndex => {
  // For now, just use upload audio endpoint as default
  return 1;
};
