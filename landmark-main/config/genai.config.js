const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

exports.model = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-flash',
  temperature: 0.3,
  maxOutputTokens: 2048,
});
