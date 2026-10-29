'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_bill_transaction_items', {
      accn_bill_transaction_items_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      accn_bill_transaction_items_unique_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
      },
      accn_bill_transaction_items_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      accn_transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      detail: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      account: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tax_percentage: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tax_amount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      final_amount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      vendor: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      bill_date: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      bill_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bill_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      due_date: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      payment_terms: {
        type: Sequelize.STRING(50),
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
