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
        module_name: 'Tasks',
        submodule_name: 'Taskboard',
        table_name: 'latest_tasks',
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
      {
        module_unique_id: ++maxUniqueID,
        module_uuid: uuidv4(),
        module_name: 'Users',
        submodule_name: 'Users',
        table_name: 'latest_user',
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
      {
        module_unique_id: ++maxUniqueID,
        module_uuid: uuidv4(),
        module_name: 'Users',
        submodule_name: 'Change Role',
        table_name: 'change_role',
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
      {
        module_unique_id: ++maxUniqueID,
        module_uuid: uuidv4(),
        module_name: 'Security',
        submodule_name: 'Security',
        table_name: 'role_module',
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
      {
        module_unique_id: ++maxUniqueID,
        module_uuid: uuidv4(),
        module_name: 'Data Management',
        submodule_name: 'Branch',
        table_name: 'latest_branch',
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
      {
        module_unique_id: ++maxUniqueID,
        module_uuid: uuidv4(),
        module_name: 'Data Management',
        submodule_name: 'Zone',
        table_name: 'latest_zone',
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

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
