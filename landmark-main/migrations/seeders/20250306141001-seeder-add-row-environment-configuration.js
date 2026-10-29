'use strict';
const { v4: uuidv4 } = require('uuid');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let maxUniqueId = await queryInterface.sequelize.query(
      `SELECT MAX(environment_configuration_unique_id) as maxUniqueId FROM environment_configuration`,
    );

    let superAdmin = await queryInterface.sequelize.query(
      `SELECT * FROM latest_user WHERE email="${process.env.SUPERADMIN_EMAIL}"`,
    );
    await queryInterface.bulkInsert('environment_configuration', [
      {
        environment_configuration_unique_id: maxUniqueId[0][0].maxUniqueId + 1,
        environment_configuration_uuid: uuidv4(),
        env_name: 'Max Login Session Count',
        env_key: 'MAX_LOGIN_SESSION',
        env_value: '5',
        is_encrypted: false,
        created_by_uuid: superAdmin[0][0].user_uuid,
        created_by_name: 'Super Admin',
        modified_by_uuid: superAdmin[0][0].user_uuid,
        modified_by_name: 'Super Admin',
        create_ts: new Date(),
      },
    ]);
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
