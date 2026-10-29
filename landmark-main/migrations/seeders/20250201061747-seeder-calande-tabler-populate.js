'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let currentDate = new Date().toISOString().slice(0, 10);
    let afterFiveYearDate = new Date(
      new Date().setFullYear(new Date().getFullYear() + 5),
    )
      .toISOString()
      .slice(0, 10);
    await queryInterface.sequelize.query(
      `CALL \`Generatecalendar\`('${currentDate}', '${afterFiveYearDate}')`,
    );
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
