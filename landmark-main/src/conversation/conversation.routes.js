const express = require('express');
const controller = require('./conversation.controller');
const checkAuth = require('../../middleware/checkAuth');
const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');

const router = express.Router();

router
  .route('/whatsapp-send-messages')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.sendWhatsappMessages),
  );

router
  .route('/incoming-events')
  .post(requestErrorHandlingDecorator(null, controller.receiveExotelEvents));

router
  .route('/change-internal-status')
  .put(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.changeInternalStatus),
  );

router
  .route('/send-message-on-status')
  .get(requestErrorHandlingDecorator(null, controller.sendMessageOnStatus));

router
  .route('/get-whatsapp-messages-history')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getWhatsappMessagesHistory),
  );
router
  .route('/get-whatsapp-status-history')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getWhatsappStatusHistory),
  );
router
  .route('/is-whatsapp-conversation-started')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.isWhatsappConversationStarted,
    ),
  );
router
  .route('/get-whatsapp-qr-code')
  .get(requestErrorHandlingDecorator(null, controller.getQrWhatsapp));

router
  .route('/status')
  .get(requestErrorHandlingDecorator(null, controller.whatsappStatus));

router
  .route('/incoming-group-events')
  .post(
    requestErrorHandlingDecorator(
      null,
      controller.handleIncomingWhatsappGroupMessage,
    ),
  );

router
  .route('/get-group-messages')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getGroupMessage),
  );

router
  .route('/link-whatsapp-group-to-module')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.linkWhatsappGroupToModule),
  );

router
  .route('/refresh-server')
  .get(
    requestErrorHandlingDecorator(null, controller.refreshWhatsappGroupServer),
  );

router
  .route('/get-all-groups')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getWhatsappAllGroupList),
  );

module.exports = router;
