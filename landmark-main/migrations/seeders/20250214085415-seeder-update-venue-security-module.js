'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate(
      'module',
      {
        map_column_user_uuid: JSON.stringify([
          'created_by_uuid',
          'modified_by_uuid',
          'branch_uuid',
        ]),
      },
      {
        module_name: 'Venue',
        submodule_name: 'Venue',
        table_name: 'latest_venue',
      },
    );
  },

  async down(queryInterface, Sequelize) {},
};
