import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { toast, Toaster } from "sonner";

// Check for Hugging Face token
const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;
if (!HF_TOKEN || HF_TOKEN === "your_huggingface_token_here") {
  console.warn(
    "Warning: VITE_HUGGINGFACE_TOKEN is not set or using placeholder value. " +
      "Speech recognition functionality will be limited."
  );

  // Only show this toast in development to help developers
  if (import.meta.env.DEV) {
    // Use a small delay to ensure toast gets shown after app mount
    setTimeout(() => {
      toast.warning(
        <div>
          <p className="font-semibold">Missing API Token</p>
          <p className="text-sm">
            Get a{" "}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              Hugging Face token
            </a>{" "}
            and add it to your <span className="font-mono">.env</span> file as{" "}
            <span className="font-mono">VITE_HUGGINGFACE_TOKEN</span>
          </p>
        </div>,
        {
          duration: 8000,
          position: "top-center",
        }
      );
    }, 1500);
  }
}

// Check for GhanaNLP API token
const GHANA_NLP_TOKEN = import.meta.env.VITE_GHANA_NLP_API_KEY;
if (!GHANA_NLP_TOKEN || GHANA_NLP_TOKEN === "your_ghananlp_api_key_here") {
  console.warn(
    "Warning: VITE_GHANA_NLP_API_KEY is not set or using placeholder value. " +
      "Text-to-Speech functionality will use mock data."
  );

  // Only show this toast in development to help developers
  if (import.meta.env.DEV) {
    // Use a small delay to ensure toast gets shown after app mount
    setTimeout(() => {
      toast.warning(
        <div>
          <p className="font-semibold">Missing GhanaNLP API Token</p>
          <p className="text-sm">
            Get a{" "}
            <a
              href="https://ghananlp.org/api-access"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              GhanaNLP API token
            </a>{" "}
            and add it to your <span className="font-mono">.env</span> file as{" "}
            <span className="font-mono">VITE_GHANA_NLP_API_KEY</span>
          </p>
        </div>,
        {
          duration: 8000,
          position: "top-center",
        }
      );
    }, 2000);
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster richColors position="top-right" />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
