'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_create_bill', {
      accn_create_bill_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_create_bill_unique_id: {
        type: Sequelize.INTEGER(100),
        allowNull: false,
      },
      accn_create_bill_uuid: {
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
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bill_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bill_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      due_date: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payment_terms: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bill_notes: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bill_footer_information: {
        type: Sequelize.STRING(100),
        allowNull: true,
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
