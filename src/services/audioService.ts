/**
 * Audio Recording and Processing Service
 * Handles audio recording, conversion, and temporary storage
 */

// Supported audio formats
export type AudioFormat = "webm" | "mp3" | "wav" | "ogg";

// Audio recording options
export interface RecordingOptions {
  format?: AudioFormat;
  sampleRate?: number;
  channels?: number;
  maxDuration?: number; // in seconds
}

// Default recording options
const DEFAULT_OPTIONS: RecordingOptions = {
  format: "webm",
  sampleRate: 44100,
  channels: 1,
  maxDuration: 300, // 5 minutes
};

// Class to manage audio recording
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: BlobPart[] = [];
  private stream: MediaStream | null = null;
  private options: RecordingOptions;
  private startTime: number = 0;
  private durationInterval: number | null = null;
  private onDurationUpdate: ((duration: number) => void) | null = null;
  private onRecordingComplete: ((blob: Blob) => void) | null = null;

  constructor(options: RecordingOptions = DEFAULT_OPTIONS) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  // Start recording
  async start(
    onDurationUpdate?: (duration: number) => void,
    onRecordingComplete?: (blob: Blob) => void
  ): Promise<void> {
    try {
      this.onDurationUpdate = onDurationUpdate || null;
      this.onRecordingComplete = onRecordingComplete || null;
      this.audioChunks = [];

      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.options.sampleRate,
          channelCount: this.options.channels,
        },
      });

      // Create media recorder
      this.mediaRecorder = new MediaRecorder(this.stream);

      // Event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.stopDurationTracking();
        const audioBlob = new Blob(this.audioChunks, {
          type: `audio/${this.options.format}`,
        });

        // Release microphone
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        // Callback
        if (this.onRecordingComplete) {
          this.onRecordingComplete(audioBlob);
        }
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      this.startTime = Date.now();
      this.startDurationTracking();

      // Auto-stop after max duration
      if (this.options.maxDuration) {
        setTimeout(() => {
          if (this.mediaRecorder?.state === "recording") {
            this.stop();
          }
        }, this.options.maxDuration * 1000);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      throw new Error(
        "Failed to access microphone. Please check your permissions."
      );
    }
  }

  // Stop recording
  stop(): void {
    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.stop();
    }
  }

  // Pause recording
  pause(): void {
    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.pause();
    }
  }

  // Resume recording
  resume(): void {
    if (this.mediaRecorder?.state === "paused") {
      this.mediaRecorder.resume();
    }
  }

  // Get current recording state
  get state(): "inactive" | "recording" | "paused" {
    return this.mediaRecorder?.state || "inactive";
  }

  // Start tracking duration
  private startDurationTracking(): void {
    if (this.onDurationUpdate) {
      this.durationInterval = window.setInterval(() => {
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        if (this.onDurationUpdate) {
          this.onDurationUpdate(duration);
        }
      }, 1000);
    }
  }

  // Stop tracking duration
  private stopDurationTracking(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }
}

// Convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // Remove the data URL prefix
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert Blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Convert blob to ArrayBuffer
export const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert Blob to ArrayBuffer"));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

// Convert between audio formats (requires Web Audio API)
export const convertAudioFormat = async (
  blob: Blob,
  targetFormat: AudioFormat,
  options: { sampleRate?: number } = {}
): Promise<Blob> => {
  try {
    const arrayBuffer = await blobToArrayBuffer(blob);
    const audioContext = new AudioContext({ sampleRate: options.sampleRate });

    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Create offline context for rendering
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    // Create source node
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    // Render audio
    const renderedBuffer = await offlineContext.startRendering();

    // Convert to target format
    const mimeType = `audio/${targetFormat}`;

    // Check if format is supported
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      throw new Error(
        `Format ${targetFormat} is not supported by your browser`
      );
    }

    // Create new blob with target format
    return new Promise((resolve) => {
      const mediaStreamDest = audioContext.createMediaStreamDestination();
      const source = audioContext.createBufferSource();
      source.buffer = renderedBuffer;
      source.connect(mediaStreamDest);
      source.start(0);

      const mediaRecorder = new MediaRecorder(mediaStreamDest.stream, {
        mimeType,
      });
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      };

      mediaRecorder.start();
      setTimeout(
        () => mediaRecorder.stop(),
        renderedBuffer.duration * 1000 + 100
      );
    });
  } catch (error) {
    console.error("Error converting audio format:", error);
    throw new Error("Failed to convert audio format");
  }
};

// Validate audio file
export const validateAudioFile = (file: File) => {
  // Check file type
  const validTypes = [
    "audio/mp3",
    "audio/mpeg",
    "audio/wav",
    "audio/wave",
    "audio/webm",
    "audio/ogg",
  ];
  const fileType = file.type;

  if (!validTypes.includes(fileType)) {
    return {
      valid: false,
      error: `Unsupported file type: ${fileType}. Please upload MP3, WAV, WebM, or OGG files.`,
    };
  }

  // Check file size (25MB max)
  const maxSize = 25 * 1024 * 1024; // 25MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(
        2
      )}MB). Maximum size is 25MB.`,
    };
  }

  return { valid: true, error: null };
};

// Format time in seconds to MM:SS
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};
