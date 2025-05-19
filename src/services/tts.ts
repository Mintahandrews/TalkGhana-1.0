import axios, { AxiosRequestConfig } from 'axios';
import { HfInference } from '@huggingface/inference';

const HF_API_KEY = process.env.REACT_APP_HUGGINGFACE_API_KEY || '';
const hf = new HfInference(HF_API_KEY);

// Define supported languages with their display names and language codes
export const SUPPORTED_TTS_LANGUAGES = {
  twi: { name: 'Twi', code: 'twi' },
  english: { name: 'English', code: 'eng' },
  french: { name: 'French', code: 'fra' },
  spanish: { name: 'Spanish', code: 'spa' },
} as const;

export type TTSSupportedLanguage = keyof typeof SUPPORTED_TTS_LANGUAGES;

// Define the structure of the TTS options
export interface TTSOptions {
  language?: TTSSupportedLanguage;
  model?: string;
  useCache?: boolean;
  signal?: AbortSignal;
}

// Define the structure of the TTS result
export interface TTSResult {
  audioBuffer: ArrayBuffer;
  sampleRate: number;
  duration: number;
  isFromCache?: boolean;
}

// Cache for audio buffers
const audioCache = new Map<string, TTSResult>();

// Default TTS options
const DEFAULT_TTS_OPTIONS: TTSOptions = {
  language: 'twi',
  model: 'facebook/mms-tts-eng',
  useCache: true,
};

/**
 * Convert text to speech using Hugging Face's TTS API
 * @param text The text to convert to speech
 * @param options TTS options including language and model settings
 * @returns A promise that resolves to the TTS result
 */
export async function textToSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<TTSResult> {
  const mergedOptions = { ...DEFAULT_TTS_OPTIONS, ...options };
  const { language, model, useCache, signal } = mergedOptions;

  // Create a cache key based on the text and options
  const cacheKey = `${model}:${language}:${text}`;

  // Return cached result if available and caching is enabled
  if (useCache && audioCache.has(cacheKey)) {
    const cached = audioCache.get(cacheKey)!;
    return { ...cached, isFromCache: true };
  }

  try {
    // Call Hugging Face TTS API
    const response = await hf.textToSpeech({
      model,
      inputs: text,
      parameters: {
        language: SUPPORTED_TTS_LANGUAGES[language]?.code || 'eng',
      },
    });

    // Convert response to ArrayBuffer
    const audioBuffer = await response.arrayBuffer();

    // Create audio context to get duration
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioData = await audioCtx.decodeAudioData(audioBuffer.slice(0));

    // Create the result object
    const result: TTSResult = {
      audioBuffer,
      sampleRate: audioCtx.sampleRate,
      duration: audioData.duration,
    };
          default:
            errorMessage = error.response.data?.error || error.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
        errorCode = 'NO_RESPONSE';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    const ttsError = new Error(errorMessage) as Error & { code?: string };
    ttsError.code = errorCode;
    throw ttsError;
  }
}

/**
 * Save TTS audio to a file (browser-only)
 * @param audioBuffer The audio buffer to save
 * @param filename The output filename
 */
export function downloadAudio(audioBuffer: ArrayBuffer, filename: string): void {
  try {
    // Create a Blob from the audio buffer
    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.wav') ? filename : `${filename}.wav`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw new Error('Failed to download audio');
  }
}

/**
 * Generate a unique filename for TTS audio
 * @param language The language code
 * @param format The audio format (default: wav)
 * @returns A unique filename with timestamp and random string
 */
export function generateTTSFilename(language: string, format = 'wav'): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `tts_${language}_${timestamp}_${randomStr}.${format}`;
}

// Export the main TTS function and utilities
export default {
  textToSpeech,
  downloadAudio,
  generateTTSFilename,
  SUPPORTED_TTS_LANGUAGES,
};
