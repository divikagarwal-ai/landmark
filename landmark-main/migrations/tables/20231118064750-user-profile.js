'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_profile', {
      user_profile_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_profile_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      user_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      personal_email: {
        type: Sequelize.STRING(200),
      },
      job_title: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      user_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      assigned_phone_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      shared_email: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      mobile: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      home_phone: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      phone_ext: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      reports_to: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      enable_sendgrid: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      sin: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      broker: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      non_active_firm: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      non_active_firm_registered_with_ribo: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      non_active_firm_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      business_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      bank_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      bank: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      transit: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      account: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      defaults_producer: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      csr: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      csr_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      marketer: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      marketer_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      producer_one: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      producer_one_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      producer_two: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      producer_two_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      producer_three: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      producer_three_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      branch_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      user_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      bonus_liability_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      bonus_expense_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      commission_liability_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      commission_expense_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      linkedin_profile: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      hire_date: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      last_day_at_work: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      department: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      fax: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      mother_maiden_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      photo: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      signature: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      street_address: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      unit_or_suite: {
        type: Sequelize.STRING(100),
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
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      languages_known: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      documents: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      branch_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      branch_uuid: {
        type: Sequelize.CHAR(36),
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
