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

    const modelName = "gemini-3.6-flash";
    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    if (!result || !result.text) {
      throw new Error(`Model ${modelName} tidak mengembalikan teks jawaban.`);
    }

    res.json({
      reply: result.text,
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