'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_invoice_transaction_items', {
      accn_invoice_transaction_items_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Primary Key',
      },
      accn_invoice_transaction_items_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_invoice_transaction_items_uuid: {
        type: Sequelize.CHAR(36),
      },
      invoice_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      accn_transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      transaction_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      amount: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      tax_one_percentage: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      tax_one_amount: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      tax_two_percentage: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      tax_two_amount: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      commission_percentage: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      commission_amount: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      house_percentage: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      house_amount: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      producer_one_percentage: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      producer_one_amount: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      producer_two_percentage: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      producer_two_amount: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      producer_three_percentage: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      producer_three_amount: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      branch_percentage: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      branch_amount: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      total_amount: {
        type: Sequelize.STRING(50),
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
