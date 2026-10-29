'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('templates', {
      templates_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      templates_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      templates_uuid: {
        type: Sequelize.CHAR(36),
      },
      template_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null,
      },
      template_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      template_category: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null,
      },
      call_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null,
      },
      table_name_or_dynamic_view_code: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      template_subject: {
        type: Sequelize.STRING(500),
        allowNull: true,
        defaultValue: null,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
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
