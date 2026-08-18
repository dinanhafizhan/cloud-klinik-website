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

    // Gunakan gemini-2.5-flash (atau gemini-1.5-flash sebagai fallback)
    let responseText = "";
    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      responseText = result.text;
    } catch (modelErr) {
      console.warn("Gagal dengan gemini-2.5-flash, mencoba gemini-1.5-flash:", modelErr.message);
      const fallbackResult = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });
      responseText = fallbackResult.text;
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