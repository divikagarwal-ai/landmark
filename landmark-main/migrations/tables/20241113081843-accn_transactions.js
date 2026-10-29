'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_transactions', {
      accn_transactions_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_transactions_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_transactions_uuid: {
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
      invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      incremental_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      transaction_type: {
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
      transaction_amount: {
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
      total_transaction_amount: {
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
