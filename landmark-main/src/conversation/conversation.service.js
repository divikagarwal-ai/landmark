const { v4 } = require('uuid');
const {
  getRecords,
  insertRecords,
  environmentConfigurationService,
  dbRequest,
  isRecordExist,
  isValidRecord,
  filterFunctionality,
} = require('../../utils/dbFunctions');
const {
  generateCode,
  setDateTimeFormat,
  requestApi,
  removeNullValueKey,
} = require('../../utils/helperFunction');
const { SERVICES_URL } = require('../../utils/microservices_url');
const moment = require('moment');

const handleTextValue = (contentType, contentPalaod) => {
  switch (contentType) {
    case 'button':
      return contentPalaod[contentType];
    case 'text':
      return { text: contentPalaod[contentType]?.body };
  }
};

const setBodyTextFromObjectVariables = (template, objectVariables) => {
  if (!objectVariables) return template.map((component) => component);
  return template.map((component) => {
    if (component.type === 'BODY') {
      let updatedText = component.text;

      // Replace placeholders {{1}}, {{2}}, etc. with values from bodyVar
      objectVariables.bodyVar.forEach((variable, index) => {
        const placeholder = `{{${index + 1}}}`;
        updatedText = updatedText.replace(placeholder, variable.value);
      });

      return { ...component, text: updatedText };
    }
    return component; // Keep other component types unchanged
  });
};

exports.sendMessagesService = async (payload) => {
  try {
    console.log('send messag====>', payload);
    let envConfig = await environmentConfigurationService([
      'WHATSAPP_NUMBER',
      'SEND_WHATSAPP_MESSAGES',
    ]);
    payload.fromNumber ??= envConfig?.WHATSAPP_NUMBER;
    payload.toNumber = payload.toNumber.startsWith('+91')
      ? payload.toNumber
      : '+91' + payload.toNumber;

    let resp =
      envConfig?.SEND_WHATSAPP_MESSAGES === 'true'
        ? (
            await requestApi(
              SERVICES_URL.whatsappSendMessages,
              null,
              'POST',
              { 'Content-Type': 'application/json' },
              payload,
            )
          ).data
        : null;
    // console.log('send messag resp=====>', resp);
    let insertPayload = {
      conversation_whatsapp_uuid: generateCode({ uuid: true }),
      reference_uuid_column_name: payload.reference_uuid_column_name,
      reference_uuid_column_value: payload.reference_uuid_column_value,
      conversation_id: resp
        ? resp.response.whatsapp.messages[0].data.sid
        : v4(),
      module_name: 'LEAD',
      from_number: payload.fromNumber,
      to_number: payload.toNumber,
      message_type: payload.templateName ? 'TEMPLATE' : 'CUSTOM',
      content_type: 'text',
      content: [{ text: payload.message }],
      reply_from_conversation_id: null,
      attachments: [],
      is_automatic_message: payload.is_automatic_message ? 1 : 0,
      raw_payload: JSON.stringify(payload, null, 2),
      create_ts: setDateTimeFormat('timestamp'),
      created_by_uuid: payload.created_by_uuid,
      created_by_name: payload.created_by_name,
    };
    if (payload.templateName) {
      let template = await requestApi(SERVICES_URL.whatsappMessagesTemplate, {
        template_name: payload.templateName,
        limit: 1,
        status: 'APPROVED',
      });
      console.log('template===>', JSON.stringify(template, null, 2));
      insertPayload.content = setBodyTextFromObjectVariables(
        template.data.response.whatsapp.templates[0].data.components,
        payload.objectVariables,
      );
    }
    await insertRecords('conversation_whatsapp', insertPayload);
    await insertRecords('conversation_whatsapp_status', {
      conversation_whatsapp_status_uuid: generateCode({ uuid: true }),
      conversation_id: resp
        ? resp.response.whatsapp.messages[0].data.sid
        : insertPayload.conversation_id,
      status: resp ? 'INITIATE' : 'SERVICE_OFF',
      create_ts: insertPayload.create_ts,
    });
    return insertPayload;
  } catch (err) {
    errorMsg = err?.stack;
    console.log('error==>', err?.stack);
  }
};

exports.handleIncomingMessages = (data) => {
  let timeStamp = moment
    .unix(data.messages[0].timestamp)
    .utc()
    .format('YYYY-MM-DD HH:mm:ss');
  let payload = {
    conversation_whatsapp_uuid: generateCode({ uuid: true }),
    conversation_id: data.messages[0].id,
    module_name: 'LEAD',
    from_number: data.messages[0].from,
    to_number: data.display_phone_number,
    message_type: data.messages[0].type,
    content: [{ text: data.messages[0][data.messages[0].type]?.body }],
    attachments,
    raw_payload: data.raw_payload,
    create_ts: timeStamp,
  };
  if (data.messages[0]?.context) {
    payload['reply_from_conversation_id'] = data.messages[0]?.context.id;
  }
  return payload;
};

exports.feedbackConversationService = async (payload) => {
  console.log('payload in feedback==>', payload);
  let lastSendMessagePayload = (
    await getRecords(
      'conversation_whatsapp',
      `where to_number="${payload.from_number}" order by create_ts desc limit 1`,
      null,
      ['is_automatic_message'],
    )
  )[0];
  console.log('lastSendMessagePayload', lastSendMessagePayload);
  if (lastSendMessagePayload.is_automatic_message === 0) return;
  let nextMsg = '';
  let templateName = '';
  if (payload.reply_from_conversation_id) {
    let conversationHistory = (
      await dbRequest(`SELECT a.message_type FROM conversation_whatsapp a INNER JOIN conversation_whatsapp_status b 
ON a.conversation_id=b.conversation_id WHERE a.conversation_id="${payload.reply_from_conversation_id}" AND b.status="INITIATE"`)
    )[0];
    console.log('conversationHistory==>', conversationHistory);
    if (!conversationHistory) return;
    if (conversationHistory.message_type !== 'TEMPLATE') return;
    if (payload.content_type === 'button') {
      let buttonValue = payload.content[0].text;
      console.log('buttonVale==>', buttonValue);
      switch (buttonValue) {
        case 'Great, will book soon':
          nextMsg = `How can we help you move forward with your booking? Reply with any specific requests or assistance you'd like.`;
          break;
        case 'looking for other options':
          templateName = 'not_confirming_booking';
          break;
        case 'Poor, not dealt properly':
          nextMsg = `We're so sorry to hear that your experience was less than ideal. Can you share more details about what went wrong so we can make things right? A senior leader will also give you a call shortly.`;
          break;
        case 'Pricing/Budget':
          nextMsg = `We'd love to understand your budget better and share options that work for you. Please share your best budget so we can make a package for you.`;
          break;
        case 'Venue Details / Decor':
          nextMsg = `
You can choose between our 15+ venues and we can customize all styles and menu offerings based on your budget. 

We've informed our management team and a representative will be calling you shortly. 
          `;
          break;
        case 'Date Availability':
          nextMsg = `We'll double-check the availability of your desired dates and get back to you promptly with venue options.`;
          break;
        case 'Other (please specify)':
          nextMsg = `Thank you, we've informed our management team and a representative will be calling you shortly.`;
          break;
      }
    }
  }

  if (payload.content_type === 'text') {
    nextMsg = `Thank you, we've informed our management team and a representative will be calling you shortly.`;
  }
  let msgPayload = {
    toNumber: payload.from_number,
    is_automatic_message: 1,
  };
  if (templateName) {
    msgPayload['templateName'] = templateName;
  } else {
    msgPayload['message'] = nextMsg;
  }
  console.log('mesgPay==>', msgPayload);
  await this.sendMessagesService(msgPayload);
};

exports.handleExotelIncomingMessages = (data) => {
  let contentType = data.messages[0].content.type;
  let payload = {
    conversation_whatsapp_uuid: generateCode({ uuid: true }),
    conversation_id: data.messages[0].sid,
    module_name: 'LEAD',
    from_number: data.messages[0].from,
    to_number: data.messages[0].to,
    message_type: 'CUSTOM',
    content_type: data.messages[0].content.type,
    content: [
      handleTextValue(data.messages[0].content.type, data.messages[0].content),
    ],
    reply_from_conversation_id: data.messages[0].content?.context?.sid,
    attachments: [],
    raw_payload: JSON.stringify(data, null, 2),
    create_ts: data.messages[0].timestamp,
  };
  this.feedbackConversationService(payload);
  return payload;
};

exports.handleExotelIncomingStatus = (data) => {
  let payload = {
    conversation_whatsapp_status_uuid: generateCode({ uuid: true }),
    conversation_id: data.messages[0].sid,
    status: data.messages[0].exo_detailed_status,
    create_ts: data.messages[0].timestamp,
  };
  return payload;
};

exports.linkWhatsappGroupToModule = async (
  group_id,
  module_name,
  module_uuid,
  status,
) => {
  let filter = {
    group_id,
    module_name,
    module_uuid,
  };
  // removeNullValueKey(payload);
  let isGroupConnected = await isRecordExist(
    'whatsapp_group_module_mapping',
    ['group_id'],
    [group_id],
  );
  if (isGroupConnected) {
    return false;
  }
  let insertPayload = {
    whatsapp_group_module_mapping_uuid: generateCode({ uuid: true }),
    group_id,
    module_name,
    module_uuid,
    status,
    create_ts: moment().format('YYYY-MM-DD HH:mm:ss'),
  };
  await insertRecords('whatsapp_group_module_mapping', insertPayload);
  return true;
};

exports.handleIncomingWhatsappGroupMessageService = async (message) => {
  try {
    const messageRecord = {
      whatsapp_group_module_mapping_uuid: null,
      group_id: message.from,
      group_name: message.groupName,
      from_number: message.author.startsWith('+')
        ? message.author.replace('@c.us', '')
        : '+' + message.author.replace('@c.us', ''),
      from_name: message.notifyName,
      message_type: message.type,
      content: [{ text: message.body || '' }],
      attachments: JSON.stringify([]),
      quoted_message_id: message.parentMsgId,
      raw_payload: JSON.stringify(message),
      is_automatic_message: message.isFromTemplate ? 1 : 0,
      status: 'ACTIVE',
      create_ts: moment.unix(message.t).format('YYYY-MM-DD HH:mm:ss'),
    };
    await insertRecords('whatsapp_group_message', messageRecord);
    return messageRecord;
  } catch (error) {
    console.error('Error handling group message:', error);
    throw error;
  }
};
