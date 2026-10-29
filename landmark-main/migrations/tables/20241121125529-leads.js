'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leads', {
      leads_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      leads_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      leads_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      lead_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      date_of_visit: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      function_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      function_month: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      followup_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      name_of_guest: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      contact_number_one: {
        type: Sequelize.STRING(15),
        allowNull: true,
        defaultValue: null,
      },
      event_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null,
      },
      number_of_guests: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      handled_by_employee: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      handled_by_employee_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        defaultValue: null,
      },
      alt_function_month: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      contact_number_two: {
        type: Sequelize.STRING(15),
        allowNull: true,
        defaultValue: null,
      },
      event_time: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      event_time_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        defaultValue: null,
      },
      preferred_venue: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      preferred_venue_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        defaultValue: null,
      },
      number_of_rooms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'ONGOING',
      },
      created_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        defaultValue: null,
      },
      created_by_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      modified_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        defaultValue: null,
      },
      modified_by_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      create_ts: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      insert_ts: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('events');
  },
};
