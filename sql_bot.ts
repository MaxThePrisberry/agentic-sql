import { GoogleGenAI } from "@google/genai";
import promptSync from "prompt-sync";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});
const prompt = new promptSync();

async function main() {
  const question = prompt("What message you got for me?\n", "Print out just the word 'banana'.");
  if (question) {
    await queryGemini(question);
  }
}

async function queryGemini(question: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [{ text: question }]
        }
      ],
      config: {
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    });
    console.log(response.text);
  } catch (error) {
    console.error("Error querying Gemini:", error);
  }
}

main();