'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TABLE market_campaign modify COLUMN campaign_start_date DATE`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE market_campaign modify COLUMN campaign_end_date DATE`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE market_campaign ADD COLUMN campaign_time TIME after campaign_end_date`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE market_campaign ADD COLUMN cron_id char(36) after campaign_time`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE market_campaign ADD COLUMN cron_status VARCHAR(50) after cron_id`,
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
