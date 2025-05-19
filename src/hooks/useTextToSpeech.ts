import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { textToSpeech, TTSOptions, TTSResult, SUPPORTED_TTS_LANGUAGES } from '../services/tts';

// Error codes that can be returned by the hook
export const TTS_ERRORS = {
  NO_AUDIO_CONTEXT: 'NO_AUDIO_CONTEXT',
  DECODE_ERROR: 'DECODE_ERROR',
  PLAYBACK_ERROR: 'PLAYBACK_ERROR',
  ABORTED: 'ABORTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Define the interface for the hook's return type
interface UseTextToSpeechReturn {
  /**
   * Convert text to speech and play it
   * @param text The text to convert to speech
   * @param options TTS options including language and cache settings
   * @returns Promise that resolves when playback is complete or rejects on error
   */
  speak: (text: string, options: TTSOptions) => Promise<TTSResult>;
  
  /**
   * Stop the currently playing audio
   */
  stop: () => void;
  
  /**
   * Whether audio is currently playing
   */
  isPlaying: boolean;
  
  /**
   * Whether the TTS service is currently loading
   */
  isLoading: boolean;
  
  /**
   * The last error that occurred, if any
   */
  error: Error | null;
  
  /**
   * Object containing supported languages and their metadata
   */
  supportedLanguages: typeof SUPPORTED_TTS_LANGUAGES;
  
  /**
   * Current playback progress (0-1)
   */
  progress: number;
  
  /**
   * Current playback time in seconds
   */
  currentTime: number;
  
  /**
   * Total duration of the current audio in seconds
   */
  duration: number;
}

// Default options for the TTS hook
const DEFAULT_TTS_OPTIONS: TTSOptions = {
  language: 'twi',
  useCache: true,
};

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  // State management
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  
  // Refs for audio objects
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      // Cancel any pending animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Stop any ongoing TTS requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // Clean up HTML5 Audio element
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
        audioElementRef.current = null;
      }
      
      // Clean up Web Audio API resources
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      
      if (analyserNodeRef.current) {
        analyserNodeRef.current.disconnect();
        analyserNodeRef.current = null;
      }
      
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
        audioContextRef.current = null;
      }
      
      // Reset state
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
    };
  }, []);

  /**
   * Stop currently playing audio and clean up resources
   */
  const stop = useCallback(() => {
    // Cancel any pending animation frames
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Handle HTML5 Audio element
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    
    // Handle Web Audio API resources
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        console.warn('Error stopping audio source:', e);
      }
      sourceNodeRef.current = null;
    }
    
    if (analyserNodeRef.current) {
      analyserNodeRef.current.disconnect();
      analyserNodeRef.current = null;
    }
    
    // Reset state
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    
    // Don't close the AudioContext here as it can be reused
  }, []);

  /**
   * Update the progress and current time of the playing audio
   */
  const updatePlaybackProgress = useCallback(() => {
    if (!audioContextRef.current) return;
    
    // Calculate progress based on current time and duration
    if (duration > 0) {
      const currentTime = audioContextRef.current.currentTime;
      const progress = Math.min(currentTime / duration, 1);
      setCurrentTime(currentTime);
      setProgress(progress);
    }
    
    // Continue the animation loop if still playing
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updatePlaybackProgress);
    }
  }, [duration, isPlaying]);

  /**
   * Play audio from an ArrayBuffer using Web Audio API
   */
  const playAudio = useCallback(async (audioBuffer: ArrayBuffer, sampleRate: number) => {
    // Create audio context if it doesn't exist
    let audioCtx = audioContextRef.current;
    const isNewContext = !audioCtx;
    
    if (isNewContext) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate // Use the sample rate from the TTS service
      });
      audioContextRef.current = audioCtx;
    }

    // Ensure we have a valid audio context
    if (!audioCtx) {
      throw new Error('Failed to create audio context');
    }

    try {
      stop(); // Stop any currently playing audio
      
      // Create a new AbortController for this playback
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      // Resume the audio context if it's suspended (required by autoplay policies)
      if (audioCtx.state === 'suspended') {
        try {
          await audioCtx.resume();
        } catch (e) {
          console.warn('Failed to resume audio context:', e);
          throw new Error('Audio playback requires user interaction. Please click/tap to start.');
        }
      }

      // Check if the operation was aborted
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      // Create nodes for audio processing
      const source = audioCtx.createBufferSource();
      sourceNodeRef.current = source;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserNodeRef.current = analyser;
      
      // Connect the nodes: source -> analyser -> destination
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      // Decode the audio data
      let decodedData: AudioBuffer;
      try {
        decodedData = await audioCtx.decodeAudioData(audioBuffer.slice(0));
      } catch (e) {
        console.error('Error decoding audio data:', e);
        throw new Error('Failed to decode audio data');
      }
      
      // Set the duration for progress tracking
      setDuration(decodedData.duration);
      
      // Create a new buffer with the correct sample rate
      const buffer = audioCtx.createBuffer(
        decodedData.numberOfChannels,
        decodedData.length,
        sampleRate
      );

      // Copy the decoded audio data to the new buffer
      for (let channel = 0; channel < decodedData.numberOfChannels; channel++) {
        const channelData = decodedData.getChannelData(channel);
        buffer.copyToChannel(channelData, channel);
      }

      // Configure the source
      source.buffer = buffer;

      // Set up event handlers
      source.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        sourceNodeRef.current = null;
        setError(null);
      };
      
      // Handle errors using try-catch instead of onerror for better TypeScript support
      const onError = (event: Event) => {
        console.error('Audio playback error:', event);
        setIsPlaying(false);
        sourceNodeRef.current = null;
        setError(new Error('Audio playback failed'));
      };
      
      // Use addEventListener which is properly typed
      source.addEventListener('error', onError);
      
      // Start playback
      try {
        source.start(0);
        setIsPlaying(true);
        
        // Start progress updates
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(updatePlaybackProgress);
        
        // Return cleanup function
        return () => {
          source.removeEventListener('error', onError);
        };
      } catch (error) {
        console.error('Error starting audio playback:', error);
        setIsPlaying(false);
        throw new Error('Failed to start audio playback');
      }
      
    } catch (error) {
      console.error('Error in playAudio:', error);
      setIsPlaying(false);
      
      // Handle different types of errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw Object.assign(new Error('Playback was aborted'), { code: TTS_ERRORS.ABORTED });
      } else if (error instanceof Error && error.name === 'NotAllowedError') {
        throw Object.assign(
          new Error('Audio playback requires user interaction. Please click/tap to start.'),
          { code: TTS_ERRORS.PLAYBACK_ERROR }
        );
      } else if (error instanceof Error) {
        throw Object.assign(error, { code: TTS_ERRORS.PLAYBACK_ERROR });
      } else {
        throw Object.assign(
          new Error('Unknown error during playback'),
          { code: TTS_ERRORS.UNKNOWN_ERROR, cause: error }
        );
      }
    }
  }, [stop, updatePlaybackProgress]);

  /**
   * Convert text to speech and play it
   */
  const speak = useCallback(async (
    text: string, 
    options: TTSOptions = { language: 'twi' } // Provide default language
  ): Promise<TTSResult> => {
    // Skip empty text
    if (!text || typeof text !== 'string' || text.trim() === '') {
      const err = new Error('No text provided for speech synthesis');
      setError(err);
      throw err;
    }
    
    // Merge with default options
    const ttsOptions = { ...DEFAULT_TTS_OPTIONS, ...options };
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the TTS service with a timeout
      const result = await Promise.race([
        textToSpeech(text, { ...ttsOptions, signal: abortControllerRef.current?.signal }),
        new Promise<TTSResult>((_, reject) => {
          setTimeout(
            () => reject(new Error('TTS request timed out')),
            30000 // 30 second timeout
          );
        })
      ]);
      
      // Check if the operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      
      // Play the audio if we have a buffer
      if (result.audioBuffer) {
        try {
          await playAudio(result.audioBuffer, result.sampleRate);
        } catch (playbackError) {
          console.error('Playback error:', playbackError);
          throw playbackError;
        }
      }
      
      return result;
      
    } catch (err) {
      console.error('Error in speak:', err);
      
      // Handle different types of errors
      let errorToThrow: Error & { code?: string; cause?: unknown };
      
      if (err instanceof DOMException && err.name === 'AbortError') {
        errorToThrow = Object.assign(
          new Error('Speech synthesis was aborted'), 
          { code: TTS_ERRORS.ABORTED }
        );
      } else if (axios.isAxiosError(err)) {
        const axiosError = err as any; // Type assertion for AxiosError
        errorToThrow = Object.assign(
          new Error(axiosError.response?.data?.error || axiosError.message || 'Network error'),
          { code: TTS_ERRORS.NETWORK_ERROR, cause: err }
        );
      } else if (err instanceof Error) {
        errorToThrow = Object.assign(err, { 
          code: TTS_ERRORS.UNKNOWN_ERROR,
          cause: err 
        });
      } else {
        errorToThrow = Object.assign(
          new Error('Unknown error during speech synthesis'),
          { code: TTS_ERRORS.UNKNOWN_ERROR, cause: err }
        );
      }
      
      setError(errorToThrow as Error);
      throw errorToThrow;
      
    } finally {
      setIsLoading(false);
    }
  }, [playAudio]);

  // Return the public API of the hook
  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    error,
    supportedLanguages: SUPPORTED_TTS_LANGUAGES,
    progress,
    currentTime,
    duration,
  };
};

export default useTextToSpeech;
