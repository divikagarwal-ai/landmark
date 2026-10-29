'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_information', {
      company_information_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_information_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      company_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      company_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      company_title: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      company_description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      unit_or_suite: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      province_or_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      postal_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      telephone: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      fax: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      default_language: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      accounts_email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cl_email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pl_email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      default_tax_region: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pst_or_gst_or_vat_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bahamas_premium_tax: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      logo: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      fav_icon: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      adsense_header_code: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      about: {
        type: Sequelize.TEXT,
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
        allowNull: true,
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
