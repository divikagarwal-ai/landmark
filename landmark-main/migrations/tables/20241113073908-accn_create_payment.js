'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_create_payment', {
      accn_create_payment_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_create_payment_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_create_payment_uuid: {
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
      incremental_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      vendor: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payment_made: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bank_charges: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payment_method: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      paid_through_account: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      reference: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      notes: {
        type: Sequelize.STRING(100),
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
