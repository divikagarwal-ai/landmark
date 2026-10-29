'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_transaction_type', {
      accn_transaction_type_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_transaction_type_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_transaction_type_uuid: {
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
      transaction_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      transaction_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      chart_of_accounts_linked: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      detail: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      incremental_number: {
        type: Sequelize.INTEGER,
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
