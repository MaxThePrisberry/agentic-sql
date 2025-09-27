# Agentic SQL Bot

An intelligent SQL query bot that uses Google's Gemini AI to answer natural language questions about any database. The bot autonomously generates and executes multiple SQL queries as needed to provide comprehensive answers. This repository includes an example university database for testing and demonstration purposes.

## Prerequisites

- Node.js (version 18 or higher)
- A Google AI API key for Gemini
- A Supabase project with the university database schema

## Installation

1. Clone the repository:
```bash
git clone https://github.com/MaxThePrisberry/agentic-sql.git
cd agentic-sql
```

2. Install dependencies:
```bash
npm install
```

3. Set up the example database (optional):
   - Create a Supabase project
   - Run `create_schema.sql` to set up the university database structure
   - Run `create_data.sql` to populate with sample data
   - Create the required RPC functions in your database platform:
     - `get_database_schema()` - Returns the database schema information
     - `execute_select_query(query_string)` - Safely executes SELECT queries

   For your own database, implement equivalent functions that provide schema information and safe query execution.

4. Set up environment variables:
```bash
export GEMINI_API_KEY="your-google-ai-api-key"
export SUPABASE_API_KEY="your-supabase-anon-key"
```

## Usage

1. Start the bot:
```bash
npx tsx sql_bot.ts
```

2. Ask questions about your database. For the example university database:
```
Enter a question: How many students are enrolled in Computer Science?
Enter a question: What's the average grade for the Calculus midterm?
Enter a question: Which professors teach in the Computer Science department?
```

3. The bot will:
   - Analyze your question
   - Generate appropriate SQL queries
   - Execute them against the database
   - Provide a natural language answer



## Configuration

The example setup connects to a Supabase instance with a university database. To use your own database:

1. Update the `supabaseUrl` and connection details in `sql_bot.ts`
2. Ensure your database platform supports the required RPC functions:
   - `get_database_schema()` - Returns schema information for the AI to understand your database structure
   - `execute_select_query(query_string)` - Safely executes SELECT queries with appropriate security constraints

The bot can work with any database system that provides similar RPC functionality for schema introspection and safe query execution.

## Security Features

- Only executes SELECT queries (read-only access)
- Uses Supabase RPC functions for query execution
- Validates JSON responses from AI before execution

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Example Database

The repository includes a sample university database for testing and demonstration purposes. The example data includes:
- 100 students across various majors
- 20 professors with salary information
- Multiple courses and sections
- Exam records with grades and timing data

This serves as a reference implementation that can be replaced with your own database schema and data.

## Contributing

This is an educational project demonstrating agentic AI behavior with SQL databases. Feel free to extend the schema, add new question types, or improve the query generation logic.
