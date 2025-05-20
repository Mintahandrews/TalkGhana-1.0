# app.py
from flask import Flask, request, jsonify
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torch
import torchaudio
import logging
import os

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting application...")
try:
    logger.info("Loading processor and model...")
    processor = WhisperProcessor.from_pretrained("dennis-9/whisper-small_Akan_non_standardspeech")
    model = WhisperForConditionalGeneration.from_pretrained("dennis-9/whisper-small_Akan_non_standardspeech")
    device = "cpu"  # Use CPU for simplicity; adjust if you have a GPU
    model.to(device)
    model.eval()
    model.config.forced_decoder_ids = processor.get_decoder_prompt_ids(task="transcribe")
    model.config.use_cache = True
    logger.info("Model loaded successfully on %s", device)
except Exception as e:
    logger.error("Failed to load model: %s", str(e))
    raise

def correct_transcription(text):
    corrections = {"akan": "Akan", "akn": "Akan", "spch": "speech", "imprd": "impaired"}
    words = text.split()
    corrected = [corrections.get(word.lower(), word) for word in words]
    return " ".join(corrected)

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    try:
        audio_data, sr = torchaudio.load(audio_file)
        if sr != 16000:
            resampler = torchaudio.transforms.Resample(sr, 16000)
            audio_data = resampler(audio_data)
        audio_data = audio_data[0].numpy()
        if len(audio_data) / 16000 > 15:
            return jsonify({"error": "Audio is too long (>15s)"}), 400

        input_features = processor(audio_data, sampling_rate=16000, return_tensors="pt").input_features.to(device)
        with torch.no_grad():
            predicted_ids = model.generate(input_features, max_length=50, task="transcribe")
        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        corrected_text = correct_transcription(transcription)
        return jsonify({"transcription": corrected_text, "confidence": 0.9})
    except Exception as e:
        logger.error("Transcription failed: %s", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = 5000  # Fixed port for local deployment
    logger.info(f"Starting Flask on port {port}...")
    app.run(host="0.0.0.0", port=port)