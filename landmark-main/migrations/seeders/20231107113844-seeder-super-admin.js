'use strict';

const { throwError } = require('../../utils/helperFunction');
const { v4 } = require('uuid');
const bcrypt = require('bcrypt');

require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let uuid = v4();
    const { SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_MOBILE } =
      process.env;
    if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD)
      throwError(404, 'Either email or password is empty');
    await queryInterface.bulkInsert('user_fact', [
      {
        user_fact_unique_id: 1,
        user_uuid: uuid,
        email: SUPERADMIN_EMAIL,
        status: 'ACTIVE',
      },
    ]);
    const admin = (
      await queryInterface.sequelize.query(
        `SELECT * FROM latest_role WHERE role_value = 'SUPERADMIN'`,
      )
    )[0][0];
    await queryInterface.bulkInsert('user_dim', [
      {
        user_dim_unique_id: 1,
        user_uuid: uuid,
        user_password: bcrypt.hashSync(SUPERADMIN_PASSWORD, 10),
        role_uuid: admin.role_uuid,
        role_value: admin.role_value,
      },
    ]);
    await queryInterface.bulkInsert('user_profile', [
      {
        user_profile_unique_id: 1,
        user_uuid: uuid,
        first_name: 'super',
        last_name: 'admin',
        personal_email: SUPERADMIN_EMAIL,
        status: 'ACTIVE',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {},
};
