'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booking', {
      booking_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      booking_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      booking_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      occupancy_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      user_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      leads_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      customer_fact_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      customer_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      customer_email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      customer_mobile_no: {
        type: Sequelize.STRING(100),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      venue_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      venue_name: {
        type: Sequelize.STRING(500),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      shift_time: {
        type: Sequelize.STRING(100),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      event_time: {
        type: Sequelize.STRING(100),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      total_price: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      total_guest: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      from_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      to_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      food_menu: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: 'ACTIVE',
        collate: 'utf8mb4_general_ci',
      },
      created_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      created_by_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      modified_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
      },
      modified_by_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
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
