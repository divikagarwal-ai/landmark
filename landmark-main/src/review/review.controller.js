const {
  getCountRecord,
  getRecords,
  insertRecords,
  isRecordExist,
  dbRequest,
  pagination,
  advanceFiltering,
  filterFunctionality,
  roleFilterService,
  isEditAccess,
  handleHistoryMessage,
  handleAuditColumns,
  getSystemUserToken,
  listOrderBy,
} = require('../../utils/dbFunctions');
const { v4 } = require('uuid');

const {
  responser,
  //   readFileContent,

  throwError,
  setDateTimeFormat,
  getData,
  deleteKeyValuePair,
  removeNullValueKey,
  requestApi,
  generateCode,
} = require('../../utils/helperFunction');
const {
  sendEmailService,
  saveHistory,
} = require('../../utils/microservice_func');
// const { validationCodeMsg } = require('../utils/validationCodeMsg');
//   const dbService = require('../customer/customer.service');
const moment = require('moment');

const { base_url, webhook } = require('../../config/server.config');
const {
  getEmailBodyByTemplateMapping,
} = require('../template/template.service');
const { getgenai, getgenaireview } = require('../../utils/genAifunctions');
const Sentiment = require('sentiment');

const cron = require('../../utils/cronJobs');
const { environmentConfigurationService } = require('../../utils/dbFunctions');

// Define the reviews array to store review data
const reviews = [];

exports.handleGoogleReviewWebhook = async (req, res) => {
  try {
    console.log(req.headers);
    const webhookApiKey = req.headers['x-webhook-key'] || req.query.api_key;
    const validApiKey = webhook.webhookApiKey;

    if (!webhookApiKey || webhookApiKey !== validApiKey) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or missing API key',
      });
    }

    let requestData = req.body;

    // If the request wasn't properly parsed by body-parser, try to handle it manually
    if (typeof requestData === 'string' || !requestData) {
      try {
        const rawBody = req.rawBody || req.body || '';

        // Clean the JSON string by removing control characters and fixing common issues
        const cleanedJson =
          typeof rawBody === 'string'
            ? rawBody
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
                .replace(/:\s*([^",\s\[\]{}][^,\s\[\]{}]*)/g, ':"$1"')
                .replace(/,\s*([}\]])/g, '$1')
            : rawBody;

        try {
          requestData = JSON.parse(cleanedJson);
        } catch (jsonError) {
          console.error('Failed to parse cleaned JSON:', jsonError);
          requestData = { ...req.query };
          console.log('Using query parameters as fallback:', requestData);
        }
      } catch (error) {
        console.error('Error handling request body:', error);
        requestData = { ...req.query }; // Fallback to query parameters
      }
    }

    console.log('Processed request data:', requestData);

    const ratingMap = {
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
    };

    let rating = requestData.rating;
    if (typeof rating === 'string') {
      rating = ratingMap[rating.toUpperCase()] || parseInt(rating) || 0;
    }

    // Ensure review_id is a string and exists
    const review_id = String(
      requestData.review_id || requestData.Value3 || '',
    ).trim();

    if (!review_id) {
      return res.status(400).json({
        error: 'Missing required field: review_id',
        receivedData: requestData,
      });
    }

    let reviewData = {
      google_reviews_uuid: v4(),
      author_name: (requestData.author_name || 'Anonymous')
        .toString()
        .substring(0, 255),
      review_text: requestData.review_text
        ? String(requestData.review_text)
        : '',
      rating: req.body.rating || 0,
      location_name: requestData.location_name
        ? String(requestData.location_name)
        : '',
      create_time: requestData.create_time || new Date().toISOString(),
      review_id: review_id,
    };

    console.log('Webhook payload:', requestData);
    console.log('Review ID:', review_id);
    console.log('Data to insert:', reviewData);

    await insertRecords('google_reviews', reviewData);

    const apiData = {
      review_id: review_id,
      text: requestData.review_text || '',
      stars: requestData.rating || 0,
      responseStyle: req.body.responseStyle || 'formal',
      includeEmojis: req.body.includeEmojis || true,
      responseLength: req.body.responseLength || 50,
      keywords: req.body.keywords || [],
      avoidKeywords: req.body.avoidKeywords || ['thrilled'],
      referToSelfAsIndividual: req.body.referToSelfAsIndividual || false,
      mentionNames: req.body.mentionNames || false,
      name: requestData.author_name || '',
    };
    const response = await requestApi(
      base_url + '/api/v1/review/analyze-review',
      null,
      'POST',
      {
        'Content-Type': 'application/json',
      },
      apiData,
    );

    await insertRecords('response_style', {
      response_style_uuid: v4(),
      review_id: review_id,
      responseStyle: response.data.response.responseStyle,
      includeEmojis: response.data.response.includeEmojis,
      responseLength: response.data.response.responseLength,
      keywords: response.data.response.keywords,
      avoidKeywords: response.data.response.avoidKeywords,
      referToSelfAsIndividual: response.data.response.referToSelfAsIndividual,
      mentionNames: response.data.response.mentionNames,
      create_ts: new Date(),
      status: 'ACTIVE'
    });

    console.log('Raw API Response:', response.data.response);

    if (!response) {
      throw new Error('No response from analyzeReview API');
    }

    console.log('Response Object:', response.data.response);
   


    const categories = response.data.response?.categories
      ? JSON.stringify(response.data.response.categories)
      : null;
    console.log('Categories:', categories);

    const reviewAnalysis = {
      review_analysis_uuid: v4(),
      review_id: requestData.review_id || '',
      sentiment: response.data.response?.sentiment
        ? JSON.stringify(response.data.response.sentiment)
        : null,
      confidence_score: response.data.response?.confidence || null,
      suggested_action: Array.isArray(response.data.response?.main_points)
        ? JSON.stringify(response.response.main_points)
        : response.response?.main_points || null,
      keywords: response.response?.keywords
        ? JSON.stringify(response.response.keywords)
        : null,
      categories: categories,
      summary: response.data.response?.summary || null,
      response: response.data.response?.text || null,
      additional_insights: Array.isArray(response.data.response?.additional_insights)
        ? JSON.stringify(response.data.response.additional_insights)
        : null,
      create_ts: new Date(),
      status: 'ACTIVE',
    };

    await insertRecords('review_analysis', reviewAnalysis);

    if (reviewAnalysis.categories) {
      console.log('Categories found, proceeding with insertion.');

      const currentDate = new Date().toISOString().split('T')[0];
      const keywordTypes = ['positive', 'negative'];

      const categories = JSON.parse(reviewAnalysis.categories);

      for (const type of keywordTypes) {
        if (Array.isArray(categories[type])) {
          for (const tag of categories[type]) {
            if (tag && tag.trim()) {
              try {
                await insertRecords('review_keywords', {
                  review_keywords_uuid: v4(),
                  review_id: review_id,
                  type: type,
                  tag: tag.trim(),
                  date: currentDate,
                  create_ts: new Date(),
                });
                console.log(`Successfully inserted keyword: ${tag.trim()}`);
              } catch (error) {
                console.error(`Error inserting keyword: ${tag.trim()}`, error);
              }
            }
          }
        }
      }
    }

    res.json({
      message: 'Review stored and response sent successfully.',
      data: response,
    });
  } catch (error) {
    console.error('Error handling Google Review webhook:', error);
    return res.status(500).json({ error: 'Failed to process review' });
  }
};


exports.getGoogleReviews = async (req, res) => {
  const {
    review_id,
    google_reviews_uuid,
    rating,
    column,
    value,
    pageNo,
    itemPerPage,
    from_date,
    to_date,
    status,
    advanceFilter,
  } = req.query;
  const tableName = 'latest_google_reviews';

  let filter = filterFunctionality(
    {
      review_id,
      google_reviews_uuid,
      rating,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);

  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let reviews = await getRecords(tableName, filter, pageFilter);

  return res.json(
    responser('Google Business Reviews', reviews, reviews.length, totalRecords),
  );
};

exports.analyzeReview = async (req, res) => {
  const {
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
    review_id,
  } = req.body;

  if (stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'Stars must be between 1 and 5.' });
  }

  if (responseLength < 25 || responseLength > 80) {
    return res
      .status(400)
      .json({ error: 'Response length must be between 25 and 80 words.' });
  }

  const validResponseStyles = [
    'casual',
    'formal',
    'personalized',
    'let GPT decide',
  ];
  if (!validResponseStyles.includes(responseStyle)) {
    return res.status(400).json({
      error:
        'Invalid response style. Choose from casual, formal, personalized, or let GPT decide.',
    });
  }

  try {
    const generatedResponse = await getgenaireview(
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
    );

    reviews.push({
      id: reviews.length + 1,
      text,
      stars,
      response: generatedResponse,
    });
    res.json(
      responser('Response has been set successfully', {
        review_id,
        text,
        stars,
        response: generatedResponse,
      }),
    );
  } catch (error) {
    console.error('Error analyzing review:', error);
    res
      .status(500)
      .json({ error: 'Failed to analyze review. Please try again later.' });
  }
};

exports.getReviewAnalysis = async (req, res) => {
  const tableName = 'latest_review_analysis';
  const {
    review_analysis_id,
    review_analysis_uuid,
    review_analysis_unique_id,
    review_id,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
  } = req.query;

  let filter = filterFunctionality(
    {
      review_analysis_id,
      review_analysis_uuid,
      review_analysis_unique_id,
      review_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
  );
  let pageFilter = pagination(pageNo, itemPerPage);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter);
  if (!result) return res.status(500).json(responser(errMsg));
  return res.json(
    responser('Review Analysis', result, result.length, totalRecords),
  );
};




exports.fetchTripAdvisorReviews = async (req, res) => {
  try {
    const result = await processTripAdvisorReviews();
    return res.json(
      responser('TripAdvisor reviews fetched and processed', result)
    );
  } catch (error) {
    console.error('Error fetching TripAdvisor reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

async function processTripAdvisorReviews() {
  const url = 'https://api.content.tripadvisor.com/api/v1/location/678775/reviews';
  
  const params = {
    key: '0A49F22D7FCA407FAAC52997B9A058FB',
    language: 'en',
    limit: 100, 
    offset: 0,
    sort: 'newest'
  };

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${url}?${queryString}`;

  const response = await requestApi(
    fullUrl,
    null,
    'GET',
    {
      'Accept': 'application/json',
    }
  );
  console.log(response, 'response');

  if (!response || !response.data) {
    throw new Error('No reviews found or API error');
  }

  let newReviewsCount = 0;
  
  const today = new Date().toISOString().split('T')[0]; 
  console.log(today, 'today');
  
  
  for (const review of response.data) {
    console.log(`Published date: ${review.published_date}`);

    const publishedDate = new Date(review.published_date).toISOString().split('T')[0];
    console.log(`Formatted published date: ${publishedDate}`);
    
    if (publishedDate < today) {
      console.log(`Skipping review ID: ${review.id} as it is before today`);
      continue; 
    }
    const existingReview = await isRecordExist(
      'google_reviews',
      ['review_id'],
      [review.id]
    );
    

    if (!existingReview) {
      const reviewData = {
        google_reviews_uuid: v4(),
        author_name: review.user?.username || 'Anonymous',
        review_text: review.text || '',
        rating: review.rating || 0,
        location_name: review.location_name || review.location_id,
        create_time: review.published_date || new Date().toISOString(),
        review_id: review.id.toString(), // Ensure review_id is a string
        source: 'tripadvisor',
      };

      await insertRecords('google_reviews', reviewData);
      newReviewsCount++;

      const apiData = {
        review_id: review.id.toString(),
        text: review.text || '',
        stars: review.rating || 0,
        responseStyle: 'personalized',
        includeEmojis: true,
        responseLength: 50,
        keywords: [],
        avoidKeywords: ['thrilled'],
        referToSelfAsIndividual: false,
        mentionNames: false,
        name: review.user?.username || '',
      };

      // Call the analyze-review API
      const analysisResponse = await requestApi(
        base_url + '/api/v1/review/analyze-review',
        null,
        'POST',
        {
          'Content-Type': 'application/json',
        },
        apiData,
      );

      console.log('Raw API Response:', analysisResponse);

      if (!analysisResponse) {
        throw new Error('No response from analyzeReview API');
      }

      console.log('Response Object:', analysisResponse);

      // Access the correct structure of the response
      const responseData = analysisResponse.data || {};
      console.log(responseData, 'responseData');
      
      const categories = responseData.response?.categories
        ? JSON.stringify(responseData.response.categories)
        : null;
      console.log('Categories:', categories);

      const reviewAnalysis = {
        review_analysis_uuid: v4(),
        review_id: review.id.toString(),
        sentiment: analysisResponse.response?.sentiment
          ? JSON.stringify(analysisResponse.response.sentiment)
          : null,
        confidence_score: responseData.confidence || null,
        suggested_action: Array.isArray(responseData.main_points)
          ? JSON.stringify(responseData.main_points)
          : responseData.main_points || null,
        keywords: responseData.keywords
          ? JSON.stringify(responseData.keywords)
          : null,
        categories: categories,
        summary: responseData.summary || null,
        response: responseData.response?.text,
        additional_insights: Array.isArray(responseData.additional_insights)
          ? JSON.stringify(responseData.additional_insights)
          : null,
        create_ts: new Date(),
        status: 'ACTIVE',
      };

      await insertRecords('review_analysis', reviewAnalysis);

      if (reviewAnalysis.categories) {
        console.log('Categories found, proceeding with insertion.');

        const currentDate = new Date().toISOString().split('T')[0];
        const keywordTypes = ['positive', 'negative'];

        const parsedCategories = JSON.parse(reviewAnalysis.categories);

        for (const type of keywordTypes) {
          if (Array.isArray(parsedCategories[type])) {
            for (const tag of parsedCategories[type]) {
              if (tag && tag.trim()) {
                try {
                  await insertRecords('review_keywords', {
                    review_keywords_uuid: v4(),
                    review_id: review.id.toString(),
                    type: type,
                    tag: tag.trim(),
                    date: currentDate,
                    create_ts: new Date(),
                  });
                  console.log(`Successfully inserted keyword: ${tag.trim()}`);
                } catch (error) {
                  console.error(`Error inserting keyword: ${tag.trim()}`, error);
                }
              }
            }
          }
        }
      }

      await insertRecords('response_style', {
        response_style_uuid: v4(),
        review_id: review.id.toString(),
        ...analysisResponse.data.response,
        create_ts: new Date(),
        status: 'ACTIVE'
      });
    } else {
      console.log(`Review ID: ${review.id} already exists in the database`);
    }
  }

  return {
    total: response.data.length,
    new_reviews: newReviewsCount
  };
}

(() => {
    console.log('Creating TripAdvisor review fetch cron');
    cron.createCron(
      {
        hour: '*/6',  // Run every 6 hours
        minute: 0
      },
      processTripAdvisorReviews
    );
})();

    