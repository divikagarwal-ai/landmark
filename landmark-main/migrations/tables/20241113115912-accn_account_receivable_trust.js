'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_account_receivable_trust', {
      accn_account_receivable_trust_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_account_receivable_trust_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_account_receivable_trust_uuid: {
        type: Sequelize.CHAR(36),
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      customer_policy_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      payment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      customer: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      policy_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      branch: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      agency_or_direct_bill: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      finance: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bank_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bank: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      tax_1_percentage: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      tax_1_amount: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      tax_2_percentage: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      tax_2_amount: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      commission_percentage: {
        type: Sequelize.STRING(100),
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
        allowNull: false,
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
