'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_company_tax_information', {
      accn_company_tax_information_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_company_tax_information_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_company_tax_information_uuid: {
        type: Sequelize.CHAR(36),
      },
      tax_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      default_tax_region: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pst_gst_vat_number: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      bahamas_premium_tax: {
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
