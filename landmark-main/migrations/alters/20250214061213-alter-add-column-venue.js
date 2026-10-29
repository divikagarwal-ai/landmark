'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TABLE \`venue\` ADD COLUMN \`branch_uuid\` CHAR(36) NULL AFTER \`venue_name\``,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE \`venue\` ADD COLUMN \`branch_name\` VARCHAR(100) NULL AFTER \`branch_uuid\`;`,
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
