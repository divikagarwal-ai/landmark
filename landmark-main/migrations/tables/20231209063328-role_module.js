'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_module', {
      role_module_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_module_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      role_module_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      module_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      role_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      show_module: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      view_access: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      edit_access: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      send_sms: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      send_mail: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      send_whatsapp: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      send_call: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      filter_values: {
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
