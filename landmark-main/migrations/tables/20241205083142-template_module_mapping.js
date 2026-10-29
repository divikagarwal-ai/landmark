'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('template_module_mapping', {
      template_module_mapping_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      template_module_mapping_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      template_module_mapping_uuid: {
        type: Sequelize.CHAR(36),
      },
      template_module_mapping_code: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        defaultValue: '',
      },
      template_code: {
        type: Sequelize.CHAR(10),
        allowNull: true,
        defaultValue: null,
      },
      module: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      sub_module: {
        type: Sequelize.STRING(255),
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
