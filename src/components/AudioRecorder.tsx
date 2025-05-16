import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, AlertCircle } from "lucide-react";
import { asrService } from "../services/asrService";
import { toast } from "sonner";

export type TranscriptionResult = {
  text: string;
  language: string;
  confidence?: number;
  segments?: any[];
};

interface AudioRecorderProps {
  onTranscriptionComplete?: (result: TranscriptionResult) => void;
  showTranslateOption?: boolean;
}

const AudioRecorder = ({
  onTranscriptionComplete,
  showTranslateOption,
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [asrAvailable, setAsrAvailable] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Check if ASR service is available
  useEffect(() => {
    setAsrAvailable(asrService.isAvailable());
  }, []);

  // Manage recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setError(null);

      if (!asrAvailable) {
        toast.error(
          "Speech recognition is not available. Please check your configuration."
        );
        setError(
          "ASR service is not configured properly. Check your Hugging Face token."
        );
        return;
      }

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
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setIsTranscribing(true);

        try {
          // Check if we have audio data
          if (audioChunksRef.current.length === 0 || audioBlob.size < 1000) {
            throw new Error("No audio data recorded. Please try again.");
          }

          // Transcribe the audio
          const text = await asrService.transcribeAudio(audioBlob);

          // Create a result object
          const result: TranscriptionResult = {
            text,
            language: "akan", // Default to Akan as this is the model we're using
            confidence: 0.9, // Placeholder - in a real app you'd get this from the API
          };

          onTranscriptionComplete?.(result);
        } catch (err) {
          console.error("Transcription error:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to transcribe audio. Please try again."
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start(1000); // Capture in 1-second chunks
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      setError(
        "Failed to access microphone. Please ensure you have granted permission and no other app is using it."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  // Format recording time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!asrAvailable && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-3 rounded-md mb-2 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">
            API token missing. Speech recognition is limited.
          </span>
        </div>
      )}

      <div className="relative">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          className={`p-4 rounded-full transition-all duration-300 ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#075E54] hover:bg-[#064e45]"
          } text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isTranscribing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <Square className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
        {isRecording && (
          <div className="absolute -inset-1 bg-red-500 rounded-full animate-ping opacity-75"></div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2 max-w-[300px] text-center">
          {error}
        </div>
      )}

      <div className="text-gray-600 dark:text-gray-300 text-sm flex flex-col items-center">
        <p>
          {isRecording
            ? `Recording... ${formatTime(recordingTime)}`
            : isTranscribing
            ? "Transcribing..."
            : "Click to start recording"}
        </p>
        {isRecording && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Click again to stop
          </p>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
