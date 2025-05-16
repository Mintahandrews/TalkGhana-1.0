/**
 * Audio Playback Service
 * Provides functionality for playing, pausing, and controlling audio playback
 */

// Playback states
export type PlaybackState =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "stopped"
  | "error";

// Audio player options
export interface AudioPlayerOptions {
  autoplay?: boolean;
  loop?: boolean;
  volume?: number;
  playbackRate?: number;
}

// Default options
const DEFAULT_OPTIONS: AudioPlayerOptions = {
  autoplay: false,
  loop: false,
  volume: 1.0,
  playbackRate: 1.0,
};

// Event callback types
type ProgressCallback = (time: number, duration: number) => void;
type StateChangeCallback = (state: PlaybackState) => void;
type ErrorCallback = (error: Error) => void;

/**
 * Audio Player class using Web Audio API
 */
export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private options: AudioPlayerOptions;
  private state: PlaybackState = "idle";
  private startTime: number = 0;
  private pausedTime: number = 0;
  private duration: number = 0;
  private progressInterval: number | null = null;

  // Callbacks
  private onProgress: ProgressCallback | null = null;
  private onStateChange: StateChangeCallback | null = null;
  private onError: ErrorCallback | null = null;

  constructor(options: AudioPlayerOptions = DEFAULT_OPTIONS) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Load audio from a blob or file
   */
  async loadAudio(audioData: Blob | File): Promise<void> {
    try {
      this.setState("loading");

      // Clean up previous resources
      this.stop(); // Ensure any existing playback is fully stopped and resources are cleared

      // Revoke previous object URL if it exists
      if (this.audio && this.audio.src && this.audio.src.startsWith("blob:")) {
        URL.revokeObjectURL(this.audio.src);
      }

      // Create URL from blob
      const audioUrl = URL.createObjectURL(audioData);

      // Check if Web Audio API is supported
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn(
          "Web Audio API not supported, falling back to HTML5 Audio"
        );
        return this.fallbackToHtmlAudio(audioUrl);
      }

      try {
        // Initialize audio context if not already done
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        } else if (this.audioContext.state === "suspended") {
          // Resume audio context if it was suspended
          await this.audioContext.resume();
        } else if (this.audioContext.state === "closed") {
          // Re-initialize if closed
          this.audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        }

        // Create new audio element (or reuse if preferred, but new is cleaner here)
        this.audio = new Audio(audioUrl);
        this.audio.preload = "auto";

        // Convert to ArrayBuffer
        const arrayBuffer = await audioData.arrayBuffer();

        // Decode audio data with timeout to prevent hanging
        const decodePromise = this.audioContext.decodeAudioData(arrayBuffer);

        // Set a timeout to catch hanging decodeAudioData calls (which can happen in some browsers)
        const timeoutPromise = new Promise<AudioBuffer>((_, reject) => {
          setTimeout(
            () => reject(new Error("Audio decoding timed out")),
            10000
          );
        });

        this.audioBuffer = await Promise.race([decodePromise, timeoutPromise]);
        this.duration = this.audioBuffer.duration;
        this.pausedTime = 0; // Reset paused time for new audio

        // Create gain node for volume control
        if (this.gainNode) {
          try {
            this.gainNode.disconnect();
          } catch (e) {
            /* ignore */
          }
        }
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.options.volume || 1.0;
        // Ensure gainNode is connected to destination, even if sourceNode is not yet active
        // This connection will be made when play() is called.

        this.setState("idle");

        // Autoplay if enabled
        if (this.options.autoplay) {
          this.play();
        }
      } catch (webAudioError) {
        // If Web Audio API processing fails, fall back to HTML5 Audio
        console.warn(
          "Web Audio API processing failed, falling back to HTML5 Audio:",
          webAudioError
        );
        return this.fallbackToHtmlAudio(audioUrl);
      }
    } catch (error) {
      console.error("Error loading audio:", error);
      this.setState("error");
      this.handleError(
        error instanceof Error ? error : new Error("Failed to load audio")
      );
      // Ensure cleanup on load error
      this.audioBuffer = null;
      this.duration = 0;
    }
  }

  // Fallback to basic HTML5 Audio when Web Audio API fails
  private async fallbackToHtmlAudio(audioUrl: string): Promise<void> {
    try {
      // Create and configure HTML5 Audio element for fallback playback
      this.audio = new Audio(audioUrl);
      this.audio.preload = "auto";

      // Set up event listeners for HTML5 Audio fallback
      this.audio.addEventListener("durationchange", () => {
        if (this.audio && !isNaN(this.audio.duration)) {
          this.duration = this.audio.duration;
        }
      });

      this.audio.addEventListener("timeupdate", () => {
        if (this.audio && this.state === "playing") {
          const currentTime = this.audio.currentTime;
          if (this.onProgress && !isNaN(currentTime)) {
            this.onProgress(currentTime, this.duration);
          }
        }
      });

      this.audio.addEventListener("ended", () => {
        if (this.state === "playing") {
          this.setState("idle");
          if (this.progressInterval) {
            window.clearInterval(this.progressInterval);
            this.progressInterval = null;
          }
        }
      });

      this.audio.addEventListener("error", () => {
        console.error("HTML5 Audio playback error");
        this.setState("error");
        this.handleError(new Error("HTML5 Audio playback failed"));
      });

      // Set volume
      this.audio.volume = this.options.volume || 1.0;

      // Attempt to load the audio - this will set duration when loaded
      await new Promise<void>((resolve, reject) => {
        if (!this.audio) return reject(new Error("Audio element not created"));

        const canPlayHandler = () => {
          this.audio?.removeEventListener("canplaythrough", canPlayHandler);
          this.audio?.removeEventListener("error", errorHandler);
          this.setState("idle");
          resolve();
        };

        const errorHandler = (e: Event) => {
          this.audio?.removeEventListener("canplaythrough", canPlayHandler);
          this.audio?.removeEventListener("error", errorHandler);
          reject(new Error("Failed to load audio"));
        };

        this.audio.addEventListener("canplaythrough", canPlayHandler);
        this.audio.addEventListener("error", errorHandler);

        // Set a timeout in case 'canplaythrough' never fires
        setTimeout(() => {
          if (this.audio && this.audio.readyState >= 3) {
            canPlayHandler();
          }
        }, 3000);

        this.audio.load();
      });

      // Autoplay if enabled
      if (this.options.autoplay && this.audio) {
        this.audio.play().catch((e) => {
          console.warn("Autoplay failed:", e);
        });
        this.setState("playing");
      }
    } catch (fallbackError) {
      console.error("Fallback audio loading failed:", fallbackError);
      this.setState("error");
      this.handleError(
        fallbackError instanceof Error
          ? fallbackError
          : new Error("Failed to load audio with fallback method")
      );
    }
  }

  /**
   * Play audio
   */
  async play(): Promise<void> {
    if (this.state === "playing") return;

    try {
      // Check if we're using HTML5 Audio fallback
      if (this.audio && !this.audioContext) {
        try {
          // For HTML5 Audio fallback
          if (this.state === "paused" && this.audio.currentTime > 0) {
            // Resume from pause position
            await this.audio.play();
          } else {
            // Start from beginning or specified time
            this.audio.currentTime = 0; // Reset to beginning
            await this.audio.play();
          }

          this.setState("playing");
          this.startProgressTracking();
          return;
        } catch (htmlAudioError) {
          console.error("Error playing HTML5 Audio:", htmlAudioError);
          throw htmlAudioError;
        }
      }

      // Web Audio API path
      if (!this.audioContext || !this.audioBuffer) {
        throw new Error("No audio loaded");
      }

      // Resume audio context if suspended (this can happen due to browser autoplay policies)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Clean up any existing source node
      if (this.sourceNode) {
        try {
          this.sourceNode.disconnect();
        } catch (e) {
          // Ignore errors if already disconnected
        }
        this.sourceNode = null;
      }

      // Create source node
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = this.audioBuffer;
      this.sourceNode.playbackRate.value = this.options.playbackRate || 1.0;
      this.sourceNode.loop = this.options.loop || false;

      // Connect nodes
      if (this.gainNode) {
        // Ensure gain node is connected to destination
        try {
          this.gainNode.disconnect();
        } catch (e) {
          // Ignore errors if already disconnected
        }
        this.sourceNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
      } else {
        this.sourceNode.connect(this.audioContext.destination);
      }

      // Handle end of playback
      this.sourceNode.onended = () => {
        if (this.state === "playing") {
          this.stop();
        }
      };

      // Start playback
      const offset = this.state === "paused" ? this.pausedTime : 0;
      this.sourceNode.start(0, offset);
      this.startTime = this.audioContext.currentTime - offset;
      this.setState("playing");

      // Start progress tracking
      this.startProgressTracking();
    } catch (error) {
      console.error("Error playing audio:", error);
      this.setState("error");
      this.handleError(
        error instanceof Error ? error : new Error("Failed to play audio")
      );
    }
  }

  /**
   * Pause audio
   */
  pause(): void {
    if (this.state !== "playing") return;

    try {
      // Check if we're using HTML5 Audio fallback
      if (this.audio && !this.audioContext) {
        // HTML5 Audio fallback path
        this.audio.pause();
        this.setState("paused");
        this.stopProgressTracking();
        return;
      }

      // Web Audio API path
      if (this.sourceNode && this.audioContext) {
        // Calculate current position
        this.pausedTime = this.audioContext.currentTime - this.startTime;

        // Stop source node and disconnect it
        this.sourceNode.stop();
        this.sourceNode.disconnect();
        this.sourceNode = null;

        this.setState("paused");
        this.stopProgressTracking();
      }
    } catch (error) {
      console.error("Error pausing audio:", error);
      this.handleError(
        error instanceof Error ? error : new Error("Failed to pause audio")
      );
    }
  }

  /**
   * Stop audio
   */
  stop(): void {
    try {
      // Check if we're using HTML5 Audio fallback
      if (this.audio && !this.audioContext) {
        // HTML5 Audio fallback path
        this.audio.pause();
        this.audio.currentTime = 0; // Reset to beginning
        this.pausedTime = 0;
        this.startTime = 0;
        this.stopProgressTracking();

        // Update state if needed
        if (
          this.state !== "idle" &&
          this.state !== "error" &&
          this.state !== "stopped"
        ) {
          this.setState("stopped");
        }
        return;
      }

      // Web Audio API path
      if (this.sourceNode) {
        this.sourceNode.onended = null; // Remove onended handler to prevent calling stop again
        this.sourceNode.stop(0); // Stop playback immediately
        try {
          this.sourceNode.disconnect();
        } catch (e) {
          /* ignore if already disconnected */
        }
        this.sourceNode = null;
      }

      // Disconnect gain node if it exists and is connected
      // This is generally handled by play() re-establishing connections,
      // but good to be explicit if gainNode might be connected elsewhere.
      // if (this.gainNode && this.audioContext) {
      //   try { this.gainNode.disconnect(this.audioContext.destination); } catch(e) {}
      // }

      // Reset time tracking
      this.pausedTime = 0;
      this.startTime = 0;

      // Stop progress tracking
      this.stopProgressTracking();

      // Update state if needed
      if (
        this.state !== "idle" &&
        this.state !== "error" &&
        this.state !== "stopped"
      ) {
        this.setState("stopped");
      }
    } catch (error) {
      console.error("Error stopping audio:", error);
      this.setState("error"); // Set state to error if stopping fails
      this.handleError(
        error instanceof Error ? error : new Error("Failed to stop audio")
      );
    }
  }

  /**
   * Set playback rate
   */
  setPlaybackRate(rate: number): void {
    this.options.playbackRate = Math.max(0.25, Math.min(2.5, rate));

    if (this.sourceNode) {
      this.sourceNode.playbackRate.value = this.options.playbackRate;
    }
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    this.options.volume = Math.max(0, Math.min(1, volume));

    if (this.gainNode) {
      this.gainNode.gain.value = this.options.volume;
    }
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    if (this.state === "playing" && this.audioContext) {
      return this.audioContext.currentTime - this.startTime;
    }
    return this.pausedTime;
  }

  /**
   * Get total duration
   */
  getDuration(): number {
    return this.duration;
  }

  /**
   * Get current playback state
   */
  getState(): PlaybackState {
    return this.state;
  }

  /**
   * Register progress callback
   */
  onProgressChange(callback: ProgressCallback): void {
    this.onProgress = callback;
  }

  /**
   * Register state change callback
   */
  onStateChangeEvent(callback: StateChangeCallback): void {
    this.onStateChange = callback;
  }

  /**
   * Register error callback
   */
  onErrorEvent(callback: ErrorCallback): void {
    this.onError = callback;
  }

  /**
   * Release resources
   */
  destroy(): void {
    // Stop playback and clean up resources
    this.stop();
    this.stopProgressTracking();

    // Clean up audio element
    if (this.audio) {
      this.audio.pause();
      if (this.audio.src && this.audio.src.startsWith("blob:")) {
        URL.revokeObjectURL(this.audio.src);
      }
      this.audio.src = ""; // Clear src to release resource
      this.audio = null;
    }

    // Disconnect and clean up nodes (sourceNode is handled by stop())
    // if (this.sourceNode) { ... }

    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (e) {
        // Ignore errors if already disconnected
      }
      this.gainNode = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch((e) => {
        console.error("Error closing AudioContext:", e);
      });
      this.audioContext = null;
    }

    // Clear other resources
    this.audioBuffer = null;
    this.onProgress = null;
    this.onStateChange = null;
    this.onError = null;

    // Reset state
    this.setState("idle"); // Ensure state is reset to idle
    this.pausedTime = 0;
    this.startTime = 0;
    this.duration = 0;
  }

  /**
   * Start progress tracking
   */
  private startProgressTracking(): void {
    // Clear any existing interval
    this.stopProgressTracking();

    this.progressInterval = window.setInterval(() => {
      if (this.state === "playing") {
        const currentTime = this.getCurrentTime();

        // Call progress callback if registered
        if (this.onProgress) {
          this.onProgress(currentTime, this.duration);
        }

        // Check if playback has ended
        // Add a small buffer (0.1 seconds) to account for timing precision issues
        if (currentTime >= this.duration - 0.1 && !this.options.loop) {
          this.stop();
        }
      }
    }, 100);
  }

  /**
   * Stop progress tracking
   */
  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Update playback state
   */
  private setState(state: PlaybackState): void {
    this.state = state;

    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    if (this.onError) {
      this.onError(error);
    } else {
      // Log error even if no callback is registered to prevent silent failures
      console.error("AudioPlayer error:", error.message);
    }
  }
}

// Format time in seconds to MM:SS format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};
