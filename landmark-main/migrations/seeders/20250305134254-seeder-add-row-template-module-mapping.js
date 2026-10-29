'use strict';

const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let maxUniqueId = await queryInterface.sequelize.query(
      `SELECT MAX(template_module_mapping_unique_id) as maxUniqueId FROM template_module_mapping`,
    );
    let superAdmin = await queryInterface.sequelize.query(
      `SELECT * FROM latest_user WHERE email="${process.env.SUPERADMIN_EMAIL}"`,
    );

    await queryInterface.bulkInsert('template_module_mapping', [
      {
        template_module_mapping_unique_id: maxUniqueId[0][0].maxUniqueId + 1,
        template_module_mapping_uuid: uuidv4(),
        template_code: null,
        module: 'LEAD',
        sub_module: 'STATUS_REPORT',
        status: 'ACTIVE',
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
