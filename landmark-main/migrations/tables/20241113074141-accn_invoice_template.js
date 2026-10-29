'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_invoice_template', {
      accn_invoice_template_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accn_invoice_template_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_invoice_template_uuid: {
        type: Sequelize.CHAR(36),
      },
      accn_invoice_template_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
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
      invoice_notes: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      invoice_footer: {
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
