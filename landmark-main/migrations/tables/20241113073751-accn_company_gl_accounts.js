'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_company_gl_accounts', {
      accn_company_gl_accounts_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_company_gl_accounts_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_company_gl_accounts_uuid: {
        type: Sequelize.CHAR(36),
      },
      charts_of_accounts_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      gl_account_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true, // Make this field unique
      },
      agency_bill_receivables: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      direct_bill_receivables: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      net_income: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      retained_earnings: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      cash_disbursements_asset_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      agency_bill_trust_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      general_cash_receipts_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      agency_bill_tax_payable_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      agency_bill_tax_two_payable_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      vat_on_direct_bill_commisions_payable_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      vat_on_agency_bill_earned_commissions_expense_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      agency_bill_tax_trust_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      direct_bill_bonus_commision_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      direct_bill_charge_back_commision_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      direct_bill_charge_back_bonus_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      finance_and_service_charge_income_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      automatic_writeoff_waiver_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'ACTIVE',
      },
      created_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      created_by_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      modified_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      modified_by_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      create_ts: {
        type: Sequelize.DATE,
      },
      insert_ts: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
