'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TABLE conversation_whatsapp ADD COLUMN reference_uuid_column_name varchar(100) after conversation_whatsapp_uuid`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE conversation_whatsapp ADD COLUMN reference_uuid_column_value char(36) after reference_uuid_column`,
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
