const express = require("express");
const router = express.Router();
const { Readable } = require("stream");
const textToSpeech = require("@google-cloud/text-to-speech");
const { GoogleAuth } = require("google-auth-library");

// Create text-to-speech client
const client = new textToSpeech.TextToSpeechClient();

router.post("/", async (req, res) => {
  try {
    const { text, language = "en-US", voice = "en-US-Neural2-F" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Configure request
    const request = {
      input: { text },
      voice: { languageCode: language, name: voice },
      audioConfig: { audioEncoding: "MP3" },
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    // Send the audio as a response
    res.set({
      "Content-Type": "audio/mp3",
      "Content-Length": response.audioContent.length,
    });

    // Create a readable stream from the audio content
    const stream = new Readable();
    stream.push(response.audioContent);
    stream.push(null);

    // Pipe the stream to the response
    stream.pipe(res);
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: "Failed to convert text to speech" });
  }
});

module.exports = router;
