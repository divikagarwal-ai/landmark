'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('whatsapp_group_variable_mapping', {
      whatsapp_group_variable_mapping_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      whatsapp_group_variable_mapping_unique_id: {
        type: Sequelize.INTEGER,
      },
      whatsapp_group_variable_mapping_uuid: {
        type: Sequelize.CHAR(36),
      },
      template_name: {
        type: Sequelize.STRING(100),
      },
      module_name: {
        type: Sequelize.STRING(100),
      },
      module_uuid: {
        type: Sequelize.CHAR(36),
      },
      phone_number_columns: {
        type: Sequelize.JSON,
      },
      variables: {
        type: Sequelize.JSON,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: true,
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
      create_ts: {
        type: Sequelize.DATE,
        allowNull: false,
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
