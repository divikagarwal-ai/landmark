'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let maxUniqueID =
      (
        await queryInterface.sequelize.query(
          `SELECT max(role_unique_id) as maxUniqueID FROM role`,
        )
      )[0][0].maxUniqueID || 0;
    await queryInterface.bulkInsert('role', [
      {
        role_unique_id: ++maxUniqueID,
        role_name: 'Superadmin',
        role_value: 'SUPERADMIN',
        role_uuid: uuidv4(),
        role_group: 'ALL',
        status: 'ACTIVE',
      },
      {
        role_unique_id: ++maxUniqueID,
        role_name: 'Admin',
        role_value: 'ADMIN',
        role_uuid: uuidv4(),
        role_group: 'ALL',
        status: 'ACTIVE',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {},
};
