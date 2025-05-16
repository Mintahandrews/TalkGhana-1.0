import { toast } from "sonner";

// Friendli API Configuration
<<<<<<< Updated upstream
const FRIENDLI_ENDPOINT = "https://api.friendli.ai/dedicated";
const FRIENDLI_API_KEY = import.meta.env.VITE_FRIENDLI_API_KEY;
const FRIENDLI_TEAM_ID = import.meta.env.VITE_FRIENDLI_TEAM_ID;
const ENDPOINT_ID = "5wu5uaspjfji"; // Dedicated endpoint for Akan ASR
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const HEALTH_CHECK_INTERVAL = 300000; // 5 minutes
const CONNECTION_RETRY_DELAY = 5000; // 5 seconds
=======
const FRIENDLI_ENDPOINT =
  import.meta.env.VITE_FRIENDLI_ENDPOINT || "https://api.friendli.ai/dedicated";
const FRIENDLI_API_KEY = import.meta.env.VITE_FRIENDLI_API_KEY;
const FRIENDLI_TEAM_ID = import.meta.env.VITE_FRIENDLI_TEAM_ID;
const ENDPOINT_ID = import.meta.env.VITE_ENDPOINT_ID || "5wu5uaspjfji";
const MAX_AUDIO_SIZE =
  (import.meta.env.VITE_MAX_AUDIO_SIZE_MB || 10) * 1024 * 1024;
const REQUEST_TIMEOUT =
  Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS) || 30000;
const MAX_RETRIES = Number(import.meta.env.VITE_MAX_RETRIES) || 3;
const HEALTH_CHECK_INTERVAL = 300000; // 5 minutes
const CONNECTION_RETRY_DELAY = 5000; // 5 seconds
const MAX_BATCH_SIZE = 256;
>>>>>>> Stashed changes
const MAX_CONNECTION_RETRIES = 5;
const BACKOFF_INITIAL_DELAY = 1000;
const BACKOFF_MAX_DELAY = 10000;

interface FriendliResponse {
  text: string;
  confidence?: number;
  language?: string;
  duration?: number;
}

interface ASRError extends Error {
  code?: string;
  status?: number;
}

type ConnectionState = "connected" | "disconnected" | "connecting" | "error";

class ASRService {
  private isInitialized = false;
  private status: "idle" | "transcribing" | "error" = "idle";
  private healthCheckInterval: number | null = null;
  private lastHealthCheck: Date | null = null;
  private connectionState: ConnectionState = "disconnected";
  private connectionRetryCount = 0;
  private maxConnectionRetries = MAX_CONNECTION_RETRIES;
  private pendingRequests: Array<() => Promise<void>> = [];
  private isReconnecting = false;
  private reconnectTimeout: number | null = null;

  constructor() {
    this.initialize();
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  private async initialize() {
    try {
      this.validateConfiguration();
      await this.connect();
    } catch (error) {
      console.error("Failed to initialize Friendli endpoint:", error);
      this.handleInitializationError(error as ASRError);
    }
  }

<<<<<<< Updated upstream
  private validateConfiguration() {
    const missingConfigs = [];

    if (!FRIENDLI_API_KEY) {
      missingConfigs.push("VITE_FRIENDLI_API_KEY");
    }
    if (!FRIENDLI_TEAM_ID) {
      missingConfigs.push("VITE_FRIENDLI_TEAM_ID");
    }

    if (missingConfigs.length > 0) {
      throw new Error(
        `Missing required configuration(s): ${missingConfigs.join(
          ", "
        )}. Please check your .env file.`
      );
    }
  }

=======
>>>>>>> Stashed changes
  private async connect() {
    if (this.connectionState === "connecting") {
      return;
    }

    this.connectionState = "connecting";
    try {
      await this.establishConnection();
      this.startHealthCheck();
      this.processPendingRequests();
    } catch (error) {
      this.handleConnectionError(error as ASRError);
    }
  }

<<<<<<< Updated upstream
=======
  private handleOnline() {
    console.log("Network connection restored");
    if (this.connectionState !== "connected") {
      this.connect();
    }
  }

  private handleOffline() {
    console.log("Network connection lost");
    this.connectionState = "disconnected";
    this.cleanup();
    toast.error("Network connection lost. Waiting for connection...");
  }

  private validateConfiguration() {
    const missingConfigs = [];

    if (!FRIENDLI_API_KEY) {
      missingConfigs.push("VITE_FRIENDLI_API_KEY");
    }
    if (!FRIENDLI_ENDPOINT) {
      missingConfigs.push("VITE_FRIENDLI_ENDPOINT");
    }
    if (!ENDPOINT_ID) {
      missingConfigs.push("VITE_ENDPOINT_ID");
    }

    if (missingConfigs.length > 0) {
      throw new Error(
        `Missing required configuration(s): ${missingConfigs.join(
          ", "
        )}. Please check your .env file.`
      );
    }
  }

>>>>>>> Stashed changes
  private async establishConnection(retryCount = 0): Promise<void> {
    try {
      await this.testEndpointAvailability();
      this.connectionState = "connected";
      this.isInitialized = true;
      this.status = "idle";
      this.connectionRetryCount = 0;
<<<<<<< Updated upstream
      toast.success("Connected to Friendli ASR service");
=======
      toast.success("Connected to ASR service");
>>>>>>> Stashed changes
    } catch (error) {
      if (retryCount < this.maxConnectionRetries) {
        const delay = Math.min(
          BACKOFF_INITIAL_DELAY * Math.pow(2, retryCount),
          BACKOFF_MAX_DELAY
        );

        console.log(
          `Connection attempt failed (${retryCount + 1}/${
            this.maxConnectionRetries
          }). Retrying in ${delay / 1000}s...`
        );

        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
        }

        this.reconnectTimeout = window.setTimeout(() => {
          this.establishConnection(retryCount + 1);
        }, delay);

        return;
      }
      throw error;
    }
  }

<<<<<<< Updated upstream
  private async testEndpointAvailability(): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${FRIENDLI_ENDPOINT}/health`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${FRIENDLI_API_KEY}`,
          "X-Friendli-Team": FRIENDLI_TEAM_ID,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw Object.assign(
          new Error(`Endpoint health check failed: ${response.statusText}`),
          { status: response.status }
        );
      }

      this.lastHealthCheck = new Date();
    } catch (error) {
      const asrError = error as ASRError;
      if (asrError.name === "AbortError") {
        throw Object.assign(new Error("Health check timeout"), {
          code: "TIMEOUT",
        });
      }
      throw error;
    }
  }

  async transcribeAudio(audioBlob: Blob, retryCount = 0): Promise<string> {
    if (this.connectionState !== "connected") {
      return new Promise((resolve, reject) => {
        this.pendingRequests.push(async () => {
          try {
            const result = await this.transcribeAudio(audioBlob, retryCount);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    try {
      this.status = "transcribing";
      this.validateAudioBlob(audioBlob);

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");
      formData.append("model", ENDPOINT_ID);
      formData.append("language", "aka"); // Akan language code
      formData.append("task", "transcribe");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(`${FRIENDLI_ENDPOINT}/v1/asr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FRIENDLI_API_KEY}`,
          "X-Friendli-Team": FRIENDLI_TEAM_ID,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw Object.assign(
          new Error(`HTTP error! status: ${response.status}`),
          { status: response.status }
        );
      }

      const result: FriendliResponse = await response.json();

      if (!result.text) {
        throw Object.assign(
          new Error("No transcription available in response"),
          { code: "NO_TRANSCRIPTION" }
        );
      }

      this.status = "idle";
      return result.text;
    } catch (error) {
      return this.handleTranscriptionError(
        error as ASRError,
        audioBlob,
        retryCount
      );
    }
  }

  private async handleTranscriptionError(
    error: ASRError,
    audioBlob: Blob,
    retryCount: number
  ): Promise<string> {
    console.error("Error transcribing audio:", error);

    if (error.name === "AbortError") {
      throw Object.assign(new Error("Request timeout"), { code: "TIMEOUT" });
    }

    if (this.shouldRetry(error) && retryCount < MAX_RETRIES) {
      console.log(
        `Retrying transcription (${retryCount + 1}/${MAX_RETRIES})...`
      );
      const backoff = Math.min(
        1000 * Math.pow(2, retryCount) + Math.random() * 1000,
        10000
      );
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return this.transcribeAudio(audioBlob, retryCount + 1);
    }

    this.status = "error";
    const errorMessage = this.getErrorMessage(error);
    toast.error(errorMessage);
    return errorMessage;
  }

  private validateAudioBlob(audioBlob: Blob): void {
    if (!audioBlob || audioBlob.size === 0) {
      throw Object.assign(new Error("Invalid audio data: Empty file"), {
        code: "INVALID_AUDIO",
      });
    }
    if (audioBlob.size > MAX_AUDIO_SIZE) {
      throw Object.assign(
        new Error(
          `Audio file too large. Maximum size is ${
            MAX_AUDIO_SIZE / (1024 * 1024)
          }MB`
        ),
        { code: "FILE_TOO_LARGE" }
      );
    }
  }

  private shouldRetry(error: ASRError): boolean {
    const retryableStatuses = [500, 502, 503, 504];
    const retryableCodes = ["TIMEOUT", "NETWORK_ERROR"];

    return (
      error.name === "AbortError" ||
      error.message.includes("network") ||
      error.message.includes("timeout") ||
      (error.status !== undefined &&
        retryableStatuses.includes(error.status)) ||
      (error.code !== undefined && retryableCodes.includes(error.code))
    );
  }

  private handleInitializationError(error: ASRError) {
    this.isInitialized = false;
    this.status = "error";
    this.connectionState = "error";
    this.handleError(error);
  }

  private handleConnectionError(error: ASRError) {
    this.connectionState = "error";
    this.isInitialized = false;

    const errorMessage = this.getErrorMessage(error);
    toast.error(`Connection error: ${errorMessage}`);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, CONNECTION_RETRY_DELAY);
  }

  private handleError(error: ASRError) {
    const message = this.getErrorMessage(error);
    toast.error(message);
  }

  private getErrorMessage(error: ASRError): string {
    if (error.status === 401 || error.status === 403) {
      return "Authentication failed. Please check your Friendli API key.";
    } else if (error.status === 429) {
      return "API rate limit exceeded. Please try again later.";
    } else if (error.status === 413 || error.code === "FILE_TOO_LARGE") {
      return `Audio file too large. Maximum size is ${
        MAX_AUDIO_SIZE / (1024 * 1024)
      }MB`;
    } else if (error.status === 415) {
      return "Unsupported audio format. Please use WAV format.";
    } else if (error.status === 503 || error.status === 502) {
      return "API service is temporarily unavailable. Please try again later.";
    } else if (error.name === "AbortError" || error.code === "TIMEOUT") {
      return "Request timeout. Please try again.";
    } else if (error.code === "INVALID_AUDIO") {
      return "Invalid audio data. Please try again with a valid audio file.";
    } else if (error.code === "NO_TRANSCRIPTION") {
      return "No transcription available. Please try again.";
    }
    return "Failed to transcribe audio. Please try again.";
  }

  private handleOnline() {
    console.log("Network connection restored");
    if (this.connectionState !== "connected") {
      this.connect();
    }
  }

  private handleOffline() {
    console.log("Network connection lost");
    this.connectionState = "disconnected";
    this.cleanup();
    toast.error("Network connection lost. Waiting for connection...");
  }

=======
  private handleConnectionError(error: ASRError) {
    this.connectionState = "error";
    this.isInitialized = false;

    const errorMessage = this.getErrorMessage(error);
    toast.error(`Connection error: ${errorMessage}`);

    // Schedule reconnection attempt
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, CONNECTION_RETRY_DELAY);
  }

  private async processPendingRequests() {
    while (this.pendingRequests.length > 0) {
      const request = this.pendingRequests.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error("Error processing pending request:", error);
        }
      }
    }
  }

>>>>>>> Stashed changes
  private startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = window.setInterval(async () => {
      try {
        await this.testEndpointAvailability();
        if (this.connectionState !== "connected") {
          this.connectionState = "connected";
          toast.success("Connection restored");
        }
      } catch (error) {
        console.warn("Health check failed:", error);
        if (this.connectionState === "connected") {
          this.connectionState = "disconnected";
          this.handleConnectionLoss();
        }
      }
    }, HEALTH_CHECK_INTERVAL);
  }

  private async handleConnectionLoss() {
    if (this.isReconnecting) return;

    this.isReconnecting = true;
    toast.error("Connection lost. Attempting to reconnect...");

    try {
      await this.establishConnection();
      toast.success("Connection restored");
    } catch (error) {
      console.error("Failed to restore connection:", error);
      toast.error("Failed to restore connection. Please try again later.");
    } finally {
      this.isReconnecting = false;
    }
  }

<<<<<<< Updated upstream
  private async processPendingRequests() {
    while (this.pendingRequests.length > 0) {
      const request = this.pendingRequests.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error("Error processing pending request:", error);
        }
      }
    }
  }

=======
  private async testEndpointAvailability(): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${FRIENDLI_ENDPOINT}/health`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${FRIENDLI_API_KEY}`,
          "X-Friendli-Team": FRIENDLI_TEAM_ID,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw Object.assign(
          new Error(`Endpoint health check failed: ${response.statusText}`),
          { status: response.status }
        );
      }

      this.lastHealthCheck = new Date();
    } catch (error) {
      const asrError = error as ASRError;
      if (asrError.name === "AbortError") {
        throw Object.assign(new Error("Health check timeout"), {
          code: "TIMEOUT",
        });
      }
      throw error;
    }
  }

  private validateAudioBlob(audioBlob: Blob): void {
    if (!audioBlob || audioBlob.size === 0) {
      throw Object.assign(new Error("Invalid audio data: Empty file"), {
        code: "INVALID_AUDIO",
      });
    }
    if (audioBlob.size > MAX_AUDIO_SIZE) {
      throw Object.assign(
        new Error(
          `Audio file too large. Maximum size is ${
            MAX_AUDIO_SIZE / (1024 * 1024)
          }MB`
        ),
        { code: "FILE_TOO_LARGE" }
      );
    }
  }

  async transcribeAudio(audioBlob: Blob, retryCount = 0): Promise<string> {
    if (this.connectionState !== "connected") {
      return new Promise((resolve, reject) => {
        this.pendingRequests.push(async () => {
          try {
            const result = await this.transcribeAudio(audioBlob, retryCount);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    try {
      this.status = "transcribing";
      this.validateAudioBlob(audioBlob);

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");
      formData.append("model", ENDPOINT_ID);
      formData.append("language", "aka"); // Akan language code
      formData.append("task", "transcribe");
      formData.append("batch_size", MAX_BATCH_SIZE.toString());

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(`${FRIENDLI_ENDPOINT}/v1/asr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FRIENDLI_API_KEY}`,
          "X-Friendli-Team": FRIENDLI_TEAM_ID,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw Object.assign(
          new Error(`HTTP error! status: ${response.status}`),
          { status: response.status }
        );
      }

      const result: FriendliResponse = await response.json();

      if (!result.text) {
        throw Object.assign(
          new Error("No transcription available in response"),
          { code: "NO_TRANSCRIPTION" }
        );
      }

      this.status = "idle";
      return result.text;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      const asrError = error as ASRError;

      if (asrError.name === "AbortError") {
        throw Object.assign(new Error("Request timeout"), { code: "TIMEOUT" });
      }

      if (this.shouldRetry(asrError) && retryCount < MAX_RETRIES) {
        console.log(
          `Retrying transcription (${retryCount + 1}/${MAX_RETRIES})...`
        );
        const backoff = Math.min(
          1000 * Math.pow(2, retryCount) + Math.random() * 1000,
          10000
        );
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return this.transcribeAudio(audioBlob, retryCount + 1);
      }

      this.status = "error";
      this.handleError(asrError);
      return this.getErrorMessage(asrError);
    }
  }

  private shouldRetry(error: ASRError): boolean {
    const retryableStatuses = [500, 502, 503, 504];
    const retryableCodes = ["TIMEOUT", "NETWORK_ERROR"];

    return (
      error.name === "AbortError" ||
      error.message.includes("network") ||
      error.message.includes("timeout") ||
      (error.status !== undefined &&
        retryableStatuses.includes(error.status)) ||
      (error.code !== undefined && retryableCodes.includes(error.code))
    );
  }

  private handleInitializationError(error: ASRError) {
    this.isInitialized = false;
    this.status = "error";
    this.connectionState = "error";
    this.handleError(error);
  }

  private handleError(error: ASRError) {
    const message = this.getErrorMessage(error);
    toast.error(message);
  }

  private getErrorMessage(error: ASRError): string {
    if (error.status === 401 || error.status === 403) {
      return "Authentication failed. Please check your Friendli API key.";
    } else if (error.status === 429) {
      return "API rate limit exceeded. Please try again later.";
    } else if (error.status === 413 || error.code === "FILE_TOO_LARGE") {
      return `Audio file too large. Maximum size is ${
        MAX_AUDIO_SIZE / (1024 * 1024)
      }MB`;
    } else if (error.status === 415) {
      return "Unsupported audio format. Please use WAV format.";
    } else if (error.status === 503 || error.status === 502) {
      return "API service is temporarily unavailable. Please try again later.";
    } else if (error.name === "AbortError" || error.code === "TIMEOUT") {
      return "Request timeout. Please try again.";
    } else if (error.code === "INVALID_AUDIO") {
      return "Invalid audio data. Please try again with a valid audio file.";
    } else if (error.code === "NO_TRANSCRIPTION") {
      return "No transcription available. Please try again.";
    }
    return "Failed to transcribe audio. Please try again.";
  }

>>>>>>> Stashed changes
  getStatus(): string {
    return this.status;
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isAvailable(): boolean {
    return this.isInitialized && this.connectionState === "connected";
  }

  cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.pendingRequests = [];
    this.connectionState = "disconnected";
    this.isInitialized = false;

<<<<<<< Updated upstream
=======
    // Remove event listeners
>>>>>>> Stashed changes
    window.removeEventListener("online", this.handleOnline.bind(this));
    window.removeEventListener("offline", this.handleOffline.bind(this));
  }
}

export const asrService = new ASRService();
