import { ContentListUnion, GoogleGenAI, Type } from "@google/genai";
import promptSync from "prompt-sync";
import { createClient } from "@supabase/supabase-js";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});
const prompt = new promptSync();

const supabaseUrl = 'https://rzstloqrozthdjyyycjl.supabase.co';
const supabaseKey = process.env.SUPABASE_API_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function createSystemPrompt(tables : string) {
  return `You are an SQL bot. You are given a question and you need to answer it.
You are working with the following tables:
${tables}


Run JSON queries until you have enough information to give a final answer.

To run a JSON query, respond with exactly this format:

{
  "query": "SELECT * FROM table WHERE condition"
}

For example, if you don't have any information yet, respond with a query to get started.

Only if in the conversation so far you already have enough information returned from those JSON queries to give a final answer, respond with:

{ 
  "final_answer": "The final answer to the user's question"
}
  
The user's question is: `
}




async function main() {

  const data = await supabase.rpc("get_database_schema");

  const question = prompt("Enter a question: ", "Print out just the word 'banana'.");
  let context : ContentListUnion = [{
    role: "user",
    parts: [{ text: createSystemPrompt(JSON.stringify(data.data)) + question }]
  }];

  while(true) {
    const response = await queryGemini(context);
    if (response && response.final_answer) {
      console.log(response.final_answer);
      break;
    }
    context.push({
      role: "model",
      parts: [{ text: response ? response.query : "" }]
    });
    context.push({
      role: "user",
      parts: [{ text: await querySupabase(response.query)}]
    });
  }
}

async function querySupabase(query : String) {
  const { data, error } = await supabase.rpc("execute_select_query", {
    query_string: query
  });
  return JSON.stringify(data[0].result);
}

async function queryGemini(context : ContentListUnion) {
  try {
    while(true) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: context,
        config: {
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      if (!response.text) {
        continue;
      }

      try { // test that it's a valid JSON object
        let trimmedResponse = response.text.match(/\{.*\}/s);
        if (trimmedResponse && trimmedResponse.length === 0) {
          continue;
        }
        let jsonResponse = JSON.parse(response.text);
        if (jsonResponse && jsonResponse.query) {
          console.log("Query: ", jsonResponse.query);
        }
        return jsonResponse;
      } catch (error) {
        continue;
      }
    }
    
  } catch (error) {
    console.error("Error querying Gemini:", error);
  }
}

main();
