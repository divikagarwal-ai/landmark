'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_history', {
      email_history_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email_history_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      email_history_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      email_conversation_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      module_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      module_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      from_email: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      to_mail_ids: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      cc_mail_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      bcc_mail_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      body: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      send_received_ts: {
        type: Sequelize.DATE,
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
