'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_company_charts_of_accounts', {
      accn_company_charts_of_accounts_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      accn_company_charts_of_accounts_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_company_charts_of_accounts_uuid: {
        type: Sequelize.CHAR(36),
      },
      company_charts_of_accounts_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      incremental_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      prefix: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      gl_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      gl_code_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      report_heading_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      balance_sheet_or_income_statement_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      balance_sheet_and_operating_statement_combine_accounts: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      general_ledger_details_report_consolidated_or_detailed: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      custom_cash_disbursement_report_column_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      account_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'ACTIVE',
        allowNull: false,
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
