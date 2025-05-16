const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// TTS endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Here you would integrate with a TTS service
    // For example, using Google's Text-to-Speech API or another service

    // For demonstration purposes, this is a placeholder
    // In a real implementation, you would generate audio from the text

    // Simulating audio response for testing
    res.set("Content-Type", "audio/mp3");
    // Send a sample MP3 file or generate actual TTS audio
    // res.sendFile(path.join(__dirname, 'sample-audio.mp3'));

    // For now, we'll return a simple response
    res.json({ success: true, message: "TTS endpoint hit successfully" });
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: "Failed to convert text to speech" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
