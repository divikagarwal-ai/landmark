'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_bank_account', {
      accn_bank_account_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      accn_bank_account_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_bank_account_uuid: {
        type: Sequelize.CHAR(36),
      },
      bank_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bank_account_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bank_account_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      account_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      gl_account_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      branch_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      last_used_cheque_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      last_used: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      last_used_receipts_batch_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      original_opening_balance: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      original_opening_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      current_month_opening_balance: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      current_month_opening_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      current_balance: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      current_balance_date: {
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
