import { ContentListUnion, GoogleGenAI, Type } from "@google/genai";
import promptSync from "prompt-sync";
import { createClient } from "@supabase/supabase-js";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});
const prompt = new promptSync();

const supabaseUrl = 'https://rzstloqrozthdjyyycjl.supabase.co';
const supabaseKey = process.env.SUPABASE_API_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function createSystemPrompt(tables: string) {
  return `You are an SQL bot. You are given a question and you need to answer it.
You are working with the following tables:
${tables}


Run JSON queries until you have enough information to give a final answer.

To run a JSON query, respond with exactly this format:

{
  "reasoning": "Reasoning about the query to be run"
  "query": "SELECT * FROM table WHERE condition"
}

For example, if you don't have any information yet, respond with a query to get started.

Only if in the conversation so far you already have enough information returned from those JSON queries to give a final answer, respond with:

{ 
  "reasoning": "Reasoning about the answer you'll give",
  "final_answer": "The final answer to the user's most recent question"
}

You'll be returned the results of each query, so you can make many in a row if you need to. When in doubt, make a query so you can get info, instead of assuming anything.
Be persistent and curious. That means if, for example, you're asked about Calc 1, if searching for Calc 1 doesn't give you any results, you should search for any classes that have "calc" in the name, case insensitive. If that doesn't work, read all the classes. Don't assume there is no Calc 1 class just because it doesn't have that name, it might be Calculus I, etc. The same applies to teachers, students, etc.
However, if you have enough information to be ABSOLUTELY sure this data isn't enough to answer the question, respond with a final answer explaining so.
  
You MUST return a JSON object, with either a "query" or "final_answer" key.

The user's question is: `
}




async function main() {

  const data = await supabase.rpc("get_database_schema");
  let context: ContentListUnion = [];

  while (true) {
    const question = prompt("Enter a question: ");
    if (!question) break;

    console.log("\nLet me look into that!\n\n")
    context.push({
      role: "user",
      parts: [{ text: createSystemPrompt(JSON.stringify(data.data)) + question }]
    });

    while (true) {
      const response = await queryGemini(context);
      if (response && response.final_answer) {
        console.log("\n\n" + response.final_answer + "\n");
        break;
      }
      context.push({
        role: "model",
        parts: [{ text: response ? response.query : "" }]
      });
      let sql_response = await querySupabase(response.query);
      console.log("SQL Response: ", sql_response, "\n");
      context.push({
        role: "user",
        parts: [{ text: sql_response }]
      });
    }
  }
}

async function querySupabase(query: String) {
  const { data, error } = await supabase.rpc("execute_select_query", {
    query_string: query
  });
  return JSON.stringify(data[0].result);
}

async function queryGemini(context: ContentListUnion) {
  try {
    while (true) {
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
        let trimmedResponse = response.text.match(/\{(\s|.)*\}/s);
        if (!trimmedResponse) {
          if (response.text.startsWith("SELECT")) { // Accept raw SQL queries cause gemini flash is a bit dum
            let jsonResponse = { query: response.text };
            console.log("Querying... ", jsonResponse.query);
            return jsonResponse;
          }
          continue; // if it's not a valid JSON object, try again
        } else {
          let jsonResponse = JSON.parse(trimmedResponse[0]);
          if (jsonResponse && jsonResponse.query) {
            console.log("Querying... ", jsonResponse.query);
          }
          return jsonResponse;
        }
      } catch (error) {
        continue; // if it's not a valid JSON object, try again
      }
    }

  } catch (error) {
    console.error("Error querying Gemini:", error);
  }
}

main();
