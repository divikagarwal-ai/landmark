'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'accn_invoice_payment_accounts_receivable',
      {
        accn_invoice_payment_accounts_receivable_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        accn_invoice_payment_accounts_receivable_unique_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        accn_invoice_payment_accounts_receivable_uuid: {
          type: Sequelize.CHAR(36),
        },
        payment_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        invoice_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        incremental_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        type_trust_or_misc: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        service: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        gl_accounts_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        payment_date: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        payment_amount: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        payment_method: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        reference: {
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
      },
    );
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
