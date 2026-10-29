'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('whatsapp_group_message', {
      whatsapp_group_message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      whatsapp_group_message_unique_id: {
        type: Sequelize.INTEGER,
      },
      whatsapp_group_module_mapping_uuid: {
        type: Sequelize.CHAR(36),
      },
      module_name: {
        type: Sequelize.STRING(100),
      },
      module_uuid: {
        type: Sequelize.CHAR(36),
      },
      group_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      group_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      from_number: {
        type: Sequelize.STRING(100),
      },
      from_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      message_type: {
        type: Sequelize.STRING(255),
      },
      content: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      attachments: {
        type: Sequelize.JSON,
      },
      quoted_message_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      raw_payload: {
        type: Sequelize.TEXT,
      },
      is_automatic_message: {
        type: Sequelize.TINYINT,
        defaultValue: 0,
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

  down: async (queryInterface, Sequelize) => {},
};
