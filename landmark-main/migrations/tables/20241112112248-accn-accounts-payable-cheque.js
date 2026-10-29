'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_accounts_payable_cheque', {
      accn_accounts_payable_cheque_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_accounts_payable_cheque_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_accounts_payable_cheque_uuid: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accounts_payable_uuid: {
        type: Sequelize.CHAR(36),
      },
      cheque_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cheque_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cheque_amount: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cheque_voided: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cheque_voided_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cheque_printed: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cheque_printed_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cheque_cleared: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cheque_cleared_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      clear_pay_y_n: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      clear_pay_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      clear_pay_branch_code: {
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
