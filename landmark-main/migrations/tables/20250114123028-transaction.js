'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transaction', {
      transaction_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      transaction_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      transaction_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      opportunity_uuid: {
        type: Sequelize.CHAR(50),
        allowNull: true,
      },
      customer_fact_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      customer_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      fees_paid: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      remarks: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      created_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      created_by_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      modified_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      modified_by_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
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
