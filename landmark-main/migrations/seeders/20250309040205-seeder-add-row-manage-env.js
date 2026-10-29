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
        environment_configuration_unique_id: ++maxUniqueId[0][0].maxUniqueId,
        environment_configuration_uuid: uuidv4(),
        env_name: 'Leads Per Day status report email',
        env_key: 'STATUS_REPORT_EMAIL',
        env_value: '',
        is_encrypted: false,
        status: 'active',
        created_by_uuid: superAdmin[0][0].user_uuid,
        created_by_name: 'Super Admin',
        modified_by_uuid: superAdmin[0][0].user_uuid,
        modified_by_name: 'Super Admin',
        create_ts: new Date(),
      },
      {
        environment_configuration_unique_id: ++maxUniqueId[0][0].maxUniqueId,
        environment_configuration_uuid: uuidv4(),
        env_name: 'Send Leads Per Day status report',
        env_key: 'SEND_STATUS_REPORT',
        env_value: 'false',
        is_encrypted: false,
        status: 'active',
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
