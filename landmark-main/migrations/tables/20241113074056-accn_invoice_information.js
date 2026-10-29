'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_invoice_information', {
      accn_invoice_information_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_invoice_information_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_invoice_information_uuid: {
        type: Sequelize.CHAR(36),
      },
      invoice_information_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      invoice_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      invoice_due_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payment_terms: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      accounting_information_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      customer_or_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      policy_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      policy_status: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      transaction_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      effective_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      default_tax_region: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      agency_or_direct_bill: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      insurer_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      premium_financed: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      financed_by: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      invoice_notes: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      invoice_footer_information: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
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
