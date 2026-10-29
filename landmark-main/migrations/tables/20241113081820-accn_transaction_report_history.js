'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_transaction_report_history', {
      accn_transaction_report_history_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_transaction_report_history_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_transaction_report_history_uuid: {
        type: Sequelize.CHAR(36),
      },
      accn_transaction_report_history_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      from_date: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      to_date: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      sub_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      view: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      customer_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      policy_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      producer_one_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      branch_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      csr_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      insurer_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      line_of_business: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      transaction_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      policy_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      policy_transaction_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      agency_or_direct_bill: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      policy_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      effective_date: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      vendor: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      vendor_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      payment_terms: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      gl_account: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      fields_to_exports: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      attachment: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: true,
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
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      insert_ts: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
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
