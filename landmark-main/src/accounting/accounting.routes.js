const express = require('express');
const controller = require('./accounting.controller');
const checkAuth = require('../../middleware/checkAuth');
const { requestErrorHandlingDecorator } = require('../../utils/helperFunction');

const router = express.Router();

router
  .route('/edit-account-payment-accounts-receivable')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.editAccountPaymentAccountsReceivable,
    ),
  );

router
  .route('/get-account-payment-accounts-receivable')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.getAccountPaymentAccountsReceivable,
    ),
  );

router
  .route('/edit-account-invoice-payment-transaction-items')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.editAccountInvoicePaymentTransactionItems,
    ),
  );

router
  .route('/get-account-invoice-payment-transaction-items')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.getAccountInvoicePaymentTransactionItems,
    ),
  );

router
  .route('/get-account-payment-accounts-receivable-history')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.getAccountPaymentAccountsReceivableHistory,
    ),
  );

router
  .route('/edit-account-company-charts-of-accounts')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.editAccountCompanyChartsOfAccounts,
    ),
  );

router
  .route('/get-account-company-charts-of-accounts')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.getAccountCompanyChartsOfAccounts,
    ),
  );

router
  .route('/edit-account-company-gl-accounts')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.editAccountCompanyGlAccounts,
    ),
  );

router
  .route('/get-account-company-gl-accounts')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountCompanyGlAccounts),
  );

router
  .route('/edit-account-company-information')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.editAccountCompanyInformation,
    ),
  );

router
  .route('/get-account-company-information')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.getAccountCompanyInformation,
    ),
  );

router
  .route('/get-account-company-information-public')
  .get(
    requestErrorHandlingDecorator(
      null,
      controller.getAccountCompanyInformationPublic,
    ),
  );

router
  .route('/edit-account-company-onboarding')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.editAccountCompanyOnboarding,
    ),
  );

router
  .route('/get-account-company-onboarding')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountCompanyOnboarding),
  );

router
  .route('/edit-account-invoice')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccnInvoice),
  );

router
  .route('/get-account-invoice')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccnInvoice),
  );

router
  .route('/get-account-invoice-and-payment-history')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.getAccnInvoiceAndPaymentHistory,
    ),
  );

router
  .route('/edit-accn-transaction-report')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccnTransactionReport),
  );

router
  .route('/get-accn-transaction-report-history')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccnTransactionReport),
  );

router
  .route('/get-accn-reports-fields-to-exports')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getReportFieldsToExports),
  );

router
  .route('/get-account-amount-sum')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.getAccnInvoiceTransactionTypeAmountSum,
    ),
  );

router
  .route('/edit-account-invoice-template')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccountInvoiceTemplate),
  );

router
  .route('/get-account-invoice-template')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountInvoiceTemplate),
  );

router
  .route('/edit-account-transaction-type')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccountTransactionType),
  );

router
  .route('/get-account-transaction-type')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountTransactionType),
  );

router
  .route('/edit-account-transaction-description')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.editAccountTransactionDescription,
    ),
  );

router
  .route('/get-account-transaction-description')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.getAccountTransactionDescription,
    ),
  );

router
  .route('/edit-account-create-bill')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccountCreateBill),
  );

router
  .route('/get-account-create-bill')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountCreateBill),
  );

router
  .route('/get-account-bill-and-payment-history')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.getAccountBillAndPaymentHistory,
    ),
  );

router
  .route('/edit-account-bill-payment-transaction-items')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.editAccountBillTransactionItems,
    ),
  );

router
  .route('/get-account-bill-payment-transaction-items')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(
      null,
      controller.getAccountBillTransactionItems,
    ),
  );

router
  .route('/edit-account-bill-template')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccountBillTemplate),
  );

router
  .route('/get-account-bill-template')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountBillTemplate),
  );

router
  .route('/edit-account-create-payment')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccountCreatePayment),
  );

router
  .route('/get-account-create-payment')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountCreatePayment),
  );

router
  .route('/edit-account-bank-account')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccountBankAccount),
  );

router
  .route('/get-account-bank-account')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountBankAccount),
  );

router
  .route('/edit-account-cheque')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccountCheque),
  );

router
  .route('/get-account-cheque')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountCheque),
  );

router
  .route('/edit-account-vendor')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccountVendor),
  );

router
  .route('/get-account-vendor')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountVendor),
  );

router
  .route('/edit-account-system-gl-account')
  .post(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.editAccountSystemGlAccount),
  );

router
  .route('/get-account-system-gl-account')
  .get(
    checkAuth,
    requestErrorHandlingDecorator(null, controller.getAccountSystemGlAccount),
  );

module.exports = router;
