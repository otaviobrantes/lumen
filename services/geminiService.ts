import { GoogleGenAI, ChatSession } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Assumes injected by environment

let ai: GoogleGenAI | null = null;
let chatSession: ChatSession | null = null;

// Initialize safely
try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error("Failed to initialize Gemini Client", e);
}

export const initializeChat = async (): Promise<void> => {
  if (!ai) return;
  
  try {
    chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "Você é a Lumen, uma guia espiritual sábia, gentil e não-denominacional para uma plataforma de streaming cristã no estilo Netflix. Seu objetivo é recomendar histórias da Bíblia, explicar parábolas de forma simples e sugerir conteúdos baseados no humor do usuário. Responda sempre em Português (Brasil). Mantenha as respostas concisas (menos de 100 palavras) e encorajadoras.",
        }
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!ai || !chatSession) {
      // Fallback if API key is missing during dev
      if (!apiKey) return "Eu sou a Lumen. Por favor, configure sua chave de API para conversar comigo sobre a Bíblia.";
      await initializeChat();
      if (!chatSession) return "A conexão com o guia espiritual está indisponível no momento.";
  }

  try {
    const result = await chatSession!.sendMessage({ message });
    return result.text || "Estou meditando sobre isso...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Estou com dificuldades para me conectar à nuvem no momento. Por favor, tente novamente mais tarde.";
  }
};