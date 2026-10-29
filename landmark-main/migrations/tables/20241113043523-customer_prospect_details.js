'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_prospect_details', {
      customer_prospect_details_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customer_prospect_details_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      customer_fact_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      customer_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      customer_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      form_of_business: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      tax_zone: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mailing_address: {
        type: Sequelize.STRING(500),
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
      province_or_state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      postal_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      language: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      producer: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      marketer: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      branch: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      assigned_to: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      csr: {
        type: Sequelize.STRING(50),
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
