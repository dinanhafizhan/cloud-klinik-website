import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY belum diatur di server.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Susun riwayat percakapan
    const conversation = history
      .map((msg) => {
        const role = msg.role === "model" ? "AI" : "User";
        return `${role}: ${msg.text}`;
      })
      .join("\n");

    const prompt = `
Kamu adalah AI Assistant resmi Klinik Hafizh.

Aturan:
- Jawab dalam Bahasa Indonesia.
- Ramah, sopan, dan profesional.
- Jangan mengulang salam pada setiap jawaban.
- Berikan salam hanya pada pesan pertama.
- Jawab langsung inti pertanyaan.
- Jangan memberikan diagnosis pasti.
- Berikan edukasi kesehatan umum.
- Jika gejala berbahaya (sesak napas, nyeri dada, pingsan, kejang, perdarahan berat), sarankan segera ke IGD.
- PENTING: Jika pengguna bertanya tentang topik di luar kesehatan, medis, atau layanan klinik (seperti coding, pemrograman, politik, game, dll), TOLAK UNTUK MENJAWAB DENGAN SOPAN dan katakan bahwa kamu hanya asisten klinik yang melayani seputar kesehatan.
- Maksimal 180 kata.

Riwayat Percakapan:

${conversation}

User: ${message}

AI:
`;

    // Model utama: gemini-3.6-flash, Cadangan otomatis: gemini-2.0-flash
    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-2.0-flash"
    ];

    let responseText = null;
    let lastError = null;

    // Timeout 8 detik per model agar total waktu selalu jauh di bawah 30 detik CloudFront
    const generateWithTimeout = (modelName, timeoutMs = 8000) => {
      return Promise.race([
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout memanggil model ${modelName}`)), timeoutMs)
        )
      ]);
    };

    for (const modelName of candidateModels) {
      try {
        const result = await generateWithTimeout(modelName, 8000);
        if (result && result.text) {
          responseText = result.text;
          break; // Berhasil, keluar dari loop
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} gagal/503: ${err.message}. Beralih ke model cadangan...`);
      }
    }

    if (!responseText) {
      throw lastError || new Error("Semua model Gemini sedang sibuk. Silakan coba sesaat lagi.");
    }

    res.json({
      reply: responseText,
    });
  } catch (err) {
    console.error("Error pada handleChat:", err);

    if (err.status === 429) {
      return res.status(429).json({
        error:
          "Layanan AI sedang mencapai batas kuota. Silakan coba beberapa saat lagi.",
      });
    }

    return res.status(500).json({
      error: err.message || "Terjadi kesalahan pada chatbot.",
    });
  }
};