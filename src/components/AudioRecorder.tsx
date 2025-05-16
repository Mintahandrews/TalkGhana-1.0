import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Loader2,
  AlertCircle,
  Volume2,
  FastForward,
} from "lucide-react";
import { asrService } from "../services/asrService";
import { AudioPlayer } from "../services/audioPlaybackService";
import { toast } from "sonner";
import { Slider } from "./ui/Slider";

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
  const [volume, setVolume] = useState(1.0);
  const [speed, setSpeed] = useState(1.0);
  const [asrStatus, setAsrStatus] = useState<string>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    // Initialize audio player
    audioPlayerRef.current = new AudioPlayer({
      volume: volume,
      playbackRate: speed,
    });

    return () => {
      // Cleanup audio player
      audioPlayerRef.current?.destroy();
    };
  }, []);

  // Check ASR service status
  useEffect(() => {
    const checkStatus = () => {
      setAsrAvailable(asrService.isAvailable());
      setAsrStatus(asrService.getStatus());
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
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

          // Load audio for playback
          if (audioPlayerRef.current) {
            await audioPlayerRef.current.loadAudio(audioBlob);
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

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setVolume(value);
    }
  };

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setSpeed(value);
    }
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

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {/* Recording controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`p-4 rounded-full transition-colors ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? (
              <Square className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {isRecording && (
            <div className="text-lg font-mono">{formatTime(recordingTime)}</div>
          )}
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-4 w-full">
          <Volume2 className="w-5 h-5" />
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]) => handleVolumeChange(value)}
            className="flex-1"
          />
          <span className="w-12 text-right">{Math.round(volume * 100)}%</span>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-4 w-full">
          <FastForward className="w-5 h-5" />
          <Slider
            value={[speed]}
            min={0.25}
            max={2.5}
            step={0.25}
            onValueChange={([value]) => handleSpeedChange(value)}
            className="flex-1"
          />
          <span className="w-12 text-right">{speed}x</span>
        </div>

        {/* Status indicator */}
        {(isTranscribing || asrStatus === "transcribing") && (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Transcribing audio...</span>
          </div>
        )}

        {error && (
          <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
