'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_payment_payable_details', {
      accn_payment_payable_details_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_payment_payable_details_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_payment_payable_details_uuid: {
        type: Sequelize.CHAR(36),
      },
      payment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      accn_transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      payment_paid: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      amount_due: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bill_amount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bill_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      is_partial_payment: {
        type: Sequelize.BOOLEAN,
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
