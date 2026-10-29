'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calendar', {
      calendar_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      calendar_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      calendar_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      CalendarDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      CalendarDay: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      CalendarMonth: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      CalendarQuarter: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      CalendarYear: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      DayOfWeekNum: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      DayOfWeekName: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      DateNum: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      QuarterCD: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      MonthNameCD: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      FullMonthName: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      HolidayName: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      HolidayFlag: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'ACTIVE',
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
