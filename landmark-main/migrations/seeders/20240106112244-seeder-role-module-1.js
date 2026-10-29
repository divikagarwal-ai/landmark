'use strict';

const { v4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const modules = (
      await queryInterface.sequelize.query(`SELECT * FROM \`module\``)
    )[0];
    const superadmin = (
      await queryInterface.sequelize.query(
        `SELECT * FROM latest_role WHERE role_value = 'SUPERADMIN'`,
      )
    )[0][0];
    const admin = (
      await queryInterface.sequelize.query(
        `SELECT * FROM latest_role WHERE role_value = 'ADMIN'`,
      )
    )[0][0];
    let roleSecurity = [];
    let maxUniqueID =
      (
        await queryInterface.sequelize.query(
          `SELECT max(role_module_unique_id) as maxUniqueID FROM role_module`,
        )
      )[0][0].maxUniqueID || 0;
    // superadmin
    for (const module of modules) {
      roleSecurity.push({
        role_module_unique_id: ++maxUniqueID,
        role_module_uuid: v4(),
        module_uuid: module.module_uuid,
        role_uuid: superadmin.role_uuid,
        show_module: 1,
        view_access: 1,
        edit_access: 1,
        send_sms: 1,
        send_mail: 1,
        send_whatsapp: 1,
        send_call: 1,
        filter_values: JSON.stringify({ or: { user_uuid: ['*'] } }),
        status: 'ACTIVE',
      });
    }
    // admin
    for (const module of modules) {
      roleSecurity.push({
        role_module_unique_id: ++maxUniqueID,
        role_module_uuid: v4(),
        module_uuid: module.module_uuid,
        role_uuid: admin.role_uuid,
        show_module: 1,
        view_access: 1,
        edit_access: 1,
        send_sms: 1,
        send_mail: 1,
        send_whatsapp: 1,
        send_call: 1,
        filter_values: JSON.stringify({ or: { user_uuid: ['*'] } }),
        status: 'ACTIVE',
      });
    }
    await queryInterface.bulkInsert('role_module', roleSecurity);
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
