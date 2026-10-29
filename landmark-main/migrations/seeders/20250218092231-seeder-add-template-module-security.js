'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let maxUniqueID =
      (
        await queryInterface.sequelize.query(
          `SELECT max(module_unique_id) as maxUniqueID FROM module`,
        )
      )[0][0].maxUniqueID || 0;

    await queryInterface.bulkInsert('module', [
      {
        module_unique_id: ++maxUniqueID,
        module_uuid: uuidv4(),
        module_name: 'Template',
        submodule_name: 'Template',
        table_name: 'latest_templates',
        map_column_user_uuid: JSON.stringify([
          'created_by_uuid',
          'modified_by_uuid',
        ]),
        column_relation_options: JSON.stringify([
          {
            api: '/user/get-user',
            field: 'email',
            value: 'user_uuid',
            column_key: 'user_uuid',
            column_label: 'User',
          },
          {
            api: '/user/get-branch',
            field: 'branch_name',
            value: 'branch_uuid',
            column_key: 'branch_uuid',
            column_label: 'Branch',
          },
        ]),
        status: 'ACTIVE',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {},
};
