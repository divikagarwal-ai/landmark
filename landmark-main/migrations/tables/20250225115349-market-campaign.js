'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('market_campaign', {
      market_campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      market_campaign_unique_id: {
        type: Sequelize.INTEGER,
      },
      market_campaign_uuid: {
        type: Sequelize.CHAR(36),
      },
      module_name: {
        type: Sequelize.STRING(100),
      },
      module_uuid: {
        type: Sequelize.CHAR(36),
      },
      campaign_name: {
        type: Sequelize.STRING(100),
      },
      campaign_rule: {
        type: Sequelize.JSON,
      },
      campaign_sql_rule: {
        type: Sequelize.TEXT,
      },
      channel_type: {
        type: Sequelize.STRING(100),
      },
      channel_uuid: {
        type: Sequelize.CHAR(36),
      },
      module_channel_related_columns_name: {
        type: Sequelize.JSON,
      },
      module_variables_columns_name: {
        type: Sequelize.JSON,
      },
      campaign_start_date: {
        type: Sequelize.DATE,
      },
      campaign_end_date: {
        type: Sequelize.DATE,
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
