import { GoogleGenAI, Type } from "@google/genai";
import promptSync from "prompt-sync";
import { createClient } from "@supabase/supabase-js";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});
const prompt = new promptSync();

const supabaseUrl = 'https://rzstloqrozthdjyyycjl.supabase.co';
const supabaseKey = process.env.SUPABASE_API_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const question = prompt("Enter a question: ", "Print out just the word 'banana'.");
  if (question) {
    await queryGemini(question);
  }
  
}

async function querySupabase(query : String) {
  const { data, error } = await supabase.rpc("execute_select_query", {
    query_string: query
  });
  return JSON.stringify(data[0].result);
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