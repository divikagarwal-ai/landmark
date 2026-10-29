'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_cheque', {
      accn_cheque_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      accn_cheque_unique_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
      },
      accn_cheque_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
      },
      payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payment_method_cheque: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cheque_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
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
      bank_acount: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payee: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      mailing_address: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      unit_or_suite: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      province_state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      postal_code: {
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
        type: Sequelize.TIMESTAMP,
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
