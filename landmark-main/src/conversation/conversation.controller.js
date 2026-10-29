const {
  insertRecords,
  pagination,
  filterFunctionality,
  getRecords,
  dbRequest,
  isValidRecord,
} = require('../../utils/dbFunctions');
const {
  requestApi,
  generateCode,
  throwError,
  responser,
  setDateTimeFormat,
} = require('../../utils/helperFunction');
const service = require('./conversation.service');
const appConfig = require('../../config/server.config');
const moment = require('moment');
const {
  getQrWhatsappService,
  getWhatsappStatusService,
  refreshWhatsappGroupServerService,
  getWhatsappAllGroupListService,
} = require('../../utils/microservice_func');

exports.sendWhatsappMessages = async (req, res) => {
  let resp = await service.sendMessagesService(req.body);
  res.json(responser(200, resp));
};

exports.receiveIncomingEvents = async (req, res) => {
  let payload = {};
  if (req.body.messages.length) {
    payload = service.handleIncomingMessages(req.body);
  }
  res.sendStatus(200);
};

exports.receiveExotelEvents = async (req, res) => {
  const { whatsapp } = req.body;
  console.log('what==>', whatsapp);
  let payload;
  if (whatsapp.messages[0].callback_type === 'incoming_message') {
    payload = service.handleExotelIncomingMessages(whatsapp);
    console.log('payload==>', payload);
    await insertRecords('conversation_whatsapp', payload);
    let statusPayload = {
      conversation_whatsapp_status_uuid: generateCode({ uuid: true }),
      conversation_id: payload.conversation_id,
      status: 'RECEIVED',
      create_ts: setDateTimeFormat('timestamp'),
    };
    await insertRecords('conversation_whatsapp_status', statusPayload);
  } else if (whatsapp.messages[0].callback_type === 'dlr') {
    console.log('i am here');
    payload = service.handleExotelIncomingStatus(whatsapp);
    console.log('object', payload);
    await insertRecords('conversation_whatsapp_status', payload);
  }
  res.sendStatus(200);
};

exports.changeInternalStatus = async (req, res) => {
  const { conversation_ids } = req.body;
  let wpStatus = await getRecords(
    'conversation_whatsapp_status',
    `where conversation_id in ("${conversation_ids.join('","')}") and status="RECEIVED"`,
  );
  if (wpStatus.length) {
    for (let i = 0; i < wpStatus.length; i++) {
      let statusPayload = {
        ...wpStatus[i],
        status: `READ`,
        created_by_name: req.user.full_name,
        created_by_uuid: req.user.user_uuid,
      };
      await insertRecords('conversation_whatsapp_status', statusPayload);
    }
  }
  res.sendStatus(200);
};

exports.sendMessageOnStatus = async (req, res) => {
  // const DREAM_LABS_AUTH_KEY = req.header('dream-Lab-Key');
  const { dream_lab_key } = req.query;
  const DREAM_LABS_AUTH_KEY = dream_lab_key;
  console.log(DREAM_LABS_AUTH_KEY);
  if (DREAM_LABS_AUTH_KEY !== appConfig.DREAM_LABS_AUTH_KEY)
    throwError(401, 'Inavlid Key');
  const { from_number, to_number, lead_status } = req.query;
  let msgPayload = {
    fromNumber: from_number,
    toNumber: to_number,
    templateName: '',
    is_automatic_message: 1,
  };
  if (lead_status.toLowerCase() === 'ongoing') {
    msgPayload.templateName = 'intro_message';
  }
  if (lead_status.toLowerCase() === 'cancelled') {
    msgPayload.templateName = 'cancelled_event';
  }
  if (lead_status.toLowerCase() === 'booked') {
    msgPayload.templateName = 'booking_confirmation';
  }
  if (msgPayload.templateName) {
    await service.sendMessagesService(msgPayload);
    res.sendStatus(200);
  } else {
    res.sendStatus(202);
  }
};

exports.getWhatsappMessagesHistory = async (req, res) => {
  const tableName = 'conversation_whatsapp';
  let {
    phone_number,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
    advanceFilter,
  } = req.query;
  let filter = filterFunctionality(
    {},
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
    advanceFilter,
  ).replace('WHERE', '');

  let pageFilter = pagination(pageNo, itemPerPage, null, {
    preventOrderBy: true,
  });
  let sql = `select * from ( select * from conversation_whatsapp ${filterFunctionality({ from_number: '+91' + phone_number })}or ${filterFunctionality({ to_number: '+91' + phone_number }).replace('WHERE', '')} order by 1 desc ${pageFilter} ) a 
    left JOIN latest_conversation_whatsapp_status b ON a.conversation_id=b.conversation_id  order by 1 asc;`;

  // if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);

  // filter = await roleFilterService(filter, tableName, req.user);
  // let result = await getRecords(tableName, filter, pageFilter);
  let result = await dbRequest(`${sql} ${filter}`);
  return res.json(responser('Messages', result, result.length));
};

exports.getWhatsappStatusHistory = async (req, res) => {
  const tableName = 'conversation_whatsapp_status';
  let {
    conversation_id,
    column,
    value,
    status,
    to_date,
    from_date,
    pageNo,
    itemPerPage,
    advanceFilter,
  } = req.query;
  let filter = filterFunctionality(
    {
      conversation_id,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
    advanceFilter,
  );

  // if (advanceFilter) filter = advanceFiltering(filter, advanceFilter);

  let pageFilter = pagination(pageNo, itemPerPage);

  // filter = await roleFilterService(filter, tableName, req.user);
  let result = await getRecords(tableName, filter, pageFilter);
  return res.json(responser('Messages statuses', result, result.length));
};

exports.isWhatsappConversationStarted = async (req, res) => {
  const { from_number } = req.query;
  let afterTime = moment().subtract(24, 'hour').format('YYYY-MM-DD HH:mm:ss');
  let userMessage = (
    await getRecords(
      'conversation_whatsapp',
      `where create_ts>="${afterTime}" AND to_number="+91${from_number}" ORDER BY create_ts`,
      'limit 1',
    )
  )[0];
  if (!userMessage)
    return res.json(responser('Message Box open', { value: 0 }));
  let customerMessage = (
    await getRecords(
      'conversation_whatsapp',
      `where create_ts>="${afterTime}" AND from_number="+91${from_number}" ORDER BY create_ts`,
      'limit 1',
    )
  )[0];
  if (!customerMessage)
    return res.json(responser('Message Box open', { value: 0 }));
  const firstMoment = moment(userMessage.create_ts);
  const secondMoment = moment(customerMessage.create_ts);
  if (!firstMoment.isBefore(secondMoment))
    return res.json(responser('Message Box open', { value: 0 }));
  return res.json(responser('Message Box open', { value: 1 }));
};

exports.getQrWhatsapp = async (req, res) => {
  let resp = await getQrWhatsappService();
  res.send(resp);
};

exports.whatsappStatus = async (req, res) => {
  let resp = await getWhatsappStatusService();
  res.json(resp);
};

exports.handleIncomingWhatsappGroupMessage = async (req, res) => {
  try {
    const resp = await service.handleIncomingWhatsappGroupMessageService(
      req.body,
    );
    res.json(responser(200, resp));
  } catch (error) {
    console.error('Error handling group message:', error);
    res.status(500).json(responser(500, error.message));
  }
};

exports.getWhatsappAllGroupList = async (req, res) => {
  const resp = await getWhatsappAllGroupListService();
  res.json(responser(200, resp));
};

exports.getGroupMessage = async (req, res) => {
  const {
    group_id,
    module_name,
    module_uuid,
    from_date,
    to_date,
    status,
    column,
    value,
    advanceFilter,
    pageNo,
    itemPerPage,
  } = req.query;

  let filter = filterFunctionality(
    {
      group_id,
      module_name,
      module_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(column) ? column : [column],
    value,
    advanceFilter,
  );

  let groupModuleMappingUuid = (
    await getRecords('whatsapp_group_module_mapping', filter, null, [
      'group_id',
    ])
  )[0];
  let isGroupConnected = groupModuleMappingUuid ? true : false;

  let pageFilter = pagination(pageNo, itemPerPage, null, {
    preventOrderBy: true,
  });

  // filter = await roleFilterService(filter, tableName, req.user);
  // let result = await getRecords(tableName, filter, pageFilter);
  let result = await getRecords(
    'whatsapp_group_message',
    filterFunctionality({
      group_id: groupModuleMappingUuid
        ? groupModuleMappingUuid.group_id
        : 'null',
    }),
    pageFilter,
  );
  return res.json(
    responser('Messages', { result, isGroupConnected }, result.length),
  );
};

exports.linkWhatsappGroupToModule = async (req, res) => {
  let resp = await service.linkWhatsappGroupToModule(
    req.body.group_id,
    req.body.module_name,
    req.body.module_uuid,
    req.body.status,
  );
  if (!resp) {
    throwError(400, 'Group already linked to module');
  }
  res.json(responser(200, req.body));
};

exports.refreshWhatsappGroupServer = async (req, res) => {
  let resp = await refreshWhatsappGroupServerService();
  res.json(responser(200, resp));
};
