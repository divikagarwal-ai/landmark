'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_vendor', {
      accn_vendor_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_vendor_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_vendor_uuid: {
        type: Sequelize.CHAR(36),
      },
      insurer_code_yes_or_no: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      insurer_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      vendor_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
        // Vendor code will be auto-generated
      },
      vendor_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      mailing_address: {
        type: Sequelize.STRING(100),
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
      state_or_province: {
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
      language_e_f: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      contact_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ext: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      toll_free: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      transit_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bank_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      account_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      primary_gl_account_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      primary_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      primary_details: {
        type: Sequelize.STRING(100),
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
