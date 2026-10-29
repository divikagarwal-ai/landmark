'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_accounting_information', {
      accn_accounting_information_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_accounting_information_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_accounting_information_uuid: {
        type: Sequelize.CHAR(36),
      },
      commision_percentage: {
        type: Sequelize.STRING(100),
      },
      total_commision_amount: {
        type: Sequelize.INTEGER,
      },
      net_payable_new: {
        type: Sequelize.INTEGER,
      },
      transaction_description: {
        type: Sequelize.STRING(1000),
      },
      commision_split_table: {
        type: Sequelize.STRING(100),
      },
      premium_financed: {
        type: Sequelize.STRING(50),
      },
      financed_by: {
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
