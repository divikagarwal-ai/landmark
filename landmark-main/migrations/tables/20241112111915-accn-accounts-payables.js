'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_accounts_payable', {
      accn_accounts_payable_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_accounts_payable_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_accounts_payable_uuid: {
        type: Sequelize.CHAR(36),
      },
      accounts_payable_type: {
        type: Sequelize.STRING(100),
      },
      vendor_id: {
        type: Sequelize.STRING(100),
      },
      customer_id: {
        type: Sequelize.STRING(100),
      },
      customer_policy_id: {
        type: Sequelize.STRING(100),
      },
      status: {
        type: Sequelize.STRING(20),
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
