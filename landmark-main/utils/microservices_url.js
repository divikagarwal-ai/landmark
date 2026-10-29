require('dotenv').config();
const serverUrl = process.env.MICRO_SERVICE_URL + process.env.PRIFIX_URL;
const whatsappUrl = process.env.MICRO_SERVICE_WHATSAPP_URL;
exports.SERVICES_URL = {
  serverUrl,
  // pdfGenerator: serverUrl + process.env.PDF_GENERATOR,
  pdfGenerator: serverUrl + '/pdf/generate-pdf',
  whatsapp: serverUrl + process.env.TWILIO_WHATSAPP,
  sms: serverUrl + process.env.TWILIO_SMS,
  call: serverUrl + process.env.TWILIO_CALL,
  s3UploadFiles: serverUrl + '/s3/upload-files',
  downloadFileS3: serverUrl + '/s3/download-multiple-files',
  sendAttachmentsEmailSendgrid:
    serverUrl + process.env.SEND_ATTACHMENTS_WITH_EMAIL_SENDGRID,
  companyEmail: serverUrl + process.env.FROM_VERIFIED_EMAIL,
  sendEmail: serverUrl + '/sendgrid/send-email',
  sendSms: serverUrl + process.env.SEND_SMS,
  sendWhatsapp: serverUrl + process.env.SEND_WHATSAPP,
  sendVoiceCall: serverUrl + process.env.SEND_VOICE_CALL,
  ejsPreview: serverUrl + '/ejs/preview-ejs',
  uploadOnS3: serverUrl + '/s3/upload-files',
  microsoftGraphGenerateToken: serverUrl + '/microsoftgraph/generate-token',
  microsoftGraphGetInbox: serverUrl + '/microsoftgraph/get-inbox',
  microsoftGraphSearch: serverUrl + '/microsoftgraph/search',
  microsoftGraphSendEmail: serverUrl + '/microsoftgraph/send-email',
  microsoftGraphGetUnreadEmails:
    serverUrl + '/microsoftgraph/get-unread-emails',
  microsoftGraphMarkEmailAsRead: serverUrl + '/microsoftgraph/mark-read',
  whatsappSendMessages: serverUrl + '/whatsapp/send-messages-through-exotel',
  whatsappMessagesTemplate:
    serverUrl + '/whatsapp/get-messages-templates-exotel',
  whatsappExotelTemplate: serverUrl + '/whatsapp/get-messages-templates-exotel',
  whatsappCreateTemplate:
    serverUrl + '/whatsapp/create-whatsapp-template-exotel',
  whatsappGroupQrCode: whatsappUrl,
  whatsappSendMessagesGroup: whatsappUrl + '/send-messages-group',
  whatsappStatus: whatsappUrl + '/status',
  whatsappGroupRefresh: whatsappUrl + '/refresh-server',
  whatsappAllGroupList: whatsappUrl + '/get-all-groups',
};
