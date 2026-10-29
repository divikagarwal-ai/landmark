'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workflow_action_email', {
      workflow_action_email_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      workflow_action_email_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      workflow_action_email_uuid: {
        type: Sequelize.CHAR(36),
      },
      workflow_action_email_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      workflow_basic_code: {
        type: Sequelize.CHAR(6),
        allowNull: false,
      },
      workflow_action_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      call_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      to: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      cc: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      bcc: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      sending_order: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      template_code: {
        type: Sequelize.STRING(100),
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
