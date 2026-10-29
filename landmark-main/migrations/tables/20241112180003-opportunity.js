'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('opportunity', {
      opportunity_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      opportunity_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      opportunity_uuid: {
        type: Sequelize.CHAR(36),
      },

      leads_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      customer_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      customer_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      customer_fact_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      due_date: {
        type: Sequelize.STRING(50),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      amount: {
        type: Sequelize.STRING(50),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      source: {
        type: Sequelize.STRING(50),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      probability: {
        type: Sequelize.STRING(50),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      business_name: {
        type: Sequelize.STRING(500),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      file_upload: {
        type: Sequelize.STRING(50),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'ACTIVE',
        collate: 'utf8mb4_general_ci',
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
