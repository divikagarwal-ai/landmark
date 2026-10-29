'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('occupancy', {
      occupancy_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      occupancy_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      occupancy_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      venue_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      venue_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      shift_time: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      calendar_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      calendar_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
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
