'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('module', {
      module_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      module_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      module_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      module_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      submodule_name: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      table_name: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      map_column_user_uuid: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      column_relation_options: {
        type: Sequelize.JSON,
        allowNull: false,
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
