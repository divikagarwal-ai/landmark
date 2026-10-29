'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('templates_dynamic_views', {
      templates_dynamic_views_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      templates_dynamic_views_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      templates_dynamic_views_uuid: {
        type: Sequelize.CHAR(36),
      },
      templates_dynamic_views_code: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
      view_for: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      view_sql: {
        type: Sequelize.STRING(50),
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
