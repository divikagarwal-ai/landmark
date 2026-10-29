'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversation_whatsapp', {
      conversation_whatsapp_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      conversation_whatsapp_unique_id: {
        type: Sequelize.INTEGER,
      },
      conversation_whatsapp_uuid: {
        type: Sequelize.CHAR(36),
      },
      conversation_id: {
        type: Sequelize.STRING(100),
      },
      module_name: {
        type: Sequelize.STRING(100),
      },
      from_number: {
        type: Sequelize.STRING(100),
      },
      to_number: {
        type: Sequelize.STRING(50),
      },
      message_type: {
        type: Sequelize.STRING(100),
      },
      content_type: {
        type: Sequelize.STRING(100),
      },
      content: {
        type: Sequelize.JSON,
      },
      reply_from_conversation_id: {
        type: Sequelize.STRING(100),
      },
      attachments: {
        type: Sequelize.JSON,
      },
      is_automatic_message: {
        type: Sequelize.TINYINT,
        defaultValue: 0,
      },
      raw_payload: {
        type: Sequelize.TEXT,
      },
      created_by_uuid: {
        type: Sequelize.CHAR(36),
      },
      created_by_name: {
        type: Sequelize.STRING(100),
      },
      modified_by_uuid: {
        type: Sequelize.CHAR(36),
      },
      modified_by_name: {
        type: Sequelize.STRING(100),
      },
      create_ts: {
        type: Sequelize.DATE,
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
