'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workflow_logs', {
      workflow_logs_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      workflow_logs_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      workflow_logs_uuid: {
        type: Sequelize.CHAR(36),
      },
      workflow_logs_code: {
        type: Sequelize.CHAR(6),
        allowNull: true,
      },
      workflow_basic_code: {
        type: Sequelize.CHAR(6),
        allowNull: true,
      },
      endpoint_path: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      trigger_action: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      step_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      error_log: {
        type: Sequelize.TEXT,
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
        allowNull: true,
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
