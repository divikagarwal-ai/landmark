const { JsonOutputParser } = require('@langchain/core/output_parsers');

const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { model } = require('../config/genai.config');
const fs = require('fs');
const Sentiment = require('sentiment');

const parser = new JsonOutputParser();
// require('./pdf')
exports.getgenai = async (Instruction) => {
  let time = `${Date.now()}-${Math.floor(Math.random() * 900000) + 100000}`;
  console.time('Total Time' + `: ${time}`);
  console.time('BASE64 CONVERSION' + `: ${time}`);

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', `${Instruction}`],
    ['user', [{ type: 'text', text: '' }]],
  ]);
  console.time('Pipeline Execution' + `: ${time}`);
  const chain = prompt.pipe(model).pipe(parser);
  const response = await chain.invoke();

  if (!response || typeof response !== 'object') {
    throw new Error(
      'Invalid response: The response is either null or not an object',
    );
  }

  console.timeEnd('Pipeline Execution' + `: ${time}`);
  console.log(response);

  console.log('OCR Response:', response);

  return response;
};

exports.getgenaireview = async (
  text,
  stars,
  responseStyle,
  includeEmojis,
  responseLength,
  keywords,
  avoidKeywords,
  referToSelfAsIndividual,
  mentionNames,
  name,
) => {
  if (stars < 1 || stars > 5) {
    throw new Error('Stars must be between 1 and 5.');
  }

  if (responseLength < 25 || responseLength > 80) {
    throw new Error('Response length must be between 25 and 80 words.');
  }

  const validResponseStyles = [
    'casual',
    'formal',
    'personalized',
    'let GPT decide',
  ];
  if (!validResponseStyles.includes(responseStyle)) {
    throw new Error(
      'Invalid response style. Choose from casual, formal, personalized, or let GPT decide.',
    );
  }

  const sentiment = new Sentiment();
  const sentimentScore = sentiment.analyze(text).score;

  const emojiInstruction = includeEmojis ? 'and include relevant emojis' : '';
  const referToSelfInstruction = referToSelfAsIndividual
    ? "Refer to self as 'I' or 'Me'."
    : "Refer to self as 'We' or 'Us'.";
  const mentionNamesInstruction =
    mentionNames && name ? `Use the name "${name}" in the response.` : '';

  const keywordList = Array.isArray(keywords) ? keywords.join(', ') : '';
  const avoidKeywordList = Array.isArray(avoidKeywords)
    ? avoidKeywords.join(', ')
    : '';

  const instruction = `
    Please act as hotel owner when you are writing the response.
    Analyze the following review with a sentiment score of ${sentimentScore}.
    Provide a ${responseStyle} response that must contain between ${responseLength} words (no less than 25 and no more than 80) words ${emojiInstruction}.
    AI will do its best to include the following keywords: ${keywordList}.
    AI will avoid using these keywords: ${avoidKeywordList}.
    ${referToSelfInstruction} ${mentionNamesInstruction}

    IMPORTANT: For every review, you must:
    1. Write a  response
    2. Analyze and categorize the review content into positive and negative aspects
    3. Return both in this exact JSON format:
    {
      "text": "Your response here",
      "categories": {
        "positive": ["list", "of", "positive", "aspects"],
        "negative": ["list", "of", "negative", "aspects"]
      }
    }

    Example review: "hotel location is very good, near to airport but the food specially Dal makhni sucks but the service are not up to the mark."
    Must return:
    {
      "text": "response",
      "categories": {
        "positive": ["location", "near to airport"],
        "negative": ["food quality", "dal makhni", "service standards"]
      }
    }

    Review to analyze: "${text}"

    Please ensure to:
    - Always include both text and categories in the response
    - Never skip the categories analysis
    - Format as valid JSON
    - Do not include sentiment data in the response
    - Write response text as a single continuous string without line breaks or \\n characters
    - Do not use any special characters except emojis where appropriate

    Response (in JSON format):
  `;

  try {
    if (!model) {
      throw new Error('AI model is not properly configured');
    }

    const directResponse = await model.invoke(instruction);

    if (directResponse && directResponse.content) {
      const content = directResponse.content;

      const jsonMatch =
        content.match(/```json\n([\s\S]*?)\n```/) ||
        content.match(/{[\s\S]*?}/);
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const jsonResponse = JSON.parse(jsonStr);

          if (!jsonResponse.text) {
            throw new Error("JSON response does not contain a 'text' field");
          }

          const responseWords = jsonResponse.text.split(/\s+/).length;

          if (responseWords < 25 || responseWords > 80) {
            console.warn(
              `Response length of ${responseWords} is outside the expected range.`,
            );
          }

          return jsonResponse;
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          return { text: content };
        }
      } else {
        return { text: content };
      }
    } else {
      throw new Error('Direct model response is invalid');
    }
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
};
