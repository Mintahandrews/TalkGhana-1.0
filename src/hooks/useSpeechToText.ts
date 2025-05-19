import { useState, useCallback, useRef } from 'react';
import { transcribeAudio } from '../services/asr';

interface UseSpeechToTextOptions {
  language?: string;
  onTranscriptionStart?: () => void;
  onTranscriptionEnd?: (text: string) => void;
  onError?: (error: Error) => void;
}

export const useSpeechToText = (options: UseSpeechToTextOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          setIsTranscribing(true);
          options.onTranscriptionStart?.();
          
          const result = await transcribeAudio(audioBlob, options.language);
          const transcribedText = result.text;
          
          setTranscript(transcribedText);
          setError(null);
          
          // Call the onTranscriptionEnd callback if provided
          options.onTranscriptionEnd?.(transcribedText);
        } catch (err) {
          console.error('Transcription error:', err);
          const error = err instanceof Error ? err : new Error('Failed to transcribe audio');
          setError(error.message);
          options.onError?.(error);
        } finally {
          setIsTranscribing(false);
        }
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please ensure you have granted microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  };
};
