'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workflow_condition', {
      workflow_condition_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      workflow_condition_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      workflow_condition_uuid: {
        type: Sequelize.CHAR(36),
      },
      workflow_condition_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      workflow_basic_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      call_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      conditions: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      condition_variables: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      sql_statement: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ui_related: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      ui_module_name: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      nodes: {
        type: Sequelize.JSON,
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
