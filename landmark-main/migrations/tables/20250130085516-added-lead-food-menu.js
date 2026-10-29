'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('added_lead_food_menu', {
      added_lead_food_menu_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: 'Primary Key',
      },
      added_lead_food_menu_unique_id: {
        type: Sequelize.INTEGER,
      },
      added_lead_food_menu_uuid: {
        type: Sequelize.CHAR(36),
      },
      leads_uuid: {
        type: Sequelize.CHAR(36),
      },
      customer_uuid: {
        type: Sequelize.CHAR(36),
      },
      menu_json: {
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
