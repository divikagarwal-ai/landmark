'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_personal_information', {
      customer_personal_information_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_personal_information_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      customer_personal_information_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      customer_fact_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      customer_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      inquiry_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      salutation: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      customer_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      permanent_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      caste_category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pincode: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      goes_by: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      position: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      contact_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      phone_ext: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      remarks: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      inquiry_reference: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      followUp_date_and_remark: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      father_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      mother_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      annual_income: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      package_structure: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      family_income: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      aadhar_no: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      docs_upload: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
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
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      insert_ts: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
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
