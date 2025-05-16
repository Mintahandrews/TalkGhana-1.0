import { HfInference } from "@huggingface/inference";
import { toast } from "sonner";

const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;
const MODEL_ID = "dennis-9/whisper-akan-finetuned";

class ASRService {
  private hf: HfInference | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeHuggingFace();
  }

  private initializeHuggingFace() {
    try {
      if (!HF_TOKEN || HF_TOKEN === "your_huggingface_token_here") {
        console.warn(
          "Hugging Face token is missing or using default value. ASR functionality will be limited."
        );
        this.isInitialized = false;
        return;
      }

      this.hf = new HfInference(HF_TOKEN);
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Hugging Face client:", error);
      this.isInitialized = false;
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      if (!this.isInitialized || !this.hf) {
        toast.error(
          "Speech recognition is not available. Please check your Hugging Face API token."
        );
        return "Speech recognition unavailable. Please check your API configuration.";
      }

      // Convert blob to ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();

      // Call the Hugging Face API using the correct method and data format
      const response = await this.hf.automaticSpeechRecognition({
        model: MODEL_ID,
        data: arrayBuffer,
      });

      return response.text || "No transcription available";
    } catch (error) {
      console.error("Error transcribing audio:", error);

      // Provide more helpful error message based on error type
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          toast.error(
            "Authentication failed. Please check your Hugging Face token."
          );
          return "Authentication failed. Please check your API key.";
        } else if (error.message.includes("429")) {
          toast.error("API rate limit exceeded. Please try again later.");
          return "API rate limit exceeded. Please try again later.";
        } else if (
          error.message.includes("503") ||
          error.message.includes("502")
        ) {
          toast.error(
            "API service is temporarily unavailable. Please try again later."
          );
          return "API service is temporarily unavailable. Please try again later.";
        }
      }

      toast.error("Failed to transcribe audio. Please try again.");
      return "Transcription failed. Please try again.";
    }
  }

  // Check if ASR is properly configured and available
  isAvailable(): boolean {
    return this.isInitialized;
  }
}

export const asrService = new ASRService();
