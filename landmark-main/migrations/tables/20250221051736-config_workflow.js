'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('config_workflow', {
      config_workflow_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary Key',
      },
      config_workflow_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      config_workflow_uuid: {
        type: Sequelize.CHAR(36),
      },
      user_fact_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      workflow_connection_for: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null,
      },
      headers: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null,
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
