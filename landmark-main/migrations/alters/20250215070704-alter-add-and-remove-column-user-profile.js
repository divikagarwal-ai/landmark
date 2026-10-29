'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove branch_name and branch_uuid columns
    await queryInterface.removeColumn('user_profile', 'branch_name');
    await queryInterface.removeColumn('user_profile', 'branch_uuid');
  },

  async down(queryInterface, Sequelize) {},
};
